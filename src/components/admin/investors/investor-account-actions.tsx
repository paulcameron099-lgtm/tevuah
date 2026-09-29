"use client";

import {
  CheckCircle2,
  CircleAlert,
  Loader2,
  ShieldAlert,
  Trash2,
  TriangleAlert,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

type AccountStatus =
  | "active"
  | "suspended"
  | "disabled";

type DestructiveAction =
  | "normal_delete"
  | "danger_delete";

type InvestorAccountActionsProps = {
  userId: string;

  investorName: string;

  currentStatus: string;
};

type DeleteResponse = {
  success?: boolean;

  action?: string;

  investor_id?: string;

  operation_id?: string;

  database_cleanup_complete?: boolean;

  storage_cleanup_complete?: boolean;

  auth_user_deleted?: boolean;

  profile_deleted?: boolean;

  danger_delete_invoked?: boolean;

  automatic_escalation_to_danger_delete?: boolean;

  danger_delete_required?: boolean;

  retryable?: boolean;

  stage?: string;

  error?: string;

  details?: string;

  preflight?: unknown;
};

export function InvestorAccountActions({
  userId,
  investorName,
  currentStatus,
}: InvestorAccountActionsProps) {
  const router =
    useRouter();

  /*
   * ==================================================
   * ACCOUNT STATUS STATE
   * ==================================================
   */

  const [
    reason,
    setReason,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState<
      AccountStatus | null
    >(null);

  /*
   * ==================================================
   * SHARED FEEDBACK
   * ==================================================
   */

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

  /*
   * ==================================================
   * NORMAL DELETE STATE
   * ==================================================
   */

  const [
    normalDeleteOpen,
    setNormalDeleteOpen,
  ] =
    useState(false);

  const [
    normalDeleteReason,
    setNormalDeleteReason,
  ] =
    useState("");

  const [
    normalDeleteConfirmation,
    setNormalDeleteConfirmation,
  ] =
    useState("");

  /*
   * ==================================================
   * DANGER DELETE STATE
   * ==================================================
   */

  const [
    dangerDeleteOpen,
    setDangerDeleteOpen,
  ] =
    useState(false);

  const [
    dangerDeleteReason,
    setDangerDeleteReason,
  ] =
    useState("");

  const [
    dangerDeleteConfirmation,
    setDangerDeleteConfirmation,
  ] =
    useState("");

  /*
   * ==================================================
   * DESTRUCTIVE REQUEST STATE
   * ==================================================
   */

  const [
    destructiveLoading,
    setDestructiveLoading,
  ] =
    useState<
      DestructiveAction | null
    >(null);

  const active =
    currentStatus ===
    "active";

  const suspended =
    currentStatus ===
    "suspended";

  /*
   * ==================================================
   * STATUS UPDATE
   * ==================================================
   */

  async function updateStatus(
    status: AccountStatus,
  ) {
    setError(null);
    setSuccess(null);

    if (
      destructiveLoading !==
      null
    ) {
      return;
    }

    /*
     * Restricting an account requires
     * an administrative reason.
     */
    if (
      status !==
        "active" &&
      !reason.trim()
    ) {
      setError(
        "Enter a reason before restricting this investor account.",
      );

      return;
    }

    setLoading(
      status,
    );

    try {
      const response =
        await fetch(
          `/api/admin/investors/${userId}/status`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body:
              JSON.stringify({
                status,

                reason:
                  reason.trim(),
              }),
          },
        );

      const result =
        (await response.json()) as {
          success?: boolean;
          error?: string;
          status?: string;
        };

      if (!response.ok) {
        setError(
          result.error ??
            "Unable to update investor account.",
        );

        return;
      }

      if (
        status ===
        "active"
      ) {
        setSuccess(
          `${investorName}'s account has been reactivated.`,
        );
      } else if (
        status ===
        "suspended"
      ) {
        setSuccess(
          `${investorName}'s account has been suspended.`,
        );
      } else {
        setSuccess(
          `${investorName}'s account has been disabled.`,
        );
      }

      setReason("");

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "Investor account action request error:",
        requestError,
      );

      setError(
        "Unable to update investor account.",
      );
    } finally {
      setLoading(
        null,
      );
    }
  }

  /*
   * ==================================================
   * NORMAL DELETE
   * ==================================================
   */

  async function normalDeleteInvestor() {
    setError(null);
    setSuccess(null);

    const trimmedReason =
      normalDeleteReason.trim();

    if (
      normalDeleteConfirmation !==
      "DELETE"
    ) {
      setError(
        'Type DELETE exactly to confirm Normal Delete.',
      );

      return;
    }

    if (
      trimmedReason.length <
      10
    ) {
      setError(
        "Enter a Normal Delete reason of at least 10 characters.",
      );

      return;
    }

    setDestructiveLoading(
      "normal_delete",
    );

    try {
      const response =
        await fetch(
          `/api/admin/investors/${userId}/delete-unused`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body:
              JSON.stringify({
                confirmation:
                  normalDeleteConfirmation,

                reason:
                  trimmedReason,
              }),
          },
        );

      const result =
        (await response.json()) as DeleteResponse;

      /*
       * Protected history means Normal Delete is
       * unavailable.
       *
       * IMPORTANT:
       * We do NOT call Danger Delete automatically.
       */
      if (
        response.status ===
        409
      ) {
        setError(
          result.error ??
            "Normal Delete is unavailable because this investor has protected financial or investment history. No data was deleted.",
        );

        return;
      }

      if (!response.ok) {
        const stage =
          result.stage
            ? ` Stage: ${result.stage}.`
            : "";

        const retryMessage =
          result.retryable
            ? " The operation has been preserved and can be retried safely."
            : "";

        setError(
          `${
            result.error ??
            "Unable to delete this unused investor."
          }${stage}${retryMessage}`,
        );

        return;
      }

      if (
        result.success !==
          true ||
        result.action !==
          "normal_delete" ||
        result.profile_deleted !==
          true ||
        result.auth_user_deleted !==
          true
      ) {
        setError(
          "Normal Delete returned an incomplete result. Do not retry through another deletion workflow.",
        );

        return;
      }

      /*
       * Account no longer exists.
       */
     router.replace("/admin/investors");
    router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "Normal Delete request error:",
        requestError,
      );

      setError(
        "Unable to complete Normal Delete. If the database phase already completed, use the same Normal Delete action again so its recovery operation can resume.",
      );
    } finally {
      setDestructiveLoading(
        null,
      );
    }
  }

  /*
   * ==================================================
   * DANGER DELETE
   * ==================================================
   */

  async function dangerDeleteInvestor() {
    setError(null);
    setSuccess(null);

    const trimmedReason =
      dangerDeleteReason.trim();

    if (
      dangerDeleteConfirmation !==
      "DELETE"
    ) {
      setError(
        'Type DELETE exactly to confirm Danger Delete.',
      );

      return;
    }

    if (
      trimmedReason.length <
      10
    ) {
      setError(
        "Enter a Danger Delete reason of at least 10 characters.",
      );

      return;
    }

    setDestructiveLoading(
      "danger_delete",
    );

    try {
      const response =
        await fetch(
          `/api/admin/investors/${userId}/purge`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body:
              JSON.stringify({
                confirmation:
                  dangerDeleteConfirmation,

                reason:
                  trimmedReason,
              }),
          },
        );

      const result =
        (await response.json()) as DeleteResponse;

      if (!response.ok) {
        const stage =
          result.stage
            ? ` Stage: ${result.stage}.`
            : "";

        const retryMessage =
          result.retryable
            ? " The purge operation has been preserved and can be retried safely."
            : "";

        setError(
          `${
            result.error ??
            "Unable to permanently purge this investor."
          }${stage}${retryMessage}`,
        );

        return;
      }

      /*
       * We deliberately do not accept a Normal Delete
       * response from the Danger Delete endpoint.
       */
      if (
        result.action ===
        "normal_delete"
      ) {
        setError(
          "Safety stop: the Danger Delete endpoint returned a Normal Delete response.",
        );

        return;
      }

      if (
        result.success !==
        true ||
        result.profile_deleted !==
          true ||
        result.auth_user_deleted !==
          true
      ) {
        setError(
          "Danger Delete returned an incomplete result. Do not start another deletion workflow.",
        );

        return;
      }

      router.replace(
        "/admin/investors",
      );

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "Danger Delete request error:",
        requestError,
      );

      setError(
        "Unable to complete Danger Delete. If a purge operation already exists, use the same Danger Delete action again so recovery can resume.",
      );
    } finally {
      setDestructiveLoading(
        null,
      );
    }
  }

  const anyLoading =
    loading !== null ||
    destructiveLoading !==
      null;

  const normalDeleteReady =
    normalDeleteConfirmation ===
      "DELETE" &&
    normalDeleteReason.trim()
      .length >= 10;

  const dangerDeleteReady =
    dangerDeleteConfirmation ===
      "DELETE" &&
    dangerDeleteReason.trim()
      .length >= 10;

  return (
    <aside className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-forest-950 text-gold-400">
          <ShieldAlert className="size-4.5" />
        </span>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
            Account controls
          </p>

          <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">
            Investor access
          </h2>
        </div>
      </div>

      {/* ==================================================
          CURRENT STATUS
      ================================================== */}

      <div className="mt-6 rounded-xl border border-forest-900/10 bg-ivory-50 p-4">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
          Current status
        </p>

        <div className="mt-3 flex items-center gap-2">
          {active ? (
            <UserRoundCheck className="size-4 text-emerald-700" />
          ) : (
            <UserRoundX className="size-4 text-red-700" />
          )}

          <span
            className={`text-sm font-semibold ${
              active
                ? "text-emerald-700"
                : suspended
                  ? "text-amber-700"
                  : "text-red-700"
            }`}
          >
            {humanize(
              currentStatus,
            )}
          </span>
        </div>
      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error ? (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-700" />

          <p className="text-sm leading-6 text-red-700">
            {error}
          </p>
        </div>
      ) : null}

      {/* ==================================================
          SUCCESS
      ================================================== */}

      {success ? (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />

          <p className="text-sm leading-6 text-emerald-700">
            {success}
          </p>
        </div>
      ) : null}

      {/* ==================================================
          RESTRICTION REASON
      ================================================== */}

      {!active ? null : (
        <div className="mt-6">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
              Restriction reason
            </span>

            <textarea
              value={
                reason
              }
              onChange={(
                event,
              ) =>
                setReason(
                  event.target
                    .value,
                )
              }
              rows={4}
              disabled={
                anyLoading
              }
              placeholder="Explain why this investor account should be suspended or disabled..."
              className="focus-ring mt-3 w-full rounded-xl border border-forest-900/10 bg-ivory-50 p-4 text-sm leading-6 text-forest-950 outline-none disabled:opacity-50"
            />
          </label>
        </div>
      )}

      {/* ==================================================
          ACTIVE ACCOUNT ACTIONS
      ================================================== */}

      {active ? (
        <div className="mt-5 space-y-3">
          <button
            type="button"
            disabled={
              anyLoading
            }
            onClick={() =>
              updateStatus(
                "suspended",
              )
            }
            className="focus-ring flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ===
            "suspended" ? (
              <>
                <Loader2 className="size-4 animate-spin" />

                Suspending...
              </>
            ) : (
              <>
                <ShieldAlert className="size-4" />

                Suspend account
              </>
            )}
          </button>

          <button
            type="button"
            disabled={
              anyLoading
            }
            onClick={() =>
              updateStatus(
                "disabled",
              )
            }
            className="focus-ring flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ===
            "disabled" ? (
              <>
                <Loader2 className="size-4 animate-spin" />

                Disabling...
              </>
            ) : (
              <>
                <UserRoundX className="size-4" />

                Disable account
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-sm leading-7 text-stone-600">
            This investor account currently has
            restricted access. Reactivating it will
            restore normal account status.
          </p>

          <button
            type="button"
            disabled={
              anyLoading
            }
            onClick={() =>
              updateStatus(
                "active",
              )
            }
            className="focus-ring mt-5 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ===
            "active" ? (
              <>
                <Loader2 className="size-4 animate-spin" />

                Reactivating...
              </>
            ) : (
              <>
                <UserRoundCheck className="size-4" />

                Reactivate account
              </>
            )}
          </button>
        </div>
      )}

      <div className="mt-6 border-t border-forest-900/10 pt-5">
        <p className="text-xs leading-6 text-stone-500">
          Account restrictions are separate from
          compliance approval. Suspending an investor
          does not change their verification records.
        </p>
      </div>

      {/* ==================================================
          NORMAL DELETE
      ================================================== */}

      <div className="mt-7 border-t border-forest-900/10 pt-6">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-700">
            <Trash2 className="size-4" />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
              Delete unused investor
            </p>

            <p className="mt-2 text-xs leading-6 text-stone-500">
              Available only when the investor has no
              protected investment, payment, cash,
              joint, statement, distribution or
              retirement history.
            </p>
          </div>
        </div>

        {!normalDeleteOpen ? (
          <button
            type="button"
            disabled={
              anyLoading
            }
            onClick={() => {
              setError(null);
              setSuccess(null);

              setDangerDeleteOpen(
                false,
              );

              setNormalDeleteOpen(
                true,
              );
            }}
            className="focus-ring mt-5 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="size-4" />

            Delete unused investor
          </button>
        ) : (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
            <p className="text-sm font-semibold text-amber-950">
              Normal Delete
            </p>

            <p className="mt-2 text-xs leading-6 text-amber-900/80">
              Tevuah Reserve will first verify that{" "}
              {investorName} has no protected financial
              or investment history. If any blocker
              exists, deletion will stop without
              automatically invoking Danger Delete.
            </p>

            <label className="mt-4 block">
              <span className="text-xs font-semibold text-amber-950">
                Administrative reason
              </span>

              <textarea
                value={
                  normalDeleteReason
                }
                onChange={(
                  event,
                ) =>
                  setNormalDeleteReason(
                    event.target
                      .value,
                  )
                }
                disabled={
                  anyLoading
                }
                rows={3}
                placeholder="Explain why this unused investor should be deleted..."
                className="focus-ring mt-2 w-full rounded-xl border border-amber-200 bg-white p-3 text-sm leading-6 text-forest-950 outline-none disabled:opacity-50"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-xs font-semibold text-amber-950">
                Type DELETE to confirm
              </span>

              <input
                type="text"
                autoComplete="off"
                value={
                  normalDeleteConfirmation
                }
                onChange={(
                  event,
                ) =>
                  setNormalDeleteConfirmation(
                    event.target
                      .value,
                  )
                }
                disabled={
                  anyLoading
                }
                placeholder="DELETE"
                className="focus-ring mt-2 min-h-11 w-full rounded-xl border border-amber-200 bg-white px-3 text-sm font-semibold text-forest-950 outline-none disabled:opacity-50"
              />
            </label>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                disabled={
                  anyLoading ||
                  !normalDeleteReady
                }
                onClick={
                  normalDeleteInvestor
                }
                className="focus-ring flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-amber-700 px-5 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {destructiveLoading ===
                "normal_delete" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />

                    Verifying and deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-4" />

                    Confirm Normal Delete
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={
                  anyLoading
                }
                onClick={() => {
                  setNormalDeleteOpen(
                    false,
                  );

                  setNormalDeleteReason(
                    "",
                  );

                  setNormalDeleteConfirmation(
                    "",
                  );
                }}
                className="focus-ring min-h-10 cursor-pointer rounded-full px-4 text-xs font-semibold text-stone-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================
          DANGER DELETE
      ================================================== */}

      <div className="mt-7 border-t border-red-200 pt-6">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
            <TriangleAlert className="size-4" />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-red-700">
              Danger Delete
            </p>

            <p className="mt-2 text-xs leading-6 text-stone-500">
              Permanently purge this investor and the
              investor&apos;s related records according
              to the protected purge workflow. This is
              separate from Normal Delete.
            </p>
          </div>
        </div>

        {!dangerDeleteOpen ? (
          <button
            type="button"
            disabled={
              anyLoading
            }
            onClick={() => {
              setError(null);
              setSuccess(null);

              setNormalDeleteOpen(
                false,
              );

              setDangerDeleteOpen(
                true,
              );
            }}
            className="focus-ring mt-5 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-red-300 bg-red-50 px-5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <TriangleAlert className="size-4" />

            Open Danger Delete
          </button>
        ) : (
          <div className="mt-5 rounded-xl border border-red-300 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <TriangleAlert className="mt-0.5 size-5 shrink-0 text-red-700" />

              <div>
                <p className="text-sm font-semibold text-red-900">
                  Permanent investor purge
                </p>

                <p className="mt-2 text-xs leading-6 text-red-800">
                  This can remove investment history and
                  affected joint-investment units for{" "}
                  {investorName}. Other investors&apos;
                  accounts and unrelated data must remain
                  untouched.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-red-200 bg-white/70 p-3">
              <p className="text-xs font-semibold text-red-900">
                This action is never selected
                automatically.
              </p>

              <p className="mt-1 text-xs leading-5 text-red-700">
                A failed Normal Delete does not authorize
                this action. You are explicitly choosing
                the permanent purge workflow.
              </p>
            </div>

            <label className="mt-4 block">
              <span className="text-xs font-semibold text-red-900">
                Purge reason
              </span>

              <textarea
                value={
                  dangerDeleteReason
                }
                onChange={(
                  event,
                ) =>
                  setDangerDeleteReason(
                    event.target
                      .value,
                  )
                }
                disabled={
                  anyLoading
                }
                rows={3}
                placeholder="Explain why this investor must be permanently purged..."
                className="focus-ring mt-2 w-full rounded-xl border border-red-200 bg-white p-3 text-sm leading-6 text-forest-950 outline-none disabled:opacity-50"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-xs font-semibold text-red-900">
                Type DELETE to confirm
              </span>

              <input
                type="text"
                autoComplete="off"
                value={
                  dangerDeleteConfirmation
                }
                onChange={(
                  event,
                ) =>
                  setDangerDeleteConfirmation(
                    event.target
                      .value,
                  )
                }
                disabled={
                  anyLoading
                }
                placeholder="DELETE"
                className="focus-ring mt-2 min-h-11 w-full rounded-xl border border-red-200 bg-white px-3 text-sm font-semibold text-red-900 outline-none disabled:opacity-50"
              />
            </label>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                disabled={
                  anyLoading ||
                  !dangerDeleteReady
                }
                onClick={
                  dangerDeleteInvestor
                }
                className="focus-ring flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-red-800 px-5 text-sm font-semibold text-white transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {destructiveLoading ===
                "danger_delete" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />

                    Permanently purging...
                  </>
                ) : (
                  <>
                    <TriangleAlert className="size-4" />

                    Permanently Danger Delete
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={
                  anyLoading
                }
                onClick={() => {
                  setDangerDeleteOpen(
                    false,
                  );

                  setDangerDeleteReason(
                    "",
                  );

                  setDangerDeleteConfirmation(
                    "",
                  );
                }}
                className="focus-ring min-h-10 cursor-pointer rounded-full px-4 text-xs font-semibold text-red-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
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