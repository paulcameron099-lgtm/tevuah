import type { LucideIcon } from "lucide-react";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  HandCoins,
  History,
  Scale,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { checkAccountAccess } from "@/src/lib/auth/account-status";
import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

type LatestValuation = {
  positionValue: number;
  valuationDate: string;
};

type BasisSummary = {
  originalPrincipal: number;
  adjustedCostBasis: number;
};

type CashSummary = {
  incomeReceived: number;
  totalPaidCash: number;
};

export default async function InvestorDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "admin" || user.role === "super_admin") {
    redirect("/admin");
  }

  const accountAccess = await checkAccountAccess(user.id);

  if (!accountAccess.allowed) {
    redirect("/account-restricted");
  }

  const admin = createAdminClient();

  /* ==================================================
   * FUNDED POSITIONS
   * ================================================== */
  const { data: positions, error: positionsError } = await admin
    .from("investment_positions")
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
    .eq("investor_id", user.id)
    .order("funded_at", { ascending: false });

  if (positionsError) {
    console.error("Investor dashboard positions load error:", positionsError);
    throw new Error("Unable to load your investment portfolio.");
  }

  const positionRecords = positions ?? [];

  /* ==================================================
   * LATEST PUBLISHED VALUATIONS
   * ================================================== */
  const { data: valuationRows, error: valuationsError } = await admin
    .from("investment_position_valuations")
    .select(
      `
      id,
      position_id,
      position_value,
      valuation_date,
      valuation:investment_valuations!inner (
        id,
        status,
        published_at
      )
      `,
    )
    .eq("investor_id", user.id)
    .eq("valuation.status", "published")
    .order("valuation_date", { ascending: false });

  if (valuationsError) {
    console.error("Investor dashboard valuations load error:", valuationsError);
  }

  const latestValuationByPosition = new Map<string, LatestValuation>();

  for (const valuation of valuationRows ?? []) {
    if (latestValuationByPosition.has(valuation.position_id)) continue;

    latestValuationByPosition.set(valuation.position_id, {
      positionValue: Number(valuation.position_value),
      valuationDate: valuation.valuation_date,
    });
  }

  /* ==================================================
   * COST BASIS SUMMARY
   * ================================================== */
  const { data: basisRows, error: basisError } = await admin
    .from("investment_position_basis_summary")
    .select(
      `
      position_id,
      investor_id,
      original_principal,
      adjusted_cost_basis
      `,
    )
    .eq("investor_id", user.id);

  if (basisError) {
    console.error("Dashboard basis summary load error:", basisError);
    throw new Error("Unable to load investment cost basis.");
  }

  const basisByPosition = new Map<string, BasisSummary>();

  for (const basis of basisRows ?? []) {
    basisByPosition.set(basis.position_id, {
      originalPrincipal: Number(basis.original_principal),
      adjustedCostBasis: Math.max(0, Number(basis.adjusted_cost_basis)),
    });
  }

  /* ==================================================
   * BASIS EVENTS
   * Capital returned is the absolute value of actual
   * negative basis events, not merely distribution cash.
   * ================================================== */
  const { data: basisEvents, error: basisEventsError } = await admin
    .from("investment_position_basis_events")
    .select(
      `
      id,
      position_id,
      event_type,
      amount,
      event_date
      `,
    )
    .eq("investor_id", user.id)
    .in("event_type", ["return_of_capital", "redemption"]);

  if (basisEventsError) {
    console.error("Dashboard basis events load error:", basisEventsError);
  }

  const capitalReturnedByPosition = new Map<string, number>();

  for (const event of basisEvents ?? []) {
    const amount = Number(event.amount);
    const reduction = amount < 0 ? Math.abs(amount) : 0;
    capitalReturnedByPosition.set(
      event.position_id,
      (capitalReturnedByPosition.get(event.position_id) ?? 0) + reduction,
    );
  }

  /* ==================================================
   * PAID DISTRIBUTIONS
   * Income excludes return-of-capital/redemption.
   * totalPaidCash includes every completed cash payment.
   * ================================================== */
  const { data: distributionRows, error: distributionsError } = await admin
    .from("investor_distributions")
    .select(
      `
      id,
      position_id,
      net_amount,
      status,
      paid_at,
      distribution:investment_distributions!investor_distributions_distribution_id_fkey (
        id,
        distribution_type
      )
      `,
    )
    .eq("investor_id", user.id)
    .eq("status", "paid");

  if (distributionsError) {
    console.error("Dashboard distributions load error:", distributionsError);
  }

  const cashByPosition = new Map<string, CashSummary>();

  for (const allocation of distributionRows ?? []) {
    const distribution = Array.isArray(allocation.distribution)
      ? allocation.distribution[0] ?? null
      : allocation.distribution;

    const amount = Number(allocation.net_amount);
    const current = cashByPosition.get(allocation.position_id) ?? {
      incomeReceived: 0,
      totalPaidCash: 0,
    };

    current.totalPaidCash += amount;

    if (
      distribution?.distribution_type !== "return_of_capital" &&
      distribution?.distribution_type !== "redemption"
    ) {
      current.incomeReceived += amount;
    }

    cashByPosition.set(allocation.position_id, current);
  }

  /* ==================================================
   * ENRICH POSITIONS
   * ================================================== */
  const portfolioPositions = positionRecords.map((position) => {
    const storedPrincipal = Number(position.principal_amount);
    const basis = basisByPosition.get(position.id);
    const originalPrincipal = basis?.originalPrincipal ?? storedPrincipal;
    const adjustedCostBasis = basis?.adjustedCostBasis ?? originalPrincipal;
    const latestValuation = latestValuationByPosition.get(position.id);
    const currentValue = latestValuation?.positionValue ?? storedPrincipal;
    const cash = cashByPosition.get(position.id) ?? {
      incomeReceived: 0,
      totalPaidCash: 0,
    };
    const capitalReturned = capitalReturnedByPosition.get(position.id) ?? 0;

    const reportedEconomicValue = currentValue + cash.totalPaidCash;
    const economicGain = reportedEconomicValue - originalPrincipal;
    const totalReturn =
      originalPrincipal > 0 ? (economicGain / originalPrincipal) * 100 : 0;

    return {
      ...position,
      originalPrincipal,
      adjustedCostBasis,
      capitalReturned,
      incomeReceived: cash.incomeReceived,
      totalPaidCash: cash.totalPaidCash,
      currentValue,
      reportedEconomicValue,
      economicGain,
      totalReturn,
      latestValuationDate: latestValuation?.valuationDate ?? null,
      hasPublishedValuation: Boolean(latestValuation),
    };
  });

  /* ==================================================
   * SUBSCRIPTIONS + PAYMENTS FOR PIPELINE
   * ================================================== */
  const [{ data: subscriptions }, { data: payments }] = await Promise.all([
    admin
      .from("investment_subscriptions")
      .select("id,status,created_at")
      .eq("investor_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    admin
      .from("investment_payments")
      .select("id,status,created_at")
      .eq("investor_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const pendingSubscriptions = (subscriptions ?? []).filter((subscription) =>
    ["submitted", "under_review", "action_required", "approved"].includes(
      subscription.status,
    ),
  );

  const pendingPayments = (payments ?? []).filter((payment) =>
    ["awaiting_payment", "payment_reported", "pending_verification", "rejected"].includes(
      payment.status,
    ),
  );

  /* ==================================================
   * RECENT PUBLISHED STATEMENTS
   * ==================================================
   *
   * Investor dashboard rules:
   * - signed-in investor only
   * - published only
   * - latest 3 only
   *
   * Draft and void statements never appear here.
   * A reinstated statement automatically returns because
   * its status becomes published again.
   * ================================================== */
  const {
    data: statementRows,
    error: statementsError,
  } = await admin
    .from("investor_statements")
    .select(
      `
      id,
      period_start,
      period_end,
      statement_type,
      currency,
      closing_portfolio_value,
      total_return_percent,
      reconstructed_from_legacy,
      historical_published_at,
      published_at,
      status
      `,
    )
    .eq("investor_id", user.id)
    .eq("status", "published")
    .order("period_end", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(3);

  if (statementsError) {
    console.error(
      "Investor dashboard recent statements load error:",
      statementsError,
    );
  }

  const recentStatements = statementRows ?? [];

  /* ==================================================
   * PORTFOLIO TOTALS
   * ================================================== */
  const includedPositions = portfolioPositions.filter(
    (position) => position.status !== "cancelled",
  );

  const portfolioValue = includedPositions.reduce(
    (total, position) => total + position.currentValue,
    0,
  );

  const originalPrincipal = includedPositions.reduce(
    (total, position) => total + position.originalPrincipal,
    0,
  );

  const adjustedCostBasis = includedPositions.reduce(
    (total, position) => total + position.adjustedCostBasis,
    0,
  );

  const capitalReturned = includedPositions.reduce(
    (total, position) => total + position.capitalReturned,
    0,
  );

  const incomeReceived = includedPositions.reduce(
    (total, position) => total + position.incomeReceived,
    0,
  );

  const totalPaidCash = includedPositions.reduce(
    (total, position) => total + position.totalPaidCash,
    0,
  );

  const reportedEconomicValue = portfolioValue + totalPaidCash;
  const economicGain = reportedEconomicValue - originalPrincipal;
  const totalReturn =
    originalPrincipal > 0 ? (economicGain / originalPrincipal) * 100 : 0;

  const recentPositions = portfolioPositions.slice(0, 5);
  const investorName = user.first_name?.trim() || "Investor";

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] bg-forest-950 p-7 text-white sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
          Investor dashboard
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
          Welcome back, {investorName}.
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
          Review current value, adjusted cost basis, capital returned and cash income across
          your funded investments.
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
            href="/dashboard/distributions"
            className="focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            View distributions
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <MetricCard
          icon={CircleDollarSign}
          label="Current value"
          value={formatMoney(portfolioValue)}
          description="Latest published valuation or principal fallback"
        />

        <MetricCard
          icon={WalletCards}
          label="Original principal"
          value={formatMoney(originalPrincipal)}
          description="Original verified funded capital"
        />

        <MetricCard
          icon={Scale}
          label="Adjusted cost basis"
          value={formatMoney(adjustedCostBasis)}
          description="Principal after recorded basis reductions"
        />

        <MetricCard
          icon={HandCoins}
          label="Capital returned"
          value={formatMoney(capitalReturned)}
          description="Basis reductions from ROC/redemption"
        />

        <MetricCard
          icon={HandCoins}
          label="Income received"
          value={formatMoney(incomeReceived)}
          description="Paid income distributions only"
        />

        <MetricCard
          icon={economicGain >= 0 ? TrendingUp : TrendingDown}
          label="Reported total return"
          value={formatSignedMoney(economicGain)}
          description={formatPercent(totalReturn)}
        />
      </div>

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-3">
          <MiniData label="Reported economic value" value={formatMoney(reportedEconomicValue)} />
          <MiniData label="Total paid cash" value={formatMoney(totalPaidCash)} />
          <MiniData label="Funded positions" value={String(portfolioPositions.length)} />
        </div>
      </section>

      {/* ==================================================
          RECENT STATEMENTS
      ================================================== */}
      <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
        <div className="flex flex-col gap-4 border-b border-forest-900/10 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Investor reporting
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              Recent Statements
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
              Your latest published portfolio statements and historical reporting records.
            </p>
          </div>

          <Link
            href="/dashboard/statements"
            className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-forest-950"
          >
            View all statements
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {recentStatements.length === 0 ? (
          <div className="px-6 py-12 text-center sm:px-8">
            <FileText className="mx-auto size-7 text-stone-300" />

            <h3 className="font-display mt-4 text-2xl font-semibold text-forest-950">
              No published statements yet.
            </h3>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-stone-500">
              Published investor statements will appear here when they become available.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-forest-900/10">
            {recentStatements.map((statement) => {
              const statementDate =
                statement.reconstructed_from_legacy &&
                statement.historical_published_at
                  ? statement.historical_published_at.slice(0, 10)
                  : statement.published_at
                    ? statement.published_at.slice(0, 10)
                    : statement.period_end;

              return (
                <article
                  key={statement.id}
                  className="p-6 sm:px-8"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-emerald-700">
                          <CheckCircle2 className="size-3" />
                          Published
                        </span>

                        <span className="rounded-full bg-ivory-50 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-stone-500">
                          {humanize(statement.statement_type)}
                        </span>

                        {statement.reconstructed_from_legacy ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-blue-700">
                            <History className="size-3" />
                            Historical
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <CalendarDays className="size-4 text-gold-600" />

                        <h3 className="font-display text-xl font-semibold text-forest-950">
                          {formatDate(statement.period_start)}
                          {" — "}
                          {formatDate(statement.period_end)}
                        </h3>
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        <MiniData
                          label="Closing value"
                          value={formatMoney(
                            Number(statement.closing_portfolio_value),
                          )}
                        />

                        <MiniData
                          label="Total return"
                          value={
                            statement.total_return_percent != null
                              ? formatPercent(
                                  Number(statement.total_return_percent),
                                )
                              : "—"
                          }
                        />

                        <MiniData
                          label="Statement date"
                          value={formatDate(statementDate)}
                        />
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-3">
                      <Link
                        href={`/dashboard/statements/${statement.id}`}
                        className="focus-ring inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950 transition hover:bg-ivory-50"
                      >
                        View statement
                        <ArrowRight className="size-3.5" />
                      </Link>

                      <Link
                        href={`/api/statements/${statement.id}/pdf`}
                        className="focus-ring inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-forest-950 px-4 text-xs font-semibold text-white transition hover:bg-forest-800"
                      >
                        Download PDF
                        <FileText className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
          <div className="flex items-center justify-between border-b border-forest-900/10 px-6 py-6 sm:px-8">
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

          {recentPositions.length === 0 ? (
            <div className="px-6 py-14 text-center sm:px-8">
              <WalletCards className="mx-auto size-7 text-stone-300" />
              <h3 className="font-display mt-4 text-2xl font-semibold text-forest-950">
                No funded positions yet.
              </h3>
            </div>
          ) : (
            <div className="divide-y divide-forest-900/10">
              {recentPositions.map((position) => {
                const opportunity = Array.isArray(position.opportunity)
                  ? position.opportunity[0] ?? null
                  : position.opportunity;

                return (
                  <article key={position.id} className="p-6 sm:px-8">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <PositionBadge status={position.status} />
                          <span className="rounded-full bg-ivory-50 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-stone-500">
                            {position.hasPublishedValuation ? "Valued" : "Principal basis"}
                          </span>
                        </div>

                        <h3 className="font-display mt-3 text-xl font-semibold text-forest-950">
                          {opportunity?.title ?? "Investment position"}
                        </h3>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                          <MiniData label="Current value" value={formatMoney(position.currentValue)} />
                          <MiniData label="Original principal" value={formatMoney(position.originalPrincipal)} />
                          <MiniData label="Adjusted basis" value={formatMoney(position.adjustedCostBasis)} />
                          <MiniData label="Capital returned" value={formatMoney(position.capitalReturned)} />
                          <MiniData label="Income received" value={formatMoney(position.incomeReceived)} />
                        </div>
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
              })}
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6">
            <Clock3 className="size-5 text-gold-600" />
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
              Investment pipeline
            </p>
            <div className="mt-6 space-y-3">
              <PipelineRow label="Pending subscriptions" value={pendingSubscriptions.length} />
              <PipelineRow label="Payments in progress" value={pendingPayments.length} />
              <PipelineRow label="Funded positions" value={portfolioPositions.length} />
            </div>
          </section>

          <section className="rounded-[1.75rem] bg-forest-950 p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">
              Basis methodology
            </p>
            <p className="mt-3 text-sm leading-7 text-white/60">
              Original principal never changes. Adjusted cost basis comes from the immutable
              basis ledger. Return-of-capital and redemption basis reductions are shown as
              capital returned, while ordinary paid distributions are shown as income.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: LucideIcon;
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
      <p className="font-display mt-2 text-3xl font-semibold text-forest-950">{value}</p>
      <p className="mt-2 text-xs leading-5 text-stone-500">{description}</p>
    </div>
  );
}

function MiniData({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-stone-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-forest-950">{value}</p>
    </div>
  );
}

function PipelineRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-ivory-50 px-4 py-3">
      <p className="text-sm text-stone-600">{label}</p>
      <span className="flex size-8 items-center justify-center rounded-full bg-white text-xs font-bold text-forest-950">
        {value}
      </span>
    </div>
  );
}

function PositionBadge({ status }: { status: string }) {
  const active = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-widest ${
        active ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-600"
      }`}
    >
      {active ? <CheckCircle2 className="size-3" /> : <Clock3 className="size-3" />}
      {humanize(status)}
    </span>
  );
}

function humanize(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function formatSignedMoney(cents: number) {
  const amount = formatMoney(Math.abs(cents));
  if (cents > 0) return `+${amount}`;
  if (cents < 0) return `-${amount}`;
  return amount;
}

function formatPercent(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}