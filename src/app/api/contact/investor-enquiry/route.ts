import { NextResponse } from "next/server";

import {
  getInvestorEnquiryRecipient,
  sendApplicationMail,
} from "@/src/lib/email/application-mailer";

type InvestorEnquiryPayload = {
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  country?: unknown;
  interest?: unknown;
  investmentRange?: unknown;
  message?: unknown;
  acknowledged?: unknown;
};

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_COUNTRY_LENGTH = 120;
const MAX_INTEREST_LENGTH = 160;
const MAX_RANGE_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 5000;

function cleanString(
  value: unknown,
  maxLength: number,
) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .replace(/\r\n/g, "\n")
    .slice(0, maxLength);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value,
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: Request) {
  let body: InvestorEnquiryPayload;

  try {
    body =
      (await request.json()) as InvestorEnquiryPayload;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error:
          "The enquiry could not be read. Please check the form and try again.",
      },
      {
        status: 400,
      },
    );
  }

  const firstName = cleanString(
    body.firstName,
    MAX_NAME_LENGTH,
  );

  const lastName = cleanString(
    body.lastName,
    MAX_NAME_LENGTH,
  );

  const email = cleanString(
    body.email,
    MAX_EMAIL_LENGTH,
  ).toLowerCase();

  const country = cleanString(
    body.country,
    MAX_COUNTRY_LENGTH,
  );

  const interest = cleanString(
    body.interest,
    MAX_INTEREST_LENGTH,
  );

  const investmentRange = cleanString(
    body.investmentRange,
    MAX_RANGE_LENGTH,
  );

  const message = cleanString(
    body.message,
    MAX_MESSAGE_LENGTH,
  );

  const acknowledged =
    body.acknowledged === true;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !interest ||
    !investmentRange
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Please complete all required fields.",
      },
      {
        status: 400,
      },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Please provide a valid email address.",
      },
      {
        status: 400,
      },
    );
  }

  if (!acknowledged) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Please confirm the investor enquiry acknowledgement before continuing.",
      },
      {
        status: 400,
      },
    );
  }

  const recipient =
    getInvestorEnquiryRecipient();

  if (!recipient) {
    console.error(
      "[INVESTOR ENQUIRY] No recipient configured.",
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Investor enquiries are temporarily unavailable. Please contact Tevuah Reserve directly.",
      },
      {
        status: 503,
      },
    );
  }

  const fullName =
    `${firstName} ${lastName}`.trim();

  const receivedAt = new Date();

  const subject =
    `Investor enquiry — ${fullName} — ${interest}`;

  const text = [
    "TEVUAH RESERVE",
    "New Investor Enquiry",
    "",
    "INVESTOR",
    `Name: ${fullName}`,
    `Email: ${email}`,
    `Country / jurisdiction: ${
      country || "Not provided"
    }`,
    "",
    "ENQUIRY",
    `Primary interest: ${interest}`,
    `Indicative investment range: ${investmentRange}`,
    "",
    "MESSAGE",
    message || "No additional message provided.",
    "",
    "ACKNOWLEDGEMENT",
    "The prospective investor confirmed that submitting an enquiry does not create an investor account, guarantee eligibility, reserve an investment allocation or constitute personalised investment advice.",
    "",
    `Received: ${receivedAt.toISOString()}`,
  ].join("\n");

  const safeName = escapeHtml(fullName);
  const safeEmail = escapeHtml(email);
  const safeCountry = escapeHtml(
    country || "Not provided",
  );
  const safeInterest = escapeHtml(interest);
  const safeInvestmentRange = escapeHtml(
    investmentRange,
  );
  const safeMessage = escapeHtml(
    message || "No additional message provided.",
  ).replaceAll("\n", "<br />");

  const html = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <title>New Investor Enquiry</title>
      </head>

      <body
        style="
          margin:0;
          padding:0;
          background:#f4f1e8;
          font-family:Arial,Helvetica,sans-serif;
          color:#1d2c25;
        "
      >
        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="background:#f4f1e8;padding:32px 16px;"
        >
          <tr>
            <td align="center">
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  max-width:680px;
                  background:#ffffff;
                  border-radius:20px;
                  overflow:hidden;
                "
              >
                <tr>
                  <td
                    style="
                      background:#10271f;
                      padding:32px;
                    "
                  >
                    <div
                      style="
                        color:#c9a96a;
                        font-size:11px;
                        font-weight:700;
                        letter-spacing:2px;
                        text-transform:uppercase;
                      "
                    >
                      Tevuah Reserve
                    </div>

                    <h1
                      style="
                        margin:12px 0 0;
                        color:#ffffff;
                        font-size:28px;
                        line-height:1.2;
                        font-weight:500;
                      "
                    >
                      New investor enquiry
                    </h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding:32px;">
                    <p
                      style="
                        margin:0 0 24px;
                        color:#657068;
                        font-size:14px;
                        line-height:1.7;
                      "
                    >
                      A prospective investor submitted an
                      enquiry through the Tevuah Reserve
                      website.
                    </p>

                    <table
                      role="presentation"
                      width="100%"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                    >
                      <tr>
                        <td
                          style="
                            padding:14px 0;
                            border-bottom:1px solid #ece9e1;
                            color:#7b817d;
                            font-size:12px;
                            width:42%;
                          "
                        >
                          Name
                        </td>

                        <td
                          style="
                            padding:14px 0;
                            border-bottom:1px solid #ece9e1;
                            color:#1d2c25;
                            font-size:14px;
                            font-weight:600;
                          "
                        >
                          ${safeName}
                        </td>
                      </tr>

                      <tr>
                        <td
                          style="
                            padding:14px 0;
                            border-bottom:1px solid #ece9e1;
                            color:#7b817d;
                            font-size:12px;
                          "
                        >
                          Email
                        </td>

                        <td
                          style="
                            padding:14px 0;
                            border-bottom:1px solid #ece9e1;
                            font-size:14px;
                          "
                        >
                          <a
                            href="mailto:${safeEmail}"
                            style="
                              color:#1d2c25;
                              text-decoration:none;
                              font-weight:600;
                            "
                          >
                            ${safeEmail}
                          </a>
                        </td>
                      </tr>

                      <tr>
                        <td
                          style="
                            padding:14px 0;
                            border-bottom:1px solid #ece9e1;
                            color:#7b817d;
                            font-size:12px;
                          "
                        >
                          Country / jurisdiction
                        </td>

                        <td
                          style="
                            padding:14px 0;
                            border-bottom:1px solid #ece9e1;
                            color:#1d2c25;
                            font-size:14px;
                            font-weight:600;
                          "
                        >
                          ${safeCountry}
                        </td>
                      </tr>

                      <tr>
                        <td
                          style="
                            padding:14px 0;
                            border-bottom:1px solid #ece9e1;
                            color:#7b817d;
                            font-size:12px;
                          "
                        >
                          Primary interest
                        </td>

                        <td
                          style="
                            padding:14px 0;
                            border-bottom:1px solid #ece9e1;
                            color:#1d2c25;
                            font-size:14px;
                            font-weight:600;
                          "
                        >
                          ${safeInterest}
                        </td>
                      </tr>

                      <tr>
                        <td
                          style="
                            padding:14px 0;
                            border-bottom:1px solid #ece9e1;
                            color:#7b817d;
                            font-size:12px;
                          "
                        >
                          Indicative investment range
                        </td>

                        <td
                          style="
                            padding:14px 0;
                            border-bottom:1px solid #ece9e1;
                            color:#1d2c25;
                            font-size:14px;
                            font-weight:600;
                          "
                        >
                          ${safeInvestmentRange}
                        </td>
                      </tr>
                    </table>

                    <div
                      style="
                        margin-top:28px;
                        padding:22px;
                        background:#f7f5ef;
                        border-radius:14px;
                      "
                    >
                      <div
                        style="
                          margin-bottom:10px;
                          color:#a07d3f;
                          font-size:11px;
                          font-weight:700;
                          letter-spacing:1.5px;
                          text-transform:uppercase;
                        "
                      >
                        Investor message
                      </div>

                      <div
                        style="
                          color:#4d5751;
                          font-size:14px;
                          line-height:1.8;
                        "
                      >
                        ${safeMessage}
                      </div>
                    </div>

                    <div
                      style="
                        margin-top:24px;
                        padding:18px;
                        border:1px solid #e4d5b4;
                        border-radius:14px;
                        background:#fbf8f1;
                      "
                    >
                      <div
                        style="
                          color:#a07d3f;
                          font-size:11px;
                          font-weight:700;
                          letter-spacing:1.4px;
                          text-transform:uppercase;
                        "
                      >
                        Acknowledgement confirmed
                      </div>

                      <p
                        style="
                          margin:10px 0 0;
                          color:#657068;
                          font-size:12px;
                          line-height:1.7;
                        "
                      >
                        The prospective investor confirmed
                        that submitting this enquiry does
                        not create an investor account,
                        guarantee eligibility, reserve an
                        investment allocation or constitute
                        personalised investment advice.
                      </p>
                    </div>

                    <p
                      style="
                        margin:26px 0 0;
                        color:#9a9f9b;
                        font-size:11px;
                        line-height:1.6;
                      "
                    >
                      Received ${escapeHtml(
                        receivedAt.toISOString(),
                      )}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const result = await sendApplicationMail({
    to: recipient,
    subject,
    text,
    html,
  });

  if (!result.sent) {
    console.error(
      "[INVESTOR ENQUIRY DELIVERY FAILED]",
      {
        email,
        error: result.error,
      },
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "We could not send your enquiry at this time. Please try again shortly or contact Tevuah Reserve directly.",
      },
      {
        status: 502,
      },
    );
  }

  console.info(
    "[INVESTOR ENQUIRY RECEIVED]",
    {
      email,
      interest,
      messageId: result.messageId,
    },
  );

  return NextResponse.json({
    ok: true,
    message:
      "Your enquiry has been sent to Tevuah Reserve.",
  });
}