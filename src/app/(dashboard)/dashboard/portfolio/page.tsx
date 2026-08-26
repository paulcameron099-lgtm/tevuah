import type {
  LucideIcon,
} from "lucide-react";

import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  TrendingDown,
  TrendingUp,
  WalletCards,
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

type LatestValuation = {
  positionValue: number;

  unrealizedGainLoss: number;

  valuationDate: string;
};

export default async function InvestorPortfolioPage() {
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
   * 2. POSITIONS
   * ==================================================
   */
  const {
    data: positions,
    error: positionsError,
  } = await admin
    .from(
      "investment_positions",
    )
    .select(
      `
      id,

      investor_id,
      opportunity_id,
      subscription_id,
      payment_id,

      principal_amount,
      currency,
      status,

      funded_at,
      created_at,
      updated_at,

      opportunity:investment_opportunities!investment_positions_opportunity_id_fkey (
        id,
        slug,
        title,
        asset_category,
        location,
        status,
        funding_target,
        total_funded,
        investor_count,
        expected_duration_months,
        target_return_min,
        target_return_max,
        target_return_note
      )
      `,
    )
    .eq(
      "investor_id",
      user.id,
    )
    .order(
      "funded_at",
      {
        ascending:
          false,
      },
    );

  if (positionsError) {
    console.error(
      "Investor portfolio load error:",
      positionsError,
    );

    throw new Error(
      "Unable to load your investment portfolio.",
    );
  }

  const records =
    positions ?? [];

  /*
   * ==================================================
   * 3. PUBLISHED VALUATIONS
   * ==================================================
   */
  const {
    data: valuationRows,
    error: valuationError,
  } = await admin
    .from(
      "investment_position_valuations",
    )
    .select(
      `
      id,
      position_id,
      principal_amount,
      position_value,
      unrealized_gain_loss,
      valuation_date,

      valuation:investment_valuations!inner (
        id,
        status,
        published_at
      )
      `,
    )
    .eq(
      "investor_id",
      user.id,
    )
    .eq(
      "valuation.status",
      "published",
    )
    .order(
      "valuation_date",
      {
        ascending:
          false,
      },
    );

  if (valuationError) {
    console.error(
      "Portfolio valuations load error:",
      valuationError,
    );
  }

  /*
   * ==================================================
   * 4. LATEST VALUATION PER POSITION
   * ==================================================
   */
  const latestValuationByPosition =
    new Map<
      string,
      LatestValuation
    >();

  for (
    const valuation of
      valuationRows ?? []
  ) {
    if (
      latestValuationByPosition.has(
        valuation.position_id,
      )
    ) {
      continue;
    }

    latestValuationByPosition.set(
      valuation.position_id,
      {
        positionValue:
          Number(
            valuation.position_value,
          ),

        unrealizedGainLoss:
          Number(
            valuation.unrealized_gain_loss,
          ),

        valuationDate:
          valuation.valuation_date,
      },
    );
  }

  /*
   * ==================================================
   * 5. ENRICH POSITIONS
   * ==================================================
   */
  const portfolioPositions =
    records.map(
      (
        position,
      ) => {
        const principal =
          Number(
            position.principal_amount,
          );

        const latestValuation =
          latestValuationByPosition.get(
            position.id,
          );

        const currentValue =
          latestValuation
            ?.positionValue ??
          principal;

        const unrealizedGainLoss =
          latestValuation
            ?.unrealizedGainLoss ??
          currentValue -
            principal;

        const unrealizedReturn =
          principal > 0
            ? (
                unrealizedGainLoss /
                principal
              ) *
              100
            : 0;

        return {
          ...position,

          principal,

          currentValue,

          unrealizedGainLoss,

          unrealizedReturn,

          latestValuationDate:
            latestValuation
              ?.valuationDate ??
            null,

          hasPublishedValuation:
            Boolean(
              latestValuation,
            ),
        };
      },
    );

  /*
   * ==================================================
   * 6. SUMMARY
   * ==================================================
   */
  const totalPrincipal =
    portfolioPositions.reduce(
      (
        total,
        position,
      ) =>
        total +
        position.principal,
      0,
    );

  const portfolioValue =
    portfolioPositions.reduce(
      (
        total,
        position,
      ) =>
        total +
        position.currentValue,
      0,
    );

  const unrealizedGainLoss =
    portfolioValue -
    totalPrincipal;

  const unrealizedReturn =
    totalPrincipal > 0
      ? (
          unrealizedGainLoss /
          totalPrincipal
        ) *
        100
      : 0;

  const activePositions =
    portfolioPositions.filter(
      (position) =>
        position.status ===
        "active",
    );

  return (
    <div className="space-y-8">
      {/* HEADER */}

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Portfolio
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          Your Investment Portfolio
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Track funded principal, current reported
          valuations and unrealized investment
          performance.
        </p>
      </div>

      {/* SUMMARY */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={
            CircleDollarSign
          }
          label="Portfolio value"
          value={formatMoney(
            portfolioValue,
          )}
        />

        <SummaryCard
          icon={
            WalletCards
          }
          label="Invested principal"
          value={formatMoney(
            totalPrincipal,
          )}
        />

        <SummaryCard
          icon={
            unrealizedGainLoss >=
            0
              ? TrendingUp
              : TrendingDown
          }
          label={
            unrealizedGainLoss >=
            0
              ? "Unrealized gain"
              : "Unrealized loss"
          }
          value={formatSignedMoney(
            unrealizedGainLoss,
          )}
          secondary={formatPercent(
            unrealizedReturn,
          )}
        />

        <SummaryCard
          icon={
            BriefcaseBusiness
          }
          label="Active positions"
          value={String(
            activePositions.length,
          )}
        />
      </div>

      {/* EMPTY */}

      {portfolioPositions.length ===
      0 ? (
        <section className="rounded-[1.75rem] border border-forest-900/10 bg-white px-6 py-16 text-center">
          <WalletCards className="mx-auto size-8 text-stone-300" />

          <h2 className="font-display mt-5 text-3xl font-semibold text-forest-950">
            You do not have funded investments yet.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-500">
            Investments appear here after payment
            verification creates a funded position.
          </p>

          <Link
            href="/investments"
            className="focus-ring mt-7 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white"
          >
            Explore opportunities

            <ArrowRight className="size-4" />
          </Link>
        </section>
      ) : (
        <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
          <div className="border-b border-forest-900/10 px-6 py-6 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Funded holdings
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              Investment Positions
            </h2>
          </div>

          <div className="divide-y divide-forest-900/10">
            {portfolioPositions.map(
              (
                position,
              ) => {
                const opportunity =
                  Array.isArray(
                    position.opportunity,
                  )
                    ? position
                        .opportunity[0] ??
                      null
                    : position.opportunity;

                return (
                  <article
                    key={
                      position.id
                    }
                    className="p-6 sm:p-8"
                  >
                    <div className="flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <PositionStatusBadge
                            status={
                              position.status
                            }
                          />

                          {position.hasPublishedValuation ? (
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-blue-700">
                              Valued
                            </span>
                          ) : (
                            <span className="rounded-full bg-stone-100 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-600">
                              Principal basis
                            </span>
                          )}

                          {opportunity
                            ?.asset_category ? (
                            <span className="rounded-full bg-ivory-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-500">
                              {humanize(
                                opportunity.asset_category,
                              )}
                            </span>
                          ) : null}
                        </div>

                        <h3 className="font-display mt-4 text-2xl font-semibold text-forest-950 sm:text-3xl">
                          {opportunity
                            ?.title ??
                            "Investment position"}
                        </h3>

                        {opportunity
                          ?.location ? (
                          <p className="mt-2 text-sm text-stone-500">
                            {
                              opportunity.location
                            }
                          </p>
                        ) : null}

                        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
                          <DataPoint
                            label="Current value"
                            value={formatMoney(
                              position.currentValue,
                            )}
                          />

                          <DataPoint
                            label="Principal"
                            value={formatMoney(
                              position.principal,
                            )}
                          />

                          <DataPoint
                            label="Gain / loss"
                            value={formatSignedMoney(
                              position.unrealizedGainLoss,
                            )}
                          />

                          <DataPoint
                            label="Return"
                            value={formatPercent(
                              position.unrealizedReturn,
                            )}
                          />

                          <DataPoint
                            label="Funded"
                            value={
                              position.funded_at
                                ? formatDate(
                                    position.funded_at,
                                  )
                                : "—"
                            }
                          />
                        </div>

                        {position.latestValuationDate ? (
                          <p className="mt-5 text-xs text-stone-500">
                            Current value based on published
                            valuation dated{" "}
                            <strong className="text-forest-950">
                              {formatValuationDate(
                                position.latestValuationDate,
                              )}
                            </strong>
                            .
                          </p>
                        ) : (
                          <p className="mt-5 text-xs text-stone-500">
                            No published valuation is
                            available yet. Current value
                            therefore equals funded principal.
                          </p>
                        )}
                      </div>

                      <Link
                        href={`/dashboard/portfolio/${position.id}`}
                        className="focus-ring inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-forest-950 px-4 text-xs font-semibold text-white transition hover:bg-forest-800"
                      >
                        View position

                        <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        </section>
      )}

      {/* VALUATION DISCLOSURE */}

      <section className="rounded-[1.75rem] bg-forest-950 p-6 text-white sm:p-8">
        <TrendingUp className="size-6 text-gold-400" />

        <h2 className="font-display mt-5 text-3xl font-semibold">
          Understanding portfolio value
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
          Current position values use the latest
          published valuation available for each
          investment. Where no published valuation
          exists, the original funded principal is
          displayed instead. Valuations are estimates
          and are not guarantees of realizable value.
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
  secondary,
}: {
  icon:
    LucideIcon;

  label: string;

  value: string;

  secondary?: string;
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

      {secondary ? (
        <p className="mt-2 text-xs font-semibold text-stone-500">
          {secondary}
        </p>
      ) : null}
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

function PositionStatusBadge({
  status,
}: {
  status: string;
}) {
  const active =
    status ===
    "active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-stone-100 text-stone-600"
      }`}
    >
      {active ? (
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
        0,
    },
  ).format(
    cents / 100,
  );
}

function formatSignedMoney(
  cents: number,
) {
  const amount =
    formatMoney(
      Math.abs(
        cents,
      ),
    );

  if (cents > 0) {
    return `+${amount}`;
  }

  if (cents < 0) {
    return `-${amount}`;
  }

  return amount;
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
      value,
    ),
  );
}

function formatValuationDate(
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