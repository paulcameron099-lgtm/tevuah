import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Plus,
  ShieldCheck,
} from "lucide-react";

import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

export default async function AdminValuationsPage() {
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
   * 2. LOAD VALUATIONS
   * ==================================================
   */
  const {
    data: valuations,
    error,
  } = await admin
    .from(
      "investment_valuations",
    )
    .select(
      `
      id,
      opportunity_id,

      valuation_date,
      total_asset_value,
      nav_per_unit,
      currency,

      valuation_type,
      source_name,
      methodology,
      notes,

      status,

      created_by,
      published_by,
      published_at,

      created_at,
      updated_at,

      opportunity:investment_opportunities!investment_valuations_opportunity_id_fkey (
        id,
        slug,
        title,
        asset_category,
        funding_target,
        total_funded,
        investor_count,
        status
      )
      `,
    )
    .order(
      "valuation_date",
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
      "Admin valuations load error:",
      error,
    );

    throw new Error(
      "Unable to load investment valuations.",
    );
  }

  const records =
    valuations ?? [];

  /*
   * ==================================================
   * 3. SUMMARY METRICS
   * ==================================================
   */
  const publishedValuations =
    records.filter(
      (valuation) =>
        valuation.status ===
        "published",
    );

  const draftValuations =
    records.filter(
      (valuation) =>
        valuation.status ===
        "draft",
    );

  const latestPublishedValue =
    publishedValuations.reduce(
      (
        total,
        valuation,
      ) =>
        total +
        Number(
          valuation.total_asset_value,
        ),
      0,
    );

  /*
   * Count unique valued opportunities.
   */
  const valuedOpportunityIds =
    new Set(
      publishedValuations.map(
        (valuation) =>
          valuation.opportunity_id,
      ),
    );

  /*
   * ==================================================
   * 4. RENDER
   * ==================================================
   */
  return (
    <div className="space-y-8">
      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
            Portfolio administration
          </p>

          <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
            Investment Valuations
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
            Create and publish periodic opportunity
            valuations used to calculate current investor
            position values and unrealized performance.
          </p>
        </div>

        <Link
          href="/admin/valuations/new"
          className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800"
        >
          <Plus className="size-4" />

          Create valuation
        </Link>
      </div>

      {/* ==========================================
          SUMMARY
      ========================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={
            BarChart3
          }
          label="Published valuations"
          value={String(
            publishedValuations.length,
          )}
        />

        <SummaryCard
          icon={
            Clock3
          }
          label="Draft valuations"
          value={String(
            draftValuations.length,
          )}
        />

        <SummaryCard
          icon={
            ShieldCheck
          }
          label="Valued opportunities"
          value={String(
            valuedOpportunityIds.size,
          )}
        />

        <SummaryCard
          icon={
            CircleDollarSign
          }
          label="Published asset value"
          value={formatMoney(
            latestPublishedValue,
          )}
        />
      </div>

      {/* ==========================================
          DIRECTORY
      ========================================== */}

      <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
        <div className="border-b border-forest-900/10 px-6 py-6 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
            Valuation history
          </p>

          <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
            Valuation Records
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
            Draft valuations can be reviewed before
            publication. Published valuations become part
            of investor performance reporting.
          </p>
        </div>

        {records.length ===
        0 ? (
          <div className="px-6 py-16 text-center sm:px-8">
            <BarChart3 className="mx-auto size-8 text-stone-300" />

            <h3 className="font-display mt-5 text-3xl font-semibold text-forest-950">
              No valuations yet.
            </h3>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-500">
              Create the first valuation for an opportunity
              with funded investment positions.
            </p>

            <Link
              href="/admin/valuations/new"
              className="focus-ring mt-7 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800"
            >
              <Plus className="size-4" />

              Create valuation
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-forest-900/10">
            {records.map(
              (
                valuation,
              ) => {
                const opportunity =
                  Array.isArray(
                    valuation.opportunity,
                  )
                    ? valuation
                        .opportunity[0] ??
                      null
                    : valuation.opportunity;

                return (
                  <article
                    key={
                      valuation.id
                    }
                    className="p-6 sm:p-8"
                  >
                    <div className="flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <ValuationStatusBadge
                            status={
                              valuation.status
                            }
                          />

                          <span className="rounded-full bg-ivory-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-500">
                            {humanize(
                              valuation.valuation_type,
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
                          {opportunity?.title ??
                            "Investment opportunity"}
                        </h3>

                        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                          <DataPoint
                            label="Valuation date"
                            value={formatDate(
                              valuation.valuation_date,
                            )}
                          />

                          <DataPoint
                            label="Total asset value"
                            value={formatMoney(
                              Number(
                                valuation.total_asset_value,
                              ),
                            )}
                          />

                          <DataPoint
                            label="NAV / unit"
                            value={
                              valuation.nav_per_unit !=
                              null
                                ? formatNav(
                                    Number(
                                      valuation.nav_per_unit,
                                    ),
                                  )
                                : "—"
                            }
                          />

                          <DataPoint
                            label="Published"
                            value={
                              valuation.published_at
                                ? formatDateTime(
                                    valuation.published_at,
                                  )
                                : "Not published"
                            }
                          />
                        </div>

                        {valuation.source_name ? (
                          <p className="mt-5 text-xs leading-6 text-stone-500">
                            Source:{" "}
                            <strong className="text-forest-950">
                              {
                                valuation.source_name
                              }
                            </strong>
                          </p>
                        ) : null}
                      </div>

                      <Link
                        href={`/admin/valuations/${valuation.id}`}
                        className="focus-ring inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-forest-900/10 bg-white px-5 text-sm font-semibold text-forest-950 transition hover:bg-ivory-50"
                      >
                        {valuation.status ===
                        "draft"
                          ? "Review valuation"
                          : "View valuation"}

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

      {/* ==========================================
          METHODOLOGY NOTICE
      ========================================== */}

      <section className="rounded-[1.75rem] bg-forest-950 p-6 text-white sm:p-8">
        <ShieldCheck className="size-6 text-gold-400" />

        <h2 className="font-display mt-5 text-3xl font-semibold">
          Valuation controls
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
          Published valuation records affect investor
          portfolio reporting. Draft valuations should be
          reviewed carefully before publication and should
          reflect documented valuation methodology rather
          than projected target returns.
        </p>
      </section>
    </div>
  );
}

/*
 * ==================================================
 * SUMMARY
 * ==================================================
 */

function SummaryCard({
  icon:
    Icon,
  label,
  value,
}: {
  icon:
    typeof BarChart3;

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

/*
 * ==================================================
 * DATA POINT
 * ==================================================
 */

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

/*
 * ==================================================
 * STATUS
 * ==================================================
 */

function ValuationStatusBadge({
  status,
}: {
  status: string;
}) {
  const published =
    status ===
    "published";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest ${
        published
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {published ? (
        <ShieldCheck className="size-3" />
      ) : (
        <Clock3 className="size-3" />
      )}

      {humanize(
        status,
      )}
    </span>
  );
}

/*
 * ==================================================
 * HELPERS
 * ==================================================
 */

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

function formatNav(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      minimumFractionDigits:
        2,

      maximumFractionDigits:
        8,
    },
  ).format(
    value,
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