import {
  redirect,
} from "next/navigation";

import { TaxCertificationForm } from "@/src/components/onboarding/tax-certification-form";
import { createClient } from "@/src/lib/supabase/server";

export default async function TaxOnboardingPage() {
  const supabase =
    await createClient();

  const {
    data: claimsData,
  } =
    await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;

  if (!userId) {
    redirect(
      "/login",
    );
  }

  const {
    data: tax,
    error,
  } = await supabase
    .from(
      "investor_tax_profiles",
    )
    .select(
      `
      is_us_citizen,

      taxpayer_name,

      tax_residency_country,

      country_of_citizenship,

      date_of_birth,

      tax_classification,

      tin_type,
      tin_last_four,

      foreign_tin_last_four,

      foreign_tax_id_not_required,

      permanent_address_line_1,
      permanent_address_line_2,

      permanent_city,
      permanent_state_region,
      permanent_postal_code,
      permanent_country,

      treaty_claimed,
      treaty_country,
      treaty_article,
      treaty_rate,
      treaty_income_type,

      exempt_payee_code,
      fatca_exemption_code,

      w9_document_path,
      w9_supporting_document_path,

      w8ben_document_path,
      w8ben_supporting_document_path,

      certification_name,

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
      "Tax profile load error:",
      error,
    );
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Step 6
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          Tax & IRS certification
        </h1>

        <p className="mt-5 max-w-3xl text-sm leading-7 text-stone-600">
          Establish your tax status, provide the
          applicable taxpayer identification
          information and upload your supporting
          tax certification.
        </p>
      </div>

      <TaxCertificationForm
        userId={
          userId
        }
        initialValues={{
          isUsPerson:
            tax?.is_us_citizen ??
            null,

          taxpayerName:
            tax?.taxpayer_name ??
            null,

          taxResidencyCountry:
            tax?.tax_residency_country ??
            null,

          countryOfCitizenship:
            tax?.country_of_citizenship ??
            null,

          dateOfBirth:
            tax?.date_of_birth ??
            null,

          taxClassification:
            tax?.tax_classification ??
            null,

          tinType:
            tax?.tin_type ??
            null,

          tinLastFour:
            tax?.tin_last_four ??
            null,

          foreignTinLastFour:
            tax?.foreign_tin_last_four ??
            null,

          foreignTaxIdNotRequired:
            tax?.foreign_tax_id_not_required ??
            false,

          permanentAddressLine1:
            tax?.permanent_address_line_1 ??
            null,

          permanentAddressLine2:
            tax?.permanent_address_line_2 ??
            null,

          permanentCity:
            tax?.permanent_city ??
            null,

          permanentStateRegion:
            tax?.permanent_state_region ??
            null,

          permanentPostalCode:
            tax?.permanent_postal_code ??
            null,

          permanentCountry:
            tax?.permanent_country ??
            null,

          treatyClaimed:
            tax?.treaty_claimed ??
            false,

          treatyCountry:
            tax?.treaty_country ??
            null,

          treatyArticle:
            tax?.treaty_article ??
            null,

          treatyRate:
            tax?.treaty_rate ??
            null,

          treatyIncomeType:
            tax?.treaty_income_type ??
            null,

          exemptPayeeCode:
            tax?.exempt_payee_code ??
            null,

          fatcaExemptionCode:
            tax?.fatca_exemption_code ??
            null,

          w9DocumentPath:
            tax?.w9_document_path ??
            null,

          w9SupportingDocumentPath:
            tax?.w9_supporting_document_path ??
            null,

          w8benDocumentPath:
            tax?.w8ben_document_path ??
            null,

          w8benSupportingDocumentPath:
            tax?.w8ben_supporting_document_path ??
            null,

          certificationName:
            tax?.certification_name ??
            null,

          status:
            tax?.status ??
            null,
        }}
      />
    </div>
  );
}