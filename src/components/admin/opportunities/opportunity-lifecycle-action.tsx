"use client";

import {
  AlertTriangle,
  Archive,
  Loader2,
  Trash2,
  X,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

type LifecycleAction =
  | "close"
  | "delete";

type OpportunityLifecycleActionProps = {
  opportunityId: string;
  opportunityTitle: string;
  status: string;
};

type LifecycleResponse = {
  success?: boolean;

  error?: string;

  requestedAction?:
    LifecycleAction;

  action?: string;

  hardDeleted?: boolean;

  resultingStatus?:
    | string
    | null;

  closedAt?:
    | string
    | null;

  storageCleanup?: {
    required?: boolean;
    complete?: boolean;
    errors?: string[];
  };
};

export function OpportunityLifecycleAction({
  opportunityId,
  opportunityTitle,
  status,
}: OpportunityLifecycleActionProps) {
  const router =
    useRouter();

  const [
    selectedAction,
    setSelectedAction,
  ] =
    useState<
      LifecycleAction | null
    >(null);

  const [
    reason,
    setReason,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    resultMessage,
    setResultMessage,
  ] =
    useState<string | null>(
      null,
    );

  const normalizedReason =
    reason.trim();

  const reasonIsValid =
    normalizedReason.length >=
    10;

  const isClosed =
    status === "closed";

  /*
   * --------------------------------------------------
   * OPEN CONFIRMATION
   * --------------------------------------------------
   */
  function openAction(
    action: LifecycleAction,
  ) {
    if (loading) {
      return;
    }

    setSelectedAction(
      action,
    );

    setReason("");

    setError(null);

    setResultMessage(null);
  }

  /*
   * --------------------------------------------------
   * CLOSE CONFIRMATION
   * --------------------------------------------------
   */
  function closeDialog() {
    if (loading) {
      return;
    }

    setSelectedAction(null);

    setReason("");

    setError(null);
  }

  /*
   * --------------------------------------------------
   * SUBMIT EXPLICIT ACTION
   * --------------------------------------------------
   */
  async function submitLifecycleAction() {
    if (!selectedAction) {
      setError(
        "Please select an administrative action.",
      );

      return;
    }

    if (!reasonIsValid) {
      setError(
        "Please provide a reason of at least 10 characters.",
      );

      return;
    }

    setLoading(true);

    setError(null);

    setResultMessage(null);

    try {
      const response =
        await fetch(
          `/api/admin/opportunities/${opportunityId}/remove`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                action:
                  selectedAction,

                reason:
                  normalizedReason,
              }),
          },
        );

      const result =
        (await response.json()) as
          LifecycleResponse;

      if (!response.ok) {
        setError(
          result.error ??
            `Unable to ${selectedAction} this opportunity.`,
        );

        return;
      }

      if (!result.success) {
        setError(
          result.error ??
            "The lifecycle operation did not complete.",
        );

        return;
      }

      /*
       * --------------------------------------------------
       * DELETE SUCCESS
       * --------------------------------------------------
       */
      if (
        selectedAction ===
        "delete"
      ) {
        if (
          !result.hardDeleted
        ) {
          setError(
            "Permanent deletion was not confirmed by the server.",
          );

          return;
        }

        if (
          result.storageCleanup &&
          result.storageCleanup
            .complete === false
        ) {
          console.warn(
            "Opportunity deleted with storage cleanup warnings:",
            result.storageCleanup
              .errors,
          );
        }

        router.replace(
          "/admin/opportunities",
        );

        router.refresh();

        return;
      }

      /*
       * --------------------------------------------------
       * CLOSE SUCCESS
       * --------------------------------------------------
       */
      if (
        selectedAction ===
        "close"
      ) {
        if (
          result.hardDeleted
        ) {
          setError(
            "Unexpected lifecycle response: the server reported a deletion for a close request.",
          );

          return;
        }

        setSelectedAction(
          null,
        );

        setReason("");

        setError(null);

        setResultMessage(
          result.action ===
            "already_closed"
            ? "This opportunity is already closed."
            : "Opportunity closed successfully. Its historical records remain preserved.",
        );

        router.refresh();

        return;
      }
    } catch (
      requestError
    ) {
      console.error(
        "Opportunity lifecycle request error:",
        requestError,
      );

      setError(
        "Unable to process the opportunity.",
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * --------------------------------------------------
   * MODAL CONTENT
   * --------------------------------------------------
   */
  const isDelete =
    selectedAction ===
    "delete";

  const dialogTitle =
    isDelete
      ? "Permanently delete opportunity?"
      : "Close opportunity?";

  const actionButtonLabel =
    isDelete
      ? "Permanently Delete"
      : "Close Opportunity";

  return (
    <>
      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
            Lifecycle administration
          </p>

          <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
            Opportunity lifecycle
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
            Choose explicitly whether
            this opportunity should be
            closed and preserved or
            permanently deleted.
          </p>

          <div className="mt-5 rounded-xl border border-forest-900/10 bg-ivory-50 p-4">
            <p className="text-sm font-semibold text-forest-950">
              Current status:{" "}
              {humanize(
                status,
              )}
            </p>

            <p className="mt-2 text-xs leading-6 text-stone-600">
              Closing preserves the
              opportunity and its
              historical records.
              Permanent deletion is a
              separate administrative
              action and will never be
              converted into a close
              automatically.
            </p>
          </div>

          {resultMessage ? (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
              {resultMessage}
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {/* CLOSE */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
              <div className="flex items-start gap-3">
                <Archive className="mt-0.5 size-5 shrink-0 text-amber-700" />

                <div>
                  <h3 className="text-base font-semibold text-forest-950">
                    Close Opportunity
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    Remove this
                    opportunity from
                    active investment
                    availability while
                    preserving its
                    database history.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={
                  loading ||
                  isClosed
                }
                onClick={() =>
                  openAction(
                    "close",
                  )
                }
                className="focus-ring mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-amber-700 bg-white px-5 text-sm font-semibold text-amber-800 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Archive className="size-4" />

                {isClosed
                  ? "Already Closed"
                  : "Close Opportunity"}
              </button>
            </div>

            {/* DELETE */}
            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5">
              <div className="flex items-start gap-3">
                <Trash2 className="mt-0.5 size-5 shrink-0 text-red-700" />

                <div>
                  <h3 className="text-base font-semibold text-forest-950">
                    Delete Opportunity
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    Permanently remove
                    this opportunity.
                    This action is
                    distinct from
                    closing and cannot
                    be undone.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={
                  loading
                }
                onClick={() =>
                  openAction(
                    "delete",
                  )
                }
                className="focus-ring mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="size-4" />

                Delete Opportunity
              </button>
            </div>
          </div>
        </div>
      </section>

      {selectedAction ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeDialog();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="opportunity-lifecycle-title"
            className="w-full max-w-xl rounded-[1.75rem] bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.16em] ${
                    isDelete
                      ? "text-red-700"
                      : "text-amber-700"
                  }`}
                >
                  Administrative action
                </p>

                <h2
                  id="opportunity-lifecycle-title"
                  className="font-display mt-3 text-3xl font-semibold text-forest-950"
                >
                  {dialogTitle}
                </h2>
              </div>

              <button
                type="button"
                disabled={
                  loading
                }
                onClick={
                  closeDialog
                }
                aria-label="Close dialog"
                className="focus-ring inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-forest-900/10 text-stone-500 hover:bg-ivory-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="size-4" />
              </button>
            </div>

            <div
              className={`mt-6 rounded-xl border p-4 ${
                isDelete
                  ? "border-red-200 bg-red-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <div className="flex gap-3">
                <AlertTriangle
                  className={`mt-0.5 size-4 shrink-0 ${
                    isDelete
                      ? "text-red-700"
                      : "text-amber-700"
                  }`}
                />

                <div>
                  <p
                    className={`text-sm font-semibold ${
                      isDelete
                        ? "text-red-900"
                        : "text-amber-900"
                    }`}
                  >
                    {opportunityTitle}
                  </p>

                  {isDelete ? (
                    <p className="mt-2 text-xs leading-6 text-red-800">
                      You are requesting
                      permanent deletion.
                      The system will not
                      silently close this
                      opportunity instead.
                      If deletion cannot
                      complete safely, the
                      request will fail
                      without changing it
                      to closed.
                    </p>
                  ) : (
                    <p className="mt-2 text-xs leading-6 text-amber-800">
                      Closing preserves
                      the opportunity and
                      its historical
                      records while
                      removing it from
                      active investment
                      availability.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <label className="mt-6 block">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
                Administrative reason
              </span>

              <textarea
                value={
                  reason
                }
                disabled={
                  loading
                }
                onChange={(
                  event,
                ) => {
                  setReason(
                    event.target.value,
                  );

                  setError(null);
                }}
                rows={5}
                placeholder={
                  isDelete
                    ? "Explain why this opportunity should be permanently deleted."
                    : "Explain why this opportunity should be closed."
                }
                className="focus-ring mt-2 w-full rounded-xl border border-forest-900/10 bg-ivory-50 p-4 text-sm leading-7 text-forest-950 outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />

              <div className="mt-2 flex items-center justify-between gap-4">
                <p className="text-xs text-stone-500">
                  Minimum 10 characters.
                </p>

                <p
                  className={`text-xs font-semibold ${
                    reasonIsValid
                      ? "text-emerald-700"
                      : "text-stone-400"
                  }`}
                >
                  {
                    normalizedReason.length
                  }{" "}
                  characters
                </p>
              </div>
            </label>

            {error ? (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={
                  loading
                }
                onClick={
                  closeDialog
                }
                className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-forest-900/10 bg-white px-5 text-sm font-semibold text-forest-950 hover:bg-ivory-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  loading ||
                  !reasonIsValid
                }
                onClick={
                  submitLifecycleAction
                }
                className={`focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  isDelete
                    ? "bg-red-700 hover:bg-red-800"
                    : "bg-amber-700 hover:bg-amber-800"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />

                    Processing...
                  </>
                ) : isDelete ? (
                  <>
                    <Trash2 className="size-4" />

                    {actionButtonLabel}
                  </>
                ) : (
                  <>
                    <Archive className="size-4" />

                    {actionButtonLabel}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
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