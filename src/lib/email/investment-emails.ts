

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function absoluteUrl(origin: string, path: string) {
  return `${origin.replace(/\/$/, "")}${path}`;
}

function formatMoney(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function detailCard(rows: Array<[string, string]>) {
  return `
    <div style="margin:22px 0;padding:18px;border:1px solid #e7e2d8;border-radius:14px;background:#fbfaf7">
      ${rows.map(([label, value]) => `
        <div style="margin:8px 0">
          <span style="font-size:12px;color:#78716c">${escapeHtml(label)}</span><br />
          <strong style="font-size:14px;color:#17352c">${escapeHtml(value)}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function shell({
  eyebrow,
  heading,
  body,
  buttonLabel,
  buttonUrl,
}: {
  eyebrow: string;
  heading: string;
  body: string;
  buttonLabel?: string;
  buttonUrl?: string;
}) {
  const button =
    buttonLabel && buttonUrl
      ? `
        <p style="margin:28px 0 0">
          <a href="${escapeHtml(buttonUrl)}"
             style="display:inline-block;background:#12372d;color:#ffffff;text-decoration:none;padding:13px 20px;border-radius:999px;font-weight:700">
            ${escapeHtml(buttonLabel)}
          </a>
        </p>
      `
      : "";

  return `
    <div style="margin:0;padding:36px 16px;background:#f7f5ef;font-family:Arial,sans-serif;color:#17352c">
      <div style="max-width:660px;margin:0 auto;background:#ffffff;border:1px solid #e8e2d8;border-radius:20px;padding:34px">
        <div style="font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#a47c2d">
          ${escapeHtml(eyebrow)}
        </div>
        <h1 style="font-size:29px;line-height:1.25;margin:18px 0;color:#102f27">
          ${escapeHtml(heading)}
        </h1>
        ${body}
        ${button}
        <div style="margin-top:32px;padding-top:20px;border-top:1px solid #eee9df;font-size:12px;line-height:1.7;color:#78716c">
          Tevuah Reserve<br />
          Secure investor communications
        </div>
      </div>
    </div>
  `;
}

export function companySubscriptionSubmittedEmail({
  investorName,
  investorEmail,
  opportunityTitle,
  commitmentAmountCents,
  subscriptionId,
  origin,
}: {
  investorName: string;
  investorEmail: string;
  opportunityTitle: string;
  commitmentAmountCents: number;
  subscriptionId: string;
  origin: string;
}) {
  const reviewUrl = absoluteUrl(
    origin,
    `/admin/subscriptions/${subscriptionId}`,
  );

  return {
    subject: `New investment subscription — ${investorName}`,
    text:
      `${investorName} (${investorEmail}) submitted an investment subscription.\n\n` +
      `Opportunity: ${opportunityTitle}\n` +
      `Commitment: ${formatMoney(commitmentAmountCents)}\n\n` +
      `Review: ${reviewUrl}`,
    html: shell({
      eyebrow: "New subscription",
      heading: "An investor submitted an investment subscription",
      body: `
        <p style="font-size:15px;line-height:1.75;color:#57534e">
          A new investment subscription is ready for administrative review.
        </p>
        ${detailCard([
          ["Investor", investorName],
          ["Email", investorEmail],
          ["Opportunity", opportunityTitle],
          ["Commitment", formatMoney(commitmentAmountCents)],
        ])}
      `,
      buttonLabel: "Review subscription",
      buttonUrl: reviewUrl,
    }),
  };
}

export function investorSubscriptionApprovedEmail({
  investorName,
  opportunityTitle,
  commitmentAmountCents,
  subscriptionId,
  origin,
}: {
  investorName: string;
  opportunityTitle: string;
  commitmentAmountCents: number;
  subscriptionId: string;
  origin: string;
}) {
  const url = absoluteUrl(
    origin,
    `/dashboard/investments/${subscriptionId}/funding`,
  );

  return {
    subject: "Your Tevuah Reserve investment subscription was approved",
    text:
      `Hello ${investorName},\n\n` +
      `Your subscription for ${opportunityTitle} has been approved.\n` +
      `Commitment: ${formatMoney(commitmentAmountCents)}\n` +
      `Current stage: Awaiting payment.\n\n` +
      `Review the available funding methods and payment instructions here: ${url}`,
    html: shell({
      eyebrow: "Subscription approved",
      heading: "Your investment subscription has been approved",
      body: `
        <p style="font-size:15px;line-height:1.75;color:#57534e">
          Hello ${escapeHtml(investorName)},
        </p>
        <p style="font-size:15px;line-height:1.75;color:#57534e">
          Tevuah Reserve has approved your subscription. Your next stage is
          <strong style="color:#17352c">Awaiting payment</strong>.
        </p>
        ${detailCard([
          ["Opportunity", opportunityTitle],
          ["Approved commitment", formatMoney(commitmentAmountCents)],
          ["Next stage", "Awaiting payment"],
        ])}
        <p style="font-size:14px;line-height:1.7;color:#57534e">
          Open your investment to review the funding methods and the payment instructions assigned to your subscription.
        </p>
      `,
      buttonLabel: "View funding instructions",
      buttonUrl: url,
    }),
  };
}

export function investorSubscriptionActionRequiredEmail({
  investorName,
  opportunityTitle,
  reason,
  subscriptionId,
  origin,
}: {
  investorName: string;
  opportunityTitle: string;
  reason: string;
  subscriptionId: string;
  origin: string;
}) {
  const url = absoluteUrl(
    origin,
    `/dashboard/investments/${subscriptionId}`,
  );

  return {
    subject: "Action required for your Tevuah Reserve investment subscription",
    text:
      `Hello ${investorName},\n\n` +
      `Additional information is required for your subscription to ${opportunityTitle}.\n\n` +
      `Required update: ${reason}\n\n` +
      `Review and respond: ${url}`,
    html: shell({
      eyebrow: "Action required",
      heading: "Additional information is required for your subscription",
      body: `
        <p style="font-size:15px;line-height:1.75;color:#57534e">
          Hello ${escapeHtml(investorName)},
        </p>
        <p style="font-size:15px;line-height:1.75;color:#57534e">
          Our investment review team needs additional information before we can continue reviewing your subscription to
          <strong>${escapeHtml(opportunityTitle)}</strong>.
        </p>
        <div style="margin-top:20px;padding:17px;border-radius:14px;background:#fff7ed;border:1px solid #fed7aa">
          <div style="font-size:12px;font-weight:700;color:#9a3412;text-transform:uppercase;letter-spacing:.08em">
            Required update
          </div>
          <p style="margin:8px 0 0;font-size:14px;line-height:1.7;color:#7c2d12">
            ${escapeHtml(reason)}
          </p>
        </div>
      `,
      buttonLabel: "Review subscription",
      buttonUrl: url,
    }),
  };
}

export function investorSubscriptionRejectedEmail({
  investorName,
  opportunityTitle,
  reason,
  subscriptionId,
  origin,
}: {
  investorName: string;
  opportunityTitle: string;
  reason: string;
  subscriptionId: string;
  origin: string;
}) {
  const url = absoluteUrl(
    origin,
    `/dashboard/investments/${subscriptionId}`,
  );

  return {
    subject: "Update regarding your Tevuah Reserve investment subscription",
    text:
      `Hello ${investorName},\n\n` +
      `Your subscription for ${opportunityTitle} was not approved.\n\n` +
      `Reason: ${reason}\n\n` +
      `View details: ${url}`,
    html: shell({
      eyebrow: "Subscription decision",
      heading: "Your investment subscription was not approved",
      body: `
        <p style="font-size:15px;line-height:1.75;color:#57534e">
          Hello ${escapeHtml(investorName)},
        </p>
        <p style="font-size:15px;line-height:1.75;color:#57534e">
          Your current subscription for <strong>${escapeHtml(opportunityTitle)}</strong> was not approved.
        </p>
        <div style="margin-top:20px;padding:17px;border-radius:14px;background:#fef2f2;border:1px solid #fecaca">
          <div style="font-size:12px;font-weight:700;color:#b91c1c;text-transform:uppercase;letter-spacing:.08em">
            Reason for decision
          </div>
          <p style="margin:8px 0 0;font-size:14px;line-height:1.7;color:#7f1d1d">
            ${escapeHtml(reason)}
          </p>
        </div>
      `,
      buttonLabel: "View subscription",
      buttonUrl: url,
    }),
  };
}

export function companyPaymentReceivedEmail({
  investorName,
  investorEmail,
  opportunityTitle,
  amountCents,
  paymentMethod,
  paymentId,
  origin,
}: {
  investorName: string;
  investorEmail: string;
  opportunityTitle: string;
  amountCents: number;
  paymentMethod: string;
  paymentId: string;
  origin: string;
}) {
  const url = absoluteUrl(
    origin,
    `/admin/payments/${paymentId}`,
  );

  const method =
    paymentMethod === "tevuah_cash"
      ? "Tevuah Cash Account"
      : paymentMethod === "bitcoin"
        ? "Bitcoin"
        : "Wire transfer";

  return {
    subject: `Investment payment received — ${investorName}`,
    text:
      `${investorName} (${investorEmail}) has submitted/completed investment funding.\n\n` +
      `Opportunity: ${opportunityTitle}\n` +
      `Amount: ${formatMoney(amountCents)}\n` +
      `Funding method: ${method}\n\n` +
      `Open payment: ${url}`,
    html: shell({
      eyebrow: "Investment funding",
      heading: "An investment payment has been received",
      body: `
        <p style="font-size:15px;line-height:1.75;color:#57534e">
          An investor funding event has been recorded.
        </p>
        ${detailCard([
          ["Investor", investorName],
          ["Email", investorEmail],
          ["Opportunity", opportunityTitle],
          ["Amount", formatMoney(amountCents)],
          ["Funding method", method],
        ])}
      `,
      buttonLabel: "Open payment",
      buttonUrl: url,
    }),
  };
}

export function investorInvestmentFundedEmail({
  investorName,
  opportunityTitle,
  amountCents,
  paymentMethod,
  paymentId,
  origin,
}: {
  investorName: string;
  opportunityTitle: string;
  amountCents: number;
  paymentMethod: string;
  paymentId: string;
  origin: string;
}) {
  const url = absoluteUrl(
    origin,
    `/dashboard/documents/funding-confirmation/${paymentId}`,
  );

  return {
    subject: "Your Tevuah Reserve investment funding was successful",
    text:
      `Hello ${investorName}, your investment funding for ${opportunityTitle} was successfully verified.\n\n` +
      `Amount: ${formatMoney(amountCents)}\n` +
      `Funding method: ${paymentMethod}\n\n` +
      `Funding confirmation: ${url}`,
    html: shell({
      eyebrow: "Funding successful",
      heading: "Your investment is now funded",
      body: `
        <p style="font-size:15px;line-height:1.75;color:#57534e">
          Hello ${escapeHtml(investorName)},
        </p>
        <p style="font-size:15px;line-height:1.75;color:#57534e">
          Your funding has been successfully verified and your funded investment position is now available.
        </p>
        ${detailCard([
          ["Opportunity", opportunityTitle],
          ["Amount verified", formatMoney(amountCents)],
          ["Funding method", paymentMethod],
        ])}
      `,
      buttonLabel: "View funding confirmation",
      buttonUrl: url,
    }),
  };
}

export function investorCashAccountFundedEmail({
  investorName,
  amountCents,
  availableBalanceCents,
  origin,
}: {
  investorName: string;
  amountCents: number;
  availableBalanceCents?: number | null;
  origin: string;
}) {
  const url = absoluteUrl(
    origin,
    "/dashboard/cash-account",
  );

  const rows: Array<[string, string]> = [
    ["Amount credited", formatMoney(amountCents)],
  ];

  if (availableBalanceCents != null) {
    rows.push([
      "Available balance",
      formatMoney(availableBalanceCents),
    ]);
  }

  return {
    subject: "Funds credited to your Tevuah Cash Account",
    text:
      `Hello ${investorName}, ${formatMoney(amountCents)} was successfully credited to your Tevuah Cash Account.\n\n` +
      `View account: ${url}`,
    html: shell({
      eyebrow: "Cash Account funded",
      heading: "Funds were successfully credited to your Tevuah Cash Account",
      body: `
        <p style="font-size:15px;line-height:1.75;color:#57534e">
          Hello ${escapeHtml(investorName)},
        </p>
        <p style="font-size:15px;line-height:1.75;color:#57534e">
          Your Tevuah Cash Account has been funded successfully. The credited funds are now reflected in your account.
        </p>
        ${detailCard(rows)}
      `,
      buttonLabel: "View Cash Account",
      buttonUrl: url,
    }),
  };
}


export function investorCashDepositInstructionsEmail({
  investorName,
  amountCents,
  paymentMethod,
  depositRequestId,
  origin,
}: {
  investorName: string;
  amountCents: number;
  paymentMethod: string;
  depositRequestId: string;
  origin: string;
}) {
  const url = absoluteUrl(
    origin,
    `/dashboard/cash-account?deposit=${depositRequestId}`,
  );

  const method =
    paymentMethod === "bitcoin"
      ? "Bitcoin"
      : "Wire transfer";

  return {
    subject: "Your Tevuah Cash Account funding instructions are ready",
    text:
      `Hello ${investorName}, your ${method} instructions for funding ${formatMoney(amountCents)} into your Tevuah Cash Account are ready.\n\n` +
      `Open your Cash Account to review the exact instructions: ${url}`,
    html: shell({
      eyebrow: "Funding instructions ready",
      heading: "Your Cash Account funding instructions are ready",
      body: `
        <p style="font-size:15px;line-height:1.75;color:#57534e">
          Hello ${escapeHtml(investorName)},
        </p>
        <p style="font-size:15px;line-height:1.75;color:#57534e">
          Tevuah Reserve has prepared the exact <strong>${escapeHtml(method)}</strong>
          instructions for your Cash Account deposit.
        </p>
        ${detailCard([
          ["Deposit amount", formatMoney(amountCents)],
          ["Payment method", method],
          ["Status", "Awaiting payment"],
        ])}
        <p style="font-size:14px;line-height:1.7;color:#57534e">
          Use only the payment details shown in your secure dashboard. After sending the payment,
          return to the Cash Account page and report the transaction for verification.
        </p>
      `,
      buttonLabel: "View funding instructions",
      buttonUrl: url,
    }),
  };
}

export function companyCashDepositReportedEmail({
  investorName,
  investorEmail,
  amountCents,
  paymentMethod,
  depositRequestId,
  origin,
}: {
  investorName: string;
  investorEmail: string;
  amountCents: number;
  paymentMethod: string;
  depositRequestId: string;
  origin: string;
}) {
  const url = absoluteUrl(
    origin,
    `/admin/investors/${depositRequestId}`,
  );

  const method =
    paymentMethod === "bitcoin"
      ? "Bitcoin"
      : "Wire transfer";

  return {
    subject: `Cash Account deposit reported — ${investorName}`,
    text:
      `${investorName} (${investorEmail}) reported a ${method} Cash Account deposit of ${formatMoney(amountCents)}.\n\n` +
      `Deposit request ID: ${depositRequestId}\n\nReview the investor Cash Account in admin.`,
    html: shell({
      eyebrow: "Cash Account deposit reported",
      heading: "An investor reported a Cash Account deposit",
      body: `
        ${detailCard([
          ["Investor", investorName],
          ["Email", investorEmail],
          ["Amount", formatMoney(amountCents)],
          ["Payment method", method],
          ["Deposit request", depositRequestId],
        ])}
        <p style="font-size:14px;line-height:1.7;color:#57534e">
          The investor report has not credited their Cash Account. An administrator must verify the payment first.
        </p>
      `,
    }),
  };
}

export function companyCashDepositVerifiedEmail({
  investorName,
  investorEmail,
  amountCents,
  paymentMethod,
  depositRequestId,
}: {
  investorName: string;
  investorEmail: string;
  amountCents: number;
  paymentMethod: string;
  depositRequestId: string;
}) {
  const method =
    paymentMethod === "bitcoin"
      ? "Bitcoin"
      : "Wire transfer";

  return {
    subject: `Cash Account deposit verified — ${investorName}`,
    text:
      `${investorName} (${investorEmail}) had a ${method} Cash Account deposit successfully verified and credited.\n\n` +
      `Amount: ${formatMoney(amountCents)}\nDeposit request ID: ${depositRequestId}`,
    html: shell({
      eyebrow: "Cash Account deposit verified",
      heading: "A Cash Account deposit was successfully verified",
      body: `
        ${detailCard([
          ["Investor", investorName],
          ["Email", investorEmail],
          ["Amount credited", formatMoney(amountCents)],
          ["Payment method", method],
          ["Deposit request", depositRequestId],
        ])}
      `,
    }),
  };
}

export function investorCashDepositRejectedEmail({
  investorName,
  amountCents,
  reason,
  origin,
}: {
  investorName: string;
  amountCents: number;
  reason: string;
  origin: string;
}) {
  const url = absoluteUrl(
    origin,
    "/dashboard/cash-account",
  );

  return {
    subject: "Action required for your Tevuah Cash Account deposit",
    text:
      `Hello ${investorName}, your Cash Account deposit report for ${formatMoney(amountCents)} could not be verified.\n\n` +
      `Reason: ${reason}\n\nReview your Cash Account: ${url}`,
    html: shell({
      eyebrow: "Deposit needs attention",
      heading: "Your Cash Account deposit needs attention",
      body: `
        <p style="font-size:15px;line-height:1.75;color:#57534e">
          Hello ${escapeHtml(investorName)},
        </p>
        <p style="font-size:15px;line-height:1.75;color:#57534e">
          We could not verify your reported Cash Account deposit.
        </p>
        <div style="margin-top:20px;padding:17px;border-radius:14px;background:#fff7ed;border:1px solid #fed7aa">
          <strong>Reason</strong>
          <p style="margin:8px 0 0;line-height:1.7">${escapeHtml(reason)}</p>
        </div>
      `,
      buttonLabel: "View Cash Account",
      buttonUrl: url,
    }),
  };
}

/* ================================================================
 * Additional investment / Cash Account funding templates
 * ================================================================ */

function paymentMethodDisplayName(value: string) {
  if (value === "tevuah_cash" || value === "cash_account") {
    return "Tevuah Cash Account";
  }
  if (value === "bitcoin") return "Bitcoin";
  return "Wire transfer";
}

export function companyInvestmentPaymentReportedEmail({
  investorName,
  investorEmail,
  opportunityTitle,
  amountCents,
  paymentMethod,
  paymentId,
  origin,
}: {
  investorName: string;
  investorEmail: string;
  opportunityTitle: string;
  amountCents: number;
  paymentMethod: string;
  paymentId: string;
  origin: string;
}) {
  const url = absoluteUrl(origin, `/admin/payments/${paymentId}`);
  const method = paymentMethodDisplayName(paymentMethod);

  return {
    subject: `Investment payment reported — ${investorName}`,
    text:
      `${investorName} (${investorEmail}) reported an investment payment.\n\n` +
      `Opportunity: ${opportunityTitle}\n` +
      `Amount: ${formatMoney(amountCents)}\n` +
      `Payment method: ${method}\n\n` +
      `Review payment: ${url}`,
    html: shell({
      eyebrow: "Investment payment reported",
      heading: "An investor reported an investment payment",
      body: `
        <p style="font-size:15px;line-height:1.75;color:#57534e">
          An investor has reported that an external investment payment was sent. The payment has not been funded until administrative verification succeeds.
        </p>
        ${detailCard([
          ["Investor", investorName],
          ["Email", investorEmail],
          ["Opportunity", opportunityTitle],
          ["Amount", formatMoney(amountCents)],
          ["Payment method", method],
        ])}
      `,
      buttonLabel: "Review payment",
      buttonUrl: url,
    }),
  };
}

export function investorInvestmentPaymentVerifiedEmail({
  investorName,
  opportunityTitle,
  amountCents,
  paymentMethod,
  paymentId,
  origin,
}: {
  investorName: string;
  opportunityTitle: string;
  amountCents: number;
  paymentMethod: string;
  subscriptionId?: string;
  paymentId: string;
  origin: string;
}) {
  return investorInvestmentFundedEmail({
    investorName,
    opportunityTitle,
    amountCents,
    paymentMethod: paymentMethodDisplayName(paymentMethod),
    paymentId,
    origin,
  });
}

export function investorInvestmentPaymentRejectedEmail({
  investorName,
  opportunityTitle,
  amountCents,
  reason,
  subscriptionId,
  origin,
}: {
  investorName: string;
  opportunityTitle: string;
  amountCents: number;
  reason: string;
  subscriptionId: string;
  origin: string;
}) {
  const url = absoluteUrl(
    origin,
    `/dashboard/investments/${subscriptionId}/funding`,
  );

  return {
    subject: "Action required for your Tevuah Reserve investment payment",
    text:
      `Hello ${investorName},\n\n` +
      `We could not verify your reported payment for ${opportunityTitle}.\n` +
      `Amount: ${formatMoney(amountCents)}\n\n` +
      `Reason: ${reason}\n\n` +
      `Review funding details: ${url}`,
    html: shell({
      eyebrow: "Payment needs attention",
      heading: "Your reported investment payment needs attention",
      body: `
        <p style="font-size:15px;line-height:1.75;color:#57534e">
          Hello ${escapeHtml(investorName)},
        </p>
        <p style="font-size:15px;line-height:1.75;color:#57534e">
          We could not verify the payment you reported for <strong>${escapeHtml(opportunityTitle)}</strong>.
        </p>
        ${detailCard([
          ["Opportunity", opportunityTitle],
          ["Reported amount", formatMoney(amountCents)],
        ])}
        <div style="margin-top:20px;padding:17px;border-radius:14px;background:#fff7ed;border:1px solid #fed7aa">
          <strong>Reason</strong>
          <p style="margin:8px 0 0;line-height:1.7">${escapeHtml(reason)}</p>
        </div>
      `,
      buttonLabel: "Review funding details",
      buttonUrl: url,
    }),
  };
}

export function companyInvestmentPaymentVerifiedEmail({
  investorName,
  investorEmail,
  opportunityTitle,
  amountCents,
  paymentMethod,
  paymentId,
  origin,
}: {
  investorName: string;
  investorEmail: string;
  opportunityTitle: string;
  amountCents: number;
  paymentMethod: string;
  paymentId: string;
  origin: string;
}) {
  const url = absoluteUrl(origin, `/admin/payments/${paymentId}`);
  const method = paymentMethodDisplayName(paymentMethod);

  return {
    subject: `Investment payment verified — ${investorName}`,
    text:
      `${investorName} (${investorEmail}) had an investment payment successfully verified and funded.\n\n` +
      `Opportunity: ${opportunityTitle}\n` +
      `Amount: ${formatMoney(amountCents)}\n` +
      `Payment method: ${method}\n\n` +
      `Open payment: ${url}`,
    html: shell({
      eyebrow: "Investment payment verified",
      heading: "Investment funding completed successfully",
      body: `
        ${detailCard([
          ["Investor", investorName],
          ["Email", investorEmail],
          ["Opportunity", opportunityTitle],
          ["Verified amount", formatMoney(amountCents)],
          ["Payment method", method],
        ])}
      `,
      buttonLabel: "Open payment",
      buttonUrl: url,
    }),
  };
}

export function investorCashDepositVerifiedEmail({
  investorName,
  amountCents,
  paymentMethod,
  origin,
}: {
  investorName: string;
  amountCents: number;
  paymentMethod: string;
  origin: string;
}) {
  const url = absoluteUrl(origin, "/dashboard/cash-account");
  const method = paymentMethodDisplayName(paymentMethod);

  return {
    subject: "Your Tevuah Cash Account deposit was verified",
    text:
      `Hello ${investorName},\n\n` +
      `Your Cash Account deposit of ${formatMoney(amountCents)} was successfully verified and credited.\n` +
      `Payment method: ${method}\n\n` +
      `View Cash Account: ${url}`,
    html: shell({
      eyebrow: "Cash Account funded",
      heading: "Your Cash Account deposit was verified",
      body: `
        <p style="font-size:15px;line-height:1.75;color:#57534e">
          Hello ${escapeHtml(investorName)},
        </p>
        <p style="font-size:15px;line-height:1.75;color:#57534e">
          Your reported deposit has been successfully verified and credited to your Tevuah Cash Account.
        </p>
        ${detailCard([
          ["Amount credited", formatMoney(amountCents)],
          ["Payment method", method],
        ])}
      `,
      buttonLabel: "View Cash Account",
      buttonUrl: url,
    }),
  };
}

export function investorDistributionPublishedEmail({
  investorName,
  opportunityTitle,
  distributionTitle,
  distributionType,
  amountCents,
  paymentDate,
  dashboardUrl,
}: {
  investorName: string;
  opportunityTitle: string;
  distributionTitle: string;
  distributionType: string;
  amountCents: number;
  paymentDate?: string | null;
  dashboardUrl: string;
}) {
  const amount =
    new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    ).format(
      amountCents / 100,
    );

  const readableType =
    distributionType
      .replaceAll("_", " ")
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase(),
      );

  const formattedPaymentDate =
    paymentDate
      ? formatDistributionEmailDate(
          paymentDate,
        )
      : null;

  const subject =
    `New distribution available — ${distributionTitle}`;

  const text = `
TEVUAH RESERVE

Distribution Available

Hello ${investorName},

A new distribution has been published for your investment in ${opportunityTitle}.

YOUR DISTRIBUTION
${amount}

Distribution: ${distributionTitle}
Investment: ${opportunityTitle}
Type: ${readableType}
${formattedPaymentDate ? `Payment date: ${formattedPaymentDate}` : ""}

This amount represents your individual distribution allocation.

Review your distribution:
${dashboardUrl}

You can view your distribution history and related investment information securely from your Tevuah Reserve investor dashboard.

Tevuah Reserve
Private Markets · Real Assets · Long-Term Value

This is an automated account notification. For security, access investment information only through your authenticated Tevuah Reserve dashboard.
  `.trim();

  const html = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
    />
    <meta
      name="color-scheme"
      content="light"
    />
    <meta
      name="supported-color-schemes"
      content="light"
    />
    <title>${escapeEmailHtml(subject)}</title>
  </head>

  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f4f1e8;
      color: #1c2923;
      font-family: Arial, Helvetica, sans-serif;
      -webkit-font-smoothing: antialiased;
    "
  >
    <div
      style="
        display: none;
        max-height: 0;
        overflow: hidden;
        opacity: 0;
        color: transparent;
      "
    >
      A new ${escapeEmailHtml(readableType)} distribution of ${escapeEmailHtml(amount)}
      is available for your investment in ${escapeEmailHtml(opportunityTitle)}.
    </div>

    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="
        width: 100%;
        background-color: #f4f1e8;
      "
    >
      <tr>
        <td
          align="center"
          style="
            padding: 40px 16px;
          "
        >
          <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="
              width: 100%;
              max-width: 640px;
              background-color: #ffffff;
              border-radius: 24px;
              overflow: hidden;
              border: 1px solid #e4e0d6;
              box-shadow: 0 10px 35px rgba(24, 45, 36, 0.08);
            "
          >
            <!-- Header -->
            <tr>
              <td
                style="
                  background-color: #102a21;
                  padding: 32px 40px;
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
                    <td>
                      <div
                        style="
                          color: #d4b26a;
                          font-size: 11px;
                          font-weight: 700;
                          letter-spacing: 2.4px;
                          text-transform: uppercase;
                        "
                      >
                        TEVUAH RESERVE
                      </div>

                      <div
                        style="
                          margin-top: 9px;
                          color: #ffffff;
                          font-family: Georgia, 'Times New Roman', serif;
                          font-size: 25px;
                          line-height: 32px;
                          font-weight: 600;
                        "
                      >
                        Distribution Available
                      </div>
                    </td>

                    <td
                      align="right"
                      valign="top"
                    >
                      <span
                        style="
                          display: inline-block;
                          padding: 8px 12px;
                          border: 1px solid rgba(212, 178, 106, 0.35);
                          border-radius: 999px;
                          color: #e5ca91;
                          font-size: 10px;
                          font-weight: 700;
                          letter-spacing: 1.2px;
                          text-transform: uppercase;
                        "
                      >
                        Published
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Main -->
            <tr>
              <td
                style="
                  padding: 40px 40px 18px;
                "
              >
                <div
                  style="
                    font-size: 16px;
                    line-height: 26px;
                    color: #26372f;
                  "
                >
                  Hello ${escapeEmailHtml(investorName)},
                </div>

                <div
                  style="
                    margin-top: 14px;
                    font-size: 15px;
                    line-height: 26px;
                    color: #667069;
                  "
                >
                  A new distribution has been published for your
                  investment in
                  <strong
                    style="
                      color: #1b3027;
                      font-weight: 700;
                    "
                  >
                    ${escapeEmailHtml(opportunityTitle)}
                  </strong>.
                  The amount below represents your individual
                  distribution allocation.
                </div>
              </td>
            </tr>

            <!-- Amount card -->
            <tr>
              <td
                style="
                  padding: 14px 40px 26px;
                "
              >
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    background-color: #f8f5ec;
                    border: 1px solid #e8e0cc;
                    border-radius: 18px;
                  "
                >
                  <tr>
                    <td
                      align="center"
                      style="
                        padding: 28px 24px;
                      "
                    >
                      <div
                        style="
                          color: #8c7951;
                          font-size: 10px;
                          font-weight: 700;
                          letter-spacing: 1.8px;
                          text-transform: uppercase;
                        "
                      >
                        Your Distribution
                      </div>

                      <div
                        style="
                          margin-top: 9px;
                          color: #102a21;
                          font-family: Georgia, 'Times New Roman', serif;
                          font-size: 38px;
                          line-height: 46px;
                          font-weight: 700;
                          letter-spacing: -1px;
                        "
                      >
                        ${escapeEmailHtml(amount)}
                      </div>

                      <div
                        style="
                          margin-top: 7px;
                          color: #8a918d;
                          font-size: 12px;
                          line-height: 18px;
                        "
                      >
                        Individual investor allocation
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Details -->
            <tr>
              <td
                style="
                  padding: 0 40px 30px;
                "
              >
                <div
                  style="
                    margin-bottom: 14px;
                    color: #102a21;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                  "
                >
                  Distribution details
                </div>

                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    width: 100%;
                    border-collapse: collapse;
                  "
                >
                  ${distributionEmailDetailRow(
                    "Distribution",
                    distributionTitle,
                  )}

                  ${distributionEmailDetailRow(
                    "Investment",
                    opportunityTitle,
                  )}

                  ${distributionEmailDetailRow(
                    "Distribution type",
                    readableType,
                  )}

                  ${
                    formattedPaymentDate
                      ? distributionEmailDetailRow(
                          "Payment date",
                          formattedPaymentDate,
                        )
                      : ""
                  }
                </table>
              </td>
            </tr>

            <!-- CTA -->
            <tr>
              <td
                align="center"
                style="
                  padding: 0 40px 38px;
                "
              >
                <table
                  role="presentation"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                >
                  <tr>
                    <td
                      align="center"
                      bgcolor="#102a21"
                      style="
                        border-radius: 999px;
                      "
                    >
                      <a
                        href="${escapeEmailAttribute(dashboardUrl)}"
                        style="
                          display: inline-block;
                          padding: 14px 26px;
                          color: #ffffff;
                          font-size: 13px;
                          line-height: 18px;
                          font-weight: 700;
                          text-decoration: none;
                        "
                      >
                        View Distribution
                      </a>
                    </td>
                  </tr>
                </table>

                <div
                  style="
                    margin-top: 18px;
                    color: #8a918d;
                    font-size: 11px;
                    line-height: 18px;
                  "
                >
                  Sign in to your secure investor dashboard to review
                  your distribution history and investment details.
                </div>
              </td>
            </tr>

            <!-- Footer -->
            ${distributionEmailFooter()}
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

export function investorDistributionPaidEmail({
  investorName,
  opportunityTitle,
  distributionTitle,
  distributionType,
  amountCents,
  paymentReference,
  paidAt,
  dashboardUrl,
}: {
  investorName: string;
  opportunityTitle: string;
  distributionTitle: string;
  distributionType: string;
  amountCents: number;
  paymentReference: string;
  paidAt: string;
  dashboardUrl: string;
}) {
  const amount =
    new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    ).format(
      amountCents / 100,
    );

  const readableType =
    distributionType
      .replaceAll("_", " ")
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase(),
      );

  const subject =
    `Distribution payment completed — ${distributionTitle}`;

  const text = `
TEVUAH RESERVE

Distribution Payment Completed

Hello ${investorName},

Your distribution payment for ${opportunityTitle} has been completed.

AMOUNT PAID
${amount}

Distribution: ${distributionTitle}
Investment: ${opportunityTitle}
Type: ${readableType}
Payment reference: ${paymentReference}
Paid: ${paidAt}

This amount represents your individual distribution payment.

Review your distributions:
${dashboardUrl}

You can review your payment details and distribution history securely from your Tevuah Reserve investor dashboard.

Tevuah Reserve
Private Markets · Real Assets · Long-Term Value

This is an automated account notification. For security, access investment information only through your authenticated Tevuah Reserve dashboard.
  `.trim();

  const html = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
    />
    <meta
      name="color-scheme"
      content="light"
    />
    <meta
      name="supported-color-schemes"
      content="light"
    />
    <title>${escapeEmailHtml(subject)}</title>
  </head>

  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f4f1e8;
      color: #1c2923;
      font-family: Arial, Helvetica, sans-serif;
      -webkit-font-smoothing: antialiased;
    "
  >
    <div
      style="
        display: none;
        max-height: 0;
        overflow: hidden;
        opacity: 0;
        color: transparent;
      "
    >
      Your ${escapeEmailHtml(amount)} distribution payment for
      ${escapeEmailHtml(opportunityTitle)} has been completed.
    </div>

    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="
        width: 100%;
        background-color: #f4f1e8;
      "
    >
      <tr>
        <td
          align="center"
          style="
            padding: 40px 16px;
          "
        >
          <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="
              width: 100%;
              max-width: 640px;
              background-color: #ffffff;
              border-radius: 24px;
              overflow: hidden;
              border: 1px solid #e4e0d6;
              box-shadow: 0 10px 35px rgba(24, 45, 36, 0.08);
            "
          >
            <!-- Header -->
            <tr>
              <td
                style="
                  background-color: #102a21;
                  padding: 32px 40px;
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
                    <td>
                      <div
                        style="
                          color: #d4b26a;
                          font-size: 11px;
                          font-weight: 700;
                          letter-spacing: 2.4px;
                          text-transform: uppercase;
                        "
                      >
                        TEVUAH RESERVE
                      </div>

                      <div
                        style="
                          margin-top: 9px;
                          color: #ffffff;
                          font-family: Georgia, 'Times New Roman', serif;
                          font-size: 25px;
                          line-height: 32px;
                          font-weight: 600;
                        "
                      >
                        Distribution Payment Completed
                      </div>
                    </td>

                    <td
                      align="right"
                      valign="top"
                    >
                      <span
                        style="
                          display: inline-block;
                          padding: 8px 12px;
                          border: 1px solid rgba(212, 178, 106, 0.35);
                          border-radius: 999px;
                          color: #e5ca91;
                          font-size: 10px;
                          font-weight: 700;
                          letter-spacing: 1.2px;
                          text-transform: uppercase;
                        "
                      >
                        Paid
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Main -->
            <tr>
              <td
                style="
                  padding: 40px 40px 18px;
                "
              >
                <div
                  style="
                    font-size: 16px;
                    line-height: 26px;
                    color: #26372f;
                  "
                >
                  Hello ${escapeEmailHtml(investorName)},
                </div>

                <div
                  style="
                    margin-top: 14px;
                    font-size: 15px;
                    line-height: 26px;
                    color: #667069;
                  "
                >
                  Your distribution payment for
                  <strong
                    style="
                      color: #1b3027;
                      font-weight: 700;
                    "
                  >
                    ${escapeEmailHtml(opportunityTitle)}
                  </strong>
                  has been completed. The amount below represents
                  your individual distribution payment.
                </div>
              </td>
            </tr>

            <!-- Paid amount -->
            <tr>
              <td
                style="
                  padding: 14px 40px 26px;
                "
              >
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    background-color: #f8f5ec;
                    border: 1px solid #e8e0cc;
                    border-radius: 18px;
                  "
                >
                  <tr>
                    <td
                      align="center"
                      style="
                        padding: 28px 24px;
                      "
                    >
                      <div
                        style="
                          color: #8c7951;
                          font-size: 10px;
                          font-weight: 700;
                          letter-spacing: 1.8px;
                          text-transform: uppercase;
                        "
                      >
                        Amount Paid
                      </div>

                      <div
                        style="
                          margin-top: 9px;
                          color: #102a21;
                          font-family: Georgia, 'Times New Roman', serif;
                          font-size: 38px;
                          line-height: 46px;
                          font-weight: 700;
                          letter-spacing: -1px;
                        "
                      >
                        ${escapeEmailHtml(amount)}
                      </div>

                      <div
                        style="
                          margin-top: 7px;
                          color: #537361;
                          font-size: 12px;
                          line-height: 18px;
                          font-weight: 700;
                        "
                      >
                        Payment completed
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Details -->
            <tr>
              <td
                style="
                  padding: 0 40px 30px;
                "
              >
                <div
                  style="
                    margin-bottom: 14px;
                    color: #102a21;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                  "
                >
                  Payment details
                </div>

                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    width: 100%;
                    border-collapse: collapse;
                  "
                >
                  ${distributionEmailDetailRow(
                    "Distribution",
                    distributionTitle,
                  )}

                  ${distributionEmailDetailRow(
                    "Investment",
                    opportunityTitle,
                  )}

                  ${distributionEmailDetailRow(
                    "Distribution type",
                    readableType,
                  )}

                  ${distributionEmailDetailRow(
                    "Payment reference",
                    paymentReference,
                  )}

                  ${distributionEmailDetailRow(
                    "Paid",
                    paidAt,
                  )}
                </table>
              </td>
            </tr>

            <!-- Confirmation -->
            <tr>
              <td
                style="
                  padding: 0 40px 28px;
                "
              >
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    background-color: #f1f7f3;
                    border: 1px solid #d8e8de;
                    border-radius: 14px;
                  "
                >
                  <tr>
                    <td
                      style="
                        padding: 17px 18px;
                        color: #365c48;
                        font-size: 12px;
                        line-height: 20px;
                      "
                    >
                      <strong
                        style="
                          color: #204b37;
                        "
                      >
                        Payment confirmed.
                      </strong>
                      This distribution has been recorded as paid in
                      your Tevuah Reserve investment account.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- CTA -->
            <tr>
              <td
                align="center"
                style="
                  padding: 0 40px 38px;
                "
              >
                <table
                  role="presentation"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                >
                  <tr>
                    <td
                      align="center"
                      bgcolor="#102a21"
                      style="
                        border-radius: 999px;
                      "
                    >
                      <a
                        href="${escapeEmailAttribute(dashboardUrl)}"
                        style="
                          display: inline-block;
                          padding: 14px 26px;
                          color: #ffffff;
                          font-size: 13px;
                          line-height: 18px;
                          font-weight: 700;
                          text-decoration: none;
                        "
                      >
                        View Distribution History
                      </a>
                    </td>
                  </tr>
                </table>

                <div
                  style="
                    margin-top: 18px;
                    color: #8a918d;
                    font-size: 11px;
                    line-height: 18px;
                  "
                >
                  Your dashboard contains the latest status and
                  details for your investment distributions.
                </div>
              </td>
            </tr>

            <!-- Footer -->
            ${distributionEmailFooter()}
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

