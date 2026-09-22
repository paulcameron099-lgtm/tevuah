import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { sendApplicationMail } from "@/src/lib/email/application-mailer";
import { jointWithdrawalMemberDecisionEmail } from "@/src/lib/email/joint-investment";

type Body = {
  signatureName?: string;
  redirectedProceedsAcknowledgement?: string | null;
};

function statusFor(message: string) {
  const value = message.toLowerCase();

  if (value.includes("authentication required")) return 401;
  if (value.includes("only a joint member")) return 403;
  if (value.includes("not found")) return 404;

  if (
    value.includes("not awaiting") ||
    value.includes("not available") ||
    value.includes("explicitly authorize") ||
    value.includes("not applicable")
  ) {
    return 409;
  }

  return 400;
}

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
    const signatureName = body.signatureName?.trim() || "";

    if (signatureName.length < 2) {
      return NextResponse.json(
        { error: "Your typed legal signature is required." },
        { status: 400 },
      );
    }

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
     * No general restricted-account blocker belongs here.
     *
     * This is a deliberately narrow consent operation.
     * The PostgreSQL RPC independently verifies:
     * - auth.uid()
     * - membership in this exact joint investment
     * - withdrawal lifecycle
     * - current account_status
     * - member slot
     * - whether restricted-member proceeds authorization is required
     */
    const forwardedFor = request.headers.get("x-forwarded-for");

    const acceptedIp =
      forwardedFor?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null;

    const { data, error } = await supabase.rpc(
      "accept_joint_investment_withdrawal",
      {
        p_withdrawal_id: withdrawalId,
        p_signature_name: signatureName,
        p_redirected_proceeds_acknowledgement:
          body.redirectedProceedsAcknowledgement?.trim() || null,
        p_accepted_ip: acceptedIp,
        p_accepted_user_agent:
          request.headers.get("user-agent")?.slice(0, 1000) || null,
      },
    );

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: statusFor(error.message) },
      );
    }

    const result = Array.isArray(data) ? data[0] ?? null : data;

    if (!result) {
      return NextResponse.json(
        { error: "Withdrawal approval completed without a result." },
        { status: 500 },
      );
    }

    /*
     * Never trust the URL alone.
     * Confirm the authoritative RPC result belongs to [Id].
     */
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
     * The financial/lifecycle approval is already committed.
     * Communication failures below must never roll it back.
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
              status,
              proceeds_allocation,
              proceeds_recipient_investor_id
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
          .select("id, first_name, last_name, account_status")
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

      const proceedsAllocation =
        result.proceeds_allocation ||
        withdrawal.proceeds_allocation ||
        "ownership_split";

      const restrictedApprover = Boolean(result.restricted_member);

      const origin = new URL(request.url).origin;

      /*
       * Must match the 38D page:
       * /dashboard/investments/joint/[id]/withdrawals/[withdrawalId]/review
       */
      const investorPath =
        `/investment-actions/joint/${jointSubscriptionId}` +
        `/withdrawals/${withdrawalId}/review`;

      const adminPath =
        `/admin/subscriptions/joint/${jointSubscriptionId}` +
        `?withdrawal=${withdrawalId}`;

      /*
       * Notify the requester only when the approving actor is not
       * the requester. Normally this is the counterparty approval.
       */
      if (withdrawal.initiated_by !== user.id) {
        const { error: initiatorNotificationError } =
          await admin
            .from("investor_notifications")
            .upsert(
              {
                investor_id: withdrawal.initiated_by,
                notification_type: "account",
                event_key:
                  `joint:${jointSubscriptionId}:withdrawal:${withdrawalId}` +
                  `:member-approved:${user.id}:${withdrawal.initiated_by}`,
                title: "Co-investor approved joint withdrawal",
                message:
                  `${actorName} approved and signed the full withdrawal ` +
                  `request for ${opportunityTitle}. The request is now ` +
                  `awaiting Tevuah Reserve administrative review.`,
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

        if (initiatorNotificationError) {
          console.error(
            "Joint withdrawal initiator approval notification failed:",
            {
              withdrawalId,
              jointSubscriptionId,
              initiatorId: withdrawal.initiated_by,
              error: initiatorNotificationError,
            },
          );
        } else {
          notificationsCreated += 1;
        }

        /*
         * Email delivery is independent from dashboard notification.
         * A notification failure must never suppress the email attempt.
         */
        try {
          const { data: existingDelivery } = await admin
            .from("joint_investment_withdrawal_email_deliveries")
            .select("id, status")
            .eq("withdrawal_id", withdrawalId)
            .eq("investor_id", withdrawal.initiated_by)
            .eq("event_type", "member_approved")
            .maybeSingle();

          if (existingDelivery?.status !== "sent") {
            const { data: deliveryRow, error: deliveryRowError } =
              existingDelivery
                ? await admin
                    .from("joint_investment_withdrawal_email_deliveries")
                    .update({
                      status: "pending",
                      attempts: 1,
                      last_error: null,
                      updated_at: new Date().toISOString(),
                    })
                    .eq("id", existingDelivery.id)
                    .select("id")
                    .single()
                : await admin
                    .from("joint_investment_withdrawal_email_deliveries")
                    .insert({
                      withdrawal_id: withdrawalId,
                      investor_id: withdrawal.initiated_by,
                      event_type: "member_approved",
                      status: "pending",
                      attempts: 1,
                    })
                    .select("id")
                    .single();

            if (deliveryRowError || !deliveryRow) {
              throw deliveryRowError ??
                new Error("Unable to create withdrawal email delivery record.");
            }

            const {
              data: initiatorAuth,
              error: initiatorAuthError,
            } = await admin.auth.admin.getUserById(
              withdrawal.initiated_by,
            );

            if (initiatorAuthError) {
              throw initiatorAuthError;
            }

            const initiatorEmail =
              initiatorAuth.user?.email?.trim();

            if (!initiatorEmail) {
              throw new Error("Initiator email address is unavailable.");
            }

            const email = jointWithdrawalMemberDecisionEmail({
              recipientName: initiatorName,
              actorName,
              opportunityTitle,
              totalCommitmentAmountCents,
              currency,
              approved: true,
              proceedsAllocation,
              restrictedApprover,
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

              await admin
                .from("joint_investment_withdrawal_email_deliveries")
                .update({
                  status: "sent",
                  message_id: delivery.messageId ?? null,
                  last_error: null,
                  sent_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", deliveryRow.id);
            } else {
              await admin
                .from("joint_investment_withdrawal_email_deliveries")
                .update({
                  status: "failed",
                  last_error: delivery.error ?? "Email delivery failed.",
                  updated_at: new Date().toISOString(),
                })
                .eq("id", deliveryRow.id);

              console.error(
                "Joint withdrawal initiator approval email was not delivered:",
                {
                  withdrawalId,
                  jointSubscriptionId,
                  initiatorId: withdrawal.initiated_by,
                  error: delivery.error,
                },
              );
            }
          }
        } catch (initiatorEmailError) {
          console.error(
            "Joint withdrawal initiator approval email failed:",
            {
              withdrawalId,
              jointSubscriptionId,
              initiatorId: withdrawal.initiated_by,
              error:
                initiatorEmailError instanceof Error
                  ? initiatorEmailError.message
                  : initiatorEmailError,
            },
          );
        }
      }

      /*
       * Admin/company communication is sent only when both member
       * consents are complete and the authoritative RPC moved the
       * withdrawal to approved.
       */
      if (result.withdrawal_status === "approved") {
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
                    `:member-approved:admin:${adminProfile.id}`,
                  title: "Joint withdrawal ready for review",
                  message:
                    `Both investors have approved and signed the full ` +
                    `withdrawal for ${opportunityTitle}. Administrative ` +
                    `review is required before any redemption or Cash ` +
                    `Account credit can occur.`,
                  action_label: "Review withdrawal",
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
            approved: true,
            proceedsAllocation,
            restrictedApprover,
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
      }
    } catch (communicationError) {
      console.error(
        "Joint withdrawal approval communications failed:",
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
      "Joint withdrawal approval API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to approve joint withdrawal.",
      },
      { status: 500 },
    );
  }
}
