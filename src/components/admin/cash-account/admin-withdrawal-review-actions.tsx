"use client";

import {
  CheckCircle2,
  Clock3,
  Loader2,
  Send,
  XCircle,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

type Props = {
  withdrawalId: string;

  status:
    | "submitted"
    | "under_review"
    | "processing"
    | "paid"
    | "rejected"
    | "cancelled";
};

export function AdminWithdrawalReviewActions({
  withdrawalId,
  status,
}: Props) {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] =
    useState<
      string | null
    >(null);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const [
    success,
    setSuccess,
  ] =
    useState<
      string | null
    >(null);

  const [
    rejectionReason,
    setRejectionReason,
  ] =
    useState("");

  const [
    paymentReference,
    setPaymentReference,
  ] =
    useState("");

  const [
    paymentNote,
    setPaymentNote,
  ] =
    useState("");

  async function perform(
    action:
      | "review"
      | "reject"
      | "approve"
      | "paid",
  ) {
    setError(null);
    setSuccess(null);
    setLoading(action);

    try {
      const body =
        action ===
        "reject"
          ? {
              reason:
                rejectionReason,
            }
          : action ===
            "paid"
          ? {
              paymentReference,
              paymentNote,
            }
          : {};

      const response =
        await fetch(
          `/api/admin/cash-account/withdrawals/${withdrawalId}/${action}`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                body,
              ),
          },
        );

      const result =
        (await response.json()) as {
          error?: string;
          message?: string;
        };

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Unable to update withdrawal.",
        );
      }

      setSuccess(
        result.message ??
          "Withdrawal updated.",
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update withdrawal.",
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-5">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {success}
        </div>
      ) : null}

      {status ===
      "submitted" ? (
        <button
          type="button"
          disabled={
            loading !==
            null
          }
          onClick={() =>
            void perform(
              "review",
            )
          }
          className="focus-ring inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ===
          "review" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Clock3 className="size-4" />
          )}

          Start review
        </button>
      ) : null}

      {status ===
        "submitted" ||
      status ===
        "under_review" ? (
        <>
          <div>
            <label className="text-xs font-semibold text-forest-950">
              Rejection reason
            </label>

            <textarea
              rows={4}
              value={
                rejectionReason
              }
              onChange={(
                event,
              ) =>
                setRejectionReason(
                  event.target
                    .value,
                )
              }
              placeholder="Required only when rejecting the withdrawal"
              className="focus-ring mt-2 w-full resize-none rounded-2xl border border-forest-900/10 bg-ivory-50 px-4 py-3 text-sm text-forest-950 outline-none"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={
                loading !==
                  null ||
                !rejectionReason.trim()
              }
              onClick={() =>
                void perform(
                  "reject",
                )
              }
              className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XCircle className="size-4" />

              Reject
            </button>

            <button
              type="button"
              disabled={
                loading !==
                null
              }
              onClick={() => {
                const confirmed =
                  window.confirm(
                    "Approve this withdrawal? This will immediately debit the investor's available Tevuah Cash balance and move the withdrawal to Processing.",
                  );

                if (
                  confirmed
                ) {
                  void perform(
                    "approve",
                  );
                }
              }}
              className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ===
              "approve" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}

              Approve & process
            </button>
          </div>
        </>
      ) : null}

      {status ===
      "processing" ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm leading-6 text-violet-800">
            The investor&apos;s Tevuah Cash balance has already
            been debited. Mark this withdrawal paid only after
            the external wire payment has actually been released.
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-forest-950">
              Payment reference *
            </span>

            <input
              value={
                paymentReference
              }
              onChange={(
                event,
              ) =>
                setPaymentReference(
                  event.target
                    .value,
                )
              }
              placeholder="e.g. TR-WD-20260916-8A32F"
              className="focus-ring mt-2 min-h-12 w-full rounded-2xl border border-forest-900/10 bg-white px-4 text-sm text-forest-950 outline-none"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-forest-950">
              Internal payment note
            </span>

            <textarea
              rows={3}
              value={
                paymentNote
              }
              onChange={(
                event,
              ) =>
                setPaymentNote(
                  event.target
                    .value,
                )
              }
              placeholder="Optional internal payout note"
              className="focus-ring mt-2 w-full resize-none rounded-2xl border border-forest-900/10 bg-white px-4 py-3 text-sm text-forest-950 outline-none"
            />
          </label>

          <button
            type="button"
            disabled={
              loading !==
                null ||
              !paymentReference.trim()
            }
            onClick={() => {
              const confirmed =
                window.confirm(
                  "Confirm that the external payment has been released and mark this withdrawal Paid?",
                );

              if (
                confirmed
              ) {
                void perform(
                  "paid",
                );
              }
            }}
            className="focus-ring inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ===
            "paid" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}

            Mark withdrawal paid
          </button>
        </div>
      ) : null}
    </div>
  );
}