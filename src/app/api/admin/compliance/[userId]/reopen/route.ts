import {
  NextResponse,
} from "next/server";

import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

import {
  recordComplianceAudit,
} from "@/src/lib/compliance/audit";

import {
  sendApplicationMail,
} from "@/src/lib/email/application-mailer";
import {
  actionRequiredEmail,
} from "@/src/lib/email/compliance-emails";

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

type ReopenPayload = {
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

    const {
      data: adminProfile,
      error:
        adminProfileError,
    } = await admin
      .from("profiles")
      .select(
        "id, role",
      )
      .eq(
        "id",
        adminUserId,
      )
      .maybeSingle();

    if (
      adminProfileError ||
      !adminProfile ||
      (
        adminProfile.role !==
          "admin" &&
        adminProfile.role !==
          "super_admin"
      )
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

    const body =
      (await request.json()) as ReopenPayload;

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
            "A reason for reopening onboarding is required.",
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
            "Select at least one onboarding section to reopen.",
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

    const [
      investorResult,
      reviewResult,
      onboardingResult,
    ] = await Promise.all([
      admin
        .from("profiles")
        .select(
          `
          id,
          onboarding_status
          `,
        )
        .eq(
          "id",
          userId,
        )
        .maybeSingle(),

      admin
        .from(
          "compliance_reviews",
        )
        .select(
          `
          id,
          status,
          rejection_reason
          `,
        )
        .eq(
          "user_id",
          userId,
        )
        .maybeSingle(),

      admin
        .from(
          "investor_onboarding",
        )
        .select(
          "user_id",
        )
        .eq(
          "user_id",
          userId,
        )
        .maybeSingle(),
    ]);

    if (
      investorResult.error ||
      !investorResult.data
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

    if (
      reviewResult.error ||
      !reviewResult.data
    ) {
      return NextResponse.json(
        {
          error:
            "Compliance review could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      onboardingResult.error ||
      !onboardingResult.data
    ) {
      return NextResponse.json(
        {
          error:
            "Investor onboarding record could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      reviewResult.data.status !==
        "rejected" ||
      investorResult.data
        .onboarding_status !==
        "rejected"
    ) {
      return NextResponse.json(
        {
          error:
            "Only a rejected onboarding review can be reopened from this action.",
        },
        {
          status: 409,
        },
      );
    }

    const now =
      new Date().toISOString();

    const previousRejectionReason =
      reviewResult.data
        .rejection_reason ??
      null;

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

        unlock_reason:
          reason,

        unlocked_at:
          now,

        unlocked_by_admin_id:
          adminUserId,

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
        "Reopen onboarding update error:",
        onboardingError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to reopen the selected onboarding sections.",
        },
        {
          status: 500,
        },
      );
    }

    const {
      error:
        profileError,
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

    if (
      profileError
    ) {
      console.error(
        "Reopen profile update error:",
        profileError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to reopen the investor onboarding status.",
        },
        {
          status: 500,
        },
      );
    }

    const {
      error:
        reviewUpdateError,
    } = await admin
      .from(
        "compliance_reviews",
      )
      .update({
        status:
          "action_required",

        action_required_reason:
          reason,

        rejection_reason:
          null,

        assigned_admin_id:
          adminUserId,

        reviewed_at:
          null,

        updated_at:
          now,
      })
      .eq(
        "user_id",
        userId,
      );

    if (
      reviewUpdateError
    ) {
      console.error(
        "Reopen compliance review update error:",
        reviewUpdateError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to reopen the compliance review.",
        },
        {
          status: 500,
        },
      );
    }

    await recordComplianceAudit({
      actorUserId:
        adminUserId,

      investorUserId:
        userId,

      action:
        "information_requested",

      metadata: {
        eventType:
          "onboarding_reopened",
        sections,
        reason,
        previousRejectionReason,
      },
    });

    /*
     * Notify the investor that selected sections
     * were reopened for correction.
     */
    const {
      data: investor,
      error: investorError,
    } = await admin
      .from("profiles")
      .select(
        "first_name, last_name",
      )
      .eq(
        "id",
        userId,
      )
      .maybeSingle();

    const {
      data: authUserData,
      error: authUserError,
    } =
      await admin.auth.admin.getUserById(
        userId,
      );

    if (
      investorError ||
      authUserError
    ) {
      console.error(
        "Reopen email recipient lookup error:",
        {
          investorError,
          authUserError,
        },
      );
    }

    const investorEmail =
      authUserData.user?.email;

    const investorName =
      [
        investor?.first_name,
        investor?.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      "Investor";

    let emailSent = false;
    let emailWarning:
      | string
      | undefined;

    if (investorEmail) {
      const email =
        actionRequiredEmail({
          investorName,
          reason,
          sections,
          origin:
            new URL(
              request.url,
            ).origin,
          reopened: true,
        });

      const delivery =
        await sendApplicationMail({
          to: investorEmail,
          ...email,
        });

      emailSent =
        delivery.sent;

      emailWarning =
        delivery.sent
          ? undefined
          : delivery.error;
    } else {
      emailWarning =
        "Investor email address is missing.";
    }

    return NextResponse.json({
      success: true,
      status:
        "action_required",
      editableSections:
        sections,
      emailSent,
      emailWarning,
    });
  } catch (error) {
    console.error(
      "Reopen onboarding API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while reopening onboarding.",
      },
      {
        status: 500,
      },
    );
  }
}
