import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  context: {
    params: Promise<{
      id: string;
      withdrawalId: string;
    }>;
  },
) {
  try {
    const { id: jointSubscriptionId, withdrawalId } = await context.params;

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
     * Intentionally no general restricted-account blocker.
     * This endpoint is a narrow, member-scoped consent surface.
     * The SECURITY DEFINER RPC verifies auth.uid() belongs to the
     * exact joint investment before returning anything.
     */
    const { data, error } = await supabase.rpc(
      "get_joint_investment_withdrawal_review",
      {
        p_withdrawal_id: withdrawalId,
      },
    );

    if (error) {
      const message = error.message || "Unable to load withdrawal.";
      const normalized = message.toLowerCase();

      const status = normalized.includes("authentication")
        ? 401
        : normalized.includes("only a joint member")
          ? 403
          : normalized.includes("not found")
            ? 404
            : 409;

      return NextResponse.json({ error: message }, { status });
    }

    const review = Array.isArray(data) ? data[0] ?? null : data;

    if (!review) {
      return NextResponse.json(
        { error: "Withdrawal review was not found." },
        { status: 404 },
      );
    }

    if (review.joint_subscription_id !== jointSubscriptionId) {
      return NextResponse.json(
        { error: "Withdrawal does not belong to this joint investment." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { review },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Joint withdrawal review API error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load withdrawal review.",
      },
      { status: 500 },
    );
  }
}
