import {
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type CreateValuationPayload = {
  opportunityId?: string;

  valuationDate?: string;

  /*
   * Client sends dollars.
   */
  totalAssetValue?: number;

  navPerUnit?:
    | number
    | null;

  valuationType?: string;

  sourceName?:
    | string
    | null;

  methodology?: string;

  notes?:
    | string
    | null;
};

const ALLOWED_TYPES =
  new Set([
    "admin_estimate",
    "appraisal",
    "market",
    "external_valuation",
    "final",
  ]);

function dollarsToCents(
  value: number,
) {
  return Math.round(
    value * 100,
  );
}

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
      (await request.json()) as CreateValuationPayload;

    const opportunityId =
      body.opportunityId?.trim();

    const valuationDate =
      body.valuationDate?.trim();

    const methodology =
      body.methodology?.trim();

    if (!opportunityId) {
      return NextResponse.json(
        {
          error:
            "Investment opportunity is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!valuationDate) {
      return NextResponse.json(
        {
          error:
            "Valuation date is required.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Basic YYYY-MM-DD validation.
     */
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(
        valuationDate,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid valuation date.",
        },
        {
          status: 400,
        },
      );
    }

    const totalAssetValue =
      Number(
        body.totalAssetValue,
      );

    if (
      !Number.isFinite(
        totalAssetValue,
      ) ||
      totalAssetValue <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid total asset value.",
        },
        {
          status: 400,
        },
      );
    }

    if (!methodology) {
      return NextResponse.json(
        {
          error:
            "Valuation methodology is required.",
        },
        {
          status: 400,
        },
      );
    }

    const valuationType =
      body.valuationType ??
      "admin_estimate";

    if (
      !ALLOWED_TYPES.has(
        valuationType,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid valuation type.",
        },
        {
          status: 400,
        },
      );
    }

    let navPerUnit:
      | number
      | null =
      null;

    if (
      body.navPerUnit !=
      null
    ) {
      navPerUnit =
        Number(
          body.navPerUnit,
        );

      if (
        !Number.isFinite(
          navPerUnit,
        ) ||
        navPerUnit <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "NAV per unit must be greater than zero.",
          },
          {
            status: 400,
          },
        );
      }
    }

    const admin =
      createAdminClient();

    /*
     * ==================================================
     * 3. VERIFY OPPORTUNITY
     * ==================================================
     */
    const {
      data: opportunity,
      error: opportunityError,
    } = await admin
      .from(
        "investment_opportunities",
      )
      .select(
        `
        id,
        title,
        status,
        total_funded
        `,
      )
      .eq(
        "id",
        opportunityId,
      )
      .maybeSingle();

    if (
      opportunityError ||
      !opportunity
    ) {
      console.error(
        "Create valuation opportunity lookup error:",
        opportunityError,
      );

      return NextResponse.json(
        {
          error:
            "Investment opportunity could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * ==================================================
     * 4. VERIFY FUNDED POSITIONS EXIST
     * ==================================================
     */
    const {
      data: fundedPositions,
      error: fundedPositionsError,
    } = await admin
      .from(
        "investment_positions",
      )
      .select(
        `
        id,
        principal_amount,
        status
        `,
      )
      .eq(
        "opportunity_id",
        opportunityId,
      )
      .in(
        "status",
        [
          "active",
          "matured",
        ],
      );

    if (
      fundedPositionsError
    ) {
      console.error(
        "Create valuation funded positions lookup error:",
        fundedPositionsError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to verify funded investment positions.",
        },
        {
          status: 500,
        },
      );
    }

    if (
      !fundedPositions ||
      fundedPositions.length ===
        0
    ) {
      return NextResponse.json(
        {
          error:
            "This opportunity does not have funded investment positions.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * ==================================================
     * 5. PREVENT DUPLICATE DATE
     * ==================================================
     *
     * Database also enforces:
     *
     * unique(opportunity_id, valuation_date)
     */
    const {
      data: existingValuation,
      error: existingError,
    } = await admin
      .from(
        "investment_valuations",
      )
      .select(
        `
        id,
        status
        `,
      )
      .eq(
        "opportunity_id",
        opportunityId,
      )
      .eq(
        "valuation_date",
        valuationDate,
      )
      .maybeSingle();

    if (existingError) {
      console.error(
        "Existing valuation lookup error:",
        existingError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to check for an existing valuation.",
        },
        {
          status: 500,
        },
      );
    }

    if (existingValuation) {
      return NextResponse.json(
        {
          error:
            "A valuation already exists for this opportunity on the selected date.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * ==================================================
     * 6. CREATE DRAFT
     * ==================================================
     */
    const now =
      new Date().toISOString();

    const {
      data: valuation,
      error: valuationError,
    } = await admin
      .from(
        "investment_valuations",
      )
      .insert({
        opportunity_id:
          opportunityId,

        valuation_date:
          valuationDate,

        /*
         * Database stores cents.
         */
        total_asset_value:
          dollarsToCents(
            totalAssetValue,
          ),

        nav_per_unit:
          navPerUnit,

        currency:
          "USD",

        valuation_type:
          valuationType,

        source_name:
          body.sourceName?.trim() ||
          null,

        methodology,

        notes:
          body.notes?.trim() ||
          null,

        /*
         * Always draft on creation.
         */
        status:
          "draft",

        created_by:
          user.id,

        published_by:
          null,

        published_at:
          null,

        created_at:
          now,

        updated_at:
          now,
      })
      .select(
        `
        id,
        opportunity_id,
        valuation_date,
        total_asset_value,
        valuation_type,
        status,
        created_at
        `,
      )
      .single();

    if (
      valuationError ||
      !valuation
    ) {
      console.error(
        "Create valuation database error:",
        valuationError,
      );

      return NextResponse.json(
        {
          error:
            valuationError?.message ??
            "Unable to create valuation.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * ==================================================
     * 7. SUCCESS
     * ==================================================
     *
     * IMPORTANT:
     *
     * No position valuations have been created yet.
     *
     * No investor portfolio values have changed.
     *
     * That occurs ONLY when:
     *
     * publish_investment_valuation()
     *
     * succeeds.
     */
    return NextResponse.json({
      success: true,

      valuationId:
        valuation.id,

      status:
        valuation.status,
    });
  } catch (error) {
    console.error(
      "Create valuation API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while creating the valuation.",
      },
      {
        status: 500,
      },
    );
  }
}