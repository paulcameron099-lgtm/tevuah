import nodemailer from "nodemailer";

type StatementEmailAction =
  | "published"
  | "voided"
  | "reinstated";

type SendStatementEmailArgs = {
  to: string;

  investorName: string;

  action: StatementEmailAction;

  statementId: string;

  statementType: string;

  periodStart: string;

  periodEnd: string;

  historicalPublishedAt?:
    | string
    | null;

  reconstructedFromLegacy?:
    | boolean;
};

function getTransporter() {
  const host =
    process.env.SMTP_HOST;

  const port =
    Number(
      process.env.SMTP_PORT ??
        "587",
    );

  const user =
    process.env.SMTP_USER;

  const pass =
    process.env.SMTP_PASS;

  if (
    !host ||
    !user ||
    !pass
  ) {
    throw new Error(
      "SMTP configuration is incomplete. Check SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS.",
    );
  }

  return nodemailer.createTransport({
    host,

    port,

    secure:
      port === 465,

    auth: {
      user,
      pass,
    },
  });
}

export async function sendStatementEmail({
  to,
  investorName,
  action,
  statementId,
  statementType,
  periodStart,
  periodEnd,
  historicalPublishedAt,
  reconstructedFromLegacy = false,
}: SendStatementEmailArgs) {
  const transporter =
    getTransporter();

  const from =
    process.env.SMTP_FROM ??
    process.env.SMTP_USER;

  if (!from) {
    throw new Error(
      "SMTP_FROM or SMTP_USER is required.",
    );
  }

  const appUrl =
    (
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.APP_URL ??
      "http://localhost:3000"
    ).replace(
      /\/$/,
      "",
    );

  const statementUrl =
    `${appUrl}/dashboard/statements/${statementId}`;

  const statementLabel =
    humanize(
      statementType,
    );

  const period =
    `${formatDate(
      periodStart,
    )} – ${formatDate(
      periodEnd,
    )}`;

  const historicalDate =
    reconstructedFromLegacy &&
    historicalPublishedAt
      ? formatDateTime(
          historicalPublishedAt,
        )
      : null;

  const content =
    getEmailContent({
      action,
      investorName,
      statementLabel,
      period,
      statementUrl,
      historicalDate,
    });

  await transporter.sendMail({
    from:
      `"Tevuah Reserve" <${from}>`,

    to,

    subject:
      content.subject,

    text:
      content.text,

    html:
      content.html,
  });
}

function getEmailContent({
  action,
  investorName,
  statementLabel,
  period,
  statementUrl,
  historicalDate,
}: {
  action:
    StatementEmailAction;

  investorName: string;

  statementLabel: string;

  period: string;

  statementUrl: string;

  historicalDate:
    | string
    | null;
}) {
  if (
    action ===
    "published"
  ) {
    return {
      subject:
        "Your Tevuah Reserve statement is available",

      text:
        [
          `Hello ${investorName},`,
          "",
          `Your ${statementLabel.toLowerCase()} investor statement for ${period} is now available in your Tevuah Reserve account.`,
          historicalDate
            ? `Historical statement date: ${historicalDate}.`
            : "",
          "",
          `View your statement: ${statementUrl}`,
          "",
          "You can review your portfolio snapshot, position breakdown, distributions, capital returned and statement activity from your investor dashboard.",
          "",
          "Tevuah Reserve",
        ]
          .filter(Boolean)
          .join("\n"),

      html:
        buildHtml({
          title:
            "Your statement is available",

          investorName,

          body:
            `Your ${statementLabel.toLowerCase()} investor statement for <strong>${escapeHtml(
              period,
            )}</strong> has been published and is now available in your Tevuah Reserve account.`,

          historicalDate,

          buttonLabel:
            "View Statement",

          statementUrl,

          notice:
            "You can review the frozen portfolio snapshot, holdings, distributions, capital returned and statement activity from your investor dashboard.",
        }),
    };
  }

  if (
    action ===
    "voided"
  ) {
    return {
      subject:
        "Tevuah Reserve statement withdrawn",

      text:
        [
          `Hello ${investorName},`,
          "",
          `Your ${statementLabel.toLowerCase()} investor statement for ${period} has been withdrawn and is no longer considered a valid published statement.`,
          "",
          "The statement will no longer appear in your published statement history while it remains withdrawn.",
          "",
          "If the statement is restored, you will receive another notification.",
          "",
          "Tevuah Reserve",
        ].join(
          "\n",
        ),

      html:
        buildHtml({
          title:
            "Statement withdrawn",

          investorName,

          body:
            `Your ${statementLabel.toLowerCase()} investor statement for <strong>${escapeHtml(
              period,
            )}</strong> has been withdrawn.`,

          historicalDate,

          buttonLabel:
            null,

          statementUrl:
            null,

          notice:
            "The statement is no longer considered valid and will not appear in your published statement history while it remains withdrawn. If it is restored, you will receive another notification.",
        }),
    };
  }

  return {
    subject:
      "Your Tevuah Reserve statement has been restored",

    text:
      [
        `Hello ${investorName},`,
        "",
        `Your ${statementLabel.toLowerCase()} investor statement for ${period} has been restored and is valid again.`,
        historicalDate
          ? `Historical statement date: ${historicalDate}.`
          : "",
        "",
        `View your statement: ${statementUrl}`,
        "",
        "The statement is once again available in your published statement history.",
        "",
        "Tevuah Reserve",
      ]
        .filter(Boolean)
        .join("\n"),

    html:
      buildHtml({
        title:
          "Statement restored",

        investorName,

        body:
          `Your ${statementLabel.toLowerCase()} investor statement for <strong>${escapeHtml(
            period,
          )}</strong> has been reinstated and is valid again.`,

        historicalDate,

        buttonLabel:
          "View Restored Statement",

        statementUrl,

        notice:
          "The statement is once again available in your published statement history.",
      }),
  };
}

