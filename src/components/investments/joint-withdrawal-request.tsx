"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  FileSignature,
  Loader2,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

type JointWithdrawalRequestProps = {
  jointSubscriptionId: string;
  opportunityTitle: string;
  totalCommitmentAmountCents: number;
  currency: string;

  actorMemberSlot: number;
  actorFirstName?: string | null;
  actorLastName?: string | null;
  actorAccountStatus?: string | null;

  otherInvestorFirstName?: string | null;
  otherInvestorLastName?: string | null;

  disabled?: boolean;
  disabledReason?: string | null;

  onCreated?: (result: WithdrawalCreated) => void;
};

type WithdrawalCreated = {
  withdrawalId: string;
  status: string;
  proceedsAllocation: string;
  proceedsRecipientInvestorId: string | null;
  restrictedMemberRedirected: boolean;
};

type ApiResponse = {
  success?: boolean;
  withdrawal?: {
    id?: string;
    withdrawalId?: string;
    status?: string;
    withdrawalStatus?: string;
    initiatorConsentStatus?: string;
    proceedsAllocation?: string;
    proceedsRecipientInvestorId?: string | null;
    restrictedMemberRedirected?: boolean;
  };
  communications?: {
    notificationsCreated?: number;
    emailsSent?: number;
  };
  error?: string;
};

function money(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(cents || 0) / 100);
}

function person(
  first: string | null | undefined,
  last: string | null | undefined,
  fallback: string,
) {
  return [first, last].filter(Boolean).join(" ").trim() || fallback;
}

