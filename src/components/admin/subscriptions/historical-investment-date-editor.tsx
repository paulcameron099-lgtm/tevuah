"use client";

import {
  CalendarClock,
  Loader2,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type Props = {
  positionId: string;
  currentEffectiveAt: string | null;
  offeringOpenedAt: string | null;
  offeringClosedAt: string | null;
};

export function HistoricalInvestmentDateEditor({
  positionId,
  currentEffectiveAt,
  offeringOpenedAt,
  offeringClosedAt,
}: Props) {
  const router = useRouter();

  const initialValue = useMemo(
    () => toDateTimeLocal(currentEffectiveAt),
    [currentEffectiveAt],
  );

  const [dateTime, setDateTime] =
    useState(initialValue);
  const [reason, setReason] =
    useState("");
  const [overrideWindow, setOverrideWindow] =
    useState(false);
  const [saving, setSaving] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);
  const [success, setSuccess] =
    useState<string | null>(null);

  async function save() {
    setError(null);
    setSuccess(null);

    if (!dateTime) {
      setError(
        "Choose the historical investment date and time.",
      );
      return;
    }

    if (
      overrideWindow &&
      reason.trim().length < 20
    ) {
      setError(
        "An offering-window override requires a reason of at least 20 characters.",
      );
      return;
    }

    const parsed = new Date(dateTime);

    if (Number.isNaN(parsed.getTime())) {
      setError("Enter a valid date and time.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/investment-positions/${positionId}/historical-date`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            effectiveAt: parsed.toISOString(),
            reason: reason.trim() || null,
            overrideOfferingWindow:
              overrideWindow,
          }),
        },
      );

      const payload = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to update historical investment date.",
        );
      }

      setSuccess(
        "Historical investment date updated.",
      );
      setReason("");
      setOverrideWindow(false);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to update historical investment date.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
      <CalendarClock className="size-5 text-gold-600" />

      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
        Historical chronology
      </p>

      <h2 className="font-display mt-2 text-3xl font-semibold text-forest-950">
        Historical Investment Date
      </h2>

      <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
        Set the business-effective date shown for this
        funded investment. This does not change the
        system creation, verification or funding audit
        timestamps.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`historical-date-${positionId}`}
            className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500"
          >
            Date and time
          </label>

          <input
            id={`historical-date-${positionId}`}
            type="datetime-local"
            value={dateTime}
            onChange={(event) =>
              setDateTime(event.target.value)
            }
            className="focus-ring mt-2 min-h-11 w-full rounded-xl border border-forest-900/10 bg-white px-4 text-sm text-forest-950"
          />
        </div>

        <div>
          <label
            htmlFor={`historical-reason-${positionId}`}
            className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500"
          >
            Reason{" "}
            <span className="normal-case tracking-normal text-stone-400">
              (optional)
            </span>
          </label>

          <input
            id={`historical-reason-${positionId}`}
            value={reason}
            onChange={(event) =>
              setReason(event.target.value)
            }
            placeholder="Optional internal note"
            className="focus-ring mt-2 min-h-11 w-full rounded-xl border border-forest-900/10 bg-white px-4 text-sm text-forest-950"
          />
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-forest-900/10 bg-ivory-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
          Historical offering window
        </p>

        <p className="mt-2 text-sm text-forest-950">
          {offeringOpenedAt
            ? formatDateTime(offeringOpenedAt)
            : "Opening date not set"}
          {" — "}
          {offeringClosedAt
            ? formatDateTime(offeringClosedAt)
            : "No historical closing date"}
        </p>

        <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm leading-6 text-stone-600">
          <input
            type="checkbox"
            checked={overrideWindow}
            onChange={(event) =>
              setOverrideWindow(
                event.target.checked,
              )
            }
            className="mt-1 size-4"
          />

          <span>
            Explicitly override the historical offering
            window. Use only for an intentional exception.
            A reason of at least 20 characters is required
            when this option is used outside the window.
          </span>
        </label>
      </div>

      {error ? (
        <p className="mt-4 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="mt-4 text-sm font-medium text-emerald-700">
          {success}
        </p>
      ) : null}

      <button
        type="button"
        disabled={saving}
        onClick={save}
        className="focus-ring mt-6 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <CalendarClock className="size-4" />
        )}

        {saving
          ? "Saving..."
          : "Save historical date"}
      </button>
    </section>
  );
}

function toDateTimeLocal(
  value: string | null,
) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (number: number) =>
    String(number).padStart(2, "0");

  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
  ].join("");
}

function formatDateTime(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(new Date(value));
}
