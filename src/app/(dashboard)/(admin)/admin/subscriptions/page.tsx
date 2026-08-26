import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  ClipboardCheck,
} from "lucide-react";

import Link from "next/link";

import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

export default async function AdminSubscriptionsPage() {
  await requireAdmin();

  const admin =
    createAdminClient();

  const {
    data: subscriptions,
    error,
  } = await admin
    .from(
      "investment_subscriptions",
    )
    .select(
      `
      id,

      investor_id,
      opportunity_id,

      commitment_amount,
      status,

      submitted_at,
      reviewed_at,
      created_at,

      investor:profiles!investment_subscriptions_investor_id_fkey (
        id,
        first_name,
        last_name,
        onboarding_status,
        account_status
      ),

      opportunity:investment_opportunities!investment_subscriptions_opportunity_id_fkey (
        id,
        slug,
        title,
        asset_category,
        status
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
      "Admin subscriptions load error:",
      error,
    );

    throw new Error(
      "Unable to load investment subscriptions.",
    );
  }

  const records =
    subscriptions ?? [];

  const submittedCount =
    records.filter(
      (item) =>
        item.status ===
        "submitted",
    ).length;

  const reviewCount =
    records.filter(
      (item) =>
        item.status ===
        "under_review",
    ).length;

  const approvedCount =
    records.filter(
      (item) =>
        item.status ===
        "approved",
    ).length;

  const actionRequiredCount =
    records.filter(
      (item) =>
        item.status ===
        "action_required",
    ).length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Investment administration
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          Subscription Queue
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Review investor capital commitments,
          offering acknowledgements and subscription
          decisions.
        </p>
      </div>

      {/* SUMMARY */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Submitted"
          value={
            submittedCount
          }
        />

        <SummaryCard
          label="Under review"
          value={
            reviewCount
          }
        />

        <SummaryCard
          label="Approved"
          value={
            approvedCount
          }
        />

        <SummaryCard
          label="Action required"
          value={
            actionRequiredCount
          }
        />
      </div>

      {/* QUEUE */}

      <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
        {records.length ===
        0 ? (
          <div className="px-6 py-16 text-center">
            <ClipboardCheck className="mx-auto size-7 text-stone-300" />

            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              No investment subscriptions yet.
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-stone-500">
              Investor subscription requests will
              appear here after submission.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-forest-900/10">
            {records.map(
              (
                subscription,
              ) => {
                const investor =
                  Array.isArray(
                    subscription.investor,
                  )
                    ? subscription.investor[0] ??
                      null
                    : subscription.investor;

                const opportunity =
                  Array.isArray(
                    subscription.opportunity,
                  )
                    ? subscription.opportunity[0] ??
                      null
                    : subscription.opportunity;

                const investorName =
                  investor
                    ? [
                        investor.first_name,
                        investor.last_name,
                      ]
                        .filter(Boolean)
                        .join(" ")
                    : "Investor";

                return (
                  <article
                    key={
                      subscription.id
                    }
                    className="p-6"
                  >
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge
                            status={
                              subscription.status
                            }
                          />

                          {opportunity?.asset_category ? (
                            <span className="rounded-full bg-ivory-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-500">
                              {humanize(
                                opportunity.asset_category,
                              )}
                            </span>
                          ) : null}
                        </div>

                        <h2 className="font-display mt-4 text-2xl font-semibold text-forest-950">
                          {opportunity?.title ??
                            "Investment opportunity"}
                        </h2>

                        <p className="mt-2 text-sm font-semibold text-stone-600">
                          {
                            investorName
                          }
                        </p>

                        <div className="mt-5 grid gap-4 sm:grid-cols-3">
                          <DataPoint
                            label="Commitment"
                            value={formatMoney(
                              Number(
                                subscription.commitment_amount,
                              ),
                            )}
                          />

                          <DataPoint
                            label="Submitted"
                            value={
                              subscription.submitted_at
                                ? formatDate(
                                    subscription.submitted_at,
                                  )
                                : "—"
                            }
                          />

                          <DataPoint
                            label="Reviewed"
                            value={
                              subscription.reviewed_at
                                ? formatDate(
                                    subscription.reviewed_at,
                                  )
                                : "Pending"
                            }
                          />
                        </div>
                      </div>

                      <Link
                        href={`/admin/subscriptions/${subscription.id}`}
                        className="focus-ring inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800"
                      >
                        Review subscription

                        <ArrowRight className="size-4" />
                      </Link>
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
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-forest-900/10 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <p className="font-display mt-3 text-3xl font-semibold text-forest-950">
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
  const approved =
    status ===
    "approved";

  const review =
    status ===
      "submitted" ||
    status ===
      "under_review";

  const problem =
    status ===
      "action_required" ||
    status ===
      "rejected";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest ${
        approved
          ? "bg-emerald-50 text-emerald-700"
          : review
            ? "bg-amber-50 text-amber-700"
            : problem
              ? "bg-red-50 text-red-700"
              : "bg-stone-100 text-stone-600"
      }`}
    >
      {approved ? (
        <CheckCircle2 className="size-3" />
      ) : review ? (
        <Clock3 className="size-3" />
      ) : (
        <CircleAlert className="size-3" />
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