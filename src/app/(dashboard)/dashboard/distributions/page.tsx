import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  HandCoins,
  Landmark,
} from "lucide-react";

import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  checkAccountAccess,
} from "@/src/lib/auth/account-status";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

export default async function InvestorDistributionsPage() {
  /*
   * ==================================================
   * 1. AUTH
   * ==================================================
   */
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (
    user.role !==
    "investor"
  ) {
    redirect("/dashboard");
  }

  const accountAccess =
    await checkAccountAccess(
      user.id,
    );

  if (
    !accountAccess.allowed
  ) {
    redirect(
      "/account-restricted",
    );
  }

  const admin =
    createAdminClient();

  /*
   * ==================================================
   * 2. LOAD ONLY THIS INVESTOR'S DISTRIBUTIONS
   * ==================================================
   */
  const {
    data: allocations,
    error,
  } = await admin
    .from(
      "investor_distributions",
    )
    .select(
      `
      id,

      distribution_id,
      position_id,
      investor_id,
      opportunity_id,

      gross_amount,
      withholding_amount,
      net_amount,

      currency,
      status,

      paid_at,
      payment_reference,

      created_at,
      updated_at,

      distribution:investment_distributions!investor_distributions_distribution_id_fkey (
        id,
        title,
        distribution_type,
        record_date,
        payment_date,
        total_distribution_amount,
        status,
        notes
      ),

      opportunity:investment_opportunities!investor_distributions_opportunity_id_fkey (
        id,
        slug,
        title,
        asset_category,
        location
      )
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
      "Investor distributions load error:",
      error,
    );

    throw new Error(
      "Unable to load your distributions.",
    );
  }

  const records =
    allocations ?? [];

  /*
   * ==================================================
   * 3. GROUP BY STATUS
   * ==================================================
   */
  const paidRecords =
    records.filter(
      (record) =>
        record.status ===
        "paid",
    );

  const processingRecords =
    records.filter(
      (record) =>
        record.status ===
        "processing",
    );

  const approvedRecords =
    records.filter(
      (record) =>
        record.status ===
        "approved",
    );

  /*
   * ==================================================
   * 4. TOTALS
   * ==================================================
   */
  const totalReceived =
    paidRecords.reduce(
      (
        total,
        record,
      ) =>
        total +
        Number(
          record.net_amount,
        ),
      0,
    );

  const processingAmount =
    processingRecords.reduce(
      (
        total,
        record,
      ) =>
        total +
        Number(
          record.net_amount,
        ),
      0,
    );

  const upcomingAmount =
    approvedRecords.reduce(
      (
        total,
        record,
      ) =>
        total +
        Number(
          record.net_amount,
        ),
      0,
    );

  /*
   * ==================================================
   * 5. RENDER
   * ==================================================
   */
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Income & distributions
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          Your Distributions
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Review cash distributions associated with
          your funded investment positions, including
          upcoming, processing and completed payments.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={
            CircleDollarSign
          }
          label="Distributions received"
          value={formatMoney(
            totalReceived,
          )}
        />

        <SummaryCard
          icon={
            Clock3
          }
          label="Processing"
          value={formatMoney(
            processingAmount,
          )}
        />

        <SummaryCard
          icon={
            HandCoins
          }
          label="Upcoming"
          value={formatMoney(
            upcomingAmount,
          )}
        />

        <SummaryCard
          icon={
            CheckCircle2
          }
          label="Paid distributions"
          value={String(
            paidRecords.length,
          )}
        />
      </div>

      {records.length ===
      0 ? (
        <section className="rounded-[1.75rem] border border-forest-900/10 bg-white px-6 py-16 text-center sm:px-8">
          <HandCoins className="mx-auto size-8 text-stone-300" />

          <h2 className="font-display mt-5 text-3xl font-semibold text-forest-950">
            No distributions yet.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-500">
            Income and distribution records will appear
            here when distributions are approved for your
            funded investment positions.
          </p>

          <Link
            href="/dashboard/portfolio"
            className="focus-ring mt-7 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800"
          >
            View portfolio

            <ArrowRight className="size-4" />
          </Link>
        </section>
      ) : (
        <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
          <div className="border-b border-forest-900/10 px-6 py-6 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Distribution history
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              Income Records
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
              Only distributions marked Paid represent
              completed cash payments.
            </p>
          </div>

          <div className="divide-y divide-forest-900/10">
            {records.map(
              (
                allocation,
              ) => {
                const distribution =
                  Array.isArray(
                    allocation.distribution,
                  )
                    ? allocation
                        .distribution[0] ??
                      null
                    : allocation.distribution;

                const opportunity =
                  Array.isArray(
                    allocation.opportunity,
                  )
                    ? allocation
                        .opportunity[0] ??
                      null
                    : allocation.opportunity;

                return (
                  <article
                    key={
                      allocation.id
                    }
                    className="p-6 sm:p-8"
                  >
                    <div className="flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <DistributionStatusBadge
                            status={
                              allocation.status
                            }
                          />

                          {distribution
                            ?.distribution_type ? (
                            <span className="rounded-full bg-ivory-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-500">
                              {humanize(
                                distribution.distribution_type,
                              )}
                            </span>
                          ) : null}
                        </div>

                        <h3 className="font-display mt-4 text-2xl font-semibold text-forest-950">
                          {distribution?.title ??
                            "Investment distribution"}
                        </h3>

                        <p className="mt-2 text-sm text-stone-500">
                          {opportunity?.title ??
                            "Investment opportunity"}
                        </p>

                        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
                          <DataPoint
                            label="Gross"
                            value={formatMoney(
                              Number(
                                allocation.gross_amount,
                              ),
                            )}
                          />

                          <DataPoint
                            label="Withholding"
                            value={formatMoney(
                              Number(
                                allocation.withholding_amount,
                              ),
                            )}
                          />

                          <DataPoint
                            label="Net"
                            value={formatMoney(
                              Number(
                                allocation.net_amount,
                              ),
                            )}
                          />

                          <DataPoint
                            label="Record date"
                            value={
                              distribution
                                ?.record_date
                                ? formatDate(
                                    distribution.record_date,
                                  )
                                : "—"
                            }
                          />

                          <DataPoint
                            label="Payment"
                            value={
                              allocation.paid_at
                                ? formatDateTime(
                                    allocation.paid_at,
                                  )
                                : distribution
                                      ?.payment_date
                                  ? formatDate(
                                      distribution.payment_date,
                                    )
                                  : "Not completed"
                            }
                          />
                        </div>

                        {allocation.status ===
                          "paid" &&
                        allocation.payment_reference ? (
                          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                            <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-emerald-700">
                              Payment reference
                            </p>

                            <p className="mt-2 break-all text-sm font-semibold text-emerald-950">
                              {
                                allocation.payment_reference
                              }
                            </p>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-3">
                        <Link
                          href={`/dashboard/portfolio/${allocation.position_id}`}
                          className="focus-ring inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950 transition hover:bg-ivory-50"
                        >
                          View position

                          <ArrowRight className="size-3.5" />
                        </Link>

                        {opportunity?.slug ? (
                          <Link
                            href={`/investments/${opportunity.slug}`}
                            className="focus-ring inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-forest-950 px-4 text-xs font-semibold text-white transition hover:bg-forest-800"
                          >
                            Opportunity

                            <ArrowRight className="size-3.5" />
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        </section>
      )}

      <section className="rounded-[1.75rem] bg-forest-950 p-6 text-white sm:p-8">
        <Landmark className="size-6 text-gold-400" />

        <h2 className="font-display mt-5 text-3xl font-semibold">
          Cash received versus payable income
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
          Approved and processing distributions are not
          included in realized investment returns.
          Only completed payments marked Paid count as
          distributions received.
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
    status ===
    "paid"
      ? "bg-emerald-50 text-emerald-700"
      : status ===
          "processing"
        ? "bg-blue-50 text-blue-700"
        : status ===
            "approved"
          ? "bg-amber-50 text-amber-700"
          : "bg-stone-100 text-stone-600";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest ${classes}`}
    >
      {status ===
      "paid" ? (
        <CheckCircle2 className="size-3" />
      ) : (
        <Clock3 className="size-3" />
      )}

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
      (letter) =>
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
        2,
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

function formatDateTime(
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