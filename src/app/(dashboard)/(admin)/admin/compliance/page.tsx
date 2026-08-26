import {
  CheckCircle2,
  Clock3,
  FileSearch2,
  ShieldCheck,
  UserRoundSearch,
} from "lucide-react";

import Link from "next/link";

import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

function displayStatus(
  value: string,
) {
  return value
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

export default async function ComplianceQueuePage() {
  await requireAdmin();

  const admin =
    createAdminClient();

  const {
    data: reviews,
    error,
  } = await admin
    .from("compliance_reviews")
    .select(
      `
      id,
      user_id,
      review_type,
      status,
      assigned_admin_id,
      submitted_at,
      review_started_at,
      reviewed_at
      `,
    )
    .order(
      "submitted_at",
      {
        ascending: false,
      },
    );

  if (error) {
    console.error(
      "Compliance queue load error:",
      error,
    );
  }

  const userIds =
    reviews?.map(
      (review) =>
        review.user_id,
    ) ?? [];

const {
  data: investors,
} =
  userIds.length > 0
    ? await admin
        .from("profiles")
        .select(
          `
          id,
          first_name,
          last_name,
          onboarding_status
          `,
        )
        .in(
          "id",
          userIds,
        )
    : {
        data: [],
      };

  const investorMap =
    new Map(
      investors?.map(
        (investor) => [
          investor.id,
          investor,
        ],
      ) ?? [],
    );

  const pendingCount =
    reviews?.filter(
      (review) =>
        review.status ===
        "pending",
    ).length ?? 0;

  const inReviewCount =
    reviews?.filter(
      (review) =>
        review.status ===
        "in_review",
    ).length ?? 0;

  const approvedCount =
    reviews?.filter(
      (review) =>
        review.status ===
        "approved",
    ).length ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Compliance
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          Investor compliance queue
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Review completed investor onboarding
          submissions and manage compliance approval.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard
          label="Pending"
          value={pendingCount}
          icon={Clock3}
        />

        <StatCard
          label="In review"
          value={inReviewCount}
          icon={FileSearch2}
        />

        <StatCard
          label="Approved"
          value={approvedCount}
          icon={CheckCircle2}
        />
      </div>

      <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
        <div className="border-b border-forest-900/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-gold-600" />

            <h2 className="font-display text-2xl font-semibold text-forest-950">
              Verification submissions
            </h2>
          </div>
        </div>

        {!reviews ||
        reviews.length === 0 ? (
          <div className="p-10 text-center">
            <UserRoundSearch className="mx-auto size-8 text-stone-400" />

            <p className="mt-4 text-sm text-stone-500">
              No compliance submissions yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-forest-900/10">
            {reviews.map(
              (review) => {
                const investor =
                  investorMap.get(
                    review.user_id,
                  );

                const name = [
                  investor?.first_name,
                  investor?.last_name,
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <Link
                    key={
                      review.id
                    }
                    href={`/admin/compliance/${review.user_id}`}
                    className="grid gap-4 px-6 py-5 transition hover:bg-ivory-50 md:grid-cols-[1.6fr_1.4fr_1fr_1fr_auto] md:items-center"
                  >
                    <div>
                      <p className="text-sm font-semibold text-forest-950">
                        {name ||
                          "Investor"}
                      </p>

                      <p className="mt-1 text-xs text-stone-500">
                        Investor ID: {review.user_id}
                    </p>
                    </div>

                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
                        Submission
                      </p>

                      <p className="mt-1 text-sm text-forest-950">
                        Investor onboarding
                      </p>
                    </div>

                    <div>
                      <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold capitalize text-amber-700">
                        {displayStatus(
                          review.status,
                        )}
                      </span>
                    </div>

                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
                        Submitted
                      </p>

                      <p className="mt-1 text-xs text-stone-600">
                        {review.submitted_at
                          ? new Date(
                              review.submitted_at,
                            ).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>

                    <span className="text-sm font-semibold text-forest-950">
                      Review →
                    </span>
                  </Link>
                );
              },
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;

  icon: typeof Clock3;
}) {
  return (
    <div className="rounded-3xl border border-forest-900/10 bg-white p-6">
      <Icon className="size-5 text-gold-600" />

      <p className="mt-6 text-3xl font-semibold text-forest-950">
        {value}
      </p>

      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
        {label}
      </p>
    </div>
  );
}