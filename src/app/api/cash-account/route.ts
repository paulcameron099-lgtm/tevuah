
  import { NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

export async function GET() {
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
          status: 401,
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
          status: 403,
        },
      );
    }

    const admin =
      createAdminClient();

    /*
     * Ensure the investor has a USD cash account.
     * This is safe and idempotent.
     */
    const {
      error:
        ensureError,
    } =
      await admin.rpc(
        "ensure_investor_cash_account",
        {
          p_investor_id:
            user.id,
          p_currency:
            "USD",
        },
      );

    if (ensureError) {
      console.error(
        "Ensure cash account error:",
        ensureError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to prepare cash account.",
        },
        {
          status: 500,
        },
      );
    }

    const {
      data:
        account,
      error:
        accountError,
    } =
      await admin
        .from(
          "investor_cash_accounts",
        )
        .select(
          `
          id,
          investor_id,
          currency,
          available_balance_cents,
          pending_balance_cents,
          status,
          created_at,
          updated_at
          `,
        )
        .eq(
          "investor_id",
          user.id,
        )
        .eq(
          "currency",
          "USD",
        )
        .single();

    if (accountError) {
      console.error(
        "Cash account query error:",
        accountError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to load cash account.",
        },
        {
          status: 500,
        },
      );
    }

    const {
      data:
        ledger,
      error:
        ledgerError,
    } =
      await admin
        .from(
          "investor_cash_ledger",
        )
        .select(
          `
          id,
          account_id,
          investor_id,
          direction,
          entry_type,
          amount_cents,
          currency,
          balance_after_cents,
          status,
          reference,
          description,
          subscription_id,
          payment_id,
          distribution_id,
          reversal_of,
          created_at
          `,
        )
        .eq(
          "investor_id",
          user.id,
        )
        .eq(
          "account_id",
          account.id,
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          },
        )
        .limit(100);

    if (ledgerError) {
      console.error(
        "Cash ledger query error:",
        ledgerError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to load cash activity.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        account,
        ledger:
          ledger ?? [],
      },
      {
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Cash account API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load cash account.",
      },
      {
        status: 500,
      },
    );
  }
}
