import {
  Activity,
  ArrowLeft,
  FileText,
  History,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { checkAccountAccess } from "@/src/lib/auth/account-status";
import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

type PageProps = {
  params: Promise<{
    statementId: string;
  }>;
};

export default async function InvestorStatementDetailPage({ params }: PageProps) {
  const { statementId } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "investor") redirect("/dashboard");

  const accountAccess = await checkAccountAccess(user.id);
  if (!accountAccess.allowed) redirect("/account-restricted");

  const admin = createAdminClient();

  const { data: statement, error: statementError } = await admin
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
      reconstructed_from_legacy,
      historical_generated_at,
      historical_published_at,
      published_at,
      reinstated_at,
      status
      `,
    )
    .eq("id", statementId)
    .eq("investor_id", user.id)
    .eq("status", "published")
    .maybeSingle();

  if (statementError || !statement) notFound();

  const { data: positions, error: positionsError } = await admin
    .from("investor_statement_positions")
    .select(
      `
      id,
      position_id,
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
    .eq("statement_id", statement.id)
    .eq("investor_id", user.id)
    .order("created_at", { ascending: true });

  if (positionsError) {
    console.error("Investor statement positions load error:", positionsError);
    throw new Error("Unable to load statement positions.");
  }

  const { data: activity, error: activityError } = await admin
    .from("investor_statement_activity")
    .select(
      `
      id,
      activity_type,
      activity_date,
      title,
      description,
      amount,
      basis_effect,
      currency
      `,
    )
    .eq("statement_id", statement.id)
    .eq("investor_id", user.id)
    .order("activity_date", { ascending: false });

  if (activityError) {
    console.error("Investor statement activity load error:", activityError);
    throw new Error("Unable to load statement activity.");
  }

  const positionRows = positions ?? [];
  const activityRows = activity ?? [];

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/statements"
        className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-forest-950"
      >
        <ArrowLeft className="size-4" />
        Back to statements
      </Link>

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-emerald-700">
                <ShieldCheck className="size-3" />
                Published
              </span>

              <span className="rounded-full bg-ivory-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-500">
                {humanize(statement.statement_type)}
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
              {formatDate(statement.period_start)} — {formatDate(statement.period_end)}
            </h1>

            <p className="mt-4 text-sm text-stone-500">
              {statement.reconstructed_from_legacy && statement.historical_published_at
                ? `Historical statement date: ${formatDate(statement.historical_published_at.slice(0, 10))}`
                : statement.published_at
                  ? `Published ${formatDate(statement.published_at.slice(0, 10))}`
                  : ""}
            </p>
          </div>

          <Link
            href={`/api/statements/${statement.id}/pdf`}
            className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800"
          >
            <FileText className="size-4" />
            Download PDF
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Original Principal"
          value={formatMoney(Number(statement.original_principal), statement.currency)}
        />
        <Metric
          label="Adjusted Cost Basis"
          value={formatMoney(Number(statement.adjusted_cost_basis), statement.currency)}
        />
        <Metric
          label="Closing Portfolio Value"
          value={formatMoney(Number(statement.closing_portfolio_value), statement.currency)}
        />
        <Metric
          label="Total Gain / Loss"
          value={formatSignedMoney(Number(statement.total_gain_loss), statement.currency)}
          secondary={
            statement.total_return_percent != null
              ? formatPercent(Number(statement.total_return_percent))
              : "Return unavailable"
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Opening Value"
          value={formatMoney(Number(statement.opening_portfolio_value), statement.currency)}
        />
        <Metric
          label="Income Received"
          value={formatMoney(Number(statement.income_received), statement.currency)}
        />
        <Metric
          label="Capital Returned"
          value={formatMoney(Number(statement.capital_returned), statement.currency)}
        />
        <Metric
          label="Total Economic Value"
          value={formatMoney(Number(statement.total_economic_value), statement.currency)}
        />
      </div>

      <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
        <div className="border-b border-forest-900/10 px-6 py-6 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">Frozen holdings</p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">Position Breakdown</h2>
        </div>

        {positionRows.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <WalletCards className="mx-auto size-7 text-stone-300" />
            <p className="mt-4 text-sm text-stone-500">No positions are included in this statement.</p>
          </div>
        ) : (
          <div className="divide-y divide-forest-900/10">
            {positionRows.map((position) => (
              <article key={position.id} className="p-6 sm:p-8">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-gold-600">
                      {position.asset_category ? humanize(position.asset_category) : "Investment"}
                    </p>
                    <h3 className="font-display mt-2 text-2xl font-semibold text-forest-950">
                      {position.opportunity_title}
                    </h3>
                  </div>

                  <span className="rounded-full bg-ivory-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-600">
                    {humanize(position.position_status)}
                  </span>
                </div>

                <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  <DataPoint label="Original principal" value={formatMoney(Number(position.original_principal), position.currency)} />
                  <DataPoint label="Adjusted basis" value={formatMoney(Number(position.adjusted_cost_basis), position.currency)} />
                  <DataPoint label="Opening value" value={formatMoney(Number(position.opening_value), position.currency)} />
                  <DataPoint label="Closing value" value={formatMoney(Number(position.closing_value), position.currency)} />
                  <DataPoint label="Income" value={formatMoney(Number(position.income_received), position.currency)} />
                  <DataPoint label="Capital returned" value={formatMoney(Number(position.capital_returned), position.currency)} />
                  <DataPoint label="Gain / loss" value={formatSignedMoney(Number(position.total_gain_loss), position.currency)} />
                  <DataPoint
                    label="Return"
                    value={position.total_return_percent != null ? formatPercent(Number(position.total_return_percent)) : "—"}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
        <div className="border-b border-forest-900/10 px-6 py-6 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">Reporting history</p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">Statement Activity</h2>
        </div>

        {activityRows.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Activity className="mx-auto size-7 text-stone-300" />
            <p className="mt-4 text-sm text-stone-500">No reportable activity occurred during this statement period.</p>
          </div>
        ) : (
          <div className="divide-y divide-forest-900/10">
            {activityRows.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 px-6 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-forest-950">{item.title}</p>
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-stone-500">
                      {humanize(item.activity_type)}
                    </span>
                  </div>

                  {item.description ? (
                    <p className="mt-1 text-xs leading-6 text-stone-500">{item.description}</p>
                  ) : null}

                  <p className="mt-2 text-xs text-stone-400">
                    {formatDate(item.activity_date.slice(0, 10))}
                  </p>
                </div>

                <div className="shrink-0 lg:text-right">
                  {item.amount != null ? (
                    <p className="text-sm font-semibold text-forest-950">
                      {formatMoney(Number(item.amount), item.currency)}
                    </p>
                  ) : null}

                  {item.basis_effect != null ? (
                    <p className="mt-1 text-xs text-stone-500">
                      Basis effect: {formatSignedMoney(Number(item.basis_effect), item.currency)}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value, secondary }: { label: string; value: string; secondary?: string }) {
  return (
    <div className="rounded-3xl border border-forest-900/10 bg-white p-5">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">{label}</p>
      <p className="font-display mt-2 text-2xl font-semibold text-forest-950">{value}</p>
      {secondary ? <p className="mt-2 text-xs text-stone-500">{secondary}</p> : null}
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

function humanize(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatMoney(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function formatSignedMoney(cents: number, currency = "USD") {
  const formatted = formatMoney(Math.abs(cents), currency);
  if (cents > 0) return `+${formatted}`;
  if (cents < 0) return `-${formatted}`;
  return formatted;
}

function formatPercent(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
