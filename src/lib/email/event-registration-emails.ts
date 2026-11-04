
import "server-only";

type EventRegistrationDetails = {
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventFormat: string;
  eventCategory: string;
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  country: string;
  intent: string;
  attendance: string;
  attendees: string;
  comments: string;
  futureEvents: boolean;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character] ?? character;
  });
}

function emailLayout(
  heading: string,
  preheader: string,
  content: string,
) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f2eb;font-family:Arial,Helvetica,sans-serif;color:#17342b;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2eb;">
    <tr>
      <td align="center" style="padding:32px 14px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border:1px solid #e5e8df;">
          <tr>
            <td style="background:#102d24;padding:36px 34px;">
              <p style="margin:0;font-family:Georgia,serif;font-size:28px;color:#ffffff;">
                Tevuah
              </p>
              <p style="margin:5px 0 0;font-size:11px;letter-spacing:4px;color:#d8b56d;font-weight:bold;">
                RESERVE
              </p>
              <p style="margin:28px 0 9px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#d8b56d;">
                Events &amp; Experiences
              </p>
              <h1 style="margin:0;font-family:Georgia,serif;font-size:29px;line-height:1.3;font-weight:normal;color:#ffffff;">
                ${escapeHtml(heading)}
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 34px;font-size:14px;line-height:1.9;color:#42554a;">
              ${content}
            </td>
          </tr>

          <tr>
            <td style="background:#102d24;padding:28px 34px;text-align:center;">
              <p style="margin:0;font-family:Georgia,serif;font-size:20px;color:#ffffff;">
                Tevuah Reserve
              </p>
              <p style="margin:10px 0 0;font-size:11px;color:#d8b56d;letter-spacing:1px;">
                CULTIVATED ASSETS · INFORMED PERSPECTIVES
              </p>
              <p style="margin:17px 0 0;font-size:11px;line-height:1.8;color:#c1cec6;">
                20 Castle Terrace, Edinburgh EH1 2EE, United Kingdom
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildEventAcknowledgement(
  details: EventRegistrationDetails,
) {
  const firstName = escapeHtml(details.firstName);
  const eventTitle = escapeHtml(details.eventTitle);

  const subject =
    `We've received your interest`;

  const text = [
    `Dear ${details.firstName},`,
    "",
    `Thank you for registering your interest in ${details.eventTitle} with Tevuah Reserve.`,
    "",
    "We are pleased to confirm that your submission has been received successfully.",
    "",
    "Our team will carefully review the information you have provided and contact you regarding the next steps.",
    "",
    "Please note that this acknowledgement does not confirm an event place or meeting appointment.",
    "",
    "We appreciate your interest in Tevuah Reserve and look forward to connecting with you.",
    "",
    "Warm regards,",
    "The Tevuah Reserve Team",
    "team@tevuahreserve.com",
  ].join("\n");

  const html = emailLayout(
    "Thank you for your interest",
    "Your event registration enquiry has been received.",
    `
      <p style="margin:0 0 20px;color:#17342b;">
        Dear ${firstName},
      </p>

      <p>
        Thank you for registering your interest in
        <strong>${eventTitle}</strong> with Tevuah Reserve.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0;background:#f7f3e8;border-left:4px solid #bd9650;">
        <tr>
          <td style="padding:19px 21px;">
            <p style="margin:0 0 5px;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:#98753b;font-weight:bold;">
              Registration status
            </p>
            <p style="margin:0;font-size:16px;font-weight:bold;color:#17342b;">
              Received — Awaiting Review
            </p>
          </td>
        </tr>
      </table>

      <p>
        We are pleased to confirm that your submission
        has been received successfully.
      </p>

      <p>
        Our team will carefully review the information
        you have provided and contact you regarding
        the next steps.
      </p>

      <p>
        We appreciate your interest in Tevuah Reserve
        and look forward to connecting with you.
      </p>

      <p style="margin-top:28px;color:#17342b;">
        Warm regards,<br />
        <strong>The Tevuah Reserve Team</strong>
      </p>

      <p style="margin-top:26px;padding-top:17px;border-top:1px solid #e5e8df;font-size:11px;color:#718076;">
        This message acknowledges receipt of your
        enquiry. It does not confirm an event place
        or meeting appointment.
      </p>
    `,
  );

  return { subject, text, html };
}

export function buildAdminEventNotification(
  details: EventRegistrationDetails,
  registrationId: string,
) {
  const subject =
    `New event registration: ${details.eventTitle} — ${details.firstName} ${details.lastName}`;

  const rows: [string, string][] = [
    ["Registration ID", registrationId],
    ["Event", details.eventTitle],
    ["Date", details.eventDate],
    ["Location", details.eventLocation],
    ["Format", details.eventFormat],
    ["Category", details.eventCategory],
    ["First name", details.firstName],
    ["Last name", details.lastName],
    ["Email", details.email],
    ["Telephone", details.telephone || "Not provided"],
    ["Country", details.country],
    ["Enquiry type", details.intent],
    ["Attendance", details.attendance],
    ["Number of attendees", details.attendees],
    ["Questions / comments", details.comments || "None"],
    ["Future events opt-in", details.futureEvents ? "Yes" : "No"],
    ["Privacy acknowledgement", "Accepted"],
  ];

  const text = rows
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n\n");

  const tableRows = rows
    .map(
      ([label, value], index) => `
        <tr style="background:${index % 2 === 0 ? "#ffffff" : "#f8f9f5"};">
          <th scope="row" style="width:36%;padding:13px;text-align:left;vertical-align:top;border-bottom:1px solid #e5e8df;font-size:12px;color:#53645a;">
            ${escapeHtml(label)}
          </th>
          <td style="padding:13px;vertical-align:top;border-bottom:1px solid #e5e8df;font-size:13px;overflow-wrap:anywhere;white-space:pre-wrap;">
            ${escapeHtml(value)}
          </td>
        </tr>
      `,
    )
    .join("");

  const html = emailLayout(
    "New registration enquiry",
    "A new event registration requires review.",
    `
      <p style="margin:0 0 18px;">
        A visitor has submitted an event registration
        enquiry. The information is available below
        and has been recorded for admin review.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e5e8df;">
        ${tableRows}
      </table>

      <p style="margin-top:25px;">
        Please review the registration in the
        Tevuah Reserve administration dashboard
        and determine the appropriate next steps.
      </p>
    `,
  );

  return { subject, text, html };
}
