import {
  BriefcaseBusiness,
  CircleDollarSign,
  FilePlus2,
  Globe2,
} from "lucide-react";

import Link from "next/link";

import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

export default async function AdminOpportunitiesPage() {
  await requireAdmin();

  const admin =
    createAdminClient();

  const {
    data: opportunities,
    error,
  } = await admin
    .from(
      "investment_opportunities",
    )
    .select(
      `
      id,
      slug,
      title,
      short_description,
      asset_category,
      location,

      funding_target,
      minimum_investment,
      total_funded,
      investor_count,

      expected_duration_months,
      target_return_min,
      target_return_max,

      status,
      published_at,
      created_at,

      estate:investment_estates (
        id,
        name
      )
      `,
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
      "Opportunity directory error:",
      error,
    );

    throw new Error(
      "Unable to load investment opportunities.",
    );
  }

  const records =
    opportunities ?? [];

  const draftCount =
    records.filter(
      (item) =>
        item.status ===
        "draft",
    ).length;

  const publishedCount =
    records.filter(
      (item) =>
        item.status ===
        "published",
    ).length;

  const closedCount =
    records.filter(
      (item) =>
        item.status ===
        "closed",
    ).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
            Investment administration
          </p>

          <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
            Investment Opportunities
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
            Create, manage and publish investment
            opportunities available through Tevuah
            Reserve.
          </p>
        </div>

        <Link
          href="/admin/opportunities/new"
          className="focus-ring inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition hover:bg-forest-800"
        >
          <FilePlus2 className="size-4" />

          Create opportunity
        </Link>
      </div>

      {/* SUMMARY */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={
            BriefcaseBusiness
          }
          label="Total"
          value={
            records.length
          }
        />

        <SummaryCard
          icon={
            FilePlus2
          }
          label="Draft"
          value={
            draftCount
          }
        />

        <SummaryCard
          icon={
            Globe2
          }
          label="Published"
          value={
            publishedCount
          }
        />

        <SummaryCard
          icon={
            CircleDollarSign
          }
          label="Closed"
          value={
            closedCount
          }
        />
      </div>

      {/* DIRECTORY */}

      <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
        {records.length ===
        0 ? (
          <div className="px-6 py-16 text-center">
            <BriefcaseBusiness className="mx-auto size-7 text-stone-300" />

            <h2 className="font-display mt-4 text-2xl font-semibold text-forest-950">
              No investment opportunities yet.
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              Create your first opportunity to get
              started.
            </p>

            <Link
              href="/admin/opportunities/new"
              className="focus-ring mt-6 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-forest-950 px-5 text-sm font-semibold text-white"
            >
              Create opportunity
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-forest-900/10">
            {records.map(
              (opportunity) => {
                const progress =
                  opportunity.funding_target >
                  0
                    ? Math.min(
                        100,
                        Math.round(
                          (
                            opportunity.total_funded /
                            opportunity.funding_target
                          ) *
                            100,
                        ),
                      )
                    : 0;

                return (
                  <article
                    key={
                      opportunity.id
                    }
                    className="p-6"
                  >
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge
                            status={
                              opportunity.status
                            }
                          />

                          <span className="rounded-full bg-ivory-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-500">
                            {humanize(
                              opportunity.asset_category,
                            )}
                          </span>
                        </div>

                        <h2 className="font-display mt-4 text-2xl font-semibold text-forest-950">
                          {
                            opportunity.title
                          }
                        </h2>

                        <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-600">
                          {opportunity.short_description ||
                            "No summary provided."}
                        </p>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                          <DataPoint
                            label="Funding target"
                            value={formatMoney(
                              opportunity.funding_target,
                            )}
                          />

                          <DataPoint
                            label="Minimum"
                            value={formatMoney(
                              opportunity.minimum_investment,
                            )}
                          />

                          <DataPoint
                            label="Funded"
                            value={`${formatMoney(
                              opportunity.total_funded,
                            )} (${progress}%)`}
                          />

                          <DataPoint
                            label="Investors"
                            value={String(
                              opportunity.investor_count,
                            )}
                          />
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-3">
                        <Link
                          href={`/admin/opportunities/${opportunity.id}/edit`}
                          className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-forest-900/10 bg-white px-5 text-sm font-semibold text-forest-950 transition hover:bg-ivory-50"
                        >
                          Edit
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
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon:
    typeof BriefcaseBusiness;

  label: string;

  value: number;
}) {
  return (
    <div className="rounded-3xl border border-forest-900/10 bg-white p-5">
      <Icon className="size-5 text-gold-600" />

      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <p className="font-display mt-2 text-3xl font-semibold text-forest-950">
        {value}
      </p>
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

      <p className="mt-1 text-sm font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest ${
        status ===
        "published"
          ? "bg-emerald-50 text-emerald-700"
          : status ===
              "closed"
            ? "bg-stone-200 text-stone-700"
            : "bg-amber-50 text-amber-700"
      }`}
    >
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