export default function JointWithdrawalRequest({
  jointSubscriptionId,
  opportunityTitle,
  totalCommitmentAmountCents,
  currency,
  actorMemberSlot,
  actorFirstName,
  actorLastName,
  actorAccountStatus,
  otherInvestorFirstName,
  otherInvestorLastName,
  disabled = false,
  disabledReason = null,
  onCreated,
}: JointWithdrawalRequestProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [signatureName, setSignatureName] = useState("");

  const [fullLiquidationAcknowledged, setFullLiquidationAcknowledged] =
    useState(false);
  const [proceedsAcknowledged, setProceedsAcknowledged] =
    useState(false);
  const [redirectAcknowledged, setRedirectAcknowledged] =
    useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<WithdrawalCreated | null>(
    null,
  );

  const actorName = person(
    actorFirstName,
    actorLastName,
    "Investor",
  );

  const otherInvestorName = person(
    otherInvestorFirstName,
    otherInvestorLastName,
    "Co-investor",
  );

  const normalizedActorStatus =
    String(actorAccountStatus || "").toLowerCase();

  const actorRestricted =
    normalizedActorStatus === "suspended" ||
    normalizedActorStatus === "disabled";

  /*
   * Slot-neutral presentation rule.
   * The database RPC is the security boundary and independently
   * verifies the other member and account statuses.
   */
  const restrictedInitiator = actorRestricted;

  const actorShareCents = Math.round(
    Number(totalCommitmentAmountCents) / 2,
  );

  const redirectStatement = useMemo(
    () =>
      `I understand that my Tevuah Reserve account is currently restricted. ` +
      `I explicitly authorize my portion of the redemption proceeds from this full joint ` +
      `withdrawal to be credited to ${otherInvestorName}'s Tevuah Reserve Cash Account. ` +
      `I understand that this authorization does not remove or modify my account restriction.`,
    [otherInvestorName],
  );

  const canSubmit =
    !disabled &&
    !submitting &&
    signatureName.trim().length >= 2 &&
    fullLiquidationAcknowledged &&
    proceedsAcknowledged &&
    (!restrictedInitiator || redirectAcknowledged);

  function resetForm() {
    setReason("");
    setSignatureName("");
    setFullLiquidationAcknowledged(false);
    setProceedsAcknowledged(false);
    setRedirectAcknowledged(false);
    setError(null);
  }

  function closeModal() {
    if (submitting) return;

    setOpen(false);

    if (!created) {
      resetForm();
    }
  }

  async function submitWithdrawal() {
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/investments/joint/${encodeURIComponent(
          jointSubscriptionId,
        )}/withdrawal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            reason: reason.trim() || null,
            signatureName: signatureName.trim(),
            redirectedProceedsAcknowledgement:
              restrictedInitiator
                ? redirectStatement
                : null,
          }),
        },
      );

      const payload = (await response
        .json()
        .catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        throw new Error(
          payload.error || "Unable to request withdrawal.",
        );
      }

      const result = payload.withdrawal;

      const withdrawalId =
        result?.id || result?.withdrawalId || "";

      if (!withdrawalId) {
        throw new Error(
          "Withdrawal was created without a valid withdrawal ID.",
        );
      }

      const next: WithdrawalCreated = {
        withdrawalId,
        status:
          result?.status ||
          result?.withdrawalStatus ||
          "awaiting_member_approval",
        proceedsAllocation:
          result?.proceedsAllocation || "ownership_split",
        proceedsRecipientInvestorId:
          result?.proceedsRecipientInvestorId ?? null,
        restrictedMemberRedirected:
          result?.restrictedMemberRedirected === true,
      };

      setCreated(next);
      onCreated?.(next);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to request withdrawal.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (created) {
    return (
      <section className="rounded-4xl border border-emerald-200 bg-emerald-50 p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="size-5 text-emerald-700" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Withdrawal requested
            </p>

            <h3 className="font-display mt-2 text-2xl font-semibold text-forest-950">
              Co-investor approval is required
            </h3>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Your signed request to liquidate the complete joint
              position has been recorded. No position has been
              redeemed and no Cash Account balance has changed yet.
              The other joint investor must review and approve the
              request before administrative processing can begin.
            </p>

            {created.restrictedMemberRedirected ? (
              <div className="mt-5 rounded-2xl border border-gold-500/30 bg-white/70 p-4">
                <p className="text-sm font-semibold text-forest-950">
                  Restricted-member proceeds direction recorded
                </p>

                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Your signed authorization directing your redemption
                  proceeds to {otherInvestorName}&apos;s Tevuah Reserve
                  Cash Account was recorded with this request.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="rounded-4xl border border-forest-900/10 bg-white p-6 sm:p-7">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
              Joint withdrawal
            </p>

            <h3 className="font-display mt-2 text-2xl font-semibold text-forest-950">
              Withdraw the full joint investment
            </h3>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              A joint withdrawal liquidates 100% of both members&apos;
              positions. Your co-investor must explicitly approve and
              sign before Tevuah Reserve can process the withdrawal.
            </p>

            {disabled && disabledReason ? (
              <p className="mt-3 text-sm font-medium text-stone-500">
                {disabledReason}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => {
              setError(null);
              setOpen(true);
            }}
            disabled={disabled}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CircleDollarSign className="size-4" />
            Request withdrawal
          </button>
        </div>
      </section>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-forest-950/60 p-4 backdrop-blur-sm sm:items-center">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-4xl bg-ivory-50 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b border-forest-900/10 bg-ivory-50/95 px-6 py-5 backdrop-blur sm:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
                  Full joint withdrawal
                </p>

                <h2 className="font-display mt-2 text-3xl font-semibold text-forest-950">
                  Review and sign
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                aria-label="Close withdrawal request"
                className="flex size-10 shrink-0 items-center justify-center rounded-full border border-forest-900/10 bg-white text-forest-950 transition hover:bg-stone-50 disabled:opacity-40"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              <section className="overflow-hidden rounded-3xl bg-forest-950 p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">
                  {opportunityTitle}
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                    <p className="text-xs uppercase tracking-wider text-white/45">
                      Joint position
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      {money(
                        totalCommitmentAmountCents,
                        currency,
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                    <p className="text-xs uppercase tracking-wider text-white/45">
                      Withdrawal
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      100%
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                    <p className="text-xs uppercase tracking-wider text-white/45">
                      Your position
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      {money(actorShareCents, currency)}
                    </p>
                  </div>
                </div>
              </section>

              {actorRestricted ? (
                <section className="rounded-3xl border border-gold-500/30 bg-gold-50 p-5">
                  <div className="flex gap-4">
                    <AlertTriangle className="mt-0.5 size-5 shrink-0 text-gold-700" />

                    <div>
                      <p className="font-semibold text-forest-950">
                        Your account is currently restricted
                      </p>

                      <p className="mt-2 text-sm leading-7 text-stone-600">
                        You may use this narrowly scoped joint
                        withdrawal process. This does not remove,
                        suspend or otherwise modify your account
                        restriction.
                      </p>
                    </div>
                  </div>
                </section>
              ) : null}

              <section className="rounded-3xl border border-forest-900/10 bg-white p-5 sm:p-6">
                <div className="flex gap-4">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-forest-800" />

                  <div>
                    <p className="font-semibold text-forest-950">
                      Proceeds treatment
                    </p>

                    {restrictedInitiator ? (
                      <>
                        <p className="mt-2 text-sm leading-7 text-stone-600">
                          Because your account is currently restricted, this
                          withdrawal can proceed only if you explicitly
                          authorize your share of the redemption proceeds
                          to the other active joint investor below.
                        </p>

                        <div className="mt-4 rounded-2xl border border-gold-500/30 bg-gold-50 p-4">
                          <p className="text-sm font-semibold text-forest-950">
                            If this withdrawal is later fully approved
                            and executed:
                          </p>

                          <p className="mt-2 text-sm leading-6 text-stone-700">
                            {otherInvestorName} will receive 100% of the
                            joint redemption proceeds in their Tevuah
                            Reserve Cash Account. Your Cash Account
                            will receive $0 from this withdrawal.
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="mt-2 text-sm leading-7 text-stone-600">
                        If this withdrawal is fully approved and
                        executed, proceeds remain allocated according
                        to the joint investment&apos;s 50/50 ownership
                        structure. Each investor receives their
                        applicable 50% redemption proceeds in their
                        own Tevuah Reserve Cash Account.
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-forest-900/10 bg-white p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <UserRound className="mt-0.5 size-5 shrink-0 text-gold-700" />

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
                      Requester
                    </p>
                    <p className="mt-2 font-semibold text-forest-950">
                      {actorName}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      Joint member {actorMemberSlot}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-forest-900/10 bg-white p-5 sm:p-6">
                <label
                  htmlFor="joint-withdrawal-reason"
                  className="text-sm font-semibold text-forest-950"
                >
                  Reason for withdrawal{" "}
                  <span className="font-normal text-stone-400">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="joint-withdrawal-reason"
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value)
                  }
                  rows={4}
                  maxLength={1000}
                  placeholder="You may add a short reason for the withdrawal request."
                  className="mt-3 w-full resize-none rounded-2xl border border-forest-900/15 bg-white p-4 text-sm text-forest-950 outline-none transition focus:border-gold-600 focus:ring-4 focus:ring-gold-500/10"
                />
              </section>

              <section className="rounded-3xl border border-forest-900/10 bg-white p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <FileSignature className="mt-0.5 size-5 shrink-0 text-gold-700" />

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
                      Electronic consent
                    </p>
                    <h3 className="font-display mt-2 text-2xl font-semibold text-forest-950">
                      Confirm and sign
                    </h3>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <label className="flex cursor-pointer gap-3 rounded-2xl border border-forest-900/10 p-4">
                    <input
                      type="checkbox"
                      checked={fullLiquidationAcknowledged}
                      onChange={(event) =>
                        setFullLiquidationAcknowledged(
                          event.target.checked,
                        )
                      }
                      className="mt-1 size-4"
                    />

                    <span className="text-sm leading-6 text-stone-600">
                      I understand that I am requesting liquidation
                      of 100% of this joint investment and that, if
                      the request is fully approved and executed,
                      both active joint positions will be redeemed.
                    </span>
                  </label>

                  <label className="flex cursor-pointer gap-3 rounded-2xl border border-forest-900/10 p-4">
                    <input
                      type="checkbox"
                      checked={proceedsAcknowledged}
                      onChange={(event) =>
                        setProceedsAcknowledged(
                          event.target.checked,
                        )
                      }
                      className="mt-1 size-4"
                    />

                    <span className="text-sm leading-6 text-stone-600">
                      I have reviewed and understand the proceeds
                      treatment displayed above. I understand that
                      submitting this request does not itself redeem
                      either position or move Cash Account funds.
                    </span>
                  </label>

                  {restrictedInitiator ? (
                    <label className="flex cursor-pointer gap-3 rounded-2xl border border-gold-500/30 bg-gold-50 p-4">
                      <input
                        type="checkbox"
                        checked={redirectAcknowledged}
                        onChange={(event) =>
                          setRedirectAcknowledged(
                            event.target.checked,
                          )
                        }
                        className="mt-1 size-4"
                      />

                      <span className="text-sm font-medium leading-7 text-stone-700">
                        {redirectStatement}
                      </span>
                    </label>
                  ) : null}

                  <div>
                    <label
                      htmlFor="joint-withdrawal-signature"
                      className="text-sm font-semibold text-forest-950"
                    >
                      Type your legal name to sign
                    </label>

                    <input
                      id="joint-withdrawal-signature"
                      value={signatureName}
                      onChange={(event) =>
                        setSignatureName(event.target.value)
                      }
                      placeholder={actorName}
                      autoComplete="name"
                      className="mt-2 min-h-12 w-full rounded-xl border border-forest-900/15 bg-white px-4 text-sm text-forest-950 outline-none transition focus:border-gold-600 focus:ring-4 focus:ring-gold-500/10"
                    />
                  </div>
                </div>
              </section>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-3 border-t border-forest-900/10 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="min-h-12 rounded-full border border-forest-900/10 bg-white px-6 text-sm font-semibold text-forest-950 transition hover:bg-stone-50 disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={submitWithdrawal}
                  disabled={!canSubmit}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-forest-950 px-7 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <FileSignature className="size-4" />
                  )}

                  Request & sign withdrawal
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}