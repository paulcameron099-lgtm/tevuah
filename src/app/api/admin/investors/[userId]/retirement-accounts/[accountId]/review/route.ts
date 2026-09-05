import {
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    userId: string;
    accountId: string;
  }>;
};

type ReviewPayload = {
  verificationStatus?: string;
  fundingEligibilityStatus?: string;
  rejectionReason?: string;
  adminNotes?: string;
};

const VERIFICATION_STATUSES =
  new Set([
    "unverified",
    "pending_review",
    "verified",
    "action_required",
    "rejected",
  ]);

const FUNDING_STATUSES =
  new Set([
    "not_eligible",
    "under_review",
    "eligible",
    "suspended",
  ]);

function clean(
  value:
    | string
    | null
    | undefined,
) {
  const normalized =
    value?.trim() ?? "";

  return normalized ||
    null;
}

export async function POST(
  request: Request,
  context: RouteContext,
) {
  try {
    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Unauthorized.",
        },
        {
          status:
            401,
        },
      );
    }

    if (
      user.role !==
        "admin" &&
      user.role !==
        "super_admin"
    ) {
      return NextResponse.json(
        {
          error:
            "Admin access required.",
        },
        {
          status:
            403,
        },
      );
    }

    const {
      userId,
      accountId,
    } =
      await context.params;

    const payload =
      (await request.json()) as ReviewPayload;

    const verificationStatus =
      clean(
        payload.verificationStatus,
      );

    const fundingEligibilityStatus =
      clean(
        payload.fundingEligibilityStatus,
      );

    if (
      !verificationStatus ||
      !VERIFICATION_STATUSES.has(
        verificationStatus,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Select a valid verification status.",
        },
        {
          status:
            400,
        },
      );
    }

    if (
      !fundingEligibilityStatus ||
      !FUNDING_STATUSES.has(
        fundingEligibilityStatus,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Select a valid funding eligibility status.",
        },
        {
          status:
            400,
        },
      );
    }

    const admin =
      createAdminClient();

    const {
      data:
        account,
      error:
        accountError,
    } =
      await admin
        .from(
          "investor_retirement_accounts",
        )
        .select(
          "id, investor_id",
        )
        .eq(
          "id",
          accountId,
        )
        .eq(
          "investor_id",
          userId,
        )
        .maybeSingle();

    if (
      accountError ||
      !account
    ) {
      return NextResponse.json(
        {
          error:
            "Retirement account not found.",
        },
        {
          status:
            404,
        },
      );
    }

    const {
      error,
    } =
      await admin.rpc(
        "review_retirement_account_step4_service",
        {
          p_admin_id:
            user.id,

          p_account_id:
            accountId,

          p_verification_status:
            verificationStatus,

          p_funding_eligibility_status:
            fundingEligibilityStatus,

          p_rejection_reason:
            clean(
              payload.rejectionReason,
            ),

          p_admin_notes:
            clean(
              payload.adminNotes,
            ),
        },
      );

    if (error) {
      return NextResponse.json(
        {
          error:
            error.message ||
            "Unable to save retirement account review.",
        },
        {
          status:
            400,
        },
      );
    }

    return NextResponse.json(
      {
        success:
          true,
      },
    );
  } catch (error) {
    console.error(
      "Step 4 retirement review error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to save retirement account review.",
      },
      {
        status:
          500,
      },
    );
  }
}