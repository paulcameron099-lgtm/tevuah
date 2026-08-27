import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  HandCoins,
  Scale,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { checkAccountAccess } from "@/src/lib/auth/account-status";
import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

type PageProps = {
  params: Promise<{ positionId: string }>;
};

type TimelineItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  amount: number | null;
  kind: "valuation" | "distribution" | "basis";
  status?: string | null;
};

export default async function InvestorPositionDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.role !== "investor") redirect("/dashboard");

  const accountAccess = await checkAccountAccess(user.id);
  if (!accountAccess.allowed) redirect("/account-restricted");

  const { positionId } = await params;
  const admin = createAdminClient();

  /* ==================================================
   * POSITION
   * ================================================== */
  const { data: position, error: positionError } = await admin
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
        short_description,
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
    .eq("id", positionId)
    .eq("investor_id", user.id)
    .maybeSingle();

  if (positionError || !position) {
    console.error("Investor position detail load error:", positionError);
    notFound();
  }

  const opportunity = Array.isArray(position.opportunity)
    ? position.opportunity[0] ?? null
    : position.opportunity;

  if (!opportunity) notFound();

  /* ==================================================
   * COST BASIS SUMMARY
   * ================================================== */
  const { data: basisSummary, error: basisSummaryError } = await admin
    .from("investment_position_basis_summary")
    .select(
      `
      position_id,
      investor_id,
      opportunity_id,
      original_principal,
      adjusted_cost_basis,
      currency,
      status,
      funded_at
      `,
    )
    .eq("position_id", position.id)
    .eq("investor_id", user.id)
    .maybeSingle();

  if (basisSummaryError) {
    console.error("Position basis summary load error:", basisSummaryError);
    throw new Error("Unable to load investment cost basis.");
  }

  const storedPrincipal = Number(position.principal_amount);
  const originalPrincipal = basisSummary
    ? Number(basisSummary.original_principal)
    : storedPrincipal;
  const adjustedCostBasis = basisSummary
    ? Math.max(0, Number(basisSummary.adjusted_cost_basis))
    : originalPrincipal;

  /* ==================================================
   * BASIS EVENTS
   * ================================================== */
  const { data: basisEvents, error: basisEventsError } = await admin
    .from("investment_position_basis_events")
    .select(
      `
      id,
      event_type,
      amount,
      currency,
      event_date,
      description,
      distribution_id,
      investor_distribution_id,
      created_at
      `,
    )
    .eq("position_id", position.id)
    .eq("investor_id", user.id)
    .order("event_date", { ascending: false });

  if (basisEventsError) {
    console.error("Position basis events load error:", basisEventsError);
  }

  const capitalReturned = (basisEvents ?? []).reduce((total, event) => {
    if (event.event_type !== "return_of_capital" && event.event_type !== "redemption") {
      return total;
    }
    const amount = Number(event.amount);
    return total + (amount < 0 ? Math.abs(amount) : 0);
  }, 0);

  /* ==================================================
   * PUBLISHED VALUATIONS
   * ================================================== */
  const { data: valuationRows, error: valuationError } = await admin
    .from("investment_position_valuations")
    .select(
      `
      id,
      valuation_id,
      position_id,
      principal_amount,
      position_value,
      unrealized_gain_loss,
      currency,
      valuation_date,
      valuation:investment_valuations!inner (
        id,
        status,
        valuation_type,
        source_name,
        methodology,
        published_at
      )
      `,
    )
    .eq("position_id", position.id)
    .eq("investor_id", user.id)
    .eq("valuation.status", "published")
    .order("valuation_date", { ascending: false });

  if (valuationError) {
    console.error("Investor position valuations load error:", valuationError);
  }

  const publishedValuations = valuationRows ?? [];
  const latestValuation = publishedValuations[0] ?? null;
  const currentValue = latestValuation
    ? Number(latestValuation.position_value)
    : storedPrincipal;

  /* ==================================================
   * DISTRIBUTIONS
   * ================================================== */
  const { data: distributionRows, error: distributionError } = await admin
    .from("investor_distributions")
    .select(
      `
      id,
      distribution_id,
      position_id,
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
        status,
        notes
      )
      `,
    )
    .eq("position_id", position.id)
    .eq("investor_id", user.id)
    .order("created_at", { ascending: false });

  if (distributionError) {
    console.error("Investor position distributions load error:", distributionError);
  }

  let incomeReceived = 0;
  let totalPaidCash = 0;
  let processingAmount = 0;
  let upcomingAmount = 0;
  let withholdingPaid = 0;

  for (const allocation of distributionRows ?? []) {
    const distribution = Array.isArray(allocation.distribution)
      ? allocation.distribution[0] ?? null
      : allocation.distribution;
    const net = Number(allocation.net_amount);

    if (allocation.status === "processing") processingAmount += net;
    if (allocation.status === "approved") upcomingAmount += net;

    if (allocation.status !== "paid") continue;

    totalPaidCash += net;
    withholdingPaid += Number(allocation.withholding_amount);

    if (
      distribution?.distribution_type !== "return_of_capital" &&
      distribution?.distribution_type !== "redemption"
    ) {
      incomeReceived += net;
    }
  }

  /* ==================================================
   * PERFORMANCE
   * ================================================== */
  const unrealizedGainOnOriginalPrincipal = currentValue - originalPrincipal;
  const unrealizedGainOnAdjustedBasis = currentValue - adjustedCostBasis;
  const reportedEconomicValue = currentValue + totalPaidCash;
  const economicGain = reportedEconomicValue - originalPrincipal;
  const totalReturn =
    originalPrincipal > 0 ? (economicGain / originalPrincipal) * 100 : 0;

  /* ==================================================
   * TIMELINE
   * ================================================== */
  const timeline: TimelineItem[] = [];

  for (const valuation of publishedValuations) {
    const parent = Array.isArray(valuation.valuation)
      ? valuation.valuation[0] ?? null
      : valuation.valuation;

    timeline.push({
      id: `valuation-${valuation.id}`,
      title: "Published valuation",
      description: parent?.source_name
        ? `Valuation source: ${parent.source_name}.`
        : "A published valuation updated the reported position value.",
      date: `${valuation.valuation_date}T00:00:00`,
      amount: Number(valuation.position_value),
      kind: "valuation",
      status: "published",
    });
  }

  for (const event of basisEvents ?? []) {
    if (event.event_type === "original_principal") continue;
    timeline.push({
      id: `basis-${event.id}`,
      title:
        event.event_type === "return_of_capital"
          ? "Cost basis reduced — return of capital"
          : event.event_type === "redemption"
            ? "Cost basis reduced — redemption"
            : "Cost basis adjusted",
      description: event.description ?? "A cost-basis adjustment was recorded.",
      date: `${event.event_date}T00:00:00`,
      amount: Number(event.amount),
      kind: "basis",
      status: "recorded",
    });
  }

  for (const allocation of distributionRows ?? []) {
    const distribution = Array.isArray(allocation.distribution)
      ? allocation.distribution[0] ?? null
      : allocation.distribution;

    timeline.push({
      id: `distribution-${allocation.id}`,
      title:
        allocation.status === "paid"
          ? "Distribution paid"
          : allocation.status === "processing"
            ? "Distribution processing"
            : "Distribution approved",
      description: distribution?.title ?? "Investment distribution",
      date: allocation.paid_at ?? allocation.created_at,
      amount: Number(allocation.net_amount),
      kind: "distribution",
      status: allocation.status,
    });
  }

  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/portfolio"
        className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-forest-950"
      >
        <ArrowLeft className="size-4" />
        Back to portfolio
      </Link>

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Investment position
            </p>
            <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
              {opportunity.title}
            </h1>
            <div className="mt-5 flex flex-wrap gap-2">
              <StatusBadge status={position.status} />
              {opportunity.asset_category ? (
                <span className="rounded-full bg-ivory-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-500">
                  {humanize(opportunity.asset_category)}
                </span>
              ) : null}
              <span className="rounded-full bg-blue-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-blue-700">
                {latestValuation ? "Valued" : "Principal basis"}
              </span>
            </div>
          </div>

          <div className="rounded-3xl bg-forest-950 p-6 text-white xl:min-w-80">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold-400">
              Current reported value
            </p>
            <p className="font-display mt-2 text-4xl font-semibold">{formatMoney(currentValue)}</p>
            <p className="mt-3 text-xs leading-6 text-white/50">
              {latestValuation
                ? `Latest published valuation: ${formatValuationDate(latestValuation.valuation_date)}.`
                : "No published valuation yet; original funded principal is used as the fallback."}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <Metric icon={CircleDollarSign} label="Current value" value={formatMoney(currentValue)} />
        <Metric icon={WalletCards} label="Original principal" value={formatMoney(originalPrincipal)} />
        <Metric icon={Scale} label="Adjusted cost basis" value={formatMoney(adjustedCostBasis)} />
        <Metric icon={HandCoins} label="Capital returned" value={formatMoney(capitalReturned)} />
        <Metric icon={HandCoins} label="Income received" value={formatMoney(incomeReceived)} />
        <Metric
          icon={economicGain >= 0 ? TrendingUp : TrendingDown}
          label="Reported total return"
          value={formatPercent(totalReturn)}
        />
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_390px]">
        <div className="space-y-8">
          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <BarChart3 className="size-5 text-gold-600" />
            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Position Performance
            </h2>
            <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <DataPoint label="Current value" value={formatMoney(currentValue)} />
              <DataPoint label="Original principal" value={formatMoney(originalPrincipal)} />
              <DataPoint label="Adjusted cost basis" value={formatMoney(adjustedCostBasis)} />
              <DataPoint label="Capital returned" value={formatMoney(capitalReturned)} />
              <DataPoint label="Income received" value={formatMoney(incomeReceived)} />
              <DataPoint label="Total paid cash" value={formatMoney(totalPaidCash)} />
              <DataPoint label="Reported economic value" value={formatMoney(reportedEconomicValue)} />
              <DataPoint label="Economic gain" value={formatSignedMoney(economicGain)} />
              <DataPoint
                label="Gain vs original principal"
                value={formatSignedMoney(unrealizedGainOnOriginalPrincipal)}
              />
              <DataPoint
                label="Value vs adjusted basis"
                value={formatSignedMoney(unrealizedGainOnAdjustedBasis)}
              />
              <DataPoint label="Reported total return" value={formatPercent(totalReturn)} />
              <DataPoint
                label="Valuation basis"
                value={latestValuation ? formatValuationDate(latestValuation.valuation_date) : "Principal fallback"}
              />
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <HandCoins className="size-5 text-gold-600" />
            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Cash & Distribution Summary
            </h2>
            <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <DataPoint label="Income received" value={formatMoney(incomeReceived)} />
              <DataPoint label="Capital returned" value={formatMoney(capitalReturned)} />
              <DataPoint label="Total paid cash" value={formatMoney(totalPaidCash)} />
              <DataPoint label="Withholding" value={formatMoney(withholdingPaid)} />
              <DataPoint label="Processing" value={formatMoney(processingAmount)} />
              <DataPoint label="Upcoming" value={formatMoney(upcomingAmount)} />
            </div>
            <Link
              href="/dashboard/distributions"
              className="focus-ring mt-7 inline-flex min-h-10 cursor-pointer items-center rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950 transition hover:bg-ivory-50"
            >
              View all distributions
            </Link>
          </section>

          <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
            <div className="border-b border-forest-900/10 px-6 py-6 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
                Cost basis ledger
              </p>
              <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
                Basis History
              </h2>
            </div>
            <div className="divide-y divide-forest-900/10">
              {(basisEvents ?? []).map((event) => (
                <div key={event.id} className="p-6 sm:px-8">
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    <DataPoint label="Event" value={humanize(event.event_type)} />
                    <DataPoint label="Amount" value={formatSignedMoney(Number(event.amount))} />
                    <DataPoint label="Date" value={formatValuationDate(event.event_date)} />
                    <DataPoint label="Description" value={event.description ?? "—"} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <ShieldCheck className="size-5 text-gold-600" />
            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Performance Timeline
            </h2>
            {timeline.length === 0 ? (
              <p className="mt-6 text-sm text-stone-500">No performance activity recorded yet.</p>
            ) : (
              <div className="mt-7 space-y-3">
                {timeline.map((item) => (
                  <div key={item.id} className="rounded-xl border border-forest-900/10 bg-ivory-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-forest-950">{item.title}</p>
                        <p className="mt-1 text-xs leading-6 text-stone-500">{item.description}</p>
                        <p className="mt-2 text-[0.7rem] text-stone-400">{formatDateTime(item.date)}</p>
                      </div>
                      {item.amount != null ? (
                        <p className="text-sm font-semibold text-forest-950">
                          {item.kind === "basis"
                            ? formatSignedMoney(item.amount)
                            : formatMoney(item.amount)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          <section className="rounded-[1.75rem] bg-forest-950 p-7 text-white">
            <Scale className="size-6 text-gold-400" />
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">
              Cost basis
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold">
              {formatMoney(adjustedCostBasis)}
            </h2>
            <div className="mt-7 space-y-5 border-t border-white/10 pt-6">
              <SideData label="Original principal" value={formatMoney(originalPrincipal)} />
              <SideData label="Capital returned" value={formatMoney(capitalReturned)} />
              <SideData label="Adjusted basis" value={formatMoney(adjustedCostBasis)} />
              <SideData label="Current value" value={formatMoney(currentValue)} />
              <SideData label="Income received" value={formatMoney(incomeReceived)} />
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
              Accounting note
            </p>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Original principal is immutable. Adjusted cost basis comes from the basis-event
              ledger. Capital returned is based on recorded negative basis events, while income
              received excludes return-of-capital and redemption distributions.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof WalletCards; label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-forest-900/10 bg-white p-5">
      <div className="flex size-10 items-center justify-center rounded-full bg-ivory-50">
        <Icon className="size-4.5 text-gold-600" />
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">{label}</p>
      <p className="font-display mt-2 text-3xl font-semibold text-forest-950">{value}</p>
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

function SideData({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
