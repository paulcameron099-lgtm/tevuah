"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CircleDollarSign,
  FileSignature,
  Loader2,
  ShieldCheck,
  UserRoundCheck,
  XCircle,
} from "lucide-react";

type Review = {
  withdrawal_id: string;
  joint_subscription_id: string;
  opportunity_id: string;
  opportunity_title: string;
  withdrawal_status: string;
  withdrawal_scope: string;
  proceeds_allocation: string;
  proceeds_recipient_investor_id: string | null;
  total_commitment_amount: number;
  currency: string;
  requested_at: string;
  fully_approved_at: string | null;
  initiated_by: string;

  actor_investor_id: string;
  actor_member_id: string;
  actor_member_slot: number;
  actor_first_name: string | null;
  actor_last_name: string | null;
  actor_account_status: string | null;
  actor_is_restricted: boolean;
  actor_consent_status: string;
  actor_ownership_bps: number;

  other_investor_id: string;
  other_member_id: string;
  other_member_slot: number;
  other_first_name: string | null;
  other_last_name: string | null;
  other_account_status: string | null;
  other_consent_status: string;
  other_ownership_bps: number;

  redirect_required: boolean;
  redirect_recipient_investor_id: string | null;
  redirect_recipient_first_name: string | null;
  redirect_recipient_last_name: string | null;
};

function money(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(cents || 0) / 100);
}

function person(first: string | null, last: string | null, fallback: string) {
  return [first, last].filter(Boolean).join(" ").trim() || fallback;
}

function statusLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function JointWithdrawalReview({
  initialReview,
}: {
  initialReview: Review;
}) {
  const [review, setReview] = useState(initialReview);
  const [signatureName, setSignatureName] = useState("");
  const [fullLiquidationAcknowledged, setFullLiquidationAcknowledged] =
    useState(false);
  const [proceedsAcknowledged, setProceedsAcknowledged] = useState(false);
  const [redirectAcknowledged, setRedirectAcknowledged] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [showDecline, setShowDecline] = useState(false);
  const [submitting, setSubmitting] = useState<"approve" | "decline" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const actorName = person(
    review.actor_first_name,
    review.actor_last_name,
    "Investor",
  );

  const otherName = person(
    review.other_first_name,
    review.other_last_name,
    "Co-investor",
  );

  const redirectRecipientName = person(
    review.redirect_recipient_first_name,
    review.redirect_recipient_last_name,
    "Investor A",
  );

  const actorShare = Math.round(
    (Number(review.total_commitment_amount) *
      Number(review.actor_ownership_bps)) /
      10000,
  );

  const canAct =
    review.withdrawal_status === "awaiting_member_approval" &&
    review.actor_consent_status === "pending";

  const isRequester = review.initiated_by === review.actor_investor_id;

  const redirectStatement = useMemo(
    () =>
      `I understand that my Tevuah Reserve account is currently restricted. ` +
      `I explicitly authorize my portion of the redemption proceeds from this full joint ` +
      `withdrawal to be credited to ${redirectRecipientName}'s Tevuah Reserve Cash Account. ` +
      `I understand that this authorization does not remove or modify my account restriction.`,
    [redirectRecipientName],
  );

  const canApprove =
    canAct &&
    signatureName.trim().length >= 2 &&
    fullLiquidationAcknowledged &&
    proceedsAcknowledged &&
    (!review.redirect_required || redirectAcknowledged) &&
    !submitting;

  async function approve() {
    if (!canApprove) return;

    setSubmitting("approve");
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/investments/joint/${review.joint_subscription_id}/withdrawal/${review.withdrawal_id}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            signatureName: signatureName.trim(),
            redirectedProceedsAcknowledgement: review.redirect_required
              ? redirectStatement
              : null,
          }),
        },
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to approve withdrawal.");
      }

      setReview((current) => ({
        ...current,
        actor_consent_status: "accepted",
        withdrawal_status:
          payload.withdrawal?.withdrawal_status ?? "approved",
        proceeds_allocation:
          payload.withdrawal?.proceeds_allocation ??
          current.proceeds_allocation,
        proceeds_recipient_investor_id:
          payload.withdrawal?.proceeds_recipient_investor_id ??
          current.proceeds_recipient_investor_id,
        fully_approved_at:
          payload.withdrawal?.fully_approved_at ??
          current.fully_approved_at,
      }));

      setSuccess(
        "Your signed approval has been recorded. The withdrawal is now awaiting Tevuah Reserve administrative review.",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to approve withdrawal.",
      );
    } finally {
      setSubmitting(null);
    }
  }

  async function decline() {
    if (!canAct || submitting) return;

    setSubmitting("decline");
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/investments/joint/${review.joint_subscription_id}/withdrawal/${review.withdrawal_id}/decline`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: declineReason.trim() || null,
          }),
        },
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to decline withdrawal.");
      }

      setReview((current) => ({
        ...current,
        actor_consent_status: "declined",
        withdrawal_status: "rejected",
      }));

      setShowDecline(false);
      setSuccess(
        "You declined the withdrawal request. No positions or Cash Account balances were changed.",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to decline withdrawal.",
      );
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="space-y-8">
      <a
        href={`/dashboard/investments/joint/${review.joint_subscription_id}`}
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
                Joint investment withdrawal
              </p>

              <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                Review full withdrawal
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
                Review the liquidation scope, proceeds treatment and consent
                terms before recording your decision.
              </p>
            </div>

            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold">
              {statusLabel(review.withdrawal_status)}
            </span>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-white/45">
                Joint position
              </p>
              <p className="mt-2 text-xl font-semibold">
                {money(
                  Number(review.total_commitment_amount),
                  review.currency,
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-white/45">
                Withdrawal scope
              </p>
              <p className="mt-2 text-xl font-semibold">100% liquidation</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-white/45">
                Your ownership
              </p>
              <p className="mt-2 text-xl font-semibold">
                {(review.actor_ownership_bps / 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      </section>

      {review.actor_is_restricted ? (
        <section className="rounded-3xl border border-gold-500/30 bg-gold-50 p-6">
          <div className="flex gap-4">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-gold-700" />
            <div>
              <h2 className="font-semibold text-forest-950">
                Restricted account consent
              </h2>
              <p className="mt-2 text-sm leading-7 text-stone-600">
                Your account restriction remains active. You are permitted to
                review and record your decision on this specific joint
                withdrawal. This consent does not restore or expand any other
                account permissions.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-4xl border border-forest-900/10 bg-white p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
            Withdrawal terms
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
            What you are approving
          </h2>

          <div className="mt-7 space-y-4">
            <div className="flex gap-4 rounded-2xl bg-ivory-50 p-5">
              <CircleDollarSign className="mt-0.5 size-5 shrink-0 text-forest-800" />
              <div>
                <p className="font-semibold text-forest-950">
                  Entire joint position
                </p>
                <p className="mt-1 text-sm leading-6 text-stone-600">
                  Approval authorizes liquidation of the complete{" "}
                  {money(
                    Number(review.total_commitment_amount),
                    review.currency,
                  )}{" "}
                  joint position, subject to final administrative approval.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl bg-ivory-50 p-5">
              <UserRoundCheck className="mt-0.5 size-5 shrink-0 text-forest-800" />
              <div>
                <p className="font-semibold text-forest-950">
                  Your position
                </p>
                <p className="mt-1 text-sm leading-6 text-stone-600">
                  Your recorded ownership is{" "}
                  {(review.actor_ownership_bps / 100).toFixed(0)}%, representing{" "}
                  {money(actorShare, review.currency)} of current principal.
                </p>
              </div>
            </div>

            {review.redirect_required ? (
              <div className="rounded-2xl border border-gold-500/30 bg-gold-50 p-5">
                <div className="flex gap-4">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold-700" />
                  <div>
                    <p className="font-semibold text-forest-950">
                      Proceeds direction authorization
                    </p>
                    <p className="mt-2 text-sm leading-7 text-stone-700">
                      Because your account is currently restricted, approving
                      this withdrawal also requires your explicit authorization
                      for your portion of the redemption proceeds to be
                      credited to{" "}
                      <strong>{redirectRecipientName}</strong>&apos;s Tevuah
                      Reserve Cash Account.
                    </p>
                    <p className="mt-3 text-sm leading-7 text-stone-600">
                      Restriction alone does not authorize this transfer. It
                      occurs only if you check the authorization below and
                      provide your typed signature.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex gap-4 rounded-2xl bg-ivory-50 p-5">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-forest-800" />
                <div>
                  <p className="font-semibold text-forest-950">
                    50/50 proceeds treatment
                  </p>
                  <p className="mt-1 text-sm leading-6 text-stone-600">
                    Subject to final approval, proceeds remain allocated
                    according to the joint investment&apos;s 50/50 ownership
                    structure.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-4xl border border-forest-900/10 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
              Participants
            </p>

            <div className="mt-5 space-y-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-400">
                  You
                </p>
                <p className="mt-1 font-semibold text-forest-950">{actorName}</p>
                <p className="mt-1 text-sm text-stone-500">
                  Member {review.actor_member_slot} ·{" "}
                  {statusLabel(review.actor_consent_status)}
                </p>
              </div>

              <div className="border-t border-forest-900/10 pt-5">
                <p className="text-xs uppercase tracking-wider text-stone-400">
                  Co-investor
                </p>
                <p className="mt-1 font-semibold text-forest-950">{otherName}</p>
                <p className="mt-1 text-sm text-stone-500">
                  Member {review.other_member_slot} ·{" "}
                  {statusLabel(review.other_consent_status)}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-4xl border border-forest-900/10 bg-white p-6">
            <p className="text-xs uppercase tracking-wider text-stone-400">
              Requested
            </p>
            <p className="mt-2 font-semibold text-forest-950">
              {new Intl.DateTimeFormat("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(review.requested_at))}
            </p>
            <p className="mt-3 text-sm leading-6 text-stone-500">
              {isRequester
                ? "You initiated this withdrawal request."
                : `${otherName} initiated this withdrawal request.`}
            </p>
          </section>
        </aside>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          <p>{success}</p>
        </div>
      ) : null}

      {canAct ? (
        <section className="rounded-4xl border border-forest-900/10 bg-white p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <FileSignature className="mt-1 size-6 shrink-0 text-gold-700" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
                Electronic consent
              </p>
              <h2 className="font-display mt-2 text-3xl font-semibold text-forest-950">
                Approve and sign
              </h2>
            </div>
          </div>

          <div className="mt-7 space-y-4">
            <label className="flex cursor-pointer gap-3 rounded-2xl border border-forest-900/10 p-4">
              <input
                type="checkbox"
                checked={fullLiquidationAcknowledged}
                onChange={(e) =>
                  setFullLiquidationAcknowledged(e.target.checked)
                }
                className="mt-1 size-4"
              />
              <span className="text-sm leading-6 text-stone-600">
                I understand that this request seeks liquidation of 100% of the
                joint investment and, if finally approved and executed, both
                active joint positions will be redeemed.
              </span>
            </label>

            <label className="flex cursor-pointer gap-3 rounded-2xl border border-forest-900/10 p-4">
              <input
                type="checkbox"
                checked={proceedsAcknowledged}
                onChange={(e) => setProceedsAcknowledged(e.target.checked)}
                className="mt-1 size-4"
              />
              <span className="text-sm leading-6 text-stone-600">
                I have reviewed and understand the proceeds treatment displayed
                above.
              </span>
            </label>

            {review.redirect_required ? (
              <label className="flex cursor-pointer gap-3 rounded-2xl border border-gold-500/30 bg-gold-50 p-4">
                <input
                  type="checkbox"
                  checked={redirectAcknowledged}
                  onChange={(e) => setRedirectAcknowledged(e.target.checked)}
                  className="mt-1 size-4"
                />
                <span className="text-sm font-medium leading-6 text-stone-700">
                  {redirectStatement}
                </span>
              </label>
            ) : null}

            <div>
              <label
                htmlFor="withdrawal-signature"
                className="text-sm font-semibold text-forest-950"
              >
                Type your legal name to sign
              </label>
              <input
                id="withdrawal-signature"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder={actorName}
                autoComplete="name"
                className="mt-2 min-h-12 w-full rounded-xl border border-forest-900/15 bg-white px-4 text-sm text-forest-950 outline-none transition focus:border-gold-600 focus:ring-4 focus:ring-gold-500/10"
              />
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={approve}
              disabled={!canApprove}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting === "approve" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Approve & sign withdrawal
            </button>

            <button
              type="button"
              onClick={() => setShowDecline(true)}
              disabled={Boolean(submitting)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-red-200 px-6 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-40"
            >
              <XCircle className="size-4" />
              Decline
            </button>
          </div>
        </section>
      ) : (
        <section className="rounded-4xl border border-forest-900/10 bg-white p-7">
          <div className="flex gap-4">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-forest-800" />
            <div>
              <h2 className="font-semibold text-forest-950">
                Your decision has been recorded
              </h2>
              <p className="mt-2 text-sm leading-7 text-stone-600">
                Your consent status is{" "}
                <strong>{statusLabel(review.actor_consent_status)}</strong>.
                The withdrawal status is{" "}
                <strong>{statusLabel(review.withdrawal_status)}</strong>.
              </p>
            </div>
          </div>
        </section>
      )}

      {showDecline && canAct ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-forest-950/55 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-lg rounded-4xl bg-white p-6 shadow-2xl sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-700">
              Decline withdrawal
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              Confirm your decision
            </h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Declining closes this withdrawal request. No position will be
              redeemed and no Cash Account balance will change.
            </p>

            <label className="mt-6 block text-sm font-semibold text-forest-950">
              Reason (optional)
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={4}
                className="mt-2 w-full resize-none rounded-xl border border-forest-900/15 p-4 text-sm font-normal outline-none focus:border-red-300 focus:ring-4 focus:ring-red-100"
                placeholder="Add a reason for declining this request."
              />
            </label>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowDecline(false)}
                className="min-h-11 flex-1 rounded-full border border-forest-900/10 px-5 text-sm font-semibold text-forest-950"
              >
                Go back
              </button>
              <button
                type="button"
                onClick={decline}
                disabled={Boolean(submitting)}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-40"
              >
                {submitting === "decline" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                Confirm decline
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
