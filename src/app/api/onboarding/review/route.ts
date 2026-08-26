// src/app/api/onboarding/review/route.ts

import {
  NextResponse,
  type NextRequest,
} from "next/server";

import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

import { sendMail } from "@/src/lib/mail/mailer";

import {
  verificationSubmittedEmail,
} from "@/src/lib/mail/templates";
import {
  checkAccountAccess,
} from "@/src/lib/auth/account-status";

type ReviewSubmissionPayload = {
  accuracyConfirmed: boolean;

  informationCurrentConfirmed: boolean;

  riskAcknowledged: boolean;

  electronicSignature: string;
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
     * 2. Parse final declarations.
     */
    const body =
      (await request.json()) as ReviewSubmissionPayload;

    const electronicSignature =
      body.electronicSignature
        ?.trim();

    if (
      !body.accuracyConfirmed
    ) {
      return NextResponse.json(
        {
          error:
            "You must confirm that the information provided is accurate.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !body.informationCurrentConfirmed
    ) {
      return NextResponse.json(
        {
          error:
            "You must confirm that your information is current and complete.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !body.riskAcknowledged
    ) {
      return NextResponse.json(
        {
          error:
            "You must acknowledge the investment and compliance declarations.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !electronicSignature
    ) {
      return NextResponse.json(
        {
          error:
            "Enter your full legal name as your electronic signature.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 3. Privileged server client.
     */
    const admin =
      createAdminClient();

    /*
     * 4. Load investor profile for
     * compliance notification email.
     */
const {
  data: profile,
  error: profileLoadError,
} = await admin
  .from("profiles")
  .select(
    `
    first_name,
    last_name
    `,
  )
  .eq("id", userId)
  .maybeSingle();

if (
  profileLoadError ||
  !profile
) {
  console.error(
    "Investor profile load error:",
    profileLoadError,
  );

  return NextResponse.json(
    {
      error:
        "Unable to load investor profile.",
    },
    {
      status: 500,
    },
  );
}

const {
  data: authUserData,
  error: authUserError,
} =
  await admin.auth.admin.getUserById(
    userId,
  );

if (
  authUserError ||
  !authUserData.user
) {
  console.error(
    "Investor auth user load error:",
    authUserError,
  );

  return NextResponse.json(
    {
      error:
        "Unable to load investor email.",
    },
    {
      status: 500,
    },
  );
}

const investorEmail =
  authUserData.user.email;

if (!investorEmail) {
  return NextResponse.json(
    {
      error:
        "Investor email address is missing.",
    },
    {
      status: 500,
    },
  );
}

const investorName =
  [
    profile.first_name,
    profile.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() ||
  "Investor";

    if (
      profileLoadError ||
      !profile
    ) {
      console.error(
        "Investor profile load error:",
        profileLoadError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to load investor profile.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 5. Build investor display name.
     */

    /*
     * 6. Load onboarding progress.
     */
    const {
      data: onboarding,
      error: onboardingLoadError,
    } = await admin
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
        submitted_at
        `,
      )
      .eq(
        "user_id",
        userId,
      )
      .maybeSingle();

    if (
      onboardingLoadError ||
      !onboarding
    ) {
      console.error(
        "Onboarding load error:",
        onboardingLoadError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to load your onboarding progress.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 7. Verify all required steps
     * are complete.
     */
    const incompleteSteps: string[] =
      [];

    if (
      !onboarding.profile_completed
    ) {
      incompleteSteps.push(
        "Personal Profile",
      );
    }

    if (
      !onboarding.identity_completed
    ) {
      incompleteSteps.push(
        "Identity Verification",
      );
    }

    if (
      !onboarding.address_completed
    ) {
      incompleteSteps.push(
        "Address Verification",
      );
    }

    if (
      !onboarding.eligibility_completed
    ) {
      incompleteSteps.push(
        "Investor Eligibility",
      );
    }

    if (
      !onboarding.suitability_completed
    ) {
      incompleteSteps.push(
        "Suitability Assessment",
      );
    }

    if (
      !onboarding.tax_completed
    ) {
      incompleteSteps.push(
        "Tax & IRS Certification",
      );
    }

    if (
      incompleteSteps.length >
      0
    ) {
      return NextResponse.json(
        {
          error:
            `Complete the following sections before final submission: ${incompleteSteps.join(
              ", ",
            )}.`,
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 8. Verify underlying records exist.
     */
    const [
      kycResult,
      addressResult,
      eligibilityResult,
      suitabilityResult,
      taxResult,
    ] = await Promise.all([
      admin
        .from("investor_kyc")
        .select(
          "user_id, status",
        )
        .eq(
          "user_id",
          userId,
        )
        .maybeSingle(),

      admin
        .from(
          "investor_address_verification",
        )
        .select(
          "user_id, status",
        )
        .eq(
          "user_id",
          userId,
        )
        .maybeSingle(),

      admin
        .from(
          "investor_eligibility",
        )
        .select(
          "user_id, status",
        )
        .eq(
          "user_id",
          userId,
        )
        .maybeSingle(),

      admin
        .from(
          "investor_suitability",
        )
        .select(
          "user_id, status",
        )
        .eq(
          "user_id",
          userId,
        )
        .maybeSingle(),

      admin
        .from(
          "investor_tax_profiles",
        )
        .select(
          `
          user_id,
          status,
          tax_form_type,
          w9_document_path,
          w8ben_document_path
          `,
        )
        .eq(
          "user_id",
          userId,
        )
        .maybeSingle(),
    ]);

    if (
      !kycResult.data
    ) {
      return NextResponse.json(
        {
          error:
            "Identity verification record is missing.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !addressResult.data
    ) {
      return NextResponse.json(
        {
          error:
            "Address verification record is missing.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !eligibilityResult.data
    ) {
      return NextResponse.json(
        {
          error:
            "Investor eligibility record is missing.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !suitabilityResult.data
    ) {
      return NextResponse.json(
        {
          error:
            "Suitability assessment record is missing.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !taxResult.data
    ) {
      return NextResponse.json(
        {
          error:
            "Tax certification record is missing.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 9. Verify tax document exists.
     */
    if (
      taxResult.data
        .tax_form_type ===
        "W-9" &&
      !taxResult.data
        .w9_document_path
    ) {
      return NextResponse.json(
        {
          error:
            "Your W-9 document is missing. Return to Tax & IRS Certification and upload it before final submission.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      taxResult.data
        .tax_form_type ===
        "W-8BEN" &&
      !taxResult.data
        .w8ben_document_path
    ) {
      return NextResponse.json(
        {
          error:
            "Your W-8BEN document is missing. Return to Tax & IRS Certification and upload it before final submission.",
        },
        {
          status: 400,
        },
      );
    }

    const now =
      new Date().toISOString();

    /*
     * 10. Save final declarations and
     * formally submit onboarding.
     */
    const {
      error:
        finalOnboardingError,
    } = await admin
      .from(
        "investor_onboarding",
      )
      .update({
        final_accuracy_confirmed:
          true,

        final_information_current_confirmed:
          true,

        final_risk_acknowledged:
          true,

        final_electronic_signature:
          electronicSignature,

        final_declaration_at:
          now,

        current_step:
          "review",

        submitted_at:
          now,

        updated_at:
          now,

       is_locked:
          true,

        locked_at:
          now,

        editable_sections:
          [],

        unlock_reason:
          null,

        unlocked_at:
          null,

        unlocked_by_admin_id:
          null,

        action_required_at:
          null,

        action_required_by_admin_id:
          null,
      })
      .eq(
        "user_id",
        userId,
      );

    if (
      finalOnboardingError
    ) {
      console.error(
        "Final onboarding submission error:",
        finalOnboardingError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to submit your onboarding package.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 11. Update investor account status.
     */
    const {
      error: profileError,
    } = await admin
      .from("profiles")
      .update({
        onboarding_status:
          "under_review",

        updated_at:
          now,
      })
      .eq(
        "id",
        userId,
      );

    if (profileError) {
      console.error(
        "Final profile status error:",
        profileError,
      );

      return NextResponse.json(
        {
          error:
            "Onboarding was submitted, but account status could not be updated.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 12. Add/update investor in
     * compliance review queue.
     */
    const {
      error: complianceError,
    } = await admin
      .from(
        "compliance_reviews",
      )
      .upsert(
        {
          user_id:
            userId,

          review_type:
            "investor_onboarding",

          status:
            "pending",

          submitted_at:
            now,

          updated_at:
            now,

          assigned_admin_id:
            null,

          admin_notes:
            null,

          rejection_reason:
            null,

          review_started_at:
            null,

          reviewed_at:
            null,
        },
        {
          onConflict:
            "user_id",
        },
      );

    if (
      complianceError
    ) {
      console.error(
        "Compliance queue error:",
        complianceError,
      );

      return NextResponse.json(
        {
          error:
            "Onboarding was submitted, but the compliance review could not be created.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 13. Send compliance notification
     * email AFTER database submission
     * succeeds.
     *
     * Email failure must NOT undo or
     * invalidate the onboarding submission.
     */
    const complianceEmail =
      process.env.COMPLIANCE_EMAIL;

    if (
      !complianceEmail
    ) {
      console.error(
        "COMPLIANCE_EMAIL is missing.",
      );
    } else {
      const email =
        verificationSubmittedEmail({
          investorName,

          investorEmail,

          submittedAt:
            new Date(
              now,
            ).toLocaleString(
              "en-US",
              {
                dateStyle:
                  "medium",

                timeStyle:
                  "short",
              },
            ),
        });

      try {
        await sendMail({
          to:
            complianceEmail,

          subject:
            email.subject,

          text:
            email.text,

          html:
            email.html,
        });
      } catch (
        emailError
      ) {
        console.error(
          "Compliance submission email error:",
          emailError,
        );
      }
    }

    /*
     * 14. Success.
     */
    return NextResponse.json(
      {
        success: true,

        status:
          "under_review",

        next:
          "/dashboard",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Final onboarding review error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while submitting your onboarding package.",
      },
      {
        status: 500,
      },
    );
  }
}