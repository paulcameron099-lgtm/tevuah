
import "server-only";

export type InterviewOption = {
  date: string;
  time: string;
  timezone: string;
};

export type StaffEmailType =
  | "application_received"
  | "interview_invitation"
  | "interview_confirmation"
  | "interview_reminder";

export type StaffEmailApplicant = {
  first_name: string;
  last_name: string;
  position_title: string;
  interview_options: InterviewOption[];
  interview_date: string | null;
  interview_time: string | null;
  interview_timezone: string | null;
  meeting_url: string | null;
  meeting_id: string | null;
  meeting_passcode: string | null;
};

export type StaffEmailMessage = {
  subject: string;
  text: string;
  html: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const replacements: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return replacements[char] ?? char;
  });
}

function displayDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Invalid interview date.");
  }

  const date = new Date(`${value}T12:00:00Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new Error("Invalid interview date.");
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function displayTime(value: string) {
  const match = /^(\d{2}):(\d{2})(?::00)?$/.exec(value);

  if (!match) {
    throw new Error("Invalid interview time.");
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (hour > 23 || minute > 59) {
    throw new Error("Invalid interview time.");
  }

  return `${String(hour).padStart(2, "0")}:${String(
    minute,
  ).padStart(2, "0")}`;
}

function validateTimezone(value: string) {
  return value.trim();
}

function meetingDetails(applicant: StaffEmailApplicant) {
  const {
    interview_date,
    interview_time,
    interview_timezone,
    meeting_url,
    meeting_id,
    meeting_passcode,
  } = applicant;

  if (
    !interview_date ||
    !interview_time ||
    !interview_timezone ||
    !meeting_url ||
    !meeting_id ||
    !meeting_passcode
  ) {
    throw new Error(
      "Complete the interview date, time, timezone and Zoom details before sending.",
    );
  }

  const url = new URL(meeting_url);

  if (url.protocol !== "https:") {
    throw new Error("The Zoom meeting link must use HTTPS.");
  }

  return [
    `Date: ${displayDate(interview_date)}`,
    `Time: ${displayTime(interview_time)} (${validateTimezone(interview_timezone)})`,
    "Duration: Approximately 10–15 minutes",
    "Platform: Zoom",
    "",
    `Meeting Link: ${meeting_url}`,
    `Meeting ID: ${meeting_id}`,
    `Passcode: ${meeting_passcode}`,
  ].join("\n");
}

export function buildStaffRecruitmentEmail(
  type: StaffEmailType,
  applicant: StaffEmailApplicant,
): StaffEmailMessage {
  const name = [
    applicant.first_name.trim(),
    applicant.last_name.trim(),
  ]
    .filter(Boolean)
    .join(" ");

  const position = applicant.position_title.trim();

  if (!name || !position) {
    throw new Error("Applicant name and position are required.");
  }

  const greeting = `Dear ${name},`;

  let subject: string;
  let text: string;

  switch (type) {
    case "application_received":
      subject = "Application Received";

      text = `${greeting}

Thank you for submitting your application for the ${position} position at Tevuah Reserve.

We confirm that your application details have been received successfully. Our recruitment team will review your submission, and should your qualifications align with the requirements of the position, we will contact you within 24 hours regarding the next stage of the recruitment process.

We appreciate your interest in joining Tevuah Reserve and thank you for your time.

Best regards,
Recruitment Team
Tevuah Reserve`;
      break;

    case "interview_invitation": {
      const options = applicant.interview_options;

      if (!Array.isArray(options) || options.length !== 3) {
        throw new Error(
          "Provide exactly three interview schedule options.",
        );
      }

      const formattedOptions = options.map((option, index) => {
        if (!option.date || !option.time || !option.timezone) {
          throw new Error(
            `Complete all fields for interview option ${index + 1}.`,
          );
        }

        return `Option ${index + 1}: ${displayDate(
          option.date,
        )}, ${displayTime(option.time)} (${validateTimezone(
          option.timezone,
        )})`;
      });

      subject = "Zoom Interview Invitation";

      text = `${greeting}

Thank you for your interest in the ${position} position at Tevuah Reserve.

Following our initial review of your application, we’d like to invite you to a virtual interview with our recruitment team via Zoom.

Please select one of the following available interview schedules:

${formattedOptions.join("\n")}

Kindly confirm your availability by choosing one of the available time slots, or feel free to suggest an alternative that best fits your schedule. Once your selection is confirmed, we’ll send you the Zoom meeting details.

We look forward to speaking with you and learning more about your background and interest in the position.

Best regards,
Paul Vincenzo
Human Resources Manager
Tevuah Reserve`;
      break;
    }

    case "interview_confirmation":
      subject = "Zoom Interview Confirmation";

      text = `${greeting}

Thank you for confirming your availability. Your Zoom interview for the ${position} position has been scheduled as follows:

${meetingDetails(applicant)}

We kindly ask that you join a few minutes before your scheduled interview time to ensure everything is working properly.

During the interview, we’ll discuss your background, the responsibilities of the position, working arrangements, availability, and any questions you may have.

We look forward to meeting you.

Best regards,
Paul Vincenzo
Human Resources Manager
Tevuah Reserve`;
      break;

    case "interview_reminder":
      subject = "Reminder: Zoom Interview";

      text = `${greeting}

Your Zoom interview for the ${position} position has been scheduled as follows:

${meetingDetails(applicant)}

We kindly ask that you join a few minutes before your scheduled interview time to ensure everything is working properly.

During the interview, we’ll discuss your background, the responsibilities of the position, working arrangements, availability, and any questions you may have.

We look forward to meeting you.

Best regards,
Paul Vincenzo
Human Resources Manager
Tevuah Reserve`;
      break;

    default:
      throw new Error("Unsupported recruitment email type.");
  }

  const html = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="margin:0;padding:32px 16px;background:#f7f5ef;font-family:Arial,Helvetica,sans-serif;color:#26352e;">
  <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e8e5dc;border-radius:12px;overflow:hidden;">
    <div style="background:#153c30;padding:24px 32px;color:#fff;font-size:22px;font-weight:bold;">
      Tevuah Reserve
    </div>
    <div style="padding:32px;">
      <h1 style="font-size:22px;line-height:1.4;margin:0 0 24px;color:#153c30;">
        ${escapeHtml(subject)}
      </h1>
      <div style="white-space:pre-wrap;font-size:15px;line-height:1.85;">${escapeHtml(text)}</div>
    </div>
    <div style="padding:20px 32px;background:#f7f5ef;color:#777;font-size:12px;">
      Tevuah Reserve · Recruitment Communications
    </div>
  </div>
</body>
</html>`;

  return { subject, text, html };
}
