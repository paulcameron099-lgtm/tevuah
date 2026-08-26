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

type SuitabilityPayload = {
  investmentObjective: string;
  investmentHorizon: string;
  liquidityNeeds: string;
  riskTolerance: string;

  understandsCapitalLoss: boolean;
  understandsIlliquidity: boolean;
  understandsLongHoldingPeriod: boolean;
  understandsNoGuaranteedReturn: boolean;
};

const allowedObjectives = [
  "capital_growth",
  "income",
  "capital_preservation",
  "diversification",
  "real_asset_exposure",
  "long_term_wealth",
];

const allowedHorizons = [
  "under_1_year",
  "1_3_years",
  "3_5_years",
  "5_10_years",
  "10_plus_years",
];

const allowedLiquidityNeeds = [
  "high",
  "moderate",
  "low",
  "very_low",
];

const allowedRiskTolerance = [
  "conservative",
  "moderately_conservative",
  "balanced",
  "growth",
  "aggressive",
];

export async function POST(
  request: NextRequest,
) {
  try {
    /*
     * 1. Authenticate the investor.
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
    "suitability",
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
     * 2. Parse submitted payload.
     */
    const body =
      (await request.json()) as SuitabilityPayload;

    const investmentObjective =
      body.investmentObjective?.trim();

    const investmentHorizon =
      body.investmentHorizon?.trim();

    const liquidityNeeds =
      body.liquidityNeeds?.trim();

    const riskTolerance =
      body.riskTolerance?.trim();

    /*
     * 3. Validate investment objective.
     */
    if (
      !investmentObjective ||
      !allowedObjectives.includes(
        investmentObjective,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Select a valid investment objective.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 4. Validate investment horizon.
     */
    if (
      !investmentHorizon ||
      !allowedHorizons.includes(
        investmentHorizon,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Select a valid investment horizon.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 5. Validate liquidity needs.
     */
    if (
      !liquidityNeeds ||
      !allowedLiquidityNeeds.includes(
        liquidityNeeds,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Select your liquidity needs.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 6. Validate risk tolerance.
     */
    if (
      !riskTolerance ||
      !allowedRiskTolerance.includes(
        riskTolerance,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Select your risk tolerance.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 7. Require all four key acknowledgements.
     */
    if (!body.understandsCapitalLoss) {
      return NextResponse.json(
        {
          error:
            "You must acknowledge the possibility of partial or total capital loss.",
        },
        {
          status: 400,
        },
      );
    }

    if (!body.understandsIlliquidity) {
      return NextResponse.json(
        {
          error:
            "You must acknowledge that private investments may be illiquid.",
        },
        {
          status: 400,
        },
      );
    }

    if (!body.understandsLongHoldingPeriod) {
      return NextResponse.json(
        {
          error:
            "You must acknowledge that investments may require a long holding period.",
        },
        {
          status: 400,
        },
      );
    }

    if (!body.understandsNoGuaranteedReturn) {
      return NextResponse.json(
        {
          error:
            "You must acknowledge that investment returns are not guaranteed.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 8. Create privileged server client.
     */
    const admin =
      createAdminClient();

    const now =
      new Date().toISOString();

    /*
     * 9. Save the suitability questionnaire.
     */
    const {
      error: suitabilityError,
    } = await admin
      .from(
        "investor_suitability",
      )
      .upsert(
        {
          user_id:
            userId,

          investment_objective:
            investmentObjective,

          investment_horizon:
            investmentHorizon,

          liquidity_needs:
            liquidityNeeds,

          risk_tolerance:
            riskTolerance,

          understands_capital_loss:
            Boolean(
              body.understandsCapitalLoss,
            ),

          understands_illiquidity:
            Boolean(
              body.understandsIlliquidity,
            ),

          understands_long_holding_period:
            Boolean(
              body.understandsLongHoldingPeriod,
            ),

          understands_no_guaranteed_return:
            Boolean(
              body.understandsNoGuaranteedReturn,
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

    if (suitabilityError) {
      console.error(
        "Suitability save error:",
        suitabilityError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to save suitability assessment.",
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
        suitability_status:
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
        "Suitability profile update error:",
        profileError,
      );

      return NextResponse.json(
        {
          error:
            "Suitability was saved, but profile status could not be updated.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 11. Mark suitability step submitted
     * and move onboarding to Tax & IRS.
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

          suitability_completed:
            true,

          current_step:
            "tax",

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
        "Suitability onboarding progress error:",
        onboardingError,
      );

      return NextResponse.json(
        {
          error:
            "Suitability was submitted, but onboarding progress could not be updated.",
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
          "/dashboard/onboarding/tax",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Suitability submission error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while submitting suitability.",
      },
      {
        status: 500,
      },
    );
  }
}