type JointInvestmentInvitationEmailArgs = {
  inviteeName: string;
  inviterName: string;
  opportunityTitle: string;
  totalCommitmentAmount: number;
  individualCommitmentAmount: number;
  expiresAt: string;
  invitationUrl: string;
};

function formatMoney(amountCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function escapeHtml(value: string) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function jointInvestmentInvitationEmail({
  inviteeName,
  inviterName,
  opportunityTitle,
  totalCommitmentAmount,
  individualCommitmentAmount,
  expiresAt,
  invitationUrl,
}: JointInvestmentInvitationEmailArgs) {
  const totalCommitment = formatMoney(
    totalCommitmentAmount,
  );

  const individualCommitment = formatMoney(
    individualCommitmentAmount,
  );

  const formattedExpiry = formatDateTime(
    expiresAt,
  );

  const subject =
    `${inviterName} invited you to a joint investment on Tevuah Reserve`;

  const text = [
    `Hello ${inviteeName},`,
    "",
    `${inviterName} has invited you to participate in a joint investment on Tevuah Reserve.`,
    "",
    `Investment: ${opportunityTitle}`,
    `Total joint commitment: ${totalCommitment}`,
    `Your 50% commitment: ${individualCommitment}`,
    `Ownership: 50%`,
    "",
    "Before participating, you must review the joint investment agreement and risk disclosures and provide your own acceptance and signature.",
    "",
    `Review invitation: ${invitationUrl}`,
    "",
    `This invitation expires on ${formattedExpiry}.`,
    "",
    "If you were not expecting this invitation, you can ignore this email.",
    "",
    "Tevuah Reserve",
    "Private Markets · Real Assets · Long-Term Value",
  ].join("\n");

  const html = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
    />

    <title>${escapeHtml(subject)}</title>
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
            <!-- Header -->
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
                  Joint Investment Invitation
                </div>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:34px;">
                <p
                  style="
                    margin:0;
                    font-size:15px;
                    line-height:1.8;
                  "
                >
                  Hello
                  <strong>
                    ${escapeHtml(inviteeName)}
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
                  <strong>
                    ${escapeHtml(inviterName)}
                  </strong>
                  has invited you to participate with them
                  in a joint investment through Tevuah Reserve.
                </p>

                <!-- Investment details -->
                <div
                  style="
                    margin-top:26px;
                    padding:20px;
                    border-radius:16px;
                    background:#faf8f2;
                    border:1px solid #ebe6d8;
                  "
                >
                  <div
                    style="
                      color:#132a22;
                      font-size:11px;
                      font-weight:700;
                      letter-spacing:1.4px;
                      text-transform:uppercase;
                    "
                  >
                    Investment
                  </div>

                  <div
                    style="
                      margin-top:8px;
                      font-size:18px;
                      line-height:1.4;
                      font-weight:700;
                      color:#193128;
                    "
                  >
                    ${escapeHtml(opportunityTitle)}
                  </div>

                  <table
                    role="presentation"
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                    border="0"
                    style="
                      margin-top:18px;
                      border-collapse:collapse;
                    "
                  >
                    <tr>
                      <td
                        style="
                          padding:10px 0;
                          color:#777b76;
                          font-size:13px;
                          border-bottom:1px solid #e9e5da;
                        "
                      >
                        Total joint commitment
                      </td>

                      <td
                        align="right"
                        style="
                          padding:10px 0;
                          color:#193128;
                          font-size:13px;
                          font-weight:700;
                          border-bottom:1px solid #e9e5da;
                        "
                      >
                        ${escapeHtml(totalCommitment)}
                      </td>
                    </tr>

                    <tr>
                      <td
                        style="
                          padding:10px 0;
                          color:#777b76;
                          font-size:13px;
                          border-bottom:1px solid #e9e5da;
                        "
                      >
                        Your commitment
                      </td>

                      <td
                        align="right"
                        style="
                          padding:10px 0;
                          color:#193128;
                          font-size:13px;
                          font-weight:700;
                          border-bottom:1px solid #e9e5da;
                        "
                      >
                        ${escapeHtml(individualCommitment)}
                      </td>
                    </tr>

                    <tr>
                      <td
                        style="
                          padding:10px 0 0;
                          color:#777b76;
                          font-size:13px;
                        "
                      >
                        Ownership
                      </td>

                      <td
                        align="right"
                        style="
                          padding:10px 0 0;
                          color:#193128;
                          font-size:13px;
                          font-weight:700;
                        "
                      >
                        50%
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Legal notice -->
                <div
                  style="
                    margin-top:22px;
                    padding:18px;
                    border-radius:14px;
                    background:#f1f7f3;
                    color:#365c48;
                    font-size:13px;
                    line-height:1.7;
                  "
                >
                  Your participation is not automatic.
                  You must review the joint investment
                  agreement and applicable risk disclosures
                  and provide your own acceptance and
                  signature before the joint investment can
                  proceed.
                </div>

                <!-- CTA -->
                <div
                  style="
                    margin-top:28px;
                    text-align:center;
                  "
                >
                  <a
                    href="${escapeHtml(invitationUrl)}"
                    style="
                      display:inline-block;
                      padding:14px 24px;
                      border-radius:999px;
                      background:#132a22;
                      color:#ffffff;
                      text-decoration:none;
                      font-size:14px;
                      font-weight:700;
                    "
                  >
                    Review Joint Investment
                  </a>
                </div>

                <p
                  style="
                    margin:24px 0 0;
                    font-size:12px;
                    line-height:1.7;
                    color:#777b76;
                    text-align:center;
                  "
                >
                  This invitation expires on
                  <strong>
                    ${escapeHtml(formattedExpiry)}
                  </strong>.
                </p>

                <div
                  style="
                    margin-top:28px;
                    padding:18px;
                    border-radius:14px;
                    background:#faf8f2;
                    color:#6c6d68;
                    font-size:12px;
                    line-height:1.7;
                  "
                >
                  If you were not expecting this invitation,
                  you do not need to take any action.
                  Never share the invitation link with another
                  person.
                </div>

                <p
                  style="
                    margin:30px 0 0;
                    font-size:13px;
                    line-height:1.7;
                    color:#8a8b86;
                  "
                >
                  Tevuah Reserve<br />
                  Private Markets · Real Assets · Long-Term Value
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  return {
    subject,
    text,
    html,
  };
}