import {
  ArrowRight,
  CalendarDays,
  FileText,
  History,
  ShieldCheck,
} from "lucide-react";

import Link from "next/link";
import { redirect } from "next/navigation";

import { checkAccountAccess } from "@/src/lib/auth/account-status";
import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

export default async function InvestorStatementsPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.role !== "investor") redirect("/dashboard");

  const accountAccess = await checkAccountAccess(user.id);
  if (!accountAccess.allowed) redirect("/account-restricted");

  const admin = createAdminClient();

  const { data: statements, error } = await admin
    .from("investor_statements")
    .select(
      `
      id,
      period_start,
      period_end,
      statement_type,
      currency,
      closing_portfolio_value,
      adjusted_cost_basis,
      income_received,
      capital_returned,
      total_return_percent,
      position_count,
      reconstructed_from_legacy,
      historical_published_at,
      published_at,
      reinstated_at,
      status
      `,
    )
    .eq("investor_id", user.id)
    .eq("status", "published")
    .order("period_end", { ascending: false })
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Investor statements load error:", error);
    throw new Error("Unable to load your statements.");
  }

  const records = statements ?? [];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Investor reporting
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          Statements
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Review your published historical portfolio statements, holdings,
          distributions, capital returned and investment activity.
        </p>
      </div>

      {records.length === 0 ? (
        <section className="rounded-[1.75rem] border border-forest-900/10 bg-white px-6 py-16 text-center sm:px-8">
          <FileText className="mx-auto size-8 text-stone-300" />
          <h2 className="font-display mt-5 text-3xl font-semibold text-forest-950">
            No published statements yet.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-500">
            Statements will appear here after they are published to your investor account.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
          <div className="border-b border-forest-900/10 px-6 py-6 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Published history
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              Statement Records
            </h2>
          </div>

          <div className="divide-y divide-forest-900/10">
            {records.map((statement) => (
              <article key={statement.id} className="p-6 sm:p-8">
                <div className="flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0 flex-1">
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
                          Historical
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <CalendarDays className="size-4 text-gold-600" />
                      <h3 className="font-display text-2xl font-semibold text-forest-950">
                        {formatDate(statement.period_start)} — {formatDate(statement.period_end)}
                      </h3>
                    </div>

                    <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
                      <DataPoint
                        label="Closing value"
                        value={formatMoney(Number(statement.closing_portfolio_value), statement.currency)}
                      />
                      <DataPoint
                        label="Adjusted basis"
                        value={formatMoney(Number(statement.adjusted_cost_basis), statement.currency)}
                      />
                      <DataPoint
                        label="Income"
                        value={formatMoney(Number(statement.income_received), statement.currency)}
                      />
                      <DataPoint
                        label="Capital returned"
                        value={formatMoney(Number(statement.capital_returned), statement.currency)}
                      />
                      <DataPoint
                        label="Total return"
                        value={
                          statement.total_return_percent != null
                            ? formatPercent(Number(statement.total_return_percent))
                            : "—"
                        }
                      />
                    </div>

                    <p className="mt-5 text-xs text-stone-400">
                      Statement date: {displayStatementDate(statement)}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-3">
                    <Link
                      href={`/dashboard/statements/${statement.id}`}
                      className="focus-ring inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950 transition hover:bg-ivory-50"
                    >
                      View Statement
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
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function DataPoint({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>
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

function displayStatementDate(statement: {
  reconstructed_from_legacy: boolean;
  historical_published_at: string | null;
  published_at: string | null;
}) {
  const value =
    statement.reconstructed_from_legacy && statement.historical_published_at
      ? statement.historical_published_at
      : statement.published_at;

  return value ? formatDate(value.slice(0, 10)) : "Published";
}
