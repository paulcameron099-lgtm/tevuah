import { redirect } from "next/navigation";

import { KycForm } from "@/src/components/onboarding/kyc-form";
import { createClient } from "@/src/lib/supabase/server";

export default async function IdentityVerificationPage() {
  const supabase = await createClient();

  const { data: claimsData } =
    await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;

  if (!userId) {
    redirect("/login");
  }

  const [
    profileResult,
    kycResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        `
        first_name,
        last_name,
        date_of_birth,
        nationality
        `,
      )
      .eq("id", userId)
      .maybeSingle(),

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
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const profile =
    profileResult.data;

  const kyc =
    kycResult.data;

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Step 2
        </p>

        <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950 sm:text-4xl">
          Identity verification
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Provide the identity information and
          supporting documents required for
          compliance review.
        </p>
      </div>

      <KycForm
        userId={userId}
        initialValues={{
          legalFirstName:
            kyc?.legal_first_name ??
            profile?.first_name ??
            "",

          legalMiddleName:
            kyc?.legal_middle_name ??
            "",

          legalLastName:
            kyc?.legal_last_name ??
            profile?.last_name ??
            "",

          dateOfBirth:
            kyc?.date_of_birth ??
            profile?.date_of_birth ??
            "",

          nationality:
            kyc?.nationality ??
            profile?.nationality ??
            "",

          driversLicenseLastFour:
            kyc?.drivers_license_last_four ??
            null,

          ssnLastFour:
            kyc?.ssn_last_four ??
            null,

          driversLicenseFrontPath:
            kyc?.drivers_license_front_path ??
            null,

          driversLicenseBackPath:
            kyc?.drivers_license_back_path ??
            null,

          ssnFrontPath:
            kyc?.ssn_front_path ??
            null,

          ssnBackPath:
            kyc?.ssn_back_path ??
            null,

          status:
            kyc?.status ??
            null,

          verificationStatus:
            kyc?.verification_status ??
            null,
        }}
      />
    </div>
  );
}