import {
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    accountId: string;
  }>;
};

export async function POST(
  _request: Request,
  context: RouteContext,
) {
  try {
    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Unauthorized.",
        },
        {
          status:
            401,
        },
      );
    }

    if (
      user.role !==
      "investor"
    ) {
      return NextResponse.json(
        {
          error:
            "Investor access required.",
        },
        {
          status:
            403,
        },
      );
    }

    const {
      accountId,
    } =
      await context.params;

    const admin =
      createAdminClient();

    const {
      error,
    } =
      await admin.rpc(
        "request_retirement_funding_review_service",
        {
          p_actor_id:
            user.id,

          p_account_id:
            accountId,
        },
      );

    if (error) {
      return NextResponse.json(
        {
          error:
            error.message ||
            "Unable to request funding-source review.",
        },
        {
          status:
            400,
        },
      );
    }

    return NextResponse.json(
      {
        success:
          true,
      },
    );
  } catch (error) {
    console.error(
      "Retirement funding review request error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to request retirement funding-source review.",
      },
      {
        status:
          500,
      },
    );
  }
}