/*
 * ==================================================
 * DISTRIBUTION EMAIL HELPERS
 * ==================================================
 */

function distributionEmailDetailRow(
  label: string,
  value: string,
) {
  return `
    <tr>
      <td
        valign="top"
        style="
          width: 42%;
          padding: 13px 0;
          border-bottom: 1px solid #eeeae1;
          color: #8a918d;
          font-size: 12px;
          line-height: 19px;
        "
      >
        ${escapeEmailHtml(label)}
      </td>

      <td
        valign="top"
        align="right"
        style="
          padding: 13px 0;
          border-bottom: 1px solid #eeeae1;
          color: #20342b;
          font-size: 12px;
          line-height: 19px;
          font-weight: 700;
        "
      >
        ${escapeEmailHtml(value)}
      </td>
    </tr>
  `;
}

function distributionEmailFooter() {
  const year =
    new Date().getFullYear();

  return `
    <tr>
      <td
        style="
          background-color: #faf9f5;
          border-top: 1px solid #ece8de;
          padding: 26px 40px 30px;
          text-align: center;
        "
      >
        <div
          style="
            color: #102a21;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 1.4px;
            text-transform: uppercase;
          "
        >
          Tevuah Reserve
        </div>

        <div
          style="
            margin-top: 8px;
            color: #a09d94;
            font-size: 10px;
            line-height: 17px;
          "
        >
          Private Markets &nbsp;·&nbsp;
          Real Assets &nbsp;·&nbsp;
          Long-Term Value
        </div>

        <div
          style="
            margin: 18px auto 0;
            max-width: 480px;
            color: #aaa79f;
            font-size: 10px;
            line-height: 17px;
          "
        >
          This is an automated account notification.
          For your security, access investment information
          only through your authenticated Tevuah Reserve
          dashboard.
        </div>

        <div
          style="
            margin-top: 14px;
            color: #bbb8b0;
            font-size: 9px;
            line-height: 15px;
          "
        >
          © ${year} Tevuah Reserve. All rights reserved.
        </div>
      </td>
    </tr>
  `;
}

