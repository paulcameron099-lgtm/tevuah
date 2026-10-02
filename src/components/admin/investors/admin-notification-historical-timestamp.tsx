"use client";

import {
  CalendarClock,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useMemo,
  useState,
} from "react";

type Props = {
  investorId: string;
  notificationId: string;
  actualCreatedAt: string;
  historicalCreatedAt:
    | string
    | null;
};

type ApiResponse = {
  ok?: boolean;

  error?: string;

  result?: {
    notification_id:
      | string
      | null;

    investor_id:
      | string
      | null;

    actual_created_at:
      | string
      | null;

    historical_created_at:
      | string
      | null;

    investor_effective_at:
      | string
      | null;
  } | null;
};

export function AdminNotificationHistoricalTimestamp({
  investorId,
  notificationId,
  actualCreatedAt,
  historicalCreatedAt,
}: Props) {
  const router =
    useRouter();

  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    value,
    setValue,
  ] = useState(
    () =>
      toDateTimeLocal(
        historicalCreatedAt ??
          actualCreatedAt,
      ),
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const effectiveCreatedAt =
    historicalCreatedAt ??
    actualCreatedAt;

  const formattedActual =
    useMemo(
      () =>
        formatDateTime(
          actualCreatedAt,
        ),
      [
        actualCreatedAt,
      ],
    );

  const formattedEffective =
    useMemo(
      () =>
        formatDateTime(
          effectiveCreatedAt,
        ),
      [
        effectiveCreatedAt,
      ],
    );

  async function saveHistoricalTimestamp() {
    setError(null);

    if (!value) {
      setError(
        "Choose a historical date and time.",
      );

      return;
    }

    const parsed =
      new Date(value);

    if (
      Number.isNaN(
        parsed.getTime(),
      )
    ) {
      setError(
        "The historical date and time are invalid.",
      );

      return;
    }

    setSaving(true);

    try {
      const response =
        await fetch(
          "/api/admin/investor-notifications/historical-timestamp",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                investorId,
                notificationId,

                historicalCreatedAt:
                  parsed.toISOString(),
              }),
          },
        );

      const payload =
        (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(
          payload.error ??
            "Unable to update historical notification time.",
        );
      }

      setEditing(
        false,
      );

      router.refresh();
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update historical notification time.",
      );
    } finally {
      setSaving(
        false,
      );
    }
  }

  async function clearHistoricalTimestamp() {
    setError(null);

    setSaving(
      true,
    );

    try {
      const response =
        await fetch(
          "/api/admin/investor-notifications/historical-timestamp",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                investorId,
                notificationId,

                historicalCreatedAt:
                  null,
              }),
          },
        );

      const payload =
        (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(
          payload.error ??
            "Unable to clear historical notification time.",
        );
      }

      setValue(
        toDateTimeLocal(
          actualCreatedAt,
        ),
      );

      setEditing(
        false,
      );

      router.refresh();
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to clear historical notification time.",
      );
    } finally {
      setSaving(
        false,
      );
    }
  }

  function cancelEditing() {
    setError(
      null,
    );

    setValue(
      toDateTimeLocal(
        historicalCreatedAt ??
          actualCreatedAt,
      ),
    );

    setEditing(
      false,
    );
  }

  return (
    <div className="rounded-[1.25rem] border border-forest-900/10 bg-ivory-50 p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-gold-700">
          <CalendarClock className="size-4" />
        </span>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold-700">
            Investor-facing time
          </p>

          <p className="mt-2 text-sm font-semibold text-forest-950">
            {
              formattedEffective
            }
          </p>

          <p className="mt-1 text-xs leading-5 text-stone-500">
            {historicalCreatedAt
              ? "Historical override active"
              : "Using actual system time"}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-forest-900/10 pt-4">
        <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-stone-400">
          Actual system time
        </p>

        <p className="mt-1 text-xs font-medium text-stone-600">
          {
            formattedActual
          }
        </p>
      </div>

      {editing ? (
        <div className="mt-5 space-y-4">
          <div>
            <label
              htmlFor={`notification-historical-${notificationId}`}
              className="text-xs font-semibold text-forest-950"
            >
              Historical date and time
            </label>

            <input
              id={`notification-historical-${notificationId}`}
              type="datetime-local"
              step="60"
              value={
                value
              }
              disabled={
                saving
              }
              onChange={(
                event,
              ) => {
                setValue(
                  event.target.value,
                );

                setError(
                  null,
                );
              }}
              className="focus-ring mt-2 min-h-11 w-full rounded-xl border border-forest-900/15 bg-white px-3 text-sm text-forest-950 outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p className="mt-2 text-[0.7rem] leading-5 text-stone-500">
              You can change the year, month, day,
              hour and minute shown to the investor.
            </p>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-xs leading-5 text-red-700">
                {
                  error
                }
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={
                saving
              }
              onClick={
                saveHistoricalTimestamp
              }
              className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-forest-950 px-4 text-xs font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CalendarClock className="size-3.5" />
              )}

              Save
            </button>

            <button
              type="button"
              disabled={
                saving
              }
              onClick={
                cancelEditing
              }
              className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X className="size-3.5" />

              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setValue(
                toDateTimeLocal(
                  historicalCreatedAt ??
                    actualCreatedAt,
                ),
              );

              setError(
                null,
              );

              setEditing(
                true,
              );
            }}
            className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-forest-950 px-4 text-xs font-semibold text-white transition hover:bg-forest-800"
          >
            <CalendarClock className="size-3.5" />

            {historicalCreatedAt
              ? "Edit historical time"
              : "Set historical time"}
          </button>

          {historicalCreatedAt ? (
            <button
              type="button"
              disabled={
                saving
              }
              onClick={
                clearHistoricalTimestamp
              }
              className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RotateCcw className="size-3.5" />
              )}

              Clear
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

/*
 * ==================================================
 * HELPERS
 * ==================================================
 */

function toDateTimeLocal(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  const pad = (
    number: number,
  ) =>
    String(
      number,
    ).padStart(
      2,
      "0",
    );

  return [
    date.getFullYear(),
    "-",
    pad(
      date.getMonth() +
        1,
    ),
    "-",
    pad(
      date.getDate(),
    ),
    "T",
    pad(
      date.getHours(),
    ),
    ":",
    pad(
      date.getMinutes(),
    ),
  ].join("");
}

function formatDateTime(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      year:
        "numeric",

      month:
        "short",

      day:
        "numeric",

      hour:
        "numeric",

      minute:
        "2-digit",
    },
  ).format(
    new Date(
      value,
    ),
  );
}