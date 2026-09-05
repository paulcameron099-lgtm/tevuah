import {
  ArrowRight,
  CircleAlert,
  CircleCheck,
  Landmark,
  PiggyBank,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import Link from "next/link";
import {
  redirect,
} from "next/navigation";

import {
  AddRetirementAccountForm,
} from "@/src/components/retirement/add-retirement-account-form";

import {
  RetirementProviderActions,
} from "@/src/components/retirement/retirement-provider-actions";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type RetirementAccount = {
  id: string;
  account_type: string;
  institution_name: string;
  plan_provider: string | null;
  plan_sponsor: string | null;
  account_holder_name: string;
  account_last_four: string | null;
  approximate_balance_cents: number | string | null;
  current_balance_cents: number | string | null;
  currency: string;
  employment_status: string | null;
  rollover_eligibility: string;
  connection_method: string;
  provider_name: string | null;
  connection_status: string;
  verification_status: string;
  funding_eligibility_status: string;
  last_synced_at: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
};

export default async function RetirementAccountsPage() {
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
      "/dashboard",
    );
  }

  const admin =
    createAdminClient();

  const {
    data,
    error,
  } =
    await admin
      .from(
        "investor_retirement_accounts_safe",
      )
      .select(
        `
        id,
        account_type,
        institution_name,
        plan_provider,
        plan_sponsor,
        account_holder_name,
        account_last_four,
        approximate_balance_cents,
        current_balance_cents,
        currency,
        employment_status,
        rollover_eligibility,
        connection_method,
        provider_name,
        connection_status,
        verification_status,
        funding_eligibility_status,
        last_synced_at,
        verified_at,
        rejection_reason,
        created_at,
        updated_at
        `,
      )
      .eq(
        "investor_id",
        user.id,
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        },
      );

  if (error) {
    console.error(
      "Retirement account load error:",
      error,
    );

    throw new Error(
      "Unable to load retirement accounts.",
    );
  }

  const accounts =
    (data ??
      []) as RetirementAccount[];

  const verifiedCount =
    accounts.filter(
      (
        account,
      ) =>
        account.verification_status ===
        "verified",
    ).length;

  const eligibleCount =
    accounts.filter(
      (
        account,
      ) =>
        account.funding_eligibility_status ===
        "eligible",
    ).length;

  const totalApproximateBalance =
    accounts.reduce(
      (
        total,
        account,
      ) =>
        total +
        safeMoneyNumber(
          account.current_balance_cents ??
            account.approximate_balance_cents,
        ),
      0,
    );

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
            Retirement investing
          </p>

          <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
            Retirement Accounts
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
            Track retirement accounts that may be reviewed for future Tevuah investment funding. A connected or verified account is not automatically an eligible funding source.
          </p>
        </div>

        <Link
          href="/dashboard/activity"
          className="focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 self-start rounded-full border border-forest-900/10 bg-white px-5 text-sm font-semibold text-forest-950 transition hover:bg-ivory-50 lg:self-auto"
        >
          Account activity

          <ArrowRight className="size-4" />
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Retirement accounts"
          value={
            String(
              accounts.length,
            )
          }
        />

        <SummaryCard
          label="Verified"
          value={
            String(
              verifiedCount,
            )
          }
        />

        <SummaryCard
          label="Eligible funding sources"
          value={
            String(
              eligibleCount,
            )
          }
        />

        <SummaryCard
          label="Reported balance"
          value={
            formatMoney(
              totalApproximateBalance,
              "USD",
            )
          }
        />
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
        <div className="border-b border-forest-900/10 px-6 py-6 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
            Your accounts
          </p>

          <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
            Retirement account overview
          </h2>
        </div>

        {accounts.length ===
        0 ? (
          <div className="px-6 py-16 text-center sm:px-8">
            <PiggyBank className="mx-auto size-8 text-stone-300" />

            <h3 className="font-display mt-4 text-2xl font-semibold text-forest-950">
              No retirement accounts added yet.
            </h3>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-stone-500">
              Add your 401(k), IRA or other retirement account below to begin the review process.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-forest-900/10">
            {accounts.map(
              (
                account,
              ) => (
                <RetirementAccountRow
                  key={
                    account.id
                  }
                  account={
                    account
                  }
                />
              ),
            )}
          </div>
        )}
      </section>

      <AddRetirementAccountForm />
    </div>
  );
}

