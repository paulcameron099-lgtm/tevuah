import {
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type Payload = {
  valuationId?: string;
};

export async function POST(
  request: Request,
) {
  try {
    /*
     * ==================================================
     * 1. ADMIN AUTH
     * ==================================================
     */
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
      user.role !== "admin" &&
      user.role !== "super_admin"
    ) {
      return NextResponse.json(
        {
          error:
            "Administrator access required.",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * ==================================================
     * 2. REQUEST
     * ==================================================
     */
    const body =
      (await request.json()) as Payload;

    const valuationId =
      body.valuationId?.trim();

    if (!valuationId) {
      return NextResponse.json(
        {
          error:
            "Valuation ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const admin =
      createAdminClient();

    /*
     * ==================================================
     * 3. VERIFY VALUATION EXISTS
     * ==================================================
     */
    const {
      data: valuation,
      error: valuationError,
    } = await admin
      .from(
        "investment_valuations",
      )
      .select(
        `
        id,
        opportunity_id,
        valuation_date,
        total_asset_value,
        status
        `,
      )
      .eq(
        "id",
        valuationId,
      )
      .maybeSingle();

    if (
      valuationError ||
      !valuation
    ) {
      console.error(
        "Publish valuation lookup error:",
        valuationError,
      );

      return NextResponse.json(
        {
          error:
            "Valuation could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      valuation.status ===
      "published"
    ) {
      return NextResponse.json(
        {
          error:
            "This valuation has already been published.",
        },
        {
          status: 409,
        },
      );
    }

    if (
      valuation.status !==
      "draft"
    ) {
      return NextResponse.json(
        {
          error:
            "Only draft valuations can be published.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * ==================================================
     * 4. PUBLISH ATOMICALLY
     * ==================================================
     */
    const {
      data: publishResult,
      error: publishError,
    } = await admin.rpc(
      "publish_investment_valuation",
      {
        p_valuation_id:
          valuation.id,

        p_admin_id:
          user.id,
      },
    );

    if (publishError) {
      console.error(
        "publish_investment_valuation RPC error:",
        publishError,
      );

      return NextResponse.json(
        {
          error:
            publishError.message ??
            "Unable to publish valuation.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * ==================================================
     * 5. VERIFY POSITION SNAPSHOTS EXIST
     * ==================================================
     */
    const {
      count,
      error: countError,
    } = await admin
      .from(
        "investment_position_valuations",
      )
      .select(
        "id",
        {
          count:
            "exact",

          head:
            true,
        },
      )
      .eq(
        "valuation_id",
        valuation.id,
      );

    if (countError) {
      console.error(
        "Published valuation snapshot count error:",
        countError,
      );
    }

    /*
     * ==================================================
     * 6. SUCCESS
     * ==================================================
     */
    return NextResponse.json({
      success: true,

      valuationId:
        valuation.id,

      positionSnapshots:
        count ??
        null,

      result:
        publishResult,
    });
  } catch (error) {
    console.error(
      "Publish valuation API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while publishing the valuation.",
      },
      {
        status: 500,
      },
    );
  }
}