function buildHtml({
  title,
  investorName,
  body,
  historicalDate,
  buttonLabel,
  statementUrl,
  notice,
}: {
  title: string;

  investorName: string;

  body: string;

  historicalDate:
    | string
    | null;

  buttonLabel:
    | string
    | null;

  statementUrl:
    | string
    | null;

  notice: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <title>
      ${escapeHtml(title)}
    </title>
  </head>

  <body
    style="
      margin:0;
      padding:0;
      background:#f4f2eb;
      font-family:Arial,Helvetica,sans-serif;
      color:#193128;
    "
  >
    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
    >
      <tr>
        <td
          align="center"
          style="padding:40px 16px;"
        >
          <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="
              max-width:620px;
              background:#ffffff;
              border-radius:24px;
              overflow:hidden;
            "
          >
            <tr>
              <td
                style="
                  background:#132a22;
                  padding:30px 34px;
                "
              >
                <div
                  style="
                    color:#c5a45d;
                    font-size:11px;
                    font-weight:700;
                    letter-spacing:2px;
                    text-transform:uppercase;
                  "
                >
                  Tevuah Reserve
                </div>

                <div
                  style="
                    margin-top:9px;
                    color:#ffffff;
                    font-size:26px;
                    line-height:1.2;
                    font-weight:700;
                  "
                >
                  ${escapeHtml(title)}
                </div>
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:34px;
                "
              >
                <p
                  style="
                    margin:0;
                    font-size:15px;
                    line-height:1.8;
                  "
                >
                  Hello
                  <strong>
                    ${escapeHtml(
                      investorName,
                    )}
                  </strong>,
                </p>

                <p
                  style="
                    margin:20px 0 0;
                    font-size:15px;
                    line-height:1.8;
                    color:#4f5b55;
                  "
                >
                  ${body}
                </p>

                ${
                  historicalDate
                    ? `
                <div
                  style="
                    margin-top:22px;
                    padding:16px;
                    border-radius:14px;
                    background:#f4f7fb;
                    color:#34506b;
                    font-size:13px;
                    line-height:1.7;
                  "
                >
                  <strong>
                    Historical statement date:
                  </strong>

                  ${escapeHtml(
                    historicalDate,
                  )}
                </div>
                `
                    : ""
                }

                ${
                  buttonLabel &&
                  statementUrl
                    ? `
                <div
                  style="
                    margin-top:28px;
                  "
                >
                  <a
                    href="${escapeHtml(
                      statementUrl,
                    )}"
                    style="
                      display:inline-block;
                      padding:13px 22px;
                      border-radius:999px;
                      background:#132a22;
                      color:#ffffff;
                      text-decoration:none;
                      font-size:14px;
                      font-weight:700;
                    "
                  >
                    ${escapeHtml(
                      buttonLabel,
                    )}
                  </a>
                </div>
                `
                    : ""
                }

                <div
                  style="
                    margin-top:28px;
                    padding:18px;
                    border-radius:14px;
                    background:#faf8f2;
                    color:#6c6d68;
                    font-size:13px;
                    line-height:1.7;
                  "
                >
                  ${escapeHtml(
                    notice,
                  )}
                </div>

                <p
                  style="
                    margin:30px 0 0;
                    font-size:13px;
                    line-height:1.7;
                    color:#8a8b86;
                  "
                >
                  Tevuah Reserve
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
}

function humanize(
  value: string,
) {
  return value
    .replaceAll(
      "_",
      " ",
    )
    .replace(
      /\b\w/g,
      (
        letter,
      ) =>
        letter.toUpperCase(),
    );
}

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      year:
        "numeric",

      month:
        "long",

      day:
        "numeric",
    },
  ).format(
    new Date(
      `${value}T00:00:00`,
    ),
  );
}

function formatDateTime(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      year:
        "numeric",

      month:
        "long",

      day:
        "numeric",
    },
  ).format(
    new Date(
      value,
    ),
  );
}

function escapeHtml(
  value: string,
) {
  return value
    .replaceAll(
      "&",
      "&amp;",
    )
    .replaceAll(
      "<",
      "&lt;",
    )
    .replaceAll(
      ">",
      "&gt;",
    )
    .replaceAll(
      '"',
      "&quot;",
    )
    .replaceAll(
      "'",
      "&#039;",
    );
}