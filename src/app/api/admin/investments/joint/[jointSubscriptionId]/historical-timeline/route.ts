import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createClient } from "@/src/lib/supabase/server";

type RouteContext = {
  params: Promise<{ jointSubscriptionId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();
    const { jointSubscriptionId } = await context.params;
    if (!jointSubscriptionId) return NextResponse.json({ error: "Joint subscription ID is required." }, { status: 400 });

    const body = await request.json();
    const supabase = await createClient();

    const { data, error } = await supabase.rpc(
      "set_joint_investment_historical_timeline",
      {
        p_joint_subscription_id: jointSubscriptionId,
        p_historical_submitted_at: nullableDate(body.historicalSubmittedAt),
        p_historical_reviewed_at: nullableDate(body.historicalReviewedAt),
        p_historical_approved_at: nullableDate(body.historicalApprovedAt),
        p_member_one_historical_funded_at: nullableDate(body.memberOneHistoricalFundedAt),
        p_member_two_historical_funded_at: nullableDate(body.memberTwoHistoricalFundedAt),
        p_historical_finalized_at: nullableDate(body.historicalFinalizedAt),
        p_historical_position_created_at: nullableDate(body.historicalPositionCreatedAt),
        p_reason: nullableText(body.reason),
      },
    );

    if (error) {
      console.error("Joint historical timeline RPC error:", error);
      return NextResponse.json({ error: error.message || "Unable to save historical joint timeline." }, { status: 400 });
    }

    return NextResponse.json({ success: true, timeline: data });
  } catch (cause) {
    console.error("Joint historical timeline route error:", cause);
    return NextResponse.json(
      { error: cause instanceof Error ? cause.message : "Unable to save historical joint timeline." },
      { status: 500 },
    );
  }
}

function nullableDate(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) throw new Error("One or more historical dates are invalid.");
  return new Date(value).toISOString();
}
function nullableText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
