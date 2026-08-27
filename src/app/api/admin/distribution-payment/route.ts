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
  action?:
    | "start_processing"
    | "mark_paid";

  distributionId?:
    | string;

  investorDistributionId?:
    | string;

  paymentReference?:
    | string;
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

    const admin =
      createAdminClient();

    /*
     * ==================================================
     * 3. START PROCESSING
     * ==================================================
     */
    if (
      body.action ===
      "start_processing"
    ) {
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

      const {
        data,
        error,
      } = await admin.rpc(
        "start_distribution_processing",
        {
          p_distribution_id:
            distributionId,

          p_admin_id:
            user.id,
        },
      );

      if (error) {
        console.error(
          "start_distribution_processing RPC error:",
          error,
        );

        return NextResponse.json(
          {
            error:
              error.message ??
              "Unable to start distribution processing.",
          },
          {
            status: 409,
          },
        );
      }

      return NextResponse.json({
        success: true,

        action:
          "start_processing",

        result:
          data,
      });
    }

    /*
     * ==================================================
     * 4. MARK INVESTOR PAID
     * ==================================================
     */
    if (
      body.action ===
      "mark_paid"
    ) {
      const investorDistributionId =
        body.investorDistributionId?.trim();

      const paymentReference =
        body.paymentReference?.trim();

      if (
        !investorDistributionId
      ) {
        return NextResponse.json(
          {
            error:
              "Investor distribution ID is required.",
          },
          {
            status: 400,
          },
        );
      }

      if (!paymentReference) {
        return NextResponse.json(
          {
            error:
              "Payment reference is required.",
          },
          {
            status: 400,
          },
        );
      }

      /*
       * Confirm allocation exists before RPC.
       */
      const {
        data: allocation,
        error:
          allocationError,
      } = await admin
        .from(
          "investor_distributions",
        )
        .select(
          `
          id,
          distribution_id,
          investor_id,
          net_amount,
          status
          `,
        )
        .eq(
          "id",
          investorDistributionId,
        )
        .maybeSingle();

      if (
        allocationError ||
        !allocation
      ) {
        return NextResponse.json(
          {
            error:
              "Investor distribution allocation could not be found.",
          },
          {
            status: 404,
          },
        );
      }

      if (
        allocation.status ===
        "paid"
      ) {
        return NextResponse.json(
          {
            error:
              "This investor distribution has already been paid.",
          },
          {
            status: 409,
          },
        );
      }

      if (
        allocation.status !==
        "processing"
      ) {
        return NextResponse.json(
          {
            error:
              "This investor distribution is not currently processing.",
          },
          {
            status: 409,
          },
        );
      }

      const {
        data,
        error,
      } = await admin.rpc(
        "mark_investor_distribution_paid",
        {
          p_investor_distribution_id:
            investorDistributionId,

          p_admin_id:
            user.id,

          p_payment_reference:
            paymentReference,
        },
      );

      if (error) {
        console.error(
          "mark_investor_distribution_paid RPC error:",
          error,
        );

        return NextResponse.json(
          {
            error:
              error.message ??
              "Unable to mark investor distribution as paid.",
          },
          {
            status: 409,
          },
        );
      }

      return NextResponse.json({
        success: true,

        action:
          "mark_paid",

        result:
          data,
      });
    }

    /*
     * ==================================================
     * 5. INVALID ACTION
     * ==================================================
     */
    return NextResponse.json(
      {
        error:
          "Invalid distribution payment action.",
      },
      {
        status: 400,
      },
    );
  } catch (error) {
    console.error(
      "Distribution payment API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while processing the distribution.",
      },
      {
        status: 500,
      },
    );
  }
}