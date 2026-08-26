import {
  ArrowLeft,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import { SubscriptionReviewActions } from "@/src/components/admin/subscriptions/subscription-review-actions";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

type PageProps = {
  params: Promise<{
    subscriptionId: string;
  }>;
};

export default async function AdminSubscriptionReviewPage({
  params,
}: PageProps) {
  await requireAdmin();

  const {
    subscriptionId,
  } = await params;

  const admin =
    createAdminClient();

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

      investor:profiles!investment_subscriptions_investor_id_fkey (
        id,
        first_name,
        last_name,
        phone,
        country,
        city,
        state,
        onboarding_status,
        account_status,
        kyc_status,
        tax_status
      ),

      opportunity:investment_opportunities!investment_subscriptions_opportunity_id_fkey (
        id,
        slug,
        title,
        asset_category,
        status,
        funding_target,
        total_funded,
        minimum_investment
      )
      `,
    )
    .eq(
      "id",
      subscriptionId,
    )
    .maybeSingle();

  if (
    error ||
    !subscription
  ) {
    console.error(
      "Subscription review load error:",
      error,
    );

    notFound();
  }

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

  if (
    !investor ||
    !opportunity
  ) {
    notFound();
  }

  const investorName =
    [
      investor.first_name,
      investor.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "Investor";

  /*
   * Real Auth email.
   */
  const {
    data: authInvestorData,
  } =
    await admin.auth.admin.getUserById(
      investor.id,
    );

  const investorEmail =
    authInvestorData.user
      ?.email ??
    "Email unavailable";

  const remainingAllocation =
    Number(
      opportunity.funding_target,
    ) -
    Number(
      opportunity.total_funded,
    );

  /*
   * Audit history.
   */
  const {
    data: auditHistory,
  } = await admin
    .from(
      "investment_subscription_audit",
    )
    .select(
      `
      id,
      actor_id,
      action,
      metadata,
      created_at
      `,
    )
    .eq(
      "subscription_id",
      subscriptionId,
    )
    .order(
      "created_at",
      {
        ascending:
          false,
      },
    );

  return (
    <div className="space-y-8">
      <Link
        href="/admin/subscriptions"
        className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-forest-950"
      >
        <ArrowLeft className="size-4" />

        Back to subscriptions
      </Link>

      {/* HEADER */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Subscription review
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          {opportunity.title}
        </h1>

        <div className="mt-5 flex flex-wrap gap-3">
          <StatusBadge
            label="Subscription"
            value={
              subscription.status
            }
          />

          <StatusBadge
            label="Account"
            value={
              investor.account_status ??
              "active"
            }
          />

          <StatusBadge
            label="Investor verification"
            value={
              investor.onboarding_status ??
              "not_started"
            }
          />
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {/* INVESTOR */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <UserRound className="size-5 text-gold-600" />

            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Investor
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Data
                label="Name"
                value={
                  investorName
                }
              />

              <Data
                label="Email"
                value={
                  investorEmail
                }
              />

              <Data
                label="Phone"
                value={
                  investor.phone ??
                  "—"
                }
              />

              <Data
                label="Location"
                value={
                  [
                    investor.city,
                    investor.state,
                    investor.country,
                  ]
                    .filter(Boolean)
                    .join(", ") ||
                  "—"
                }
              />

              <Data
                label="KYC"
                value={humanize(
                  investor.kyc_status ??
                    "not_started",
                )}
              />

              <Data
                label="Tax"
                value={humanize(
                  investor.tax_status ??
                    "not_started",
                )}
              />
            </div>

            <Link
              href={`/admin/investors/${investor.id}`}
              className="focus-ring mt-6 inline-flex min-h-10 cursor-pointer items-center rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950"
            >
              View investor profile
            </Link>
          </section>

          {/* SUBSCRIPTION */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <FileCheck2 className="size-5 text-gold-600" />

            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Subscription details
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Data
                label="Commitment"
                value={formatMoney(
                  Number(
                    subscription.commitment_amount,
                  ),
                )}
              />

              <Data
                label="Minimum investment"
                value={formatMoney(
                  Number(
                    opportunity.minimum_investment,
                  ),
                )}
              />

              <Data
                label="Offering acknowledged"
                value={
                  subscription.offering_acknowledged
                    ? "Yes"
                    : "No"
                }
              />

              <Data
                label="Acknowledged at"
                value={
                  subscription.offering_acknowledged_at
                    ? formatDate(
                        subscription.offering_acknowledged_at,
                      )
                    : "—"
                }
              />

              <Data
                label="Risk accepted"
                value={
                  subscription.risk_disclosure_accepted
                    ? "Yes"
                    : "No"
                }
              />

              <Data
                label="Risk accepted at"
                value={
                  subscription.risk_disclosure_accepted_at
                    ? formatDate(
                        subscription.risk_disclosure_accepted_at,
                      )
                    : "—"
                }
              />

              <Data
                label="Electronic signature"
                value={
                  subscription.electronic_signature ??
                  "—"
                }
              />

              <Data
                label="Signed at"
                value={
                  subscription.signed_at
                    ? formatDate(
                        subscription.signed_at,
                      )
                    : "—"
                }
              />
            </div>
          </section>

          {/* AUDIT */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <ShieldCheck className="size-5 text-gold-600" />

            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Subscription audit history
            </h2>

            <div className="mt-6 space-y-3">
              {(auditHistory ??
                []).map(
                (
                  entry,
                ) => (
                  <div
                    key={
                      entry.id
                    }
                    className="rounded-xl border border-forest-900/10 bg-ivory-50 p-4"
                  >
                    <p className="text-sm font-semibold text-forest-950">
                      {humanize(
                        entry.action,
                      )}
                    </p>

                    <p className="mt-1 text-xs text-stone-500">
                      {formatDate(
                        entry.created_at,
                      )}
                    </p>
                  </div>
                ),
              )}

              {(auditHistory ??
                []).length ===
              0 ? (
                <p className="text-sm text-stone-500">
                  No audit history found.
                </p>
              ) : null}
            </div>
          </section>
        </div>

        {/* ACTION PANEL */}

        <SubscriptionReviewActions
          subscriptionId={
            subscription.id
          }
          investorName={
            investorName
          }
          currentStatus={
            subscription.status
          }
          commitmentAmount={
            Number(
              subscription.commitment_amount,
            )
          }
          remainingAllocation={
            remainingAllocation
          }
        />
      </div>
    </div>
  );
}

function Data({
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
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <span className="rounded-full bg-ivory-50 px-3 py-1.5 text-xs font-semibold text-forest-950">
      {label}:{" "}
      {humanize(
        value,
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