function formatDistributionEmailDate(
  value: string,
) {
  /*
   * YYYY-MM-DD dates should not accidentally move backward
   * one day because of the server's local timezone.
   */
  const dateOnly =
    /^\d{4}-\d{2}-\d{2}$/.test(
      value,
    );

  const date =
    dateOnly
      ? new Date(
          `${value}T12:00:00Z`,
        )
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone:
        dateOnly
          ? "UTC"
          : undefined,
    },
  ).format(date);
}

function escapeEmailHtml(
  value: string,
) {
  return String(value)
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

function escapeEmailAttribute(
  value: string,
) {
  return escapeEmailHtml(
    value,
  );
}

type CompanyJointPaymentInstructionsRequestedEmailInput = {
  investorName: string;
  investorEmail: string;
  opportunityTitle: string;

  paymentMethod:
    | "wire_transfer"
    | "bitcoin";

  principalAmountCents: number;
  wireChargeAmountCents: number;
  totalAmountDueCents: number;

  jointSubscriptionId: string;
  externalFundingId: string;

  origin: string;
};

function formatJointFundingMoney(
  amountCents: number,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    },
  ).format(
    amountCents / 100,
  );
}

function escapeJointFundingHtml(
  value: string,
) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function companyJointPaymentInstructionsRequestedEmail(
  input: CompanyJointPaymentInstructionsRequestedEmailInput,
) {
  const methodLabel =
    input.paymentMethod ===
    "wire_transfer"
      ? "Wire Transfer"
      : "Bitcoin";

  const principal =
    formatJointFundingMoney(
      input.principalAmountCents,
    );

  const wireCharge =
    formatJointFundingMoney(
      input.wireChargeAmountCents,
    );

  const totalDue =
    formatJointFundingMoney(
      input.totalAmountDueCents,
    );

  const adminUrl =
    `${input.origin}/admin/investments/joint/${input.jointSubscriptionId}`;

  const subject =
    `Joint investment ${methodLabel} instructions requested`;

  const wireChargeText =
    input.paymentMethod ===
    "wire_transfer"
      ? `Wire charge: ${wireCharge}\n`
      : "";

  const text = [
    "A joint investor has requested payment instructions.",
    "",
    `Investor: ${input.investorName}`,
    `Investor email: ${input.investorEmail}`,
    `Investment: ${input.opportunityTitle}`,
    `Payment method: ${methodLabel}`,
    "",
    `Principal obligation: ${principal}`,
    wireChargeText.trimEnd(),
    `Total amount due: ${totalDue}`,
    "",
    `Joint investment ID: ${input.jointSubscriptionId}`,
    `Funding request ID: ${input.externalFundingId}`,
    "",
    "Review the request and provide the investor with payment instructions:",
    adminUrl,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;">
      <h2 style="margin-bottom:16px;">
        Joint investment payment instructions requested
      </h2>

      <p>
        A joint investor has requested
        <strong>${escapeJointFundingHtml(methodLabel)}</strong>
        payment instructions.
      </p>

      <table
        cellpadding="8"
        cellspacing="0"
        style="border-collapse:collapse;width:100%;max-width:640px;"
      >
        <tr>
          <td><strong>Investor</strong></td>
          <td>${escapeJointFundingHtml(input.investorName)}</td>
        </tr>

        <tr>
          <td><strong>Investor email</strong></td>
          <td>${escapeJointFundingHtml(input.investorEmail)}</td>
        </tr>

        <tr>
          <td><strong>Investment</strong></td>
          <td>${escapeJointFundingHtml(input.opportunityTitle)}</td>
        </tr>

        <tr>
          <td><strong>Payment method</strong></td>
          <td>${escapeJointFundingHtml(methodLabel)}</td>
        </tr>

        <tr>
          <td><strong>Principal obligation</strong></td>
          <td>${principal}</td>
        </tr>

        ${
          input.paymentMethod ===
          "wire_transfer"
            ? `
              <tr>
                <td><strong>Wire charge</strong></td>
                <td>${wireCharge}</td>
              </tr>
            `
            : ""
        }

        <tr>
          <td><strong>Total amount due</strong></td>
          <td>${totalDue}</td>
        </tr>
      </table>

      <p style="margin-top:24px;">
        <strong>Joint investment ID:</strong><br />
        ${escapeJointFundingHtml(input.jointSubscriptionId)}
      </p>

      <p>
        <strong>Funding request ID:</strong><br />
        ${escapeJointFundingHtml(input.externalFundingId)}
      </p>

      <p style="margin-top:24px;">
        <a
          href="${escapeJointFundingHtml(adminUrl)}"
          style="
            display:inline-block;
            padding:12px 18px;
            background:#173f35;
            color:#ffffff;
            text-decoration:none;
            border-radius:6px;
          "
        >
          Review funding request
        </a>
      </p>
    </div>
  `;

  return {
    subject,
    text,
    html,
  };
}

type InvestorJointPaymentInstructionsReadyEmailInput = {
  investorName: string;
  opportunityTitle: string;

  paymentMethod:
    | "wire_transfer"
    | "bitcoin";

  principalAmountCents: number;
  wireChargeAmountCents: number;
  totalAmountDueCents: number;

  paymentReference: string;

  jointSubscriptionId: string;
  externalFundingId: string;

  bitcoinAmount?: string | number | null;
  bitcoinAddress?: string | null;
  bitcoinNetwork?: string | null;
  bitcoinPaymentUrl?: string | null;
  instructions?: string | null;

  origin: string;
};

function formatJointInstructionMoney(
  amountCents: number,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    },
  ).format(amountCents / 100);
}

function escapeJointInstructionHtml(
  value: string,
) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function investorJointPaymentInstructionsReadyEmail(
  input: InvestorJointPaymentInstructionsReadyEmailInput,
) {
  const isWire =
    input.paymentMethod ===
    "wire_transfer";

  const isBitcoin =
    input.paymentMethod ===
    "bitcoin";

  const methodLabel =
    isWire
      ? "Wire Transfer"
      : "Bitcoin";

  const principal =
    formatJointInstructionMoney(
      input.principalAmountCents,
    );

  const wireCharge =
    formatJointInstructionMoney(
      input.wireChargeAmountCents,
    );

  const totalDue =
    formatJointInstructionMoney(
      input.totalAmountDueCents,
    );

  const bitcoinAmount =
    input.bitcoinAmount != null
      ? String(
          input.bitcoinAmount,
        ).trim()
      : "";

  const bitcoinAddress =
    input.bitcoinAddress
      ?.trim() ?? "";

  const bitcoinNetwork =
    input.bitcoinNetwork
      ?.trim() ?? "";

  const bitcoinPaymentUrl =
    input.bitcoinPaymentUrl
      ?.trim() ?? "";

  const instructions =
    input.instructions
      ?.trim() ?? "";

  const fundingUrl =
    `${input.origin}/dashboard/investments/joint/${input.jointSubscriptionId}`;

  const subject =
    `Your ${methodLabel} instructions are ready`;

  const textRows = [
    `Hello ${input.investorName},`,
    "",
    `Your ${methodLabel} payment instructions for ${input.opportunityTitle} are ready.`,
    "",
    `Principal investment obligation: ${principal}`,

    isWire
      ? `Wire Transfer charge: ${wireCharge}`
      : "",

    `Total amount due: ${totalDue}`,
    "",
    `Payment reference: ${input.paymentReference}`,
  ];

  if (isBitcoin) {
    textRows.push(
      "",
      "BITCOIN PAYMENT DETAILS",
      "",
      bitcoinAmount
        ? `Bitcoin amount: ${bitcoinAmount} BTC`
        : "",
      bitcoinNetwork
        ? `Network: ${bitcoinNetwork}`
        : "",
      bitcoinAddress
        ? `Receiving address: ${bitcoinAddress}`
        : "",
      bitcoinPaymentUrl
        ? `Payment URL: ${bitcoinPaymentUrl}`
        : "",
      "",
      "Send only using the Bitcoin network shown above. Confirm the receiving address carefully before sending.",
      "After sending the payment, return to Tevuah Reserve and report the blockchain transaction hash for verification.",
    );
  }

  if (isWire) {
    textRows.push(
      "",
      "Use the exact Tevuah Reserve payment reference in your transfer memo or reference field.",
      "The Wire Transfer charge does not increase your investment principal.",
    );
  }

  if (instructions) {
    textRows.push(
      "",
      "Additional instructions:",
      instructions,
    );
  }

  textRows.push(
    "",
    "Review your payment instructions:",
    fundingUrl,
    "",
    "Tevuah Reserve",
  );

  const text =
    textRows
      .filter(Boolean)
      .join("\n");

  const bitcoinDetailsHtml =
    isBitcoin
      ? `
        <div
          style="
            margin:24px 0;
            padding:20px;
            background:#f1f7f3;
            border:1px solid #d8e8de;
            border-radius:8px;
          "
        >
          <div
            style="
              margin-bottom:16px;
              color:#173f35;
              font-size:12px;
              font-weight:700;
              letter-spacing:1.3px;
              text-transform:uppercase;
            "
          >
            Bitcoin payment details
          </div>

          ${
            bitcoinAmount
              ? `
                <div style="margin-bottom:14px;">
                  <strong>Bitcoin amount</strong><br />
                  <span style="font-family:monospace;">
                    ${escapeJointInstructionHtml(
                      bitcoinAmount,
                    )} BTC
                  </span>
                </div>
              `
              : ""
          }

          ${
            bitcoinNetwork
              ? `
                <div style="margin-bottom:14px;">
                  <strong>Network</strong><br />
                  ${escapeJointInstructionHtml(
                    bitcoinNetwork,
                  )}
                </div>
              `
              : ""
          }

          ${
            bitcoinAddress
              ? `
                <div style="margin-bottom:14px;">
                  <strong>Receiving address</strong><br />

                  <div
                    style="
                      margin-top:6px;
                      padding:12px;
                      background:#ffffff;
                      border:1px solid #d8e8de;
                      border-radius:6px;
                      font-family:monospace;
                      font-size:13px;
                      line-height:1.6;
                      word-break:break-all;
                    "
                  >
                    ${escapeJointInstructionHtml(
                      bitcoinAddress,
                    )}
                  </div>
                </div>
              `
              : ""
          }

          ${
            bitcoinPaymentUrl
              ? `
                <div>
                  <strong>Payment URL</strong><br />

                  <a
                    href="${escapeJointInstructionHtml(
                      bitcoinPaymentUrl,
                    )}"
                    style="
                      color:#173f35;
                      word-break:break-all;
                    "
                  >
                    ${escapeJointInstructionHtml(
                      bitcoinPaymentUrl,
                    )}
                  </a>
                </div>
              `
              : ""
          }
        </div>

        <div
          style="
            margin:20px 0;
            padding:16px 18px;
            background:#fff8e8;
            border:1px solid #ead8a6;
            border-radius:8px;
            color:#5d4a20;
            font-size:13px;
            line-height:1.7;
          "
        >
          <strong>Important:</strong>
          Confirm the Bitcoin amount, receiving address and network
          carefully before sending. Send only using the network shown
          above. After payment, report the blockchain transaction hash
          through your Tevuah Reserve dashboard.
        </div>
      `
      : "";

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.65;color:#24352f;max-width:680px;margin:0 auto;">
      <div
        style="
          background:#173f35;
          color:#ffffff;
          padding:28px 30px;
          border-radius:12px 12px 0 0;
        "
      >
        <div
          style="
            font-size:12px;
            letter-spacing:2px;
            text-transform:uppercase;
            opacity:.8;
            margin-bottom:8px;
          "
        >
          Tevuah Reserve
        </div>

        <h1
          style="
            margin:0;
            font-size:25px;
            font-weight:600;
          "
        >
          Payment instructions are ready
        </h1>
      </div>

      <div
        style="
          border:1px solid #dedbd1;
          border-top:0;
          padding:30px;
          border-radius:0 0 12px 12px;
          background:#fffdf7;
        "
      >
        <p>
          Hello
          ${escapeJointInstructionHtml(
            input.investorName,
          )},
        </p>

        <p>
          Your
          <strong>${escapeJointInstructionHtml(
            methodLabel,
          )}</strong>
          payment instructions for
          <strong>${escapeJointInstructionHtml(
            input.opportunityTitle,
          )}</strong>
          are now ready.
        </p>

        <div
          style="
            margin:24px 0;
            padding:20px;
            background:#f5f2e9;
            border-radius:8px;
          "
        >
          <div style="margin-bottom:10px;">
            <strong>
              Principal investment obligation
            </strong><br />
            ${principal}
          </div>

          ${
            isWire
              ? `
                <div style="margin-bottom:10px;">
                  <strong>
                    Wire Transfer charge
                  </strong><br />
                  ${wireCharge}
                </div>
              `
              : ""
          }

          <div style="margin-bottom:10px;">
            <strong>Total amount due</strong><br />
            ${totalDue}
          </div>

          <div>
            <strong>Payment reference</strong><br />

            <span style="font-family:monospace;">
              ${escapeJointInstructionHtml(
                input.paymentReference,
              )}
            </span>
          </div>
        </div>

        ${bitcoinDetailsHtml}

        ${
          isWire
            ? `
              <p>
                Include the exact Tevuah Reserve payment
                reference in your Wire Transfer memo or
                reference field.
              </p>

              <p>
                The Wire Transfer charge is separate from
                your investment principal and does not
                increase your ownership or funded principal.
              </p>
            `
            : ""
        }

        ${
          instructions
            ? `
              <div
                style="
                  margin:20px 0;
                  padding:16px 18px;
                  border-left:3px solid #b79552;
                  background:#faf8f1;
                  color:#52615b;
                  font-size:13px;
                  line-height:1.7;
                "
              >
                <strong
                  style="
                    display:block;
                    margin-bottom:5px;
                    color:#24352f;
                  "
                >
                  Additional instructions
                </strong>

                ${escapeJointInstructionHtml(
                  instructions,
                )}
              </div>
            `
            : ""
        }

        <p style="margin:28px 0;">
          <a
            href="${escapeJointInstructionHtml(
              fundingUrl,
            )}"
            style="
              display:inline-block;
              background:#173f35;
              color:#ffffff;
              text-decoration:none;
              padding:13px 20px;
              border-radius:6px;
              font-weight:600;
            "
          >
            Review payment instructions
          </a>
        </p>

        <p
          style="
            font-size:13px;
            color:#66736e;
          "
        >
          For security, review the complete destination
          details from your authenticated Tevuah Reserve
          dashboard before sending funds.
        </p>
      </div>
    </div>
  `;

  return {
    subject,
    text,
    html,
  };
}

export function companyJointPaymentReportedEmail({
  investorName,
  investorEmail,
  opportunityTitle,
  paymentMethod,
  principalAmountCents,
  wireChargeAmountCents,
  totalAmountDueCents,
  paymentReference,
  reportedWireReference,
  reportedBitcoinTxHash,
  investorReportNote,
  jointSubscriptionId,
  externalFundingId,
  origin,
}: {
  investorName: string;
  investorEmail: string;
  opportunityTitle: string;
  paymentMethod: "wire_transfer" | "bitcoin";
  principalAmountCents: number;
  wireChargeAmountCents: number;
  totalAmountDueCents: number;
  paymentReference: string | null;
  reportedWireReference: string | null;
  reportedBitcoinTxHash: string | null;
  investorReportNote: string | null;
  jointSubscriptionId: string;
  externalFundingId: string;
  origin: string;
}) {
  const money = (cents: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);

  const methodLabel =
    paymentMethod === "wire_transfer"
      ? "Wire Transfer"
      : "Bitcoin";

  const evidence =
    paymentMethod === "wire_transfer"
      ? reportedWireReference
      : reportedBitcoinTxHash;

  const evidenceLabel =
    paymentMethod === "wire_transfer"
      ? "Bank transfer reference"
      : "Bitcoin transaction hash";

  const reviewUrl =
    `${origin}/admin/investments/joint/${jointSubscriptionId}`;

  const subject =
    `Joint investment payment reported — ${opportunityTitle}`;

  const text = `
A joint investment payment has been reported and is ready for verification.

Investor: ${investorName}
Investor email: ${investorEmail}
Opportunity: ${opportunityTitle}
Payment method: ${methodLabel}

Investment principal: ${money(principalAmountCents)}
Wire charge: ${money(wireChargeAmountCents)}
Total amount due: ${money(totalAmountDueCents)}

Tevuah payment reference: ${paymentReference ?? "N/A"}
${evidenceLabel}: ${evidence ?? "N/A"}

Investor note:
${investorReportNote ?? "None"}

Joint subscription:
${jointSubscriptionId}

Funding request:
${externalFundingId}

Review:
${reviewUrl}

No investment principal has been recognized as funded yet. Administrative verification is required.
  `.trim();

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#1f2937;">
      <h2 style="margin-bottom:8px;">
        Joint investment payment reported
      </h2>

      <p>
        A joint investment payment has been reported and is ready
        for administrative verification.
      </p>

      <table
        style="width:100%;border-collapse:collapse;margin:24px 0;"
      >
        <tbody>
          <tr>
            <td style="padding:8px 0;"><strong>Investor</strong></td>
            <td style="padding:8px 0;">${investorName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;"><strong>Email</strong></td>
            <td style="padding:8px 0;">${investorEmail}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;"><strong>Opportunity</strong></td>
            <td style="padding:8px 0;">${opportunityTitle}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;"><strong>Method</strong></td>
            <td style="padding:8px 0;">${methodLabel}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;"><strong>Principal</strong></td>
            <td style="padding:8px 0;">
              ${money(principalAmountCents)}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;"><strong>Wire charge</strong></td>
            <td style="padding:8px 0;">
              ${money(wireChargeAmountCents)}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;"><strong>Total due</strong></td>
            <td style="padding:8px 0;">
              ${money(totalAmountDueCents)}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;">
              <strong>Tevuah reference</strong>
            </td>
            <td style="padding:8px 0;">
              ${paymentReference ?? "N/A"}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;">
              <strong>${evidenceLabel}</strong>
            </td>
            <td style="padding:8px 0;">
              ${evidence ?? "N/A"}
            </td>
          </tr>
        </tbody>
      </table>

      ${
        investorReportNote
          ? `<p><strong>Investor note:</strong><br>${investorReportNote}</p>`
          : ""
      }

      <p>
        <strong>No investment principal has been recognized as
        funded yet.</strong> Administrative verification is required.
      </p>

      <p style="margin-top:24px;">
        <a
          href="${reviewUrl}"
          style="display:inline-block;padding:12px 18px;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;"
        >
          Review payment
        </a>
      </p>
    </div>
  `;

  return {
    subject,
    text,
    html,
  };
}
export function investorJointPaymentVerifiedEmail({
  investorName,
  opportunityTitle,
  principalAmountCents,
  paymentMethod,
  jointSubscriptionId,
  origin,
}: {
  investorName: string;
  opportunityTitle: string;
  principalAmountCents: number;
  paymentMethod: "wire_transfer" | "bitcoin";
  jointSubscriptionId: string;
  origin: string;
}) {
  const money = (cents: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);

  const methodLabel =
    paymentMethod === "wire_transfer"
      ? "Wire Transfer"
      : "Bitcoin";

  const dashboardUrl =
    `${origin}/dashboard/investments/joint/${jointSubscriptionId}`;

  const subject =
    `Joint investment payment verified — ${opportunityTitle}`;

  const text = `
Hello ${investorName},

Your ${methodLabel} payment for your joint investment in ${opportunityTitle} has been verified.

Verified investment principal: ${money(principalAmountCents)}

Your funding obligation for this joint investment has been satisfied.

The joint investment will remain in funding until all member funding obligations have been completed. Investment positions are created only after final funding completion and finalization.

View your joint investment:
${dashboardUrl}

Tevuah Reserve
  `.trim();

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#1f2937;">
      <h2>Joint investment payment verified</h2>

      <p>Hello ${investorName},</p>

      <p>
        Your ${methodLabel} payment for your joint investment in
        <strong>${opportunityTitle}</strong> has been verified.
      </p>

      <p>
        <strong>Verified investment principal:</strong>
        ${money(principalAmountCents)}
      </p>

      <p>
        Your funding obligation for this joint investment has been
        satisfied.
      </p>

      <p>
        The joint investment will remain in funding until all member
        funding obligations have been completed. Investment positions
        are created only after final funding completion and finalization.
      </p>

      <p style="margin-top:24px;">
        <a
          href="${dashboardUrl}"
          style="display:inline-block;padding:12px 18px;background:#111827;color:#fff;text-decoration:none;border-radius:6px;"
        >
          View joint investment
        </a>
      </p>

      <p>Tevuah Reserve</p>
    </div>
  `;

  return {
    subject,
    text,
    html,
  };
}


export function investorJointMemberPaymentVerifiedEmail({
  investorName,
  fundedMemberName,
  opportunityTitle,
  jointSubscriptionId,
  origin,
}: {
  investorName: string;
  fundedMemberName: string;
  opportunityTitle: string;
  jointSubscriptionId: string;
  origin: string;
}) {
  const dashboardUrl =
    `${origin}/dashboard/investments/joint/${jointSubscriptionId}`;

  const subject =
    `Joint investment funding update — ${opportunityTitle}`;

  const text = `
Hello ${investorName},

There has been a funding update for your joint investment in ${opportunityTitle}.

${fundedMemberName}'s funding obligation has been verified and completed.

Your joint investment remains in the funding stage until all member funding obligations have been completed.

View your joint investment:
${dashboardUrl}

Tevuah Reserve
  `.trim();

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#1f2937;">
      <h2>Joint investment funding update</h2>

      <p>Hello ${investorName},</p>

      <p>
        There has been a funding update for your joint investment in
        <strong>${opportunityTitle}</strong>.
      </p>

      <p>
        <strong>${fundedMemberName}</strong>'s funding obligation has
        been verified and completed.
      </p>

      <p>
        Your joint investment remains in the funding stage until all
        member funding obligations have been completed.
      </p>

      <p style="margin-top:24px;">
        <a
          href="${dashboardUrl}"
          style="display:inline-block;padding:12px 18px;background:#111827;color:#fff;text-decoration:none;border-radius:6px;"
        >
          View joint investment
        </a>
      </p>

      <p>Tevuah Reserve</p>
    </div>
  `;

  return {
    subject,
    text,
    html,
  };
}