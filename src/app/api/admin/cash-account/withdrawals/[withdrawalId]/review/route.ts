import {
  NextResponse,
} from "next/server";

import {
  requireAdmin,
} from "@/src/lib/auth/require-admin";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    withdrawalId: string;
  }>;
};

export async function POST(
  _request: Request,
  context: RouteContext,
) {
  try {
    const adminUser =
      await requireAdmin();

    const {
      withdrawalId,
    } =
      await context.params;

    const admin =
      createAdminClient();

    const {
      error,
    } =
      await admin.rpc(
        "start_cash_account_withdrawal_review",
        {
          p_withdrawal_id:
            withdrawalId,

          p_admin_id:
            adminUser.userId,
        },
      );

    if (error) {
      return NextResponse.json(
        {
          error:
            error.message,
        },
        {
          status: 409,
        },
      );
    }

    return NextResponse.json({
      success: true,
      status:
        "under_review",
      message:
        "Withdrawal moved to review.",
    });
  } catch (error) {
    console.error(
      "Start withdrawal review error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to start withdrawal review.",
      },
      {
        status: 500,
      },
    );
  }
}