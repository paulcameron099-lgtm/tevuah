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
  verificationRejectedEmail,
} from "@/src/lib/email/templates";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

type RejectPayload = {
  reason: string;
};

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
      (await request.json()) as RejectPayload;

    const reason =
      body.reason
        ?.trim();

    if (!reason) {
      return NextResponse.json(
        {
          error:
            "A rejection reason is required.",
        },
        {
          status: 400,
        },
      );
    }

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
        last_name
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
        "Rejected onboarding lock error:",
        onboardingError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to lock rejected onboarding.",
        },
        {
          status: 500,
        },
      );
    }

    const {
      error: profileError,
    } = await admin
      .from("profiles")
      .update({
        onboarding_status:
          "rejected",

        updated_at:
          now,
      })
      .eq(
        "id",
        userId,
      );

    if (profileError) {
      console.error(
        "Rejected profile status error:",
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

    const {
      error:
        reviewError,
    } = await admin
      .from(
        "compliance_reviews",
      )
      .update({
        status:
          "rejected",

        rejection_reason:
          reason,

        action_required_reason:
          null,

        assigned_admin_id:
          adminUserId,

        reviewed_at:
          now,

        updated_at:
          now,
      })
      .eq(
        "user_id",
        userId,
      );

    if (reviewError) {
      console.error(
        "Compliance rejection error:",
        reviewError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to reject compliance review.",
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
        "investor_rejected",

      metadata: {
        reason,
      },
    });

    /*
     * Existing rejection email behavior is
     * intentionally preserved for the later
     * email-delivery test.
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

    if (investorEmail) {
      const email =
        verificationRejectedEmail({
          investorName,
          reason,
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
          "Investor rejection email error:",
          emailError,
        );
      }
    }

    return NextResponse.json({
      success: true,
      status:
        "rejected",
    });
  } catch (error) {
    console.error(
      "Investor rejection API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while rejecting the investor.",
      },
      {
        status: 500,
      },
    );
  }
}