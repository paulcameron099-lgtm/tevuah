import "server-only";

type Recipient = { firstName: string; eventTitle: string };
export type ScreeningOption = { meetingDate: string; meetingTime: string; timezone: string };
type Meeting = ScreeningOption & { platform: string; meetingUrl: string };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c] ?? c);
}

function formatDate(date: string) {
  const parsed = new Date(`${date}T12:00:00Z`);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(parsed);
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}

function formattedSlot(slot: ScreeningOption) {
  // IANA timezone is unambiguous across daylight-saving transitions.
  return `${formatDate(slot.meetingDate)} at ${formatTime(slot.meetingTime)} (${slot.timezone})`;
}

function layout(title: string, body: string, closing = true) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${escapeHtml(title)}</title></head>
<body style="margin:0;background:#f5f3ed;padding:30px 12px;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:620px;margin:auto;background:#fff;">
<tr><td style="padding:36px;background:#102d24;color:#fff;"><p style="font-family:Georgia,serif;font-size:28px;margin:0;">Tevuah Reserve</p><p style="color:#d8b56d;letter-spacing:2px;font-size:11px;margin:12px 0 0;">CULTIVATED ASSETS · INFORMED PERSPECTIVES</p><h1 style="font-family:Georgia,serif;font-size:26px;font-weight:normal;line-height:1.3;margin:28px 0 0;">${escapeHtml(title)}</h1></td></tr>
<tr><td style="padding:36px;color:#344c40;font-size:14px;line-height:1.9;">${body}${closing ? '<p style="margin-top:30px;">Warm regards,<br/><strong>The Tevuah Reserve Team</strong></p>' : ""}</td></tr>
<tr><td style="background:#102d24;color:#c8d2ca;text-align:center;padding:25px;font-size:11px;line-height:1.8;"><strong style="color:#d8b56d;">TEVUAH RESERVE</strong><br/>20 Castle Terrace, Edinburgh EH1 2EE, United Kingdom<br/>team@tevuahreserve.com</td></tr>
</table></body></html>`;
}

export function buildMeetingAvailabilityEmail(recipient: Recipient, options: ScreeningOption[]) {
  if (options.length < 2 || options.length > 5) {
    throw new Error("Screening invitation requires 2–5 proposed options.");
  }
  const subject = `Invitation to a Private Screening Session | ${recipient.eventTitle}`;
  const text = [
    `Dear ${recipient.firstName},`, "",
    `Thank you for your interest in ${recipient.eventTitle}.`, "",
    "We would like to invite you to a brief virtual screening session via Zoom as the next stage of our guest selection process.", "",
    "PROPOSED SCREENING OPTIONS", "",
    ...options.map((option, index) => `Option ${index + 1}: ${formattedSlot(option)}`), "",
    "Platform: Zoom", "Duration: Approximately 10–15 minutes", "",
    "The session will provide an opportunity for us to learn more about your interest in fine wine, understand your expectations for the experience, and answer any preliminary questions you may have.", "",
    "Kindly reply to this email indicating which proposed option is most convenient for you. Once we receive your preference and confirm the appointment, we will share the Zoom meeting link.", "",
    "If none of these options is suitable, please let us know and we will explore an alternative.", "",
    "We appreciate your interest and look forward to speaking with you.", "",
    "Tevuah Reserve", "CULTIVATED ASSETS · INFORMED PERSPECTIVES",
  ].join("\n");
  const rows = options.map((option, index) => `<tr><td style="padding:12px;border-bottom:1px solid #e4e4dc;color:#68766d;vertical-align:top;white-space:nowrap;">Option ${index + 1}</td><td style="padding:12px;border-bottom:1px solid #e4e4dc;font-weight:bold;color:#102d24;">${escapeHtml(formattedSlot(option))}</td></tr>`).join("");
  const html = layout("Invitation to a Private Screening Session", `
<p>Dear ${escapeHtml(recipient.firstName)},</p>
<p>Thank you for your interest in <strong>${escapeHtml(recipient.eventTitle)}</strong>.</p>
<p>We would like to invite you to a brief virtual screening session via <strong>Zoom</strong> as the next stage of our guest selection process.</p>
<div style="background:#f7f3e8;border-left:4px solid #d8b56d;padding:20px;margin:26px 0;">
<p style="margin:0 0 14px;font-family:Georgia,serif;font-size:19px;color:#102d24;">Proposed Screening Options</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rows}</table>
<p style="margin:15px 0 0;"><strong>Platform:</strong> Zoom<br/><strong>Duration:</strong> Approximately 10–15 minutes</p>
</div>
<p>The session will provide an opportunity for us to learn more about your interest in fine wine, understand your expectations for the experience, and answer any preliminary questions you may have.</p>
<p><strong>Kindly reply to this email indicating which proposed option is most convenient for you.</strong> Once we receive your preference and confirm the appointment, we will share the Zoom meeting link.</p>
<p>If none of these options is suitable, please let us know and we will explore an alternative.</p>
<p>We appreciate your interest and look forward to speaking with you.</p>
<p style="margin-top:30px;font-family:Georgia,serif;font-size:20px;color:#102d24;"><strong>Tevuah Reserve</strong></p>
<p style="font-size:10px;letter-spacing:2px;color:#a88b50;">CULTIVATED ASSETS · INFORMED PERSPECTIVES</p>
`, false);
  return { subject, text, html };
}

export function buildMeetingInvitationEmail(recipient: Recipient, meeting: Meeting) {
  const subject = `Your Meeting Invitation | ${recipient.eventTitle}`;
  const fields = [
    ["Date", formatDate(meeting.meetingDate)],
    ["Time", `${formatTime(meeting.meetingTime)} (${meeting.timezone})`],
    ["Platform", meeting.platform],
    ["Meeting Link", meeting.meetingUrl],
  ];
  const text = [
    `Dear ${recipient.firstName},`, "",
    `We are pleased to share the meeting details relating to your interest in ${recipient.eventTitle}.`, "",
    ...fields.map(([key, value]) => `${key}: ${value}`), "",
    "Please reply to this email if you need to request a change.", "",
    "We look forward to speaking with you.", "", "Warm regards,", "The Tevuah Reserve Team",
  ].join("\n");
  const rows = fields.map(([key, value]) => `<tr><td style="padding:12px;border-bottom:1px solid #e7e8e2;font-weight:bold;vertical-align:top;">${escapeHtml(key)}</td><td style="padding:12px;border-bottom:1px solid #e7e8e2;overflow-wrap:anywhere;">${escapeHtml(value)}</td></tr>`).join("");
  const html = layout("Your Meeting Invitation", `<p>Dear ${escapeHtml(recipient.firstName)},</p><p>We are pleased to share the meeting details relating to your interest in <strong>${escapeHtml(recipient.eventTitle)}</strong>.</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#f8f7f2;margin:24px 0;">${rows}</table><p>Please reply to this email if you need to request a change.</p><p>We look forward to speaking with you.</p>`);
  return { subject, text, html };
}
