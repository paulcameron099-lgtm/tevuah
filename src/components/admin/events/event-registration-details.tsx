
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  RefreshCw,
  Send,
  UserRound,
  Video,
} from "lucide-react";

type ScreeningOption = { meetingDate: string; meetingTime: string; timezone: string };

type Registration = {
  id: string;
  event_title: string;
  screening_options: ScreeningOption[] | null;
  event_date: string | null;
  event_location: string | null;
  first_name: string;
  last_name: string;
  email: string;
  telephone: string | null;
  country: string;
  intent: string;
  attendance: string;
  attendees: string;
  comments: string | null;
  future_events: boolean;
  status: string;
  confirmation_email_status: string;
  created_at: string;
};

type Meeting = {
  meeting_date: string | null;
  meeting_time: string | null;
  timezone: string | null;
  platform: string | null;
  meeting_url: string | null;
  status: string;
  invitation_sent_at: string | null;
} | null;

type EmailLog = {
  id: string;
  email_type: string;
  recipient_email: string;
  subject: string;
  delivery_status: string;
  attempt_number: number;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
};

type Props = {
  registration: Registration;
  meeting: Meeting;
  emailLogs: EmailLog[];
};

type Action =
  | "request_availability"
  | "resend_availability"
  | "save_screening_options"
  | "save_meeting"
  | "send_invitation"
  | "resend_invitation";

function display(value: string | null | undefined) {
  return value?.trim() || "Not provided";
}