function RetirementAccountRow({
  account,
}: {
  account:
    RetirementAccount;
}) {
  const balance =
    safeMoneyNumber(
      account.current_balance_cents ??
        account.approximate_balance_cents,
    );

  return (
    <article className="p-6 sm:p-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              status={
                account.verification_status
              }
              type="verification"
            />

            <StatusBadge
              status={
                account.funding_eligibility_status
              }
              type="funding"
            />
          </div>

          <div className="mt-4 flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ivory-100 text-forest-950">
              <Landmark className="size-5" />
            </div>

            <div className="min-w-0">
              <h3 className="font-display text-2xl font-semibold text-forest-950">
                {account.institution_name}
              </h3>

              <p className="mt-1 text-sm text-stone-500">
                {formatAccountType(
                  account.account_type,
                )}

                {account.account_last_four
                  ? ` •••• ${account.account_last_four}`
                  : ""}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            <DataPoint
              label="Reported balance"
              value={
                balance >
                0
                  ? formatMoney(
                      balance,
                      account.currency,
                    )
                  : "Not provided"
              }
            />

            <DataPoint
              label="Plan sponsor"
              value={
                account.plan_sponsor ??
                "Not provided"
              }
            />

            <DataPoint
              label="Rollover eligibility"
              value={
                humanize(
                  account.rollover_eligibility,
                )
              }
            />

            <DataPoint
              label="Connection"
              value={
                humanize(
                  account.connection_status,
                )
              }
            />
          </div>

          {account.rejection_reason ? (
            <div className="mt-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-700" />

              <p className="text-sm leading-6 text-red-800">
                {account.rejection_reason}
              </p>
            </div>
          ) : null}
        </div>

        <div className="space-y-4 xl:w-104 xl:shrink-0">
          {/* <div className="rounded-2xl border border-forest-900/10 bg-white p-4">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-forest-950" />

              <p className="text-xs leading-6 text-stone-600">
                Sensitive identifiers are encrypted. Tevuah never asks you to store your retirement-plan password, MFA code or security answers here.
              </p>
            </div>
          </div> */}

          <RetirementProviderActions
            accountId={
              account.id
            }
            connectionStatus={
              account.connection_status
            }
            fundingEligibilityStatus={
              account.funding_eligibility_status
            }
            verificationStatus={
              account.verification_status
            }
            providerName={
              account.provider_name
            }
            lastSyncedAt={
              account.last_synced_at
            }
          />
        </div>
      </div>
    </article>
  );
}

function StatusBadge({
  status,
  type,
}: {
  status: string;
  type:
    | "verification"
    | "funding";
}) {
  const positive =
    status ===
      "verified" ||
    status ===
      "eligible";

  const pending =
    status ===
      "pending_review" ||
    status ===
      "under_review";

  const Icon =
    positive
      ? CircleCheck
      : pending
        ? WalletCards
        : CircleAlert;

  const label =
    type ===
    "verification"
      ? `Verification: ${humanize(
          status,
        )}`
      : `Funding: ${humanize(
          status,
        )}`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest ${
        positive
          ? "bg-emerald-50 text-emerald-700"
          : pending
            ? "bg-amber-50 text-amber-700"
            : "bg-stone-100 text-stone-600"
      }`}
    >
      <Icon className="size-3" />

      {label}
    </span>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-forest-900/10 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <p className="font-display mt-3 text-3xl font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

function DataPoint({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

function safeMoneyNumber(
  value:
    | number
    | string
    | null,
) {
  if (
    value === null
  ) {
    return 0;
  }

  const number =
    Number(value);

  return Number.isFinite(
    number,
  )
    ? number
    : 0;
}

function formatMoney(
  cents: number,
  currency: string,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style:
        "currency",

      currency:
        currency ||
        "USD",

      maximumFractionDigits:
        0,
    },
  ).format(
    cents / 100,
  );
}

function formatAccountType(
  type: string,
) {
  const labels:
    Record<
      string,
      string
    > = {
      "401k":
        "401(k)",
      "403b":
        "403(b)",
      "457b":
        "457(b)",
      traditional_ira:
        "Traditional IRA",
      roth_ira:
        "Roth IRA",
      sep_ira:
        "SEP IRA",
      simple_ira:
        "SIMPLE IRA",
      rollover_ira:
        "Rollover IRA",
      pension:
        "Pension",
      other:
        "Other",
    };

  return (
    labels[type] ??
    humanize(type)
  );
}

function humanize(
  value: string,
) {
  return value
    .replaceAll(
      "_",
      " ",
    )
    .replace(
      /\b\w/g,
      (
        letter,
      ) =>
        letter.toUpperCase(),
    );
}