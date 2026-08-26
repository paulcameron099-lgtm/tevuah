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

type ProfilePayload = {
  firstName: string;
  lastName: string;

  phone?: string;

  dateOfBirth: string;
  nationality: string;

  profession?: string;

  country: string;
  city: string;
  state?: string;
  postalCode: string;
};

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
    "profile",
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
     * 2. Parse payload.
     */
    const body =
      (await request.json()) as ProfilePayload;

    const firstName =
      body.firstName?.trim();

    const lastName =
      body.lastName?.trim();

    const phone =
      body.phone?.trim() ||
      null;

    const nationality =
      body.nationality?.trim();

    const profession =
      body.profession?.trim() ||
      null;

    const country =
      body.country?.trim();

    const city =
      body.city?.trim();

    const state =
      body.state?.trim() ||
      null;

    const postalCode =
      body.postalCode?.trim();

    /*
     * 3. Validate.
     */
    if (!firstName) {
      return NextResponse.json(
        {
          error:
            "First name is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!lastName) {
      return NextResponse.json(
        {
          error:
            "Last name is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!body.dateOfBirth) {
      return NextResponse.json(
        {
          error:
            "Date of birth is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!nationality) {
      return NextResponse.json(
        {
          error:
            "Nationality is required.",
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

    const admin =
      createAdminClient();

    const now =
      new Date().toISOString();

    /*
     * 4. Update investor profile.
     */
    const {
      error: profileError,
    } = await admin
      .from("profiles")
      .update({
        first_name:
          firstName,

        last_name:
          lastName,

        phone,

        date_of_birth:
          body.dateOfBirth,

        nationality,

        profession,

        country,

        city,

        state,

        postal_code:
          postalCode,

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
        "Profile onboarding save error:",
        profileError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to save your investor profile.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 5. Mark Step 1 complete.
     */
const {
  data: existingOnboarding,
} = await admin
  .from(
    "investor_onboarding",
  )
  .select(
    `
    identity_completed,
    address_completed,
    eligibility_completed,
    suitability_completed,
    tax_completed
    `,
  )
  .eq(
    "user_id",
    userId,
  )
  .maybeSingle();

let nextStep =
  "identity";

if (
  existingOnboarding?.tax_completed
) {
  nextStep =
    "review";
} else if (
  existingOnboarding?.suitability_completed
) {
  nextStep =
    "tax";
} else if (
  existingOnboarding?.eligibility_completed
) {
  nextStep =
    "suitability";
} else if (
  existingOnboarding?.address_completed
) {
  nextStep =
    "eligibility";
} else if (
  existingOnboarding?.identity_completed
) {
  nextStep =
    "address";
}

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

      profile_completed:
        true,

      current_step:
        nextStep,

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
        "Profile onboarding progress error:",
        onboardingError,
      );

      return NextResponse.json(
        {
          error:
            "Profile was saved, but onboarding progress could not be updated.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,

        next:
        `/dashboard/onboarding/${nextStep}`,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Profile onboarding submission error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while saving your investor profile.",
      },
      {
        status: 500,
      },
    );
  }
}