import { redirect } from "next/navigation";

import { SuitabilityForm } from "@/src/components/onboarding/suitability-form";
import { createClient } from "@/src/lib/supabase/server";

export default async function SuitabilityPage() {
  const supabase =
    await createClient();

  const { data: claimsData } =
    await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;

  if (!userId) {
    redirect("/login");
  }

  const {
    data: suitability,
    error,
  } = await supabase
    .from(
      "investor_suitability",
    )
    .select(
      `
      investment_objective,
      investment_horizon,
      liquidity_needs,
      risk_tolerance,

      understands_capital_loss,
      understands_illiquidity,
      understands_long_holding_period,
      understands_no_guaranteed_return,

      status
      `,
    )
    .eq(
      "user_id",
      userId,
    )
    .maybeSingle();

  if (error) {
    console.error(
      "Suitability load error:",
      error,
    );
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Step 5
        </p>

        <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950 sm:text-4xl">
          Suitability assessment
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Tell us about your investment objectives,
          time horizon, liquidity requirements and
          tolerance for investment risk.
        </p>
      </div>

      <SuitabilityForm
        initialValues={{
          investmentObjective:
            suitability?.investment_objective ??
            null,

          investmentHorizon:
            suitability?.investment_horizon ??
            null,

          liquidityNeeds:
            suitability?.liquidity_needs ??
            null,

          riskTolerance:
            suitability?.risk_tolerance ??
            null,

          understandsCapitalLoss:
            suitability?.understands_capital_loss ??
            false,

          understandsIlliquidity:
            suitability?.understands_illiquidity ??
            false,

          understandsLongHoldingPeriod:
            suitability?.understands_long_holding_period ??
            false,

          understandsNoGuaranteedReturn:
            suitability?.understands_no_guaranteed_return ??
            false,

          status:
            suitability?.status ??
            null,
        }}
      />
    </div>
  );
}