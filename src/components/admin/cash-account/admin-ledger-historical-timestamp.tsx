"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  CalendarClock,
  Check,
  Loader2,
  RotateCcw,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

type AdminLedgerHistoricalTimestampProps = {
  ledgerId: string;
  actualCreatedAt: string;
  historicalCreatedAt:
    | string
    | null;
};

type ApiResponse = {
  success?: boolean;
  error?: string;
  ledgerId?: string;
  investorId?: string;
  actualCreatedAt?: string;
  historicalCreatedAt?:
    | string
    | null;
  investorEffectiveAt?: string;
};

function formatDateTime(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month:
        "short",
      day:
        "numeric",
      year:
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

/*
 * datetime-local does not carry a timezone.
 *
 * We intentionally convert the stored instant to the browser's
 * local date/time for editing. When saved, new Date(value)
 * converts that local date/time back to an ISO timestamp.
 *
 * This preserves the normal datetime-local editing model while
 * still storing a proper timestamptz in PostgreSQL.
 */
function toDateTimeLocalValue(
  value:
    | string
    | null,
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(
      value,
    );

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

export function AdminLedgerHistoricalTimestamp({
  ledgerId,
  actualCreatedAt,
  historicalCreatedAt,
}: AdminLedgerHistoricalTimestampProps) {
  const router =
    useRouter();

  const initialValue =
    useMemo(
      () =>
        toDateTimeLocalValue(
          historicalCreatedAt,
        ),
      [
        historicalCreatedAt,
      ],
    );

  const [
    value,
    setValue,
  ] =
    useState(
      initialValue,
    );

  const [
    isEditing,
    setIsEditing,
  ] =
    useState(
      false,
    );

  const [
    isSaving,
    setIsSaving,
  ] =
    useState(
      false,
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    success,
    setSuccess,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const investorFacingTimestamp =
    historicalCreatedAt ??
    actualCreatedAt;

  async function updateTimestamp(
    historicalTimestamp:
      | string
      | null,
  ) {
    setIsSaving(
      true,
    );

    setError(
      null,
    );

    setSuccess(
      null,
    );

    try {
      const response =
        await fetch(
          "/api/admin/cash-account/ledger-historical-timestamp",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                {
                  ledgerId,

                  historicalCreatedAt:
                    historicalTimestamp,
                },
              ),
          },
        );

      const payload =
        (await response.json()) as ApiResponse;

      if (
        !response.ok ||
        !payload.success
      ) {
        throw new Error(
          payload.error ||
            "Unable to update historical transaction time.",
        );
      }

      setSuccess(
        historicalTimestamp
          ? "Historical transaction time updated."
          : "Historical transaction time cleared.",
      );

      setIsEditing(
        false,
      );

      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof
          Error
          ? requestError.message
          : "Unable to update historical transaction time.",
      );
    } finally {
      setIsSaving(
        false,
      );
    }
  }

  async function handleSave() {
    if (!value) {
      setError(
        "Choose a historical date and time.",
      );

      return;
    }

    const timestamp =
      new Date(
        value,
      );

    if (
      Number.isNaN(
        timestamp.getTime(),
      )
    ) {
      setError(
        "Choose a valid historical date and time.",
      );

      return;
    }

    await updateTimestamp(
      timestamp.toISOString(),
    );
  }

  async function handleClear() {
    await updateTimestamp(
      null,
    );

    setValue(
      "",
    );
  }

  function handleCancel() {
    setValue(
      initialValue,
    );

    setError(
      null,
    );

    setSuccess(
      null,
    );

    setIsEditing(
      false,
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-forest-900/8 bg-stone-50/70 p-4">
      <div className="flex flex-col gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarClock className="size-3.5 text-gold-700" />

            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-stone-500">
              Investor-facing time
            </p>
          </div>

          <p className="mt-1.5 text-sm font-semibold text-forest-950">
            {formatDateTime(
              investorFacingTimestamp,
            )}
          </p>

          {historicalCreatedAt ? (
            <p className="mt-1 text-[0.68rem] leading-5 text-gold-700">
              Historical override active
            </p>
          ) : (
            <p className="mt-1 text-[0.68rem] leading-5 text-stone-400">
              Using actual system time
            </p>
          )}
        </div>

        {!isEditing ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setValue(
                  toDateTimeLocalValue(
                    historicalCreatedAt ??
                      actualCreatedAt,
                  ),
                );

                setError(
                  null,
                );

                setSuccess(
                  null,
                );

                setIsEditing(
                  true,
                );
              }}
              disabled={
                isSaving
              }
              className="focus-ring inline-flex cursor-pointer items-center justify-center rounded-full border border-forest-900/10 bg-white px-3 py-2 text-xs font-semibold text-forest-900 transition hover:border-forest-900/20 hover:bg-forest-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {historicalCreatedAt
                ? "Edit historical time"
                : "Set historical time"}
            </button>

            {historicalCreatedAt ? (
              <button
                type="button"
                onClick={
                  handleClear
                }
                disabled={
                  isSaving
                }
                className="focus-ring inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-stone-500 transition hover:bg-white hover:text-forest-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="size-3.5" />
                )}

                Clear
              </button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label
                htmlFor={`historical-created-at-${ledgerId}`}
                className="mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-stone-500"
              >
                Historical date &amp; time
              </label>

              <input
                id={`historical-created-at-${ledgerId}`}
                type="datetime-local"
                value={
                  value
                }
                onChange={(
                  event,
                ) => {
                  setValue(
                    event
                      .target
                      .value,
                  );

                  setError(
                    null,
                  );

                  setSuccess(
                    null,
                  );
                }}
                disabled={
                  isSaving
                }
                className="focus-ring w-full rounded-xl border border-forest-900/10 bg-white px-3 py-2.5 text-sm text-forest-950 outline-none transition hover:border-forest-900/20 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="mt-1.5 text-[0.68rem] leading-5 text-stone-400">
                The complete year, month, day, hour, and minute can be changed.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={
                  handleSave
                }
                disabled={
                  isSaving ||
                  !value
                }
                className="focus-ring inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-forest-950 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-forest-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Check className="size-3.5" />
                )}

                Save historical time
              </button>

              <button
                type="button"
                onClick={
                  handleCancel
                }
                disabled={
                  isSaving
                }
                className="focus-ring cursor-pointer rounded-full px-3 py-2 text-xs font-semibold text-stone-500 transition hover:bg-white hover:text-forest-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {error ? (
          <p className="text-xs font-medium leading-5 text-red-700">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="text-xs font-medium leading-5 text-emerald-700">
            {success}
          </p>
        ) : null}
      </div>
    </div>
  );
}