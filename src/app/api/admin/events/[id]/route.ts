
import "server-only";

import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { sendApplicationMail } from "@/src/lib/email/application-mailer";

import {
  buildMeetingAvailabilityEmail,
  buildMeetingInvitationEmail,
} from "@/src/lib/email/event-meeting-emails";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type Action =
  | "request_availability"
  | "resend_availability"
  | "save_screening_options"
  | "save_meeting"
  | "send_invitation"
  | "resend_invitation";

type EmailType = "meeting_request" | "meeting_invitation";

type MeetingInput = {
  meetingDate: string;
  meetingTime: string;
  timezone: string;
  platform: string;
  meetingUrl: string;
};

function fail(message: string, status = 400) {
  return NextResponse.json(
    { ok: false, error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

function success(message: string) {
  return NextResponse.json(
    { ok: true, message },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}

function isUUID(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isAction(value: unknown): value is Action {
  return (
    value === "request_availability" ||
    value === "resend_availability" ||
    value === "save_screening_options" ||
    value === "save_meeting" ||
    value === "send_invitation" ||
    value === "resend_invitation"
  );
}

function parseMeeting(value: unknown): MeetingInput | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const record = value as Record<string, unknown>;

  const fields = [
    "meetingDate",
    "meetingTime",
    "timezone",
    "platform",
    "meetingUrl",
  ] as const;

  for (const field of fields) {
    if (typeof record[field] !== "string") {
      return null;
    }
  }

  return {
    meetingDate: (record.meetingDate as string).trim(),
    meetingTime: (record.meetingTime as string).trim(),
    timezone: (record.timezone as string).trim(),
    platform: (record.platform as string).trim(),
    meetingUrl: (record.meetingUrl as string).trim(),
  };
}

function validateMeeting(meeting: MeetingInput): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meeting.meetingDate)) {
    return "Enter a valid meeting date.";
  }

  const date = new Date(`${meeting.meetingDate}T00:00:00Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== meeting.meetingDate
  ) {
    return "Enter a valid calendar date.";
  }

  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(meeting.meetingTime)) {
    return "Enter a valid meeting time.";
  }

  const [hours, minutes, seconds = 0] = meeting.meetingTime
    .split(":")
    .map(Number);

  if (hours > 23 || minutes > 59 || seconds > 59) {
    return "Enter a valid meeting time.";
  }

  if (!meeting.timezone || meeting.timezone.length > 100) {
    return "A valid meeting timezone is required.";
  }

  if (!meeting.platform || meeting.platform.length > 100) {
    return "A valid meeting platform is required.";
  }

  try {
    new Intl.DateTimeFormat("en-GB", {
      timeZone: meeting.timezone,
    });
  } catch {
    return "Enter a valid timezone, such as Europe/London.";
  }

  if (meeting.meetingUrl.length > 2000) {
    return "Meeting URL is too long.";
  }

  try {
    const url = new URL(meeting.meetingUrl);

    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      !url.hostname.includes(".")
    ) {
      return "Enter a valid HTTPS meeting URL.";
    }
  } catch {
    return "Enter a valid HTTPS meeting URL.";
  }

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: meeting.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const current = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  const currentLocal =
    `${current.year}-${current.month}-${current.day}` +
    `T${current.hour}:${current.minute}`;

  const requestedLocal =
    `${meeting.meetingDate}T${meeting.meetingTime.slice(0, 5)}`;

  if (requestedLocal <= currentLocal) {
    return "Choose a meeting date and time in the future.";
  }

  return null;
}

type ScreeningOption = { meetingDate: string; meetingTime: string; timezone: string };

// Drafts may be incomplete. The strict parser below is used only before emailing.
function parseScreeningDraft(value: unknown): ScreeningOption[] | null {
  if (!Array.isArray(value) || value.length < 2 || value.length > 5) return null;
  const options: ScreeningOption[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const record = item as Record<string, unknown>;
    if (
      typeof record.meetingDate !== "string" ||
      typeof record.meetingTime !== "string" ||
      typeof record.timezone !== "string"
    ) return null;
    const option = {
      meetingDate: record.meetingDate.trim(),
      meetingTime: record.meetingTime.trim(),
      timezone: record.timezone.trim(),
    };
    if (
      option.meetingDate.length > 10 ||
      option.meetingTime.length > 8 ||
      option.timezone.length > 100
    ) return null;
    options.push(option);
  }
  return options;
}

function parseScreeningOptions(value: unknown): ScreeningOption[] | null {
  const options = parseScreeningDraft(value);
  if (!options) return null;
  const unique = new Set<string>();
  for (const option of options) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(option.meetingDate)) return null;
    const day = new Date(`${option.meetingDate}T00:00:00Z`);
    if (Number.isNaN(day.getTime()) || day.toISOString().slice(0, 10) !== option.meetingDate) return null;
    if (!/^\d{2}:\d{2}$/.test(option.meetingTime)) return null;
    const [hour, minute] = option.meetingTime.split(":").map(Number);
    if (hour > 23 || minute > 59 || !option.timezone) return null;
    try {
      new Intl.DateTimeFormat("en-GB", { timeZone: option.timezone });
    } catch { return null; }
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: option.timezone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date());
    const current = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    if (`${option.meetingDate}T${option.meetingTime}` <= `${current.year}-${current.month}-${current.day}T${current.hour}:${current.minute}`) return null;
    const key = `${option.meetingDate}|${option.meetingTime}|${option.timezone}`;
    if (unique.has(key)) return null;
    unique.add(key);
  }
  return options;
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext,
) {
  // 1. Authenticate administrator.
  const user = await getCurrentUser();

  if (!user) {
    return fail("Authentication required.", 401);
  }

  if (user.role !== "admin" && user.role !== "super_admin") {
    return fail("Administrator access required.", 403);
  }

  const { id } = await params;

  if (!isUUID(id)) {
    return fail("Invalid registration ID.");
  }

  // 2. Validate request origin and JSON body.
  const origin = request.headers.get("origin");

  if (origin && origin !== new URL(request.url).origin) {
    return fail("Cross-origin request rejected.", 403);
  }

  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .includes("application/json")
  ) {
    return fail("Expected a JSON request.", 415);
  }

  let body: Record<string, unknown>;

  try {
    const raw = await request.text();

    if (Buffer.byteLength(raw, "utf8") > 12000) {
      return fail("Request body is too large.", 413);
    }

    const parsed: unknown = JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return fail("Invalid request body.");
    }

    body = parsed as Record<string, unknown>;
  } catch {
    return fail("Invalid JSON request.");
  }

  if (!isAction(body.action)) {
    return fail("Unsupported action.");
  }

  const action = body.action;

  // 3. Initialize Supabase admin client.
  const admin = createAdminClient();

  // 4. Load registration.
  // IMPORTANT: Use a literal selection string for Supabase typing.
  const {
    data: registration,
    error: registrationError,
  } = await admin
    .from("event_registrations")
    .select("id,first_name,last_name,email,event_title,status,screening_options")
    .eq("id", id)
    .maybeSingle();

  if (registrationError) {
    console.error("[EVENTS] Registration lookup:", registrationError);
    return fail("Could not load registration.", 500);
  }

  if (!registration) {
    return fail("Registration not found.", 404);
  }

  if (
    registration.status === "completed" ||
    registration.status === "cancelled"
  ) {
    return fail("This registration is closed.", 409);
  }

  // Save 2–5 proposed screening options without emailing the applicant.
  if (action === "save_screening_options") {
    if (registration.status === "meeting_scheduled") {
      return fail("A meeting is already scheduled; proposed options cannot be changed.", 409);
    }
    const options = parseScreeningDraft(body.screeningOptions);
    if (!options) {
      return fail("Provide 2–5 screening draft slots. Dates and times may be completed later.");
    }
    const { error } = await admin.from("event_registrations")
      .update({ screening_options: options }).eq("id", id);
    if (error) {
      console.error("[EVENTS] Save screening options:", error);
      return fail("Could not save proposed screening options.", 500);
    }
    return success("Screening options draft saved. Complete all dates, times and timezones before sending the invitation.");
  }

  // 5. Load existing meeting.
  const {
    data: existingMeeting,
    error: meetingReadError,
  } = await admin
    .from("event_meetings")
    .select("id,status")
    .eq("registration_id", id)
    .maybeSingle();

  if (meetingReadError) {
    console.error("[EVENTS] Meeting lookup:", meetingReadError);
    return fail("Could not load meeting details.", 500);
  }

  const isInvitation =
    action === "send_invitation" ||
    action === "resend_invitation";

  const isAvailability =
    action === "request_availability" ||
    action === "resend_availability";

  const isResend =
    action === "resend_availability" ||
    action === "resend_invitation";

  // 6. Validate meeting details when required.
  let meeting: MeetingInput | null = null;

  if (isInvitation || action === "save_meeting") {
    meeting = parseMeeting(body.meeting);

    if (!meeting) {
      return fail("Meeting details are required.");
    }

    const validationError = validateMeeting(meeting);

    if (validationError) {
      return fail(validationError);
    }
  }

  // 7. Save meeting details without sending an email.
  if (action === "save_meeting") {
    if (!meeting) {
      return fail("Meeting details are required.");
    }

    const { error } = await admin
      .from("event_meetings")
      .upsert(
        {
          registration_id: id,
          meeting_date: meeting.meetingDate,
          meeting_time: meeting.meetingTime,
          timezone: meeting.timezone,
          platform: meeting.platform,
          meeting_url: meeting.meetingUrl,
          status: existingMeeting?.status ?? "draft",
        },
        {
          onConflict: "registration_id",
        },
      );

    if (error) {
      console.error("[EVENTS] Save meeting:", error);
      return fail("Could not save meeting details.", 500);
    }

    return success("Meeting details saved successfully.");
  }

  // 8. Determine email type.
  const emailType: EmailType = isInvitation
    ? "meeting_invitation"
    : "meeting_request";

  if (
    isAvailability &&
    registration.status === "meeting_scheduled"
  ) {
    return fail(
      "A meeting is already scheduled. Review the meeting before requesting availability.",
      409,
    );
  }

  // 9. Check previously accepted emails.
  const {
    data: previousEmails,
    error: previousError,
  } = await admin
    .from("event_email_logs")
    .select("id")
    .eq("registration_id", id)
    .eq("email_type", emailType)
    .eq("delivery_status", "sent")
    .limit(1);

  if (previousError) {
    console.error("[EVENTS] Previous emails:", previousError);
    return fail("Could not verify previous emails.", 500);
  }

  const alreadySent = (previousEmails?.length ?? 0) > 0;

  if (isResend && !alreadySent) {
    return fail(
      "No previously accepted email exists to resend.",
      409,
    );
  }

  if (!isResend && alreadySent) {
    return fail(
      "This email was already sent. Use the resend action.",
      409,
    );
  }

  // 10. Build email.
  const recipient = {
    firstName: registration.first_name,
    eventTitle: registration.event_title,
  };

  if (isInvitation && !meeting) {
    return fail("Meeting details are required.");
  }

  const screeningOptions = isAvailability
    ? parseScreeningOptions(registration.screening_options)
    : null;

  if (isAvailability && !screeningOptions) {
    return fail("Before emailing, complete 2–5 distinct future screening dates and times with valid IANA timezones.", 400);
  }

  const message = isInvitation && meeting
    ? buildMeetingInvitationEmail(recipient, meeting)
    : buildMeetingAvailabilityEmail(recipient, screeningOptions!);

  // 11. Determine next attempt number.
  const {
    data: history,
    error: historyError,
  } = await admin
    .from("event_email_logs")
    .select("attempt_number")
    .eq("registration_id", id)
    .eq("email_type", emailType)
    .order("attempt_number", { ascending: false })
    .limit(1);

  if (historyError) {
    console.error("[EVENTS] Email history:", historyError);
    return fail("Could not read email history.", 500);
  }

  const attemptNumber =
    (history?.[0]?.attempt_number ?? 0) + 1;

  // 12. Create a sending record before contacting SMTP.
  const {
    data: log,
    error: logError,
  } = await admin
    .from("event_email_logs")
    .insert({
      registration_id: id,
      email_type: emailType,
      recipient_email: registration.email,
      subject: message.subject,
      delivery_status: "sending",
      attempt_number: attemptNumber,
      sent_by: user.id,
    })
    .select("id")
    .single();

  if (logError || !log) {
    console.error("[EVENTS] Create email log:", logError);

    return fail(
      "An email attempt may already be in progress. Check the email history before retrying.",
      409,
    );
  }

  // 13. Send using the existing Zoho SMTP mailer.
  let delivery: {
    sent: boolean;
    messageId?: string;
    error?: string;
  };

  try {
    delivery = await sendApplicationMail({
      to: registration.email,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
  } catch (error) {
    delivery = {
      sent: false,
      error:
        error instanceof Error
          ? error.message
          : "Unexpected SMTP error.",
    };
  }

  const sentAt = delivery.sent
    ? new Date().toISOString()
    : null;

  // 14. Update email delivery history.
  const { error: logUpdateError } = await admin
    .from("event_email_logs")
    .update({
      delivery_status: delivery.sent ? "sent" : "failed",
      provider_message_id: delivery.messageId ?? null,
      error_message: delivery.sent
        ? null
        : delivery.error ?? "SMTP send failed.",
      sent_at: sentAt,
    })
    .eq("id", log.id);

  if (logUpdateError) {
    console.error("[EVENTS] Update email log:", logUpdateError);

    return fail(
      "SMTP completed, but the email log could not be updated. Check the mailbox before retrying.",
      500,
    );
  }

  if (!delivery.sent) {
    return fail(
      "SMTP did not accept the email. The failure was recorded.",
      502,
    );
  }

  // 15. Update availability-request status.
  if (isAvailability) {
    const { error } = await admin
      .from("event_registrations")
      .update({ status: "meeting_requested" })
      .eq("id", id);

    if (error) {
      console.error("[EVENTS] Update availability status:", error);

      return fail(
        "SMTP accepted the request, but registration status could not be updated.",
        500,
      );
    }

    return success(
      "Meeting availability request accepted by SMTP.",
    );
  }

  // 16. Save accepted meeting invitation.
  if (isInvitation && meeting) {
    const { error: meetingError } = await admin
      .from("event_meetings")
      .upsert(
        {
          registration_id: id,
          meeting_date: meeting.meetingDate,
          meeting_time: meeting.meetingTime,
          timezone: meeting.timezone,
          platform: meeting.platform,
          meeting_url: meeting.meetingUrl,
          status: "invited",
          invitation_sent_at: sentAt,
        },
        {
          onConflict: "registration_id",
        },
      );

    if (meetingError) {
      console.error("[EVENTS] Save invitation:", meetingError);

      return fail(
        "SMTP accepted the invitation, but meeting details could not be saved.",
        500,
      );
    }

    const { error: statusError } = await admin
      .from("event_registrations")
      .update({ status: "meeting_scheduled" })
      .eq("id", id);

    if (statusError) {
      console.error("[EVENTS] Update meeting status:", statusError);

      return fail(
        "SMTP accepted the invitation, but registration status could not be updated.",
        500,
      );
    }

    return success(
      "Meeting invitation accepted by SMTP and details saved.",
    );
  }

  return fail("Unsupported action.", 400);
}
