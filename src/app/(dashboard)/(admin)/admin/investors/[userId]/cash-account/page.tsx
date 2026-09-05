

import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Banknote,
  LockKeyhole,
  ReceiptText,
} from "lucide-react";

import {
  AdminInvestorCashAccountButton,
} from "@/src/components/admin/investors/admin-investor-cash-account-button";

import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  AdminFundCashAccountForm,
} from "@/src/components/admin/cash-account/admin-fund-cash-account-form";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  formatCashMoney,
} from "@/src/lib/cash-account/cash-money";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

type PageProps = {
  params: Promise<{
    userId: string;
  }>;
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
      hour:
        "numeric",
      minute:
        "2-digit",
    },
  ).format(
    new Date(
      value,
    ),
  );
}

export default async function AdminInvestorCashAccountPage({
  params,
}: PageProps) {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect(
      "/login",
    );
  }

  if (
    user.role !==
      "admin" &&
    user.role !==
      "super_admin"
  ) {
    redirect(
      "/dashboard",
    );
  }

  const {
    userId,
  } =
    await params;

  const admin =
    createAdminClient();

  const {
    data:
      investor,
    error:
      investorError,
  } =
    await admin
      .from(
        "profiles",
      )
      .select(
        "id, first_name, last_name, role, account_status, onboarding_status",
      )
      .eq(
        "id",
        userId,
      )
      .single();

  if (
    investorError ||
    !investor ||
    investor.role !==
      "investor"
  ) {
    notFound();
  }

  await admin
    .from(
      "investor_cash_accounts",
    )
    .upsert(
      {
        investor_id:
          investor.id,
        currency:
          "USD",
      },
      {
        onConflict:
          "investor_id,currency",
        ignoreDuplicates:
          true,
      },
    );

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
        investor.id,
      )
      .eq(
        "currency",
        "USD",
      )
      .single();

  if (
    accountError ||
    !account
  ) {
    throw new Error(
      "Unable to load investor cash account.",
    );
  }

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
        reference,
        description,
        created_at
        `,
      )
      .eq(
        "account_id",
        account.id,
      )
      .eq(
        "investor_id",
        investor.id,
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        },
      )
      .limit(
        50,
      );

  if (ledgerError) {
    console.error(
      "Admin investor cash ledger error:",
      ledgerError,
    );
  }

  const ledger =
    (ledgerData ??
      []) as CashLedgerEntry[];

  const investorName =
    [
      investor.first_name,
      investor.last_name,
    ]
      .filter(
        Boolean,
      )
      .join(
        " ",
      ) ||
    "Investor";

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/admin/investors/${investor.id}`}
          className="focus-ring inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-forest-900 transition hover:text-forest-700"
        >
          <ArrowLeft className="size-4" />
          Back to investor
        </Link>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold-700">
              Investor cash account
            </p>

            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-forest-950">
              {investorName}
            </h1>

            <p className="mt-2 text-sm text-stone-500">
              Review balances, ledger activity, and authorized Admin funding.
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-forest-900/10 bg-white px-3 py-2 text-xs font-semibold capitalize text-forest-900">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            {account.status}
          </span>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-forest-900/10 bg-forest-950 p-6 text-white shadow-sm md:col-span-2">
          <div className="flex items-center gap-2 text-gold-400">
            <Banknote className="size-4.5" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em]">
              Available cash
            </span>
          </div>

          <p className="mt-5 font-display text-4xl font-semibold tracking-tight">
            {formatCashMoney(
              account.available_balance_cents,
              account.currency,
            )}
          </p>

          <p className="mt-3 text-sm text-white/55">
            Funds available for eligible Tevuah Reserve investment activity.
          </p>
        </div>

        <div className="rounded-3xl border border-forest-900/10 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-400">
            Pending cash
          </p>

          <p className="mt-5 font-display text-3xl font-semibold text-forest-950">
            {formatCashMoney(
              account.pending_balance_cents,
              account.currency,
            )}
          </p>

          <div className="mt-5 flex items-center gap-2 text-xs text-stone-500">
            <LockKeyhole className="size-3.5" />
            Ledger controlled
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
        <AdminFundCashAccountForm
          investorId={
            investor.id
          }
          investorName={
            investorName
          }
        />

        <div className="overflow-hidden rounded-4xl border border-forest-900/10 bg-white shadow-sm">
          <div className="border-b border-forest-900/10 p-6 sm:p-7">
            <div className="flex items-center gap-2">
              <ReceiptText className="size-4.5 text-forest-900" />

              <h2 className="font-display text-xl font-semibold text-forest-950">
                Cash ledger
              </h2>
            </div>

            <p className="mt-2 text-sm text-stone-500">
              Latest immutable transactions for this investor.
            </p>
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
                      className="grid gap-4 p-6 sm:grid-cols-[1fr_auto] sm:items-center"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full ${
                            isCredit
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="size-4" />
                          ) : (
                            <ArrowUpRight className="size-4" />
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
                              "Cash account activity"}
                          </p>

                          <p className="mt-2 text-[0.68rem] text-stone-400">
                            {formatDate(
                              entry.created_at,
                            )}
                            {entry.reference
                              ? ` • ${entry.reference}`
                              : ""}
                          </p>
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
            <div className="px-6 py-14 text-center text-sm text-stone-500">
              No cash-account activity has been posted yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}