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
  distributionId?: string;
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
     * 2. REQUEST BODY
     * ==================================================
     */
    const body =
      (await request.json()) as Payload;

    const distributionId =
      body.distributionId?.trim();

    if (!distributionId) {
      return NextResponse.json(
        {
          error:
            "Distribution ID is required.",
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
     * 3. LOAD DISTRIBUTION
     * ==================================================
     */
    const {
      data: distribution,
      error: distributionError,
    } = await admin
      .from(
        "investment_distributions",
      )
      .select(
        `
        id,
        opportunity_id,
        record_date,
        total_distribution_amount,
        status
        `,
      )
      .eq(
        "id",
        distributionId,
      )
      .maybeSingle();

    if (
      distributionError ||
      !distribution
    ) {
      console.error(
        "Approve distribution lookup error:",
        distributionError,
      );

      return NextResponse.json(
        {
          error:
            "Distribution could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * ==================================================
     * 4. STATUS CHECK
     * ==================================================
     */
    if (
      distribution.status ===
      "approved"
    ) {
      return NextResponse.json(
        {
          error:
            "This distribution has already been approved.",
        },
        {
          status: 409,
        },
      );
    }

    if (
      distribution.status !==
      "draft"
    ) {
      return NextResponse.json(
        {
          error:
            "Only draft distributions can be approved.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * ==================================================
     * 5. BASIC AMOUNT CHECK
     * ==================================================
     */
    if (
      Number(
        distribution.total_distribution_amount,
      ) <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Distribution amount must be greater than zero.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ==================================================
     * 6. ATOMIC APPROVAL
     * ==================================================
     *
     * RPC handles:
     *
     * - position eligibility
     * - proportional allocation
     * - rounding remainder
     * - investor_distribution inserts
     * - parent distribution approval
     *
     * All inside one PostgreSQL transaction.
     */
    const {
      data: approvalResult,
      error: approvalError,
    } = await admin.rpc(
      "approve_investment_distribution",
      {
        p_distribution_id:
          distribution.id,

        p_admin_id:
          user.id,
      },
    );

    if (approvalError) {
      console.error(
        "approve_investment_distribution RPC error:",
        approvalError,
      );

      return NextResponse.json(
        {
          error:
            approvalError.message ??
            "Unable to approve distribution.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * ==================================================
     * 7. VERIFY ALLOCATIONS
     * ==================================================
     */
    const {
      data: allocationSummary,
      error: allocationError,
    } = await admin
      .from(
        "investor_distributions",
      )
      .select(
        `
        id,
        gross_amount,
        withholding_amount,
        net_amount,
        status
        `,
      )
      .eq(
        "distribution_id",
        distribution.id,
      );

    if (allocationError) {
      console.error(
        "Approved distribution allocation lookup error:",
        allocationError,
      );
    }

    const allocations =
      allocationSummary ??
      [];

    const totalAllocated =
      allocations.reduce(
        (
          total,
          allocation,
        ) =>
          total +
          Number(
            allocation.gross_amount,
          ),
        0,
      );

    /*
     * ==================================================
     * 8. SUCCESS
     * ==================================================
     */
    return NextResponse.json({
      success: true,

      distributionId:
        distribution.id,

      investorCount:
        allocations.length,

      totalAllocated,

      result:
        approvalResult,
    });
  } catch (error) {
    console.error(
      "Approve distribution API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while approving the distribution.",
      },
      {
        status: 500,
      },
    );
  }
}