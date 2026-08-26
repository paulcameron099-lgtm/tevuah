import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  CircleAlert,
  Clock3,
} from "lucide-react";

import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

export default async function MyInvestmentsPage() {
  /*
   * --------------------------------------------------
   * 1. INVESTOR
   * --------------------------------------------------
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

  const admin =
    createAdminClient();

  /*
   * --------------------------------------------------
   * 2. LOAD SUBSCRIPTIONS
   * --------------------------------------------------
   */
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

      commitment_amount,
      status,

      submitted_at,
      reviewed_at,

      rejection_reason,
      admin_notes,

      created_at,

      opportunity:investment_opportunities (
        id,
        slug,
        title,
        asset_category,
        status
      )
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
    );

  if (error) {
    console.error(
      "Investor subscriptions load error:",
      error,
    );

    throw new Error(
      "Unable to load your investments.",
    );
  }

  const records =
    subscriptions ??
    [];

  const submittedCount =
    records.filter(
      (
        subscription,
      ) =>
        subscription.status ===
          "submitted" ||
        subscription.status ===
          "under_review",
    ).length;

  const approvedCount =
    records.filter(
      (
        subscription,
      ) =>
        subscription.status ===
        "approved",
    ).length;

  const actionRequiredCount =
    records.filter(
      (
        subscription,
      ) =>
        subscription.status ===
        "action_required",
    ).length;

  /*
   * --------------------------------------------------
   * 3. RENDER
   * --------------------------------------------------
   */
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Portfolio
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          My Investments
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Track your investment subscriptions,
          commitments and review status.
        </p>
      </div>

      {/* ==========================================
          SUMMARY
      ========================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total subscriptions"
          value={
            records.length
          }
        />

        <SummaryCard
          label="In review"
          value={
            submittedCount
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

      {/* ==========================================
          SUBSCRIPTIONS
      ========================================== */}

      <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
        {records.length ===
        0 ? (
          <div className="px-6 py-16 text-center">
            <BriefcaseBusiness className="mx-auto size-7 text-stone-300" />

            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              You have no investment subscriptions yet.
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-stone-500">
              Explore currently published investment
              opportunities and start your first
              subscription.
            </p>

            <Link
              href="/investments"
              className="focus-ring mt-6 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800"
            >
              Explore opportunities

              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-forest-900/10">
            {records.map(
              (
                subscription,
              ) => {
                const opportunity =
                Array.isArray(
                    subscription.opportunity,
                )
                    ? subscription.opportunity[0] ??
                    null
                    : subscription.opportunity;

                return (
                  <article
                    key={
                      subscription.id
                    }
                    className="p-6"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <StatusBadge
                          status={
                            subscription.status
                          }
                        />

                        <h2 className="font-display mt-4 text-2xl font-semibold text-forest-950">
                          {opportunity?.title ??
                            "Investment opportunity"}
                        </h2>

                        <p className="mt-2 text-xs uppercase tracking-widest text-stone-400">
                          {opportunity?.asset_category
                            ? humanize(
                                opportunity.asset_category,
                              )
                            : "Private investment"}
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
                                : "Not submitted"
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

                        {subscription.status ===
                          "action_required" &&
                        subscription.admin_notes ? (
                          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                              Action required
                            </p>

                            <p className="mt-2 text-sm leading-6 text-amber-900">
                              {
                                subscription.admin_notes
                              }
                            </p>
                          </div>
                        ) : null}

                        {subscription.status ===
                          "rejected" &&
                        subscription.rejection_reason ? (
                          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-red-700">
                              Subscription not approved
                            </p>

                            <p className="mt-2 text-sm leading-6 text-red-900">
                              {
                                subscription.rejection_reason
                              }
                            </p>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-3">
                        {opportunity?.slug ? (
                          <Link
                            href={`/investments/${opportunity.slug}`}
                            className="focus-ring inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950 transition hover:bg-ivory-50"
                          >
                            Opportunity

                            <ArrowRight className="size-3.5" />
                          </Link>
                        ) : null}

                        <Link
                          href={`/dashboard/investments/${subscription.id}`}
                          className="focus-ring inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-forest-950 px-4 text-xs font-semibold text-white transition hover:bg-forest-800"
                        >
                          View subscription

                          <ArrowRight className="size-3.5" />
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

  const actionRequired =
    status ===
    "action_required";

  const rejected =
    status ===
    "rejected";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest ${
        approved
          ? "bg-emerald-50 text-emerald-700"
          : review
            ? "bg-amber-50 text-amber-700"
            : actionRequired ||
                rejected
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