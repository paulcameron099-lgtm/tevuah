

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
