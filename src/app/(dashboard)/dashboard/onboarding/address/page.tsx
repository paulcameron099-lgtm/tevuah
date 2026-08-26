import { redirect } from "next/navigation";

import { AddressVerificationForm } from "@/src/components/onboarding/address-verification-form";
import { createClient } from "@/src/lib/supabase/server";

export default async function AddressVerificationPage() {
  const supabase =
    await createClient();

  const { data: claimsData } =
    await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;

  if (!userId) {
    redirect("/login");
  }

  const [
    profileResult,
    addressResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        `
        residential_address_line_1,
        residential_address_line_2,
        city,
        state,
        postal_code,
        country
        `,
      )
      .eq("id", userId)
      .maybeSingle(),

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
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const profile =
    profileResult.data;

  const address =
    addressResult.data;

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Step 3
        </p>

        <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950 sm:text-4xl">
          Address verification
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Confirm your current residential address
          and provide a supporting document.
        </p>
      </div>

      <AddressVerificationForm
        userId={userId}
        initialValues={{
          addressLine1:
            address?.address_line_1 ??
            profile?.residential_address_line_1 ??
            "",

          addressLine2:
            address?.address_line_2 ??
            profile?.residential_address_line_2 ??
            "",

          city:
            address?.city ??
            profile?.city ??
            "",

          stateRegion:
            address?.state_region ??
            profile?.state ??
            "",

          postalCode:
            address?.postal_code ??
            profile?.postal_code ??
            "",

          country:
            address?.country ??
            profile?.country ??
            "",

          proofDocumentType:
            address?.proof_document_type ??
            null,

          proofDocumentPath:
            address?.proof_document_path ??
            null,

          status:
            address?.status ??
            null,
        }}
      />
    </div>
  );
}