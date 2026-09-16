import {
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

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
    const user =
      await getCurrentUser();

    if (!user) {
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

    if (
      user.role !==
      "investor"
    ) {
      return NextResponse.json(
        {
          error:
            "Investor access required.",
        },
        {
          status: 403,
        },
      );
    }

    const {
      withdrawalId,
    } =
      await context.params;

    if (!withdrawalId) {
      return NextResponse.json(
        {
          error:
            "Withdrawal ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const admin =
      createAdminClient();

    const {
      data,
      error,
    } =
      await admin.rpc(
        "cancel_cash_account_withdrawal",
        {
          p_withdrawal_id:
            withdrawalId,

          p_investor_id:
            user.id,
        },
      );

    if (error) {
      console.error(
        "Cancel withdrawal RPC error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            error.message ||
            "Unable to cancel withdrawal request.",
        },
        {
          status: 400,
        },
      );
    }

    const withdrawal =
      Array.isArray(
        data,
      )
        ? data[0]
        : data;

    return NextResponse.json(
      {
        success: true,

        withdrawalId:
          withdrawal?.id ??
          withdrawalId,

        status:
          withdrawal?.status ??
          "cancelled",
      },
      {
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Cancel withdrawal API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to cancel withdrawal request.",
      },
      {
        status: 500,
      },
    );
  }
}