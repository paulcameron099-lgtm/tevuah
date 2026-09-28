import { NextResponse } from "next/server";

import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createClient } from "@/src/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    positionId: string;
  }>;
};

type RequestBody = {
  effectiveAt?: unknown;
  reason?: unknown;
  overrideOfferingWindow?: unknown;
};

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  try {
    await requireAdmin();

    const { positionId } = await params;

    if (!positionId) {
      return NextResponse.json(
        { error: "Investment position ID is required." },
        { status: 400 },
      );
    }

    const body = (await request.json()) as RequestBody;

    const effectiveAt =
      typeof body.effectiveAt === "string"
        ? body.effectiveAt.trim()
        : "";

    const reason =
      typeof body.reason === "string"
        ? body.reason.trim()
        : "";

    const overrideOfferingWindow =
      body.overrideOfferingWindow === true;

    if (!effectiveAt) {
      return NextResponse.json(
        { error: "Historical investment date and time are required." },
        { status: 400 },
      );
    }

    const parsed = new Date(effectiveAt);

    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json(
        { error: "Historical investment date and time are invalid." },
        { status: 400 },
      );
    }

    if (parsed.getTime() > Date.now()) {
      return NextResponse.json(
        { error: "Historical investment date cannot be in the future." },
        { status: 400 },
      );
    }

    if (
      overrideOfferingWindow &&
      reason.length < 20
    ) {
      return NextResponse.json(
        {
          error:
            "An offering-window override requires a reason of at least 20 characters.",
        },
        { status: 400 },
      );
    }

    /*
     * IMPORTANT:
     * Use the cookie-backed authenticated client here.
     * Do not use createAdminClient() for this RPC: the database
     * intentionally attributes the change with auth.uid().
     */
    const supabase = await createClient();

    const { data, error } = await supabase.rpc(
      "set_investment_historical_effective_date",
      {
        p_entity_type: "investment_position",
        p_entity_id: positionId,
        p_effective_at: parsed.toISOString(),
        p_reason: reason || null,
        p_override_offering_window:
          overrideOfferingWindow,
      },
    );

    if (error) {
      const message =
        error.message ||
        "Unable to update historical investment date.";

      const status =
        message.toLowerCase().includes("admin access") ||
        message.toLowerCase().includes("authentication")
          ? 403
          : message.toLowerCase().includes("not found")
            ? 404
            : 400;

      return NextResponse.json(
        { error: message },
        { status },
      );
    }

    const result =
      Array.isArray(data) ? data[0] ?? null : data;

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    console.error(
      "Historical investment date update error:",
      error,
    );

    return NextResponse.json(
      { error: "Unable to update historical investment date." },
      { status: 500 },
    );
  }
}
