"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Loader2, Save } from "lucide-react";

type Props = {
  jointSubscriptionId: string;
  memberOneName: string;
  memberTwoName: string;
  historical: {
    submittedAt: string | null;
    reviewedAt: string | null;
    approvedAt: string | null;
    memberOneFundedAt: string | null;
    memberTwoFundedAt: string | null;
    finalizedAt: string | null;
    positionCreatedAt: string | null;
  };
  system: {
    submittedAt: string | null;
    reviewedAt: string | null;
    approvedAt: string | null;
    memberOneFundedAt: string | null;
    memberTwoFundedAt: string | null;
    finalizedAt: string | null;
    memberOnePositionCreatedAt: string | null;
    memberTwoPositionCreatedAt: string | null;
  };
};

export function JointHistoricalTimelineEditor(props: Props) {
  const router = useRouter();
  const { historical, system } = props;
  const [submittedAt, setSubmittedAt] = useState(toUtcInput(historical.submittedAt));
  const [reviewedAt, setReviewedAt] = useState(toUtcInput(historical.reviewedAt));
  const [approvedAt, setApprovedAt] = useState(toUtcInput(historical.approvedAt));
  const [memberOneFundedAt, setMemberOneFundedAt] = useState(toUtcInput(historical.memberOneFundedAt));
  const [memberTwoFundedAt, setMemberTwoFundedAt] = useState(toUtcInput(historical.memberTwoFundedAt));
  const [finalizedAt, setFinalizedAt] = useState(toUtcInput(historical.finalizedAt));
  const [positionCreatedAt, setPositionCreatedAt] = useState(toUtcInput(historical.positionCreatedAt));
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(() => [
    { label: "Submitted", value: submittedAt, setter: setSubmittedAt, system: system.submittedAt },
    { label: "Reviewed", value: reviewedAt, setter: setReviewedAt, system: system.reviewedAt },
    { label: "Approved", value: approvedAt, setter: setApprovedAt, system: system.approvedAt },
    { label: `${props.memberOneName} funded`, value: memberOneFundedAt, setter: setMemberOneFundedAt, system: system.memberOneFundedAt },
    { label: `${props.memberTwoName} funded`, value: memberTwoFundedAt, setter: setMemberTwoFundedAt, system: system.memberTwoFundedAt },
    { label: "Finalized", value: finalizedAt, setter: setFinalizedAt, system: system.finalizedAt },
  ], [submittedAt, reviewedAt, approvedAt, memberOneFundedAt, memberTwoFundedAt, finalizedAt, system, props.memberOneName, props.memberTwoName]);

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(
        `/api/admin/subscriptions/joint/${props.jointSubscriptionId}/historical-timeline`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            historicalSubmittedAt: utcInputToIsoOrNull(submittedAt),
            historicalReviewedAt: utcInputToIsoOrNull(reviewedAt),
            historicalApprovedAt: utcInputToIsoOrNull(approvedAt),
            memberOneHistoricalFundedAt: utcInputToIsoOrNull(memberOneFundedAt),
            memberTwoHistoricalFundedAt: utcInputToIsoOrNull(memberTwoFundedAt),
            historicalFinalizedAt: utcInputToIsoOrNull(finalizedAt),
            historicalPositionCreatedAt: utcInputToIsoOrNull(positionCreatedAt),
            reason: reason.trim() || null,
          }),
        },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to save historical joint timeline.");
      setMessage("Historical joint timeline saved.");
      setReason("");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save historical joint timeline.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
      <CalendarClock className="size-5 text-gold-600" />
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">Investor-facing chronology</p>
      <h2 className="font-display mt-2 text-3xl font-semibold text-forest-950">Historical Joint Timeline</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
        Historical dates control what the investors will see. Blank fields fall back to the original system dates. Each investor keeps an independent historical funding date.
      </p>
      <p className="mt-3 max-w-3xl rounded-xl border border-gold-600/20 bg-gold-50 px-4 py-3 text-xs font-semibold leading-5 text-forest-950">
        Historical date and time inputs are entered in UTC. The clock value you enter is stored as that exact UTC time.
      </p>

      <div className="mt-7 space-y-4">
        {rows.map((row) => (
          <TimelineRow key={row.label} label={row.label} value={row.value} onChange={row.setter} system={row.system} />
        ))}

        <div className="grid gap-3 rounded-2xl border border-forest-900/10 bg-ivory-50 p-4 lg:grid-cols-[170px_1fr_1fr] lg:items-center">
          <p className="text-sm font-semibold text-forest-950">Positions created</p>
          <label>
            <span className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-gold-600">Historical · both positions · UTC</span>
            <input
              type="datetime-local"
              value={positionCreatedAt}
              onChange={(e) => setPositionCreatedAt(e.target.value)}
              className="focus-ring min-h-11 w-full rounded-xl border border-forest-900/10 bg-white px-3 text-sm text-forest-950"
            />
          </label>
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">Original system dates · read only</p>
            <p className="mt-1 text-xs font-semibold text-stone-600">{props.memberOneName}: {formatSystemDate(system.memberOnePositionCreatedAt)}</p>
            <p className="mt-1 text-xs font-semibold text-stone-600">{props.memberTwoName}: {formatSystemDate(system.memberTwoPositionCreatedAt)}</p>
          </div>
        </div>
      </div>

      <label className="mt-6 block">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">Reason (optional)</span>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Optional administrative note"
          className="focus-ring mt-2 w-full rounded-xl border border-forest-900/10 bg-white px-4 py-3 text-sm text-forest-950"
        />
      </label>

      {error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}
      {message ? <p className="mt-4 text-sm font-semibold text-emerald-700">{message}</p> : null}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="focus-ring mt-6 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Save historical joint timeline
      </button>
    </section>
  );
}

function TimelineRow({ label, value, onChange, system }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  system: string | null;
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-forest-900/10 bg-ivory-50 p-4 lg:grid-cols-[170px_1fr_1fr] lg:items-center">
      <p className="text-sm font-semibold text-forest-950">{label}</p>
      <label>
        <span className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-gold-600">Historical · UTC</span>
        <input
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="focus-ring min-h-11 w-full rounded-xl border border-forest-900/10 bg-white px-3 text-sm text-forest-950"
        />
      </label>
      <div>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">Original system date · read only</p>
        <p className="mt-2 text-sm font-semibold text-stone-600">{formatSystemDate(system)}</p>
      </div>
    </div>
  );
}

function toUtcInput(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function utcInputToIsoOrNull(value: string): string | null {
  if (!value) return null;

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/,
  );

  if (!match) {
    throw new Error("One or more historical dates are invalid.");
  }

  const [, year, month, day, hour, minute] = match;
  const timestamp = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    0,
    0,
  );
  const date = new Date(timestamp);

  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day) ||
    date.getUTCHours() !== Number(hour) ||
    date.getUTCMinutes() !== Number(minute)
  ) {
    throw new Error("One or more historical dates are invalid.");
  }

  return date.toISOString();
}

function formatSystemDate(value: string | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(value));
}
