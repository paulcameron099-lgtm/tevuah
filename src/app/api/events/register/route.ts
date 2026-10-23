import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getEvent,
} from "@/src/data/event";

import {
  sendApplicationMail,
  getInvestorEnquiryRecipient,
} from "@/src/lib/email/application-mailer";

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

function escapeHtml(input: string) {
  return input.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] ?? character,
  );
}

function errorResponse(
  message: string,
  status = 400,
) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(
  request: NextRequest,
) {
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
    const raw: unknown =
      await request.json();

    if (
      !raw ||
      typeof raw !== "object" ||
      Array.isArray(raw)
    ) {
      return errorResponse(
        "Invalid submission.",
      );
    }

    body = raw as Payload;
  } catch {
    return errorResponse(
      "Invalid JSON submission.",
    );
  }

  // Basic spam honeypot.

  if (value(body, "website")) {
    return NextResponse.json({
      ok: true,
    });
  }

  const event = getEvent(
    value(body, "eventSlug", 200),
  );

  if (!event) {
    return errorResponse(
      "Please select a valid event.",
    );
  }

  const firstName = value(
    body,
    "firstName",
    80,
  );

  const lastName = value(
    body,
    "lastName",
    80,
  );

  const email = value(
    body,
    "email",
    254,
  );

  const telephone = value(
    body,
    "telephone",
    40,
  );

  const country = value(
    body,
    "country",
    100,
  );

  const intent = value(
    body,
    "intent",
    30,
  );

  const attendance = value(
    body,
    "attendance",
    30,
  );

  const attendees = value(
    body,
    "attendees",
    5,
  );

  const comments = value(
    body,
    "comments",
    3000,
  );

  const futureEvents = value(
    body,
    "futureEvents",
    10,
  );

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
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email,
    )
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

  const recipient =
    process.env.EVENTS_ENQUIRY_EMAIL?.trim() ||
    getInvestorEnquiryRecipient();

  if (!recipient) {
    console.error(
      "[EVENT REGISTRATION] Recipient not configured",
    );

    return errorResponse(
      "Event enquiries are temporarily unavailable. Please contact our team.",
      503,
    );
  }

  const intentLabels: Record<string, string> = {
    reserve: "Reserve a place",
    information: "Request event information",
    team: "Speak with events team",
  };

  const attendanceLabels: Record<string, string> = {
    alone: "Attending alone",
    guest: "Attending with a guest",
    undecided: "Not yet decided",
  };

  const rows: [string, string][] = [
    ["Event", event.title],
    ["Date", event.date],
    ["Location", event.location],
    ["Format", event.format],
    ["Category", event.category],
    ["First name", firstName],
    ["Last name", lastName],
    ["Email", email],
    [
      "Telephone",
      telephone || "Not provided",
    ],
    ["Country", country],
    [
      "Enquiry type",
      intentLabels[intent],
    ],
    [
      "Attendance",
      attendanceLabels[attendance],
    ],
    ["Number of attendees", attendees],
    [
      "Questions/comments",
      comments || "None",
    ],
    [
      "Future events opt-in",
      futureEvents === "yes"
        ? "Yes"
        : "No",
    ],
    [
      "Privacy acknowledgement",
      "Accepted",
    ],
  ];

  const text = rows
    .map(
      ([label, entry]) =>
        `${label}: ${entry}`,
    )
    .join("\n\n");

  
