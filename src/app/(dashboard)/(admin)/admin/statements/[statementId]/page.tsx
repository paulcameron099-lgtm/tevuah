import {
  Activity,
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  FileText,
  History,
  Landmark,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  StatementReviewActions,
} from "@/src/components/admin/statements/statement-review-actions";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type PageProps = {
  params: Promise<{
    statementId: string;
  }>;
};

export default async function AdminStatementDetailPage({
  params,
}: PageProps) {
  const { statementId } =
    await params;

  /*
   * ================================================
   * 1. AUTH
   * ================================================
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
   * ================================================
   * 2. STATEMENT
   * ================================================
   */
  const {
    data: statement,
    error: statementError,
  } = await admin
    .from("investor_statements")
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

      historical_generated_at,
      historical_published_at,

      reconstructed_from_legacy,
      reconstruction_note,

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
    .eq(
      "id",
      statementId,
    )
    .maybeSingle();

  if (
    statementError ||
    !statement
  ) {
    console.error(
      "Admin statement detail load error:",
      statementError,
    );

    notFound();
  }

  /*
   * Supabase relationship selections can sometimes
   * infer arrays. Normalize it here.
   */
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
      data: authData,
      error: authError,
    } =
      await admin.auth.admin.getUserById(
        investor.id,
      );

    if (authError) {
      console.error(
        "Statement investor email lookup error:",
        authError,
      );
    }

    investorEmail =
      authData.user?.email ??
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

  /*
   * ================================================
   * 3. POSITION SNAPSHOTS
   * ================================================
   */
  const {
    data: positions,
    error: positionsError,
  } = await admin
    .from(
      "investor_statement_positions",
    )
    .select(
      `
      id,

      statement_id,

      position_id,
      investor_id,
      opportunity_id,

      opportunity_title,
      opportunity_slug,
      asset_category,

      original_principal,
      adjusted_cost_basis,

      opening_value,
      closing_value,

      income_received,
      capital_returned,
      total_cash_received,

      unrealized_gain_loss,
      total_gain_loss,
      total_return_percent,

      currency,

      position_status,

      funded_at,
      valuation_date,

      created_at
      `,
    )
    .eq(
      "statement_id",
      statementId,
    )
    .order(
      "created_at",
      {
        ascending: true,
      },
    );

  if (positionsError) {
    console.error(
      "Statement positions load error:",
      positionsError,
    );

    throw new Error(
      "Unable to load statement position snapshots.",
    );
  }

  /*
   * ================================================
   * 4. ACTIVITY
   * ================================================
   */
  const {
    data: activity,
    error: activityError,
  } = await admin
    .from(
      "investor_statement_activity",
    )
    .select(
      `
      id,

      statement_id,
      investor_id,

      position_id,
      opportunity_id,

      distribution_id,
      investor_distribution_id,

      valuation_id,
      basis_event_id,

      activity_type,
      activity_date,

      title,
      description,

      amount,
      basis_effect,

      currency,

      metadata,

      created_at
      `,
    )
    .eq(
      "statement_id",
      statementId,
    )
    .order(
      "activity_date",
      {
        ascending: false,
      },
    );

  if (activityError) {
    console.error(
      "Statement activity load error:",
      activityError,
    );

    throw new Error(
      "Unable to load statement activity.",
    );
  }

  const positionRows =
    positions ?? [];

  const activityRows =
    activity ?? [];

  /*
   * ================================================
   * 5. NUMBERS
   * ================================================
   */
  const originalPrincipal =
    Number(
      statement.original_principal,
    );

  const adjustedBasis =
    Number(
      statement.adjusted_cost_basis,
    );

  const openingValue =
    Number(
      statement.opening_portfolio_value,
    );

  const closingValue =
    Number(
      statement.closing_portfolio_value,
    );

  const incomeReceived =
    Number(
      statement.income_received,
    );

  const capitalReturned =
    Number(
      statement.capital_returned,
    );

  const totalCashReceived =
    Number(
      statement.total_cash_received,
    );

  const totalEconomicValue =
    Number(
      statement.total_economic_value,
    );

  const unrealizedGainLoss =
    Number(
      statement.unrealized_gain_loss,
    );

  const totalGainLoss =
    Number(
      statement.total_gain_loss,
    );

  return (
    <div className="space-y-8">
      {/* ============================================
          BACK
      ============================================ */}

      <Link
        href="/admin/statements"
        className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-forest-950"
      >
        <ArrowLeft className="size-4" />
        Back to statements
      </Link>

      {/* ============================================
          HEADER
      ============================================ */}

      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              status={
                statement.status
              }
            />

            <span className="rounded-full bg-ivory-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-500">
              {humanize(
                statement.statement_type,
              )}
            </span>

            {statement.reconstructed_from_legacy ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-blue-700">
                <History className="size-3" />
                Historical reconstruction
              </span>
            ) : null}
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
            Investor statement
          </p>

          <h1 className="font-display mt-3 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
            {investorName}
          </h1>

          {investorEmail ? (
            <p className="mt-2 text-sm text-stone-500">
              {investorEmail}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-stone-600">
            <CalendarDays className="size-4 text-gold-600" />

            <span>
              {formatDate(
                statement.period_start,
              )}
            </span>

            <span>→</span>

            <span>
              {formatDate(
                statement.period_end,
              )}
            </span>
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-forest-900/10 bg-white px-5 py-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
            Statement ID
          </p>

          <p className="mt-2 break-all font-mono text-xs text-forest-950">
            {statement.id}
          </p>
        </div>
      </div>

      {/* ============================================
          LEGACY RECONSTRUCTION
      ============================================ */}

      {statement.reconstructed_from_legacy ? (
        <section className="rounded-3xl border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-start gap-4">
            <History className="mt-0.5 size-5 shrink-0 text-blue-700" />

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                Reconstructed historical statement
              </p>

              <p className="mt-3 text-sm leading-7 text-blue-950">
                This statement was reconstructed from
                historical or legacy records after the
                original system data was unavailable.
              </p>

              <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <Info
                  label="Historical generated"
                  value={
                    statement.historical_generated_at
                      ? formatDateTime(
                          statement.historical_generated_at,
                        )
                      : "Not provided"
                  }
                />

                <Info
                  label="Historical published"
                  value={
                    statement.historical_published_at
                      ? formatDateTime(
                          statement.historical_published_at,
                        )
                      : "Not provided"
                  }
                />

                <Info
                  label="Reconstructed in system"
                  value={formatDateTime(
                    statement.generated_at,
                  )}
                />

                <Info
                  label="Actually published in system"
                  value={
                    statement.published_at
                      ? formatDateTime(
                          statement.published_at,
                        )
                      : "Not published"
                  }
                />
              </div>

              {statement.reconstruction_note ? (
                <div className="mt-5 rounded-xl bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
                    Reconstruction note
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-blue-950">
                    {statement.reconstruction_note}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* ============================================
          FINANCIAL SUMMARY
      ============================================ */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Landmark}
          label="Original Principal"
          value={formatMoney(
            originalPrincipal,
            statement.currency,
          )}
        />

        <MetricCard
          icon={WalletCards}
          label="Adjusted Cost Basis"
          value={formatMoney(
            adjustedBasis,
            statement.currency,
          )}
        />

        <MetricCard
          icon={CircleDollarSign}
          label="Closing Portfolio Value"
          value={formatMoney(
            closingValue,
            statement.currency,
          )}
        />

        <MetricCard
          icon={
            totalGainLoss >= 0
              ? TrendingUp
              : TrendingDown
          }
          label="Total Gain / Loss"
          value={formatSignedMoney(
            totalGainLoss,
            statement.currency,
          )}
          secondary={
            statement.total_return_percent != null
              ? formatPercent(
                  Number(
                    statement.total_return_percent,
                  ),
                )
              : "Return unavailable"
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Activity}
          label="Opening Value"
          value={formatMoney(
            openingValue,
            statement.currency,
          )}
        />

        <MetricCard
          icon={TrendingUp}
          label="Income Received"
          value={formatMoney(
            incomeReceived,
            statement.currency,
          )}
        />

        <MetricCard
          icon={Landmark}
          label="Capital Returned"
          value={formatMoney(
            capitalReturned,
            statement.currency,
          )}
        />

        <MetricCard
          icon={WalletCards}
          label="Total Economic Value"
          value={formatMoney(
            totalEconomicValue,
            statement.currency,
          )}
          secondary={`${formatMoney(
            totalCashReceived,
            statement.currency,
          )} cash received`}
        />
      </div>

      {/* ============================================
          POSITION BREAKDOWN
      ============================================ */}

      <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
        <div className="border-b border-forest-900/10 px-6 py-6 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
            Frozen holdings
          </p>

          <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
            Position Breakdown
          </h2>

          <p className="mt-3 text-sm leading-7 text-stone-600">
            These values were frozen when the statement
            was generated and do not read from the
            investor&apos;s current live portfolio.
          </p>
        </div>

        {positionRows.length === 0 ? (
          <div className="px-6 py-12 text-center sm:px-8">
            <WalletCards className="mx-auto size-7 text-stone-300" />

            <p className="mt-4 text-sm text-stone-500">
              No investment positions are included in
              this statement.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-forest-900/10">
            {positionRows.map(
              (position) => (
                <article
                  key={position.id}
                  className="p-6 sm:p-8"
                >
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-gold-600">
                        {position.asset_category
                          ? humanize(
                              position.asset_category,
                            )
                          : "Investment"}
                      </p>

                      <h3 className="font-display mt-2 text-2xl font-semibold text-forest-950">
                        {
                          position.opportunity_title
                        }
                      </h3>

                      <p className="mt-2 text-xs text-stone-400">
                        Position ID:{" "}
                        {position.position_id}
                      </p>
                    </div>

                    <span className="rounded-full bg-ivory-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-600">
                      {humanize(
                        position.position_status,
                      )}
                    </span>
                  </div>

                  <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <Info
                      label="Original principal"
                      value={formatMoney(
                        Number(
                          position.original_principal,
                        ),
                        position.currency,
                      )}
                    />

                    <Info
                      label="Adjusted basis"
                      value={formatMoney(
                        Number(
                          position.adjusted_cost_basis,
                        ),
                        position.currency,
                      )}
                    />

                    <Info
                      label="Opening value"
                      value={formatMoney(
                        Number(
                          position.opening_value,
                        ),
                        position.currency,
                      )}
                    />

                    <Info
                      label="Closing value"
                      value={formatMoney(
                        Number(
                          position.closing_value,
                        ),
                        position.currency,
                      )}
                    />

                    <Info
                      label="Income"
                      value={formatMoney(
                        Number(
                          position.income_received,
                        ),
                        position.currency,
                      )}
                    />

                    <Info
                      label="Capital returned"
                      value={formatMoney(
                        Number(
                          position.capital_returned,
                        ),
                        position.currency,
                      )}
                    />

                    <Info
                      label="Gain / loss"
                      value={formatSignedMoney(
                        Number(
                          position.total_gain_loss,
                        ),
                        position.currency,
                      )}
                    />

                    <Info
                      label="Return"
                      value={
                        position.total_return_percent != null
                          ? formatPercent(
                              Number(
                                position.total_return_percent,
                              ),
                            )
                          : "—"
                      }
                    />
                  </div>

                  <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-forest-900/10 pt-5">
                    <SmallInfo
                      label="Funded"
                      value={
                        position.funded_at
                          ? formatDateTime(
                              position.funded_at,
                            )
                          : "—"
                      }
                    />

                    <SmallInfo
                      label="Valuation date"
                      value={
                        position.valuation_date
                          ? formatDate(
                              position.valuation_date,
                            )
                          : "Principal fallback"
                      }
                    />
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </section>

      {/* ============================================
          ACTIVITY HISTORY
      ============================================ */}

      <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
        <div className="border-b border-forest-900/10 px-6 py-6 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
            Frozen reporting history
          </p>

          <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
            Statement Activity
          </h2>
        </div>

        {activityRows.length === 0 ? (
          <div className="px-6 py-12 text-center sm:px-8">
            <Activity className="mx-auto size-7 text-stone-300" />

            <p className="mt-4 text-sm text-stone-500">
              No reportable activity occurred during
              this statement period.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-forest-900/10">
            {activityRows.map(
              (item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 px-6 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-ivory-50">
                      <Activity className="size-4 text-gold-600" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-forest-950">
                          {item.title}
                        </p>

                        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-stone-500">
                          {humanize(
                            item.activity_type,
                          )}
                        </span>
                      </div>

                      {item.description ? (
                        <p className="mt-1 text-xs leading-6 text-stone-500">
                          {item.description}
                        </p>
                      ) : null}

                      <p className="mt-2 text-xs text-stone-400">
                        {formatDateTime(
                          item.activity_date,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-left lg:text-right">
                    {item.amount != null ? (
                      <p className="text-sm font-semibold text-forest-950">
                        {formatMoney(
                          Number(
                            item.amount,
                          ),
                          item.currency,
                        )}
                      </p>
                    ) : null}

                    {item.basis_effect != null ? (
                      <p className="mt-1 text-xs text-stone-500">
                        Basis effect:{" "}
                        {formatSignedMoney(
                          Number(
                            item.basis_effect,
                          ),
                          item.currency,
                        )}
                      </p>
                    ) : null}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </section>

      {/* ============================================
          REVIEW + AUDIT
      ============================================ */}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
          <Clock3 className="size-5 text-gold-600" />

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
            System audit
          </p>

          <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
            Statement Record
          </h2>

          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <Info
              label="Generated in system"
              value={formatDateTime(
                statement.generated_at,
              )}
            />

            <Info
              label="Published in system"
              value={
                statement.published_at
                  ? formatDateTime(
                      statement.published_at,
                    )
                  : "Not published"
              }
            />

            <Info
              label="Created"
              value={formatDateTime(
                statement.created_at,
              )}
            />

            <Info
              label="Last updated"
              value={formatDateTime(
                statement.updated_at,
              )}
            />
          </div>

          {statement.notes ? (
            <div className="mt-7 border-t border-forest-900/10 pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
                Internal notes
              </p>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-stone-600">
                {statement.notes}
              </p>
            </div>
          ) : null}
        </section>

        <aside className="rounded-[1.75rem] bg-forest-950 p-6 text-white sm:p-7">
          <ShieldCheck className="size-6 text-gold-400" />

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">
            Administrative review
          </p>

          <h2 className="font-display mt-3 text-3xl font-semibold">
            Statement Controls
          </h2>

          <p className="mt-3 text-sm leading-7 text-white/60">
            Review the frozen position values,
            distributions, cost basis and historical
            reconstruction information before
            publication.
          </p>

          <div className="mt-7">
            <StatementReviewActions
              statementId={
                statement.id
              }
              status={
                statement.status
              }
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

/*
 * ==================================================
 * COMPONENTS
 * ==================================================
 */

function MetricCard({
  icon: Icon,
  label,
  value,
  secondary,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
  secondary?: string;
}) {
  return (
    <div className="rounded-3xl border border-forest-900/10 bg-white p-5">
      <div className="flex size-10 items-center justify-center rounded-full bg-ivory-50">
        <Icon className="size-4.5 text-gold-600" />
      </div>

      <p className="mt-5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <p className="font-display mt-2 wrap-break-word text-2xl font-semibold text-forest-950">
        {value}
      </p>

      {secondary ? (
        <p className="mt-2 text-xs text-stone-500">
          {secondary}
        </p>
      ) : null}
    </div>
  );
}

function Info({
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

      <p className="mt-2 wrap-break-word text-sm font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

function SmallInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <span className="text-xs text-stone-400">
        {label}:{" "}
      </span>

      <span className="text-xs font-semibold text-stone-600">
        {value}
      </span>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const className =
    status === "published"
      ? "bg-emerald-50 text-emerald-700"
      : status === "void"
        ? "bg-red-50 text-red-700"
        : "bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest ${className}`}
    >
      <ShieldCheck className="size-3" />

      {humanize(status)}
    </span>
  );
}

/*
 * ==================================================
 * FORMATTERS
 * ==================================================
 */

function humanize(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function formatMoney(
  cents: number,
  currency = "USD",
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    },
  ).format(
    cents / 100,
  );
}

function formatSignedMoney(
  cents: number,
  currency = "USD",
) {
  const formatted =
    formatMoney(
      Math.abs(cents),
      currency,
    );

  if (cents > 0) {
    return `+${formatted}`;
  }

  if (cents < 0) {
    return `-${formatted}`;
  }

  return formatted;
}

function formatPercent(
  value: number,
) {
  return `${
    value > 0
      ? "+"
      : ""
  }${value.toFixed(2)}%`;
}

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
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
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(
    new Date(value),
  );
}