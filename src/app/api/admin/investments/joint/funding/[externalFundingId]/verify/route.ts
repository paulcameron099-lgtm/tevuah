
  import { NextResponse,
} from "next/server";

import {
  createClient,
} from "@/src/lib/supabase/server";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

import {
  sendApplicationMail,
} from "@/src/lib/email/application-mailer";

import {
  jointInvestmentFundingVerifiedEmail,
} from "@/src/lib/email/joint-investment";


type RouteContext = {
  params: Promise<{
    externalFundingId: string;
  }>;
};


type VerifyBody = {
  verificationNote?: unknown;
};


export async function POST(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  try {
    const {
      externalFundingId,
    } = await params;


    if (!externalFundingId) {
      return NextResponse.json(
        {
          error:
            "External funding ID is required.",
        },
        {
          status: 400,
        },
      );
    }


    /*
     * ==========================================================
     * 1. AUTHENTICATE ADMIN
     * ==========================================================
     */

    const supabase =
      await createClient();


    const {
      data: {
        user,
      },
      error: authError,
    } =
      await supabase.auth.getUser();


    if (
      authError ||
      !user
    ) {
      return NextResponse.json(
        {
          error:
            "Authentication required.",
        },
        {
          status: 401,
        },
      );
    }


    /*
     * ==========================================================
     * 2. READ OPTIONAL VERIFICATION NOTE
     * ==========================================================
     */

    let body:
      VerifyBody = {};


    try {
      body =
        (await request.json()) as
          VerifyBody;
    } catch {
      body = {};
    }


    if (
      body.verificationNote !==
        undefined &&
      body.verificationNote !==
        null &&
      typeof body.verificationNote !==
        "string"
    ) {
      return NextResponse.json(
        {
          error:
            "Verification note must be text.",
        },
        {
          status: 400,
        },
      );
    }


    const verificationNote =
      typeof body.verificationNote ===
      "string"
        ? body.verificationNote.trim()
        : "";


    if (
      verificationNote.length >
      2000
    ) {
      return NextResponse.json(
        {
          error:
            "Verification note cannot exceed 2,000 characters.",
        },
        {
          status: 400,
        },
      );
    }


    /*
     * ==========================================================
     * 3. VERIFY THROUGH CANONICAL FINANCIAL RPC
     * ==========================================================
     *
     * The RPC is the canonical financial boundary.
     *
     * It independently:
     * - authenticates auth.uid()
     * - confirms p_admin_id matches auth.uid()
     * - requires admin/super_admin
     * - locks the external funding record
     * - requires pending_verification
     * - validates Wire/BTC evidence
     * - validates the active capacity reservation
     * - marks principal verified
     * - satisfies the member funding obligation
     * - moves approved -> funding when necessary
     * - does NOT create positions or finalize the joint
     */

    const {
      data,
      error,
    } =
      await supabase.rpc(
        "verify_joint_investment_external_payment",
        {
          p_external_funding_id:
            externalFundingId,

          p_admin_id:
            user.id,

          p_verification_note:
            verificationNote ||
            null,
        },
      );


    if (error) {
      console.error(
        "Joint external payment verification RPC error:",
        error,
      );


      const message =
        error.message ||
        "Unable to verify joint investment payment.";


      const normalized =
        message.toLowerCase();


      const status =
        normalized.includes(
          "authentication required",
        )
          ? 401
          : normalized.includes(
                "administrator access required",
              ) ||
              normalized.includes(
                "administrator identity mismatch",
              )
            ? 403
            : normalized.includes(
                  "not found",
                )
              ? 404
              : 400;


      return NextResponse.json(
        {
          error:
            message,
        },
        {
          status,
        },
      );
    }


    const result =
      Array.isArray(data)
        ? data[0] ?? null
        : data;


    if (!result) {
      return NextResponse.json(
        {
          error:
            "Payment verification completed without a result.",
        },
        {
          status: 500,
        },
      );
    }


    /*
     * ==========================================================
     * 4. 32D — COMMUNICATE VERIFIED FUNDING
     * ==========================================================
     *
     * IMPORTANT:
     * The payment verification has already committed.
     *
     * Dashboard/email failures below must never turn a successful
     * financial verification into an API failure.
     *
     * Recipients:
     *
     * A. Funded investor
     *    - funding verified successfully
     *
     * B. Other joint member
     *    - joint investment funding progress update
     */

    let notificationsCreated =
      0;

    let emailsSent =
      0;


    try {
      const admin =
        createAdminClient();


      const jointSubscriptionId =
        result.joint_subscription_id;


      const fundedInvestorId =
        result.investor_id;


      const verifiedPrincipalAmountCents =
        Number(
          result.verified_principal_amount_cents ??
          0,
        );


      /*
       * ----------------------------------------------------------
       * Load external funding record
       * ----------------------------------------------------------
       *
       * The RPC return does not include payment_method/currency,
       * so those presentation details come from the canonical row.
       */

      const {
        data: externalFunding,
        error: externalFundingError,
      } =
        await admin
          .from(
            "joint_investment_external_funding",
          )
          .select(
            `
              id,
              joint_subscription_id,
              investor_id,
              opportunity_id,
              payment_method,
              principal_amount_cents,
              currency,
              status,
              verified_at,
              verified_principal_amount_cents
            `,
          )
          .eq(
            "id",
            externalFundingId,
          )
          .maybeSingle();


      if (
        externalFundingError ||
        !externalFunding
      ) {
        console.error(
          "Verified joint external funding communication lookup failed:",
          {
            externalFundingId,

            jointSubscriptionId,

            error:
              externalFundingError,
          },
        );
      } else {
        /*
         * ----------------------------------------------------------
         * Load parent, opportunity, members, obligations
         * ----------------------------------------------------------
         */

        const [
          jointResult,
          opportunityResult,
          membersResult,
          obligationsResult,
        ] =
          await Promise.all([
            admin
              .from(
                "joint_investment_subscriptions",
              )
              .select(
                `
                  id,
                  opportunity_id,
                  total_commitment_amount,
                  currency,
                  status
                `,
              )
              .eq(
                "id",
                jointSubscriptionId,
              )
              .maybeSingle(),

            admin
              .from(
                "investment_opportunities",
              )
              .select(
                `
                  id,
                  title
                `,
              )
              .eq(
                "id",
                externalFunding.opportunity_id,
              )
              .maybeSingle(),

            admin
              .from(
                "joint_investment_members",
              )
              .select(
                `
                  id,
                  investor_id,
                  member_slot,
                  member_status
                `,
              )
              .eq(
                "joint_subscription_id",
                jointSubscriptionId,
              )
              .order(
                "member_slot",
                {
                  ascending:
                    true,
                },
              ),

            admin
              .from(
                "joint_investment_funding_obligations",
              )
              .select(
                `
                  id,
                  investor_id,
                  obligation_amount,
                  funded_amount,
                  currency,
                  status,
                  funded_at
                `,
              )
              .eq(
                "joint_subscription_id",
                jointSubscriptionId,
              ),
          ]);


        if (jointResult.error) {
          console.error(
            "Verified joint parent communication lookup failed:",
            jointResult.error,
          );
        }


        if (opportunityResult.error) {
          console.error(
            "Verified joint opportunity communication lookup failed:",
            opportunityResult.error,
          );
        }


        if (membersResult.error) {
          console.error(
            "Verified joint member communication lookup failed:",
            membersResult.error,
          );
        }


        if (obligationsResult.error) {
          console.error(
            "Verified joint obligation communication lookup failed:",
            obligationsResult.error,
          );
        }


        const joint =
          jointResult.data;


        const opportunityTitle =
          opportunityResult.data
            ?.title ||
          "your joint investment";


        const members =
          membersResult.data ??
          [];


        const obligations =
          obligationsResult.data ??
          [];


        /*
         * ----------------------------------------------------------
         * Calculate current joint funding progress
         * ----------------------------------------------------------
         */

        const totalObligationCents =
          obligations.reduce(
            (
              total,
              obligation,
            ) =>
              total +
              Number(
                obligation.obligation_amount ??
                0,
              ),
            0,
          );


        const totalFundedCents =
          obligations.reduce(
            (
              total,
              obligation,
            ) =>
              total +
              Number(
                obligation.funded_amount ??
                0,
              ),
            0,
          );


        const fundedMemberCount =
          obligations.filter(
            (obligation) =>
              obligation.status ===
                "funded" &&
              Number(
                obligation.funded_amount,
              ) >=
                Number(
                  obligation.obligation_amount,
                ),
          ).length;


        const allMembersFunded =
          obligations.length ===
            2 &&
          fundedMemberCount ===
            2 &&
          totalObligationCents >
            0 &&
          totalFundedCents >=
            totalObligationCents;


        /*
         * ----------------------------------------------------------
         * Load both member profiles
         * ----------------------------------------------------------
         */

        const investorIds =
          members
            .map(
              (member) =>
                member.investor_id,
            )
            .filter(Boolean);


        const {
          data: profiles,
          error: profilesError,
        } =
          investorIds.length > 0
            ? await admin
                .from(
                  "profiles",
                )
                .select(
                  `
                    id,
                    first_name,
                    last_name
                  `,
                )
                .in(
                  "id",
                  investorIds,
                )
            : {
                data: [],
                error: null,
              };


        if (profilesError) {
          console.error(
            "Verified joint investor profile lookup failed:",
            profilesError,
          );
        }


        const profileById =
          new Map(
            (
              profiles ??
              []
            ).map(
              (profile) => [
                profile.id,
                profile,
              ],
            ),
          );


        const fundedProfile =
          profileById.get(
            fundedInvestorId,
          );


        const fundedInvestorName =
          [
            fundedProfile
              ?.first_name,
            fundedProfile
              ?.last_name,
          ]
            .filter(Boolean)
            .join(" ")
            .trim() ||
          "Your joint investment partner";


        const currency =
          externalFunding.currency ||
          joint?.currency ||
          "USD";


        const paymentMethod =
          externalFunding.payment_method ===
          "bitcoin"
            ? "Bitcoin"
            : "Wire transfer";


        const origin =
          new URL(
            request.url,
          ).origin;


        const jointInvestmentPath =
          `/dashboard/investments/joint/${jointSubscriptionId}`;


        const jointInvestmentUrl =
          `${origin}${jointInvestmentPath}`;


        /*
         * ----------------------------------------------------------
         * Communicate to BOTH investors
         * ----------------------------------------------------------
         */

        for (
          const member of members
        ) {
          const recipientInvestorId =
            member.investor_id;


          const isFundedInvestor =
            recipientInvestorId ===
            fundedInvestorId;


          const recipientProfile =
            profileById.get(
              recipientInvestorId,
            );


          const recipientName =
            [
              recipientProfile
                ?.first_name,
              recipientProfile
                ?.last_name,
            ]
              .filter(Boolean)
              .join(" ")
              .trim() ||
            "Investor";


          const title =
            isFundedInvestor
              ? "Funding verified successfully"
              : "Joint investment funding update";


          const message =
            isFundedInvestor
              ? `Your funding for ${opportunityTitle} has been successfully verified. You can review the updated joint investment funding status in your dashboard.`
              : `${fundedInvestorName}'s funding obligation for ${opportunityTitle} has been successfully verified. Review the joint investment for the latest funding status.`;


          /*
           * Dashboard notification
           */

          const {
            error:
              notificationError,
          } =
            await admin
              .from(
                "investor_notifications",
              )
              .upsert(
                {
                  investor_id:
                    recipientInvestorId,

                  notification_type:
                    "payment",

                  event_key:
                    `joint:${jointSubscriptionId}:funding-verified:${fundedInvestorId}:${recipientInvestorId}`,

                  title,

                  message,

                  action_label:
                    "View funding status",

                  action_path:
                    jointInvestmentPath,

                  source_type:
                    "joint_investment_external_funding",

                  source_id:
                    externalFundingId,
                },
                {
                  onConflict:
                    "investor_id,event_key",

                  ignoreDuplicates:
                    true,
                },
              );


          if (notificationError) {
            console.error(
              "Joint funding verification dashboard notification failed:",
              {
                jointSubscriptionId,

                externalFundingId,

                fundedInvestorId,

                recipientInvestorId,

                error:
                  notificationError,
              },
            );
          } else {
            notificationsCreated +=
              1;
          }


          /*
           * Resolve recipient email from Supabase Auth
           */

          const {
            data: authData,
            error: authLookupError,
          } =
            await admin.auth.admin.getUserById(
              recipientInvestorId,
            );


          if (authLookupError) {
            console.error(
              "Joint funding verification investor email lookup failed:",
              {
                jointSubscriptionId,

                recipientInvestorId,

                error:
                  authLookupError,
              },
            );

            continue;
          }


          const recipientEmail =
            authData?.user
              ?.email
              ?.trim() ||
            null;


          if (!recipientEmail) {
            console.error(
              "Joint funding verification investor email unavailable:",
              {
                jointSubscriptionId,

                recipientInvestorId,
              },
            );

            continue;
          }


          /*
           * Professional funding verification email
           */

          try {
            const email =
              jointInvestmentFundingVerifiedEmail({
                recipientName,

                opportunityTitle,

                fundedInvestorName,

                isFundedInvestor,

                verifiedPrincipalAmountCents,

                currency,

                paymentMethod,

                fundedMemberCount,

                totalMemberCount:
                  obligations.length,

                totalFundedCents,

                totalObligationCents,

                allMembersFunded,

                jointInvestmentUrl,
              });


            const delivery =
              await sendApplicationMail(
                {
                  to:
                    recipientEmail,

                  subject:
                    email.subject,

                  text:
                    email.text,

                  html:
                    email.html,
                },
              );


            if (
              delivery.sent
            ) {
              emailsSent +=
                1;
            } else {
              console.error(
                "Joint funding verification email was not delivered:",
                {
                  jointSubscriptionId,

                  recipientInvestorId,

                  error:
                    delivery.error,
                },
              );
            }
          } catch (
            emailError
          ) {
            console.error(
              "Joint funding verification email failed:",
              {
                jointSubscriptionId,

                recipientInvestorId,

                error:
                  emailError instanceof Error
                    ? emailError.message
                    : emailError,
              },
            );
          }
        }
      }
    } catch (
      communicationError
    ) {
      console.error(
        "Joint funding verification communication error:",
        {
          externalFundingId,

          jointSubscriptionId:
            result.joint_subscription_id,

          error:
            communicationError,
        },
      );
    }


    /*
     * ==========================================================
     * 5. SAFE SUCCESS RESPONSE
     * ==========================================================
     */

    return NextResponse.json(
      {
        success: true,

        verification:
          result,

        communications: {
          notificationsCreated,

          emailsSent,
        },
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Joint external payment verification route error:",
      error,
    );


    return NextResponse.json(
      {
        error:
          "Unable to verify joint investment payment.",
      },
      {
        status: 500,
      },
    );
  }
}