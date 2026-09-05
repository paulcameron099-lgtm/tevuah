

import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Landmark,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import {
  redirect,
} from "next/navigation";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  formatCashMoney,
} from "@/src/lib/cash-account/cash-money";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

import Link from "next/link";

export const dynamic =
  "force-dynamic";

type CashAccount = {
  id: string;
  investor_id: string;
  currency: string;
  available_balance_cents: number;
  pending_balance_cents: number;
  status: string;
  created_at: string;
  updated_at: string;
};

type CashLedgerEntry = {
  id: string;
  direction:
    | "credit"
    | "debit";
  entry_type: string;
  amount_cents: number;
  currency: string;
  balance_after_cents: number;
  status: string;
  reference:
    | string
    | null;
  description:
    | string
    | null;
  created_at: string;
};

function formatEntryType(
  value: string,
) {
  return value
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month:
        "short",
      day:
        "numeric",
      year:
        "numeric",
    },
  ).format(
    new Date(value),
  );
}

export default async function CashAccountPage() {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect(
      "/login",
    );
  }

  if (
    user.role !==
    "investor"
  ) {
    redirect(
      "/admin",
    );
  }

  const admin =
    createAdminClient();

  /*
   * Every investor gets one USD cash account.
   * The RPC is idempotent, so it is safe to call
   * whenever the page loads.
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

    throw new Error(
      "Unable to prepare your Tevuah Cash Account.",
    );
  }

  const {
    data:
      accountData,
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

  if (
    accountError ||
    !accountData
  ) {
    console.error(
      "Cash account load error:",
      accountError,
    );

    throw new Error(
      "Unable to load your Tevuah Cash Account.",
    );
  }

  const account =
    accountData as CashAccount;

  const {
    data:
      ledgerData,
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
        direction,
        entry_type,
        amount_cents,
        currency,
        balance_after_cents,
        status,
        reference,
        description,
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
      .limit(50);

  if (ledgerError) {
    console.error(
      "Cash ledger load error:",
      ledgerError,
    );
  }

  const ledger =
    (ledgerData ??
      []) as CashLedgerEntry[];

  const postedCredits =
    ledger
      .filter(
        (entry) =>
          entry.direction ===
          "credit" &&
          entry.status ===
          "posted",
      )
      .reduce(
        (
          total,
          entry,
        ) =>
          total +
          entry.amount_cents,
        0,
      );

  const postedDebits =
    ledger
      .filter(
        (entry) =>
          entry.direction ===
          "debit" &&
          entry.status ===
          "posted",
      )
      .reduce(
        (
          total,
          entry,
        ) =>
          total +
          entry.amount_cents,
        0,
      );

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-forest-900/10 bg-forest-950 text-white shadow-sm">
        <div className="grid gap-8 p-7 sm:p-9 lg:grid-cols-[1.25fr_0.75fr] lg:p-10">
          <div>
            <div className="flex items-center gap-2 text-gold-400">
              <WalletCards className="size-4.5" />

              <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                Tevuah Cash Account
              </p>
            </div>

            <h1 className="mt-5 max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Cash ready for your next investment.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">
              Your Tevuah Cash Account holds available funds that can be used
              for eligible Tevuah Reserve investments. Every credit and debit
              is recorded in your permanent account ledger.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/investments"
                className="focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-gold-500 px-5 text-sm font-semibold text-forest-950 transition hover:bg-gold-400"
              >
                Explore investments
                <ArrowRight className="size-4" />
              </Link>

              <Link
                href="/dashboard/account"
                className="focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-semibold text-white transition hover:bg-white/8"
              >
                Account settings
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/6 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
              Available balance
            </p>

            <p className="mt-3 font-display text-4xl font-semibold tracking-tight text-white">
              {formatCashMoney(
                account.available_balance_cents,
                account.currency,
              )}
            </p>

            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
              <div>
                <p className="text-xs text-white/40">
                  Pending
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {formatCashMoney(
                    account.pending_balance_cents,
                    account.currency,
                  )}
                </p>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold capitalize text-emerald-200">
                <span className="size-1.5 rounded-full bg-emerald-300" />
                {account.status}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-forest-900/10 bg-white p-6">
          <div className="flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <ArrowDownLeft className="size-4.5" />
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
            Recent credits
          </p>

          <p className="mt-2 font-display text-2xl font-semibold text-forest-950">
            {formatCashMoney(
              postedCredits,
              account.currency,
            )}
          </p>

          <p className="mt-2 text-xs leading-5 text-stone-500">
            Credits shown from the latest account activity loaded below.
          </p>
        </div>

        <div className="rounded-3xl border border-forest-900/10 bg-white p-6">
          <div className="flex size-10 items-center justify-center rounded-full bg-amber-50 text-amber-700">
            <ArrowUpRight className="size-4.5" />
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
            Recent debits
          </p>

          <p className="mt-2 font-display text-2xl font-semibold text-forest-950">
            {formatCashMoney(
              postedDebits,
              account.currency,
            )}
          </p>

          <p className="mt-2 text-xs leading-5 text-stone-500">
            Investment and other debit activity from the latest ledger entries.
          </p>
        </div>

        <div className="rounded-3xl border border-forest-900/10 bg-white p-6">
          <div className="flex size-10 items-center justify-center rounded-full bg-ivory-100 text-forest-900">
            <ShieldCheck className="size-4.5" />
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
            Account protection
          </p>

          <p className="mt-2 text-sm font-semibold text-forest-950">
            Immutable transaction history
          </p>

          <p className="mt-2 text-xs leading-5 text-stone-500">
            Posted cash activity cannot be silently edited or deleted.
          </p>
        </div>
      </section>

      <section className="rounded-4xl border border-forest-900/10 bg-white">
        <div className="flex flex-col gap-4 border-b border-forest-900/10 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <div className="flex items-center gap-2 text-forest-950">
              <ReceiptText className="size-4.5" />

              <h2 className="font-display text-xl font-semibold">
                Account activity
              </h2>
            </div>

            <p className="mt-2 text-sm text-stone-500">
              Your latest Tevuah Cash Account ledger entries.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-ivory-100 px-3 py-2 text-xs font-semibold text-forest-900">
            <LockKeyhole className="size-3.5" />
            Read-only ledger
          </div>
        </div>

        {ledger.length >
        0 ? (
          <div className="divide-y divide-forest-900/8">
            {ledger.map(
              (
                entry,
              ) => {
                const isCredit =
                  entry.direction ===
                  "credit";

                return (
                  <div
                    key={
                      entry.id
                    }
                    className="grid gap-4 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-7"
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <div
                        className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full ${
                          isCredit
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="size-4.5" />
                        ) : (
                          <ArrowUpRight className="size-4.5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-forest-950">
                          {formatEntryType(
                            entry.entry_type,
                          )}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-stone-500">
                          {entry.description ||
                            entry.reference ||
                            "Tevuah Cash Account activity"}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.68rem] text-stone-400">
                          <span>
                            {formatDate(
                              entry.created_at,
                            )}
                          </span>

                          {entry.reference ? (
                            <>
                              <span>
                                •
                              </span>
                              <span className="truncate">
                                {
                                  entry.reference
                                }
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <p
                        className={`text-sm font-bold ${
                          isCredit
                            ? "text-emerald-700"
                            : "text-forest-950"
                        }`}
                      >
                        {isCredit
                          ? "+"
                          : "-"}
                        {formatCashMoney(
                          entry.amount_cents,
                          entry.currency,
                        )}
                      </p>

                      <p className="mt-1 text-[0.68rem] text-stone-400">
                        Balance{" "}
                        {formatCashMoney(
                          entry.balance_after_cents,
                          entry.currency,
                        )}
                      </p>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        ) : (
          <div className="px-6 py-16 text-center sm:px-7">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-ivory-100 text-forest-900">
              <Landmark className="size-5" />
            </div>

            <h3 className="mt-5 font-display text-lg font-semibold text-forest-950">
              No cash activity yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
              Funding, investment debits, distributions, refunds, and
              authorized adjustments will appear here when they occur.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}