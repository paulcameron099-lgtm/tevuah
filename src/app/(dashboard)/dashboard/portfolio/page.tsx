import type { LucideIcon } from "lucide-react";

import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  HandCoins,
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

export default async function InvestorPortfolioPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.role !== "investor") redirect("/dashboard");

  const accountAccess = await checkAccountAccess(user.id);
  if (!accountAccess.allowed) redirect("/account-restricted");

  const admin = createAdminClient();

  /* ==================================================
   * POSITIONS
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
    .eq("investor_id", user.id)
    .order("funded_at", { ascending: false });

  if (positionsError) {
    console.error("Investor portfolio load error:", positionsError);
    throw new Error("Unable to load your investment portfolio.");
  }

  const records = positions ?? [];

  /* ==================================================
   * PUBLISHED VALUATIONS
   * ================================================== */
  const { data: valuationRows, error: valuationError } = await admin
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

  if (valuationError) {
    console.error("Portfolio valuations load error:", valuationError);
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
   * BASIS SUMMARY
   * ================================================== */
  const { data: basisRows, error: basisError } = await admin
    .from("investment_position_basis_summary")
    .select("position_id,investor_id,original_principal,adjusted_cost_basis")
    .eq("investor_id", user.id);

  if (basisError) {
    console.error("Portfolio basis summary load error:", basisError);
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
   * BASIS REDUCTIONS = CAPITAL RETURNED
   * ================================================== */
  const { data: basisEvents, error: basisEventsError } = await admin
    .from("investment_position_basis_events")
    .select("id,position_id,event_type,amount,event_date")
    .eq("investor_id", user.id)
    .in("event_type", ["return_of_capital", "redemption"]);

  if (basisEventsError) {
    console.error("Portfolio basis events load error:", basisEventsError);
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
   * ================================================== */
  const { data: distributionRows, error: distributionError } = await admin
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

  if (distributionError) {
    console.error("Portfolio distributions load error:", distributionError);
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
   * ENRICH
   * ================================================== */
  const portfolioPositions = records.map((position) => {
    const storedPrincipal = Number(position.principal_amount);
    const basis = basisByPosition.get(position.id);
    const originalPrincipal = basis?.originalPrincipal ?? storedPrincipal;
    const adjustedCostBasis = basis?.adjustedCostBasis ?? originalPrincipal;
    const latestValuation = latestValuationByPosition.get(position.id);
    const currentValue = latestValuation?.positionValue ?? storedPrincipal;
    const capitalReturned = capitalReturnedByPosition.get(position.id) ?? 0;
    const cash = cashByPosition.get(position.id) ?? {
      incomeReceived: 0,
      totalPaidCash: 0,
    };

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

  const includedPositions = portfolioPositions.filter(
    (position) => position.status !== "cancelled",
  );

  const portfolioValue = includedPositions.reduce((sum, item) => sum + item.currentValue, 0);
  const originalPrincipal = includedPositions.reduce(
    (sum, item) => sum + item.originalPrincipal,
    0,
  );
  const adjustedCostBasis = includedPositions.reduce(
    (sum, item) => sum + item.adjustedCostBasis,
    0,
  );
  const capitalReturned = includedPositions.reduce(
    (sum, item) => sum + item.capitalReturned,
    0,
  );
  const incomeReceived = includedPositions.reduce(
    (sum, item) => sum + item.incomeReceived,
    0,
  );
  const totalPaidCash = includedPositions.reduce((sum, item) => sum + item.totalPaidCash, 0);
  const reportedEconomicValue = portfolioValue + totalPaidCash;
  const economicGain = reportedEconomicValue - originalPrincipal;
  const totalReturn = originalPrincipal > 0 ? (economicGain / originalPrincipal) * 100 : 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Portfolio
        </p>
        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          Your Investment Portfolio
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Track current value, original principal, adjusted cost basis, capital returned and
          paid income across your funded positions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <SummaryCard icon={CircleDollarSign} label="Current value" value={formatMoney(portfolioValue)} />
        <SummaryCard icon={WalletCards} label="Original principal" value={formatMoney(originalPrincipal)} />
        <SummaryCard icon={Scale} label="Adjusted cost basis" value={formatMoney(adjustedCostBasis)} />
        <SummaryCard icon={HandCoins} label="Capital returned" value={formatMoney(capitalReturned)} />
        <SummaryCard icon={HandCoins} label="Income received" value={formatMoney(incomeReceived)} />
        <SummaryCard
          icon={economicGain >= 0 ? TrendingUp : TrendingDown}
          label="Reported total return"
          value={formatSignedMoney(economicGain)}
          secondary={formatPercent(totalReturn)}
        />
      </div>

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-3">
          <DataPoint label="Reported economic value" value={formatMoney(reportedEconomicValue)} />
          <DataPoint label="Total paid cash" value={formatMoney(totalPaidCash)} />
          <DataPoint label="Positions" value={String(portfolioPositions.length)} />
        </div>
      </section>

      {portfolioPositions.length === 0 ? (
        <section className="rounded-[1.75rem] border border-forest-900/10 bg-white px-6 py-16 text-center">
          <WalletCards className="mx-auto size-8 text-stone-300" />
          <h2 className="font-display mt-5 text-3xl font-semibold text-forest-950">
            You do not have funded investments yet.
          </h2>
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
            {portfolioPositions.map((position) => {
              const opportunity = Array.isArray(position.opportunity)
                ? position.opportunity[0] ?? null
                : position.opportunity;

              return (
                <article key={position.id} className="p-6 sm:p-8">
                  <div className="flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <PositionStatusBadge status={position.status} />
                        <span className="rounded-full bg-ivory-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-500">
                          {position.hasPublishedValuation ? "Valued" : "Principal basis"}
                        </span>
                        {opportunity?.asset_category ? (
                          <span className="rounded-full bg-ivory-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-500">
                            {humanize(opportunity.asset_category)}
                          </span>
                        ) : null}
                      </div>

                      <h3 className="font-display mt-4 text-2xl font-semibold text-forest-950 sm:text-3xl">
                        {opportunity?.title ?? "Investment position"}
                      </h3>

                      {opportunity?.location ? (
                        <p className="mt-2 text-sm text-stone-500">{opportunity.location}</p>
                      ) : null}

                      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        <DataPoint label="Current value" value={formatMoney(position.currentValue)} />
                        <DataPoint label="Original principal" value={formatMoney(position.originalPrincipal)} />
                        <DataPoint label="Adjusted basis" value={formatMoney(position.adjustedCostBasis)} />
                        <DataPoint label="Capital returned" value={formatMoney(position.capitalReturned)} />
                        <DataPoint label="Income received" value={formatMoney(position.incomeReceived)} />
                        <DataPoint label="Reported return" value={formatPercent(position.totalReturn)} />
                      </div>

                      <p className="mt-5 text-xs text-stone-500">
                        {position.latestValuationDate
                          ? `Current value uses the published valuation dated ${formatValuationDate(
                              position.latestValuationDate,
                            )}.`
                          : "No published valuation is available yet; current value falls back to funded principal."}
                      </p>
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
            })}
          </div>
        </section>
      )}

      <section className="rounded-[1.75rem] bg-forest-950 p-6 text-white sm:p-8">
        <Scale className="size-6 text-gold-400" />
        <h2 className="font-display mt-5 text-3xl font-semibold">Understanding cost basis</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
          Original principal remains unchanged. Adjusted cost basis is calculated from the
          immutable basis ledger. Capital returned reflects recorded basis reductions from
          return-of-capital and redemption events; ordinary paid distributions are reported
          separately as income.
        </p>
      </section>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  secondary,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  secondary?: string;
}) {
  return (
    <div className="rounded-3xl border border-forest-900/10 bg-white p-5">
      <div className="flex size-10 items-center justify-center rounded-full bg-ivory-50">
        <Icon className="size-4.5 text-gold-600" />
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">{label}</p>
      <p className="font-display mt-2 text-3xl font-semibold text-forest-950">{value}</p>
      {secondary ? <p className="mt-2 text-xs font-semibold text-stone-500">{secondary}</p> : null}
    </div>
  );
}

function DataPoint({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">{label}</p>
      <p className="mt-1 wrap-break-word text-sm font-semibold text-forest-950">{value}</p>
    </div>
  );
}

function PositionStatusBadge({ status }: { status: string }) {
  const active = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest ${
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

function formatValuationDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
