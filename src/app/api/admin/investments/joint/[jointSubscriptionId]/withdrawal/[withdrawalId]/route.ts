import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(
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

    const { data, error } = await supabase.rpc(
      "get_admin_joint_withdrawal_review",
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

    if (
      !data ||
      data.withdrawal?.joint_subscription_id !== jointSubscriptionId
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
      { review: data },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Admin joint withdrawal review API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load joint withdrawal.",
      },
      { status: 500 },
    );
  }
}