function label(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function dateTime(value: string | null | undefined) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  // Explicit timezone and separators keep SSR and browser output identical.
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Europe/London",
  }).formatToParts(date);

  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("day")} ${part("month")} ${part("year")}, ${part("hour")}:${part("minute")}`;
}

function Info({
  title,
  value,
}: {
  title: string;
  value: string | null | undefined;
}) {
  return (
    <div className="border-b border-forest-900/10 py-4">
      <dt className="text-xs font-medium uppercase tracking-wider text-stone-500">
        {title}
      </dt>

      <dd className="mt-2 whitespace-pre-wrap break-words text-sm font-medium text-forest-950">
        {display(value)}
      </dd>
    </div>
  );
}

export function EventRegistrationDetails({
  registration,
  meeting,
  emailLogs,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [screeningOptions, setScreeningOptions] = useState<ScreeningOption[]>(
    registration.screening_options?.length ? registration.screening_options : [
      { meetingDate: "", meetingTime: "", timezone: "Europe/London" },
      { meetingDate: "", meetingTime: "", timezone: "Europe/London" },
    ],
  );
  const [screeningDirty, setScreeningDirty] = useState(false);

  const [meetingDate, setMeetingDate] = useState(
    meeting?.meeting_date ?? "",
  );

  const [meetingTime, setMeetingTime] = useState(
    meeting?.meeting_time?.slice(0, 5) ?? "",
  );

  const [timezone, setTimezone] = useState(
    meeting?.timezone ?? "Europe/London",
  );

  const [platform, setPlatform] = useState(
    meeting?.platform ?? "Google Meet",
  );

  const [meetingUrl, setMeetingUrl] = useState(
    meeting?.meeting_url ?? "",
  );

  const [feedback, setFeedback] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const [confirmAction, setConfirmAction] =
    useState<Action | null>(null);

  const hasAvailabilityEmail = emailLogs.some(
    (log) =>
      log.email_type === "meeting_request" &&
      log.delivery_status === "sent",
  );

  const hasInvitationEmail = emailLogs.some(
    (log) =>
      log.email_type === "meeting_invitation" &&
      log.delivery_status === "sent",
  );

  const hasActiveEmail = emailLogs.some(
    (log) =>
      (
        log.email_type === "meeting_request" ||
        log.email_type === "meeting_invitation"
      ) &&
      log.delivery_status === "sending",
  );

  const closed =
    registration.status === "cancelled" ||
    registration.status === "completed";

  const meetingInput = {
    meetingDate,
    meetingTime,
    timezone,
    platform,
    meetingUrl,
  };

  function updateScreeningOption(index: number, field: keyof ScreeningOption, value: string) {
    setScreeningOptions((current) => current.map((option, i) =>
      i === index ? { ...option, [field]: value } : option,
    ));
    setScreeningDirty(true);
  }

  async function performAction(action: Action) {
    setConfirmAction(null);
    setFeedback(null);

    startTransition(async () => {
      try {
        const result = await fetch(
          `/api/admin/events/${registration.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action,
              meeting: meetingInput,
              screeningOptions,
            }),
          },
        );

        const data: {
          ok?: boolean;
          message?: string;
          error?: string;
        } = await result.json();

        if (!result.ok || !data.ok) {
          setFeedback({
            ok: false,
            message:
              data.error ??
              "The action could not be completed.",
          });

          router.refresh();
          return;
        }

        if (action === "save_screening_options") setScreeningDirty(false);

        setFeedback({
          ok: true,
          message:
            data.message ??
            "Action completed successfully.",
        });

        router.refresh();
      } catch {
        setFeedback({
          ok: false,
          message:
            "A network error occurred. Check the email history before retrying.",
        });
      }
    });
  }

  const inputClass =
    "mt-2 min-h-12 w-full rounded-xl border border-forest-900/15 bg-white px-4 text-sm text-forest-950 outline-none transition focus:border-gold-600 focus:ring-2 focus:ring-gold-500/20";

  const primaryButton =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-900 disabled:cursor-not-allowed disabled:opacity-50";

  const secondaryButton =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-forest-900/15 bg-white px-5 text-sm font-semibold text-forest-950 transition hover:bg-ivory-100 disabled:cursor-not-allowed disabled:opacity-50";

  const disabled = pending || closed || hasActiveEmail;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 text-sm font-semibold text-forest-900 hover:text-gold-700"
        >
          <ArrowLeft className="size-4" />
          Back to Events Management
        </Link>

        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">
          Administration / Registration Details
        </p>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-forest-950 sm:text-4xl">
              {registration.first_name}{" "}
              {registration.last_name}
            </h1>

            <p className="mt-3 text-sm text-stone-600">
              {registration.event_title}
            </p>
          </div>

          <span className="rounded-full bg-forest-950 px-4 py-2 text-xs font-semibold text-white">
            {label(registration.status)}
          </span>
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className={`rounded-xl border p-4 text-sm ${
            feedback.ok
              ? "border-forest-900/15 bg-white text-forest-900"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {hasActiveEmail && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          An email attempt is still marked as sending.
          Review its outcome before attempting another send.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-forest-900/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <UserRound className="size-5 text-gold-700" />
            <h2 className="font-display text-xl font-semibold text-forest-950">
              Applicant information
            </h2>
          </div>

          <dl className="mt-5">
            <Info title="Email" value={registration.email} />
            <Info title="Telephone" value={registration.telephone} />
            <Info title="Country" value={registration.country} />
            <Info title="Enquiry type" value={label(registration.intent)} />
            <Info title="Attendance" value={label(registration.attendance)} />
            <Info title="Number of attendees" value={registration.attendees} />
            <Info
              title="Future events updates"
              value={registration.future_events ? "Yes" : "No"}
            />
            <Info
              title="Acknowledgement email"
              value={label(registration.confirmation_email_status)}
            />
            <Info
              title="Submitted"
              value={dateTime(registration.created_at)}
            />
            <Info
              title="Comments"
              value={registration.comments}
            />
          </dl>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-forest-900/10 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <CalendarDays className="size-5 text-gold-700" />
              <h2 className="font-display text-xl font-semibold text-forest-950">Proposed Zoom screening options</h2>
            </div>
            <p className="mt-4 text-sm leading-7 text-stone-600">
              Add two to five available dates and times. Save your options first, then email the applicant.
              They will reply with their preferred option. No Zoom link is sent at this stage.
            </p>
            <div className="mt-5 space-y-4">
              {screeningOptions.map((option, index) => (
                <div key={index} className="rounded-xl border border-forest-900/10 bg-ivory-100 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-forest-950">Option {index + 1}</p>
                    {screeningOptions.length > 2 && (
                      <button type="button" disabled={disabled} className="text-xs font-semibold text-red-700"
                        onClick={() => { setScreeningOptions((items) => items.filter((_, i) => i !== index)); setScreeningDirty(true); }}>
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="text-sm font-semibold text-forest-950">Date
                      <input type="date" className={inputClass} value={option.meetingDate}
                        onChange={(e) => updateScreeningOption(index, "meetingDate", e.target.value)} />
                    </label>
                    <label className="text-sm font-semibold text-forest-950">Time
                      <input type="time" className={inputClass} value={option.meetingTime}
                        onChange={(e) => updateScreeningOption(index, "meetingTime", e.target.value)} />
                    </label>
                    <label className="text-sm font-semibold text-forest-950 sm:col-span-2">Timezone (IANA)
                      <input type="text" className={inputClass} value={option.timezone} placeholder="Europe/London"
                        onChange={(e) => updateScreeningOption(index, "timezone", e.target.value)} />
                    </label>
                  </div>
                </div>
              ))}
            </div>
            {screeningOptions.length < 5 && (
              <button type="button" disabled={disabled} className={`${secondaryButton} mt-4`}
                onClick={() => { setScreeningOptions((items) => [...items, { meetingDate: "", meetingTime: "", timezone: items[0]?.timezone || "Europe/London" }]); setScreeningDirty(true); }}>
                Add Another Option
              </button>
            )}
            {screeningDirty && <p className="mt-4 text-xs font-semibold text-amber-800">Unsaved changes. Save the proposed options before sending an email.</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" disabled={disabled} onClick={() => performAction("save_screening_options")} className={secondaryButton}>
                Save Proposed Options
              </button>
              <button type="button" disabled={disabled || screeningDirty || hasAvailabilityEmail || registration.status === "meeting_scheduled"}
                onClick={() => setConfirmAction("request_availability")} className={primaryButton}>
                <Mail className="size-4" /> Send Screening Invitation
              </button>
              <button type="button" disabled={disabled || screeningDirty || !hasAvailabilityEmail || registration.status === "meeting_scheduled"}
                onClick={() => setConfirmAction("resend_availability")} className={secondaryButton}>
                <RefreshCw className="size-4" /> Resend Screening Options
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-forest-900/10 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <Video className="size-5 text-gold-700" />
              <h2 className="font-display text-xl font-semibold text-forest-950">
                Meeting invitation
              </h2>
            </div>

            <p className="mt-4 text-sm leading-7 text-stone-600">
              Enter the agreed meeting details. You can save
              them as a draft or send an invitation.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-forest-950">
                Meeting date
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="text-sm font-semibold text-forest-950">
                Meeting time
                <input
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="text-sm font-semibold text-forest-950">
                Timezone
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="Europe/London"
                  className={inputClass}
                />
              </label>

              <label className="text-sm font-semibold text-forest-950">
                Platform
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className={inputClass}
                >
                  <option value="Google Meet">Google Meet</option>
                  <option value="Zoom">Zoom</option>
                  <option value="Microsoft Teams">Microsoft Teams</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>

            <label className="mt-5 block text-sm font-semibold text-forest-950">
              Meeting URL
              <input
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://meet.google.com/..."
                className={inputClass}
              />
            </label>

            <p className="mt-3 text-xs leading-5 text-stone-500">
              Use an HTTPS meeting link. Time is interpreted
              in the timezone entered above.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={disabled}
                onClick={() => performAction("save_meeting")}
                className={secondaryButton}
              >
                Save Meeting Details
              </button>

              <button
                type="button"
                disabled={disabled || hasInvitationEmail}
                onClick={() => setConfirmAction("send_invitation")}
                className={primaryButton}
              >
                <Send className="size-4" />
                Send Invitation
              </button>

              <button
                type="button"
                disabled={disabled || !hasInvitationEmail}
                onClick={() => setConfirmAction("resend_invitation")}
                className={secondaryButton}
              >
                <RefreshCw className="size-4" />
                Resend Invitation
              </button>
            </div>

            {meeting?.invitation_sent_at && (
              <p className="mt-5 flex items-center gap-2 text-xs text-forest-900">
                <CheckCircle2 className="size-4" />
                Last invitation accepted by SMTP:{" "}
                {dateTime(meeting.invitation_sent_at)}
              </p>
            )}
          </section>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-forest-900/10 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-forest-900/10 p-6 sm:p-8">
          <Clock3 className="size-5 text-gold-700" />
          <div>
            <h2 className="font-display text-xl font-semibold text-forest-950">
              Email communication history
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              Latest 100 recorded email attempts
            </p>
          </div>
        </div>

        {emailLogs.length === 0 ? (
          <p className="p-8 text-sm text-stone-500">
            No email communication has been recorded.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-left text-sm">
              <thead className="bg-ivory-100 text-xs uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Recipient</th>
                  <th className="px-5 py-4">Attempt</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Timestamp</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-forest-900/10">
                {emailLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-forest-950">
                        {label(log.email_type)}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        {log.subject}
                      </p>
                      {log.error_message && (
                        <p className="mt-2 max-w-65 break-words text-xs text-red-700">
                          {log.error_message}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 break-all text-stone-600">
                      {log.recipient_email}
                    </td>

                    <td className="px-5 py-4 text-stone-600">
                      {log.attempt_number}
                    </td>

                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        log.delivery_status === "sent"
                          ? "bg-forest-950/10 text-forest-900"
                          : log.delivery_status === "failed"
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-800"
                      }`}>
                        {log.delivery_status === "sent"
                          ? "SMTP accepted"
                          : label(log.delivery_status)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-stone-600">
                      {dateTime(log.sent_at ?? log.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {confirmAction && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-forest-950/70 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-action-title"
            className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl"
          >
            <h3
              id="event-action-title"
              className="font-display text-2xl font-semibold text-forest-950"
            >
              Confirm email action
            </h3>

            <p className="mt-4 text-sm leading-7 text-stone-600">
              This will attempt to send{" "}
              {confirmAction.includes("invitation")
                ? "a confirmed meeting invitation"
                : "the proposed Zoom screening options"}{" "}
              to <strong>{registration.email}</strong>.
              Please verify the details before proceeding.
            </p>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                className={secondaryButton}
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={pending}
                className={primaryButton}
                onClick={() => performAction(confirmAction)}
              >
                Confirm & Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
