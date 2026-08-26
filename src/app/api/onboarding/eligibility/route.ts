import {
  NextResponse,
  type NextRequest,
} from "next/server";

import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";
import {
  checkOnboardingEditable,
} from "@/src/lib/onboarding/require-editable";
import {
  checkAccountAccess,
} from "@/src/lib/auth/account-status";

type EligibilityPayload = {
  investorType: string;

  employmentStatus: string;
  occupation?: string;
  employerName?: string;

  annualIncomeBand: string;
  netWorthBand: string;
  liquidNetWorthBand: string;

  investmentExperience: string;
  privateMarketExperience: string;

  sourceOfWealth: string;
  sourceOfFunds: string;

  accreditedInvestorClaim: boolean;
  professionalInvestorClaim: boolean;
};

const investorTypes = [
  "individual",
  "joint",
  "trust",
  "company",
  "partnership",
  "other",
];

const employmentStatuses = [
  "employed",
  "self_employed",
  "business_owner",
  "retired",
  "student",
  "unemployed",
  "other",
];

const annualIncomeBands = [
  "under_50000",
  "50000_99999",
  "100000_249999",
  "250000_499999",
  "500000_plus",
];

const netWorthBands = [
  "under_100000",
  "100000_499999",
  "500000_999999",
  "1000000_4999999",
  "5000000_plus",
];

const liquidNetWorthBands = [
  "under_50000",
  "50000_249999",
  "250000_499999",
  "500000_999999",
  "1000000_plus",
];

const experienceLevels = [
  "none",
  "limited",
  "moderate",
  "experienced",
  "professional",
];

export async function POST(
  request: NextRequest,
) {
  try {
    /*
     * 1. Authenticate investor.
     */
    const supabase =
      await createClient();

    const { data: claimsData } =
      await supabase.auth.getClaims();

    const userId =
      claimsData?.claims?.sub;

    if (!userId) {
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
 * Reject suspended / disabled accounts.
 */
const accountAccess =
  await checkAccountAccess(
    userId,
  );

if (
  !accountAccess.allowed
) {
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
 * Do not allow edits after the
 * complete onboarding package has
 * been locked for compliance review.
 */
const editCheck =
  await checkOnboardingEditable(
    userId,
    "eligibility",
  );

if (!editCheck.allowed) {
  return NextResponse.json(
    {
      error:
        editCheck.reason,
    },
    {
      status: 423,
    },
  );
}

    /*
     * 2. Parse request body.
     */
    const body =
      (await request.json()) as EligibilityPayload;

    const investorType =
      body.investorType?.trim();

    const employmentStatus =
      body.employmentStatus?.trim();

    const occupation =
      body.occupation?.trim() ||
      null;

    const employerName =
      body.employerName?.trim() ||
      null;

    const annualIncomeBand =
      body.annualIncomeBand?.trim();

    const netWorthBand =
      body.netWorthBand?.trim();

    const liquidNetWorthBand =
      body.liquidNetWorthBand?.trim();

    const investmentExperience =
      body.investmentExperience?.trim();

    const privateMarketExperience =
      body.privateMarketExperience?.trim();

    const sourceOfWealth =
      body.sourceOfWealth?.trim();

    const sourceOfFunds =
      body.sourceOfFunds?.trim();

    /*
     * 3. Validate investor type.
     */
    if (
      !investorType ||
      !investorTypes.includes(
        investorType,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Select a valid investor type.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 4. Validate employment.
     */
    if (
      !employmentStatus ||
      !employmentStatuses.includes(
        employmentStatus,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Select your employment status.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 5. Validate financial bands.
     */
    if (
      !annualIncomeBand ||
      !annualIncomeBands.includes(
        annualIncomeBand,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Select your annual income range.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !netWorthBand ||
      !netWorthBands.includes(
        netWorthBand,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Select your net worth range.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !liquidNetWorthBand ||
      !liquidNetWorthBands.includes(
        liquidNetWorthBand,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Select your liquid net worth range.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 6. Validate investment experience.
     */
    if (
      !investmentExperience ||
      !experienceLevels.includes(
        investmentExperience,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Select your investment experience.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !privateMarketExperience ||
      !experienceLevels.includes(
        privateMarketExperience,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Select your private-market experience.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 7. Validate source of wealth/funds.
     */
    if (!sourceOfWealth) {
      return NextResponse.json(
        {
          error:
            "Source of wealth is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!sourceOfFunds) {
      return NextResponse.json(
        {
          error:
            "Source of funds is required.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 8. Use privileged server client.
     */
    const admin =
      createAdminClient();

    const now =
      new Date().toISOString();

    /*
     * 9. Save eligibility questionnaire.
     *
     * Submission does NOT automatically
     * make the investor eligible.
     */
    const {
      error: eligibilityError,
    } = await admin
      .from(
        "investor_eligibility",
      )
      .upsert(
        {
          user_id:
            userId,

          investor_type:
            investorType,

          employment_status:
            employmentStatus,

          occupation,

          employer_name:
            employerName,

          annual_income_band:
            annualIncomeBand,

          net_worth_band:
            netWorthBand,

          liquid_net_worth_band:
            liquidNetWorthBand,

          investment_experience:
            investmentExperience,

          private_market_experience:
            privateMarketExperience,

          source_of_wealth:
            sourceOfWealth,

          source_of_funds:
            sourceOfFunds,

          accredited_investor_claim:
            Boolean(
              body.accreditedInvestorClaim,
            ),

          professional_investor_claim:
            Boolean(
              body.professionalInvestorClaim,
            ),

          status:
            "under_review",

          rejection_reason:
            null,

          admin_notes:
            null,

          submitted_at:
            now,

          updated_at:
            now,
        },
        {
          onConflict:
            "user_id",
        },
      );

    if (eligibilityError) {
      console.error(
        "Eligibility save error:",
        eligibilityError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to save investor eligibility information.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 10. Update profile-level status.
     */
    const {
      error: profileError,
    } = await admin
      .from("profiles")
      .update({
        eligibility_status:
          "pending",

        onboarding_status:
          "in_progress",

        updated_at:
          now,
      })
      .eq(
        "id",
        userId,
      );

    if (profileError) {
      console.error(
        "Eligibility profile status error:",
        profileError,
      );

      return NextResponse.json(
        {
          error:
            "Eligibility information was saved, but profile status could not be updated.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 11. Mark eligibility step submitted
     * and move to Suitability.
     */
    const {
      error: onboardingError,
    } = await admin
      .from(
        "investor_onboarding",
      )
      .upsert(
        {
          user_id:
            userId,

          eligibility_completed:
            true,

          current_step:
            "suitability",

          updated_at:
            now,
        },
        {
          onConflict:
            "user_id",
        },
      );

    if (onboardingError) {
      console.error(
        "Eligibility onboarding progress error:",
        onboardingError,
      );

      return NextResponse.json(
        {
          error:
            "Eligibility was submitted, but onboarding progress could not be updated.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,

        status:
          "under_review",

        next:
          "/dashboard/onboarding/suitability",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Eligibility submission error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while submitting investor eligibility.",
      },
      {
        status: 500,
      },
    );
  }
}