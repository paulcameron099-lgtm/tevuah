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
  decryptSensitiveValue,
  encryptSensitiveValue,
} from "@/src/lib/security/encryption";
import {
  checkAccountAccess,
} from "@/src/lib/auth/account-status";

type KycPayload = {
  legalFirstName: string;
  legalMiddleName?: string;
  legalLastName: string;

  dateOfBirth: string;
  nationality: string;

  driversLicenseNumber: string;
  driversLicenseFrontPath: string;
  driversLicenseBackPath: string;

  ssn: string;
  ssnFrontPath: string;
  ssnBackPath: string;
};

function normalizeSsn(value: string) {
  return value.replace(/\D/g, "");
}

export async function POST(
  request: NextRequest,
) {
  try {
    /*
     * 1. Verify the signed-in investor using
     * the normal SSR client.
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
    "identity",
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
     * 2. Read submitted values.
     */
    const body =
      (await request.json()) as KycPayload;

    const ssn = normalizeSsn(
      body.ssn ?? "",
    );

    const driversLicenseNumber =
      body.driversLicenseNumber
        ?.trim()
        .toUpperCase();

    /*
     * 3. Validate.
     */
    if (ssn.length !== 9) {
      return NextResponse.json(
        {
          error:
            "SSN must contain exactly 9 digits.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !driversLicenseNumber ||
      driversLicenseNumber.length < 4 ||
      driversLicenseNumber.length > 30
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid driver's license number.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !body.legalFirstName?.trim() ||
      !body.legalLastName?.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Legal first and last name are required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !body.driversLicenseFrontPath ||
      !body.driversLicenseBackPath ||
      !body.ssnFrontPath ||
      !body.ssnBackPath
    ) {
      return NextResponse.json(
        {
          error:
            "All required verification documents must be uploaded.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 4. Make sure every submitted object path
     * belongs to this user.
     */
    const requiredPrefix =
      `${userId}/`;

    const paths = [
      body.driversLicenseFrontPath,
      body.driversLicenseBackPath,
      body.ssnFrontPath,
      body.ssnBackPath,
    ];

    if (
      paths.some(
        (path) =>
          !path.startsWith(
            requiredPrefix,
          ),
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid verification document path.",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * 5. Encrypt the full identifiers.
     */
    const encryptedSsn =
      encryptSensitiveValue(ssn);

      const ssnRoundTrip =
    decryptSensitiveValue(
      encryptedSsn,
    );

    const encryptedDl =
      encryptSensitiveValue(
        driversLicenseNumber,
      );

      

    const admin =
      createAdminClient();

    /*
     * 6. Store encrypted full identifiers
     * outside the public schema.
     */

    const {
  error: sensitiveError,
} = await admin.rpc(
  "save_sensitive_identity",
  {
    p_user_id: userId,

    p_ssn_ciphertext:
      encryptedSsn.ciphertext,

    p_ssn_iv:
      encryptedSsn.iv,

    p_ssn_auth_tag:
      encryptedSsn.authTag,

    p_drivers_license_ciphertext:
      encryptedDl.ciphertext,

    p_drivers_license_iv:
      encryptedDl.iv,

    p_drivers_license_auth_tag:
      encryptedDl.authTag,
  },
);


    if (sensitiveError) {
      console.error(
        "Sensitive KYC save error:",
        sensitiveError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to securely save identity information.",
        },
        {
          status: 500,
        },
      );
    }

    const {
  data: storedIdentityRows,
  error: storedIdentityError,
} = await admin.rpc(
  "get_sensitive_identity_for_admin",
  {
    p_user_id:
      userId,
  },
);

if (storedIdentityError) {
  console.error(
    "Identity database reload error:",
    storedIdentityError,
  );
} else {
  const storedIdentity =
    storedIdentityRows?.[0];

  if (
    storedIdentity?.ssn_ciphertext &&
    storedIdentity?.ssn_iv &&
    storedIdentity?.ssn_auth_tag
  ) {
    try {
      const ssnAfterDatabase =
        decryptSensitiveValue({
          ciphertext:
            storedIdentity.ssn_ciphertext,

          iv:
            storedIdentity.ssn_iv,

          authTag:
            storedIdentity.ssn_auth_tag,
        });
    } catch (error) {
      console.error(
        "SSN AFTER DATABASE DECRYPT FAILED:",
        error,
      );
    }
  }

  if (
    storedIdentity?.drivers_license_ciphertext &&
    storedIdentity?.drivers_license_iv &&
    storedIdentity?.drivers_license_auth_tag
  ) {
    try {
      const dlAfterDatabase =
        decryptSensitiveValue({
          ciphertext:
            storedIdentity.drivers_license_ciphertext,

          iv:
            storedIdentity.drivers_license_iv,

          authTag:
            storedIdentity.drivers_license_auth_tag,
        });
    } catch (error) {
      console.error(
        "DL AFTER DATABASE DECRYPT FAILED:",
        error,
      );
    }
  }
}

    /*
     * 7. Store only masked/display information
     * and private Storage paths in public KYC.
     */
    const {
      error: kycError,
    } = await admin
      .from("investor_kyc")
      .upsert(
        {
          user_id: userId,

          legal_first_name:
            body.legalFirstName.trim(),

          legal_middle_name:
            body.legalMiddleName?.trim() ||
            null,

          legal_last_name:
            body.legalLastName.trim(),

          date_of_birth:
            body.dateOfBirth,

          nationality:
            body.nationality,

          document_type:
            "drivers_license",

          drivers_license_last_four:
            driversLicenseNumber.slice(-4),

          ssn_last_four:
            ssn.slice(-4),

          drivers_license_front_path:
            body.driversLicenseFrontPath,

          drivers_license_back_path:
            body.driversLicenseBackPath,

          ssn_front_path:
            body.ssnFrontPath,

          ssn_back_path:
            body.ssnBackPath,

          status:
            "under_review",

          verification_status:
            "under_review",

          submitted_at:
            new Date().toISOString(),

          rejection_reason:
            null,

          admin_notes:
            null,
        },
        {
          onConflict: "user_id",
        },
      );

    if (kycError) {
      console.error(
        "KYC metadata save error:",
        kycError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to submit KYC information.",
        },
        {
          status: 500,
        },
      );
    }

/*
 * 8. Update profile KYC status.
 */
const {
  error: profileUpdateError,
} = await admin
  .from("profiles")
  .update({
    kyc_status:
      "under_review",

    onboarding_status:
      "in_progress",

    updated_at:
      new Date().toISOString(),
  })
  .eq(
    "id",
    userId,
  );

if (profileUpdateError) {
  console.error(
    "Profile KYC status update error:",
    profileUpdateError,
  );

  return NextResponse.json(
    {
      error:
        "Identity verification was saved, but the profile status could not be updated.",
    },
    {
      status: 500,
    },
  );
}

/*
 * 9. Mark Identity onboarding step
 * as completed.
 */
const {
  error: onboardingUpdateError,
} = await admin
  .from(
    "investor_onboarding",
  )
  .upsert(
    {
      user_id:
        userId,

      identity_completed:
        true,

      current_step:
        "address",

      updated_at:
        new Date().toISOString(),
    },
    {
      onConflict:
        "user_id",
    },
  );

if (onboardingUpdateError) {
  console.error(
    "Identity onboarding completion update error:",
    onboardingUpdateError,
  );

  return NextResponse.json(
    {
      error:
        "Identity verification was saved, but onboarding progress could not be updated.",
    },
    {
      status: 500,
    },
  );
}

return NextResponse.json({
  success: true,
});
  } catch (error) {
    console.error(
      "KYC submission error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while submitting your verification.",
      },
      {
        status: 500,
      },
    );
  }
}