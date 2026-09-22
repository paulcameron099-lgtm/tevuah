import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(
  _request: NextRequest,
  context: {
    params: Promise<{
      jointSubscriptionId: string;
      withdrawalId: string;
    }>;
  },
) {
  try {
    const { jointSubscriptionId, withdrawalId } =
      await context.params;

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    /*
     * This RPC is admin-only and performs the authoritative integrity
     * checks. It DOES NOT execute redemption or credit Cash Accounts.
     */
    const { data, error } = await supabase.rpc(
      "submit_joint_withdrawal_for_execution",
      {
        p_withdrawal_id: withdrawalId,
      },
    );

    if (error) {
      const normalized = error.message.toLowerCase();
      const status = normalized.includes("admin access")
        ? 403
        : normalized.includes("not found")
          ? 404
          : 409;

      return NextResponse.json(
        { error: error.message },
        { status },
      );
    }

    const result = Array.isArray(data) ? data[0] ?? null : data;

    if (
      !result ||
      result.joint_subscription_id !== jointSubscriptionId ||
      result.withdrawal_id !== withdrawalId
    ) {
      return NextResponse.json(
        {
          error:
            "Withdrawal does not belong to the requested joint investment.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        withdrawal: result,
        accountingExecuted: false,
        message:
          "Withdrawal approved for processing. No positions or Cash Accounts have been changed yet.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Admin withdrawal approval API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to approve withdrawal for processing.",
      },
      { status: 500 },
    );
  }
}
