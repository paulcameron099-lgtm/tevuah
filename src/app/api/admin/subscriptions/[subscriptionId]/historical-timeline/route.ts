import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createClient } from "@/src/lib/supabase/server";

type RouteContext = {
  params: Promise<{ subscriptionId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

    const { subscriptionId } = await context.params;

    if (!subscriptionId?.trim()) {
      return NextResponse.json(
        { error: "Subscription ID is required." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const supabase = await createClient();

    const { data, error } = await supabase.rpc(
      "set_individual_investment_historical_timeline",
      {
        p_subscription_id: subscriptionId,
        p_historical_submitted_at: nullableDate(body.historicalSubmittedAt),
        p_historical_reviewed_at: nullableDate(body.historicalReviewedAt),
        p_historical_funded_at: nullableDate(body.historicalFundedAt),
        p_historical_created_at: nullableDate(body.historicalCreatedAt),
        p_reason: nullableText(body.reason),
      },
    );

    if (error) {
      console.error("Individual historical timeline RPC error:", {
        subscriptionId,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      return NextResponse.json(
        {
          error: error.message || "Unable to save historical timeline.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      subscriptionId,
      timeline: data,
    });
  } catch (cause) {
    console.error("Individual historical timeline route error:", cause);

    return NextResponse.json(
      {
        error:
          cause instanceof Error
            ? cause.message
            : "Unable to save historical timeline.",
      },
      { status: 500 },
    );
  }
}

function nullableDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new Error("One or more historical dates are invalid.");
  }

  return new Date(value).toISOString();
}

function nullableText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
