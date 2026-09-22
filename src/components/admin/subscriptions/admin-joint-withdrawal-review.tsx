"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  CircleDollarSign,
  FileSignature,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";

type Member = {
  member_id: string;
  investor_id: string;
  member_slot: number;
  ownership_bps: number;
  funding_obligation_bps: number;
  obligation_amount: number;
  member_status: string;
  first_name: string | null;
  last_name: string | null;
  current_account_status: string | null;
};

type Consent = {
  consent_id: string;
  member_id: string;
  investor_id: string;
  consent_status: string;
  ownership_bps_snapshot: number;
  account_status_snapshot: string | null;
  restriction_present_at_consent: boolean;
  restriction_acknowledged: boolean;
  full_liquidation_acknowledged: boolean;
  ownership_proceeds_acknowledged: boolean;
  redirected_proceeds_authorized: boolean;
  redirected_proceeds_to_investor_id: string | null;
  redirected_proceeds_acknowledgement: string | null;
  signature_name: string | null;
  signature_method: string | null;
  signed_at: string | null;
  accepted_at: string | null;
  declined_at: string | null;
};

type Position = {
  position_id: string;
  investor_id: string;
  principal_amount: number;
  currency: string;
  status: string;
  funded_at: string | null;
};

type Review = {
  withdrawal: {
    id: string;
    joint_subscription_id: string;
    opportunity_id: string;
    opportunity_title: string;
    initiated_by: string;
    withdrawal_scope: string;
    proceeds_allocation: string;
    proceeds_recipient_investor_id: string | null;
    proceeds_direction_authorized_at: string | null;
    status: string;
    reason: string | null;
    requested_at: string;
    fully_approved_at: string | null;
    submitted_for_execution_at: string | null;
    executed_at: string | null;
    executed_by: string | null;
    rejected_at: string | null;
    rejection_reason: string | null;
  };
  joint: {
    id: string;
    total_commitment_amount: number;
    currency: string;
    status: string;
    finalized_at: string | null;
  };
  members: Member[];
  consents: Consent[];
  positions: Position[];
  integrity: {
    member_one_investor_id: string;
    member_two_investor_id: string;
    active_position_count: number;
    active_position_total: number;
    commitment_matches_active_positions: boolean;
    redirect_authorization_valid: boolean;
  };
};

function money(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(cents || 0) / 100);
}

