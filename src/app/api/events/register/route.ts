
import { NextRequest, NextResponse } from "next/server";

import { getEvent } from "@/src/data/event";

import { createAdminClient } from "@/src/lib/supabase/admin";

import {
  sendApplicationMail,
  getInvestorEnquiryRecipient,
} from "@/src/lib/email/application-mailer";

import {
  buildEventAcknowledgement,
  buildAdminEventNotification,
} from "@/src/lib/email/event-registration-emails";

export const runtime = "nodejs";

type Payload = Record<string, unknown>;

const allowedIntents = [
  "reserve",
  "information",
  "team",
];

const allowedAttendance = [
  "alone",
  "guest",
  "undecided",
];

const allowedCounts = [
  "1",
  "2",
  "3",
  "4",
  "5+",
];

function value(
  body: Payload,
  key: string,
  max = 3000,
) {
  const input = body[key];

  return typeof input === "string"
    ? input.trim().slice(0, max)
    : "";
}

function errorResponse(
  message: string,
  status = 400,
) {
  return NextResponse.json(
    { ok: false, error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

type EmailType =
  | "registration_confirmation"
  | "admin_notification";

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

async function sendAndRecordEmail(
  registrationId: string,
  emailType: EmailType,
  message: EmailPayload,
) {
  const admin = createAdminClient();

  // Each email attempt has its own history entry.
  const { data: log, error: logError } = await admin
    .from("event_email_logs")
    .insert({
      registration_id: registrationId,
      email_type: emailType,
      recipient_email: message.to,
      subject: message.subject,
      delivery_status: "sending",
      attempt_number: 1,
    })
    .select("id")
    .single();

  if (logError) {
    console.error(
      "[EVENT EMAIL] Could not create log",
      logError,
    );

    // Do not send an untracked email.
    return false;
  }

  const delivery = await sendApplicationMail(message);

  const { error: updateError } = await admin
    .from("event_email_logs")
    .update({
      delivery_status: delivery.sent
        ? "sent"
        : "failed",
      provider_message_id: delivery.messageId ?? null,
      error_message: delivery.sent
        ? null
        : (delivery.error ?? "SMTP delivery failed"),
      sent_at: delivery.sent
        ? new Date().toISOString()
        : null,
    })
    .eq("id", log.id);

  if (updateError) {
    console.error(
      "[EVENT EMAIL] Could not update log",
      updateError,
    );
  }

  if (emailType === "registration_confirmation") {
    const { error: statusError } = await admin
      .from("event_registrations")
      .update({
        confirmation_email_status: delivery.sent
          ? "sent"
          : "failed",
        confirmation_sent_at: delivery.sent
          ? new Date().toISOString()
          : null,
      })
      .eq("id", registrationId);

    if (statusError) {
      console.error(
        "[EVENT EMAIL] Confirmation status update failed",
        statusError,
      );
    }
  }

  return delivery.sent;
}

export async function POST(request: NextRequest) {
  const contentType =
    request.headers.get("content-type") ?? "";

  if (
    !contentType
      .toLowerCase()
      .includes("application/json")
  ) {
    return errorResponse(
      "Expected a JSON submission.",
      415,
    );
  }

  const contentLength = Number(
    request.headers.get("content-length") ?? "0",
  );

  if (contentLength > 16000) {
    return errorResponse(
      "Submission is too large.",
      413,
    );
  }

  let body: Payload;

  try {
    const raw: unknown = await request.json();

    if (
      !raw ||
      typeof raw !== "object" ||
      Array.isArray(raw)
    ) {
      return errorResponse("Invalid submission.");
    }

    body = raw as Payload;
  } catch {
    return errorResponse("Invalid JSON submission.");
  }

  // Preserve the existing spam honeypot.
  if (value(body, "website")) {
    return NextResponse.json({ ok: true });
  }

  const eventSlug = value(body, "eventSlug", 200);
  const event = getEvent(eventSlug);

  if (!event) {
    return errorResponse(
      "Please select a valid event.",
    );
  }

  const firstName = value(body, "firstName", 80);
  const lastName = value(body, "lastName", 80);
  const email = value(body, "email", 254);
  const telephone = value(body, "telephone", 40);
  const country = value(body, "country", 100);
  const intent = value(body, "intent", 30);
  const attendance = value(body, "attendance", 30);
  const attendees = value(body, "attendees", 5);
  const comments = value(body, "comments", 3000);
  const futureEvents = value(body, "futureEvents", 10);

  if (
    !firstName ||
    !lastName ||
    !country ||
    firstName.length < 2 ||
    lastName.length < 2
  ) {
    return errorResponse(
      "Please complete your name and country.",
    );
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return errorResponse(
      "Please enter a valid email address.",
    );
  }

  if (
    !allowedIntents.includes(intent) ||
    !allowedAttendance.includes(attendance) ||
    !allowedCounts.includes(attendees) ||
    !["yes", "no"].includes(futureEvents)
  ) {
    return errorResponse(
      "Please check your participation details.",
    );
  }

  if (
    attendance === "alone" &&
    attendees !== "1"
  ) {
    return errorResponse(
      "Attending alone requires one attendee.",
    );
  }

  if (body.privacyAccepted !== true) {
    return errorResponse(
      "Privacy acknowledgement is required.",
    );
  }

  const admin = createAdminClient();

  // Save the registration before sending emails.
  let registrationId: string;

  try {
    const { data, error } = await admin
      .from("event_registrations")
      .insert({
        event_slug: eventSlug,
        event_title: event.title,
        event_date: event.date,
        event_location: event.location,
        event_format: event.format,
        event_category: event.category,

        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase(),
        telephone: telephone || null,
        country,

        intent,
        attendance,
        attendees,
        comments: comments || null,

        future_events: futureEvents === "yes",
        privacy_accepted: true,

        status: "new",
        confirmation_email_status: "pending",
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error(
        "[EVENT REGISTRATION] Database insert failed",
        error,
      );

      return errorResponse(
        "We could not save your registration. Please try again.",
        503,
      );
    }

    registrationId = data.id;
  } catch (error) {
    console.error(
      "[EVENT REGISTRATION] Unexpected database error",
      error,
    );

    return errorResponse(
      "Registration is temporarily unavailable. Please try again.",
      503,
    );
  }

  const details = {
    eventTitle: event.title,
    eventDate: event.date,
    eventLocation: event.location,
    eventFormat: event.format,
    eventCategory: event.category,
    firstName,
    lastName,
    email: email.toLowerCase(),
    telephone,
    country,
    intent,
    attendance,
    attendees,
    comments,
    futureEvents: futureEvents === "yes",
  };

  const acknowledgement =
    buildEventAcknowledgement(details);

  // The applicant's email is attempted first.
  try {
    await sendAndRecordEmail(
      registrationId,
      "registration_confirmation",
      {
        to: details.email,
        ...acknowledgement,
      },
    );
  } catch (error) {
    console.error(
      "[EVENT REGISTRATION] Acknowledgement error",
      error,
    );
  }

  // Preserve the internal events-team notification.
  const recipient =
    process.env.EVENTS_ENQUIRY_EMAIL?.trim() ||
    getInvestorEnquiryRecipient();

  if (recipient) {
    const notification =
      buildAdminEventNotification(
        details,
        registrationId,
      );

    try {
      await sendAndRecordEmail(
        registrationId,
        "admin_notification",
        {
          to: recipient,
          ...notification,
        },
      );
    } catch (error) {
      console.error(
        "[EVENT REGISTRATION] Admin notification error",
        error,
      );
    }
  } else {
    console.warn(
      "[EVENT REGISTRATION] Events recipient is not configured",
    );
  }

  // A saved registration remains successful even if
  // an email provider temporarily fails.
  return NextResponse.json(
    {
      ok: true,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
