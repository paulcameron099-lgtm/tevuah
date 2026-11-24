"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  Save,
  Send,
  UserRound,
  Paperclip,
  Download,
  Trash2,
} from "lucide-react";
type InterviewOption = {
  date: string;
  time: string;
  timezone: string;
};
type EmailType =
  | "application_received"
  | "interview_invitation"
  | "interview_confirmation"
  | "interview_reminder"
  | "employment_offer"
  | "welcome_onboarding"
  | "payroll_id_onboarding";
type Applicant = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  position_title: string;
  recruitment_status: string;
  interview_options: InterviewOption[];
  interview_date: string | null;
  interview_time: string | null;
  interview_timezone: string | null;
  meeting_url: string | null;
  meeting_id: string | null;
  meeting_passcode: string | null;
  created_at: string;
  offer_start_date?: string | null;
  offer_department?: string | null;
  offer_employment_type?: string | null;
  offer_working_arrangement?: string | null;
  offer_compensation?: string | null;
  offer_accepted_at?: string | null;
  handbook_file_name?: string | null;
  handbook_storage_path?: string | null;
};
type EmailLog = {
  id: string;
  email_type: string;
  subject: string;
  recipient_email: string;
  body_text: string;
  delivery_status: string;
  attempt_number: number;
  provider_message_id: string | null;
  error_message: string | null;
  created_at: string;
  sent_at: string | null;
};
type Props = {
  applicant: Applicant;
  emailLogs: EmailLog[];
};
const EMPTY_OPTION: InterviewOption = {
  date: "",
  time: "",
  timezone: "Africa/Lagos",
};
const EMAIL_ACTIONS: {
  type: EmailType;
  title: string;
  button: string;
  description: string;
}[] = [
  {
    type: "application_received",
    title: "Application Received",
    button: "Send Application Acknowledgement",
    description: "Confirm receipt of the application.",
  },
  {
    type: "interview_invitation",
    title: "Zoom Interview Invitation",
    button: "Send Interview Invitation",
    description: "Send three proposed interview schedules.",
  },
  {
    type: "interview_confirmation",
    title: "Zoom Interview Confirmation",
    button: "Send Interview Confirmation",
    description: "Send the confirmed Zoom meeting details.",
  },
  {
    type: "interview_reminder",
    title: "Reminder: Zoom Interview",
    button: "Send Interview Reminder",
    description: "Remind the applicant of their Zoom interview.",
  },
  {
    type: "employment_offer", title: "Employment Offer",
    button: "Send Employment Offer", description: "Send the employment offer with saved terms.",
  },
  {
    type: "welcome_onboarding", title: "Welcome & Onboarding",
    button: "Send Welcome & Onboarding Email", description: "Send welcome instructions with the saved handbook attached.",
  },
  {
    type: "payroll_id_onboarding", title: "Employee Onboarding – Payroll & ID",
    button: "Send Payroll & ID Setup Request", description: "Request payroll preference and company ID details after offer acceptance. No handbook attachment required.",
  },
];
function normalizeOptions(value: InterviewOption[] | null) {
  return Array.from({ length: 3 }, (_, index) => ({
    ...EMPTY_OPTION,
    ...(Array.isArray(value) ? value[index] : undefined),
  }));
}
function displayStatus(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function formatDate(value: string) {
  if (!value) return "Not set";
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  const formatted = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).formatToParts(date);
  const parts: Record<string, string> = {};
  for (const part of formatted) {
    if (part.type !== "literal") {
      parts[part.type] = part.value;
    }
  }
  return (
    `${parts.day} ${parts.month} ${parts.year} ` +
    `at ${parts.hour}:${parts.minute} UTC`
  );
}
function PreviewText({
  type,
  applicant,
  options,
  date,
  time,
  timezone,
  meetingUrl,
  meetingId,
  passcode,
  offerStartDate, offerDepartment, offerEmploymentType, offerWorkingArrangement, offerCompensation, handbookName,
}: {
  type: EmailType;
  applicant: Applicant;
  options: InterviewOption[];
  date: string;
  time: string;
  timezone: string;
  meetingUrl: string;
  meetingId: string;
  passcode: string;
  offerStartDate: string; offerDepartment: string; offerEmploymentType: string;
  offerWorkingArrangement: string; offerCompensation: string; handbookName: string | null;
}) {
  const name = `${applicant.first_name} ${applicant.last_name}`;
  const position = applicant.position_title;
  const meeting = `Date: ${date ? formatDate(date) : "[Date]"}
Time: ${time || "[Time]"} (${timezone || "[Timezone]"})
Duration: Approximately 10–15 minutes
Platform: Zoom
Meeting Link: ${meetingUrl || "[Meeting Link]"}
Meeting ID: ${meetingId || "[Meeting ID]"}
Passcode: ${passcode || "[Passcode]"}`;
  let content = "";
  switch (type) {
    case "application_received":
      content = `Dear ${name},
Thank you for submitting your application for the ${position} position at Tevuah Reserve.
We confirm that your application details have been received successfully. Our recruitment team will review your submission, and should your qualifications align with the requirements of the position, we will contact you within 24 hours regarding the next stage of the recruitment process.
We appreciate your interest in joining Tevuah Reserve and thank you for your time.
Best regards,
Recruitment Team
Tevuah Reserve`;
      break;
    case "interview_invitation":
      content = `Dear ${name},
Thank you for your interest in the ${position} position at Tevuah Reserve.
Following our initial review of your application, we’d like to invite you to a virtual interview with our recruitment team via Zoom.
Please select one of the following available interview schedules:
${options
  .map(
    (option, index) =>
      `Option ${index + 1}: ${
        option.date ? formatDate(option.date) : "[Date]"
      }, ${option.time || "[Time]"} (${
        option.timezone || "[Timezone]"
      })`,
  )
  .join("\n")}
Kindly confirm your availability by choosing one of the available time slots, or feel free to suggest an alternative that best fits your schedule. Once your selection is confirmed, we’ll send you the Zoom meeting details.
We look forward to speaking with you and learning more about your background and interest in the position.
Best regards,
Paul Vincenzo
Human Resources Manager
Tevuah Reserve`;
      break;
    case "interview_confirmation":
      content = `Dear ${name},
Thank you for confirming your availability. Your Zoom interview for the ${position} position has been scheduled as follows:
${meeting}
We kindly ask that you join a few minutes before your scheduled interview time to ensure everything is working properly.
During the interview, we’ll discuss your background, the responsibilities of the position, working arrangements, availability, and any questions you may have.
We look forward to meeting you.
Best regards,
Paul Vincenzo
Human Resources Manager
Tevuah Reserve`;
      break;
    case "interview_reminder":
      content = `Dear ${name},
Your Zoom interview for the ${position} position has been scheduled as follows:
${meeting}
We kindly ask that you join a few minutes before your scheduled interview time to ensure everything is working properly.
During the interview, we’ll discuss your background, the responsibilities of the position, working arrangements, availability, and any questions you may have.
We look forward to meeting you.
Best regards,
Paul Vincenzo
Human Resources Manager
Tevuah Reserve`;
      break;
  }
  if (type === "employment_offer") {
    content = `Dear ${name},

We are pleased to offer you the position of ${position} at Tevuah Reserve.

Position Details
Job Title: ${position}
Department: ${offerDepartment || "Guest Experience & Events"}${offerEmploymentType ? `\nEmployment Type: ${offerEmploymentType}` : ""}
Working Arrangement: ${offerWorkingArrangement || "Event-based"}${offerStartDate ? `\nStart Date: ${formatDate(offerStartDate)}` : ""}
Compensation: ${offerCompensation || "$700 per event"}

[Preview excerpt — the sent email includes full responsibilities, travel arrangements and acceptance instructions.]

Kind regards,
Paul Vincenzo
Human Resources Manager
Tevuah Reserve`;
  }
  if (type === "payroll_id_onboarding") {
    content = `Dear ${name},

Congratulations once again on joining the Tevuah Reserve team.

Please reply with your payroll preference (Direct Deposit, Check, or Other) and your company ID information:
• Recent professional passport-style photograph
• Full legal name
• Job title: ${position}
• Emergency contact (optional)

Banking details will be collected separately through a secure channel.

Kind regards,
Paul Vincenzo
Human Resources Manager
Tevuah Reserve`;
  }
  if (type === "welcome_onboarding") {
    content = `Dear ${name},

Welcome to Tevuah Reserve!

We are pleased to officially welcome you as our ${position}.

Employee Handbook – Please Review
Attached handbook: ${handbookName || "[Upload handbook]"}

Please sign and date the Employee Acknowledgment section and return a copy by replying to this email.

[Preview excerpt — the sent email includes full working arrangements, travel and onboarding instructions.]

Warm regards,
Paul Vincenzo
Human Resources Manager
Tevuah Reserve`;
  }
  return (
    <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-stone-700">
      {content}
    </pre>
  );
}
const inputClass =
  "w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3 text-sm text-forest-950 outline-none focus:border-gold-700";
