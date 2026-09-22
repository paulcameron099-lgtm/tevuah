import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { sendApplicationMail } from "@/src/lib/email/application-mailer";
import { jointWithdrawalExecutedEmail } from "@/src/lib/email/joint-investment";

type Settlement = {
  settlement_id: string;
  member_id: string;
  investor_id: string;
  position_id: string;
  position_principal_cents: number;
  credited_amount_cents: number;
  currency: string;
  cash_account_id: string | null;
  cash_ledger_id: string | null;
};

type ExecutionResult = {
  withdrawal_id: string;
  joint_subscription_id: string;
  status: "executed";
  executed_at: string;
  executed_by: string;
  proceeds_allocation:
    | "ownership_split"
    | "restricted_member_redirect"
    | "member_one_full";
  proceeds_recipient_investor_id: string | null;
  currency?: string;
  total_redeemed_cents?: number;
  replayed: boolean;
  settlements: Settlement[];
};

function displayName(
  profile:
    | {
        first_name?: string | null;
        last_name?: string | null;
      }
    | null
    | undefined,
  fallback = "Investor",
) {
  return (
    [profile?.first_name, profile?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() || fallback
  );
}

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{
      jointSubscriptionId: string;
      withdrawalId: string;
    }>;
  },
) {
  try {
    const { jointSubscriptionId, withdrawalId } =
      await context.params;

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    /*
     * One PostgreSQL function owns the entire accounting transaction.
     * Never split position redemption and Cash Account credits across
     * separate API/database calls.
     */
    const { data, error } = await supabase.rpc(
      "execute_joint_investment_withdrawal",
      {
        p_withdrawal_id: withdrawalId,
      },
    );

    if (error) {
      const normalized = error.message.toLowerCase();

      const status = normalized.includes("admin access")
        ? 403
        : normalized.includes("not found")
          ? 404
          : 409;

      return NextResponse.json(
        { error: error.message },
        { status },
      );
    }

    const result = (
      Array.isArray(data)
        ? data[0] ?? null
        : data ?? null
    ) as ExecutionResult | null;

    if (
      !result ||
      result.joint_subscription_id !== jointSubscriptionId ||
      result.withdrawal_id !== withdrawalId
    ) {
      return NextResponse.json(
        {
          error:
            "Withdrawal execution result does not match the requested joint investment.",
        },
        { status: 409 },
      );
    }

    /*
     * Accounting is already committed at this point.
     *
     * IMPORTANT:
     * We also process communication on an accounting replay. The durable
     * email-delivery table prevents an already-recorded successful email
     * from being sent again, while allowing a previously missed/failed
     * post-commit email to recover safely.
     */
    let emailsSent = 0;
    let emailsAlreadySent = 0;
    let emailFailures = 0;

    try {
      const admin = createAdminClient();

      const [
        jointResult,
        withdrawalResult,
        membersResult,
      ] = await Promise.all([
        admin
          .from("joint_investment_subscriptions")
          .select(
            "id, opportunity_id, total_commitment_amount, currency",
          )
          .eq("id", jointSubscriptionId)
          .single(),

        admin
          .from("joint_investment_withdrawals")
          .select("id, opportunity_id, status")
          .eq("id", withdrawalId)
          .eq("joint_subscription_id", jointSubscriptionId)
          .single(),

        admin
          .from("joint_investment_members")
          .select(
            "id, investor_id, member_slot, ownership_bps",
          )
          .eq("joint_subscription_id", jointSubscriptionId)
          .order("member_slot", { ascending: true }),
      ]);

      if (jointResult.error || !jointResult.data) {
        throw jointResult.error ??
          new Error("Joint investment communication data not found.");
      }

      if (
        withdrawalResult.error ||
        !withdrawalResult.data ||
        withdrawalResult.data.status !== "executed"
      ) {
        throw withdrawalResult.error ??
          new Error("Executed withdrawal communication data not found.");
      }

      const joint = jointResult.data;
      const members = membersResult.data ?? [];
      const investorIds = result.settlements.map(
        (settlement) => settlement.investor_id,
      );

      const { data: profiles, error: profilesError } = await admin
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", investorIds);

      if (profilesError) {
        throw profilesError;
      }

      const { data: opportunity } = await admin
        .from("investment_opportunities")
        .select("id, title")
        .eq(
          "id",
          withdrawalResult.data.opportunity_id ||
            joint.opportunity_id,
        )
        .single();

      const redirectedRecipientProfile = (profiles ?? []).find(
        (profile) =>
          profile.id === result.proceeds_recipient_investor_id,
      );

      const redirectedRecipientName = displayName(
        redirectedRecipientProfile,
        "the other joint investor",
      );

      const origin = new URL(request.url).origin;

      for (const settlement of result.settlements) {
        const investorId = settlement.investor_id;

        try {
          const { data: existingDelivery, error: existingError } =
            await admin
              .from("joint_investment_withdrawal_email_deliveries")
              .select("id, status, attempts")
              .eq("withdrawal_id", withdrawalId)
              .eq("investor_id", investorId)
              .eq("event_type", "withdrawal_executed")
              .maybeSingle();

          if (existingError) {
            throw existingError;
          }

          if (existingDelivery?.status === "sent") {
            emailsAlreadySent += 1;
            continue;
          }

          let deliveryRowId: string;

          if (existingDelivery) {
            const { data: updatedRow, error: updateError } =
              await admin
                .from("joint_investment_withdrawal_email_deliveries")
                .update({
                  status: "pending",
                  attempts: Number(existingDelivery.attempts || 0) + 1,
                  last_error: null,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", existingDelivery.id)
                .select("id")
                .single();

            if (updateError || !updatedRow) {
              throw updateError ??
                new Error("Unable to update withdrawal email delivery.");
            }

            deliveryRowId = updatedRow.id;
          } else {
            const { data: insertedRow, error: insertError } =
              await admin
                .from("joint_investment_withdrawal_email_deliveries")
                .insert({
                  withdrawal_id: withdrawalId,
                  investor_id: investorId,
                  event_type: "withdrawal_executed",
                  status: "pending",
                  attempts: 1,
                })
                .select("id")
                .single();

            if (insertError || !insertedRow) {
              throw insertError ??
                new Error("Unable to create withdrawal email delivery.");
            }

            deliveryRowId = insertedRow.id;
          }

          const profile = (profiles ?? []).find(
            (item) => item.id === investorId,
          );

          const {
            data: authData,
            error: authLookupError,
          } = await admin.auth.admin.getUserById(investorId);

          if (authLookupError) {
            throw authLookupError;
          }

          const emailAddress =
            authData.user?.email?.trim();

          if (!emailAddress) {
            throw new Error(
              `Investor ${investorId} has no email address.`,
            );
          }

          const email = jointWithdrawalExecutedEmail({
            recipientName: displayName(profile),
            opportunityTitle:
              opportunity?.title || "Joint investment",
            totalRedeemedAmountCents:
              Number(joint.total_commitment_amount),
            creditedAmountCents:
              Number(settlement.credited_amount_cents),
            currency: joint.currency || "USD",
            proceedsAllocation: result.proceeds_allocation,
            recipientIsRedirectedMember:
              result.proceeds_allocation === "restricted_member_redirect" &&
              result.proceeds_recipient_investor_id !== null &&
              settlement.investor_id !==
                result.proceeds_recipient_investor_id &&
              Number(settlement.credited_amount_cents) === 0,
            redirectedRecipientName,
            cashAccountUrl:
              `${origin}/dashboard/cash-account`,
            jointInvestmentUrl:
              `${origin}/dashboard/investments/joint/${jointSubscriptionId}`,
          });

          const delivery = await sendApplicationMail({
            to: emailAddress,
            subject: email.subject,
            text: email.text,
            html: email.html,
          });

          if (delivery.sent) {
            emailsSent += 1;

            await admin
              .from("joint_investment_withdrawal_email_deliveries")
              .update({
                status: "sent",
                message_id: delivery.messageId ?? null,
                last_error: null,
                sent_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("id", deliveryRowId);
          } else {
            emailFailures += 1;

            await admin
              .from("joint_investment_withdrawal_email_deliveries")
              .update({
                status: "failed",
                last_error:
                  delivery.error ?? "Email delivery failed.",
                updated_at: new Date().toISOString(),
              })
              .eq("id", deliveryRowId);

            console.error(
              "Joint withdrawal execution email was not delivered:",
              {
                withdrawalId,
                jointSubscriptionId,
                investorId,
                error: delivery.error,
              },
            );
          }
        } catch (recipientError) {
          emailFailures += 1;

          console.error(
            "Joint withdrawal execution recipient communication failed:",
            {
              withdrawalId,
              jointSubscriptionId,
              investorId,
              error:
                recipientError instanceof Error
                  ? recipientError.message
                  : recipientError,
            },
          );
        }
      }
    } catch (communicationError) {
      console.error(
        "Joint withdrawal execution communications failed:",
        {
          withdrawalId,
          jointSubscriptionId,
          error:
            communicationError instanceof Error
              ? communicationError.message
              : communicationError,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        execution: result,
        communications: {
          emailsSent,
          emailsAlreadySent,
          emailFailures,
          accountingReplay: result.replayed,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Joint withdrawal execution API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to execute joint withdrawal.",
      },
      { status: 500 },
    );
  }
}
