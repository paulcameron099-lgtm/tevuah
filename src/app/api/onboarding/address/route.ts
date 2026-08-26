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

type AddressPayload = {
  addressLine1: string;
  addressLine2?: string;

  city: string;
  stateRegion?: string;
  postalCode: string;
  country: string;

  proofDocumentType: string;
  proofDocumentPath: string;
};

const allowedDocumentTypes = [
  "utility_bill",
  "bank_statement",
  "government_letter",
  "lease_agreement",
  "other",
];

export async function POST(
  request: NextRequest,
) {
  try {
    /*
     * 1. Verify the authenticated investor.
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
    "address",
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
     * 2. Read request body.
     */
    const body =
      (await request.json()) as AddressPayload;

    const addressLine1 =
      body.addressLine1?.trim();

    const addressLine2 =
      body.addressLine2?.trim() ||
      null;

    const city =
      body.city?.trim();

    const stateRegion =
      body.stateRegion?.trim() ||
      null;

    const postalCode =
      body.postalCode?.trim();

    const country =
      body.country?.trim();

    const proofDocumentType =
      body.proofDocumentType?.trim();

    const proofDocumentPath =
      body.proofDocumentPath?.trim();

    /*
     * 3. Validate required address fields.
     */
    if (!addressLine1) {
      return NextResponse.json(
        {
          error:
            "Address line 1 is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!city) {
      return NextResponse.json(
        {
          error:
            "City is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!postalCode) {
      return NextResponse.json(
        {
          error:
            "Postal code is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!country) {
      return NextResponse.json(
        {
          error:
            "Country is required.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 4. Validate proof-of-address type.
     */
    if (
      !proofDocumentType ||
      !allowedDocumentTypes.includes(
        proofDocumentType,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Select a valid proof-of-address document type.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 5. Validate proof-of-address upload.
     */
    if (!proofDocumentPath) {
      return NextResponse.json(
        {
          error:
            "Upload a proof-of-address document.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Expected Storage path:
     *
     * USER_ID/address/proof-of-address.pdf
     *
     * or:
     *
     * USER_ID/address/proof-of-address.jpg
     */
    const requiredPrefix =
      `${userId}/address/`;

    if (
      !proofDocumentPath.startsWith(
        requiredPrefix,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid proof-of-address document path.",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * 6. Create privileged server client.
     */
    const admin =
      createAdminClient();

    const now =
      new Date().toISOString();

    /*
     * 7. Save/update address verification record.
     */
    const {
      error: addressError,
    } = await admin
      .from(
        "investor_address_verification",
      )
      .upsert(
        {
          user_id:
            userId,

          address_line_1:
            addressLine1,

          address_line_2:
            addressLine2,

          city,

          state_region:
            stateRegion,

          postal_code:
            postalCode,

          country,

          proof_document_type:
            proofDocumentType,

          proof_document_path:
            proofDocumentPath,

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

    if (addressError) {
      console.error(
        "Address verification save error:",
        addressError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to save address verification.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 8. Synchronize the address into profiles.
     */
    const {
      error: profileError,
    } = await admin
      .from("profiles")
      .update({
        residential_address_line_1:
          addressLine1,

        residential_address_line_2:
          addressLine2,

        city,

        state:
          stateRegion,

        postal_code:
          postalCode,

        country,

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
        "Profile address update error:",
        profileError,
      );

      return NextResponse.json(
        {
          error:
            "Address verification was saved, but the investor profile could not be updated.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 9. Update onboarding progress.
     *
     * address_completed means the investor
     * submitted the address step.
     *
     * It does NOT mean the admin has approved it.
     */
    const {
      error: onboardingError,
    } = await admin
      .from("investor_onboarding")
      .upsert(
        {
          user_id:
            userId,

          address_completed:
            true,

          current_step:
            "eligibility",

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
        "Address onboarding progress error:",
        onboardingError,
      );

      return NextResponse.json(
        {
          error:
            "Address verification was saved, but onboarding progress could not be updated.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 10. Successful submission.
     */
    return NextResponse.json(
      {
        success: true,

        status:
          "under_review",

        next:
          "/dashboard/onboarding/eligibility",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Address verification submission error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while submitting address verification.",
      },
      {
        status: 500,
      },
    );
  }
}