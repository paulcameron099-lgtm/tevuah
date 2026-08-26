import {
  NextResponse,
} from "next/server";

import { checkAccountAccess } from "@/src/lib/auth/account-status";
import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    opportunityId: string;
  }>;
};

export async function POST(
  _request: Request,
  {
    params,
  }: RouteContext,
) {
  try {
    /*
     * --------------------------------------------------
     * 1. AUTHENTICATION
     * --------------------------------------------------
     */
    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Sign in before starting an investment.",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 2. INVESTOR ROLE
     * --------------------------------------------------
     */
    if (
      user.role !==
      "investor"
    ) {
      return NextResponse.json(
        {
          error:
            "Only investor accounts can start an investment.",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 3. ACCOUNT STATUS
     * --------------------------------------------------
     */
    const accountAccess =
      await checkAccountAccess(
        user.id,
      );

    if (
      !accountAccess.allowed
    ) {
      return NextResponse.json(
        {
          error:
            accountAccess.reason,

          accountStatus:
            accountAccess.status,
        },
        {
          status: 403,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 4. VERIFICATION STATUS
     * --------------------------------------------------
     */
    if (
      user.onboarding_status !==
      "approved"
    ) {
      return NextResponse.json(
        {
          error:
            "Your investor verification must be approved before investing.",
        },
        {
          status: 403,
        },
      );
    }

    const {
      opportunityId,
    } = await params;

    const admin =
      createAdminClient();

    /*
     * --------------------------------------------------
     * 5. OPPORTUNITY MUST STILL BE PUBLISHED
     * --------------------------------------------------
     */
    const {
      data: opportunity,
      error,
    } = await admin
      .from(
        "investment_opportunities",
      )
      .select(
        `
        id,
        title,
        status,
        funding_target,
        minimum_investment,
        total_funded
        `,
      )
      .eq(
        "id",
        opportunityId,
      )
      .maybeSingle();

    if (
      error ||
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

    if (
      opportunity.status !==
      "published"
    ) {
      return NextResponse.json(
        {
          error:
            "This investment opportunity is no longer open.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 6. CHECK CAPACITY
     * --------------------------------------------------
     */
    const remaining =
      Number(
        opportunity.funding_target,
      ) -
      Number(
        opportunity.total_funded,
      );

    if (
      remaining <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "This opportunity is fully funded.",
        },
        {
          status: 409,
        },
      );
    }

    if (
      remaining <
      Number(
        opportunity.minimum_investment,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "The remaining allocation is below the minimum investment amount.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 7. START SUBSCRIPTION FLOW
     * --------------------------------------------------
     *
     * No capital is committed yet.
     */
    return NextResponse.json({
      success: true,

      next:
        `/dashboard/investments/subscribe/${opportunityId}`,
    });
  } catch (error) {
    console.error(
      "Begin investment API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while starting the investment.",
      },
      {
        status: 500,
      },
    );
  }
}