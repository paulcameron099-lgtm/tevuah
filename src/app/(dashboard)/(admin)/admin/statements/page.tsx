import {
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  FileText,
  HandCoins,
  Plus,
  ShieldCheck,
  WalletCards,
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

export default async function AdminStatementsPage() {
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
   * 2. LOAD STATEMENTS
   * ==================================================
   */
  const {
    data: statements,
    error: statementsError,
  } = await admin
    .from(
      "investor_statements",
    )
    .select(
      `
      id,

      investor_id,

      period_start,
      period_end,

      statement_type,
      currency,

      opening_portfolio_value,
      closing_portfolio_value,

      original_principal,
      adjusted_cost_basis,

      income_received,
      capital_returned,
      total_cash_received,

      total_economic_value,

      unrealized_gain_loss,
      total_gain_loss,
      total_return_percent,

      position_count,

      status,

      generated_by,
      generated_at,

      published_by,
      published_at,

      pdf_storage_path,
      notes,

      created_at,
      updated_at,

      investor:profiles!investor_statements_investor_id_fkey (
        id,
        first_name,
        last_name
      )
      `,
    )
    .order(
      "period_end",
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

  if (statementsError) {
    console.error(
      "Admin statements load error:",
      statementsError,
    );

    throw new Error(
      "Unable to load investor statements.",
    );
  }

  const records =
    statements ?? [];

  /*
   * ==================================================
   * 3. GET REAL AUTH EMAILS
   * ==================================================
   *
   * profiles does not contain investor email.
   */
  const statementsWithInvestors =
    await Promise.all(
      records.map(
        async (
          statement,
        ) => {
          const investor =
            Array.isArray(
              statement.investor,
            )
              ? statement.investor[0] ??
                null
              : statement.investor;

          let investorEmail:
            | string
            | null =
            null;

          if (investor?.id) {
            const {
              data:
                authUserData,
              error:
                authUserError,
            } =
              await admin.auth.admin.getUserById(
                investor.id,
              );

            if (authUserError) {
              console.error(
                "Statement investor Auth lookup error:",
                authUserError,
              );
            }

            investorEmail =
              authUserData.user
                ?.email ??
              null;
          }

          const investorName =
            investor
              ? [
                  investor.first_name,
                  investor.last_name,
                ]
                  .filter(Boolean)
                  .join(" ")
                  .trim() ||
                "Investor"
              : "Investor";

          return {
            ...statement,

            investorName,

            investorEmail,
          };
        },
      ),
    );

  /*
   * ==================================================
   * 4. SUMMARY
   * ==================================================
   */
  const draftStatements =
    statementsWithInvestors.filter(
      (statement) =>
        statement.status ===
        "draft",
    );

  const publishedStatements =
    statementsWithInvestors.filter(
      (statement) =>
        statement.status ===
        "published",
    );

  const voidStatements =
    statementsWithInvestors.filter(
      (statement) =>
        statement.status ===
        "void",
    );

  /*
   * This is the closing value represented by all
   * published statement snapshots.
   *
   * It is an administrative summary only.
   */
  const publishedClosingValue =
    publishedStatements.reduce(
      (
        total,
        statement,
      ) =>
        total +
        Number(
          statement.closing_portfolio_value,
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
      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
            Investor reporting
          </p>

          <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
            Investor Statements
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
            Generate, review and publish frozen investor
            portfolio statements for current or
            historical reporting periods.
          </p>
        </div>

        <Link
          href="/admin/statements/new"
          className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800"
        >
          <Plus className="size-4" />

          Generate statement
        </Link>
      </div>

      {/* ==========================================
          BACKDATED STATEMENT NOTICE
      ========================================== */}

      <section className="rounded-3xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <CalendarDays className="mt-0.5 size-5 shrink-0 text-blue-700" />

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
              Historical / backdated reporting supported
            </p>

            <p className="mt-2 max-w-4xl text-sm leading-7 text-blue-900">
              Statements may be generated for historical
              periods. The statement period reflects the
              selected historical dates, while Generated
              At and Published At retain the actual system
              timestamps when the statement was created
              and published.
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          SUMMARY
      ========================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={
            FileText
          }
          label="All statements"
          value={String(
            statementsWithInvestors.length,
          )}
        />

        <SummaryCard
          icon={
            Clock3
          }
          label="Draft"
          value={String(
            draftStatements.length,
          )}
        />

        <SummaryCard
          icon={
            ShieldCheck
          }
          label="Published"
          value={String(
            publishedStatements.length,
          )}
        />

        <SummaryCard
          icon={
            CircleDollarSign
          }
          label="Published closing value"
          value={formatMoney(
            publishedClosingValue,
          )}
        />
      </div>

      {/* ==========================================
          STATEMENT DIRECTORY
      ========================================== */}

      <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
        <div className="border-b border-forest-900/10 px-6 py-6 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
            Statement history
          </p>

          <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
            Statement Records
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
            Draft statements remain internal. Published
            statements represent frozen historical
            portfolio snapshots visible to investors.
          </p>
        </div>

        {statementsWithInvestors.length ===
        0 ? (
          <div className="px-6 py-16 text-center sm:px-8">
            <FileText className="mx-auto size-8 text-stone-300" />

            <h3 className="font-display mt-5 text-3xl font-semibold text-forest-950">
              No statements yet.
            </h3>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-500">
              Generate the first investor statement for
              a current or historical reporting period.
            </p>

            <Link
              href="/admin/statements/new"
              className="focus-ring mt-7 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800"
            >
              <Plus className="size-4" />

              Generate statement
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-forest-900/10">
            {statementsWithInvestors.map(
              (
                statement,
              ) => {
                return (
                  <article
                    key={
                      statement.id
                    }
                    className="p-6 sm:p-8"
                  >
                    <div className="flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0 flex-1">
                        {/* STATUS */}

                        <div className="flex flex-wrap items-center gap-2">
                          <StatementStatusBadge
                            status={
                              statement.status
                            }
                          />

                          <span className="rounded-full bg-ivory-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-500">
                            {humanize(
                              statement.statement_type,
                            )}
                          </span>

                          {isHistoricalPeriod(
                            statement.period_end,
                          ) ? (
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-blue-700">
                              Historical period
                            </span>
                          ) : null}
                        </div>

                        {/* INVESTOR */}

                        <h3 className="font-display mt-4 text-2xl font-semibold text-forest-950 sm:text-3xl">
                          {
                            statement.investorName
                          }
                        </h3>

                        {statement.investorEmail ? (
                          <p className="mt-1 text-xs text-stone-400">
                            {
                              statement.investorEmail
                            }
                          </p>
                        ) : null}

                        {/* PERIOD */}

                        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                          <CalendarDays className="size-4 text-gold-600" />

                          <span className="font-semibold text-forest-950">
                            {formatDate(
                              statement.period_start,
                            )}
                          </span>

                          <span className="text-stone-400">
                            →
                          </span>

                          <span className="font-semibold text-forest-950">
                            {formatDate(
                              statement.period_end,
                            )}
                          </span>
                        </div>

                        {/* FINANCIAL SUMMARY */}

                        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
                          <DataPoint
                            label="Closing value"
                            value={formatMoney(
                              Number(
                                statement.closing_portfolio_value,
                              ),
                            )}
                          />

                          <DataPoint
                            label="Adjusted basis"
                            value={formatMoney(
                              Number(
                                statement.adjusted_cost_basis,
                              ),
                            )}
                          />

                          <DataPoint
                            label="Income"
                            value={formatMoney(
                              Number(
                                statement.income_received,
                              ),
                            )}
                          />

                          <DataPoint
                            label="Capital returned"
                            value={formatMoney(
                              Number(
                                statement.capital_returned,
                              ),
                            )}
                          />

                          <DataPoint
                            label="Total return"
                            value={
                              statement.total_return_percent !=
                              null
                                ? formatPercent(
                                    Number(
                                      statement.total_return_percent,
                                    ),
                                  )
                                : "—"
                            }
                          />
                        </div>

                        {/* AUDIT DATES */}

                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <SmallData
                            label="Generated"
                            value={formatDateTime(
                              statement.generated_at,
                            )}
                          />

                          <SmallData
                            label="Published"
                            value={
                              statement.published_at
                                ? formatDateTime(
                                    statement.published_at,
                                  )
                                : "Not published"
                            }
                          />

                          <SmallData
                            label="Positions"
                            value={String(
                              statement.position_count,
                            )}
                          />
                        </div>
                      </div>

                      {/* ACTION */}

                      <div className="flex shrink-0 flex-col gap-3">
                        <Link
                          href={`/admin/statements/${statement.id}`}
                          className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-forest-900/10 bg-white px-5 text-sm font-semibold text-forest-950 transition hover:bg-ivory-50"
                        >
                          {statement.status ===
                          "draft"
                            ? "Review statement"
                            : "View statement"}

                          <ArrowRight className="size-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>

      {/* ==========================================
          STATUS EXPLANATION
      ========================================== */}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[1.75rem] bg-forest-950 p-6 text-white sm:p-8">
          <ShieldCheck className="size-6 text-gold-400" />

          <h2 className="font-display mt-5 text-3xl font-semibold">
            Frozen financial snapshots
          </h2>

          <p className="mt-4 text-sm leading-7 text-white/60">
            Statement financial values are stored as
            historical snapshots. Future valuations,
            distributions or cost-basis changes must not
            silently change previously published
            statements.
          </p>
        </section>

        <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
          <WalletCards className="size-6 text-gold-600" />

          <h2 className="font-display mt-5 text-3xl font-semibold text-forest-950">
            Statement lifecycle
          </h2>

          <div className="mt-6 space-y-4">
            <LifecycleRow
              label="Draft"
              description="Generated snapshot awaiting administrative review."
            />

            <LifecycleRow
              label="Published"
              description="Approved historical record made available to the investor."
            />

            <LifecycleRow
              label="Void"
              description="Historical statement retained but no longer considered valid."
            />
          </div>
        </section>
      </div>

      {/* VOID COUNT, IF ANY */}

      {voidStatements.length >
      0 ? (
        <section className="rounded-3xl border border-red-200 bg-red-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-700">
            Voided statements
          </p>

          <p className="mt-2 text-sm leading-7 text-red-900">
            {voidStatements.length} statement
            {voidStatements.length ===
            1
              ? ""
              : "s"}{" "}
            currently remain in the historical record
            with Void status.
          </p>
        </section>
      ) : null}
    </div>
  );
}

/*
 * ==================================================
 * SUMMARY CARD
 * ==================================================
 */

function SummaryCard({
  icon:
    Icon,
  label,
  value,
}: {
  icon:
    typeof FileText;

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

function SmallData({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div>
      <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-stone-400">
        {label}
      </p>

      <p className="mt-1 text-xs font-medium text-stone-600">
        {value}
      </p>
    </div>
  );
}

/*
 * ==================================================
 * STATUS BADGE
 * ==================================================
 */

function StatementStatusBadge({
  status,
}: {
  status: string;
}) {
  const classes =
    status ===
    "published"
      ? "bg-emerald-50 text-emerald-700"
      : status ===
          "void"
        ? "bg-red-50 text-red-700"
        : "bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest ${classes}`}
    >
      {status ===
      "published" ? (
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
 * LIFECYCLE ROW
 * ==================================================
 */

function LifecycleRow({
  label,
  description,
}: {
  label: string;

  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-ivory-50 p-4">
      <HandCoins className="mt-0.5 size-4 shrink-0 text-gold-600" />

      <div>
        <p className="text-sm font-semibold text-forest-950">
          {label}
        </p>

        <p className="mt-1 text-xs leading-6 text-stone-500">
          {description}
        </p>
      </div>
    </div>
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
        2,
    },
  ).format(
    cents / 100,
  );
}

function formatPercent(
  value: number,
) {
  return `${
    value > 0
      ? "+"
      : ""
  }${value.toFixed(
    2,
  )}%`;
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

/*
 * For the directory badge only.
 *
 * A statement period ending before today is treated
 * as historical.
 */
function isHistoricalPeriod(
  periodEnd: string,
) {
  const today =
    new Date();

  const endDate =
    new Date(
      `${periodEnd}T23:59:59`,
    );

  return (
    endDate.getTime() <
    today.getTime()
  );
}