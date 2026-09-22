import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { sendApplicationMail } from "@/src/lib/email/application-mailer";
import { jointWithdrawalRequestedEmail } from "@/src/lib/email/joint-investment";

type RequestBody = {
  reason?: string | null;
  signatureName?: string | null;
  redirectedProceedsAcknowledgement?: string | null;
};

function errorStatus(message: string) {
  const value = message.toLowerCase();

  if (value.includes("authentication required")) return 401;
  if (
    value.includes("only a joint investment member") ||
    value.includes("only a joint")
  ) return 403;
  if (value.includes("not found")) return 404;

  if (
    value.includes("active joint withdrawal") ||
    value.includes("only a funded") ||
    value.includes("must be finalized") ||
    value.includes("exactly two") ||
    value.includes("principal") ||
    value.includes("50/50")
  ) return 409;

  if (
    value.includes("explicitly authorize") ||
    value.includes("redirected proceeds authorization")
  ) return 400;

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
  fallback: string,
) {
  return [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim() || fallback;
}

export async function POST(
  request: NextRequest,
) {
  try {
    /*
     * Read the authoritative joint subscription ID from the actual
     * request pathname instead of depending on the dynamic folder's
     * parameter key ([Id] / [id] / another local naming convention).
     *
     * Expected pathname:
     * /api/investments/joint/<jointSubscriptionId>/withdrawal
     */
    const pathnameSegments = new URL(request.url).pathname
      .split("/")
      .filter(Boolean);

    const jointSegmentIndex = pathnameSegments.indexOf("joint");

    const jointSubscriptionId =
      jointSegmentIndex >= 0
        ? pathnameSegments[jointSegmentIndex + 1] ?? ""
        : "";

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        jointSubscriptionId,
      )
    ) {
      return NextResponse.json(
        { error: "Invalid joint investment ID." },
        { status: 400 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as RequestBody;
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
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    /*
     * IMPORTANT:
     * Do not apply the normal restricted-account blocker here.
     * Step 38 deliberately allows a restricted joint member to
     * participate in the narrowly scoped withdrawal-consent flow.
     *
     * The RPC still proves that the authenticated user is actually
     * a member of this exact joint investment.
     */

    const forwardedFor = request.headers.get("x-forwarded-for");
    const acceptedIp =
      forwardedFor?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null;

    const acceptedUserAgent =
      request.headers.get("user-agent")?.slice(0, 1000) || null;

    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "create_joint_investment_withdrawal",
      {
        p_joint_subscription_id: jointSubscriptionId,
        p_reason: body.reason?.trim() || null,
        p_signature_name: signatureName,
        p_redirected_proceeds_acknowledgement:
          body.redirectedProceedsAcknowledgement?.trim() || null,
        p_accepted_ip: acceptedIp,
        p_accepted_user_agent: acceptedUserAgent,
      },
    );

    if (rpcError) {
      const status = errorStatus(rpcError.message || "");
      return NextResponse.json(
        { error: rpcError.message || "Unable to request withdrawal." },
        { status },
      );
    }

    const result = Array.isArray(rpcData) ? rpcData[0] : rpcData;

    if (!result?.withdrawal_id) {
      return NextResponse.json(
        { error: "Withdrawal request did not return a valid record." },
        { status: 500 },
      );
    }

    const withdrawalId = String(result.withdrawal_id);
    const admin = createAdminClient();

    let notificationsCreated = 0;
    let emailsSent = 0;

    /*
     * Communications are intentionally post-RPC.
     * Failure to send a secondary communication must never roll back
     * the legally recorded withdrawal request/signature.
     */
    try {
      const [jointResult, membersResult] = await Promise.all([
        admin
          .from("joint_investment_subscriptions")
          .select(
            "id, opportunity_id, initiated_by, total_commitment_amount, currency",
          )
          .eq("id", jointSubscriptionId)
          .single(),

        admin
          .from("joint_investment_members")
          .select(
            "id, investor_id, member_slot, ownership_bps, member_status",
          )
          .eq("joint_subscription_id", jointSubscriptionId)
          .order("member_slot", { ascending: true }),
      ]);

      if (jointResult.error) throw jointResult.error;
      if (membersResult.error) throw membersResult.error;

      const joint = jointResult.data;
      const members = membersResult.data ?? [];

      const requesterMember = members.find(
        (member) => member.investor_id === user.id,
      );
      const otherMember = members.find(
        (member) => member.investor_id !== user.id,
      );

      if (!requesterMember || !otherMember) {
        throw new Error(
          "Unable to resolve both joint members for withdrawal communications.",
        );
      }

      const investorIds = members.map((member) => member.investor_id);

      const [profilesResult, opportunityResult, adminsResult] =
        await Promise.all([
          admin
            .from("profiles")
            .select("id, first_name, last_name, account_status, role")
            .in("id", investorIds),

          admin
            .from("investment_opportunities")
            .select("id, title")
            .eq("id", joint.opportunity_id)
            .single(),

          admin
            .from("profiles")
            .select("id, first_name, last_name, role")
            .in("role", ["admin", "super_admin"]),
        ]);

      if (profilesResult.error) throw profilesResult.error;
      if (opportunityResult.error) throw opportunityResult.error;

      if (adminsResult.error) {
        console.error(
          "Joint withdrawal admin recipient lookup failed:",
          adminsResult.error,
        );
      }

      const profileMap = new Map(
        (profilesResult.data ?? []).map((profile) => [profile.id, profile]),
      );

      const requesterProfile = profileMap.get(user.id);
      const otherProfile = profileMap.get(otherMember.investor_id);

      const requesterName = displayName(requesterProfile, "Your joint investor");
      const otherInvestorName = displayName(otherProfile, "Investor");

      const opportunityTitle =
        opportunityResult.data?.title || "Joint investment";

      const origin = new URL(request.url).origin;

      const investorReviewPath =
        `/investment-actions/joint/${jointSubscriptionId}` +
        `/withdrawals/${withdrawalId}/review`;

      const investorReviewUrl = `${origin}${investorReviewPath}`;

      const adminReviewPath =
        `/admin/subscriptions/joint/${jointSubscriptionId}` +
        `/withdrawals/${withdrawalId}`;

      const adminReviewUrl = `${origin}${adminReviewPath}`;

      /*
       * ----------------------------------------------------------
       * Investor B / co-investor notification
       * ----------------------------------------------------------
       */
      const { error: partnerNotificationError } = await admin
        .from("investor_notifications")
        .upsert(
          {
            investor_id: otherMember.investor_id,
            notification_type: "account",
            event_key:
              `joint:${jointSubscriptionId}:withdrawal:${withdrawalId}:requested:` +
              otherMember.investor_id,
            title: "Joint withdrawal approval required",
            message:
              `${requesterName} requested a full withdrawal of your joint investment in ` +
              `${opportunityTitle}. Review the request, confirm the proceeds direction shown to you, ` +
              `and approve or decline it.`,
            action_label: "Review withdrawal",
            action_path: investorReviewPath,
            source_type: "joint_investment_withdrawal",
            source_id: withdrawalId,
          },
          {
            onConflict: "investor_id,event_key",
            ignoreDuplicates: true,
          },
        );

      if (partnerNotificationError) {
        console.error(
          "Joint withdrawal partner notification failed:",
          partnerNotificationError,
        );
      } else {
        notificationsCreated += 1;
      }

      const {
        data: partnerAuth,
        error: partnerAuthError,
      } = await admin.auth.admin.getUserById(otherMember.investor_id);

      if (partnerAuthError) {
        console.error(
          "Joint withdrawal partner email lookup failed:",
          partnerAuthError,
        );
      } else {
        const partnerEmail = partnerAuth.user?.email?.trim();

        if (partnerEmail) {
          const email = jointWithdrawalRequestedEmail({
            recipientName: otherInvestorName,
            requesterName,
            opportunityTitle,
            totalCommitmentAmountCents: Number(
              joint.total_commitment_amount,
            ),
            currency: joint.currency || "USD",
            reviewUrl: investorReviewUrl,
            recipientIsAdmin: false,
            recipientAccountRestricted:
              ["suspended", "disabled"].includes(
                String(otherProfile?.account_status || "").toLowerCase(),
              ),
          });

          const delivery = await sendApplicationMail({
            to: partnerEmail,
            subject: email.subject,
            text: email.text,
            html: email.html,
          });

          if (delivery.sent) emailsSent += 1;
          else {
            console.error(
              "Joint withdrawal partner email was not delivered:",
              delivery.error,
            );
          }
        }
      }

      /*
       * ----------------------------------------------------------
       * Company/admin notifications + emails
       * ----------------------------------------------------------
       */
      for (const adminProfile of adminsResult.data ?? []) {
        const adminId = adminProfile.id;

        const { error: adminNotificationError } = await admin
          .from("investor_notifications")
          .upsert(
            {
              investor_id: adminId,
              notification_type: "system",
              event_key:
                `joint:${jointSubscriptionId}:withdrawal:${withdrawalId}:requested:admin:` +
                adminId,
              title: "Joint withdrawal requested",
              message:
                `${requesterName} requested full withdrawal of the joint investment in ` +
                `${opportunityTitle}. The co-investor must review and sign before administrative execution.`,
              action_label: "View withdrawal",
              action_path: adminReviewPath,
              source_type: "joint_investment_withdrawal",
              source_id: withdrawalId,
            },
            {
              onConflict: "investor_id,event_key",
              ignoreDuplicates: true,
            },
          );

        if (adminNotificationError) {
          console.error(
            "Joint withdrawal admin notification failed:",
            { adminId, error: adminNotificationError },
          );
        } else {
          notificationsCreated += 1;
        }

        const {
          data: adminAuth,
          error: adminAuthError,
        } = await admin.auth.admin.getUserById(adminId);

        if (adminAuthError) {
          console.error(
            "Joint withdrawal admin email lookup failed:",
            { adminId, error: adminAuthError },
          );
          continue;
        }

        const adminEmail = adminAuth.user?.email?.trim();
        if (!adminEmail) continue;

        const email = jointWithdrawalRequestedEmail({
          recipientName: displayName(adminProfile, "Tevuah Reserve Admin"),
          requesterName,
          opportunityTitle,
          totalCommitmentAmountCents: Number(
            joint.total_commitment_amount,
          ),
          currency: joint.currency || "USD",
          reviewUrl: adminReviewUrl,
          recipientIsAdmin: true,
          recipientAccountRestricted: false,
        });

        const delivery = await sendApplicationMail({
          to: adminEmail,
          subject: email.subject,
          text: email.text,
          html: email.html,
        });

        if (delivery.sent) emailsSent += 1;
        else {
          console.error(
            "Joint withdrawal admin email was not delivered:",
            { adminId, error: delivery.error },
          );
        }
      }
    } catch (communicationError) {
      console.error(
        "Joint withdrawal request communication error:",
        {
          jointSubscriptionId,
          withdrawalId,
          error: communicationError,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        withdrawal: {
          id: withdrawalId,
          jointSubscriptionId:
            result.joint_subscription_id ?? jointSubscriptionId,
          status:
            result.withdrawal_status ?? "awaiting_member_approval",
          initiatorConsentStatus:
            result.initiator_consent_status ?? "accepted",
          proceedsAllocation:
            result.proceeds_allocation ?? "ownership_split",
          proceedsRecipientInvestorId:
            result.proceeds_recipient_investor_id ?? null,
          restrictedMemberRedirected:
            result.restricted_member_redirected === true,
        },
        communications: {
          notificationsCreated,
          emailsSent,
        },
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Joint withdrawal request API error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to request joint withdrawal.",
      },
      { status: 500 },
    );
  }
}