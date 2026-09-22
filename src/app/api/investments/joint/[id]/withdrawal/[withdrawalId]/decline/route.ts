import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { sendApplicationMail } from "@/src/lib/email/application-mailer";
import { jointWithdrawalMemberDecisionEmail } from "@/src/lib/email/joint-investment";

type Body = {
  reason?: string | null;
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
      id: string;
      withdrawalId: string;
    }>;
  },
) {
  try {
    const { id: jointSubscriptionId, withdrawalId } =
      await context.params;

    const body = (await request.json().catch(() => ({}))) as Body;

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
     * Restricted members are deliberately allowed to decline this
     * narrowly scoped withdrawal consent.
     */
    const { data, error } = await supabase.rpc(
      "decline_joint_investment_withdrawal",
      {
        p_withdrawal_id: withdrawalId,
        p_reason: body.reason?.trim() || null,
      },
    );

    if (error) {
      const normalized = error.message?.toLowerCase() || "";

      const status = normalized.includes("authentication")
        ? 401
        : normalized.includes("only a joint member")
          ? 403
          : normalized.includes("not found")
            ? 404
            : 409;

      return NextResponse.json(
        { error: error.message },
        { status },
      );
    }

    const result = Array.isArray(data) ? data[0] ?? null : data;

    if (!result) {
      return NextResponse.json(
        { error: "Withdrawal decline completed without a result." },
        { status: 500 },
      );
    }

    if (result.joint_subscription_id !== jointSubscriptionId) {
      return NextResponse.json(
        {
          error:
            "Withdrawal does not belong to the requested joint investment.",
        },
        { status: 409 },
      );
    }

    /*
     * Lifecycle rejection is already committed.
     * Communication failures must not turn that successful decision
     * into an API failure.
     */
    const admin = createAdminClient();

    let notificationsCreated = 0;
    let emailsSent = 0;

    try {
      const { data: withdrawal, error: withdrawalError } =
        await admin
          .from("joint_investment_withdrawals")
          .select(
            `
              id,
              joint_subscription_id,
              opportunity_id,
              initiated_by,
              rejection_reason,
              proceeds_allocation
            `,
          )
          .eq("id", withdrawalId)
          .eq("joint_subscription_id", jointSubscriptionId)
          .single();

      if (withdrawalError || !withdrawal) {
        throw withdrawalError ?? new Error("Withdrawal not found.");
      }

      const [
        jointResult,
        opportunityResult,
        actorProfileResult,
        initiatorProfileResult,
        adminsResult,
      ] = await Promise.all([
        admin
          .from("joint_investment_subscriptions")
          .select("id, total_commitment_amount, currency")
          .eq("id", jointSubscriptionId)
          .single(),

        admin
          .from("investment_opportunities")
          .select("title")
          .eq("id", withdrawal.opportunity_id)
          .single(),

        admin
          .from("profiles")
          .select("id, first_name, last_name")
          .eq("id", user.id)
          .single(),

        admin
          .from("profiles")
          .select("id, first_name, last_name")
          .eq("id", withdrawal.initiated_by)
          .single(),

        admin
          .from("profiles")
          .select("id, first_name, last_name, role")
          .in("role", ["admin", "super_admin"]),
      ]);

      if (jointResult.error || !jointResult.data) {
        throw jointResult.error ?? new Error("Joint investment not found.");
      }

      const opportunityTitle =
        opportunityResult.data?.title || "Joint investment";

      const actorName = displayName(
        actorProfileResult.data,
        "Joint investor",
      );

      const initiatorName = displayName(
        initiatorProfileResult.data,
        "Investor",
      );

      const totalCommitmentAmountCents = Number(
        jointResult.data.total_commitment_amount,
      );

      const currency = jointResult.data.currency || "USD";

      const origin = new URL(request.url).origin;

      const investorPath =
        `/investment-actions/joint/${jointSubscriptionId}` +
        `/withdrawals/${withdrawalId}/review`;

      const adminPath =
        `/admin/subscriptions/joint/${jointSubscriptionId}` +
        `?withdrawal=${withdrawalId}`;

      /*
       * Notify the requester when the other member declined.
       * If the requester somehow calls decline on their own pending
       * consent, do not email themselves redundantly.
       */
      if (withdrawal.initiated_by !== user.id) {
        const { error: notificationError } =
          await admin
            .from("investor_notifications")
            .upsert(
              {
                investor_id: withdrawal.initiated_by,
                notification_type: "account",
                event_key:
                  `joint:${jointSubscriptionId}:withdrawal:${withdrawalId}` +
                  `:member-declined:${user.id}:${withdrawal.initiated_by}`,
                title: "Joint withdrawal declined",
                message:
                  `${actorName} declined the full withdrawal request for ` +
                  `${opportunityTitle}. No investment position or Cash ` +
                  `Account balance has been changed.`,
                action_label: "View withdrawal",
                action_path: investorPath,
                source_type: "joint_investment_withdrawal",
                source_id: withdrawalId,
              },
              {
                onConflict: "investor_id,event_key",
                ignoreDuplicates: true,
              },
            );

        if (!notificationError) {
          notificationsCreated += 1;
        }

        const { data: initiatorAuth } =
          await admin.auth.admin.getUserById(
            withdrawal.initiated_by,
          );

        const initiatorEmail =
          initiatorAuth.user?.email?.trim();

        if (initiatorEmail) {
          const email = jointWithdrawalMemberDecisionEmail({
            recipientName: initiatorName,
            actorName,
            opportunityTitle,
            totalCommitmentAmountCents,
            currency,
            approved: false,
            proceedsAllocation:
              withdrawal.proceeds_allocation || "ownership_split",
            restrictedApprover: false,
            actionUrl: `${origin}${investorPath}`,
            recipientIsAdmin: false,
          });

          const delivery = await sendApplicationMail({
            to: initiatorEmail,
            subject: email.subject,
            text: email.text,
            html: email.html,
          });

          if (delivery.sent) {
            emailsSent += 1;
          }
        }
      }

      /*
       * Company/admin must also know the request was closed.
       * No accounting action occurs on decline.
       */
      for (const adminProfile of adminsResult.data ?? []) {
        const { error: notificationError } =
          await admin
            .from("investor_notifications")
            .upsert(
              {
                investor_id: adminProfile.id,
                notification_type: "system",
                event_key:
                  `joint:${jointSubscriptionId}:withdrawal:${withdrawalId}` +
                  `:member-declined:admin:${adminProfile.id}`,
                title: "Joint withdrawal declined by investor",
                message:
                  `${actorName} declined the withdrawal request for ` +
                  `${opportunityTitle}. The request is closed without ` +
                  `redemption or Cash Account movement.`,
                action_label: "View withdrawal",
                action_path: adminPath,
                source_type: "joint_investment_withdrawal",
                source_id: withdrawalId,
              },
              {
                onConflict: "investor_id,event_key",
                ignoreDuplicates: true,
              },
            );

        if (!notificationError) {
          notificationsCreated += 1;
        }

        const { data: authData } =
          await admin.auth.admin.getUserById(adminProfile.id);

        const emailAddress =
          authData.user?.email?.trim();

        if (!emailAddress) {
          continue;
        }

        const email = jointWithdrawalMemberDecisionEmail({
          recipientName: displayName(
            adminProfile,
            "Tevuah Reserve Admin",
          ),
          actorName,
          opportunityTitle,
          totalCommitmentAmountCents,
          currency,
          approved: false,
          proceedsAllocation:
            withdrawal.proceeds_allocation || "ownership_split",
          restrictedApprover: false,
          actionUrl: `${origin}${adminPath}`,
          recipientIsAdmin: true,
        });

        const delivery = await sendApplicationMail({
          to: emailAddress,
          subject: email.subject,
          text: email.text,
          html: email.html,
        });

        if (delivery.sent) {
          emailsSent += 1;
        }
      }
    } catch (communicationError) {
      console.error(
        "Joint withdrawal decline communications failed:",
        communicationError,
      );
    }

    return NextResponse.json(
      {
        success: true,
        withdrawal: result,
        communications: {
          notificationsCreated,
          emailsSent,
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
      "Joint withdrawal decline API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to decline joint withdrawal.",
      },
      { status: 500 },
    );
  }
}
