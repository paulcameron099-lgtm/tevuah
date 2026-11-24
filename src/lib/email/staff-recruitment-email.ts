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
  | "interview_reminder"
  | "employment_offer"
  | "welcome_onboarding"
  | "payroll_id_onboarding";

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

  offer_start_date?: string | null;
  offer_department?: string | null;
  offer_employment_type?: string | null;
  offer_working_arrangement?: string | null;
  offer_compensation?: string | null;
};

export type StaffEmailMessage = {
  subject: string;
  text: string;
  html: string;
};

function escapeHtml(value: string): string {
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

function displayDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Invalid date.");
  }

  const date = new Date(`${value}T12:00:00Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new Error("Invalid date.");
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function displayTime(value: string): string {
  const match =
    /^(\d{2}):(\d{2})(?::00)?$/.exec(value);

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

function validateTimezone(value: string): string {
  // Accept free-text timezone values.
  return value.trim();
}

function meetingDetails(
  applicant: StaffEmailApplicant,
): string {
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
      "Complete the interview date, time, timezone " +
        "and Zoom details before sending.",
    );
  }

  let url: URL;

  try {
    url = new URL(meeting_url);
  } catch {
    throw new Error("Invalid Zoom meeting link.");
  }

  if (url.protocol !== "https:") {
    throw new Error(
      "The Zoom meeting link must use HTTPS.",
    );
  }

  return [
    `Date: ${displayDate(interview_date)}`,
    `Time: ${displayTime(interview_time)} (${validateTimezone(
      interview_timezone,
    )})`,
    "Duration: Approximately 10–15 minutes",
    "Platform: Zoom",
    "",
    `Meeting Link: ${meeting_url}`,
    `Meeting ID: ${meeting_id}`,
    `Passcode: ${meeting_passcode}`,
  ].join("\n");
}

function offerDetails(
  applicant: StaffEmailApplicant,
): string {
  const position = applicant.position_title.trim();

  const department =
    applicant.offer_department?.trim() ||
    "Guest Experience & Events";

  const employmentType =
    applicant.offer_employment_type?.trim() || "";

  const workingArrangement =
    applicant.offer_working_arrangement?.trim() ||
    "Event-based";

  const compensation =
    applicant.offer_compensation?.trim() ||
    "$700 per event";

  const startDate =
    applicant.offer_start_date?.trim() || "";

  const lines = [
    `Job Title: ${position}`,
    `Department: ${department}`,
  ];

  // Employment Type is optional.
  if (employmentType) {
    lines.push(`Employment Type: ${employmentType}`);
  }

  lines.push(
    `Working Arrangement: ${workingArrangement}`,
  );

  // Start Date is optional.
  if (startDate) {
    lines.push(
      `Start Date: ${displayDate(startDate)}`,
    );
  }

  lines.push(`Compensation: ${compensation}`);

  return lines.join("\n");
}

function roleOverview(): string {
  return `In this position, you will support Tevuah Reserve's events and guest-facing activities, helping ensure that every guest receives a welcoming, organized and thoughtful experience.

Your responsibilities will include:

• Coordinating event invitations, registrations, guest lists and attendance confirmations.
• Responding to guest enquiries and providing event-related information.
• Supporting event preparation, venue coordination and on-site guest arrangements.
• Assisting with private dinners, fine-wine tastings, masterclasses, networking gatherings and other hosted engagements.
• Coordinating approved guest gifts, fine-wine selections and special arrangements.
• Liaising with venues, approved suppliers and the event team.
• Maintaining guest records, event notes and assigned task updates.
• Representing Tevuah Reserve with professionalism, discretion and excellent hospitality.`;
}

function employmentOfferText(
  applicant: StaffEmailApplicant,
  greeting: string,
  position: string,
): string {
  const employmentType =
    applicant.offer_employment_type?.trim();

  const positionDescription = employmentType
    ? `${position} (${employmentType})`
    : position;

  const workingArrangement =
    applicant.offer_working_arrangement?.trim() ||
    "Event-based";

  return `${greeting}

We are pleased to offer you the position of ${positionDescription} at Tevuah Reserve.

Following our recruitment process, we believe your experience, communication skills and approach to guest service make you a suitable addition to our team. We look forward to having you contribute to the quality of our events and guest experiences.

POSITION DETAILS

${offerDetails(applicant)}

ROLE OVERVIEW

${roleOverview()}

WORKING ARRANGEMENTS

This is an ${workingArrangement.toLowerCase()} position rather than a daily office or work-from-home role. Your working schedule will be determined by assigned events, preparation requirements, venue visits and agreed team coordination meetings.

The position may involve travel to events in different cities and countries. Tevuah Reserve coordinates and covers approved work-related travel, transportation, accommodation and associated logistics. Where specific attire is required for an international assignment, approved wardrobe arrangements will also be provided or covered by the company.

Further details concerning event assignments, schedules and travel arrangements will be communicated by your supervisor.

ACCEPTANCE OF OFFER

Please confirm your acceptance of this offer by replying to this email with your confirmation. Once we receive your acceptance, our team will proceed with the onboarding arrangements and provide your welcome information.

We are delighted to extend this opportunity to you and look forward to welcoming you to Tevuah Reserve.

Kind regards,
Paul Vincenzo
Human Resources Manager
Tevuah Reserve`;
}

function welcomeOnboardingText(
  applicant: StaffEmailApplicant,
  greeting: string,
  position: string,
): string {
  const employmentType =
    applicant.offer_employment_type?.trim();

  const positionDescription = employmentType
    ? `${position} (${employmentType})`
    : position;

  const workingArrangement =
    applicant.offer_working_arrangement?.trim() ||
    "Event-based";

  return `${greeting}

Welcome to Tevuah Reserve!

We are pleased to officially welcome you to the team as our ${positionDescription}. We appreciate your decision to join us and look forward to working with you.

Your role is an important part of how we deliver our events and engage with our guests. From fine-wine tastings and educational masterclasses to private dinners, networking gatherings and special guest experiences, your contribution will help ensure that every engagement reflects the care, quality and attention to detail associated with Tevuah Reserve.

YOUR ROLE & WORKING ARRANGEMENTS

As discussed during recruitment, this is an ${workingArrangement.toLowerCase()} position. Your working days will be arranged around confirmed events, preparation activities, venue visits and assigned guest engagements.

You will also participate in occasional scheduled online meetings with your supervisor and the event team to coordinate upcoming activities, guest arrangements, approved purchases and travel logistics.

The position may involve domestic and international travel. Tevuah Reserve will coordinate and cover all work-related transportation, accommodation and associated travel arrangements. Where a specific wardrobe is required for an international assignment, the company will arrange or cover all requirements.

You will receive the relevant event briefs, schedules, itineraries and instructions ahead of each assignment.

EMPLOYEE HANDBOOK – PLEASE REVIEW

Attached to this email is the Tevuah Reserve Employee Handbook – ${position}.

The handbook outlines your role and responsibilities, professional standards, guest relations expectations, event coordination procedures, travel arrangements, confidentiality responsibilities and other important working practices.

Please take time to read the entire handbook carefully, as it will serve as your reference throughout your employment.

After reviewing it, kindly:

1. Complete the Employee Acknowledgment section on the final page.
2. Sign and date the acknowledgment.
3. Return a scanned copy or clear photograph of the signed page by replying to this email.

If anything in the handbook or your responsibilities requires clarification, please contact your supervisor before proceeding with the relevant assignment.

WHAT HAPPENS NEXT

Your supervisor will communicate your initial onboarding instructions, introduce you to the relevant team members and provide details of your first assigned activities or coordination meeting.

Please ensure that your contact information remains up to date and that you respond promptly to communications concerning event assignments and availability.

We value professionalism, thoughtful hospitality, reliability and discretion, and we are confident that you will bring these qualities to the role.

Once again, welcome to Tevuah Reserve. We look forward to having you as part of the team.

Warm regards,
Paul Vincenzo
Human Resources Manager
Tevuah Reserve`;
}

// All dynamic content is escaped before insertion into HTML.
function renderBody(text: string): string {
  const paragraph = (value: string) =>
    `<p style="margin:0 0 18px;font-size:15px;line-height:1.75;color:#34463e;">${escapeHtml(value).replace(/\n/g, "<br />")}</p>`;

  return text.split(/\n\s*\n/).map((block) => {
    const value = block.trim();
    if (!value) return "";
    const lines = value.split("\n");

    if (/^(Best|Kind|Warm) regards,/.test(value)) {
      return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #ded9ca;margin-top:24px;"><tr><td style="padding-top:22px;font-size:14px;line-height:1.8;color:#153c30;">${lines.map((line, i) => i === 1 ? `<strong>${escapeHtml(line)}</strong>` : escapeHtml(line)).join("<br />")}</td></tr></table>`;
    }

    if (lines.length === 1 && /^[0-9A-Z][0-9A-Z &–—:.,'-]+$/.test(value)) {
      return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:26px 0 14px;"><tr><td style="border-left:3px solid #b49a61;background:#f5f3eb;padding:12px 16px;color:#153c30;font-size:13px;font-weight:bold;letter-spacing:0.7px;">${escapeHtml(value)}</td></tr></table>`;
    }

    if (lines.every((line) => /^•\s|^\d+\.\s/.test(line))) {
      return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:20px;">${lines.map((line) => {
        const match = /^(•|\d+\.)\s+(.*)$/.exec(line);
        const marker = match?.[1] ?? "•";
        const item = match?.[2] ?? line;
        const colon = item.indexOf(":");
        const content = colon > 0 && colon < 45 ? `<strong>${escapeHtml(item.slice(0, colon + 1))}</strong>${escapeHtml(item.slice(colon + 1))}` : escapeHtml(item);
        return `<tr><td valign="top" width="25" style="padding:6px 0;color:#967b42;font-weight:bold;">${escapeHtml(marker)}</td><td style="padding:6px 0;font-size:15px;line-height:1.65;color:#34463e;">${content}</td></tr>`;
      }).join("")}</table>`;
    }

    if (lines.every((line) => /^(Job Title|Department|Employment Type|Working Arrangement|Start Date|Compensation|Date|Time|Duration|Platform|Meeting Link|Meeting ID|Passcode|Option \d+):/.test(line))) {
      return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#faf9f5;border:1px solid #e5e0d4;margin-bottom:20px;">${lines.map((line) => {
        const index = line.indexOf(":");
        return `<tr><td style="padding:11px 14px;border-bottom:1px solid #e5e0d4;font-size:14px;line-height:1.6;color:#34463e;word-break:break-word;"><strong style="color:#153c30;">${escapeHtml(line.slice(0,index+1))}</strong> ${escapeHtml(line.slice(index+1).trim())}</td></tr>`;
      }).join("")}</table>`;
    }

    if (value.startsWith("Please do not send bank account details")) {
      return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:20px;background:#f8f4e7;"><tr><td style="padding:16px;border-left:3px solid #b49a61;font-size:14px;line-height:1.7;color:#51482f;">${escapeHtml(value)}</td></tr></table>`;
    }

    return paragraph(value);
  }).join("");
}

