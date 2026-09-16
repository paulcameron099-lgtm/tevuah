import {
  NextResponse,
  type NextRequest,
} from "next/server";

import {
  createHash,
} from "crypto";

import {
  createClient,
} from "@/src/lib/supabase/server";

import {
  checkAccountAccess,
} from "@/src/lib/auth/account-status";


export const dynamic =
  "force-dynamic";


type PreviewInvitationBody = {
  token?: unknown;
};


function cleanString(
  value: unknown,
) {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}


export async function POST(
  request: NextRequest,
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
     * 3. READ RAW INVITATION TOKEN
     * ==========================================================
     */

    let body:
      PreviewInvitationBody;

    try {
      body =
        (await request.json()) as
          PreviewInvitationBody;
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid request.",
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


    const rawToken =
      cleanString(
        body.token,
      );


    /*
     * randomBytes(32).toString("base64url")
     * normally produces a 43-character token.
     *
     * We intentionally don't require exactly 43 here so
     * implementation details can evolve without breaking
     * the API.
     */

    if (
      !rawToken ||
      rawToken.length < 32 ||
      rawToken.length > 256
    ) {
      return NextResponse.json(
        {
          error:
            "This invitation is invalid, expired, or is not associated with your account.",
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
     * 4. HASH TOKEN SERVER-SIDE
     * ==========================================================
     *
     * Browser sends the raw bearer token.
     *
     * PostgreSQL receives only SHA-256(rawToken).
     */

    const tokenHash =
      createHash("sha256")
        .update(rawToken)
        .digest("hex");


    /*
     * ==========================================================
     * 5. SECURE DATABASE PREVIEW
     * ==========================================================
     *
     * IMPORTANT:
     *
     * Use the authenticated Supabase client.
     *
     * preview_joint_investment_invitation() uses auth.uid()
     * to ensure the logged-in investor is the actual invitee.
     */

    const {
      data,
      error,
    } =
      await supabase.rpc(
        "preview_joint_investment_invitation",
        {
          p_token_hash:
            tokenHash,
        },
      );


    if (error) {
      console.error(
        "Joint invitation preview RPC error:",
        error,
      );

      /*
       * Do not expose database/token details to the browser.
       */

      return NextResponse.json(
        {
          error:
            "This invitation is invalid, expired, or is not associated with your account.",
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


    const invitation =
      Array.isArray(data)
        ? data[0]
        : data;


    /*
     * Wrong user, expired invitation, revoked invitation,
     * consumed invitation, invalid token, etc. all become the
     * same public response.
     */

    if (!invitation) {
      return NextResponse.json(
        {
          error:
            "This invitation is invalid, expired, or is not associated with your account.",
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
     * 6. SAFE UI RESPONSE
     * ==========================================================
     *
     * Deliberately excluded:
     *
     * - raw token
     * - token hash
     * - auth email
     * - IP information
     * - user-agent information
     */

    return NextResponse.json(
      {
        success: true,

        invitation: {
          invitationId:
            invitation.invitation_id,

          jointSubscriptionId:
            invitation.joint_subscription_id,

          status:
            invitation.invitation_status,

          expiresAt:
            invitation.expires_at,

          parentStatus:
            invitation.parent_status,

          investment: {
            id:
              invitation.opportunity_id,

            title:
              invitation.opportunity_title,

            slug:
              invitation.opportunity_slug,

            assetCategory:
              invitation.opportunity_asset_category,

            location:
              invitation.opportunity_location,

            currency:
              invitation.currency,

            totalCommitmentAmount:
              Number(
                invitation.total_commitment_amount,
              ),
          },

          inviter: {
            firstName:
              invitation.inviter_first_name,

            lastName:
              invitation.inviter_last_name,
          },

          invitee: {
            firstName:
              invitation.invitee_first_name,

            lastName:
              invitation.invitee_last_name,
          },

          member: {
            memberId:
              invitation.member_id,

            memberSlot:
              invitation.member_slot,

            status:
              invitation.member_status,

            ownershipBps:
              invitation.ownership_bps,

            fundingObligationBps:
              invitation.funding_obligation_bps,

            obligationAmount:
              Number(
                invitation.obligation_amount,
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
      "Joint invitation preview API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load the joint investment invitation.",
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