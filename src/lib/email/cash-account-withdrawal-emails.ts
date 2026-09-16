type BaseWithdrawalEmailInput = {
  investorName: string;
  amountCents: number;
  currency?: string;
  maskedAccountNumber?: string | null;
  bankName?: string | null;
  origin: string;
};

type CompanySubmittedInput =
  BaseWithdrawalEmailInput & {
    investorEmail: string;
    withdrawalId: string;
  };

type RejectedInput =
  BaseWithdrawalEmailInput & {
    reason: string;
  };

type PaidInput =
  BaseWithdrawalEmailInput & {
    paymentReference: string;
  };

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(
  amountCents: number,
  currency = "USD",
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}

function normalizeOrigin(origin: string) {
  return origin.replace(/\/+$/, "");
}

function layout({
  eyebrow,
  title,
  intro,
  body,
  buttonLabel,
  buttonUrl,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  body: string;
  buttonLabel?: string;
  buttonUrl?: string;
}) {
  const button =
    buttonLabel && buttonUrl
      ? `
        <table
          role="presentation"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="margin-top:28px;"
        >
          <tr>
            <td
              bgcolor="#173f35"
              style="border-radius:999px;"
            >
              <a
                href="${escapeHtml(buttonUrl)}"
                style="
                  display:inline-block;
                  padding:14px 24px;
                  font-family:Arial,sans-serif;
                  font-size:14px;
                  line-height:20px;
                  font-weight:700;
                  color:#ffffff;
                  text-decoration:none;
                "
              >
                ${escapeHtml(buttonLabel)}
              </a>
            </td>
          </tr>
        </table>
      `
      : "";

  return `
<!doctype html>
<html>
  <body
    style="
      margin:0;
      padding:0;
      background:#f4f0e7;
      color:#173f35;
    "
  >
    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="background:#f4f0e7;"
    >
      <tr>
        <td
          align="center"
          style="padding:32px 16px;"
        >
          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
              max-width:640px;
              background:#ffffff;
              border-radius:24px;
              overflow:hidden;
            "
          >
            <tr>
              <td
                style="
                  padding:32px 36px;
                  background:#102f29;
                "
              >
                <div
                  style="
                    font-family:Arial,sans-serif;
                    font-size:12px;
                    line-height:18px;
                    font-weight:700;
                    letter-spacing:2px;
                    text-transform:uppercase;
                    color:#d2ad63;
                  "
                >
                  Tevuah Reserve
                </div>

                <div
                  style="
                    margin-top:18px;
                    font-family:Georgia,serif;
                    font-size:30px;
                    line-height:38px;
                    color:#ffffff;
                  "
                >
                  ${escapeHtml(title)}
                </div>
              </td>
            </tr>

            <tr>
              <td
                style="padding:36px;"
              >
                <div
                  style="
                    font-family:Arial,sans-serif;
                    font-size:11px;
                    line-height:17px;
                    font-weight:700;
                    letter-spacing:1.8px;
                    text-transform:uppercase;
                    color:#a17b36;
                  "
                >
                  ${escapeHtml(eyebrow)}
                </div>

                <div
                  style="
                    margin-top:16px;
                    font-family:Arial,sans-serif;
                    font-size:15px;
                    line-height:26px;
                    color:#4d5b56;
                  "
                >
                  ${intro}
                </div>

                ${body}

                ${button}

                <div
                  style="
                    margin-top:34px;
                    padding-top:22px;
                    border-top:1px solid #e7e1d5;
                    font-family:Arial,sans-serif;
                    font-size:12px;
                    line-height:20px;
                    color:#7a817e;
                  "
                >
                  For your security, Tevuah Reserve will never ask you
                  to send passwords, authentication codes or banking
                  credentials by email.
                </div>
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:22px 36px;
                  background:#f8f5ee;
                  font-family:Arial,sans-serif;
                  font-size:11px;
                  line-height:18px;
                  color:#858a87;
                "
              >
                Tevuah Reserve · Investor Services
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

function detailsTable(
  rows: Array<{
    label: string;
    value: string;
  }>,
) {
  return `
    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="
        margin-top:28px;
        background:#f8f5ee;
        border-radius:18px;
      "
    >
      ${rows
        .map(
          ({ label, value }) => `
            <tr>
              <td
                style="
                  padding:14px 18px;
                  border-bottom:1px solid #e9e2d6;
                  font-family:Arial,sans-serif;
                  font-size:12px;
                  color:#777d79;
                "
              >
                ${escapeHtml(label)}
              </td>

              <td
                align="right"
                style="
                  padding:14px 18px;
                  border-bottom:1px solid #e9e2d6;
                  font-family:Arial,sans-serif;
                  font-size:13px;
                  font-weight:700;
                  color:#173f35;
                "
              >
                ${escapeHtml(value)}
              </td>
            </tr>
          `,
        )
        .join("")}
    </table>
  `;
}

export function investorCashWithdrawalSubmittedEmail(
  input: BaseWithdrawalEmailInput,
) {
  const origin =
    normalizeOrigin(input.origin);

  const amount =
    formatMoney(
      input.amountCents,
      input.currency,
    );

  return {
    subject:
      "We received your Tevuah Cash withdrawal request",

    html: layout({
      eyebrow:
        "Withdrawal request received",

      title:
        "Your withdrawal request has been received",

      intro: `
        Hello ${escapeHtml(input.investorName)},<br><br>
        We received your request to withdraw
        <strong>${escapeHtml(amount)}</strong>
        from your Tevuah Cash Account. Our team will review the
        request before funds are released.
      `,

      body: detailsTable([
        {
          label: "Amount",
          value: amount,
        },
        {
          label: "Method",
          value: "Wire Transfer",
        },
        {
          label: "Bank",
          value:
            input.bankName ||
            "Bank account",
        },
        {
          label: "Destination",
          value:
            input.maskedAccountNumber ||
            "Account on file",
        },
        {
          label: "Status",
          value: "Submitted",
        },
      ]),

      buttonLabel:
        "View Cash Account",

      buttonUrl:
        `${origin}/dashboard/cash-account`,
    }),

    text: [
      `Hello ${input.investorName},`,
      "",
      `We received your Tevuah Cash withdrawal request for ${amount}.`,
      "",
      "Status: Submitted",
      "Method: Wire Transfer",
      input.maskedAccountNumber
        ? `Destination: ${input.maskedAccountNumber}`
        : "",
      "",
      "Submitting a withdrawal request does not immediately debit your available Cash Account balance. You will receive another update after review.",
      "",
      `${origin}/dashboard/cash-account`,
      "",
      "Tevuah Reserve",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

export function companyCashWithdrawalSubmittedEmail(
  input: CompanySubmittedInput,
) {
  const origin =
    normalizeOrigin(input.origin);

  const amount =
    formatMoney(
      input.amountCents,
      input.currency,
    );

  return {
    subject:
      `New Cash Account withdrawal request — ${amount}`,

    html: layout({
      eyebrow:
        "Administrative review required",

      title:
        "New Cash Account withdrawal request",

      intro: `
        <strong>${escapeHtml(input.investorName)}</strong>
        submitted a new Tevuah Cash Account withdrawal request.
        The request is awaiting administrative review.
      `,

      body: detailsTable([
        {
          label: "Investor",
          value: input.investorName,
        },
        {
          label: "Investor email",
          value: input.investorEmail,
        },
        {
          label: "Amount",
          value: amount,
        },
        {
          label: "Method",
          value: "Wire Transfer",
        },
        {
          label: "Bank",
          value:
            input.bankName ||
            "Bank account",
        },
        {
          label: "Destination",
          value:
            input.maskedAccountNumber ||
            "Account on file",
        },
        {
          label: "Status",
          value: "Submitted",
        },
        {
          label: "Request ID",
          value: input.withdrawalId,
        },
      ]),

      buttonLabel:
        "Review withdrawal",

      buttonUrl:
        `${origin}/admin/withdrawals/${input.withdrawalId}`,
    }),

    text: [
      "New Cash Account withdrawal request",
      "",
      `Investor: ${input.investorName}`,
      `Email: ${input.investorEmail}`,
      `Amount: ${amount}`,
      "Method: Wire Transfer",
      `Request ID: ${input.withdrawalId}`,
      "",
      `${origin}/admin/withdrawals/${input.withdrawalId}`,
      "",
      "Tevuah Reserve",
    ].join("\n"),
  };
}

export function investorCashWithdrawalProcessingEmail(
  input: BaseWithdrawalEmailInput,
) {
  const origin =
    normalizeOrigin(input.origin);

  const amount =
    formatMoney(
      input.amountCents,
      input.currency,
    );

  return {
    subject:
      "Your Tevuah Cash withdrawal is being processed",

    html: layout({
      eyebrow:
        "Withdrawal processing",

      title:
        "Your withdrawal is being processed",

      intro: `
        Hello ${escapeHtml(input.investorName)},<br><br>
        Your Tevuah Cash withdrawal request has been approved
        and is now being processed.
      `,

      body: `
        ${detailsTable([
          {
            label: "Amount",
            value: amount,
          },
          {
            label: "Method",
            value: "Wire Transfer",
          },
          {
            label: "Bank",
            value:
              input.bankName ||
              "Bank account",
          },
          {
            label: "Destination",
            value:
              input.maskedAccountNumber ||
              "Account on file",
          },
          {
            label: "Status",
            value: "Processing",
          },
        ])}

        <div
          style="
            margin-top:24px;
            font-family:Arial,sans-serif;
            font-size:14px;
            line-height:24px;
            color:#4d5b56;
          "
        >
          The withdrawal amount has now been deducted from your
          available Tevuah Cash balance while we complete the
          outgoing payment. No action is required from you.
          You will receive another confirmation when the payment
          has been completed.
        </div>
      `,

      buttonLabel:
        "View Cash Account",

      buttonUrl:
        `${origin}/dashboard/cash-account`,
    }),

    text: [
      `Hello ${input.investorName},`,
      "",
      `Your Tevuah Cash withdrawal for ${amount} has been approved and is now being processed.`,
      "",
      "The withdrawal amount has been deducted from your available Tevuah Cash balance.",
      "No action is required from you.",
      "",
      `${origin}/dashboard/cash-account`,
      "",
      "Tevuah Reserve",
    ].join("\n"),
  };
}

export function investorCashWithdrawalRejectedEmail(
  input: RejectedInput,
) {
  const origin =
    normalizeOrigin(input.origin);

  const amount =
    formatMoney(
      input.amountCents,
      input.currency,
    );

  return {
    subject:
      "Update on your Tevuah Cash withdrawal request",

    html: layout({
      eyebrow:
        "Withdrawal review update",

      title:
        "Your withdrawal request was not approved",

      intro: `
        Hello ${escapeHtml(input.investorName)},<br><br>
        We completed our review of your Tevuah Cash withdrawal
        request for <strong>${escapeHtml(amount)}</strong>.
        The request was not approved.
      `,

      body: `
        ${detailsTable([
          {
            label: "Amount",
            value: amount,
          },
          {
            label: "Status",
            value: "Not approved",
          },
        ])}

        <div
          style="
            margin-top:24px;
            padding:18px;
            border-radius:16px;
            background:#fff7ed;
            font-family:Arial,sans-serif;
            font-size:13px;
            line-height:22px;
            color:#7c4a18;
          "
        >
          <strong>Review note</strong><br>
          ${escapeHtml(input.reason)}
        </div>
      `,

      buttonLabel:
        "View Cash Account",

      buttonUrl:
        `${origin}/dashboard/cash-account`,
    }),

    text: [
      `Hello ${input.investorName},`,
      "",
      `Your Tevuah Cash withdrawal request for ${amount} was not approved.`,
      "",
      `Reason: ${input.reason}`,
      "",
      `${origin}/dashboard/cash-account`,
      "",
      "Tevuah Reserve",
    ].join("\n"),
  };
}

export function investorCashWithdrawalPaidEmail(
  input: PaidInput,
) {
  const origin =
    normalizeOrigin(input.origin);

  const amount =
    formatMoney(
      input.amountCents,
      input.currency,
    );

  return {
    subject:
      "Your Tevuah Cash withdrawal has been paid",

    html: layout({
      eyebrow:
        "Payment completed",

      title:
        "Your withdrawal has been paid",

      intro: `
        Hello ${escapeHtml(input.investorName)},<br><br>
        Your Tevuah Cash withdrawal has been completed and
        the outgoing payment has been released.
      `,

      body: `
        ${detailsTable([
          {
            label: "Amount paid",
            value: amount,
          },
          {
            label: "Method",
            value: "Wire Transfer",
          },
          {
            label: "Bank",
            value:
              input.bankName ||
              "Bank account",
          },
          {
            label: "Destination",
            value:
              input.maskedAccountNumber ||
              "Account on file",
          },
          {
            label: "Payment reference",
            value:
              input.paymentReference,
          },
          {
            label: "Status",
            value: "Paid",
          },
        ])}

        <div
          style="
            margin-top:24px;
            font-family:Arial,sans-serif;
            font-size:14px;
            line-height:24px;
            color:#4d5b56;
          "
        >
          The payment has been released to the bank account
          associated with your withdrawal request. Your bank's
          posting time may vary.
        </div>
      `,

      buttonLabel:
        "View Cash Account",

      buttonUrl:
        `${origin}/dashboard/cash-account`,
    }),

    text: [
      `Hello ${input.investorName},`,
      "",
      `Your Tevuah Cash withdrawal of ${amount} has been paid.`,
      `Payment reference: ${input.paymentReference}`,
      "",
      "Your bank's posting time may vary.",
      "",
      `${origin}/dashboard/cash-account`,
      "",
      "Tevuah Reserve",
    ].join("\n"),
  };
}