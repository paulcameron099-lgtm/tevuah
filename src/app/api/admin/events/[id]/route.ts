
import "server-only";

import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { sendApplicationMail } from "@/src/lib/email/application-mailer";
import { buildParticipationCommitmentEmail } from "@/src/lib/email/event-participation-email";

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
  | "resend_invitation"
  | "preview_participation_commitment"
  | "save_participation_commitment"
  | "send_participation_commitment"
  | "resend_participation_commitment";

type EmailType = "meeting_request" | "meeting_invitation";

type MeetingInput = {
  meetingDate: string;
  meetingTime: string;
  timezone: string;
  platform: string;
  meetingUrl: string;
  meetingId: string;
  passcode: string;
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
    value === "resend_invitation" ||
    value === "preview_participation_commitment" ||
    value === "save_participation_commitment" ||
    value === "send_participation_commitment" ||
    value === "resend_participation_commitment"
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
    "meetingId",
    "passcode",
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
    meetingId: (record.meetingId as string).trim(),
    passcode: (record.passcode as string).trim(),
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

  if (meeting.platform !== "Zoom") return "This confirmation requires Zoom as the meeting platform.";
  if (!meeting.meetingId || meeting.meetingId.length > 100) return "Enter the Zoom meeting ID.";
  if (!meeting.passcode || meeting.passcode.length > 100) return "Enter the Zoom meeting passcode.";
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
  if (!Array.isArray(value) || value.length < 1 || value.length > 10) return null;
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

// Only complete options are included in an outgoing email. Drafts may have blanks,
// repeated dates/times, or past dates; no distinct/future-date rule is enforced.
function parseScreeningOptions(value: unknown): ScreeningOption[] | null {
  const draft = parseScreeningDraft(value);
  if (!draft) return null;
  const complete: ScreeningOption[] = [];
  for (const option of draft) {
    // Ignore incomplete draft slots instead of blocking the whole email.
    if (!option.meetingDate || !option.meetingTime) continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(option.meetingDate)) return null;
    const day = new Date(`${option.meetingDate}T00:00:00Z`);
    if (Number.isNaN(day.getTime()) || day.toISOString().slice(0, 10) !== option.meetingDate) return null;
    if (!/^\d{2}:\d{2}$/.test(option.meetingTime)) return null;
    const [hour, minute] = option.meetingTime.split(":").map(Number);
    if (hour > 23 || minute > 59 || !option.timezone) return null;
    try {
      new Intl.DateTimeFormat("en-GB", { timeZone: option.timezone });
    } catch { return null; }
    complete.push(option);
  }
  return complete.length ? complete : null;
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

  // A reverse proxy may give request.url an internal origin. Compare against
  // the public host as well, and optionally an explicitly configured site URL.
  // Do not allow arbitrary origins or disable the CSRF origin check.
  if (origin) {
    let originUrl: URL;
    try { originUrl = new URL(origin); }
    catch { return fail("Invalid request origin.", 403); }

    const configuredOrigins = [
      process.env.APP_URL,
      process.env.NEXT_PUBLIC_SITE_URL,
      process.env.NEXT_PUBLIC_APP_URL,
    ].filter((value): value is string => Boolean(value));
    const allowedOrigins = new Set([new URL(request.url).origin]);
    for (const value of configuredOrigins) {
      try { allowedOrigins.add(new URL(value).origin); } catch { /* Ignore invalid configuration. */ }
    }
    // `Host` is the public host for normal Next.js requests. A reverse proxy
    // should be configured to pass the original Host header through.
    const host = request.headers.get("host");
    if (host) {
      const protocol = originUrl.protocol;
      if (protocol === "https:" || (protocol === "http:" && /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host))) {
        allowedOrigins.add(`${protocol}//${host}`);
      }
    }
    if (!allowedOrigins.has(originUrl.origin)) {
      return fail("Cross-origin request rejected. Verify APP_URL and reverse-proxy Host configuration.", 403);
    }
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
    .select("id,first_name,last_name,email,event_slug,event_title,event_date,event_location,status,screening_options")
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


  // Participation commitment: independent of the existing screening/meeting email flow.
  if (action === "preview_participation_commitment" ||
      action === "save_participation_commitment" ||
      action === "send_participation_commitment" ||
      action === "resend_participation_commitment") {
    const raw = body.commitment;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return fail("Commitment details are required.");
    const fields = raw as Record<string, unknown>;
    const refundable = typeof fields.refundable_commitment_amount === "string" ? fields.refundable_commitment_amount.trim() : "";
    const currency = typeof fields.refundable_commitment_currency === "string" ? fields.refundable_commitment_currency.trim() : "";
    const amount = typeof fields.commitment_amount_btc === "string" ? fields.commitment_amount_btc.trim() : "";
    const deadline = typeof fields.payment_deadline === "string" ? fields.payment_deadline.trim() : "";
    const address = typeof fields.bitcoin_address === "string" ? fields.bitcoin_address.trim() : "";
    const paymentLink = typeof fields.bitcoin_payment_link === "string" ? fields.bitcoin_payment_link.trim() : "";
    const completed = fields.screening_completed === true;
    if (refundable && (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(refundable) || Number(refundable) <= 0 || Number(refundable) > 999999999999)) return fail("Enter a positive refundable commitment amount (up to two decimals).");
    if (!(["USD", "GBP", "EUR"].includes(currency))) return fail("Select a valid commitment currency.");
    if (amount.length > 40 || deadline.length > 10 || address.length > 200 || paymentLink.length > 2000) return fail("Commitment details exceed the permitted length.");
    if (amount && (!/^(?:0|[1-9]\d*)(?:\.\d{1,8})?$/.test(amount) || Number(amount) <= 0 || Number(amount) > 999999999999)) return fail("Enter a positive BTC amount with up to 8 decimal places.");
    if (deadline) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline) || Number.isNaN(Date.parse(`${deadline}T00:00:00Z`)) || new Date(`${deadline}T00:00:00Z`).toISOString().slice(0,10) !== deadline) return fail("Enter a valid payment deadline.");
    }
    if (paymentLink) {
      try {
        const url = new URL(paymentLink);
        if (url.protocol !== "https:" || url.username || url.password || !url.hostname.includes(".")) return fail("Enter a valid HTTPS payment link.");
      } catch { return fail("Enter a valid HTTPS payment link."); }
    }
    const isPreview = action === "preview_participation_commitment";
    const isSending = action !== "save_participation_commitment" && !isPreview;
    if (isSending && (!completed || !refundable || !amount || !deadline || !address || !paymentLink)) return fail("Confirm screening completion and complete all commitment and payment details.");
    if (isSending && deadline < new Date().toISOString().slice(0, 10)) return fail("Payment deadline must not be in the past.");
    if (isPreview) {
      const message = buildParticipationCommitmentEmail({
        firstName: registration.first_name, eventName: registration.event_title,
        eventDate: registration.event_date ?? "", eventLocation: registration.event_location ?? "",
        refundableCommitment: refundable ? `${currency} ${refundable}` : "[Refundable Commitment]",
        amountBtc: amount || "[BTC Amount]", paymentDeadline: deadline || "[Payment Deadline]",
        bitcoinAddress: address || "[Bitcoin Address]", bitcoinPaymentLink: paymentLink || "[Bitcoin Payment URL]",
      });
      return NextResponse.json({ ok: true, html: message.html }, { headers: { "Cache-Control": "no-store" } });
    }
    const { data: existing, error: existingError } = await admin.from("event_participation_commitments")
      .select("id,commitment_amount_btc,refundable_commitment_amount,refundable_commitment_currency,payment_deadline,bitcoin_address,bitcoin_payment_link,screening_completed,status")
      .eq("registration_id", id).maybeSingle();
    if (existingError) return fail("Could not load commitment record.", 500);
    if (existing?.screening_completed && !completed) return fail("Screening completion cannot be reversed from this form.", 409);
    const { data: previous, error: previousError } = await admin.from("event_email_logs")
      .select("id").eq("registration_id", id).eq("email_type", "participation_commitment")
      .eq("delivery_status", "sent").limit(1);
    if (previousError) return fail("Could not verify previous commitment emails.", 500);
    const alreadySent = (previous?.length ?? 0) > 0;
    if (isSending && action === "send_participation_commitment" && alreadySent) return fail("Already sent. Use the resend action.", 409);
    if (isSending && action === "resend_participation_commitment" && !alreadySent) return fail("No previously sent commitment email exists to resend.", 409);
    if (isSending && !registration.event_title?.trim()) return fail("Event name is missing from this registration.");
    if (isSending && (!registration.event_date?.trim() || !registration.event_location?.trim())) return fail("Event date or location is missing from this registration.");
    if (isSending && !registration.first_name?.trim()) return fail("Applicant first name is missing.");
    // Do not change payment instructions after an accepted email without explicit resend.
    const { error: saveError } = await admin.from("event_participation_commitments").upsert({
      registration_id: id,
      commitment_amount_btc: amount || null,
      refundable_commitment_amount: refundable || null,
      refundable_commitment_currency: currency,
      payment_deadline: deadline || null,
      bitcoin_address: address || null,
      bitcoin_payment_link: paymentLink || null,
      screening_completed: completed,
      screening_completed_at: completed ? new Date().toISOString() : null,
      status: alreadySent ? "sent" : isSending ? "ready" : "draft",
      updated_at: new Date().toISOString(),
    }, { onConflict: "registration_id" });
    if (saveError) { console.error("[EVENTS] Save commitment:", saveError); return fail("Could not save commitment details.", 500); }
    if (!isSending) return success("Participation commitment draft saved.");
    const message = buildParticipationCommitmentEmail({
      firstName: registration.first_name,
      eventName: registration.event_title,
      eventDate: registration.event_date,
      eventLocation: registration.event_location,
      refundableCommitment: `${currency} ${refundable}`,
      amountBtc: amount,
      paymentDeadline: deadline,
      bitcoinAddress: address,
      bitcoinPaymentLink: paymentLink,
    });
    const { data: history, error: historyError } = await admin.from("event_email_logs")
      .select("attempt_number").eq("registration_id", id).eq("email_type", "participation_commitment")
      .order("attempt_number", { ascending: false }).limit(1);
    if (historyError) return fail("Could not read commitment email history.", 500);
    const { data: log, error: logError } = await admin.from("event_email_logs").insert({
      registration_id: id, email_type: "participation_commitment", recipient_email: registration.email,
      subject: message.subject, delivery_status: "sending",
      attempt_number: (history?.[0]?.attempt_number ?? 0) + 1, sent_by: user.id,
    }).select("id").single();
    if (logError || !log) return fail("Another email may be sending. Check history before retrying.", 409);
    let delivery: { sent: boolean; messageId?: string; error?: string };
    try { delivery = await sendApplicationMail({ to: registration.email, ...message }); }
    catch (error) { delivery = { sent: false, error: error instanceof Error ? error.message : "SMTP error." }; }
    const sentAt = delivery.sent ? new Date().toISOString() : null;
    const { error: updateLogError } = await admin.from("event_email_logs").update({
      delivery_status: delivery.sent ? "sent" : "failed", provider_message_id: delivery.messageId ?? null,
      error_message: delivery.sent ? null : delivery.error ?? "SMTP send failed.", sent_at: sentAt,
    }).eq("id", log.id);
    if (updateLogError) return fail("SMTP completed but the log update failed. Verify delivery before retrying.", 500);
    if (!delivery.sent) return fail("SMTP did not accept the commitment email. Failure was logged.", 502);
    const { error: updateCommitmentError } = await admin.from("event_participation_commitments")
      .update({ status: "sent", email_sent_at: sentAt, updated_at: sentAt }).eq("registration_id", id);
    if (updateCommitmentError) return fail("SMTP accepted the email but commitment status update failed. Check history before retrying.", 500);
    return success("Participation & Commitment Details accepted by SMTP.");
  }

  // Save 1–10 proposed screening options without emailing the applicant.
  if (action === "save_screening_options") {
    const options = parseScreeningDraft(body.screeningOptions);
    if (!options) {
      return fail("Provide 1–10 screening draft slots. Dates and times may be completed later.");
    }
    const { error } = await admin.from("event_registrations")
      .update({ screening_options: options }).eq("id", id);
    if (error) {
      console.error("[EVENTS] Save screening options:", error);
      return fail("Could not save proposed screening options.", 500);
    }
    return success("Screening options saved. At least one complete date, time and timezone is needed to send an invitation.");
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
          meeting_id: meeting.meetingId,
          meeting_passcode: meeting.passcode,
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
    return fail("Before emailing, provide at least one complete screening date, time and valid timezone.", 400);
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
      .update({ status: registration.status === "meeting_scheduled" ? "meeting_scheduled" : "meeting_requested" })
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
          meeting_id: meeting.meetingId,
          meeting_passcode: meeting.passcode,
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
