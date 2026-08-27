import {
  NextResponse,
} from "next/server";

import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

import {
  sendMail,
} from "@/src/lib/email/mailer";

import {
  recordComplianceAudit,
} from "@/src/lib/compliance/audit";

import {
  verificationApprovedEmail,
} from "@/src/lib/email/templates";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export async function POST(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  try {
    /*
     * 1. Authenticate current admin.
     */
    const supabase =
      await createClient();

    const {
      data: claimsData,
    } =
      await supabase.auth.getClaims();

    const adminUserId =
      claimsData?.claims?.sub;

    if (!adminUserId) {
      return NextResponse.json(
        {
          error:
            "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * 2. Verify current user's role.
     */
    const {
      data: adminProfile,
      error: adminProfileError,
    } = await supabase
      .from("profiles")
      .select(
        `
        id,
        role
        `,
      )
      .eq(
        "id",
        adminUserId,
      )
      .maybeSingle();

    if (
      adminProfileError ||
      !adminProfile
    ) {
      return NextResponse.json(
        {
          error:
            "Unable to verify administrator.",
        },
        {
          status: 403,
        },
      );
    }

    if (
      adminProfile.role !==
        "admin" &&
      adminProfile.role !==
        "super_admin"
    ) {
      return NextResponse.json(
        {
          error:
            "Administrator access required.",
        },
        {
          status: 403,
        },
      );
    }

    const {
      userId,
    } = await params;

    const admin =
      createAdminClient();

    /*
     * 3. Load investor.
     */
    /*
 * Load investor profile.
 *
 * Email is NOT stored in public.profiles,
 * so we load the profile first and then
 * retrieve the email from Supabase Auth.
 */
const {
  data: investor,
  error: investorLoadError,
} = await admin
  .from("profiles")
  .select(
    `
    id,
    first_name,
    last_name,
    onboarding_status
    `,
  )
  .eq(
    "id",
    userId,
  )
  .maybeSingle();

if (
  investorLoadError ||
  !investor
) {
  console.error(
    "Investor profile lookup error:",
    investorLoadError,
  );

  return NextResponse.json(
    {
      error:
        "Investor could not be found.",
    },
    {
      status: 404,
    },
  );
}

/*
 * Retrieve investor email from
 * Supabase Authentication.
 */
const {
  data: authInvestorData,
  error: authInvestorError,
} =
  await admin.auth.admin.getUserById(
    userId,
  );

if (
  authInvestorError ||
  !authInvestorData.user
) {
  console.error(
    "Investor Auth lookup error:",
    authInvestorError,
  );

  return NextResponse.json(
    {
      error:
        "Unable to load investor authentication record.",
    },
    {
      status: 500,
    },
  );
}

const investorEmail =
  authInvestorData.user.email;

    /*
     * 4. Make sure a compliance
     * submission exists.
     */
    const {
      data: review,
      error: reviewError,
    } = await admin
      .from(
        "compliance_reviews",
      )
      .select(
        `
        id,
        status
        `,
      )
      .eq(
        "user_id",
        userId,
      )
      .maybeSingle();

    if (
      reviewError ||
      !review
    ) {
      return NextResponse.json(
        {
          error:
            "Compliance submission does not exist.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      review.status ===
      "approved"
    ) {
      return NextResponse.json({
        success: true,
        alreadyApproved:
          true,
      });
    }

    const now =
      new Date().toISOString();

    /*
     * 5. Update Identity.
     */
    const {
      error: kycError,
    } = await admin
      .from(
        "investor_kyc",
      )
      .update({
        status:
          "verified",

        verification_status:
          "verified",

        rejection_reason:
          null,

        reviewed_at:
          now,

        updated_at:
          now,
      })
      .eq(
        "user_id",
        userId,
      );

    if (kycError) {
      console.error(
        "KYC approval error:",
        kycError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to approve identity verification.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 6. Update Address.
     */
    const {
      error: addressError,
    } = await admin
      .from(
        "investor_address_verification",
      )
      .update({
        status:
          "verified",

        rejection_reason:
          null,

        reviewed_at:
          now,

        updated_at:
          now,
      })
      .eq(
        "user_id",
        userId,
      );

    if (addressError) {
      console.error(
        "Address approval error:",
        addressError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to approve address verification.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 7. Update Eligibility.
     */
    const {
      error:
        eligibilityError,
    } = await admin
      .from(
        "investor_eligibility",
      )
      .update({
        status:
          "eligible",

        rejection_reason:
          null,

        reviewed_at:
          now,

        updated_at:
          now,
      })
      .eq(
        "user_id",
        userId,
      );

    if (
      eligibilityError
    ) {
      console.error(
        "Eligibility approval error:",
        eligibilityError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to approve eligibility.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 8. Update Suitability.
     */
    const {
      error:
        suitabilityError,
    } = await admin
      .from(
        "investor_suitability",
      )
      .update({
        status:
          "suitable",

        rejection_reason:
          null,

        reviewed_at:
          now,

        updated_at:
          now,
      })
      .eq(
        "user_id",
        userId,
      );

    if (
      suitabilityError
    ) {
      console.error(
        "Suitability approval error:",
        suitabilityError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to approve suitability.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 9. Update Tax.
     */
    const {
      error: taxError,
    } = await admin
      .from(
        "investor_tax_profiles",
      )
      .update({
        status:
          "verified",

        rejection_reason:
          null,

        reviewed_at:
          now,

        updated_at:
          now,
      })
      .eq(
        "user_id",
        userId,
      );

    if (taxError) {
      console.error(
        "Tax approval error:",
        taxError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to approve tax verification.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 10. Update investor profile.
     */
    const {
      error: profileError,
    } = await admin
      .from("profiles")
      .update({
        onboarding_status:
          "approved",

        kyc_status:
          "verified",

        eligibility_status:
          "eligible",

        suitability_status:
          "suitable",

        tax_status:
          "verified",

        updated_at:
          now,
      })
      .eq(
        "id",
        userId,
      );

    if (profileError) {
      console.error(
        "Profile approval error:",
        profileError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to update investor account status.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 11. Complete compliance review.
     */
    const {
      error:
        complianceUpdateError,
    } = await admin
      .from(
        "compliance_reviews",
      )
      .update({
        status:
          "approved",

        assigned_admin_id:
          adminUserId,

        reviewed_at:
          now,

        updated_at:
          now,

        rejection_reason:
          null,
      })
      .eq(
        "user_id",
        userId,
      );

    if (
      complianceUpdateError
    ) {
      console.error(
        "Compliance approval error:",
        complianceUpdateError,
      );

      return NextResponse.json(
        {
          error:
            "Investor records were approved, but compliance review could not be completed.",
        },
        {
          status: 500,
        },
      );
    }

        /*
    * Record successful investor approval.
    *
    * This must happen AFTER the database
    * approval succeeds.
    */
    await recordComplianceAudit({
      actorUserId:
        adminUserId,

      investorUserId:
        userId,

      action:
        "investor_approved",

      metadata: {
        previousStatus:
          review.status,

        newStatus:
          "approved",
      },
    });

    /*
     * 12. Send investor approval email.
     *
     * Email failure must NOT undo
     * the successful approval.
     */
    const investorName =
      [
        investor.first_name,
        investor.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      "Investor";

    if (
      investorEmail
    ) {
      const email =
        verificationApprovedEmail({
          investorName,
        });

      try {
            await sendMail({
        to:
            investorEmail,

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
          "Investor approval email error:",
          emailError,
        );
      }
    } else {
      console.error(
        "Investor has no email address for approval notification.",
      );
    }

    /*
     * 13. Success.
     */
    return NextResponse.json({
      success: true,

      status:
        "approved",
    });
  } catch (error) {
    console.error(
      "Investor approval API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while approving the investor.",
      },
      {
        status: 500,
      },
    );
  }
}