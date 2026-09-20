import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  CircleAlert,
  Clock3,
  UsersRound,
} from "lucide-react";

import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import { CashAccountInvestmentForm } from "@/src/components/investments/cash-account-investment-form";
import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

/* ============================================================
 * JOINT INVESTMENT TYPES
 * ============================================================ */

type JointInvestmentRecord = {
  joint_subscription_id: string;

  opportunity_id: string;
  opportunity_title: string;
  opportunity_slug: string;
  opportunity_asset_category: string | null;
  opportunity_location: string | null;

  initiated_by: string;
  is_initiator: boolean;

  total_commitment_amount: number;
  currency: string;

  parent_status: string;

  my_member_id: string;
  my_member_slot: number;
  my_member_status: string;

  my_ownership_bps: number;
  my_funding_obligation_bps: number;
  my_obligation_amount: number;

  my_consent_status: string | null;

  other_member_id: string;
  other_member_first_name: string | null;
  other_member_last_name: string | null;

  other_member_status: string;
  other_member_consent_status: string | null;

  invitation_status: string | null;

  both_members_accepted: boolean;
  both_consents_accepted: boolean;
  ready_for_review: boolean;

  submitted_at: string | null;
  approved_at: string | null;

  created_at: string;
  updated_at: string;
};

/* ============================================================
 * PAGE
 * ============================================================ */

