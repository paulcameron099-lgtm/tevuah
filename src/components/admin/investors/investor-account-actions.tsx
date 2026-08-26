"use client";

import {
  CheckCircle2,
  CircleAlert,
  Loader2,
  ShieldAlert,
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

type InvestorAccountActionsProps = {
  userId: string;

  investorName: string;

  currentStatus: string;
};

export function InvestorAccountActions({
  userId,
  investorName,
  currentStatus,
}: InvestorAccountActionsProps) {
  const router =
    useRouter();

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

  const active =
    currentStatus ===
    "active";

  const suspended =
    currentStatus ===
    "suspended";

  const disabled =
    currentStatus ===
    "disabled";

  async function updateStatus(
    status: AccountStatus,
  ) {
    setError(null);
    setSuccess(null);

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

  return (
    <aside className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6">
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

      {/* CURRENT STATUS */}

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

      {/* ERROR */}

      {error ? (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-700" />

          <p className="text-sm leading-6 text-red-700">
            {error}
          </p>
        </div>
      ) : null}

      {/* SUCCESS */}

      {success ? (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />

          <p className="text-sm leading-6 text-emerald-700">
            {success}
          </p>
        </div>
      ) : null}

      {/* REASON */}

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
              placeholder="Explain why this investor account should be suspended or disabled..."
              className="focus-ring mt-3 w-full rounded-xl border border-forest-900/10 bg-ivory-50 p-4 text-sm leading-6 text-forest-950 outline-none"
            />
          </label>
        </div>
      )}

      {/* ACTIVE ACCOUNT ACTIONS */}

      {active ? (
        <div className="mt-5 space-y-3">
          <button
            type="button"
            disabled={
              loading !==
              null
            }
            onClick={() =>
              updateStatus(
                "suspended",
              )
            }
            className="focus-ring flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
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
              loading !==
              null
            }
            onClick={() =>
              updateStatus(
                "disabled",
              )
            }
            className="focus-ring flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:opacity-50"
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
        /*
         * SUSPENDED / DISABLED
         */
        <div className="mt-6">
          <p className="text-sm leading-7 text-stone-600">
            This investor account currently has
            restricted access. Reactivating it will
            restore normal account status.
          </p>

          <button
            type="button"
            disabled={
              loading !==
              null
            }
            onClick={() =>
              updateStatus(
                "active",
              )
            }
            className="focus-ring mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
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