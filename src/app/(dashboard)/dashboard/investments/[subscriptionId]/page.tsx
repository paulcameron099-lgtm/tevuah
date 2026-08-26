import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";

import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import { SubscriptionResubmitForm } from "@/src/components/investments/subscription-resubmit-form";
import { checkAccountAccess } from "@/src/lib/auth/account-status";
import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

type PageProps = {
  params: Promise<{
    subscriptionId: string;
  }>;
};

export default async function InvestorSubscriptionDetailPage({
  params,
}: PageProps) {
  /*
   * --------------------------------------------------
   * 1. AUTHENTICATED INVESTOR
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

  const accountAccess =
    await checkAccountAccess(
      user.id,
    );

  if (
    !accountAccess.allowed
  ) {
    redirect(
      "/account-restricted",
    );
  }

  const {
    subscriptionId,
  } = await params;

  const admin =
    createAdminClient();

  /*
   * --------------------------------------------------
   * 2. LOAD THIS INVESTOR'S SUBSCRIPTION ONLY
   * --------------------------------------------------
   */
  const {
    data: subscription,
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

      offering_acknowledged,
      offering_acknowledged_at,

      risk_disclosure_accepted,
      risk_disclosure_accepted_at,

      electronic_signature,
      signed_at,

      submitted_at,
      reviewed_at,

      rejection_reason,
      admin_notes,

      created_at,
      updated_at,

      opportunity:investment_opportunities!investment_subscriptions_opportunity_id_fkey (
        id,
        slug,
        title,

        minimum_investment,
        funding_target,
        total_funded,

        status
      )
      `,
    )
    .eq(
      "id",
      subscriptionId,
    )
    .eq(
      "investor_id",
      user.id,
    )
    .maybeSingle();

  if (
    error ||
    !subscription
  ) {
    console.error(
      "Investor subscription detail load error:",
      error,
    );

    notFound();
  }

  /*
   * Supabase may infer the relationship
   * as an array, so normalize it.
   */
  const opportunity =
    Array.isArray(
      subscription.opportunity,
    )
      ? subscription.opportunity[0] ??
        null
      : subscription.opportunity;

  if (!opportunity) {
    notFound();
  }

  /*
   * --------------------------------------------------
   * 3. CALCULATE ALLOCATION
   * --------------------------------------------------
   */
  const remainingAllocationCents =
    Number(
      opportunity.funding_target,
    ) -
    Number(
      opportunity.total_funded,
    );

  const minimumInvestment =
    Number(
      opportunity.minimum_investment,
    ) / 100;

  const remainingAllocation =
    remainingAllocationCents /
    100;

  const existingAmount =
    Number(
      subscription.commitment_amount,
    ) / 100;

  /*
   * --------------------------------------------------
   * 4. AUDIT HISTORY
   * --------------------------------------------------
   */
  const {
    data: auditHistory,
    error: auditError,
  } = await admin
    .from(
      "investment_subscription_audit",
    )
    .select(
      `
      id,
      action,
      metadata,
      created_at
      `,
    )
    .eq(
      "subscription_id",
      subscription.id,
    )
    .order(
      "created_at",
      {
        ascending:
          false,
      },
    );

  if (auditError) {
    console.error(
      "Subscription audit history load error:",
      auditError,
    );
  }

  const canResubmit =
    subscription.status ===
    "action_required";

    const canFund =
  subscription.status ===
  "approved";

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/investments"
        className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-forest-950"
      >
        <ArrowLeft className="size-4" />

        Back to My Investments
      </Link>

      {/* ==========================================
          HEADER
      ========================================== */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Investment subscription
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          {opportunity.title}
        </h1>

        <div className="mt-5">
          <StatusBadge
            status={
              subscription.status
            }
          />
        </div>
      </section>

      {/* ==========================================
          ACTION REQUIRED
      ========================================== */}

      {subscription.status ===
        "action_required" ? (
        <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6 sm:p-8">
          <CircleAlert className="size-6 text-amber-700" />

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
            Action required
          </p>

          <h2 className="font-display mt-3 text-3xl font-semibold text-amber-950">
            Tevuah Reserve requires additional information.
          </h2>

          <p className="mt-4 text-sm leading-7 text-amber-900">
            Review the request below, make the
            necessary changes and resubmit your
            subscription for another review.
          </p>

          <div className="mt-6 rounded-xl border border-amber-300 bg-white/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
              Admin request
            </p>

            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-amber-950">
              {subscription.admin_notes ??
                "Additional information has been requested."}
            </p>
          </div>
        </section>
      ) : null}

      {/* ==========================================
          REJECTED
      ========================================== */}

      {subscription.status ===
        "rejected" ? (
        <section className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 sm:p-8">
          <CircleAlert className="size-6 text-red-700" />

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-red-700">
            Subscription not approved
          </p>

          <h2 className="font-display mt-3 text-3xl font-semibold text-red-950">
            This subscription was rejected.
          </h2>

          <p className="mt-5 whitespace-pre-line text-sm leading-7 text-red-900">
            {subscription.rejection_reason ??
              "No rejection reason was provided."}
          </p>
        </section>
      ) : null}

      {/* ==========================================
          CURRENT SUBSCRIPTION
      ========================================== */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <FileCheck2 className="size-5 text-gold-600" />

        <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
          Subscription details
        </h2>

        <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <DataPoint
            label="Commitment"
            value={formatMoney(
              Number(
                subscription.commitment_amount,
              ),
            )}
          />

          <DataPoint
            label="Offering documents"
            value={
              subscription.offering_acknowledged
                ? "Acknowledged"
                : "Not acknowledged"
            }
          />

          <DataPoint
            label="Risk disclosure"
            value={
              subscription.risk_disclosure_accepted
                ? "Accepted"
                : "Not accepted"
            }
          />

          <DataPoint
            label="Electronic signature"
            value={
              subscription.electronic_signature ??
              "—"
            }
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
      </section>

      {/* ==========================================
          RESUBMISSION
      ========================================== */}

      {canResubmit ? (
        <SubscriptionResubmitForm
          opportunity={{
            id:
              opportunity.id,

            title:
              opportunity.title,

            minimumInvestment,

            remainingAllocation,
          }}
          existing={{
            amount:
              existingAmount,

            signature:
              subscription.electronic_signature ??
              "",
          }}
        />
      ) : null}

      {canFund ? (
        <section className="rounded-[1.75rem] bg-forest-950 p-6 text-white sm:p-8">
            <CheckCircle2 className="size-6 text-gold-400" />

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
            Subscription approved
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold">
            Complete your capital funding
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">
            Your subscription has been approved. Review your
            secure funding instructions and submit your
            payment confirmation after sending the funds.
            </p>

            <Link
            href={`/dashboard/investments/${subscription.id}/funding`}
            className="focus-ring mt-6 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-gold-400 px-5 text-sm font-semibold text-forest-950 transition hover:bg-gold-300"
            >
            View funding instructions
            </Link>
        </section>
        ) : null}

      {/* ==========================================
          AUDIT HISTORY
      ========================================== */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <ShieldCheck className="size-5 text-gold-600" />

        <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
          Subscription history
        </h2>

        <div className="mt-6 space-y-3">
          {(auditHistory ??
            []).map(
              (
                event,
              ) => (
                <div
                  key={
                    event.id
                  }
                  className="rounded-xl border border-forest-900/10 bg-ivory-50 p-4"
                >
                  <p className="text-sm font-semibold text-forest-950">
                    {humanize(
                      event.action,
                    )}
                  </p>

                  <p className="mt-1 text-xs text-stone-500">
                    {formatDate(
                      event.created_at,
                    )}
                  </p>
                </div>
              ),
            )}

          {(auditHistory ??
            []).length ===
          0 ? (
            <p className="text-sm text-stone-500">
              No subscription history is available.
            </p>
          ) : null}
        </div>
      </section>
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

      <p className="mt-1 wrap-break-word text-sm font-semibold text-forest-950">
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
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
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
        <CheckCircle2 className="size-4" />
      ) : review ? (
        <Clock3 className="size-4" />
      ) : (
        <CircleAlert className="size-4" />
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