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


type ConsentPayload = {
  jointOwnershipAcknowledged?: boolean;
  fundingObligationAcknowledged?: boolean;
  riskDisclosureAcknowledged?: boolean;
  termsAcknowledged?: boolean;

  signatureName?: string;
};


/*
 * Temporary canonical legal-document metadata.
 *
 * We keep these SERVER-SIDE rather than accepting
 * agreement versions/document references from the browser.
 *
 * Later these can move into a legal-document registry/config.
 */
const JOINT_AGREEMENT_VERSION =
  "joint-investment-v1";

const JOINT_DISCLOSURE_VERSION =
  "joint-risk-disclosure-v1";

const JOINT_AGREEMENT_DOCUMENT_REF =
  "joint-investment-agreement-v1";

const JOINT_DISCLOSURE_DOCUMENT_REF =
  "joint-risk-disclosure-v1";


function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}


export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    /*
     * 1. Authenticate.
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
          error: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }


    /*
     * 2. Account access.
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
        },
      );
    }


    /*
     * 3. Validate joint subscription ID.
     */
    const { id } =
      await context.params;

    if (
      !id ||
      !isUuid(id)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid joint investment.",
        },
        {
          status: 400,
        },
      );
    }


    /*
     * 4. Parse consent evidence.
     */
    let body: ConsentPayload;

    try {
      body =
        (await request.json()) as
          ConsentPayload;
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid request body.",
        },
        {
          status: 400,
        },
      );
    }


    const signatureName =
      body.signatureName?.trim();


    /*
     * 5. Require every independent acknowledgement.
     *
     * Never infer these values from one checkbox
     * or manufacture TRUE on the server.
     */
    if (
      body.jointOwnershipAcknowledged !==
      true
    ) {
      return NextResponse.json(
        {
          error:
            "You must acknowledge the 50/50 joint ownership structure.",
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
            "You must acknowledge your individual funding obligation.",
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
            "You must acknowledge the investment risk disclosure.",
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


    if (
      !signatureName ||
      signatureName.length < 2 ||
      signatureName.length > 150
    ) {
      return NextResponse.json(
        {
          error:
            "Enter your full legal name as your signature.",
        },
        {
          status: 400,
        },
      );
    }


    /*
     * 6. Capture request metadata server-side.
     *
     * This metadata is supporting audit evidence,
     * not identity proof.
     */
    const forwardedFor =
      request.headers.get(
        "x-forwarded-for",
      );

    const acceptedIp =
      forwardedFor
        ?.split(",")[0]
        ?.trim() ||
      request.headers.get(
        "x-real-ip",
      ) ||
      null;

    const userAgent =
      request.headers.get(
        "user-agent",
      );


    /*
     * 7. Execute using the authenticated SSR client.
     *
     * The RPC independently verifies:
     *
     * - auth.uid()
     * - caller is the initiator
     * - caller owns member slot 1
     * - lifecycle state
     * - all four acknowledgements
     */
    const {
      data,
      error,
    } =
      await supabase.rpc(
        "accept_joint_investment_initiator_consent",
        {
          p_joint_subscription_id:
            id,

          p_agreement_version:
            JOINT_AGREEMENT_VERSION,

          p_disclosure_version:
            JOINT_DISCLOSURE_VERSION,

          p_agreement_document_ref:
            JOINT_AGREEMENT_DOCUMENT_REF,

          p_disclosure_document_ref:
            JOINT_DISCLOSURE_DOCUMENT_REF,

          p_joint_ownership_acknowledged:
            body.jointOwnershipAcknowledged,

          p_funding_obligation_acknowledged:
            body.fundingObligationAcknowledged,

          p_risk_disclosure_acknowledged:
            body.riskDisclosureAcknowledged,

          p_terms_acknowledged:
            body.termsAcknowledged,

          p_signature_name:
            signatureName,

          p_accepted_ip:
            acceptedIp,

          p_accepted_user_agent:
            userAgent,
        },
      );


    if (error) {
      console.error(
        "Joint initiator consent RPC error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to record joint investment consent.",
        },
        {
          status: 400,
        },
      );
    }


    const result =
      Array.isArray(data)
        ? data[0]
        : data;


    if (!result) {
      console.error(
        "Joint initiator consent RPC returned no result.",
      );

      return NextResponse.json(
        {
          error:
            "Joint investment consent was not recorded.",
        },
        {
          status: 500,
        },
      );
    }


    return NextResponse.json({
      success: true,
      consent: result,
    });
  } catch (error) {
    console.error(
      "Joint initiator consent API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while recording joint investment consent.",
      },
      {
        status: 500,
      },
    );
  }
}