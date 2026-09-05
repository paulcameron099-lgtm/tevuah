import {
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createRetirementLinkToken,
} from "@/src/lib/retirement/plaid-retirement";

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
      data:
        account,
      error:
        accountError,
    } =
      await admin
        .from(
          "investor_retirement_accounts",
        )
        .select(
          "id, investor_id",
        )
        .eq(
          "id",
          accountId,
        )
        .eq(
          "investor_id",
          user.id,
        )
        .maybeSingle();

    if (
      accountError ||
      !account
    ) {
      return NextResponse.json(
        {
          error:
            "Retirement account not found.",
        },
        {
          status:
            404,
        },
      );
    }

    const result =
      await createRetirementLinkToken(
        user.id,
      );

    return NextResponse.json(
      {
        success:
          true,

        linkToken:
          result.link_token,

        expiration:
          result.expiration,
      },
      {
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Plaid link token error:",
      error instanceof Error
        ? error.message
        : error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start secure institution connection.",
      },
      {
        status:
          500,
      },
    );
  }
}
