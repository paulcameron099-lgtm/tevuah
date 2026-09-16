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


const JOINT_AGREEMENT_VERSION =
  "joint-investment-v1";

const JOINT_DISCLOSURE_VERSION =
  "joint-risk-disclosure-v1";

const JOINT_AGREEMENT_DOCUMENT_REF =
  "joint-investment-agreement-v1";

const JOINT_DISCLOSURE_DOCUMENT_REF =
  "joint-risk-disclosure-v1";


type AcceptInvitationBody = {
  token?: unknown;

  jointOwnershipAcknowledged?: unknown;

  fundingObligationAcknowledged?: unknown;

  riskDisclosureAcknowledged?: unknown;

  termsAcknowledged?: unknown;

  signatureName?: unknown;
};


function cleanString(
  value: unknown,
) {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}


function getClientIp(
  request: NextRequest,
) {
  /*
   * x-forwarded-for may contain:
   *
   * client, proxy1, proxy2
   *
   * We only use the first value.
   */

  const forwarded =
    request.headers.get(
      "x-forwarded-for",
    );

  if (forwarded) {
    const first =
      forwarded
        .split(",")[0]
        ?.trim();

    if (first) {
      return first;
    }
  }

  const realIp =
    request.headers
      .get("x-real-ip")
      ?.trim();

  return realIp || null;
}


export async function POST(
  request: NextRequest,
) {
  try {
    /*
     * ==========================================================
     * 1. AUTHENTICATE INVITED INVESTOR
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
     * 3. READ BODY
     * ==========================================================
     */

    let body:
      AcceptInvitationBody;

    try {
      body =
        (await request.json()) as
          AcceptInvitationBody;
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

    const signatureName =
      cleanString(
        body.signatureName,
      );


    /*
     * ==========================================================
     * 4. VALIDATE RAW TOKEN
     * ==========================================================
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
     * 5. REQUIRE EACH ACKNOWLEDGEMENT EXPLICITLY
     * ==========================================================
     */

    if (
      body.jointOwnershipAcknowledged !==
      true
    ) {
      return NextResponse.json(
        {
          error:
            "You must acknowledge the 50/50 joint ownership.",
        },
        {
          status: 400,
        },
      );
    }


    if (
      body.fundingObligationAcknowledged !==
      true
    ) {
      return NextResponse.json(
        {
          error:
            "You must acknowledge your funding obligation.",
        },
        {
          status: 400,
        },
      );
    }


    if (
      body.riskDisclosureAcknowledged !==
      true
    ) {
      return NextResponse.json(
        {
          error:
            "You must acknowledge the investment risk disclosures.",
        },
        {
          status: 400,
        },
      );
    }


    if (
      body.termsAcknowledged !==
      true
    ) {
      return NextResponse.json(
        {
          error:
            "You must acknowledge the joint investment terms.",
        },
        {
          status: 400,
        },
      );
    }


    /*
     * ==========================================================
     * 6. SIGNATURE
     * ==========================================================
     */

    if (!signatureName) {
      return NextResponse.json(
        {
          error:
            "Your legal signature is required.",
        },
        {
          status: 400,
        },
      );
    }


    if (
      signatureName.length <
        2 ||
      signatureName.length >
        160
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid legal signature.",
        },
        {
          status: 400,
        },
      );
    }


    /*
     * ==========================================================
     * 7. HASH RAW TOKEN
     * ==========================================================
     *
     * Raw token never goes to PostgreSQL.
     */

    const tokenHash =
      createHash("sha256")
        .update(rawToken)
        .digest("hex");


    /*
     * ==========================================================
     * 8. SERVER-CAPTURED ACCEPTANCE EVIDENCE
     * ==========================================================
     */

    const acceptedIp =
      getClientIp(
        request,
      );

    const acceptedUserAgent =
      request.headers
        .get("user-agent")
        ?.trim() ||
      null;


    /*
     * ==========================================================
     * 9. ACCEPT THROUGH HARDENED AUTHENTICATED RPC
     * ==========================================================
     *
     * IMPORTANT:
     *
     * Do NOT use createAdminClient().
     *
     * The RPC requires auth.uid() so PostgreSQL independently
     * verifies that the authenticated investor is the invitee.
     */

    const {
      data,
      error,
    } =
      await supabase.rpc(
        "accept_joint_investment_invitation",
        {
          p_token_hash:
            tokenHash,

          p_agreement_version:
            JOINT_AGREEMENT_VERSION,

          p_disclosure_version:
            JOINT_DISCLOSURE_VERSION,

          p_agreement_document_ref:
            JOINT_AGREEMENT_DOCUMENT_REF,

          p_disclosure_document_ref:
            JOINT_DISCLOSURE_DOCUMENT_REF,

          p_joint_ownership_acknowledged:
            true,

          p_funding_obligation_acknowledged:
            true,

          p_risk_disclosure_acknowledged:
            true,

          p_terms_acknowledged:
            true,

          p_signature_name:
            signatureName,

          p_accepted_ip:
            acceptedIp,

          p_accepted_user_agent:
            acceptedUserAgent,
        },
      );


    if (error) {
      console.error(
        "Joint invitation acceptance RPC error:",
        error,
      );

      /*
       * Keep the public response generic because the RPC
       * handles token existence, identity and invitation state.
       */

      return NextResponse.json(
        {
          error:
            "Unable to accept this joint investment invitation. It may be invalid, expired, already used, or associated with another account.",
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


    const acceptance =
      Array.isArray(data)
        ? data[0]
        : data;


    if (!acceptance) {
      return NextResponse.json(
        {
          error:
            "The joint investment acceptance was not completed.",
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
     * 10. SAFE RESPONSE
     * ==========================================================
     */

    return NextResponse.json(
      {
        success: true,

        acceptance: {
          jointSubscriptionId:
            acceptance.joint_subscription_id,

          memberId:
            acceptance.member_id,

          invitationId:
            acceptance.invitation_id,

          consentId:
            acceptance.consent_id,

          memberStatus:
            acceptance.member_status,

          invitationStatus:
            acceptance.invitation_status,

          consentStatus:
            acceptance.consent_status,

          parentStatus:
            acceptance.parent_status,

          readyForSubmission:
            acceptance.ready_for_submission,
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
      "Joint invitation acceptance API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to accept the joint investment invitation.",
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