const labelClass =
  "mb-2 block text-sm font-semibold text-forest-950";
export default function StaffApplicantDetails({
  applicant,
  emailLogs,
}: Props) {
  const router = useRouter();
  const [options, setOptions] = useState<InterviewOption[]>(
    normalizeOptions(applicant.interview_options),
  );
  const [date, setDate] = useState(
    applicant.interview_date ?? "",
  );
  const [time, setTime] = useState(
    applicant.interview_time?.slice(0, 5) ?? "",
  );
  const [timezone, setTimezone] = useState(
    applicant.interview_timezone ?? "Africa/Lagos",
  );
  const [meetingUrl, setMeetingUrl] = useState(
    applicant.meeting_url ?? "",
  );
  const [meetingId, setMeetingId] = useState(
    applicant.meeting_id ?? "",
  );
  const [passcode, setPasscode] = useState(
    applicant.meeting_passcode ?? "",
  );
  const [offerStartDate, setOfferStartDate] = useState(applicant.offer_start_date ?? "");
  const [offerDepartment, setOfferDepartment] = useState(applicant.offer_department ?? "Guest Experience & Events");
  const [offerEmploymentType, setOfferEmploymentType] = useState(applicant.offer_employment_type ?? "");
  const [offerWorkingArrangement, setOfferWorkingArrangement] = useState(applicant.offer_working_arrangement ?? "Event-based");
  const [offerCompensation, setOfferCompensation] = useState(applicant.offer_compensation ?? "$700 per event");
  const [offerAccepted, setOfferAccepted] = useState(!!applicant.offer_accepted_at);
  const [handbookName, setHandbookName] = useState(applicant.handbook_file_name ?? null);
  const [handbookFile, setHandbookFile] = useState<File | null>(null);
  const [offerSaved, setOfferSaved] = useState(JSON.stringify({ start: applicant.offer_start_date ?? "", department: applicant.offer_department ?? "Guest Experience & Events", type: applicant.offer_employment_type ?? "", arrangement: applicant.offer_working_arrangement ?? "Event-based", compensation: applicant.offer_compensation ?? "$700 per event" }));
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [preview, setPreview] = useState<EmailType | null>(
    null,
  );
  const [saved, setSaved] = useState({
    options: JSON.stringify(
      normalizeOptions(applicant.interview_options),
    ),
    meeting: JSON.stringify({
      date: applicant.interview_date ?? "",
      time: applicant.interview_time?.slice(0, 5) ?? "",
      timezone:
        applicant.interview_timezone ?? "Africa/Lagos",
      meetingUrl: applicant.meeting_url ?? "",
      meetingId: applicant.meeting_id ?? "",
      passcode: applicant.meeting_passcode ?? "",
    }),
  });
  const optionsDirty =
    JSON.stringify(options) !== saved.options;
  const meetingValues = {
    date,
    time,
    timezone,
    meetingUrl,
    meetingId,
    passcode,
  };
  const meetingDirty =
    JSON.stringify(meetingValues) !== saved.meeting;
  const validTime = (value: string) =>
    /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  const optionsReady =
    !optionsDirty &&
    options.length === 3 &&
    options.every(
      (option) =>
        option.date &&
        validTime(option.time) &&
        option.timezone,
    );
  const meetingReady =
    !meetingDirty &&
    !!date &&
    validTime(time) &&
    !!timezone &&
    /^https:\/\/\S+$/i.test(meetingUrl) &&
    !!meetingId.trim() &&
    !!passcode.trim();
  const offerValues = { start: offerStartDate, department: offerDepartment, type: offerEmploymentType, arrangement: offerWorkingArrangement, compensation: offerCompensation };
  const offerDirty = JSON.stringify(offerValues) !== offerSaved;
  async function saveOffer() {
    if (busy) return;
    setBusy("offer"); setError(null); setSuccess(null);
    try {
      const response = await fetch(`/api/admin/staff/${applicant.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerStartDate: offerStartDate || null, offerDepartment: offerDepartment || null,
          offerEmploymentType: offerEmploymentType || null, offerWorkingArrangement: offerWorkingArrangement || null,
          offerCompensation: offerCompensation || null }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save offer.");
      setOfferSaved(JSON.stringify(offerValues)); setSuccess("Employment offer details saved."); router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to save offer."); }
    finally { setBusy(null); }
  }
  async function updateAcceptance(accepted: boolean) {
    if (busy) return;
    if (!window.confirm(accepted ? "Confirm that the applicant has accepted the employment offer?" : "Clear recorded offer acceptance?")) return;
    setBusy("acceptance"); setError(null); setSuccess(null);
    try {
      const response = await fetch(`/api/admin/staff/${applicant.id}`, { method: "PATCH",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ offerAccepted: accepted }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to update acceptance.");
      setOfferAccepted(accepted); setSuccess("Offer acceptance updated."); router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to update acceptance."); }
    finally { setBusy(null); }
  }
  async function uploadHandbook() {
    if (!handbookFile || busy) return;
    setBusy("handbook"); setError(null); setSuccess(null);
    try {
      const form = new FormData(); form.set("file", handbookFile);
      const response = await fetch(`/api/admin/staff/${applicant.id}/handbook`, { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed.");
      setHandbookName(result.filename); setHandbookFile(null); setSuccess("Handbook saved."); router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Upload failed."); }
    finally { setBusy(null); }
  }
  async function removeHandbook() {
    if (busy || !handbookName || !window.confirm("Remove the saved handbook?")) return;
    setBusy("handbook"); setError(null); setSuccess(null);
    try {
      const response = await fetch(`/api/admin/staff/${applicant.id}/handbook`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to remove handbook.");
      setHandbookName(null); setHandbookFile(null); setSuccess("Handbook removed."); router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to remove handbook."); }
    finally { setBusy(null); }
  }
  function updateOption(
    index: number,
    field: keyof InterviewOption,
    value: string,
  ) {
    setOptions((previous) =>
      previous.map((option, optionIndex) =>
        optionIndex === index
          ? { ...option, [field]: value }
          : option,
      ),
    );
  }
  async function saveDetails(section: "options" | "meeting") {
    if (busy) return;
    setBusy(section);
    setError(null);
    setSuccess(null);
    try {
      const payload =
        section === "options"
          ? { interviewOptions: options }
          : {
              interviewDate: date || null,
              interviewTime: time || null,
              interviewTimezone: timezone || null,
              meetingUrl: meetingUrl || null,
              meetingId: meetingId || null,
              meetingPasscode: passcode || null,
            };
      const response = await fetch(
        `/api/admin/staff/${applicant.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.error || "Unable to save details.",
        );
      }
      if (section === "options") {
        setSaved((previous) => ({
          ...previous,
          options: JSON.stringify(options),
        }));
      } else {
        setSaved((previous) => ({
          ...previous,
          meeting: JSON.stringify(meetingValues),
        }));
      }
      setSuccess("Interview details saved successfully.");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save details.",
      );
    } finally {
      setBusy(null);
    }
  }
  async function sendEmail(type: EmailType) {
    if (busy) return;
    if (
      (type === "interview_invitation" && !optionsReady) ||
      ((type === "interview_confirmation" ||
        type === "interview_reminder") &&
        !meetingReady) ||
      (type === "employment_offer" && offerDirty) ||
      (type === "welcome_onboarding" && (!handbookName || !offerAccepted || offerDirty)) ||
      (type === "payroll_id_onboarding" && !offerAccepted)
    ) {
      setError(
        "Save the required details, record offer acceptance and upload the handbook before sending.",
      );
      return;
    }
    const action = EMAIL_ACTIONS.find(
      (item) => item.type === type,
    );
    if (
      !window.confirm(
        `Send "${action?.title}" to ${applicant.email}?`,
      )
    ) {
      return;
    }
    setBusy(type);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(
        `/api/admin/staff/${applicant.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ emailType: type }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.error || "Email delivery failed.",
        );
      }
      setSuccess(
        `${action?.title} accepted by the SMTP server.`,
      );
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to send recruitment email.",
      );
      router.refresh();
    } finally {
      setBusy(null);
    }
  }
  return (
    <div className="space-y-8 pb-12">
      <div>
        <Link
          href="/admin/staff"
          className="inline-flex items-center gap-2 text-sm font-semibold text-forest-900 hover:text-gold-700"
        >
          <ArrowLeft className="size-4" />
          Back to Staff Management
        </Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">
          Administration / Staff Management
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-forest-950 sm:text-4xl">
          {applicant.first_name} {applicant.last_name}
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          {applicant.position_title}
        </p>
      </div>
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}
      {success && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          <CheckCircle2 className="size-5" />
          {success}
        </div>
      )}
      <section className="rounded-2xl border border-forest-900/10 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <UserRound className="size-6 text-forest-900" />
          <h2 className="font-display text-xl font-semibold text-forest-950">
            Applicant Information
          </h2>
        </div>
        <dl className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-stone-500">
              Full Name
            </dt>
            <dd className="mt-1 font-semibold text-forest-950">
              {applicant.first_name} {applicant.last_name}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-stone-500">
              Email Address
            </dt>
            <dd className="mt-1 break-all font-semibold text-forest-950">
              {applicant.email}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-stone-500">
              Position
            </dt>
            <dd className="mt-1 font-semibold text-forest-950">
              {applicant.position_title}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-stone-500">
              Recruitment Status
            </dt>
            <dd className="mt-1 font-semibold text-forest-950">
              {displayStatus(applicant.recruitment_status)}
            </dd>
          </div>
        </dl>
      </section>
      <section className="rounded-2xl border border-forest-900/10 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <CalendarDays className="size-6 text-forest-900" />
          <h2 className="font-display text-xl font-semibold text-forest-950">
            Proposed Interview Schedules
          </h2>
        </div>
        <p className="mt-2 text-sm text-stone-500">
          Enter three available interview options.
          Save them before sending the invitation.
        </p>
        <div className="mt-6 space-y-6">
          {options.map((option, index) => (
            <div
              key={index}
              className="rounded-xl border border-forest-900/10 bg-ivory-100/40 p-4"
            >
              <h3 className="font-semibold text-forest-950">
                Option {index + 1}
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={option.date}
                    onChange={(event) =>
                      updateOption(
                        index,
                        "date",
                        event.target.value,
                      )
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Time
                  </label>
                  <input
                    type="time"
                    value={option.time}
                    onChange={(event) =>
                      updateOption(
                        index,
                        "time",
                        event.target.value,
                      )
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Timezone
                  </label>
                  <input
                    type="text"
                    value={option.timezone}
                    onChange={(event) =>
                      updateOption(
                        index,
                        "timezone",
                        event.target.value,
                      )
                    }
                    placeholder="Africa/Lagos"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          disabled={!!busy}
          onClick={() => saveDetails("options")}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-forest-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy === "options" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save Interview Options
        </button>
      </section>
      <section className="rounded-2xl border border-forest-900/10 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <Clock3 className="size-6 text-forest-900" />
          <h2 className="font-display text-xl font-semibold text-forest-950">
            Confirmed Zoom Interview
          </h2>
        </div>
        <p className="mt-2 text-sm text-stone-500">
          Save these details before sending a
          confirmation or reminder.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>
              Interview Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(event) =>
                setDate(event.target.value)
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Interview Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(event) =>
                setTime(event.target.value)
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Timezone
            </label>
            <input
              type="text"
              value={timezone}
              onChange={(event) =>
                setTimezone(event.target.value)
              }
              placeholder="Africa/Lagos"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Zoom Meeting ID
            </label>
            <input
              value={meetingId}
              onChange={(event) =>
                setMeetingId(event.target.value)
              }
              placeholder="Enter meeting ID"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>
              Zoom Meeting Link
            </label>
            <input
              type="url"
              value={meetingUrl}
              onChange={(event) =>
                setMeetingUrl(event.target.value)
              }
              placeholder="https://zoom.us/j/..."
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>
              Zoom Passcode
            </label>
            <input
              value={passcode}
              onChange={(event) =>
                setPasscode(event.target.value)
              }
              placeholder="Enter Zoom passcode"
              className={inputClass}
            />
          </div>
        </div>
        <button
          type="button"
          disabled={!!busy}
          onClick={() => saveDetails("meeting")}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-forest-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy === "meeting" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save Zoom Interview Details
        </button>
      </section>
    <section className="rounded-2xl border border-forest-900/10 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="font-display text-xl font-semibold text-forest-950">Employment Offer Details</h2>
      <p className="mt-2 text-sm text-stone-500">Save offer terms before sending. Start date and employment type are optional.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div><label className={labelClass}>Start Date (Optional)</label><input type="date" value={offerStartDate} onChange={e => setOfferStartDate(e.target.value)} className={inputClass}/></div>
        <div><label className={labelClass}>Employment Type (Optional)</label><select value={offerEmploymentType} onChange={e => setOfferEmploymentType(e.target.value)} className={inputClass}>
          <option value="">Not selected</option>{["Part-Time","Full-Time","Contract","Temporary","Internship","Event-Based"].map(x => <option key={x} value={x}>{x}</option>)}
        </select></div>
        <div><label className={labelClass}>Department</label><input value={offerDepartment} onChange={e => setOfferDepartment(e.target.value)} className={inputClass}/></div>
        <div><label className={labelClass}>Working Arrangement</label><input value={offerWorkingArrangement} onChange={e => setOfferWorkingArrangement(e.target.value)} className={inputClass}/></div>
        <div className="sm:col-span-2"><label className={labelClass}>Compensation</label><input value={offerCompensation} onChange={e => setOfferCompensation(e.target.value)} className={inputClass}/></div>
      </div>
      <button type="button" disabled={!!busy} onClick={saveOffer} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-forest-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"><Save className="size-4"/>Save Employment Offer Details</button>
      <div className="mt-6 border-t pt-5"><label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" checked={offerAccepted} disabled={!!busy} onChange={e => updateAcceptance(e.target.checked)}/>Applicant accepted the employment offer (admin confirmation)</label></div>
    </section>
    <section className="rounded-2xl border border-forest-900/10 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3"><Paperclip className="size-5"/><h2 className="font-display text-xl font-semibold text-forest-950">Employee Handbook Attachment</h2></div>
      <p className="mt-2 text-sm text-stone-500">Private PDF or DOCX, up to 10 MB. Save the file before sending onboarding.</p>
      {handbookName && <div className="mt-4 flex flex-wrap items-center gap-3 text-sm"><span>{handbookName}</span><a className="inline-flex items-center gap-1 text-forest-900 underline" href={`/api/admin/staff/${applicant.id}/handbook`}><Download className="size-4"/>Download</a><button type="button" disabled={!!busy} onClick={removeHandbook} className="inline-flex items-center gap-1 text-red-700"><Trash2 className="size-4"/>Remove</button></div>}
      <div className="mt-4 flex flex-wrap items-center gap-3"><input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={e => setHandbookFile(e.target.files?.[0] ?? null)} className="text-sm"/><button type="button" disabled={!handbookFile || !!busy} onClick={uploadHandbook} className="rounded-xl bg-forest-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">{handbookName ? "Replace Handbook" : "Upload Handbook"}</button></div>
    </section>
      <section className="rounded-2xl border border-forest-900/10 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <Mail className="size-6 text-forest-900" />
          <h2 className="font-display text-xl font-semibold text-forest-950">
            Recruitment Emails
          </h2>
        </div>
        <p className="mt-2 text-sm text-stone-500">
          Preview each email and send it manually.
          Emails use the applicant's saved name and position.
        </p>
        <div className="mt-6 space-y-4">
          {EMAIL_ACTIONS.map((action) => {
            const isBlocked =
              (action.type === "interview_invitation" &&
                !optionsReady) ||
              ((action.type === "interview_confirmation" ||
                action.type === "interview_reminder") &&
                !meetingReady) ||
            (action.type === "employment_offer" && offerDirty) ||
            (action.type === "welcome_onboarding" && (!handbookName || !offerAccepted || offerDirty)) ||
            (action.type === "payroll_id_onboarding" && !offerAccepted);
            return (
              <div
                key={action.type}
                className="rounded-xl border border-forest-900/10 p-5"
              >
                <h3 className="font-semibold text-forest-950">
                  {action.title}
                </h3>
                <p className="mt-1 text-sm text-stone-500">
                  {action.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setPreview(
                        preview === action.type
                          ? null
                          : action.type,
                      )
                    }
                    className="rounded-xl border border-forest-900/15 px-4 py-2.5 text-sm font-semibold text-forest-900"
                  >
                    {preview === action.type
                      ? "Hide Preview"
                      : "Preview Email"}
                  </button>
                  <button
                    type="button"
                    disabled={!!busy || isBlocked}
                    onClick={() =>
                      sendEmail(action.type)
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-forest-950 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {busy === action.type ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    {action.button}
                  </button>
                </div>
                {isBlocked && (
                  <p className="mt-3 text-xs text-amber-700">
                    Complete and save the required
                    interview details to enable sending.
                  </p>
                )}
                {preview === action.type && (
                  <div className="mt-5 rounded-xl bg-ivory-100 p-5">
                    <p className="mb-4 text-sm font-semibold text-forest-950">
                      Subject: {action.title}
                    </p>
                    <PreviewText
                      type={action.type}
                      applicant={applicant}
                      options={options}
                      date={date}
                      time={time}
                      timezone={timezone}
                      meetingUrl={meetingUrl}
                      meetingId={meetingId}
                      passcode={passcode}
                    offerStartDate={offerStartDate} offerDepartment={offerDepartment}
                    offerEmploymentType={offerEmploymentType} offerWorkingArrangement={offerWorkingArrangement}
                    offerCompensation={offerCompensation} handbookName={handbookName}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
      <section className="rounded-2xl border border-forest-900/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-xl font-semibold text-forest-950">
          Recruitment Email History
        </h2>
        {emailLogs.length === 0 ? (
          <p className="mt-5 text-sm text-stone-500">
            No recruitment emails have been sent yet.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {emailLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-forest-900/10 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-forest-950">
                    {log.subject}
                  </p>
                  <span className="rounded-full bg-ivory-100 px-3 py-1 text-xs font-semibold text-forest-900">
                    {displayStatus(log.delivery_status)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-stone-500">
                  {formatDateTime(log.created_at)}
                </p>
                {log.error_message && (
                  <p className="mt-3 break-words text-sm text-red-700">
                    {log.error_message}
                  </p>
                )}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-semibold text-forest-900">
                    View Sent Content
                  </summary>
                  <pre className="mt-3 whitespace-pre-wrap break-words rounded-lg bg-ivory-100 p-4 font-sans text-xs leading-6 text-stone-700">
                    {log.body_text}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
