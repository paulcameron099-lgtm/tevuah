import {
  NextResponse,
} from "next/server";

import {
  requireAdmin,
} from "@/src/lib/auth/require-admin";

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
  jointInvestmentPositionCreatedEmail,
} from "@/src/lib/email/joint-investment";


type RouteContext = {
  params: Promise<{
    jointSubscriptionId: string;
  }>;
};


export async function POST(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  try {
    /*
     * ==========================================================
     * 1. AUTHENTICATED ADMIN
     * ==========================================================
     */

    const adminUser =
      await requireAdmin();


    const {
      jointSubscriptionId,
    } =
      await params;


    if (!jointSubscriptionId) {
      return NextResponse.json(
        {
          error:
            "Joint investment subscription ID is required.",
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
     * 2. FINALIZE THROUGH AUTHENTICATED RPC
     * ==========================================================
     *
     * Must remain the authenticated SSR client because the
     * SECURITY DEFINER RPC binds p_admin_id to auth.uid().
     *
     * finalize_joint_investment() is the authoritative financial
     * and accounting transaction. It:
     *
     * - validates both obligations are fully funded
     * - validates/locks the capacity reservation
     * - creates exactly two investment positions
     * - increments opportunity.total_funded exactly once by the
     *   full parent commitment
     * - updates opportunity investor_count
     * - consumes the capacity reservation
     * - marks the joint parent funded/finalized
     * - inserts the existing transaction-bound dashboard
     *   notification for both investors
     *
     * The email work below happens only after this succeeds.
     */

    const supabase =
      await createClient();


    const {
      data,
      error,
    } =
      await supabase.rpc(
        "finalize_joint_investment",
        {
          p_joint_subscription_id:
            jointSubscriptionId,

          p_admin_id:
            adminUser.userId,
        },
      );


    if (error) {
      console.error(
        "Joint investment finalization RPC error:",
        error,
      );


      const message =
        error.message ||
        "Unable to finalize joint investment.";


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
                "admin actor mismatch",
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


    const result =
      Array.isArray(data)
        ? data[0] ?? null
        : data;


    if (!result) {
      return NextResponse.json(
        {
          error:
            "Joint investment finalization completed without a result.",
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
     * 3. 32E — EMAIL BOTH INVESTORS
     * ==========================================================
     *
     * DO NOT insert another dashboard notification here.
     *
     * finalize_joint_investment() already creates the canonical
     * dashboard notification inside the same database transaction:
     *
     * event_key:
     * joint-investment-funded:<jointId>:<investorId>
     *
     * That is stronger than route-side notification creation
     * because it commits atomically with the positions.
     *
     * This section therefore handles only the post-commit email
     * communication.
     *
     * SMTP failures must never turn a successfully finalized
     * investment into an API failure.
     */

    let emailsSent =
      0;


    try {
      const admin =
        createAdminClient();


      /*
       * ----------------------------------------------------------
       * Load finalized joint
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
              status,
              finalized_at
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
          "Finalized joint investment communication lookup failed:",
          {
            jointSubscriptionId,

            error:
              jointError,
          },
        );
      } else {
        /*
         * ----------------------------------------------------------
         * Load opportunity, members, positions
         * ----------------------------------------------------------
         */

        const [
          opportunityResult,
          membersResult,
          positionsResult,
        ] =
          await Promise.all([
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

            admin
              .from(
                "joint_investment_members",
              )
              .select(
                `
                  id,
                  investor_id,
                  member_slot,
                  ownership_bps,
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
                "investment_positions",
              )
              .select(
                `
                  id,
                  investor_id,
                  opportunity_id,
                  principal_amount,
                  currency,
                  status,
                  funded_at,
                  joint_subscription_id,
                  joint_member_id,
                  joint_funding_obligation_id
                `,
              )
              .eq(
                "joint_subscription_id",
                jointSubscriptionId,
              ),
          ]);


        if (
          opportunityResult.error
        ) {
          console.error(
            "Finalized joint opportunity lookup failed:",
            opportunityResult.error,
          );
        }


        if (
          membersResult.error
        ) {
          console.error(
            "Finalized joint member lookup failed:",
            membersResult.error,
          );
        }


        if (
          positionsResult.error
        ) {
          console.error(
            "Finalized joint position lookup failed:",
            positionsResult.error,
          );
        }


        const opportunityTitle =
          opportunityResult.data
            ?.title ||
          "your joint investment";


        const members =
          membersResult.data ??
          [];


        const positions =
          positionsResult.data ??
          [];


        /*
         * Defensive communication check only.
         *
         * The finalizer itself already enforces the accounting
         * invariants. We do not undo finalization if this
         * presentation-side check fails.
         */

        if (
          members.length !==
            2 ||
          positions.length !==
            2
        ) {
          console.error(
            "Finalized joint communication expected exactly two members and two positions:",
            {
              jointSubscriptionId,

              memberCount:
                members.length,

              positionCount:
                positions.length,
            },
          );
        }


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
            "Finalized joint investor profile lookup failed:",
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


        const positionByInvestorId =
          new Map(
            positions.map(
              (position) => [
                position.investor_id,
                position,
              ],
            ),
          );


        const origin =
          new URL(
            request.url,
          ).origin;


        const jointInvestmentUrl =
          `${origin}/dashboard/investments/joint/${jointSubscriptionId}`;


        /*
         * ----------------------------------------------------------
         * Email each investor about their own created position
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


          const position =
            positionByInvestorId.get(
              investorId,
            );


          if (!position) {
            console.error(
              "Finalized joint investor position unavailable for email:",
              {
                jointSubscriptionId,

                investorId,
              },
            );

            continue;
          }


          const {
            data: authData,
            error: authError,
          } =
            await admin.auth.admin.getUserById(
              investorId,
            );


          if (authError) {
            console.error(
              "Finalized joint investor email lookup failed:",
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
              "Finalized joint investor email unavailable:",
              {
                jointSubscriptionId,

                investorId,
              },
            );

            continue;
          }


          try {
            const email =
              jointInvestmentPositionCreatedEmail({
                investorName,

                opportunityTitle,

                positionPrincipalAmountCents:
                  Number(
                    position.principal_amount ??
                    0,
                  ),

                totalJointCommitmentAmountCents:
                  Number(
                    joint.total_commitment_amount ??
                    0,
                  ),

                ownershipBps:
                  Number(
                    member.ownership_bps ??
                    5000,
                  ),

                currency:
                  position.currency ||
                  joint.currency ||
                  "USD",

                positionId:
                  position.id,

                positionStatus:
                  position.status ||
                  "active",

                finalizedAt:
                  joint.finalized_at ||
                  result.finalized_at ||
                  null,

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
                "Finalized joint position email was not delivered:",
                {
                  jointSubscriptionId,

                  investorId,

                  positionId:
                    position.id,

                  error:
                    delivery.error,
                },
              );
            }
          } catch (
            emailError
          ) {
            console.error(
              "Finalized joint position email failed:",
              {
                jointSubscriptionId,

                investorId,

                positionId:
                  position.id,

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
        "Joint finalization communication error:",
        {
          jointSubscriptionId,

          error:
            communicationError,
        },
      );
    }


    /*
     * ==========================================================
     * 4. SAFE SUCCESS RESPONSE
     * ==========================================================
     */

    return NextResponse.json(
      {
        success: true,

        finalization:
          result,

        communications: {
          dashboardNotifications:
            "created_by_finalization_rpc",

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
      "Joint investment finalization route error:",
      error,
    );


    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to finalize joint investment.",
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