const html = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
      />
      <title>Tevuah Reserve Event Registration Enquiry</title>
    </head>

    <body
      style="
        margin:0;
        padding:0;
        background-color:#f3f1e9;
        font-family:Arial,Helvetica,sans-serif;
        color:#17342b;
        -webkit-text-size-adjust:100%;
      "
    >
      <div
        style="
          display:none;
          font-size:1px;
          color:#f3f1e9;
          line-height:1px;
          max-height:0;
          max-width:0;
          opacity:0;
          overflow:hidden;
        "
      >
        A new event registration enquiry has been received.
      </div>

      <table
        role="presentation"
        cellpadding="0"
        cellspacing="0"
        border="0"
        width="100%"
        style="background-color:#f3f1e9;"
      >
        <tr>
          <td
            align="center"
            style="padding:40px 16px;"
          >
            <table
              role="presentation"
              cellpadding="0"
              cellspacing="0"
              border="0"
              width="100%"
              style="
                max-width:680px;
                background-color:#ffffff;
                border-collapse:separate;
                border-spacing:0;
                border:1px solid #e5e8df;
              "
            >
              <!-- =========================
                   BRAND HEADER
              ========================== -->

              <tr>
                <td
                  style="
                    background-color:#102d24;
                    padding:36px 40px 32px;
                  "
                >
                  <p
                    style="
                      margin:0;
                      font-family:Georgia,'Times New Roman',serif;
                      font-size:29px;
                      font-weight:600;
                      letter-spacing:-0.5px;
                      color:#ffffff;
                    "
                  >
                    Tevuah
                  </p>

                  <p
                    style="
                      margin:6px 0 0;
                      font-size:10px;
                      font-weight:700;
                      letter-spacing:4px;
                      text-transform:uppercase;
                      color:#d8b56d;
                    "
                  >
                    RESERVE
                  </p>

                  <div
                    style="
                      height:1px;
                      margin:27px 0;
                      background-color:#ffffff26;
                    "
                  ></div>

                  <p
                    style="
                      margin:0 0 12px;
                      font-size:11px;
                      font-weight:700;
                      letter-spacing:2px;
                      text-transform:uppercase;
                      color:#d8b56d;
                    "
                  >
                    Events &amp; Experiences
                  </p>

                  <h1
                    style="
                      margin:0;
                      font-family:Georgia,'Times New Roman',serif;
                      font-size:30px;
                      font-weight:400;
                      line-height:1.25;
                      color:#ffffff;
                    "
                  >
                    New Registration Enquiry
                  </h1>

                  <p
                    style="
                      margin:16px 0 0;
                      font-size:14px;
                      line-height:1.8;
                      color:#c6d3cc;
                    "
                  >
                    A visitor has submitted an enquiry
                    regarding participation in a
                    Tevuah Reserve event.
                  </p>
                </td>
              </tr>

              <!-- =========================
                   STATUS
              ========================== -->

              <tr>
                <td
                  style="
                    padding:30px 40px 0;
                  "
                >
                  <table
                    role="presentation"
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    style="
                      background-color:#f7f3e8;
                      border-left:4px solid #bd9650;
                    "
                  >
                    <tr>
                      <td style="padding:18px 20px;">
                        <p
                          style="
                            margin:0 0 7px;
                            font-size:10px;
                            font-weight:700;
                            letter-spacing:1.8px;
                            text-transform:uppercase;
                            color:#98753b;
                          "
                        >
                          Enquiry status
                        </p>

                        <p
                          style="
                            margin:0;
                            font-size:15px;
                            font-weight:700;
                            color:#17342b;
                          "
                        >
                          Received — Awaiting Review
                        </p>

                        <p
                          style="
                            margin:8px 0 0;
                            font-size:12px;
                            line-height:1.7;
                            color:#64716a;
                          "
                        >
                          This is an expression of
                          interest only. Attendance
                          has not been confirmed.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- =========================
                   ENQUIRY DETAILS
              ========================== -->

              <tr>
                <td
                  style="
                    padding:36px 40px 14px;
                  "
                >
                  <p
                    style="
                      margin:0 0 8px;
                      font-size:11px;
                      font-weight:700;
                      letter-spacing:1.8px;
                      text-transform:uppercase;
                      color:#b18a47;
                    "
                  >
                    Registration information
                  </p>

                  <h2
                    style="
                      margin:0;
                      font-family:Georgia,'Times New Roman',serif;
                      font-size:25px;
                      font-weight:400;
                      color:#17342b;
                    "
                  >
                    Enquiry details
                  </h2>

                  <p
                    style="
                      margin:12px 0 0;
                      font-size:13px;
                      line-height:1.8;
                      color:#6b756f;
                    "
                  >
                    The following information was
                    provided through the event
                    registration form.
                  </p>
                </td>
              </tr>

              <!-- =========================
                   DATA TABLE
              ========================== -->

              <tr>
                <td
                  style="
                    padding:12px 40px 36px;
                  "
                >
                  <table
                    role="presentation"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    width="100%"
                    style="
                      border-collapse:collapse;
                      border:1px solid #e5e8df;
                    "
                  >
                    ${rows
                      .map(
                        ([label, entry], index) => `
                          <tr
                            style="
                              background-color:${
                                index % 2 === 0
                                  ? "#ffffff"
                                  : "#f8f9f5"
                              };
                            "
                          >
                            <th
                              scope="row"
                              style="
                                width:36%;
                                padding:17px 18px;
                                border-bottom:1px solid #e5e8df;
                                text-align:left;
                                vertical-align:top;
                                font-size:12px;
                                font-weight:700;
                                line-height:1.6;
                                color:#53645a;
                              "
                            >
                              ${escapeHtml(label)}
                            </th>

                            <td
                              style="
                                padding:17px 18px;
                                border-bottom:1px solid #e5e8df;
                                vertical-align:top;
                                font-size:13px;
                                line-height:1.75;
                                color:#17342b;
                                overflow-wrap:anywhere;
                                word-break:break-word;
                                white-space:pre-wrap;
                              "
                            >
                              ${
                                entry
                                  ? escapeHtml(
                                      String(entry),
                                    )
                                  : '<span style="color:#9ba59e;">Not provided</span>'
                              }
                            </td>
                          </tr>
                        `,
                      )
                      .join("")}
                  </table>
                </td>
              </tr>

              <!-- =========================
                   TEAM ACTION
              ========================== -->

              <tr>
                <td
                  style="
                    background-color:#f8f9f5;
                    border-top:1px solid #e5e8df;
                    padding:32px 40px;
                  "
                >
                  <p
                    style="
                      margin:0 0 10px;
                      font-size:11px;
                      font-weight:700;
                      letter-spacing:1.6px;
                      text-transform:uppercase;
                      color:#b18a47;
                    "
                  >
                    Events team
                  </p>

                  <h3
                    style="
                      margin:0;
                      font-family:Georgia,'Times New Roman',serif;
                      font-size:21px;
                      font-weight:400;
                      color:#17342b;
                    "
                  >
                    Recommended next steps
                  </h3>

                  <p
                    style="
                      margin:14px 0 0;
                      font-size:13px;
                      line-height:1.9;
                      color:#53645a;
                    "
                  >
                    Review the attendee's enquiry,
                    confirm the relevant event
                    information and assess
                    availability. Respond directly
                    to the attendee with programme
                    details, participation
                    requirements and any necessary
                    next steps.
                  </p>
                </td>
              </tr>

              <!-- =========================
                   FOOTER
              ========================== -->

              <tr>
                <td
                  style="
                    background-color:#102d24;
                    padding:27px 40px;
                    text-align:center;
                  "
                >
                  <p
                    style="
                      margin:0;
                      font-family:Georgia,'Times New Roman',serif;
                      font-size:19px;
                      color:#ffffff;
                    "
                  >
                    Tevuah Reserve
                  </p>

                  <p
                    style="
                      margin:9px 0 0;
                      font-size:10px;
                      font-weight:700;
                      letter-spacing:2px;
                      text-transform:uppercase;
                      color:#d8b56d;
                    "
                  >
                    Cultivated Assets · Informed Perspectives
                  </p>

                  <p
                    style="
                      margin:18px 0 0;
                      font-size:11px;
                      line-height:1.8;
                      color:#b6c6bd;
                    "
                  >
                    Automated notification from
                    Tevuah Reserve Events.
                    <br />
                    This message contains
                    information submitted through
                    the event registration form.
                  </p>
                </td>
              </tr>
            </table>

            <p
              style="
                max-width:680px;
                margin:22px auto 0;
                font-size:11px;
                line-height:1.8;
                text-align:center;
                color:#89938b;
              "
            >
              Tevuah Reserve — Event Registration
              Notification
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;


  const delivery =
    await sendApplicationMail({
      to: recipient,
      subject:
        `Event enquiry: ${event.title} — ${firstName} ${lastName}`,
      text,
      html,
    });

  if (!delivery.sent) {
    return errorResponse(
      "We could not deliver your enquiry. Please try again or contact our team.",
      503,
    );
  }

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