function nameOf(member?: Member) {
  if (!member) return "Investor";

  return (
    [member.first_name, member.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() || "Investor"
  );
}

function humanize(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminJointWithdrawalReview({
  initialReview,
}: {
  initialReview: Review;
}) {
  const [review, setReview] = useState(initialReview);
  const [submitting, setSubmitting] = useState<
    "approve" | "execute" | "reject" | null
  >(null);
  const [showReject, setShowReject] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const memberOne = review.members.find(
    (member) => member.member_slot === 1,
  );

  const memberTwo = review.members.find(
    (member) => member.member_slot === 2,
  );

  const memberOneConsent = review.consents.find(
    (consent) => consent.investor_id === memberOne?.investor_id,
  );

  const memberTwoConsent = review.consents.find(
    (consent) => consent.investor_id === memberTwo?.investor_id,
  );

  const redirect =
    review.withdrawal.proceeds_allocation ===
      "restricted_member_redirect" ||
    review.withdrawal.proceeds_allocation === "member_one_full";

  const redirectRecipientInvestorId =
    review.withdrawal.proceeds_recipient_investor_id;

  const redirectRecipient = redirect
    ? review.members.find(
        (member) =>
          member.investor_id === redirectRecipientInvestorId,
      )
    : undefined;

  const redirectAuthorConsent = redirect
    ? review.consents.find(
        (consent) =>
          consent.redirected_proceeds_authorized === true &&
          consent.redirected_proceeds_to_investor_id ===
            redirectRecipientInvestorId,
      )
    : undefined;

  const redirectAuthor = redirectAuthorConsent
    ? review.members.find(
        (member) =>
          member.investor_id === redirectAuthorConsent.investor_id,
      )
    : undefined;

  const allConsentsAccepted =
    memberOneConsent?.consent_status === "accepted" &&
    memberTwoConsent?.consent_status === "accepted";

  const integrityOk =
    review.integrity.commitment_matches_active_positions &&
    review.integrity.redirect_authorization_valid;

  const canApprove =
    review.withdrawal.status === "approved" &&
    allConsentsAccepted &&
    integrityOk &&
    !submitting;

  const canReject =
    ["approved", "submitted_for_execution"].includes(
      review.withdrawal.status,
    ) && !submitting;

  const memberOneAmount = useMemo(() => {
    if (
      redirect &&
      memberOne?.investor_id === redirectRecipientInvestorId
    ) {
      return Number(review.joint.total_commitment_amount);
    }

    if (redirect) {
      return 0;
    }

    return Math.round(
      (Number(review.joint.total_commitment_amount) *
        Number(memberOne?.ownership_bps || 0)) /
        10000,
    );
  }, [
    memberOne?.investor_id,
    memberOne?.ownership_bps,
    redirect,
    redirectRecipientInvestorId,
    review.joint.total_commitment_amount,
  ]);

  const memberTwoAmount = useMemo(() => {
    if (
      redirect &&
      memberTwo?.investor_id === redirectRecipientInvestorId
    ) {
      return Number(review.joint.total_commitment_amount);
    }

    if (redirect) {
      return 0;
    }

    return Math.round(
      (Number(review.joint.total_commitment_amount) *
        Number(memberTwo?.ownership_bps || 0)) /
        10000,
    );
  }, [
    memberTwo?.investor_id,
    memberTwo?.ownership_bps,
    redirect,
    redirectRecipientInvestorId,
    review.joint.total_commitment_amount,
  ]);

  async function approveForProcessing() {
    if (!canApprove) return;

    setSubmitting("approve");
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/admin/investments/joint/${review.withdrawal.joint_subscription_id}` +
          `/withdrawal/${review.withdrawal.id}/approve`,
        {
          method: "POST",
        },
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to approve withdrawal for processing.",
        );
      }

      setReview((current) => ({
        ...current,
        withdrawal: {
          ...current.withdrawal,
          status: "submitted_for_execution",
          submitted_for_execution_at:
            payload.withdrawal?.submitted_for_execution_at ??
            new Date().toISOString(),
        },
      }));

      setSuccess(
        "Administrative approval recorded. The withdrawal is ready for accounting execution. No positions or Cash Accounts have changed yet.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to approve withdrawal for processing.",
      );
    } finally {
      setSubmitting(null);
    }
  }

  async function executeWithdrawal() {
    if (
      review.withdrawal.status !== "submitted_for_execution" ||
      submitting
    ) {
      return;
    }

    setSubmitting("execute");
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/admin/investments/joint/${review.withdrawal.joint_subscription_id}` +
          `/withdrawal/${review.withdrawal.id}/execute`,
        {
          method: "POST",
        },
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload.error || "Unable to execute withdrawal.",
        );
      }

      setReview((current) => ({
        ...current,
        withdrawal: {
          ...current.withdrawal,
          status: "executed",
          executed_at:
            payload.execution?.executed_at ??
            new Date().toISOString(),
          executed_by:
            payload.execution?.executed_by ?? null,
        },
        positions: current.positions.map((position) => ({
          ...position,
          status: "redeemed",
        })),
      }));

      setSuccess(
        payload.execution?.replayed
          ? "This withdrawal had already been executed. Existing settlement evidence was returned without creating another Cash Account credit."
          : "Withdrawal executed atomically. Both positions are redeemed and the applicable Cash Account credit has been posted.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to execute withdrawal.",
      );
    } finally {
      setSubmitting(null);
    }
  }

  async function rejectWithdrawal() {
    if (!canReject || rejectionReason.trim().length < 5) return;

    setSubmitting("reject");
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/admin/investments/joint/${review.withdrawal.joint_subscription_id}` +
          `/withdrawal/${review.withdrawal.id}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rejectionReason: rejectionReason.trim(),
          }),
        },
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload.error || "Unable to reject withdrawal.",
        );
      }

      setReview((current) => ({
        ...current,
        withdrawal: {
          ...current.withdrawal,
          status: "rejected",
          rejected_at:
            payload.withdrawal?.rejected_at ??
            new Date().toISOString(),
          rejection_reason:
            payload.withdrawal?.rejection_reason ??
            rejectionReason.trim(),
        },
      }));

      setShowReject(false);
      setSuccess(
        "Withdrawal rejected. No positions or Cash Account balances were changed.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reject withdrawal.",
      );
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="space-y-8">
      <a
        href={`/admin/subscriptions/joint/${review.withdrawal.joint_subscription_id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-forest-950"
      >
        <ArrowLeft className="size-4" />
        Joint investment
      </a>

      <section className="overflow-hidden rounded-4xl bg-forest-950 text-white">
        <div className="p-7 sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
                Administrative review
              </p>

              <h1 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                Joint withdrawal
              </h1>

              <p className="mt-4 text-lg text-white/75">
                {review.withdrawal.opportunity_title}
              </p>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">
                Review both investor signatures, restriction evidence,
                proceeds direction and position integrity before approving
                this withdrawal for accounting execution.
              </p>
            </div>

            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold">
              {humanize(review.withdrawal.status)}
            </span>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-white/45">
                Joint position
              </p>
              <p className="mt-2 text-xl font-semibold">
                {money(
                  review.joint.total_commitment_amount,
                  review.joint.currency,
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-white/45">
                Scope
              </p>
              <p className="mt-2 text-xl font-semibold">
                100% liquidation
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-white/45">
                Signed approvals
              </p>
              <p className="mt-2 text-xl font-semibold">
                {review.consents.filter(
                  (consent) =>
                    consent.consent_status === "accepted",
                ).length}
                /2
              </p>
            </div>
          </div>
        </div>
      </section>

      {redirect ? (
        <section className="rounded-3xl border border-amber-300 bg-amber-50 p-6">
          <div className="flex gap-4">
            <ShieldAlert className="mt-0.5 size-6 shrink-0 text-amber-700" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">
                Restricted-member proceeds direction
              </p>
              <h2 className="mt-2 text-xl font-semibold text-forest-950">
                100% of proceeds are designated for{" "}
                {nameOf(redirectRecipient)}
              </h2>
              <p className="mt-2 max-w-4xl text-sm leading-7 text-stone-700">
                {nameOf(redirectAuthor)} was restricted at consent and
                explicitly signed authorization directing their redemption
                proceeds to {nameOf(redirectRecipient)}. Restriction by
                itself did not create this authorization. Confirm the signed
                evidence below before approving the withdrawal for execution.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex gap-4">
            <ShieldCheck className="mt-0.5 size-6 shrink-0 text-emerald-700" />
            <div>
              <h2 className="font-semibold text-forest-950">
                Standard 50/50 proceeds allocation
              </h2>
              <p className="mt-2 text-sm leading-7 text-stone-600">
                No special proceeds direction is recorded. Subject to
                execution, each investor receives their ownership share.
              </p>
            </div>
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {[memberOne, memberTwo].map((member) => {
          if (!member) return null;

          const consent = review.consents.find(
            (item) => item.investor_id === member.investor_id,
          );

          const isRestricted =
            consent?.restriction_present_at_consent === true;

          return (
            <section
              key={member.member_id}
              className="rounded-4xl border border-forest-900/10 bg-white p-6 sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="flex size-11 items-center justify-center rounded-full bg-forest-950 text-white">
                    <UserRound className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-stone-400">
                      Member {member.member_slot}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-forest-950">
                      {nameOf(member)}
                    </h2>
                  </div>
                </div>

                {consent?.consent_status === "accepted" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <BadgeCheck className="size-3.5" />
                    Signed
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    {humanize(consent?.consent_status || "pending")}
                  </span>
                )}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-xs uppercase tracking-wider text-stone-400">
                    Ownership
                  </p>
                  <p className="mt-1 font-semibold text-forest-950">
                    {(member.ownership_bps / 100).toFixed(0)}%
                  </p>
                </div>

                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-xs uppercase tracking-wider text-stone-400">
                    Account at consent
                  </p>
                  <p className="mt-1 font-semibold text-forest-950">
                    {humanize(
                      consent?.account_status_snapshot || "unknown",
                    )}
                  </p>
                </div>
              </div>

              {isRestricted ? (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  <div className="flex gap-2">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    Restricted at the time this consent was signed.
                  </div>
                </div>
              ) : null}

              <div className="mt-6 border-t border-forest-900/10 pt-5">
                <div className="flex gap-3">
                  <FileSignature className="mt-0.5 size-5 shrink-0 text-gold-700" />
                  <div>
                    <p className="text-sm font-semibold text-forest-950">
                      {consent?.signature_name || "No signature"}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {consent?.signed_at
                        ? `Signed ${formatDate(consent.signed_at)}`
                        : "Not signed"}
                    </p>
                  </div>
                </div>
              </div>

              {consent?.redirected_proceeds_authorized ? (
                <div className="mt-5 rounded-2xl border border-gold-300 bg-gold-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gold-700">
                    Signed proceeds authorization
                  </p>
                  <p className="mt-3 text-sm leading-7 text-stone-700">
                    {consent.redirected_proceeds_acknowledgement}
                  </p>
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      <section className="rounded-4xl border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <CircleDollarSign className="size-6 text-gold-700" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
              Execution preview
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-forest-950">
              Cash Account destination
            </h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-ivory-50 p-5">
            <p className="text-sm font-semibold text-forest-950">
              {nameOf(memberOne)}
            </p>
            <p className="mt-2 text-2xl font-semibold text-forest-950">
              {money(memberOneAmount, review.joint.currency)}
            </p>
            <p className="mt-1 text-xs text-stone-500">
              Member 1 Cash Account
            </p>
          </div>

          <div className="rounded-2xl bg-ivory-50 p-5">
            <p className="text-sm font-semibold text-forest-950">
              {nameOf(memberTwo)}
            </p>
            <p className="mt-2 text-2xl font-semibold text-forest-950">
              {money(memberTwoAmount, review.joint.currency)}
            </p>
            <p className="mt-1 text-xs text-stone-500">
              Member 2 Cash Account
            </p>
          </div>
        </div>

        <p className="mt-5 text-xs leading-6 text-stone-500">
          Preview only. Administrative approval on this screen does not
          redeem positions or credit Cash Accounts. The accounting
          transaction is performed separately and atomically.
        </p>
      </section>

      <section className="rounded-4xl border border-forest-900/10 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
          Integrity review
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="flex gap-3 rounded-2xl bg-stone-50 p-4">
            {review.integrity.commitment_matches_active_positions ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" />
            ) : (
              <XCircle className="mt-0.5 size-5 shrink-0 text-red-700" />
            )}
            <div>
              <p className="text-sm font-semibold text-forest-950">
                Active position principal
              </p>
              <p className="mt-1 text-xs leading-5 text-stone-500">
                {review.integrity.active_position_count} active positions
                totaling{" "}
                {money(
                  review.integrity.active_position_total,
                  review.joint.currency,
                )}
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-2xl bg-stone-50 p-4">
            {review.integrity.redirect_authorization_valid ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" />
            ) : (
              <XCircle className="mt-0.5 size-5 shrink-0 text-red-700" />
            )}
            <div>
              <p className="text-sm font-semibold text-forest-950">
                Proceeds authorization
              </p>
              <p className="mt-1 text-xs leading-5 text-stone-500">
                {review.integrity.redirect_authorization_valid
                  ? "Authoritative proceeds direction is internally consistent."
                  : "Proceeds direction failed integrity validation."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-4xl border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-stone-400">
              Fully approved
            </p>
            <p className="mt-2 font-semibold text-forest-950">
              {formatDate(review.withdrawal.fully_approved_at)}
            </p>
          </div>

          {review.withdrawal.status === "approved" ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowReject(true)}
                disabled={!canReject}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-red-200 px-6 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40"
              >
                <XCircle className="size-4" />
                Reject withdrawal
              </button>

              <button
                type="button"
                onClick={approveForProcessing}
                disabled={!canApprove}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-forest-950 px-7 text-sm font-semibold text-white hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting === "approve" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                Approve for processing
              </button>
            </div>
          ) : review.withdrawal.status ===
            "submitted_for_execution" ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setShowReject(true)}
                disabled={!canReject}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-red-200 px-6 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40"
              >
                <XCircle className="size-4" />
                Reject withdrawal
              </button>

              <button
                type="button"
                onClick={executeWithdrawal}
                disabled={Boolean(submitting)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-forest-950 px-7 text-sm font-semibold text-white hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting === "execute" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CircleDollarSign className="size-4" />
                )}
                Execute withdrawal
              </button>
            </div>
          ) : review.withdrawal.status === "executed" ? (
            <div className="rounded-2xl bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4" />
                Withdrawal executed
              </div>
              <p className="mt-1 text-xs font-normal text-emerald-700">
                {formatDate(review.withdrawal.executed_at)}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          {success}
        </div>
      ) : null}

      {showReject ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-forest-950/55 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-lg rounded-4xl bg-white p-6 shadow-2xl sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-700">
              Administrative rejection
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-forest-950">
              Reject this withdrawal?
            </h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Rejection closes this request without redeeming either
              position or moving any Cash Account funds.
            </p>

            <label className="mt-6 block text-sm font-semibold text-forest-950">
              Rejection reason
              <textarea
                value={rejectionReason}
                onChange={(event) =>
                  setRejectionReason(event.target.value)
                }
                rows={4}
                className="mt-2 w-full resize-none rounded-xl border border-forest-900/15 p-4 text-sm font-normal outline-none focus:border-red-300 focus:ring-4 focus:ring-red-100"
                placeholder="Explain why this withdrawal cannot proceed."
              />
            </label>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowReject(false)}
                disabled={Boolean(submitting)}
                className="min-h-11 flex-1 rounded-full border border-forest-900/10 px-5 text-sm font-semibold text-forest-950"
              >
                Go back
              </button>

              <button
                type="button"
                onClick={rejectWithdrawal}
                disabled={
                  Boolean(submitting) ||
                  rejectionReason.trim().length < 5
                }
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-40"
              >
                {submitting === "reject" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                Confirm rejection
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
