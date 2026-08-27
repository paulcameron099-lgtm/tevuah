import {
  NextResponse,
} from "next/server";

import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

import {
  recordComplianceAudit,
} from "@/src/lib/compliance/audit";

import {
  sendMail,
} from "@/src/lib/email/mailer";

import {
  verificationActionRequiredEmail,
} from "@/src/lib/email/templates";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

type EditableSection =
  | "profile"
  | "identity"
  | "address"
  | "eligibility"
  | "suitability"
  | "tax";

type RequestPayload = {
  sections: EditableSection[];

  reason: string;
};

const ALLOWED_SECTIONS:
  EditableSection[] = [
    "profile",
    "identity",
    "address",
    "eligibility",
    "suitability",
    "tax",
  ];

export async function POST(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  try {
    /*
     * 1. Authenticate administrator.
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

    const admin =
      createAdminClient();

    /*
     * 2. Verify administrator role.
     */
    const {
      data: adminProfile,
      error:
        adminProfileError,
    } = await admin
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

    /*
     * 3. Target investor.
     */
    const {
      userId,
    } = await params;

    /*
     * 4. Validate request.
     */
    const body =
      (await request.json()) as RequestPayload;

    const reason =
      body.reason
        ?.trim();

    const sections =
      Array.from(
        new Set(
          body.sections ??
            [],
        ),
      );

    if (!reason) {
      return NextResponse.json(
        {
          error:
            "A reason for requesting additional information is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      sections.length ===
      0
    ) {
      return NextResponse.json(
        {
          error:
            "Select at least one onboarding section.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      sections.some(
        (section) =>
          !ALLOWED_SECTIONS.includes(
            section,
          ),
      )
    ) {
      return NextResponse.json(
        {
          error:
            "An invalid onboarding section was selected.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 5. Verify investor exists.
     */
    const {
      data: investor,
      error:
        investorError,
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
      investorError ||
      !investor
    ) {
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

    const now =
      new Date().toISOString();

    /*
     * 6. Selectively reopen sections.
     *
     * IMPORTANT:
     * is_locked remains TRUE.
     * editable_sections is the exception list.
     */
    const {
      error:
        onboardingError,
    } = await admin
      .from(
        "investor_onboarding",
      )
      .update({
        is_locked:
          true,

        editable_sections:
          sections,

        unlocked_at:
          now,

        unlocked_by_admin_id:
          adminUserId,

        unlock_reason:
          reason,

        action_required_at:
          now,

        action_required_by_admin_id:
          adminUserId,

        updated_at:
          now,
      })
      .eq(
        "user_id",
        userId,
      );

    if (
      onboardingError
    ) {
      console.error(
        "Selective onboarding unlock error:",
        onboardingError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to reopen the requested onboarding sections.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 7. Investor account status.
     */
    const {
      error: profileError,
    } = await admin
      .from("profiles")
      .update({
        onboarding_status:
          "action_required",

        updated_at:
          now,
      })
      .eq(
        "id",
        userId,
      );

    if (profileError) {
      console.error(
        "Action-required profile update error:",
        profileError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to update investor status.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 8. Compliance status.
     */
    const {
      error:
        complianceError,
    } = await admin
      .from(
        "compliance_reviews",
      )
      .update({
        status:
          "action_required",

        action_required_reason:
          reason,

        assigned_admin_id:
          adminUserId,

        updated_at:
          now,
      })
      .eq(
        "user_id",
        userId,
      );

    if (
      complianceError
    ) {
      console.error(
        "Compliance action-required error:",
        complianceError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to update compliance review.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 9. Audit.
     */
    await recordComplianceAudit({
      actorUserId:
        adminUserId,

      investorUserId:
        userId,

      action:
        "information_requested",

      metadata: {
        sections,

        reason,
      },
    });

    /*
     * 10. Get investor Auth email.
     */
    const {
      data: authUserData,
      error: authUserError,
    } =
      await admin.auth.admin.getUserById(
        userId,
      );

    if (authUserError) {
      console.error(
        "Investor Auth lookup error:",
        authUserError,
      );
    }

    const investorEmail =
      authUserData.user
        ?.email;

    const investorName =
      [
        investor.first_name,
        investor.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      "Investor";

    /*
     * 11. Email is notification only.
     *
     * Failure does NOT undo the
     * compliance action.
     */
    if (investorEmail) {
      const email =
        verificationActionRequiredEmail({
          investorName,

          reason,

          sections,
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
          "Action-required email error:",
          emailError,
        );
      }
    }

    return NextResponse.json({
      success: true,

      status:
        "action_required",

      editableSections:
        sections,
    });
  } catch (error) {
    console.error(
      "Request information API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while requesting additional information.",
      },
      {
        status: 500,
      },
    );
  }
}