export default async function MyInvestmentsPage() {
  /* ----------------------------------------------------------
   * 1. INVESTOR
   * ---------------------------------------------------------- */

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
   * IMPORTANT:
   *
   * Joint RPCs are auth-bound through auth.uid().
   * Therefore use the authenticated SSR client for the
   * joint-investment RPC.
   */
  const supabase =
    await createClient();

  /* ----------------------------------------------------------
   * 2. LOAD INDIVIDUAL SUBSCRIPTIONS
   * ---------------------------------------------------------- */

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
        ascending: false,
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
    subscriptions ?? [];

  /* ----------------------------------------------------------
   * 3. LOAD CASH ACCOUNT + EXISTING INDIVIDUAL PAYMENTS
   * ---------------------------------------------------------- */

  const [
    cashAccountResult,
    paymentsResult,
  ] = await Promise.all([
    admin
      .from(
        "investor_cash_accounts",
      )
      .select(
        `
        available_balance_cents,
        currency,
        status
        `,
      )
      .eq(
        "investor_id",
        user.id,
      )
      .eq(
        "currency",
        "USD",
      )
      .maybeSingle(),

    admin
      .from(
        "investment_payments",
      )
      .select(
        `
        id,
        subscription_id,
        status
        `,
      )
      .eq(
        "investor_id",
        user.id,
      ),
  ]);

  if (
    cashAccountResult.error
  ) {
    console.error(
      "Investor cash account load error:",
      cashAccountResult.error,
    );
  }

  if (
    paymentsResult.error
  ) {
    console.error(
      "Investor payments load error:",
      paymentsResult.error,
    );
  }

  const cashAccount =
    cashAccountResult.data;

  const activePaymentSubscriptionIds =
    new Set(
      (
        paymentsResult.data ??
        []
      )
        .filter(
          (
            payment,
          ) =>
            payment.status ===
              "pending" ||
            payment.status ===
              "reported" ||
            payment.status ===
              "payment_reported" ||
            payment.status ===
              "pending_verification" ||
            payment.status ===
              "verified",
        )
        .map(
          (
            payment,
          ) =>
            payment.subscription_id,
        )
        .filter(
          (
            subscriptionId,
          ): subscriptionId is string =>
            typeof subscriptionId ===
              "string" &&
            subscriptionId.length >
              0,
        ),
    );

  /* ----------------------------------------------------------
   * 4. LOAD JOINT INVESTMENTS
   *
   * This RPC is scoped internally using auth.uid().
   * ---------------------------------------------------------- */

  const {
    data: jointInvestmentData,
    error: jointInvestmentError,
  } = await supabase.rpc(
    "list_my_joint_investments",
  );

  if (
    jointInvestmentError
  ) {
    console.error(
      "Joint investments load error:",
      jointInvestmentError,
    );

    throw new Error(
      "Unable to load your joint investments.",
    );
  }

  const jointInvestments =
    (
      jointInvestmentData ??
      []
    ) as JointInvestmentRecord[];

  /* ----------------------------------------------------------
   * 5. SUMMARY
   * ---------------------------------------------------------- */

  const submittedCount =
    records.filter(
      (
        subscription,
      ) =>
        subscription.status ===
          "submitted" ||
        subscription.status ===
          "under_review",
    ).length +
    jointInvestments.filter(
      (
        investment,
      ) =>
        investment.parent_status ===
          "submitted" ||
        investment.parent_status ===
          "under_review",
    ).length;

  const approvedCount =
    records.filter(
      (
        subscription,
      ) =>
        subscription.status ===
        "approved",
    ).length +
    jointInvestments.filter(
      (
        investment,
      ) =>
        investment.parent_status ===
          "approved" ||
        investment.parent_status ===
          "funding" ||
        investment.parent_status ===
          "funded",
    ).length;

  const actionRequiredCount =
    records.filter(
      (
        subscription,
      ) =>
        subscription.status ===
        "action_required",
    ).length +
    jointInvestments.filter(
      (
        investment,
      ) =>
        jointInvestmentNeedsAction(
          investment,
        ),
    ).length;

  const totalInvestmentRecords =
    records.length +
    jointInvestments.length;

  /* ----------------------------------------------------------
   * 6. RENDER
   * ---------------------------------------------------------- */

  return (
    <div className="space-y-8">
      {/* ======================================================
          HEADER
      ====================================================== */}

    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
        Portfolio
      </p>

      <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
        My Investments
      </h1>

      <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
        Track your individual and joint
        investments, commitments, funding
        obligations and review status.
      </p>
    </div>

    <Link
      href="/investments"
      className="focus-ring inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 self-start rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800 lg:self-auto"
    >
      View all opportunities

      <ArrowRight className="size-4" />
    </Link>
  </div>

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total investments"
          value={
            totalInvestmentRecords
          }
        />

        <SummaryCard
          label="In review"
          value={
            submittedCount
          }
        />

        <SummaryCard
          label="Approved / funded"
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

      {/* ======================================================
          JOINT INVESTMENTS
      ====================================================== */}

      {jointInvestments.length >
      0 ? (
        <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
          {/* Section heading */}

          <div className="border-b border-forest-900/10 px-6 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-ivory-50 text-forest-950">
                <UsersRound className="size-4" />
              </div>

              <div>
                <h2 className="font-display text-xl font-semibold text-forest-950">
                  Joint Investments
                </h2>

                <p className="mt-1 text-xs leading-5 text-stone-500">
                  Shared 50/50 investment
                  commitments and funding.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-forest-900/10">
            {jointInvestments.map(
              (
                investment,
              ) => {
                const otherMemberName =
                  fullName(
                    investment.other_member_first_name,
                    investment.other_member_last_name,
                  );

                const needsAction =
                  jointInvestmentNeedsAction(
                    investment,
                  );

                return (
                  <article
                    key={
                      investment.joint_subscription_id
                    }
                    className="p-6 sm:p-7"
                  >
                    <div className="flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0 flex-1">
                        {/* Status row */}

                        <div className="flex flex-wrap items-center gap-2">
                          <JointStatusBadge
                            status={
                              investment.parent_status
                            }
                          />

                          <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-950 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-white">
                            <UsersRound className="size-3" />

                            Joint · 50/50
                          </span>

                          {investment.is_initiator ? (
                            <span className="inline-flex rounded-full bg-ivory-100 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-gold-700">
                              Initiator
                            </span>
                          ) : null}
                        </div>

                        {/* Opportunity */}

                        <h3 className="font-display mt-4 text-2xl font-semibold text-forest-950">
                          {
                            investment.opportunity_title
                          }
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs uppercase tracking-widest text-stone-400">
                          <span>
                            {investment.opportunity_asset_category
                              ? humanize(
                                  investment.opportunity_asset_category,
                                )
                              : "Private investment"}
                          </span>

                          {investment.opportunity_location ? (
                            <>
                              <span aria-hidden="true">
                                ·
                              </span>

                              <span>
                                {
                                  investment.opportunity_location
                                }
                              </span>
                            </>
                          ) : null}
                        </div>

                        {/* Financial structure */}

                        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                          <DataPoint
                            label="Total commitment"
                            value={formatMoney(
                              Number(
                                investment.total_commitment_amount,
                              ),
                              investment.currency,
                            )}
                          />

                          <DataPoint
                            label="Your obligation"
                            value={formatMoney(
                              Number(
                                investment.my_obligation_amount,
                              ),
                              investment.currency,
                            )}
                          />

                          <DataPoint
                            label="Your ownership"
                            value={formatBasisPoints(
                              Number(
                                investment.my_ownership_bps,
                              ),
                            )}
                          />

                          <DataPoint
                            label="Joint investor"
                            value={
                              otherMemberName
                            }
                          />
                        </div>

                        {/* Member state */}

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                          <MemberState
                            label="Your status"
                            memberStatus={
                              investment.my_member_status
                            }
                            consentStatus={
                              investment.my_consent_status
                            }
                          />

                          <MemberState
                            label={`${otherMemberName}'s status`}
                            memberStatus={
                              investment.other_member_status
                            }
                            consentStatus={
                              investment.other_member_consent_status
                            }
                          />
                        </div>

                        {/* Action state */}

                        {needsAction ? (
                          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                            <div className="flex gap-3">
                              <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-700" />

                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                                  Action required
                                </p>

                                <p className="mt-2 text-sm leading-6 text-amber-900">
                                  {getJointActionMessage(
                                    investment,
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {/* Funded state */}

                        {investment.parent_status ===
                        "funded" ? (
                          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                            <div className="flex gap-3">
                              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />

                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                                  Joint investment funded
                                </p>

                                <p className="mt-2 text-sm leading-6 text-emerald-900">
                                  Both members have completed
                                  their funding obligations and
                                  the joint investment has been
                                  finalized.
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {/* Actions */}

                      <div className="flex shrink-0 flex-wrap gap-3 xl:flex-col xl:items-stretch">
                       {investment.opportunity_slug ? (
                        <Link
                          href={`/investments/${investment.opportunity_slug}`}
                          className="focus-ring inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950 transition hover:bg-ivory-50"
                        >
                          View opportunity

                          <ArrowRight className="size-3.5" />
                        </Link>
                      ) : null}

                        <Link
                          href={`/dashboard/investments/joint/${investment.joint_subscription_id}`}
                          className="focus-ring inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-4 text-xs font-semibold text-white transition hover:bg-forest-800"
                        >
                          View joint investment

                          <ArrowRight className="size-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        </section>
      ) : null}

      {/* ======================================================
          INDIVIDUAL SUBSCRIPTIONS
      ====================================================== */}

      <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
        {/* Section heading */}

        <div className="border-b border-forest-900/10 px-6 py-5 sm:px-7">
          <div>
            <h2 className="font-display text-xl font-semibold text-forest-950">
              Individual Investments
            </h2>

            <p className="mt-1 text-xs leading-5 text-stone-500">
              Your individual investment
              subscriptions and commitments.
            </p>
          </div>
        </div>

        {records.length ===
        0 ? (
          <div className="px-6 py-16 text-center">
            <BriefcaseBusiness className="mx-auto size-7 text-stone-300" />

            <h3 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              You have no individual investment
              subscriptions yet.
            </h3>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-stone-500">
              Explore currently published
              investment opportunities and start
              your next subscription.
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

                        <h3 className="font-display mt-4 text-2xl font-semibold text-forest-950">
                          {opportunity?.title ??
                            "Investment opportunity"}
                        </h3>

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

                        {subscription.status ===
                          "approved" &&
                        cashAccount &&
                        cashAccount.status ===
                          "active" &&
                        !activePaymentSubscriptionIds.has(
                          subscription.id,
                        ) ? (
                          <div className="mt-6">
                            <CashAccountInvestmentForm
                              subscriptionId={
                                subscription.id
                              }
                              commitmentAmountCents={
                                Number(
                                  subscription.commitment_amount,
                                )
                              }
                              availableBalanceCents={
                                Number(
                                  cashAccount.available_balance_cents,
                                )
                              }
                              currency={
                                cashAccount.currency ??
                                "USD"
                              }
                            />
                          </div>
                        ) : null}

                        {subscription.status ===
                          "approved" &&
                        activePaymentSubscriptionIds.has(
                          subscription.id,
                        ) ? (
                          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                              Funding already submitted
                            </p>

                            <p className="mt-2 text-sm leading-6 text-emerald-900">
                              A payment already exists
                              for this approved
                              subscription. Open the
                              subscription to review
                              its funding status.
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
                          View opportunity

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

      <section className="overflow-hidden rounded-[1.75rem] bg-forest-950 px-6 py-8 text-white sm:px-8 sm:py-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
            Continue investing
          </p>

          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight">
            Explore your next opportunity.
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
            Browse currently available opportunities
            to make another individual investment or
            establish a new 50/50 joint investment.
          </p>
        </div>

        <Link
          href="/investments"
          className="focus-ring inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 self-start rounded-full bg-white px-5 text-sm font-semibold text-forest-950 transition hover:bg-ivory-50 lg:self-auto"
        >
          View all opportunities

          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
    </div>
  );
}

/* ============================================================
 * COMPONENTS
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

function MemberState({
  label,
  memberStatus,
  consentStatus,
}: {
  label: string;
  memberStatus: string;
  consentStatus: string | null;
}) {
  const complete =
    memberStatus ===
      "accepted" &&
    consentStatus ===
      "accepted";

  return (
    <div className="rounded-2xl bg-ivory-50 px-4 py-3">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2">
        {complete ? (
          <CheckCircle2 className="size-4 text-emerald-600" />
        ) : (
          <Clock3 className="size-4 text-amber-600" />
        )}

        <p className="text-sm font-semibold text-forest-950">
          {complete
            ? "Accepted & signed"
            : memberStatus ===
                "accepted"
              ? "Signature pending"
              : humanize(
                  memberStatus,
                )}
        </p>
      </div>
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

function JointStatusBadge({
  status,
}: {
  status: string;
}) {
  const funded =
    status ===
    "funded";

  const funding =
    status ===
    "funding";

  const approved =
    status ===
    "approved";

  const review =
    status ===
      "submitted" ||
    status ===
      "under_review";

  const waiting =
    status ===
      "draft" ||
    status ===
      "awaiting_member_acceptance";

  const failed =
    status ===
      "rejected" ||
    status ===
      "cancelled";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest ${
        funded
          ? "bg-emerald-50 text-emerald-700"
          : funding ||
              approved
            ? "bg-blue-50 text-blue-700"
            : review ||
                waiting
              ? "bg-amber-50 text-amber-700"
              : failed
                ? "bg-red-50 text-red-700"
                : "bg-stone-100 text-stone-600"
      }`}
    >
      {funded ? (
        <CheckCircle2 className="size-3" />
      ) : funding ||
        approved ||
        review ||
        waiting ? (
        <Clock3 className="size-3" />
      ) : (
        <CircleAlert className="size-3" />
      )}

      {humanizeJointStatus(
        status,
      )}
    </span>
  );
}

/* ============================================================
 * JOINT INVESTMENT UI LOGIC
 * ============================================================ */

function jointInvestmentNeedsAction(
  investment: JointInvestmentRecord,
) {
  if (
    investment.parent_status ===
      "rejected" ||
    investment.parent_status ===
      "cancelled" ||
    investment.parent_status ===
      "funded"
  ) {
    return false;
  }

  /*
   * Current investor still has to complete their
   * membership / consent.
   */
  if (
    investment.my_member_status !==
      "accepted" ||
    investment.my_consent_status !==
      "accepted"
  ) {
    return true;
  }

  /*
   * Once approved, the detail page becomes the place
   * where this member completes their own funding.
   *
   * We intentionally do not attempt to infer the
   * member's exact funding-obligation state here because
   * list_my_joint_investments() does not currently return
   * the Step-3 funding tables.
   */
  if (
    investment.parent_status ===
      "approved" ||
    investment.parent_status ===
      "funding"
  ) {
    return true;
  }

  return false;
}

function getJointActionMessage(
  investment: JointInvestmentRecord,
) {
  if (
    investment.my_member_status !==
    "accepted"
  ) {
    return "Complete your joint investment acceptance to continue.";
  }

  if (
    investment.my_consent_status !==
    "accepted"
  ) {
    return "Review and sign your joint investment agreement to continue.";
  }

  if (
    investment.parent_status ===
      "approved"
  ) {
    return "Your joint investment has been approved. Open it to review and complete your funding obligation.";
  }

  if (
    investment.parent_status ===
      "funding"
  ) {
    return "Funding is in progress. Open the joint investment to review your funding obligation and payment status.";
  }

  return "Open the joint investment to review the next required step.";
}

/* ============================================================
 * FORMATTERS
 * ============================================================ */

function fullName(
  firstName:
    | string
    | null,
  lastName:
    | string
    | null,
) {
  const name = [
    firstName,
    lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    name ||
    "Joint investor"
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
      (
        letter,
      ) =>
        letter.toUpperCase(),
    );
}

function humanizeJointStatus(
  status: string,
) {
  switch (status) {
    case "awaiting_member_acceptance":
      return "Awaiting acceptance";

    case "submitted":
      return "Submitted";

    case "under_review":
      return "Under review";

    case "approved":
      return "Approved";

    case "funding":
      return "Funding";

    case "funded":
      return "Funded";

    case "rejected":
      return "Not approved";

    case "cancelled":
      return "Cancelled";

    default:
      return humanize(
        status,
      );
  }
}

function formatBasisPoints(
  basisPoints: number,
) {
  return `${(
    basisPoints /
    100
  ).toLocaleString(
    "en-US",
    {
      maximumFractionDigits: 2,
    },
  )}%`;
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
      maximumFractionDigits: 0,
    },
  ).format(
    cents /
      100,
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