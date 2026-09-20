
  import { NextResponse,
  type NextRequest,
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
  jointInvestmentApprovedEmail,
} from "@/src/lib/email/joint-investment";


export const dynamic =
  "force-dynamic";


type RouteContext = {
  params: Promise<{
    jointSubscriptionId: string;
  }>;
};


function isUuid(
  value: string,
) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}


export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    /*
     * ==========================================================
     * 1. ROUTE PARAMETER
     * ==========================================================
     */

    const {
      jointSubscriptionId,
    } =
      await context.params;


    if (
      !jointSubscriptionId ||
      !isUuid(
        jointSubscriptionId,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "A valid joint investment subscription ID is required.",
        },
        {
          status: 400,
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        },
      );
    }


    /*
     * ==========================================================
     * 2. AUTHENTICATE ADMIN
     * ==========================================================
     *
     * Keep the authenticated SSR client here.
     *
     * approve_joint_investment_subscription() independently
     * verifies auth.uid() and requires p_admin_id to match it.
     */

    const supabase =
      await createClient();


    const {
      data: claimsData,
      error: claimsError,
    } =
      await supabase.auth.getClaims();


    const userId =
      claimsData?.claims?.sub;


    if (
      claimsError ||
      !userId
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized.",
        },
        {
          status: 401,
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        },
      );
    }


    /*
     * ==========================================================
     * 3. ADMIN ROLE CHECK
     * ==========================================================
     */

    const {
      data: adminProfile,
      error: adminProfileError,
    } =
      await supabase
        .from(
          "profiles",
        )
        .select(
          `
            id,
            role
          `,
        )
        .eq(
          "id",
          userId,
        )
        .maybeSingle();


    if (
      adminProfileError ||
      !adminProfile
    ) {
      console.error(
        "Joint approval admin profile lookup error:",
        adminProfileError,
      );

      return NextResponse.json(
        {
          error:
            "Administrator profile could not be verified.",
        },
        {
          status: 403,
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        },
      );
    }


    if (
      adminProfile.role !==
        "admin" &&
      adminProfile.role !==
        "super_admin"
    ) {
      return NextResponse.json(
        {
          error:
            "Administrator access required.",
        },
        {
          status: 403,
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        },
      );
    }


    /*
     * ==========================================================
     * 4. APPROVE THROUGH AUTHENTICATED RPC
     * ==========================================================
     *
     * This remains the authoritative approval transaction.
     *
     * The RPC is responsible for:
     * - approval lifecycle validation
     * - capacity protection / reservation in the hardened version
     * - approval timestamps
     * - canonical member funding obligations
     *
     * No notification/email operation below is allowed to change
     * whether this approval succeeded.
     */

    const {
      data,
      error,
    } =
      await supabase.rpc(
        "approve_joint_investment_subscription",
        {
          p_joint_subscription_id:
            jointSubscriptionId,

          p_admin_id:
            userId,
        },
      );


    if (error) {
      console.error(
        "Joint investment approval RPC error:",
        {
          jointSubscriptionId,

          adminId:
            userId,

          error,
        },
      );


      const message =
        error.message ||
        "Unable to approve joint investment.";


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
                "admin identity mismatch",
              )
            ? 403
            : normalized.includes(
                  "not found",
                )
              ? 404
              : 409;


      return NextResponse.json(
        {
          error:
            message,
        },
        {
          status,
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        },
      );
    }


    const approval =
      Array.isArray(data)
        ? data[0] ?? null
        : data;


    if (!approval) {
      return NextResponse.json(
        {
          error:
            "Joint investment approval completed without a result.",
        },
        {
          status: 500,
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        },
      );
    }


    /*
     * ==========================================================
     * 5. 32C — COMMUNICATE APPROVAL TO BOTH INVESTORS
     * ==========================================================
     *
     * IMPORTANT:
     * Approval is already committed at this point.
     *
     * Notification or SMTP failures are secondary failures and
     * must never make this API report the financial/lifecycle
     * approval itself as failed.
     */

    let notificationsCreated =
      0;

    let emailsSent =
      0;


    try {
      const admin =
        createAdminClient();


      /*
       * ----------------------------------------------------------
       * Load approved joint + opportunity
       * ----------------------------------------------------------
       */

      const {
        data: joint,
        error: jointError,
      } =
        await admin
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
          .maybeSingle();


      if (
        jointError ||
        !joint
      ) {
        console.error(
          "Approved joint investment communication lookup failed:",
          {
            jointSubscriptionId,
            error:
              jointError,
          },
        );
      } else {
        const [
          membersResult,
          obligationsResult,
          opportunityResult,
        ] =
          await Promise.all([
            admin
              .from(
                "joint_investment_members",
              )
              .select(
                `
                  id,
                  investor_id,
                  member_slot,
                  obligation_amount,
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
                  status
                `,
              )
              .eq(
                "joint_subscription_id",
                jointSubscriptionId,
              ),

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
                joint.opportunity_id,
              )
              .maybeSingle(),
          ]);


        if (membersResult.error) {
          console.error(
            "Approved joint member lookup failed:",
            membersResult.error,
          );
        }


        if (obligationsResult.error) {
          console.error(
            "Approved joint funding obligation lookup failed:",
            obligationsResult.error,
          );
        }


        if (opportunityResult.error) {
          console.error(
            "Approved joint opportunity lookup failed:",
            opportunityResult.error,
          );
        }


        const members =
          membersResult.data ??
          [];

        const obligations =
          obligationsResult.data ??
          [];

        const opportunityTitle =
          opportunityResult.data
            ?.title ||
          "your joint investment";


        if (
          members.length !==
          2
        ) {
          console.error(
            "Approved joint communication expected exactly two members:",
            {
              jointSubscriptionId,

              memberCount:
                members.length,
            },
          );
        }


        /*
         * ----------------------------------------------------------
         * Load both member profiles in one query
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
            "Approved joint investor profile lookup failed:",
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


        const obligationByInvestorId =
          new Map(
            obligations.map(
              (obligation) => [
                obligation.investor_id,
                obligation,
              ],
            ),
          );


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
         * Notify + email each of the two investors
         * ----------------------------------------------------------
         */

        for (
          const member of members
        ) {
          const investorId =
            member.investor_id;


          const profile =
            profileById.get(
              investorId,
            );


          const investorName =
            [
              profile
                ?.first_name,
              profile
                ?.last_name,
            ]
              .filter(Boolean)
              .join(" ")
              .trim() ||
            "Investor";


          const obligation =
            obligationByInvestorId.get(
              investorId,
            );


          const obligationAmountCents =
            Number(
              obligation
                ?.obligation_amount ??
              member.obligation_amount ??
              0,
            );


          const currency =
            obligation
              ?.currency ||
            joint.currency ||
            "USD";


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
                    investorId,

                  notification_type:
                    "subscription",

                  event_key:
                    `joint:${jointSubscriptionId}:approved:${investorId}`,

                  title:
                    "Joint investment approved",

                  message:
                    `Your joint investment in ${opportunityTitle} has been approved. Your funding obligation is now available. Complete your funding to continue.`,

                  action_label:
                    "Complete funding obligation",

                  action_path:
                    jointInvestmentPath,

                  source_type:
                    "joint_investment_subscription",

                  source_id:
                    jointSubscriptionId,
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
              "Joint approval dashboard notification failed:",
              {
                jointSubscriptionId,

                investorId,

                error:
                  notificationError,
              },
            );
          } else {
            notificationsCreated +=
              1;
          }


          /*
           * Resolve member email from Supabase Auth.
           *
           * profiles intentionally does not supply email in the
           * current schema.
           */

          const {
            data: authData,
            error: authError,
          } =
            await admin.auth.admin.getUserById(
              investorId,
            );


          if (authError) {
            console.error(
              "Joint approval investor email lookup failed:",
              {
                jointSubscriptionId,

                investorId,

                error:
                  authError,
              },
            );

            continue;
          }


          const investorEmail =
            authData?.user
              ?.email
              ?.trim() ||
            null;


          if (!investorEmail) {
            console.error(
              "Joint approval investor email unavailable:",
              {
                jointSubscriptionId,

                investorId,
              },
            );

            continue;
          }


          /*
           * Professional approval email
           */

          try {
            const email =
              jointInvestmentApprovedEmail({
                investorName,

                opportunityTitle,

                totalCommitmentAmountCents:
                  Number(
                    joint.total_commitment_amount,
                  ),

                fundingObligationAmountCents:
                  obligationAmountCents,

                currency,

                jointInvestmentUrl,
              });


            const delivery =
              await sendApplicationMail(
                {
                  to:
                    investorEmail,

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
                "Joint approval investor email was not delivered:",
                {
                  jointSubscriptionId,

                  investorId,

                  error:
                    delivery.error,
                },
              );
            }
          } catch (
            emailError
          ) {
            console.error(
              "Joint approval investor email failed:",
              {
                jointSubscriptionId,

                investorId,

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
        "Joint approval communication error:",
        {
          jointSubscriptionId,

          error:
            communicationError,
        },
      );
    }


    /*
     * ==========================================================
     * 6. SAFE SUCCESS RESPONSE
     * ==========================================================
     */

    return NextResponse.json(
      {
        success: true,

        approval: {
          jointSubscriptionId:
            approval.joint_subscription_id ??
            jointSubscriptionId,

          status:
            approval.joint_status ??
            "approved",

          approvedAt:
            approval.approved_at ??
            null,

          approvedBy:
            approval.approved_by ??
            userId,
        },

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
      "Joint investment approval API error:",
      error,
    );


    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to approve joint investment.",
      },
      {
        status: 500,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  }
}