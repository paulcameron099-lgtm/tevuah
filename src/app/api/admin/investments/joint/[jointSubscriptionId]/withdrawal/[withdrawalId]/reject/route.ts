import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

type Body = {
  rejectionReason?: string;
};

export async function POST(
  request: NextRequest,
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

    const body = (await request.json().catch(() => ({}))) as Body;
    const rejectionReason = body.rejectionReason?.trim() || "";

    if (rejectionReason.length < 5) {
      return NextResponse.json(
        { error: "A clear rejection reason is required." },
        { status: 400 },
      );
    }

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

    const { data, error } = await supabase.rpc(
      "reject_joint_investment_withdrawal_admin",
      {
        p_withdrawal_id: withdrawalId,
        p_rejection_reason: rejectionReason,
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
      result.joint_subscription_id !== jointSubscriptionId
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
          "Withdrawal rejected. No positions or Cash Accounts were changed.",
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
      "Admin withdrawal rejection API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to reject withdrawal.",
      },
      { status: 500 },
    );
  }
}