function buildHtml(subject: string, text: string, type: StaffEmailType): string {
  const category = type === "welcome_onboarding" || type === "payroll_id_onboarding"
    ? "EMPLOYEE ONBOARDING" : "RECRUITMENT & HUMAN RESOURCES";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f2eb;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#f4f2eb">
<tr><td align="center" style="padding:24px 12px;">
<!--[if mso]><table role="presentation" width="640" align="center"><tr><td><![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e3dfd3;">
<tr><td bgcolor="#153c30" style="padding:32px 28px;text-align:center;border-bottom:4px solid #b49a61;">
<div style="font-family:Georgia,serif;font-size:30px;letter-spacing:1px;color:#ffffff;">Tevuah Reserve</div>
<div style="margin-top:12px;font-size:10px;letter-spacing:2px;color:#e3d2a5;">${category}</div>
</td></tr>
<tr><td style="padding:30px 26px 8px;">
<h1 style="margin:0 0 18px;font-family:Georgia,serif;font-size:27px;font-weight:normal;line-height:1.3;color:#153c30;">${escapeHtml(subject)}</h1>
<div style="width:48px;height:3px;background:#b49a61;margin-bottom:20px;"></div>
</td></tr>
<tr><td style="padding:0 26px 32px;">${renderBody(text)}</td></tr>
<tr><td bgcolor="#153c30" style="padding:24px;text-align:center;color:#e6e9e2;font-size:12px;line-height:1.7;">
<strong style="color:#ffffff;">Tevuah Reserve</strong><br />Human Resources &amp; Recruitment<br />Official employee communications
</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table>
</body></html>`;
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
    throw new Error(
      "Applicant name and position are required.",
    );
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

      if (
        !Array.isArray(options) ||
        options.length !== 3
      ) {
        throw new Error(
          "Provide exactly three interview schedule options.",
        );
      }

      const formattedOptions = options.map(
        (option, index) => {
          if (
            !option.date ||
            !option.time ||
            !option.timezone
          ) {
            throw new Error(
              `Complete all fields for interview option ${index + 1}.`,
            );
          }

          return `Option ${index + 1}: ${displayDate(
            option.date,
          )}, ${displayTime(option.time)} (${validateTimezone(
            option.timezone,
          )})`;
        },
      );

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

    case "employment_offer": {
      const employmentType =
        applicant.offer_employment_type?.trim();

      const positionDescription = employmentType
        ? `${position} (${employmentType})`
        : position;

      subject =
        `Employment Offer – ${positionDescription}`;

      text = employmentOfferText(
        applicant,
        greeting,
        position,
      );
      break;
    }

    case "welcome_onboarding":
      subject =
        "Welcome to Tevuah Reserve – Employee Onboarding";

      text = welcomeOnboardingText(
        applicant,
        greeting,
        position,
      );
      break;

    case "payroll_id_onboarding":
      subject = "Employee Onboarding";
      text = `${greeting}

Congratulations once again on joining the Tevuah Reserve team. We’re pleased to welcome you and look forward to working with you.

As part of your onboarding, we’d like to collect a few details to complete your payroll arrangements and prepare your official company identification card.

1. PAYROLL PREFERENCES

Please indicate your preferred method of payment:

• Direct Deposit
• Check
• Other: Please specify

Kindly reply with your selection. If you choose direct deposit, we’ll provide instructions for submitting your banking details through a secure channel.

2. COMPANY IDENTIFICATION CARD

To prepare your company ID card, please provide the following:

• Recent Photograph: A clear, passport-style headshot with a plain background and professional appearance.
• Full Legal Name: Your name as you would like it displayed on your ID card.
• Job Title: ${position} (please confirm).
• Emergency Contact (Optional): Full name and phone number of your designated contact, with their permission.

3. SUBMISSION

Please reply directly to this email with your payroll preference and requested identification details. For your photograph and optional emergency contact details, you may request a secure submission channel instead of sending them by email.

Once we receive the information, we’ll proceed with the payroll setup and preparation of your company ID card. Any remaining onboarding instructions will be communicated separately.

If you have any questions or need assistance, please feel free to get in touch.

Thank you for your cooperation, and welcome once again to Tevuah Reserve. We look forward to having you as part of the team.

Kind regards,
Paul Vincenzo
Human Resources Manager
Tevuah Reserve`;
      break;

    default:
      throw new Error(
        "Unsupported recruitment email type.",
      );
  }

  const html = buildHtml(subject, text, type);

  return {
    subject,
    text,
    html,
  };
}
