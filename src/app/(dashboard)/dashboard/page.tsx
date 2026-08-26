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

export default async function InvestorDashboardPage() {
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
    user.role === "admin" ||
    user.role === "super_admin"
  ) {
    redirect("/admin");
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
   * 2. FUNDED POSITIONS
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
        expected_duration_months,
        target_return_min,
        target_return_max
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
      "Investor dashboard positions load error:",
      positionsError,
    );

    throw new Error(
      "Unable to load your investment portfolio.",
    );
  }

  const positionRecords =
    positions ?? [];

  /*
   * ==================================================
   * 3. PUBLISHED POSITION VALUATIONS
   * ==================================================
   *
   * !inner means we only accept position valuations
   * connected to a valuation record whose status
   * is published.
   */
  const {
    data: valuationRows,
    error: valuationsError,
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

  if (valuationsError) {
    console.error(
      "Investor dashboard valuations load error:",
      valuationsError,
    );
  }

  /*
   * ==================================================
   * 4. BUILD LATEST VALUATION MAP
   * ==================================================
   *
   * Rows are ordered newest first.
   *
   * The first valuation encountered for a position
   * is therefore its latest published valuation.
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
    positionRecords.map(
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
   * 6. SUBSCRIPTIONS
   * ==================================================
   */
  const {
    data: subscriptions,
    error: subscriptionsError,
  } = await admin
    .from(
      "investment_subscriptions",
    )
    .select(
      `
      id,
      opportunity_id,
      commitment_amount,
      status,
      submitted_at,
      reviewed_at,
      created_at
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
    )
    .limit(10);

  if (subscriptionsError) {
    console.error(
      "Dashboard subscriptions load error:",
      subscriptionsError,
    );
  }

  const subscriptionRecords =
    subscriptions ?? [];

  /*
   * ==================================================
   * 7. PAYMENTS
   * ==================================================
   */
  const {
    data: payments,
    error: paymentsError,
  } = await admin
    .from(
      "investment_payments",
    )
    .select(
      `
      id,
      subscription_id,
      opportunity_id,
      expected_amount,
      reported_amount,
      verified_amount,
      status,
      investor_reported_at,
      verified_at,
      created_at
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
    )
    .limit(10);

  if (paymentsError) {
    console.error(
      "Dashboard payments load error:",
      paymentsError,
    );
  }

  const paymentRecords =
    payments ?? [];

  /*
   * ==================================================
   * 8. PORTFOLIO METRICS
   * ==================================================
   */

  /*
   * Current reported portfolio value.
   *
   * Latest published valuation if available.
   * Otherwise principal.
   */
  const portfolioValue =
    portfolioPositions
      .filter(
        (position) =>
          position.status !==
          "cancelled",
      )
      .reduce(
        (
          total,
          position,
        ) =>
          total +
          position.currentValue,
        0,
      );

  /*
   * Original money invested.
   */
  const totalFundedCapital =
    portfolioPositions
      .filter(
        (position) =>
          position.status !==
          "cancelled",
      )
      .reduce(
        (
          total,
          position,
        ) =>
          total +
          position.principal,
        0,
      );

  /*
   * Difference between current reported value
   * and original principal.
   */
  const totalUnrealizedGainLoss =
    portfolioValue -
    totalFundedCapital;

  const totalUnrealizedReturn =
    totalFundedCapital >
    0
      ? (
          totalUnrealizedGainLoss /
          totalFundedCapital
        ) *
        100
      : 0;

  const activePositions =
    portfolioPositions.filter(
      (position) =>
        position.status ===
        "active",
    );

  const pendingSubscriptions =
    subscriptionRecords.filter(
      (subscription) =>
        [
          "submitted",
          "under_review",
          "action_required",
          "approved",
        ].includes(
          subscription.status,
        ),
    );

  const pendingPayments =
    paymentRecords.filter(
      (payment) =>
        [
          "awaiting_payment",
          "payment_reported",
          "pending_verification",
          "rejected",
        ].includes(
          payment.status,
        ),
    );

  const recentPositions =
    portfolioPositions.slice(
      0,
      5,
    );

  const investorName =
    user.first_name?.trim() ||
    "Investor";

  return (
    <div className="space-y-8">
      {/* ==========================================
          WELCOME
      ========================================== */}

      <section className="rounded-[1.75rem] bg-forest-950 p-7 text-white sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
          Investor dashboard
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
          Welcome back,{" "}
          {investorName}.
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
          Review your current portfolio value,
          funded capital and investment performance
          across Tevuah Reserve.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/dashboard/portfolio"
            className="focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-gold-400 px-5 text-sm font-semibold text-forest-950 transition hover:bg-gold-300"
          >
            View portfolio

            <ArrowRight className="size-4" />
          </Link>

          <Link
            href="/investments"
            className="focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Explore opportunities

            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* ==========================================
          METRICS
      ========================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={
            CircleDollarSign
          }
          label="Portfolio value"
          value={formatMoney(
            portfolioValue,
          )}
          description="Latest reported investment value"
        />

        <MetricCard
          icon={
            WalletCards
          }
          label="Funded capital"
          value={formatMoney(
            totalFundedCapital,
          )}
          description="Original verified principal"
        />

        <MetricCard
          icon={
            totalUnrealizedGainLoss >=
            0
              ? TrendingUp
              : TrendingDown
          }
          label={
            totalUnrealizedGainLoss >=
            0
              ? "Unrealized gain"
              : "Unrealized loss"
          }
          value={formatSignedMoney(
            totalUnrealizedGainLoss,
          )}
          description={formatPercent(
            totalUnrealizedReturn,
          )}
        />

        <MetricCard
          icon={
            BriefcaseBusiness
          }
          label="Active investments"
          value={String(
            activePositions.length,
          )}
          description="Currently active funded positions"
        />
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        {/* ==========================================
            RECENT POSITIONS
        ========================================== */}

        <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
          <div className="flex flex-col gap-4 border-b border-forest-900/10 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
                Portfolio activity
              </p>

              <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
                Recent Investments
              </h2>
            </div>

            <Link
              href="/dashboard/portfolio"
              className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-forest-950"
            >
              View all

              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {recentPositions.length ===
          0 ? (
            <div className="px-6 py-14 text-center sm:px-8">
              <WalletCards className="mx-auto size-7 text-stone-300" />

              <h3 className="font-display mt-4 text-2xl font-semibold text-forest-950">
                No funded positions yet.
              </h3>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-stone-500">
                Investments appear here after funding
                has been verified and a funded position
                has been created.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-forest-900/10">
              {recentPositions.map(
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
                      className="p-6 sm:px-8"
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <PositionBadge
                              status={
                                position.status
                              }
                            />

                            {position.hasPublishedValuation ? (
                              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-blue-700">
                                Valued
                              </span>
                            ) : (
                              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-stone-600">
                                Principal basis
                              </span>
                            )}
                          </div>

                          <h3 className="font-display mt-3 text-xl font-semibold text-forest-950">
                            {opportunity
                              ?.title ??
                              "Investment position"}
                          </h3>

                          <div className="mt-4 grid gap-4 sm:grid-cols-3">
                            <MiniData
                              label="Current value"
                              value={formatMoney(
                                position.currentValue,
                              )}
                            />

                            <MiniData
                              label="Principal"
                              value={formatMoney(
                                position.principal,
                              )}
                            />

                            <MiniData
                              label="Gain / loss"
                              value={formatSignedMoney(
                                position.unrealizedGainLoss,
                              )}
                            />
                          </div>

                          {position.latestValuationDate ? (
                            <p className="mt-3 text-xs text-stone-400">
                              Latest valuation:{" "}
                              {formatValuationDate(
                                position.latestValuationDate,
                              )}
                            </p>
                          ) : (
                            <p className="mt-3 text-xs text-stone-400">
                              No published valuation yet.
                              Current value falls back to
                              funded principal.
                            </p>
                          )}
                        </div>

                        <Link
                          href={`/dashboard/portfolio/${position.id}`}
                          className="focus-ring inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950 transition hover:bg-ivory-50"
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
          )}
        </section>

        {/* ==========================================
            PIPELINE
        ========================================== */}

        <aside className="space-y-5">
          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6">
            <Clock3 className="size-5 text-gold-600" />

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
              Investment pipeline
            </p>

            <h2 className="font-display mt-3 text-2xl font-semibold text-forest-950">
              Current Activity
            </h2>

            <div className="mt-6 space-y-3">
              <PipelineRow
                label="Pending subscriptions"
                value={
                  pendingSubscriptions.length
                }
              />

              <PipelineRow
                label="Payments in progress"
                value={
                  pendingPayments.length
                }
              />

              <PipelineRow
                label="Funded positions"
                value={
                  portfolioPositions.length
                }
              />
            </div>

            <Link
              href="/dashboard/investments"
              className="focus-ring mt-6 inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-4 text-xs font-semibold text-white transition hover:bg-forest-800"
            >
              Manage investments

              <ArrowRight className="size-3.5" />
            </Link>
          </section>

          {pendingPayments.some(
            (payment) =>
              payment.status ===
              "rejected",
          ) ||
          pendingSubscriptions.some(
            (subscription) =>
              subscription.status ===
              "action_required",
          ) ? (
            <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6">
              <Clock3 className="size-5 text-amber-700" />

              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                Action required
              </p>

              <h2 className="font-display mt-3 text-2xl font-semibold text-amber-950">
                An investment needs your attention.
              </h2>

              <Link
                href="/dashboard/investments"
                className="focus-ring mt-5 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-amber-900 px-4 text-xs font-semibold text-white"
              >
                Review action items

                <ArrowRight className="size-3.5" />
              </Link>
            </section>
          ) : null}
        </aside>
      </div>

      {/* ==========================================
          VALUATION NOTICE
      ========================================== */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
          Portfolio methodology
        </p>

        <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
          Latest published valuation.
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Current portfolio value uses the latest
          published valuation for each funded position.
          If a position has not yet received a published
          valuation, its funded principal is used as the
          fallback value.
        </p>
      </section>
    </div>
  );
}

function MetricCard({
  icon:
    Icon,
  label,
  value,
  description,
}: {
  icon:
    LucideIcon;

  label: string;

  value: string;

  description: string;
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

      <p className="mt-2 text-xs leading-5 text-stone-500">
        {description}
      </p>
    </div>
  );
}

function PipelineRow({
  label,
  value,
}: {
  label: string;

  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-ivory-50 px-4 py-3">
      <p className="text-sm text-stone-600">
        {label}
      </p>

      <span className="flex size-8 items-center justify-center rounded-full bg-white text-xs font-bold text-forest-950">
        {value}
      </span>
    </div>
  );
}

function MiniData({
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

      <p className="mt-1 text-sm font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

function PositionBadge({
  status,
}: {
  status: string;
}) {
  const active =
    status ===
    "active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-widest ${
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