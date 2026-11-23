
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

import { sendApplicationMail } from "@/src/lib/email/application-mailer";

import {
  buildStaffRecruitmentEmail,
  type StaffEmailApplicant,
  type StaffEmailType,
  type InterviewOption,
} from "@/src/lib/email/staff-recruitment-email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = {
  params: Promise<{ id: string }>;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EMAIL_TYPES: StaffEmailType[] = [
  "application_received",
  "interview_invitation",
  "interview_confirmation",
  "interview_reminder",
  "employment_offer",
  "welcome_onboarding",
];

const STATUS_BY_EMAIL: Partial<Record<StaffEmailType, string>> = {
  application_received: "application_acknowledged",
  interview_invitation: "interview_invited",
  interview_confirmation: "interview_scheduled",
  interview_reminder: "reminder_sent",
};

function stringValue(value: unknown, maxLength: number) {
  if (value == null || value === "") return null;

  if (typeof value !== "string") {
    throw new Error("Expected a text value.");
  }

  const trimmed = value.trim();

  if (trimmed.length > maxLength) {
    throw new Error(`Value exceeds ${maxLength} characters.`);
  }

  return trimmed || null;
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const parsed = new Date(`${value}T12:00:00Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function validTime(value: string) {
  const match = /^(\d{2}):(\d{2})(?::00)?$/.exec(value);

  return (
    !!match &&
    Number(match[1]) <= 23 &&
    Number(match[2]) <= 59
  );
}


function parseOptions(value: unknown): InterviewOption[] {
  if (!Array.isArray(value) || value.length > 3) {
    throw new Error("Provide up to three interview options.");
  }

  return value.map((item) => {
    if (
      !item ||
      typeof item !== "object" ||
      Array.isArray(item)
    ) {
      throw new Error("Invalid interview option.");
    }

    const date = stringValue(item.date, 10) ?? "";
    const time = stringValue(item.time, 8) ?? "";
    const timezone = stringValue(item.timezone, 100) ?? "";

    if (date && !validDate(date)) {
      throw new Error("Invalid interview option date.");
    }

    if (time && !validTime(time)) {
      throw new Error("Invalid interview option time.");
    }

    

    return { date, time, timezone };
  });
}

async function authorize() {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Authentication required.", status: 401 };
  }

  if (
    user.role !== "admin" &&
    user.role !== "super_admin"
  ) {
    return { error: "Permission denied.", status: 403 };
  }

  return null;
}

async function getApplicantId(context: Context) {
  const { id } = await context.params;
  return UUID_PATTERN.test(id) ? id : null;
}

export async function PATCH(
  request: Request,
  context: Context,
) {
  try {
    const authError = await authorize();

    if (authError) {
      return NextResponse.json(
        { error: authError.error },
        { status: authError.status },
      );
    }

    const id = await getApplicantId(context);

    if (!id) {
      return NextResponse.json(
        { error: "Invalid applicant ID." },
        { status: 400 },
      );
    }

    const body = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    const updates: Record<string, unknown> = {};
    if ("offerAccepted" in body) {
      if (typeof body.offerAccepted !== "boolean") throw new Error("Invalid offer acceptance value.");
      if (body.offerAccepted) {
        const adminCheck = createAdminClient();
        const { data: sentOffer } = await adminCheck.from("staff_recruitment_email_logs")
          .select("id").eq("applicant_id", id).eq("email_type", "employment_offer")
          .eq("delivery_status", "sent").limit(1).maybeSingle();
        if (!sentOffer) throw new Error("Send the employment offer before recording acceptance.");
      }
      updates.offer_accepted_at = body.offerAccepted ? new Date().toISOString() : null;
    }

    if ("interviewOptions" in body) {
      updates.interview_options = parseOptions(
        body.interviewOptions,
      );
    }

    const fields = [
      ["interviewDate", "interview_date", 10],
      ["interviewTime", "interview_time", 8],
      ["interviewTimezone", "interview_timezone", 100],
      ["meetingUrl", "meeting_url", 2000],
      ["meetingId", "meeting_id", 150],
      ["meetingPasscode", "meeting_passcode", 150],
      ["offerStartDate", "offer_start_date", 10],
      ["offerDepartment", "offer_department", 200],
      ["offerEmploymentType", "offer_employment_type", 100],
      ["offerWorkingArrangement", "offer_working_arrangement", 200],
      ["offerCompensation", "offer_compensation", 200],
    ] as const;

    for (const [inputKey, column, maxLength] of fields) {
      if (inputKey in body) {
        updates[column] = stringValue(
          body[inputKey],
          maxLength,
        );
      }
    }

    if (
      updates.interview_date &&
      !validDate(updates.interview_date as string)
    ) {
      throw new Error("Invalid interview date.");
    }

    if (
      updates.interview_time &&
      !validTime(updates.interview_time as string)
    ) {
      throw new Error("Invalid interview time.");
    }

    if (updates.offer_start_date && !validDate(updates.offer_start_date as string)) {
      throw new Error("Invalid offer start date.");
    }

    if (updates.meeting_url) {
      let parsed: URL;

      try {
        parsed = new URL(updates.meeting_url as string);
      } catch {
        throw new Error("Invalid Zoom meeting link.");
      }

      if (parsed.protocol !== "https:") {
        throw new Error("Meeting link must use HTTPS.");
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No changes provided." },
        { status: 400 },
      );
    }

    updates.updated_at = new Date().toISOString();

    const admin = createAdminClient();

    const { data, error } = await admin
      .from("staff_applicants")
      .update(updates)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("[STAFF PATCH]", error);

      return NextResponse.json(
        { error: "Unable to save staff details." },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Applicant not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      applicant: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid interview details.",
      },
      { status: 400 },
    );
  }
}

export async function POST(
  request: Request,
  context: Context,
) {
  try {
    const authError = await authorize();

    if (authError) {
      return NextResponse.json(
        { error: authError.error },
        { status: authError.status },
      );
    }

    const id = await getApplicantId(context);

    if (!id) {
      return NextResponse.json(
        { error: "Invalid applicant ID." },
        { status: 400 },
      );
    }

    const body = await request.json().catch(() => null);

    const emailType = body?.emailType;

    if (
      typeof emailType !== "string" ||
      !EMAIL_TYPES.includes(emailType as StaffEmailType)
    ) {
      return NextResponse.json(
        { error: "Invalid recruitment email type." },
        { status: 400 },
      );
    }

    const type = emailType as StaffEmailType;
    const admin = createAdminClient();

    const { data: applicant, error: applicantError } =
      await admin
        .from("staff_applicants")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (applicantError) {
      console.error("[STAFF EMAIL LOOKUP]", applicantError);

      return NextResponse.json(
        { error: "Unable to load applicant." },
        { status: 500 },
      );
    }

    if (!applicant) {
      return NextResponse.json(
        { error: "Applicant not found." },
        { status: 404 },
      );
    }

    let message;

    try {
      message = buildStaffRecruitmentEmail(
        type,
        applicant as StaffEmailApplicant,
      );
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Email details are incomplete.",
        },
        { status: 400 },
      );
    }

    // Onboarding is only sent after an administrator records offer acceptance.
    if (type === "welcome_onboarding" && !applicant.offer_accepted_at) {
      return NextResponse.json({ error: "Record the applicant's offer acceptance before onboarding." }, { status: 400 });
    }

    let attachments: { filename: string; content: Buffer; contentType: string }[] = [];
    if (type === "welcome_onboarding") {
      if (!applicant.handbook_storage_path || !applicant.handbook_file_name || !applicant.handbook_content_type) {
        return NextResponse.json({ error: "Upload a handbook before sending onboarding." }, { status: 400 });
      }
      const { data: handbook, error: handbookError } = await admin.storage
        .from("staff-handbooks").download(applicant.handbook_storage_path);
      if (handbookError || !handbook) {
        return NextResponse.json({ error: "Unable to retrieve the handbook attachment." }, { status: 500 });
      }
      if (handbook.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "Handbook exceeds 10 MB." }, { status: 400 });
      }
      attachments = [{ filename: applicant.handbook_file_name, content: Buffer.from(await handbook.arrayBuffer()), contentType: applicant.handbook_content_type }];
    }

    // Record the attempt before contacting SMTP.
    const { data: log, error: logError } = await admin
      .from("staff_recruitment_email_logs")
      .insert({
        applicant_id: id,
        email_type: type,
        recipient_email: applicant.email,
        subject: message.subject,
        body_text: message.text,
        delivery_status: "sending",
        attempt_number: 1,
      })
      .select("id")
      .single();

    if (logError || !log) {
      console.error("[STAFF EMAIL LOG]", logError);

      return NextResponse.json(
        { error: "Unable to create email audit record." },
        { status: 500 },
      );
    }

    let delivery;

    try {
      delivery = await sendApplicationMail({
        to: applicant.email,
        subject: message.subject,
        text: message.text,
        html: message.html,
        attachments,
      });
    } catch (error) {
      delivery = {
        sent: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected SMTP failure.",
      };
    }

    const { error: updateLogError } = await admin
      .from("staff_recruitment_email_logs")
      .update({
        delivery_status: delivery.sent ? "sent" : "failed",
        provider_message_id: delivery.messageId ?? null,
        error_message: delivery.error ?? null,
        sent_at: delivery.sent
          ? new Date().toISOString()
          : null,
      })
      .eq("id", log.id);

    if (updateLogError) {
      console.error(
        "[STAFF EMAIL] Unable to finalize email log",
        updateLogError,
      );

      return NextResponse.json(
        {
          error:
            "Email delivery was attempted, but its audit record could not be finalized. Check SMTP logs before sending again.",
        },
        { status: 500 },
      );
    }

    if (!delivery.sent) {
      return NextResponse.json(
        {
          error:
            delivery.error ??
            "Recruitment email delivery failed.",
        },
        { status: 502 },
      );
    }

    // Status updates are secondary to the email audit record.
    // Avoid moving backwards if an earlier email is resent.
    const statusRank: Record<string, number> = {
      new: 0,
      application_acknowledged: 1,
      interview_invited: 2,
      interview_scheduled: 3,
      reminder_sent: 4,
      interview_completed: 5,
      hired: 6,
      not_selected: 6,
    };

    const nextStatus = STATUS_BY_EMAIL[type];
    const currentStatus = applicant.recruitment_status;

    if (
      nextStatus &&
      currentStatus !== "hired" &&
      currentStatus !== "not_selected" &&
      (statusRank[nextStatus] ?? 0) >
        (statusRank[currentStatus] ?? 0)
    ) {
      const { error: statusError } = await admin
        .from("staff_applicants")
        .update({
          recruitment_status: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("recruitment_status", currentStatus);

      if (statusError) {
        console.error("[STAFF EMAIL STATUS]", statusError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Email accepted by the SMTP server.",
      messageId: delivery.messageId ?? null,
    });
  } catch (error) {
    console.error("[STAFF EMAIL] Unexpected error", error);

    return NextResponse.json(
      { error: "Unexpected recruitment email error." },
      { status: 500 },
    );
  }
}
