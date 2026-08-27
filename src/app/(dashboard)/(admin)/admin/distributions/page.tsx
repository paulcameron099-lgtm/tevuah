import {
  ArrowRight,
  CircleDollarSign,
  Clock3,
  HandCoins,
  Plus,
  ShieldCheck,
} from "lucide-react";

import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

export default async function AdminDistributionsPage() {
  /*
   * ==================================================
   * 1. ADMIN AUTH
   * ==================================================
   */
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (
    user.role !== "admin" &&
    user.role !== "super_admin"
  ) {
    redirect("/dashboard");
  }

  const admin =
    createAdminClient();

  /*
   * ==================================================
   * 2. LOAD DISTRIBUTIONS
   * ==================================================
   */
  const {
    data: distributions,
    error,
  } = await admin
    .from(
      "investment_distributions",
    )
    .select(
      `
      id,

      opportunity_id,

      title,
      distribution_type,

      record_date,
      payment_date,

      total_distribution_amount,
      currency,

      notes,

      status,

      created_by,
      approved_by,
      approved_at,

      created_at,
      updated_at,

      opportunity:investment_opportunities!investment_distributions_opportunity_id_fkey (
        id,
        slug,
        title,
        asset_category,
        total_funded,
        investor_count,
        status
      )
      `,
    )
    .order(
      "record_date",
      {
        ascending:
          false,
      },
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
      "Admin distributions load error:",
      error,
    );

    throw new Error(
      "Unable to load investment distributions.",
    );
  }

  const records =
    distributions ?? [];

  /*
   * ==================================================
   * 3. SUMMARY
   * ==================================================
   */
  const draftCount =
    records.filter(
      (distribution) =>
        distribution.status ===
        "draft",
    ).length;

  const approvedCount =
    records.filter(
      (distribution) =>
        [
          "approved",
          "processing",
        ].includes(
          distribution.status,
        ),
    ).length;

  const paidRecords =
    records.filter(
      (distribution) =>
        distribution.status ===
        "paid",
    );

  const totalPaid =
    paidRecords.reduce(
      (
        total,
        distribution,
      ) =>
        total +
        Number(
          distribution.total_distribution_amount,
        ),
      0,
    );

  /*
   * ==================================================
   * 4. RENDER
   * ==================================================
   */
  return (
    <div className="space-y-8">
      {/* HEADER */}

      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
            Portfolio administration
          </p>

          <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
            Investment Distributions
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
            Create, review and track investor income,
            dividends, interest, profit distributions,
            return of capital and redemption payments.
          </p>
        </div>

        <Link
          href="/admin/distributions/new"
          className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800"
        >
          <Plus className="size-4" />

          Create distribution
        </Link>
      </div>

      {/* SUMMARY */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={
            HandCoins
          }
          label="All distributions"
          value={String(
            records.length,
          )}
        />

        <SummaryCard
          icon={
            Clock3
          }
          label="Draft"
          value={String(
            draftCount,
          )}
        />

        <SummaryCard
          icon={
            ShieldCheck
          }
          label="Approved / processing"
          value={String(
            approvedCount,
          )}
        />

        <SummaryCard
          icon={
            CircleDollarSign
          }
          label="Total paid"
          value={formatMoney(
            totalPaid,
          )}
        />
      </div>

      {/* DIRECTORY */}

      <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
        <div className="border-b border-forest-900/10 px-6 py-6 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
            Distribution history
          </p>

          <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
            Distribution Records
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
            Draft distributions remain internal until
            reviewed and approved.
          </p>
        </div>

        {records.length ===
        0 ? (
          <div className="px-6 py-16 text-center sm:px-8">
            <HandCoins className="mx-auto size-8 text-stone-300" />

            <h3 className="font-display mt-5 text-3xl font-semibold text-forest-950">
              No distributions yet.
            </h3>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-500">
              Create the first distribution for an
              investment opportunity with funded
              positions.
            </p>

            <Link
              href="/admin/distributions/new"
              className="focus-ring mt-7 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800"
            >
              <Plus className="size-4" />

              Create distribution
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-forest-900/10">
            {records.map(
              (
                distribution,
              ) => {
                const opportunity =
                  Array.isArray(
                    distribution.opportunity,
                  )
                    ? distribution
                        .opportunity[0] ??
                      null
                    : distribution.opportunity;

                return (
                  <article
                    key={
                      distribution.id
                    }
                    className="p-6 sm:p-8"
                  >
                    <div className="flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <DistributionStatusBadge
                            status={
                              distribution.status
                            }
                          />

                          <span className="rounded-full bg-ivory-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-500">
                            {humanize(
                              distribution.distribution_type,
                            )}
                          </span>

                          {opportunity?.asset_category ? (
                            <span className="rounded-full bg-ivory-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-500">
                              {humanize(
                                opportunity.asset_category,
                              )}
                            </span>
                          ) : null}
                        </div>

                        <h3 className="font-display mt-4 text-2xl font-semibold text-forest-950 sm:text-3xl">
                          {
                            distribution.title
                          }
                        </h3>

                        <p className="mt-2 text-sm text-stone-500">
                          {opportunity?.title ??
                            "Investment opportunity"}
                        </p>

                        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                          <DataPoint
                            label="Distribution amount"
                            value={formatMoney(
                              Number(
                                distribution.total_distribution_amount,
                              ),
                            )}
                          />

                          <DataPoint
                            label="Record date"
                            value={formatDate(
                              distribution.record_date,
                            )}
                          />

                          <DataPoint
                            label="Payment date"
                            value={
                              distribution.payment_date
                                ? formatDate(
                                    distribution.payment_date,
                                  )
                                : "Not scheduled"
                            }
                          />

                          <DataPoint
                            label="Status"
                            value={humanize(
                              distribution.status,
                            )}
                          />
                        </div>
                      </div>

                      <Link
                        href={`/admin/distributions/${distribution.id}`}
                        className="focus-ring inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-forest-900/10 bg-white px-5 text-sm font-semibold text-forest-950 transition hover:bg-ivory-50"
                      >
                        {distribution.status ===
                        "draft"
                          ? "Review distribution"
                          : "View distribution"}

                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>

      <section className="rounded-[1.75rem] bg-forest-950 p-6 text-white sm:p-8">
        <ShieldCheck className="size-6 text-gold-400" />

        <h2 className="font-display mt-5 text-3xl font-semibold">
          Distribution controls
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
          A distribution should not be treated as paid
          merely because it has been created or approved.
          Investor allocations and actual payment status
          must remain separately tracked.
        </p>
      </section>
    </div>
  );
}

function SummaryCard({
  icon:
    Icon,
  label,
  value,
}: {
  icon:
    typeof HandCoins;

  label: string;

  value: string;
}) {
  return (
    <div className="rounded-3xl border border-forest-900/10 bg-white p-5">
      <div className="flex size-10 items-center justify-center rounded-full bg-ivory-50">
        <Icon className="size-4.5 text-gold-600" />
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <p className="font-display mt-2 text-3xl font-semibold text-forest-950">
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

      <p className="mt-1 wrap-break-word text-sm font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

function DistributionStatusBadge({
  status,
}: {
  status: string;
}) {
  const classes =
    status === "paid"
      ? "bg-emerald-50 text-emerald-700"
      : status ===
          "approved" ||
        status ===
          "processing"
        ? "bg-blue-50 text-blue-700"
        : status ===
          "cancelled"
          ? "bg-red-50 text-red-700"
          : "bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest ${classes}`}
    >
      {humanize(
        status,
      )}
    </span>
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

function formatMoney(
  cents: number,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style:
        "currency",

      currency:
        "USD",

      maximumFractionDigits:
        0,
    },
  ).format(
    cents / 100,
  );
}

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      year:
        "numeric",

      month:
        "short",

      day:
        "numeric",
    },
  ).format(
    new Date(
      `${value}T00:00:00`,
    ),
  );
}