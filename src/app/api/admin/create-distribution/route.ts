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
  opportunityId?: string;

  title?: string;

  distributionType?: string;

  recordDate?: string;

  paymentDate?:
    | string
    | null;

  /*
   * Client sends dollars.
   */
  totalAmount?: number;

  notes?:
    | string
    | null;
};

const ALLOWED_TYPES =
  new Set([
    "income",
    "dividend",
    "interest",
    "profit_distribution",
    "return_of_capital",
    "redemption",
    "other",
  ]);

function dollarsToCents(
  dollars: number,
) {
  return Math.round(
    dollars * 100,
  );
}

export async function POST(
  request: Request,
) {
  try {
    /*
     * ==================================================
     * ADMIN AUTH
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

    const body =
      (await request.json()) as Payload;

    const opportunityId =
      body.opportunityId?.trim();

    const title =
      body.title?.trim();

    const recordDate =
      body.recordDate?.trim();

    const distributionType =
      body.distributionType ??
      "income";

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

    if (!title) {
      return NextResponse.json(
        {
          error:
            "Distribution title is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !ALLOWED_TYPES.has(
        distributionType,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid distribution type.",
        },
        {
          status: 400,
        },
      );
    }

    if (!recordDate) {
      return NextResponse.json(
        {
          error:
            "Record date is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(
        recordDate,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid record date.",
        },
        {
          status: 400,
        },
      );
    }

    const paymentDate =
      body.paymentDate?.trim() ||
      null;

    if (
      paymentDate &&
      !/^\d{4}-\d{2}-\d{2}$/.test(
        paymentDate,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid payment date.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      paymentDate &&
      paymentDate <
        recordDate
    ) {
      return NextResponse.json(
        {
          error:
            "Payment date cannot be before the record date.",
        },
        {
          status: 400,
        },
      );
    }

    const amount =
      Number(
        body.totalAmount,
      );

    if (
      !Number.isFinite(
        amount,
      ) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid distribution amount.",
        },
        {
          status: 400,
        },
      );
    }

    const admin =
      createAdminClient();

    /*
     * Confirm opportunity exists.
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
     * Confirm funded positions exist.
     */
    const {
      data: positions,
      error: positionsError,
    } = await admin
      .from(
        "investment_positions",
      )
      .select(
        `
        id,
        principal_amount
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

    if (positionsError) {
      console.error(
        "Create distribution position lookup error:",
        positionsError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to verify funded positions.",
        },
        {
          status: 500,
        },
      );
    }

    if (
      !positions ||
      positions.length ===
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

    const now =
      new Date().toISOString();

    /*
     * Create DRAFT ONLY.
     */
    const {
      data: distribution,
      error:
        distributionError,
    } = await admin
      .from(
        "investment_distributions",
      )
      .insert({
        opportunity_id:
          opportunityId,

        title,

        distribution_type:
          distributionType,

        record_date:
          recordDate,

        payment_date:
          paymentDate,

        total_distribution_amount:
          dollarsToCents(
            amount,
          ),

        currency:
          "USD",

        notes:
          body.notes?.trim() ||
          null,

        status:
          "draft",

        created_by:
          user.id,

        approved_by:
          null,

        approved_at:
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
        title,
        distribution_type,
        total_distribution_amount,
        status
        `,
      )
      .single();

    if (
      distributionError ||
      !distribution
    ) {
      console.error(
        "Create distribution database error:",
        distributionError,
      );

      return NextResponse.json(
        {
          error:
            distributionError
              ?.message ??
            "Unable to create distribution.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,

      distributionId:
        distribution.id,

      status:
        distribution.status,
    });
  } catch (error) {
    console.error(
      "Create distribution API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while creating the distribution.",
      },
      {
        status: 500,
      },
    );
  }
}