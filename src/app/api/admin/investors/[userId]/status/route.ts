import {
  NextResponse,
} from "next/server";

import {
  recordComplianceAudit,
} from "@/src/lib/compliance/audit";

import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";
import {
  investorAccountReactivatedEmail,
  investorAccountSuspendedEmail,
} from "@/src/lib/email/templates";

import {
  sendMail,
} from "@/src/lib/email/mailer";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

type AccountStatus =
  | "active"
  | "suspended"
  | "disabled";

type RequestPayload = {
  status:
    AccountStatus;

  reason?: string;
};

const allowedStatuses:
  AccountStatus[] = [
    "active",
    "suspended",
    "disabled",
  ];

export async function POST(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  try {
    /*
     * --------------------------------------------------
     * 1. AUTHENTICATE ADMIN
     * --------------------------------------------------
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
     * --------------------------------------------------
     * 2. VERIFY ROLE
     * --------------------------------------------------
     */
    const {
      data: adminProfile,
      error: adminProfileError,
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
     * --------------------------------------------------
     * 3. INVESTOR ID
     * --------------------------------------------------
     */
    const {
      userId,
    } = await params;

    /*
     * Prevent administrators from changing
     * their own account through investor API.
     */
    if (
      userId ===
      adminUserId
    ) {
      return NextResponse.json(
        {
          error:
            "You cannot change your own account status from this endpoint.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 4. READ REQUEST
     * --------------------------------------------------
     */
    const body =
      (await request.json()) as RequestPayload;

    const status =
      body.status;

    const reason =
      body.reason
        ?.trim() ??
      "";

    if (
      !status ||
      !allowedStatuses.includes(
        status,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid account status.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Suspension/disable should always
     * have an administrative reason.
     */
    if (
      status !== "active" &&
      !reason
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a reason for restricting this account.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 5. LOAD INVESTOR
     * --------------------------------------------------
     */
    const {
      data: investor,
      error: investorError,
    } = await admin
      .from("profiles")
      .select(
        `
        id,
        first_name,
        last_name,
        role,
        account_status
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

    if (
      investor.role !==
      "investor"
    ) {
      return NextResponse.json(
        {
          error:
            "This account is not an investor account.",
        },
        {
          status: 400,
        },
      );
    }

    const previousStatus =
      investor.account_status ??
      "active";

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
     * --------------------------------------------------
     * 6. UPDATE PROFILE ACCOUNT STATUS
     * --------------------------------------------------
     */
    const now =
      new Date().toISOString();

    const {
      error: updateError,
    } = await admin
      .from("profiles")
      .update({
        account_status:
          status,

        updated_at:
          now,
      })
      .eq(
        "id",
        userId,
      );

    if (updateError) {
      console.error(
        "Investor account status update error:",
        updateError,
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
     * --------------------------------------------------
     * 7. AUDIT ACTION
     * --------------------------------------------------
     *
     * We reuse the compliance audit table.
     *
     * Add these action names to the audit
     * type in the next step below.
     */
    await recordComplianceAudit({
      actorUserId:
        adminUserId,

      investorUserId:
        userId,

      action:
        status ===
        "active"
          ? "investor_account_activated"
          : status ===
              "suspended"
            ? "investor_account_suspended"
            : "investor_account_disabled",

      metadata: {
        previousStatus,

        newStatus:
          status,

        /*
         * Administrative restriction reasons
         * are acceptable here, but never put
         * SSN, TIN, DL or encrypted values
         * in audit metadata.
         */
        reason:
          reason ||
          null,
      },
    });

    /*
 * --------------------------------------------------
 * 8. LOAD INVESTOR EMAIL
 * --------------------------------------------------
 */
const {
  data: authInvestorData,
  error: authInvestorError,
} =
  await admin.auth.admin.getUserById(
    userId,
  );

if (authInvestorError) {
  console.error(
    "Investor email lookup error:",
    authInvestorError,
  );
}

const investorEmail =
  authInvestorData.user
    ?.email;

/*
 * --------------------------------------------------
 * 9. SEND STATUS EMAIL
 *
 * Email failure must NOT undo the
 * account-status database change.
 * --------------------------------------------------
 */
if (investorEmail) {
  try {
    if (
      status ===
      "suspended"
    ) {
      const email =
        investorAccountSuspendedEmail({
          investorName,

          reason:
            reason ||
            "Administrative account review.",
        });

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
    }

    if (
      status ===
      "active"
    ) {
      const email =
        investorAccountReactivatedEmail({
          investorName,
        });

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
    }
  } catch (emailError) {
    console.error(
      "Investor account-status email error:",
      emailError,
    );
  }
}

    return NextResponse.json({
      success: true,

      status,
    });
  } catch (error) {
    console.error(
      "Investor account status API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while updating the investor account.",
      },
      {
        status: 500,
      },
    );
  }
}