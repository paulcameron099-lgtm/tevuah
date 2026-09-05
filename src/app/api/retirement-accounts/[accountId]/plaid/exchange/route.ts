
  import { NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  encryptSensitiveValue,
} from "@/src/lib/retirement/retirement-encryption";

import {
  exchangePlaidPublicToken,
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

type ExchangePayload = {
  publicToken?: string;
  providerAccountId?: string;
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

  const cents =
    Math.round(
      value * 100,
    );

  if (
    !Number.isSafeInteger(
      cents,
    )
  ) {
    throw new Error(
      "Connected retirement balance is too large.",
    );
  }

  return Math.max(
    cents,
    0,
  );
}

export async function POST(
  request: Request,
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

    const payload =
      (await request.json()) as ExchangePayload;

    const publicToken =
      payload.publicToken?.trim();

    const providerAccountId =
      payload.providerAccountId?.trim();

    if (
      !publicToken ||
      !providerAccountId
    ) {
      return NextResponse.json(
        {
          error:
            "Plaid connection result is incomplete.",
        },
        {
          status:
            400,
        },
      );
    }

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

    const exchange =
      await exchangePlaidPublicToken(
        publicToken,
      );

    const holdings =
      await getInvestmentHoldings(
        exchange.access_token,
      );

    const selectedAccount =
      holdings.accounts.find(
        (
          candidate,
        ) =>
          candidate.account_id ===
          providerAccountId,
      );

    if (
      !selectedAccount
    ) {
      return NextResponse.json(
        {
          error:
            "The selected investment account could not be verified in Plaid.",
        },
        {
          status:
            400,
        },
      );
    }

    if (
      selectedAccount.type !==
      "investment"
    ) {
      return NextResponse.json(
        {
          error:
            "Only retirement/investment accounts can be connected here.",
        },
        {
          status:
            400,
        },
      );
    }

    const encryptedAccessToken =
      encryptSensitiveValue(
        exchange.access_token,
      );

    if (
      !encryptedAccessToken
    ) {
      throw new Error(
        "Unable to protect provider access token.",
      );
    }

    const {
      error:
        connectError,
    } =
      await admin.rpc(
        "connect_retirement_account_provider_service",
        {
          p_actor_id:
            user.id,

          p_account_id:
            accountId,

          p_provider_name:
            "plaid",

          p_provider_item_id:
            exchange.item_id,

          p_provider_account_id:
            selectedAccount.account_id,

          p_provider_access_token_encrypted:
            encryptedAccessToken,

          p_current_balance_cents:
            dollarsToCents(
              selectedAccount.balances.current,
            ),

          p_currency:
            selectedAccount.balances.iso_currency_code ??
            "USD",
        },
      );

    if (
      connectError
    ) {
      console.error(
        "Connect retirement account RPC error:",
        connectError,
      );

      return NextResponse.json(
        {
          error:
            connectError.message ||
            "Unable to save secure retirement connection.",
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

        account: {
          provider:
            "Plaid",

          providerAccountId:
            selectedAccount.account_id,

          name:
            selectedAccount.official_name ??
            selectedAccount.name,

          mask:
            selectedAccount.mask,

          subtype:
            selectedAccount.subtype,

          balanceCents:
            dollarsToCents(
              selectedAccount.balances.current,
            ),

          currency:
            selectedAccount.balances.iso_currency_code ??
            "USD",
        },
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
      "Plaid retirement exchange error:",
      error instanceof Error
        ? error.message
        : error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to complete secure institution connection.",
      },
      {
        status:
          500,
      },
    );
  }
}