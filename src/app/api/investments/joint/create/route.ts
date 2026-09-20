import {
  NextResponse,
  type NextRequest,
} from "next/server";

import {
  checkAccountAccess,
} from "@/src/lib/auth/account-status";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

import {
  createClient,
} from "@/src/lib/supabase/server";

export const dynamic =
  "force-dynamic";

/*
 * Keep these identifiers stable.
 *
 * They are written into the immutable consent record so we can
 * identify exactly which agreement/disclosure version the
 * investor accepted.
 */
const JOINT_AGREEMENT_VERSION =
  "joint-investment-v1";

const JOINT_DISCLOSURE_VERSION =
  "joint-risk-disclosure-v1";

const JOINT_AGREEMENT_DOCUMENT_REF =
  "joint-investment-agreement-v1";

const JOINT_DISCLOSURE_DOCUMENT_REF =
  "joint-risk-disclosure-v1";

function isUuid(
  value: unknown,
): value is string {
  return (
    typeof value ===
      "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

function getClientIp(
  request: NextRequest,
) {
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
    request.headers.get(
      "x-real-ip",
    );

  return (
    realIp?.trim() ||
    null
  );
}

export async function POST(
  request: NextRequest,
) {
  /*
   * ==========================================================
   * IMPORTANT
   * ==========================================================
   *
   * This route performs DATABASE creation + initiator consent.
   *
   * Invitation issuance/email remains in the existing
   * invitation endpoint because email cannot participate in the
   * PostgreSQL transaction.
   *
   * The browser calls that invitation endpoint only AFTER this
   * route succeeds.
   */

  try {
    /* ========================================================
     * 1. AUTHENTICATED INVESTOR
     * ======================================================== */

    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    if (
      user.role !==
      "investor"
    ) {
      return NextResponse.json(
        {
          error:
            "Only investors can create a joint investment.",
        },
        {
          status: 403,
        },
      );
    }

    /* ========================================================
     * 2. ACCOUNT ACCESS
     * ======================================================== */

    const accountAccess =
      await checkAccountAccess(
        user.id,
      );

    if (
      !accountAccess.allowed
    ) {
      return NextResponse.json(
        {
          error:
            accountAccess.reason ??
            "Your account cannot create an investment at this time.",

          accountStatus:
            accountAccess.status,
        },
        {
          status: 403,
        },
      );
    }

    /*
     * Match the existing individual investment gate.
     */
    if (
      user.onboarding_status !==
      "approved"
    ) {
      return NextResponse.json(
        {
          error:
            "Investor onboarding must be approved before creating an investment.",
        },
        {
          status: 403,
        },
      );
    }

    /* ========================================================
     * 3. REQUEST BODY
     * ======================================================== */

    let body: {
      opportunityId?: unknown;
      secondInvestorId?: unknown;
      totalCommitmentAmount?: unknown;

      signatureName?: unknown;

      jointOwnershipAcknowledged?: unknown;
      fundingObligationAcknowledged?: unknown;
      riskDisclosureAcknowledged?: unknown;
      termsAcknowledged?: unknown;
    };

    try {
      body =
        await request.json();
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

    const {
      opportunityId,
      secondInvestorId,
      totalCommitmentAmount,
      signatureName,

      jointOwnershipAcknowledged,
      fundingObligationAcknowledged,
      riskDisclosureAcknowledged,
      termsAcknowledged,
    } = body;

    /* ========================================================
     * 4. BASIC INPUT VALIDATION
     * ======================================================== */

    if (
      !isUuid(
        opportunityId,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid investment opportunity.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !isUuid(
        secondInvestorId,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid joint investor.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      secondInvestorId ===
      user.id
    ) {
      return NextResponse.json(
        {
          error:
            "You cannot create a joint investment with yourself.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      typeof totalCommitmentAmount !==
        "number" ||
      !Number.isSafeInteger(
        totalCommitmentAmount,
      ) ||
      totalCommitmentAmount <=
        0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid joint commitment amount.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Exact 50/50 cents split.
     */
    if (
      totalCommitmentAmount %
        2 !==
      0
    ) {
      return NextResponse.json(
        {
          error:
            "The joint commitment must split equally between both investors.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      typeof signatureName !==
        "string" ||
      signatureName.trim()
        .length < 2
    ) {
      return NextResponse.json(
        {
          error:
            "Your electronic signature is required.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Never manufacture legal acknowledgements server-side.
     *
     * All four must arrive explicitly true from the investor.
     */
    if (
      jointOwnershipAcknowledged !==
        true ||
      fundingObligationAcknowledged !==
        true ||
      riskDisclosureAcknowledged !==
        true ||
      termsAcknowledged !==
        true
    ) {
      return NextResponse.json(
        {
          error:
            "All joint investment acknowledgements must be accepted.",
        },
        {
          status: 400,
        },
      );
    }

    /* ========================================================
     * 5. DEFENSE-IN-DEPTH LOOKUPS
     * ======================================================== */

    const admin =
      createAdminClient();

    const [
      opportunityResult,
      secondInvestorResult,
    ] =
      await Promise.all([
        admin
          .from(
            "investment_opportunities",
          )
          .select(
            `
            id,
            status,
            currency,
            minimum_investment,
            funding_target,
            total_funded
            `,
          )
          .eq(
            "id",
            opportunityId,
          )
          .maybeSingle(),

        admin
          .from(
            "profiles",
          )
          .select(
            `
            id,
            role,
            account_status,
            onboarding_status
            `,
          )
          .eq(
            "id",
            secondInvestorId,
          )
          .maybeSingle(),
      ]);

    if (
      opportunityResult.error ||
      !opportunityResult.data
    ) {
      console.error(
        "Joint creation opportunity lookup error:",
        opportunityResult.error,
      );

      return NextResponse.json(
        {
          error:
            "Investment opportunity not found.",
        },
        {
          status: 404,
        },
      );
    }

    const opportunity =
      opportunityResult.data;

    if (
      opportunity.status !==
      "published"
    ) {
      return NextResponse.json(
        {
          error:
            "This investment opportunity is not currently open for investment.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      secondInvestorResult.error ||
      !secondInvestorResult.data
    ) {
      console.error(
        "Joint creation investor lookup error:",
        secondInvestorResult.error,
      );

      return NextResponse.json(
        {
          error:
            "The selected joint investor is unavailable.",
        },
        {
          status: 400,
        },
      );
    }

    const secondInvestor =
      secondInvestorResult.data;

    if (
      secondInvestor.role !==
      "investor"
    ) {
      return NextResponse.json(
        {
          error:
            "The selected account is not an investor account.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      secondInvestor.account_status ===
      "suspended"
    ) {
      return NextResponse.json(
        {
          error:
            "The selected investor is not currently eligible for a joint investment.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * We now know the exact onboarding value used by the
     * existing investment entry page, so both investors must
     * be approved before a new joint investment is created.
     */
    if (
      secondInvestor.onboarding_status !==
      "approved"
    ) {
      return NextResponse.json(
        {
          error:
            "The selected investor must complete approved onboarding before joining an investment.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * These are UI-friendly checks only.
     *
     * The database RPC remains authoritative and independently
     * validates minimum investment, capacity and lifecycle.
     */
    if (
      totalCommitmentAmount <
      Number(
        opportunity.minimum_investment,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "The joint commitment is below the opportunity minimum.",
        },
        {
          status: 400,
        },
      );
    }

    /* ========================================================
     * 6. AUTHENTICATED SUPABASE CLIENT
     * ======================================================== */

    /*
     * CRITICAL:
     *
     * create_joint_investment_subscription() and
     * accept_joint_investment_initiator_consent() use
     * auth.uid().
     *
     * Do NOT use admin.rpc().
     */
    const supabase =
      await createClient();

    /* ========================================================
     * 7. CREATE JOINT PARENT + TWO MEMBERS
     * ======================================================== */

    const {
      data: creationData,
      error: creationError,
    } =
      await supabase.rpc(
        "create_joint_investment_subscription",
        {
          p_initiator_id:
            user.id,

          p_second_investor_id:
            secondInvestorId,

          p_opportunity_id:
            opportunityId,

          p_total_commitment_amount:
            totalCommitmentAmount,
        },
      );

    if (
      creationError
    ) {
      console.error(
        "Joint investment creation RPC error:",
        creationError,
      );

      return NextResponse.json(
        {
          error:
            creationError.message ||
            "Unable to create the joint investment.",
        },
        {
          status: 400,
        },
      );
    }

    const creation =
      creationData as
        | {
            success?: boolean;

            jointSubscriptionId?:
              string;

            opportunityId?:
              string;

            status?:
              string;

            totalCommitmentAmount?:
              number;

            currency?:
              string;
          }
        | null;

    const jointSubscriptionId =
      creation
        ?.jointSubscriptionId;

    if (
      !jointSubscriptionId ||
      !isUuid(
        jointSubscriptionId,
      )
    ) {
      console.error(
        "Joint creation RPC returned an invalid result:",
        creationData,
      );

      return NextResponse.json(
        {
          error:
            "The joint investment was created without a valid identifier.",
        },
        {
          status: 500,
        },
      );
    }

    /* ========================================================
     * 8. RECORD INITIATOR CONSENT
     * ======================================================== */

    const clientIp =
      getClientIp(
        request,
      );

    const userAgent =
      request.headers
        .get(
          "user-agent",
        )
        ?.slice(
          0,
          1000,
        ) ??
      null;

    const {
      data: consentData,
      error: consentError,
    } =
      await supabase.rpc(
        "accept_joint_investment_initiator_consent",
        {
          p_joint_subscription_id:
            jointSubscriptionId,

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
            signatureName.trim(),

          p_accepted_ip:
            clientIp,

          p_accepted_user_agent:
            userAgent,
        },
      );

    if (
      consentError
    ) {
      /*
       * IMPORTANT:
       *
       * Creation already succeeded.
       *
       * Do NOT automatically call the creation RPC again.
       * Returning the jointSubscriptionId lets the client know
       * that a parent record exists and prevents a blind retry
       * from manufacturing another joint investment.
       */
      console.error(
        "Joint initiator consent RPC error:",
        {
          jointSubscriptionId,
          error:
            consentError,
        },
      );

      return NextResponse.json(
        {
          success: false,

          jointCreated:
            true,

          consentRecorded:
            false,

          jointSubscriptionId,

          error:
            consentError.message ||
            "The joint investment was created, but your consent could not be recorded.",
        },
        {
          status: 409,

          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        },
      );
    }

    const consent =
      Array.isArray(
        consentData,
      )
        ? consentData[0] ??
          null
        : consentData;

    if (!consent) {
      console.error(
        "Initiator consent RPC returned no result:",
        {
          jointSubscriptionId,
          consentData,
        },
      );

      return NextResponse.json(
        {
          success: false,

          jointCreated:
            true,

          consentRecorded:
            false,

          jointSubscriptionId,

          error:
            "The joint investment was created, but the consent result could not be confirmed.",
        },
        {
          status: 409,

          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        },
      );
    }

    /* ========================================================
     * 9. SUCCESS
     * ======================================================== */

    return NextResponse.json(
      {
        success: true,

        jointCreated:
          true,

        consentRecorded:
          true,

        jointSubscriptionId,

        status:
          creation?.status ??
          "awaiting_member_acceptance",

        consent: {
          memberId:
            consent.member_id,

          consentId:
            consent.consent_id,

          memberStatus:
            consent.member_status,

          consentStatus:
            consent.consent_status,

          parentStatus:
            consent.parent_status,
        },
      },
      {
        status: 201,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Joint investment creation API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while creating the joint investment.",
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