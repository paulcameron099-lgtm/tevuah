import {
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  decryptSensitiveValue,
} from "@/src/lib/retirement/retirement-encryption";

import {
  getInvestmentHoldings,
} from "@/src/lib/retirement/plaid-retirement";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    accountId: string;
  }>;
};

function dollarsToCents(
  value:
    | number
    | null,
) {
  if (
    value === null ||
    !Number.isFinite(
      value,
    )
  ) {
    return null;
  }

  return Math.max(
    Math.round(
      value * 100,
    ),
    0,
  );
}

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
          `
          id,
          investor_id,
          provider_name,
          provider_account_id,
          provider_access_token_encrypted,
          connection_status
          `,
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

    if (
      account.provider_name !==
        "plaid" ||
      account.connection_status !==
        "connected" ||
      !account.provider_account_id ||
      !account.provider_access_token_encrypted
    ) {
      return NextResponse.json(
        {
          error:
            "This retirement account is not connected through Plaid.",
        },
        {
          status:
            400,
        },
      );
    }

    const accessToken =
      decryptSensitiveValue(
        account.provider_access_token_encrypted,
      );

    const holdings =
      await getInvestmentHoldings(
        accessToken,
      );

    const selectedAccount =
      holdings.accounts.find(
        (
          candidate,
        ) =>
          candidate.account_id ===
          account.provider_account_id,
      );

    if (
      !selectedAccount
    ) {
      return NextResponse.json(
        {
          error:
            "The connected retirement account is no longer available from the provider.",
        },
        {
          status:
            409,
        },
      );
    }

    const balanceCents =
      dollarsToCents(
        selectedAccount.balances.current,
      );

    const {
      error:
        syncError,
    } =
      await admin.rpc(
        "sync_retirement_account_provider_service",
        {
          p_actor_id:
            user.id,

          p_account_id:
            accountId,

          p_current_balance_cents:
            balanceCents,

          p_currency:
            selectedAccount.balances.iso_currency_code ??
            "USD",
        },
      );

    if (
      syncError
    ) {
      return NextResponse.json(
        {
          error:
            syncError.message ||
            "Unable to save synchronized retirement balance.",
        },
        {
          status:
            500,
        },
      );
    }

    return NextResponse.json(
      {
        success:
          true,

        balanceCents,

        currency:
          selectedAccount.balances.iso_currency_code ??
          "USD",
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
      "Retirement account sync error:",
      error instanceof Error
        ? error.message
        : error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to synchronize retirement account.",
      },
      {
        status:
          500,
      },
    );
  }
}
