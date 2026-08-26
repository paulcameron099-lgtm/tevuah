import { redirect } from "next/navigation";

import { FinalReviewForm } from "@/src/components/onboarding/final-review-form";
import { createClient } from "@/src/lib/supabase/server";

function displayValue(
  value:
    | string
    | null
    | undefined,
) {
  if (!value) {
    return "—";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

export default async function OnboardingReviewPage() {
  /*
   * --------------------------------------------------
   * 1. AUTHENTICATE INVESTOR
   * --------------------------------------------------
   */
  const supabase =
    await createClient();

  const {
    data: claimsData,
  } =
    await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;

  if (!userId) {
    redirect("/login");
  }

  /*
   * --------------------------------------------------
   * 2. LOAD ALL ONBOARDING RECORDS
   * --------------------------------------------------
   */
  const [
    profileResult,
    onboardingResult,
    kycResult,
    addressResult,
    eligibilityResult,
    suitabilityResult,
    taxResult,
  ] = await Promise.all([
    /*
     * PROFILE
     */
    supabase
      .from("profiles")
      .select(
        `
        first_name,
        last_name,
        phone,
        date_of_birth,
        nationality,
        profession,
        country,
        city,
        state,
        postal_code,
        onboarding_status
        `,
      )
      .eq(
        "id",
        userId,
      )
      .maybeSingle(),

    /*
     * ONBOARDING PROGRESS
     */
    supabase
      .from(
        "investor_onboarding",
      )
      .select(
        `
        profile_completed,
        identity_completed,
        address_completed,
        eligibility_completed,
        suitability_completed,
        tax_completed,
        submitted_at,
        is_locked,
        editable_sections,
        unlock_reason
        `,
      )
      .eq(
        "user_id",
        userId,
      )
      .maybeSingle(),

    /*
     * IDENTITY / KYC
     *
     * IMPORTANT:
     * The four document paths are selected
     * because we validate them below.
     */
    supabase
      .from("investor_kyc")
      .select(
        `
        legal_first_name,
        legal_middle_name,
        legal_last_name,
        date_of_birth,
        nationality,

        drivers_license_last_four,
        ssn_last_four,

        drivers_license_front_path,
        drivers_license_back_path,
        ssn_front_path,
        ssn_back_path,

        status,
        verification_status
        `,
      )
      .eq(
        "user_id",
        userId,
      )
      .maybeSingle(),

    /*
     * ADDRESS
     */
    supabase
      .from(
        "investor_address_verification",
      )
      .select(
        `
        address_line_1,
        address_line_2,
        city,
        state_region,
        postal_code,
        country,

        proof_document_type,
        proof_document_path,

        status
        `,
      )
      .eq(
        "user_id",
        userId,
      )
      .maybeSingle(),

    /*
     * ELIGIBILITY
     */
    supabase
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
      .maybeSingle(),

    /*
     * SUITABILITY
     */
    supabase
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
      .maybeSingle(),

    /*
     * TAX
     */
    supabase
      .from(
        "investor_tax_profiles",
      )
      .select(
        `
        tax_form_type,
        taxpayer_name,
        tax_residency_country,

        tin_type,
        tin_last_four,
        foreign_tin_last_four,

        country_of_citizenship,

        certification_accepted,
        certification_name,

        w9_document_path,
        w9_supporting_document_path,

        w8ben_document_path,
        w8ben_supporting_document_path,

        status
        `,
      )
      .eq(
        "user_id",
        userId,
      )
      .maybeSingle(),
  ]);

  /*
   * --------------------------------------------------
   * 3. LOG DATABASE READ ERRORS
   * --------------------------------------------------
   */
  if (profileResult.error) {
    console.error(
      "Review profile load error:",
      profileResult.error,
    );
  }

  if (onboardingResult.error) {
    console.error(
      "Review onboarding load error:",
      onboardingResult.error,
    );
  }

  if (kycResult.error) {
    console.error(
      "Review KYC load error:",
      kycResult.error,
    );
  }

  if (addressResult.error) {
    console.error(
      "Review address load error:",
      addressResult.error,
    );
  }

  if (eligibilityResult.error) {
    console.error(
      "Review eligibility load error:",
      eligibilityResult.error,
    );
  }

  if (suitabilityResult.error) {
    console.error(
      "Review suitability load error:",
      suitabilityResult.error,
    );
  }

  if (taxResult.error) {
    console.error(
      "Review tax load error:",
      taxResult.error,
    );
  }

  /*
   * --------------------------------------------------
   * 4. NORMALIZE RESULTS
   * --------------------------------------------------
   */
  const profile =
    profileResult.data;

  const onboarding =
    onboardingResult.data;

  const kyc =
    kycResult.data;

  const address =
    addressResult.data;

  const eligibility =
    eligibilityResult.data;

  const suitability =
    suitabilityResult.data;

  const tax =
    taxResult.data;

  const onboardingStatus =
    profile?.onboarding_status ??
    "not_started";

  /*
   * --------------------------------------------------
   * 5. PROFILE COMPLETENESS
   * --------------------------------------------------
   */
  const profileMissingReasons:
    string[] = [];

  if (!profile) {
    profileMissingReasons.push(
      "Your personal profile has not been submitted.",
    );
  } else {
    if (
      !profile.first_name?.trim()
    ) {
      profileMissingReasons.push(
        "First name is missing.",
      );
    }

    if (
      !profile.last_name?.trim()
    ) {
      profileMissingReasons.push(
        "Last name is missing.",
      );
    }

    if (!profile.date_of_birth) {
      profileMissingReasons.push(
        "Date of birth is missing.",
      );
    }

    if (
      !profile.nationality?.trim()
    ) {
      profileMissingReasons.push(
        "Nationality is missing.",
      );
    }

    if (
      !profile.country?.trim()
    ) {
      profileMissingReasons.push(
        "Country is missing.",
      );
    }
  }

  /*
   * --------------------------------------------------
   * 6. IDENTITY COMPLETENESS
   * --------------------------------------------------
   */
  const identityMissingReasons:
    string[] = [];

  if (!kyc) {
    identityMissingReasons.push(
      "Identity verification has not been submitted.",
    );
  } else {
    if (
      !kyc.legal_first_name?.trim()
    ) {
      identityMissingReasons.push(
        "Legal first name is missing.",
      );
    }

    if (
      !kyc.legal_last_name?.trim()
    ) {
      identityMissingReasons.push(
        "Legal last name is missing.",
      );
    }

    if (!kyc.date_of_birth) {
      identityMissingReasons.push(
        "Identity date of birth is missing.",
      );
    }

    if (
      !kyc.nationality?.trim()
    ) {
      identityMissingReasons.push(
        "Nationality is missing from identity verification.",
      );
    }

    if (
      !kyc.drivers_license_last_four
    ) {
      identityMissingReasons.push(
        "Driver's license number has not been submitted.",
      );
    }

    if (!kyc.ssn_last_four) {
      identityMissingReasons.push(
        "Social Security number has not been submitted.",
      );
    }

    if (
      !kyc.drivers_license_front_path
    ) {
      identityMissingReasons.push(
        "Driver's license front image is missing.",
      );
    }

    if (
      !kyc.drivers_license_back_path
    ) {
      identityMissingReasons.push(
        "Driver's license back image is missing.",
      );
    }

    if (!kyc.ssn_front_path) {
      identityMissingReasons.push(
        "SSN front image is missing.",
      );
    }

    if (!kyc.ssn_back_path) {
      identityMissingReasons.push(
        "SSN back image is missing.",
      );
    }
  }

  /*
   * --------------------------------------------------
   * 7. ADDRESS COMPLETENESS
   * --------------------------------------------------
   */
  const addressMissingReasons:
    string[] = [];

  if (!address) {
    addressMissingReasons.push(
      "Address verification has not been submitted.",
    );
  } else {
    if (
      !address.address_line_1?.trim()
    ) {
      addressMissingReasons.push(
        "Residential address is missing.",
      );
    }

    if (!address.city?.trim()) {
      addressMissingReasons.push(
        "City is missing.",
      );
    }

    if (
      !address.state_region?.trim()
    ) {
      addressMissingReasons.push(
        "State or region is missing.",
      );
    }

    if (
      !address.postal_code?.trim()
    ) {
      addressMissingReasons.push(
        "Postal code is missing.",
      );
    }

    if (
      !address.country?.trim()
    ) {
      addressMissingReasons.push(
        "Country is missing from address verification.",
      );
    }

    if (
      !address.proof_document_path
    ) {
      addressMissingReasons.push(
        "Proof-of-address document is missing.",
      );
    }
  }

  /*
   * --------------------------------------------------
   * 8. ELIGIBILITY COMPLETENESS
   * --------------------------------------------------
   */
  const eligibilityMissingReasons:
    string[] = [];

  if (!eligibility) {
    eligibilityMissingReasons.push(
      "Investor eligibility questionnaire has not been submitted.",
    );
  } else {
    if (
      !eligibility.investor_type
    ) {
      eligibilityMissingReasons.push(
        "Investor type is missing.",
      );
    }

    if (
      !eligibility.employment_status
    ) {
      eligibilityMissingReasons.push(
        "Employment status is missing.",
      );
    }

    if (
      !eligibility.annual_income_band
    ) {
      eligibilityMissingReasons.push(
        "Annual income range is missing.",
      );
    }

    if (
      !eligibility.net_worth_band
    ) {
      eligibilityMissingReasons.push(
        "Net worth range is missing.",
      );
    }

    if (
      !eligibility.source_of_funds
    ) {
      eligibilityMissingReasons.push(
        "Source of funds is missing.",
      );
    }
  }

  /*
   * --------------------------------------------------
   * 9. SUITABILITY COMPLETENESS
   * --------------------------------------------------
   */
  const suitabilityMissingReasons:
    string[] = [];

  if (!suitability) {
    suitabilityMissingReasons.push(
      "Suitability assessment has not been submitted.",
    );
  } else {
    if (
      !suitability.investment_objective
    ) {
      suitabilityMissingReasons.push(
        "Investment objective is missing.",
      );
    }

    if (
      !suitability.investment_horizon
    ) {
      suitabilityMissingReasons.push(
        "Investment horizon is missing.",
      );
    }

    if (
      !suitability.liquidity_needs
    ) {
      suitabilityMissingReasons.push(
        "Liquidity needs are missing.",
      );
    }

    if (
      !suitability.risk_tolerance
    ) {
      suitabilityMissingReasons.push(
        "Risk tolerance is missing.",
      );
    }

    if (
      suitability.understands_capital_loss !==
      true
    ) {
      suitabilityMissingReasons.push(
        "Capital-loss acknowledgement has not been accepted.",
      );
    }

    if (
      suitability.understands_illiquidity !==
      true
    ) {
      suitabilityMissingReasons.push(
        "Illiquidity acknowledgement has not been accepted.",
      );
    }

    if (
      suitability.understands_long_holding_period !==
      true
    ) {
      suitabilityMissingReasons.push(
        "Long holding-period acknowledgement has not been accepted.",
      );
    }

    if (
      suitability.understands_no_guaranteed_return !==
      true
    ) {
      suitabilityMissingReasons.push(
        "No-guaranteed-return acknowledgement has not been accepted.",
      );
    }
  }

  /*
   * --------------------------------------------------
   * 10. TAX COMPLETENESS
   * --------------------------------------------------
   */
  const taxMissingReasons:
    string[] = [];

  if (!tax) {
    taxMissingReasons.push(
      "Tax & IRS certification has not been submitted.",
    );
  } else {
    if (!tax.tax_form_type) {
      taxMissingReasons.push(
        "Tax form type is missing.",
      );
    }

    if (!tax.tin_type) {
      taxMissingReasons.push(
        "TIN type is missing.",
      );
    }

    if (
      !tax.tin_last_four &&
      !tax.foreign_tin_last_four
    ) {
      taxMissingReasons.push(
        "Tax identification number has not been submitted.",
      );
    }

    if (
      tax.certification_accepted !==
      true
    ) {
      taxMissingReasons.push(
        "Electronic tax certification has not been accepted.",
      );
    }

    if (
      !tax.certification_name?.trim()
    ) {
      taxMissingReasons.push(
        "Electronic tax certification name is missing.",
      );
    }

    /*
     * Normalize the stored form type so
     * W-9, w9, W9 all work.
     */
    const normalizedTaxForm =
      tax.tax_form_type
        ?.replaceAll("-", "")
        .replaceAll("_", "")
        .toLowerCase();

    if (
      normalizedTaxForm === "w9" &&
      !tax.w9_document_path
    ) {
      taxMissingReasons.push(
        "W-9 document is missing.",
      );
    }

    if (
      normalizedTaxForm ===
        "w8ben" &&
      !tax.w8ben_document_path
    ) {
      taxMissingReasons.push(
        "W-8BEN document is missing.",
      );
    }
  }

  /*
   * --------------------------------------------------
   * 11. INVESTOR NAME
   * --------------------------------------------------
   */
  const investorName =
    [
      profile?.first_name,
      profile?.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "Investor";

  /*
   * --------------------------------------------------
   * 12. BUILD ALL SIX REVIEW SECTIONS
   * --------------------------------------------------
   *
   * IMPORTANT:
   * Each section contains all fields expected by
   * FinalReviewForm and ReviewSectionCard.
   */
  const sections = [
    /*
     * PERSONAL PROFILE
     */
    {
      id:
        "profile",

      key:
        "profile",

      title:
        "Personal Information",

      description:
        "Review your personal and contact information.",

      href:
        "/dashboard/onboarding/profile",

      completed:
        Boolean(
          onboarding?.profile_completed,
        ) &&
        profileMissingReasons.length ===
          0,

      status:
        onboarding?.profile_completed
          ? "completed"
          : "incomplete",

      missingReasons:
        profileMissingReasons,

      details: [
        {
          label:
            "Name",

          value:
            investorName,
        },

        {
          label:
            "Date of birth",

          value:
            profile?.date_of_birth ??
            "—",
        },

        {
          label:
            "Nationality",

          value:
            displayValue(
              profile?.nationality,
            ),
        },

        {
          label:
            "Profession",

          value:
            profile?.profession ??
            "—",
        },

        {
          label:
            "Country",

          value:
            displayValue(
              profile?.country,
            ),
        },

        {
          label:
            "Phone",

          value:
            profile?.phone ??
            "—",
        },
      ],
    },

    /*
     * IDENTITY
     */
    {
      id:
        "identity",

      key:
        "identity",

      title:
        "Identity Verification",

      description:
        "Review your identity details and submitted verification documents.",

      href:
        "/dashboard/onboarding/identity",

      completed:
        Boolean(
          onboarding?.identity_completed,
        ) &&
        identityMissingReasons.length ===
          0,

      status:
        kyc?.verification_status ??
        kyc?.status ??
        null,

      missingReasons:
        identityMissingReasons,

      details: [
        {
          label:
            "Legal name",

          value:
            [
              kyc?.legal_first_name,
              kyc?.legal_middle_name,
              kyc?.legal_last_name,
            ]
              .filter(Boolean)
              .join(" ") ||
            "—",
        },

        {
          label:
            "Date of birth",

          value:
            kyc?.date_of_birth ??
            "—",
        },

        {
          label:
            "Nationality",

          value:
            displayValue(
              kyc?.nationality,
            ),
        },

        {
          label:
            "Driver's license",

          value:
            kyc?.drivers_license_last_four
              ? `••••${kyc.drivers_license_last_four}`
              : "—",
        },

        {
          label:
            "SSN",

          value:
            kyc?.ssn_last_four
              ? `•••-••-${kyc.ssn_last_four}`
              : "—",
        },

        {
          label:
            "Documents",

          value:
            identityMissingReasons.length ===
            0
              ? "All required documents uploaded"
              : "Documents require attention",
        },
      ],
    },

    /*
     * ADDRESS
     */
    {
      id:
        "address",

      key:
        "address",

      title:
        "Address Verification",

      description:
        "Review your residential address and proof-of-address document.",

      href:
        "/dashboard/onboarding/address",

      completed:
        Boolean(
          onboarding?.address_completed,
        ) &&
        addressMissingReasons.length ===
          0,

      status:
        address?.status ??
        null,

      missingReasons:
        addressMissingReasons,

      details: [
        {
          label:
            "Address",

          value:
            address?.address_line_1 ??
            "—",
        },

        {
          label:
            "City",

          value:
            address?.city ??
            "—",
        },

        {
          label:
            "State / region",

          value:
            address?.state_region ??
            "—",
        },

        {
          label:
            "Postal code",

          value:
            address?.postal_code ??
            "—",
        },

        {
          label:
            "Country",

          value:
            displayValue(
              address?.country,
            ),
        },

        {
          label:
            "Proof document",

          value:
            address?.proof_document_path
              ? displayValue(
                  address.proof_document_type,
                )
              : "Missing",
        },
      ],
    },

    /*
     * ELIGIBILITY
     */
    {
      id:
        "eligibility",

      key:
        "eligibility",

      title:
        "Investor Eligibility",

      description:
        "Review your investor classification, financial profile and source-of-funds information.",

      href:
        "/dashboard/onboarding/eligibility",

      completed:
        Boolean(
          onboarding?.eligibility_completed,
        ) &&
        eligibilityMissingReasons.length ===
          0,

      status:
        eligibility?.status ??
        null,

      missingReasons:
        eligibilityMissingReasons,

      details: [
        {
          label:
            "Investor type",

          value:
            displayValue(
              eligibility?.investor_type,
            ),
        },

        {
          label:
            "Employment",

          value:
            displayValue(
              eligibility?.employment_status,
            ),
        },

        {
          label:
            "Annual income",

          value:
            displayValue(
              eligibility?.annual_income_band,
            ),
        },

        {
          label:
            "Net worth",

          value:
            displayValue(
              eligibility?.net_worth_band,
            ),
        },

        {
          label:
            "Investment experience",

          value:
            displayValue(
              eligibility?.investment_experience,
            ),
        },

        {
          label:
            "Source of funds",

          value:
            displayValue(
              eligibility?.source_of_funds,
            ),
        },
      ],
    },

    /*
     * SUITABILITY
     */
    {
      id:
        "suitability",

      key:
        "suitability",

      title:
        "Suitability Assessment",

      description:
        "Review your investment objectives, risk profile, liquidity needs and acknowledgements.",

      href:
        "/dashboard/onboarding/suitability",

      completed:
        Boolean(
          onboarding?.suitability_completed,
        ) &&
        suitabilityMissingReasons.length ===
          0,

      status:
        suitability?.status ??
        null,

      missingReasons:
        suitabilityMissingReasons,

      details: [
        {
          label:
            "Objective",

          value:
            displayValue(
              suitability?.investment_objective,
            ),
        },

        {
          label:
            "Investment horizon",

          value:
            displayValue(
              suitability?.investment_horizon,
            ),
        },

        {
          label:
            "Liquidity needs",

          value:
            displayValue(
              suitability?.liquidity_needs,
            ),
        },

        {
          label:
            "Risk tolerance",

          value:
            displayValue(
              suitability?.risk_tolerance,
            ),
        },

        {
          label:
            "Capital-loss acknowledgement",

          value:
            suitability?.understands_capital_loss
              ? "Accepted"
              : "Missing",
        },

        {
          label:
            "Illiquidity acknowledgement",

          value:
            suitability?.understands_illiquidity
              ? "Accepted"
              : "Missing",
        },
      ],
    },

    /*
     * TAX
     */
    {
      id:
        "tax",

      key:
        "tax",

      title:
        "Tax & IRS Certification",

      description:
        "Review your tax classification, TIN information and tax-document certification.",

      href:
        "/dashboard/onboarding/tax",

      completed:
        Boolean(
          onboarding?.tax_completed,
        ) &&
        taxMissingReasons.length ===
          0,

      status:
        tax?.status ??
        null,

      missingReasons:
        taxMissingReasons,

      details: [
        {
          label:
            "Tax form",

          value:
            displayValue(
              tax?.tax_form_type,
            ),
        },

        {
          label:
            "Taxpayer name",

          value:
            tax?.taxpayer_name ??
            "—",
        },

        {
          label:
            "Tax residence",

          value:
            displayValue(
              tax?.tax_residency_country,
            ),
        },

        {
          label:
            "TIN type",

          value:
            displayValue(
              tax?.tin_type,
            ),
        },

        {
          label:
            "TIN ending",

          value:
            tax?.tin_last_four
              ? `••••${tax.tin_last_four}`
              : tax?.foreign_tin_last_four
                ? `••••${tax.foreign_tin_last_four}`
                : "—",
        },

        {
          label:
            "Certification",

          value:
            tax?.certification_accepted
              ? "Accepted"
              : "Missing",
        },
      ],
    },
  ];

  /*
   * --------------------------------------------------
   * 13. COMPLETION COUNTS
   * --------------------------------------------------
   */
  const completedCount =
    sections.filter(
      (section) =>
        section.completed,
    ).length;

  const incompleteSections =
    sections.filter(
      (section) =>
        !section.completed,
    );

  /*
   * --------------------------------------------------
   * 14. RENDER
   * --------------------------------------------------
   */
  return (
    <div>
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Step 7
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          Review & submit
        </h1>

        <p className="mt-5 max-w-3xl text-sm leading-7 text-stone-600">
          Review your investor information before
          submitting the complete onboarding package
          for compliance review.
        </p>
      </div>

      <FinalReviewForm
        investorName={
          investorName
        }
        sections={
          sections
        }
        completedCount={
          completedCount
        }
        incompleteSections={
          incompleteSections
        }
        alreadySubmitted={
          Boolean(
            onboarding?.submitted_at,
          )
        }
        submittedAt={
          onboarding?.submitted_at
        }
        onboardingStatus={
          onboardingStatus
        }
      />
    </div>
  );
}