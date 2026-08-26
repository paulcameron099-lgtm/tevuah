import { redirect } from "next/navigation";

import { EligibilityForm } from "@/src/components/onboarding/eligibility-form";
import { createClient } from "@/src/lib/supabase/server";

export default async function EligibilityPage() {
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
    data: eligibility,
    error,
  } = await supabase
    .from(
      "investor_eligibility",
    )
    .select(
      `
      investor_type,
      employment_status,
      occupation,
      employer_name,

      annual_income_band,
      net_worth_band,
      liquid_net_worth_band,

      investment_experience,
      private_market_experience,

      source_of_wealth,
      source_of_funds,

      accredited_investor_claim,
      professional_investor_claim,

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
      "Eligibility load error:",
      error,
    );
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Step 4
        </p>

        <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950 sm:text-4xl">
          Investor eligibility
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Provide information about your investor
          profile, financial circumstances, experience
          and expected source of investment funds.
        </p>
      </div>

      <EligibilityForm
        initialValues={{
          investorType:
            eligibility?.investor_type ??
            null,

          employmentStatus:
            eligibility?.employment_status ??
            null,

          occupation:
            eligibility?.occupation ??
            null,

          employerName:
            eligibility?.employer_name ??
            null,

          annualIncomeBand:
            eligibility?.annual_income_band ??
            null,

          netWorthBand:
            eligibility?.net_worth_band ??
            null,

          liquidNetWorthBand:
            eligibility?.liquid_net_worth_band ??
            null,

          investmentExperience:
            eligibility?.investment_experience ??
            null,

          privateMarketExperience:
            eligibility?.private_market_experience ??
            null,

          sourceOfWealth:
            eligibility?.source_of_wealth ??
            null,

          sourceOfFunds:
            eligibility?.source_of_funds ??
            null,

          accreditedInvestorClaim:
            eligibility?.accredited_investor_claim ??
            false,

          professionalInvestorClaim:
            eligibility?.professional_investor_claim ??
            false,

          status:
            eligibility?.status ??
            null,
        }}
      />
    </div>
  );
}