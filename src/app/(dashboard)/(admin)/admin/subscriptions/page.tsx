import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  ClipboardCheck,
  UsersRound,
} from "lucide-react";

import Link from "next/link";

import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

export default async function AdminSubscriptionsPage() {
  await requireAdmin();

  const admin =
    createAdminClient();

  const [
    individualResult,
    jointResult,
  ] = await Promise.all([
    admin
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
          ascending: false,
        },
      ),

    admin
      .from(
        "joint_investment_subscriptions",
      )
      .select(
        `
        id,
        opportunity_id,
        initiated_by,
        total_commitment_amount,
        currency,
        status,
        submitted_at,
        reviewed_at,
        approved_at,
        created_at,

        opportunity:investment_opportunities!joint_investment_subscriptions_opportunity_id_fkey (
          id,
          slug,
          title,
          asset_category,
          status
        ),

        members:joint_investment_members (
          id,
          investor_id,
          member_slot,
          ownership_bps,
          funding_obligation_bps,
          obligation_amount,
          member_status,

          investor:profiles!joint_investment_members_investor_id_fkey (
            id,
            first_name,
            last_name,
            onboarding_status,
            account_status
          ),

          consents:joint_investment_member_consents (
            id,
            consent_status,
            signed_at
          )
        )
        `,
      )
      .neq(
        "status",
        "cancelled",
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      ),
  ]);

  if (
    individualResult.error
  ) {
    console.error(
      "Admin individual subscriptions load error:",
      individualResult.error,
    );

    throw new Error(
      "Unable to load individual investment subscriptions.",
    );
  }

  if (
    jointResult.error
  ) {
    console.error(
      "Admin joint subscriptions load error:",
      jointResult.error,
    );

    throw new Error(
      "Unable to load joint investment subscriptions.",
    );
  }

  const individualRecords =
    individualResult.data ?? [];

  const jointRecords =
    jointResult.data ?? [];

  const individualSubmitted =
    individualRecords.filter(
      (item) =>
        item.status ===
        "submitted",
    ).length;

  const individualReview =
    individualRecords.filter(
      (item) =>
        item.status ===
        "under_review",
    ).length;

  const jointSubmitted =
    jointRecords.filter(
      (item) =>
        item.status ===
        "submitted",
    ).length;

  const jointReview =
    jointRecords.filter(
      (item) =>
        item.status ===
        "under_review",
    ).length;

  const jointApproved =
    jointRecords.filter(
      (item) =>
        item.status ===
          "approved" ||
        item.status ===
          "funding" ||
        item.status ===
          "funded",
    ).length;

  const reviewQueueCount =
    individualSubmitted +
    individualReview +
    jointSubmitted +
    jointReview;

  return (
    <div className="space-y-8">
      {/* HEADER */}

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Investment administration
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          Subscription Queue
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Review individual capital
          commitments and 50/50 joint
          investment subscriptions
          before funding begins.
        </p>
      </div>

      {/* SUMMARY */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Review queue"
          value={
            reviewQueueCount
          }
        />

        <SummaryCard
          label="Individual"
          value={
            individualRecords.length
          }
        />

        <SummaryCard
          label="Joint 50/50"
          value={
            jointRecords.length
          }
        />

        <SummaryCard
          label="Joint approved"
          value={
            jointApproved
          }
        />
      </div>

      {/* ====================================================
          JOINT INVESTMENTS
      ==================================================== */}

      <section>
        <div className="mb-5 flex items-end justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <UsersRound className="size-4 text-gold-600" />

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
                Joint investments
              </p>
            </div>

            <h2 className="font-display mt-2 text-3xl font-semibold text-forest-950">
              Joint 50/50 Queue
            </h2>

            <p className="mt-2 text-sm leading-6 text-stone-500">
              Review both investors,
              member agreements and
              the complete joint
              commitment before
              approval.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
          {jointRecords.length ===
          0 ? (
            <div className="px-6 py-14 text-center">
              <UsersRound className="mx-auto size-7 text-stone-300" />

              <h3 className="font-display mt-4 text-2xl font-semibold text-forest-950">
                No joint investments
                yet.
              </h3>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-stone-500">
                New 50/50 joint
                investment
                subscriptions will
                appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-forest-900/10">
              {jointRecords.map(
                (joint) => {
                  const opportunity =
                    firstRelation(
                      joint.opportunity,
                    );

                  const members =
                    [...(
                      joint.members ??
                      []
                    )].sort(
                      (
                        first,
                        second,
                      ) =>
                        Number(
                          first.member_slot,
                        ) -
                        Number(
                          second.member_slot,
                        ),
                    );

                  const memberOne =
                    members[0] ??
                    null;

                  const memberTwo =
                    members[1] ??
                    null;

                  const memberOneInvestor =
                    memberOne
                      ? firstRelation(
                          memberOne.investor,
                        )
                      : null;

                  const memberTwoInvestor =
                    memberTwo
                      ? firstRelation(
                          memberTwo.investor,
                        )
                      : null;

                  const memberOneConsent =
                    memberOne
                      ? firstRelation(
                          memberOne.consents,
                        )
                      : null;

                  const memberTwoConsent =
                    memberTwo
                      ? firstRelation(
                          memberTwo.consents,
                        )
                      : null;

                  const memberOneName =
                    profileName(
                      memberOneInvestor,
                    );

                  const memberTwoName =
                    profileName(
                      memberTwoInvestor,
                    );

                  const signedCount =
                    [
                      memberOneConsent,
                      memberTwoConsent,
                    ].filter(
                      (consent) =>
                        consent?.consent_status ===
                        "accepted",
                    ).length;

                  return (
                    <article
                      key={
                        joint.id
                      }
                      className="p-6"
                    >
                      <div className="flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap gap-2">
                            <StatusBadge
                              status={
                                joint.status
                              }
                            />

                            <span className="rounded-full bg-forest-950 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-gold-300">
                              Joint 50/50
                            </span>

                            {opportunity?.asset_category ? (
                              <span className="rounded-full bg-ivory-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-500">
                                {humanize(
                                  opportunity.asset_category,
                                )}
                              </span>
                            ) : null}
                          </div>

                          <h3 className="font-display mt-4 text-2xl font-semibold text-forest-950">
                            {opportunity?.title ??
                              "Investment opportunity"}
                          </h3>

                          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
                            <DataPoint
                              label="Total commitment"
                              value={formatMoney(
                                Number(
                                  joint.total_commitment_amount,
                                ),
                                joint.currency,
                              )}
                            />

                            <DataPoint
                              label="Investor one"
                              value={
                                memberOneName
                              }
                            />

                            <DataPoint
                              label="Investor two"
                              value={
                                memberTwoName
                              }
                            />

                            <DataPoint
                              label="Agreements"
                              value={`${signedCount} / 2 signed`}
                            />

                            <DataPoint
                              label="Submitted"
                              value={
                                joint.submitted_at
                                  ? formatDate(
                                      joint.submitted_at,
                                    )
                                  : "Pending"
                              }
                            />
                          </div>
                        </div>

                        <Link
                          href={`/admin/subscriptions/joint/${joint.id}`}
                          className="focus-ring inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800"
                        >
                          Review joint investment

                          <ArrowRight className="size-4" />
                        </Link>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          )}
        </div>
      </section>

      {/* ====================================================
          INDIVIDUAL INVESTMENTS
      ==================================================== */}

      <section>
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
            Individual investments
          </p>

          <h2 className="font-display mt-2 text-3xl font-semibold text-forest-950">
            Individual Queue
          </h2>

          <p className="mt-2 text-sm leading-6 text-stone-500">
            Existing individual
            investment subscription
            review workflow.
          </p>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
          {individualRecords.length ===
          0 ? (
            <div className="px-6 py-14 text-center">
              <ClipboardCheck className="mx-auto size-7 text-stone-300" />

              <h3 className="font-display mt-4 text-2xl font-semibold text-forest-950">
                No individual
                subscriptions yet.
              </h3>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-stone-500">
                Individual investor
                subscription requests
                will appear here after
                submission.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-forest-900/10">
              {individualRecords.map(
                (
                  subscription,
                ) => {
                  const investor =
                    firstRelation(
                      subscription.investor,
                    );

                  const opportunity =
                    firstRelation(
                      subscription.opportunity,
                    );

                  const investorName =
                    profileName(
                      investor,
                    );

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

                            <span className="rounded-full bg-stone-100 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-600">
                              Individual
                            </span>

                            {opportunity?.asset_category ? (
                              <span className="rounded-full bg-ivory-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-500">
                                {humanize(
                                  opportunity.asset_category,
                                )}
                              </span>
                            ) : null}
                          </div>

                          <h3 className="font-display mt-4 text-2xl font-semibold text-forest-950">
                            {opportunity?.title ??
                              "Investment opportunity"}
                          </h3>

                          <p className="mt-2 text-sm font-semibold text-stone-600">
                            {investorName}
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
        </div>
      </section>
    </div>
  );
}

/* ============================================================
 * HELPERS
 * ============================================================ */

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
  const success =
    status === "approved" ||
    status === "funding" ||
    status === "funded";

  const review =
    status === "submitted" ||
    status === "under_review";

  const waiting =
    status === "draft" ||
    status ===
      "awaiting_member_acceptance";

  const problem =
    status === "action_required" ||
    status === "rejected" ||
    status === "cancelled";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest ${
        success
          ? "bg-emerald-50 text-emerald-700"
          : review
            ? "bg-amber-50 text-amber-700"
            : problem
              ? "bg-red-50 text-red-700"
              : "bg-stone-100 text-stone-600"
      }`}
    >
      {success ? (
        <CheckCircle2 className="size-3" />
      ) : review || waiting ? (
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

function firstRelation<T>(
  value:
    | T
    | T[]
    | null
    | undefined,
): T | null {
  if (
    Array.isArray(
      value,
    )
  ) {
    return (
      value[0] ??
      null
    );
  }

  return value ?? null;
}

function profileName(
  profile:
    | {
        first_name:
          | string
          | null;
        last_name:
          | string
          | null;
      }
    | null
    | undefined,
) {
  if (
    !profile
  ) {
    return "Investor";
  }

  return (
    [
      profile.first_name,
      profile.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "Investor"
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
  currency = "USD",
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency:
        currency ||
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
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(
    new Date(
      value,
    ),
  );
}