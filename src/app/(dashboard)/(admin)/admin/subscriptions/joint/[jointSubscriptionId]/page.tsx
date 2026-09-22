import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  CircleAlert,
  FileCheck2,
  ShieldCheck,
  UserRound,
  UsersRound,
  CircleDollarSign,
} from "lucide-react";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import { JointSubscriptionReviewActions } from "@/src/components/admin/subscriptions/joint-subscription-review-actions";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

type JointWithdrawalSummary = {
  id: string;
  joint_subscription_id: string;
  initiated_by: string;
  status: string;
  withdrawal_scope: string;
  proceeds_allocation: string;
  proceeds_recipient_investor_id: string | null;
  requested_at: string;
  fully_approved_at: string | null;
  submitted_for_execution_at: string | null;
  executed_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
};

type PageProps = {
  params: Promise<{
    jointSubscriptionId: string;
  }>;
};

export default async function AdminJointSubscriptionReviewPage({
  params,
}: PageProps) {
  await requireAdmin();

  const {
    jointSubscriptionId,
  } = await params;

  const admin =
    createAdminClient();

  const {
    data: joint,
    error,
  } = await admin
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
        rejection_reason,
        finalized_at,
      created_at,
      updated_at,

      opportunity:investment_opportunities!joint_investment_subscriptions_opportunity_id_fkey (
        id,
        slug,
        title,
        asset_category,
        status,
        funding_target,
        total_funded,
        minimum_investment
      ),

      members:joint_investment_members (
        id,
        investor_id,
        member_slot,
        ownership_bps,
        funding_obligation_bps,
        obligation_amount,
        member_status,
        invited_at,
        accepted_at,
        declined_at,

        investor:profiles!joint_investment_members_investor_id_fkey (
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

        consents:joint_investment_member_consents (
          id,
          consent_status,
          agreement_version,
          disclosure_version,
          agreement_document_ref,
          disclosure_document_ref,
          joint_ownership_acknowledged,
          funding_obligation_acknowledged,
          risk_disclosure_acknowledged,
          terms_acknowledged,
          signature_name,
          signature_method,
          signed_at,
          accepted_at
        )
      )
      `,
    )
    .eq(
      "id",
      jointSubscriptionId,
    )
    .maybeSingle();

  if (
    error ||
    !joint
  ) {
    console.error(
      "Joint subscription review load error:",
      error,
    );

    notFound();
  }

  const {
    data: withdrawalData,
    error: withdrawalError,
  } = await admin
    .from("joint_investment_withdrawals")
    .select(`
      id,
      joint_subscription_id,
      initiated_by,
      status,
      withdrawal_scope,
      proceeds_allocation,
      proceeds_recipient_investor_id,
      requested_at,
      fully_approved_at,
      submitted_for_execution_at,
      executed_at,
      rejected_at,
      rejection_reason
    `)
    .eq("joint_subscription_id", joint.id)
    .order("requested_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (withdrawalError) {
    console.error(
      "Admin joint withdrawal load error:",
      withdrawalError,
    );
  }

  const withdrawal =
    (withdrawalData as JointWithdrawalSummary | null) ?? null;

  const opportunity =
    firstRelation(
      joint.opportunity,
    );

  if (
    !opportunity
  ) {
    notFound();
  }

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
    members.find(
      (member) =>
        Number(
          member.member_slot,
        ) === 1,
    ) ?? null;

  const memberTwo =
    members.find(
      (member) =>
        Number(
          member.member_slot,
        ) === 2,
    ) ?? null;

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

  const [
    memberOneAuth,
    memberTwoAuth,
  ] =
    await Promise.all([
      memberOneInvestor
        ? admin.auth.admin.getUserById(
            memberOneInvestor.id,
          )
        : Promise.resolve(
            null,
          ),

      memberTwoInvestor
        ? admin.auth.admin.getUserById(
            memberTwoInvestor.id,
          )
        : Promise.resolve(
            null,
          ),
    ]);

  const memberOneEmail =
    memberOneAuth?.data
      .user?.email ??
    "Email unavailable";

  const memberTwoEmail =
    memberTwoAuth?.data
      .user?.email ??
    "Email unavailable";

  const memberOneAccepted =
    memberOne?.member_status ===
    "accepted";

  const memberTwoAccepted =
    memberTwo?.member_status ===
    "accepted";

  const memberOneConsentAccepted =
    memberOneConsent?.consent_status ===
    "accepted";

  const memberTwoConsentAccepted =
    memberTwoConsent?.consent_status ===
    "accepted";

  const memberOneAcknowledgements =
    Boolean(
      memberOneConsent
        ?.joint_ownership_acknowledged,
    ) &&
    Boolean(
      memberOneConsent
        ?.funding_obligation_acknowledged,
    ) &&
    Boolean(
      memberOneConsent
        ?.risk_disclosure_acknowledged,
    ) &&
    Boolean(
      memberOneConsent
        ?.terms_acknowledged,
    );

  const memberTwoAcknowledgements =
    Boolean(
      memberTwoConsent
        ?.joint_ownership_acknowledged,
    ) &&
    Boolean(
      memberTwoConsent
        ?.funding_obligation_acknowledged,
    ) &&
    Boolean(
      memberTwoConsent
        ?.risk_disclosure_acknowledged,
    ) &&
    Boolean(
      memberTwoConsent
        ?.terms_acknowledged,
    );

  const ownershipTotal =
    members.reduce(
      (
        total,
        member,
      ) =>
        total +
        Number(
          member.ownership_bps ??
            0,
        ),
      0,
    );

  const fundingBpsTotal =
    members.reduce(
      (
        total,
        member,
      ) =>
        total +
        Number(
          member.funding_obligation_bps ??
            0,
        ),
      0,
    );

  const obligationTotal =
    members.reduce(
      (
        total,
        member,
      ) =>
        total +
        Number(
          member.obligation_amount ??
            0,
        ),
      0,
    );

  const readyForApproval =
    members.length === 2 &&
    memberOneAccepted &&
    memberTwoAccepted &&
    memberOneConsentAccepted &&
    memberTwoConsentAccepted &&
    memberOneAcknowledgements &&
    memberTwoAcknowledgements &&
    ownershipTotal === 10000 &&
    fundingBpsTotal === 10000 &&
    obligationTotal ===
      Number(
        joint.total_commitment_amount,
      );

  const {
    data: auditHistory,
  } = await admin
    .from(
      "joint_investment_audit",
    )
    .select(
      `
      id,
      member_id,
      actor_id,
      event_type,
      from_status,
      to_status,
      metadata,
      created_at
      `,
    )
    .eq(
      "joint_subscription_id",
      jointSubscriptionId,
    )
    .order(
      "created_at",
      {
        ascending: false,
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

      <section className="overflow-hidden rounded-[1.75rem] bg-forest-950">
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-gold-400 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-forest-950">
                Joint 50/50
                </span>

            <span className="rounded-full bg-white/10 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-widest text-white/70">
              {humanize(
                joint.status,
              )}
            </span>
          </div>

          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
            Joint investment review
          </p>

          <h1 className="font-display mt-3 text-4xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">
            {opportunity.title}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
            Review both investors,
            their legal consents and
            the fixed 50/50 investment
            structure before
            administrative approval.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <HeroValue
              label="Total commitment"
              value={formatMoney(
                Number(
                  joint.total_commitment_amount,
                ),
                joint.currency,
              )}
            />

            <HeroValue
              label="Ownership"
              value="50 / 50"
            />

            <HeroValue
              label="Members"
              value={`${members.length} / 2`}
            />

            <HeroValue
              label="Agreements"
              value={`${
                [
                  memberOneConsentAccepted,
                  memberTwoConsentAccepted,
                ].filter(Boolean)
                  .length
              } / 2 signed`}
            />
          </div>
        </div>
      </section>

      {joint.status === "approved" ||
        joint.status === "funding" ||
        joint.status === "funded" ? (
        <div className="flex justify-end">
            <Link
            href={`/admin/subscriptions/joint/${joint.id}/funding`}
            className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800"
            >
            <CircleDollarSign className="size-4" />

            Manage funding
            </Link>
        </div>
        ) : null}

      {withdrawal ? (
        <section
          id="joint-withdrawal"
          className={`overflow-hidden rounded-[1.75rem] border ${
            withdrawal.status === "approved"
              ? "border-gold-500/30 bg-ivory-50"
              : "border-forest-900/10 bg-white"
          }`}
        >
          <div className="border-b border-forest-900/10 px-6 py-5 sm:px-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold-500/10 text-gold-700">
                  <Clock3 className="size-5" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-700">
                    Joint Withdrawal
                  </p>
                  <h2 className="font-display mt-1 text-xl font-semibold text-forest-950">
                    {withdrawal.status === "approved"
                      ? "Administrative action required"
                      : withdrawal.status === "submitted_for_execution"
                        ? "Approved for execution"
                        : withdrawal.status === "executed"
                          ? "Withdrawal executed"
                          : withdrawal.status === "awaiting_member_approval"
                            ? "Waiting for investor approval"
                            : withdrawal.status === "rejected"
                              ? "Withdrawal rejected"
                              : "Withdrawal request"}
                  </h2>
                </div>
              </div>

              <span className="inline-flex rounded-full border border-forest-900/10 bg-white px-3 py-1.5 text-xs font-semibold text-forest-900">
                {humanize(withdrawal.status)}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-7">
            <p className="max-w-3xl text-sm leading-7 text-stone-600">
              {withdrawal.status === "approved"
                ? "Both joint investors have approved and signed the full withdrawal. Review the signed withdrawal evidence and proceeds allocation before submitting it for execution."
                : withdrawal.status === "submitted_for_execution"
                  ? "The withdrawal has passed administrative review and is ready for atomic execution."
                  : withdrawal.status === "executed"
                    ? "The withdrawal has been executed. Position redemption and Cash Account settlement are recorded in the withdrawal settlement."
                    : withdrawal.status === "awaiting_member_approval"
                      ? "A full joint withdrawal has been requested, but both investor approvals have not yet been recorded."
                      : "This joint investment has a withdrawal record. Open the withdrawal review for its complete lifecycle evidence."}
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <Data label="Scope" value="100% of joint position" />
              <Data
                label="Requested"
                value={formatDate(withdrawal.requested_at)}
              />
              <Data
                label="Proceeds"
                value={
                  withdrawal.proceeds_allocation === "member_one_full"
                    ? "100% to Investor A"
                    : "50/50 ownership split"
                }
              />
              <Data
                label="Investor approval"
                value={
                  withdrawal.fully_approved_at
                    ? formatDate(withdrawal.fully_approved_at)
                    : "Pending"
                }
              />
            </div>

            <div className="mt-7 border-t border-forest-900/10 pt-6">
              <Link
                href={`/admin/subscriptions/joint/${joint.id}/withdrawals/${withdrawal.id}`}
                className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800"
              >
                {withdrawal.status === "approved"
                  ? "Review withdrawal"
                  : withdrawal.status === "submitted_for_execution"
                    ? "Open execution review"
                    : "View withdrawal"}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {/* STRUCTURE */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <UsersRound className="size-5 text-gold-600" />

            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Joint investment structure
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Data
                label="Opportunity"
                value={
                  opportunity.title
                }
              />

              <Data
                label="Asset category"
                value={humanize(
                  opportunity.asset_category,
                )}
              />

              <Data
                label="Total commitment"
                value={formatMoney(
                  Number(
                    joint.total_commitment_amount,
                  ),
                  joint.currency,
                )}
              />

              <Data
                label="Minimum investment"
                value={formatMoney(
                  Number(
                    opportunity.minimum_investment,
                  ),
                  joint.currency,
                )}
              />

              <Data
                label="Ownership allocation"
                value={`${formatBps(
                  ownershipTotal,
                )} total`}
              />

              <Data
                label="Funding allocation"
                value={`${formatBps(
                  fundingBpsTotal,
                )} total`}
              />

              <Data
                label="Obligation total"
                value={formatMoney(
                  obligationTotal,
                  joint.currency,
                )}
              />

              <Data
                label="Submitted"
                value={
                  joint.submitted_at
                    ? formatDate(
                        joint.submitted_at,
                      )
                    : "Pending"
                }
              />

              <Data
                label="Reviewed"
                value={
                  joint.reviewed_at
                    ? formatDate(
                        joint.reviewed_at,
                      )
                    : "Pending"
                }
              />
            </div>

            <Link
              href={`/investments/${opportunity.slug}`}
              className="focus-ring mt-6 inline-flex min-h-10 cursor-pointer items-center rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950 transition hover:bg-ivory-50"
            >
              View opportunity
            </Link>
          </section>

          {/* MEMBER ONE */}

          <MemberReviewCard
            title="Investor One"
            subtitle="Initiator · 50% owner"
            member={
              memberOne
            }
            investor={
              memberOneInvestor
            }
            investorName={
              memberOneName
            }
            investorEmail={
              memberOneEmail
            }
            consent={
              memberOneConsent
            }
            currency={
              joint.currency
            }
          />

          {/* MEMBER TWO */}

          <MemberReviewCard
            title="Investor Two"
            subtitle="Invited member · 50% owner"
            member={
              memberTwo
            }
            investor={
              memberTwoInvestor
            }
            investorName={
              memberTwoName
            }
            investorEmail={
              memberTwoEmail
            }
            consent={
              memberTwoConsent
            }
            currency={
              joint.currency
            }
          />

          {/* APPROVAL READINESS */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <ShieldCheck className="size-5 text-gold-600" />

            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Approval readiness
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              These checks mirror the
              core joint investment
              requirements visible to
              the administrator. The
              controlled database RPC
              remains authoritative at
              approval time.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <CheckItem
                complete={
                  members.length ===
                  2
                }
                label="Exactly two members"
              />

              <CheckItem
                complete={
                  ownershipTotal ===
                  10000
                }
                label="Ownership totals 100%"
              />

              <CheckItem
                complete={
                  fundingBpsTotal ===
                  10000
                }
                label="Funding obligations total 100%"
              />

              <CheckItem
                complete={
                  obligationTotal ===
                  Number(
                    joint.total_commitment_amount,
                  )
                }
                label="Member obligations equal commitment"
              />

              <CheckItem
                complete={
                  memberOneAccepted
                }
                label="Investor one accepted"
              />

              <CheckItem
                complete={
                  memberTwoAccepted
                }
                label="Investor two accepted"
              />

              <CheckItem
                complete={
                  memberOneConsentAccepted &&
                  memberOneAcknowledgements
                }
                label="Investor one agreement complete"
              />

              <CheckItem
                complete={
                  memberTwoConsentAccepted &&
                  memberTwoAcknowledgements
                }
                label="Investor two agreement complete"
              />
            </div>
          </section>

          {/* AUDIT */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <FileCheck2 className="size-5 text-gold-600" />

            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Joint investment audit
            </h2>

            <div className="mt-6 space-y-3">
              {(auditHistory ??
                []).map(
                (entry) => (
                  <div
                    key={
                      entry.id
                    }
                    className="rounded-xl border border-forest-900/10 bg-ivory-50 p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-forest-950">
                          {humanize(
                            entry.event_type,
                          )}
                        </p>

                        {entry.from_status ||
                        entry.to_status ? (
                          <p className="mt-1 text-xs text-stone-500">
                            {entry.from_status
                              ? humanize(
                                  entry.from_status,
                                )
                              : "—"}{" "}
                            →{" "}
                            {entry.to_status
                              ? humanize(
                                  entry.to_status,
                                )
                              : "—"}
                          </p>
                        ) : null}
                      </div>

                      <p className="text-xs text-stone-400">
                        {formatDate(
                          entry.created_at,
                        )}
                      </p>
                    </div>
                  </div>
                ),
              )}

              {(auditHistory ??
                []).length ===
              0 ? (
                <p className="text-sm text-stone-500">
                  No joint investment
                  audit history found.
                </p>
              ) : null}
            </div>
          </section>
        </div>

        {/* ACTION PANEL */}

        <div>
          <div className="xl:sticky xl:top-8">
            <JointSubscriptionReviewActions
              jointSubscriptionId={
                joint.id
              }
              currentStatus={
                joint.status
              }
              readyForApproval={
                readyForApproval
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

type JointReviewMember = {
  id: string;
  investor_id: string;
  member_slot: number;
  ownership_bps: number;
  funding_obligation_bps: number;
  obligation_amount: number;
  member_status: string;
  invited_at: string | null;
  accepted_at: string | null;
  declined_at: string | null;
};

type JointReviewInvestor = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  state: string | null;
  onboarding_status: string | null;
  account_status: string | null;
  kyc_status: string | null;
  tax_status: string | null;
};

type JointReviewConsent = {
  id: string;
  consent_status: string;
  agreement_version: string | null;
  disclosure_version: string | null;
  agreement_document_ref: string | null;
  disclosure_document_ref: string | null;
  joint_ownership_acknowledged: boolean;
  funding_obligation_acknowledged: boolean;
  risk_disclosure_acknowledged: boolean;
  terms_acknowledged: boolean;
  signature_name: string | null;
  signature_method: string | null;
  signed_at: string | null;
  accepted_at: string | null;
};

/* ============================================================
 * MEMBER REVIEW
 * ============================================================ */

function MemberReviewCard({
  title,
  subtitle,
  member,
  investor,
  investorName,
  investorEmail,
  consent,
  currency,
}: {
  title: string;
  subtitle: string;

  member:
    | JointReviewMember
    | null;

  investor:
    | JointReviewInvestor
    | null;

  investorName: string;
  investorEmail: string;

  consent:
    | JointReviewConsent
    | null;

  currency: string;
}) {
  if (
    !member
  ) {
    return (
      <section className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 sm:p-8">
        <CircleAlert className="size-5 text-red-700" />

        <h2 className="font-display mt-4 text-3xl font-semibold text-red-950">
          {title} missing
        </h2>

        <p className="mt-3 text-sm leading-7 text-red-800">
          The required joint
          investment member record
          was not found.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
      <UserRound className="size-5 text-gold-600" />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
            {subtitle}
          </p>

          <h2 className="font-display mt-2 text-3xl font-semibold text-forest-950">
            {investorName}
          </h2>
        </div>

        <StatusPill
          value={
            member.member_status
          }
        />
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Data
          label="Email"
          value={
            investorEmail
          }
        />

        <Data
          label="Phone"
          value={
            investor?.phone ??
            "—"
          }
        />

        <Data
          label="Location"
          value={
            [
              investor?.city,
              investor?.state,
              investor?.country,
            ]
              .filter(Boolean)
              .join(", ") ||
            "—"
          }
        />

        <Data
          label="Onboarding"
          value={humanize(
            investor?.onboarding_status ??
              "not_started",
          )}
        />

        <Data
          label="KYC"
          value={humanize(
            investor?.kyc_status ??
              "not_started",
          )}
        />

        <Data
          label="Tax"
          value={humanize(
            investor?.tax_status ??
              "not_started",
          )}
        />

        <Data
          label="Ownership"
          value={formatBps(
            Number(
              member.ownership_bps,
            ),
          )}
        />

        <Data
          label="Funding share"
          value={formatBps(
            Number(
              member.funding_obligation_bps,
            ),
          )}
        />

        <Data
          label="Funding obligation"
          value={formatMoney(
            Number(
              member.obligation_amount,
            ),
            currency,
          )}
        />
      </div>

      <div className="mt-7 border-t border-forest-900/10 pt-7">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
          Legal consent
        </p>

        {consent ? (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <CheckItem
                complete={
                  consent.consent_status ===
                  "accepted"
                }
                label="Consent accepted"
              />

              <CheckItem
                complete={
                  Boolean(
                    consent.joint_ownership_acknowledged,
                  )
                }
                label="50/50 ownership acknowledged"
              />

              <CheckItem
                complete={
                  Boolean(
                    consent.funding_obligation_acknowledged,
                  )
                }
                label="Funding obligation acknowledged"
              />

              <CheckItem
                complete={
                  Boolean(
                    consent.risk_disclosure_acknowledged,
                  )
                }
                label="Risk disclosure acknowledged"
              />

              <CheckItem
                complete={
                  Boolean(
                    consent.terms_acknowledged,
                  )
                }
                label="Terms acknowledged"
              />

              <CheckItem
                complete={
                  Boolean(
                    consent.signed_at,
                  )
                }
                label="Electronic signature recorded"
              />
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Data
                label="Signature"
                value={
                  consent.signature_name ??
                  "—"
                }
              />

              <Data
                label="Signed"
                value={
                  consent.signed_at
                    ? formatDate(
                        consent.signed_at,
                      )
                    : "—"
                }
              />

              <Data
                label="Agreement version"
                value={
                  consent.agreement_version ??
                  "—"
                }
              />

              <Data
                label="Disclosure version"
                value={
                  consent.disclosure_version ??
                  "—"
                }
              />
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">
              Consent not completed
            </p>

            <p className="mt-1 text-xs leading-6 text-amber-800">
              This investor has not
              completed the required
              joint investment legal
              consent.
            </p>
          </div>
        )}
      </div>

      {investor?.id ? (
        <Link
          href={`/admin/investors/${investor.id}`}
          className="focus-ring mt-7 inline-flex min-h-10 cursor-pointer items-center rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950 transition hover:bg-ivory-50"
        >
          View investor profile
        </Link>
      ) : null}
    </section>
  );
}

/* ============================================================
 * UI HELPERS
 * ============================================================ */

function HeroValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white/40">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-white">
        {value}
      </p>
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

function CheckItem({
  complete,
  label,
}: {
  complete: boolean;
  label: string;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 ${
        complete
          ? "border-emerald-200 bg-emerald-50"
          : "border-amber-200 bg-amber-50"
      }`}
    >
      {complete ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />
      ) : (
        <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-700" />
      )}

      <p
        className={`text-xs font-semibold leading-6 ${
          complete
            ? "text-emerald-900"
            : "text-amber-900"
        }`}
      >
        {label}
      </p>
    </div>
  );
}

function StatusPill({
  value,
}: {
  value: string;
}) {
  const accepted =
    value ===
    "accepted";

  return (
    <span
      className={`inline-flex self-start rounded-full px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-widest ${
        accepted
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {humanize(
        value,
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

function formatBps(
  bps: number,
) {
  return `${(
    bps / 100
  ).toFixed(
    bps % 100 ===
      0
      ? 0
      : 2,
  )}%`;
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