"use client";

import {
  CheckCircle2,
  CircleAlert,
  Loader2,
  MessageSquareWarning,
  XCircle,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

type Props = {
  subscriptionId: string;

  investorName: string;

  currentStatus: string;

  commitmentAmount: number;

  remainingAllocation: number;
};

type Action =
  | "approve"
  | "request_information"
  | "reject";

export function SubscriptionReviewActions({
  subscriptionId,
  investorName,
  currentStatus,
  commitmentAmount,
  remainingAllocation,
}: Props) {
  const router =
    useRouter();

  const [
    note,
    setNote,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState<
      Action | null
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

const finalStatus =
  currentStatus ===
    "approved" ||
  currentStatus ===
    "rejected";

const waitingForInvestor =
  currentStatus ===
  "action_required";

  async function runAction(
    action: Action,
  ) {
    setError(null);
    setSuccess(null);

    if (
      (
        action ===
          "request_information" ||
        action ===
          "reject"
      ) &&
      !note.trim()
    ) {
      setError(
        action ===
          "reject"
          ? "Enter a rejection reason."
          : "Enter the information the investor needs to provide.",
      );

      return;
    }

    /*
     * Give admin an obvious warning before
     * attempting an approval that exceeds
     * current visible remaining allocation.
     *
     * Server/RPC validates this again.
     */
    if (
      action ===
        "approve" &&
      commitmentAmount >
        remainingAllocation
    ) {
      setError(
        "This commitment exceeds the current remaining allocation and cannot be approved.",
      );

      return;
    }

    setLoading(
      action,
    );

    try {
      const response =
        await fetch(
          `/api/admin/subscriptions/${subscriptionId}/review`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                action,

                note:
                  note.trim(),
              }),
          },
        );

      const result =
        (await response.json()) as {
          error?: string;
        };

      if (!response.ok) {
        setError(
          result.error ??
            "Unable to review subscription.",
        );

        return;
      }

      setNote("");

      setSuccess(
        action ===
          "approve"
          ? `${investorName}'s subscription has been approved.`
          : action ===
              "request_information"
            ? "Additional information has been requested."
            : "Subscription has been rejected.",
      );

      router.refresh();
    } catch {
      setError(
        "Unable to review subscription.",
      );
    } finally {
      setLoading(
        null,
      );
    }
  }

  return (
    <aside className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
        Review decision
      </p>

      <h2 className="font-display mt-3 text-2xl font-semibold text-forest-950">
        Subscription action
      </h2>

      <div className="mt-6 rounded-xl border border-forest-900/10 bg-ivory-50 p-4">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
          Commitment
        </p>

        <p className="mt-1 text-xl font-semibold text-forest-950">
          {formatMoney(
            commitmentAmount,
          )}
        </p>

        <p className="mt-4 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
          Remaining allocation
        </p>

        <p className="mt-1 text-sm font-semibold text-forest-950">
          {formatMoney(
            remainingAllocation,
          )}
        </p>
      </div>

      {error ? (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-700" />

          <p className="text-sm leading-6 text-red-700">
            {error}
          </p>
        </div>
      ) : null}

      {success ? (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />

          <p className="text-sm leading-6 text-emerald-700">
            {success}
          </p>
        </div>
      ) : null}

            {waitingForInvestor ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
            Waiting for investor
            </p>

            <p className="mt-2 text-sm leading-7 text-amber-900">
            Additional information has been requested.
            The investor must update and resubmit this
            subscription before it can be approved.
            </p>
        </div>
        ) : !finalStatus ? (
        <>
          <label className="mt-6 block">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
              Admin note / reason
            </span>

            <textarea
              value={
                note
              }
              onChange={(
                event,
              ) =>
                setNote(
                  event.target
                    .value,
                )
              }
              rows={5}
              placeholder="Required when requesting more information or rejecting..."
              className="focus-ring mt-3 w-full rounded-xl border border-forest-900/10 bg-ivory-50 p-4 text-sm leading-6 text-forest-950 outline-none"
            />
          </label>

          <div className="mt-5 space-y-3">
            <button
              type="button"
              disabled={
                loading !==
                null
              }
              onClick={() =>
                runAction(
                  "approve",
                )
              }
              className="focus-ring flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ===
              "approve" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}

              Approve subscription
            </button>

            <button
              type="button"
              disabled={
                loading !==
                null
              }
              onClick={() =>
                runAction(
                  "request_information",
                )
              }
              className="focus-ring flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ===
              "request_information" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <MessageSquareWarning className="size-4" />
              )}

              Request more information
            </button>

            <button
              type="button"
              disabled={
                loading !==
                null
              }
              onClick={() =>
                runAction(
                  "reject",
                )
              }
              className="focus-ring flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ===
              "reject" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <XCircle className="size-4" />
              )}

              Reject subscription
            </button>
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-xl border border-forest-900/10 bg-ivory-50 p-4 text-sm text-stone-600">
          This subscription has reached a final review
          status:{" "}
          <strong className="text-forest-950">
            {humanize(
              currentStatus,
            )}
          </strong>
          .
        </div>
      )}
    </aside>
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