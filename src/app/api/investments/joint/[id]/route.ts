import {
  NextResponse,
  type NextRequest,
} from "next/server";

import {
  createClient,
} from "@/src/lib/supabase/server";

import {
  checkAccountAccess,
} from "@/src/lib/auth/account-status";


export const dynamic =
  "force-dynamic";


type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};


const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


function nullableNumber(
  value: unknown,
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}


export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    /*
     * ==========================================================
     * 1. AUTHENTICATE
     * ==========================================================
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
     * 2. ACCOUNT ACCESS
     * ==========================================================
     */

    const accountAccess =
      await checkAccountAccess(
        userId,
      );

    if (!accountAccess.allowed) {
      return NextResponse.json(
        {
          error:
            accountAccess.reason,

          accountStatus:
            accountAccess.status,
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
     * 3. JOINT SUBSCRIPTION ID
     * ==========================================================
     */

    const {
      id,
    } =
      await context.params;


    if (
      !id ||
      !UUID_PATTERN.test(id)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid joint investment.",
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
     * 4. AUTHORIZED STATUS RPC
     * ==========================================================
     *
     * Do NOT use the admin client.
     *
     * get_joint_investment_status() uses auth.uid() to verify
     * that this user is actually one of the two members.
     */

    const {
      data,
      error,
    } =
      await supabase.rpc(
        "get_joint_investment_status",
        {
          p_joint_subscription_id:
            id,
        },
      );


    if (error) {
      console.error(
        "Joint investment status RPC error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to load this joint investment.",
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


    const row =
      Array.isArray(data)
        ? data[0]
        : data;


    /*
     * No row intentionally covers both:
     *
     * - nonexistent subscription
     * - authenticated user is not a member
     *
     * We don't reveal which one occurred.
     */

    if (!row) {
      return NextResponse.json(
        {
          error:
            "Joint investment not found.",
        },
        {
          status: 404,
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        },
      );
    }


    /*
     * ==========================================================
     * 5. SAFE DASHBOARD RESPONSE
     * ==========================================================
     */

    return NextResponse.json(
      {
        success: true,

        jointInvestment: {
          id:
            row.joint_subscription_id,

          initiatedBy:
            row.initiated_by,

          isInitiator:
            row.initiated_by ===
            userId,

          status:
            row.parent_status,

          currency:
            row.currency,

          totalCommitmentAmount:
            Number(
              row.total_commitment_amount,
            ),

          submittedAt:
            row.submitted_at,

          reviewedAt:
            row.reviewed_at,

          approvedAt:
            row.approved_at,

          rejectionReason:
            row.rejection_reason,

          createdAt:
            row.created_at,

          updatedAt:
            row.updated_at,

          opportunity: {
            id:
              row.opportunity_id,

            title:
              row.opportunity_title,

            slug:
              row.opportunity_slug,

            assetCategory:
              row.opportunity_asset_category,

            location:
              row.opportunity_location,
          },

          currentUser: {
            memberId:
              row.current_user_member_id,

            memberSlot:
              row.current_user_member_slot,

            memberStatus:
              row.current_user_member_status,

            ownershipBps:
              Number(
                row.current_user_ownership_bps,
              ),

            fundingObligationBps:
              Number(
                row.current_user_funding_obligation_bps,
              ),

            obligationAmount:
              Number(
                row.current_user_obligation_amount,
              ),

            consentStatus:
              row.current_user_consent_status,
          },

          otherMember: row.other_member_id
            ? {
                memberId:
                  row.other_member_id,

                investorId:
                  row.other_member_investor_id,

                firstName:
                  row.other_member_first_name,

                lastName:
                  row.other_member_last_name,

                memberSlot:
                  row.other_member_slot,

                memberStatus:
                  row.other_member_status,

                ownershipBps:
                  Number(
                    row.other_member_ownership_bps,
                  ),

                fundingObligationBps:
                  Number(
                    row.other_member_funding_obligation_bps,
                  ),

                obligationAmount:
                  Number(
                    row.other_member_obligation_amount,
                  ),

                consentStatus:
                  row.other_member_consent_status,
              }
            : null,

          invitation: row.invitation_status
            ? {
                status:
                  row.invitation_status,

                expiresAt:
                  row.invitation_expires_at,
              }
            : null,

          readiness: {
            bothMembersAccepted:
              Boolean(
                row.both_members_accepted,
              ),

            bothConsentsAccepted:
              Boolean(
                row.both_consents_accepted,
              ),

            readyForReview:
              Boolean(
                row.ready_for_review,
              ),
          },
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
      "Joint investment status API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load this joint investment.",
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