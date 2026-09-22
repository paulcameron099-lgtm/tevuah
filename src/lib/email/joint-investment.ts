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

export function jointInvestmentAcceptedEmail({
  initiatorName,
  acceptedInvestorName,
  opportunityTitle,
  jointInvestmentUrl,
}: {
  initiatorName: string;
  acceptedInvestorName: string;
  opportunityTitle: string;
  jointInvestmentUrl: string;
}) {
  const subject =
    `Joint investment invitation accepted — ${opportunityTitle}`;

  const text = [
    `Hello ${initiatorName},`,
    "",
    `${acceptedInvestorName} has accepted and signed your joint investment invitation for ${opportunityTitle}.`,
    "",
    "Both investors have now completed the required acceptance step. Your joint investment can continue through the review process.",
    "",
    `View joint investment: ${jointInvestmentUrl}`,
    "",
    "Tevuah Reserve",
  ].join("\n");

  const html = `
    <div
      style="
        margin:0;
        padding:0;
        background:#f6f3ea;
        font-family:Arial,Helvetica,sans-serif;
        color:#173b2c;
      "
    >
      <div
        style="
          max-width:640px;
          margin:0 auto;
          padding:40px 20px;
        "
      >
        <div
          style="
            background:#ffffff;
            border:1px solid #e8e1d2;
            border-radius:16px;
            overflow:hidden;
          "
        >
          <div
            style="
              background:#173b2c;
              padding:30px 34px;
            "
          >
            <div
              style="
                color:#d4b66a;
                font-size:12px;
                font-weight:700;
                letter-spacing:1.5px;
                text-transform:uppercase;
                margin-bottom:10px;
              "
            >
              Joint Investment Update
            </div>

            <h1
              style="
                margin:0;
                color:#ffffff;
                font-size:26px;
                line-height:1.3;
                font-weight:600;
              "
            >
              Your invitation has been accepted
            </h1>
          </div>

          <div
            style="
              padding:34px;
            "
          >
            <p
              style="
                margin:0 0 18px;
                color:#4b5563;
                font-size:15px;
                line-height:1.75;
              "
            >
              Hello ${initiatorName},
            </p>

            <p
              style="
                margin:0 0 22px;
                color:#4b5563;
                font-size:15px;
                line-height:1.75;
              "
            >
              <strong>${acceptedInvestorName}</strong>
              has accepted and signed your joint investment
              invitation for
              <strong>${opportunityTitle}</strong>.
            </p>

            <div
              style="
                margin:24px 0;
                padding:20px;
                background:#f8f6f0;
                border:1px solid #ebe4d5;
                border-radius:12px;
              "
            >
              <div
                style="
                  margin-bottom:8px;
                  color:#6b7280;
                  font-size:12px;
                  font-weight:700;
                  letter-spacing:1px;
                  text-transform:uppercase;
                "
              >
                Current status
              </div>

              <div
                style="
                  color:#173b2c;
                  font-size:16px;
                  font-weight:600;
                "
              >
                Both investors have completed the acceptance process.
              </div>
            </div>

            <p
              style="
                margin:0 0 28px;
                color:#4b5563;
                font-size:15px;
                line-height:1.75;
              "
            >
              Your joint investment can now continue through
              the review process. You can monitor its current
              status from your secure investor dashboard.
            </p>

            <a
              href="${jointInvestmentUrl}"
              style="
                display:inline-block;
                padding:14px 22px;
                background:#173b2c;
                color:#ffffff;
                text-decoration:none;
                border-radius:8px;
                font-size:14px;
                font-weight:700;
              "
            >
              View joint investment
            </a>
          </div>

          <div
            style="
              padding:20px 34px;
              border-top:1px solid #eee8dc;
              color:#8a8174;
              font-size:12px;
              line-height:1.6;
            "
          >
            This message relates to activity on your
            Tevuah Reserve investor account.
          </div>
        </div>
      </div>
    </div>
  `;

  return {
    subject,
    text,
    html,
  };
}

/*
 * ==========================================================
 * JOINT INVESTMENT — APPROVED
 * ==========================================================
 *
 * Used by Step 32C after the authoritative joint approval RPC
 * has completed successfully.
 */
export function jointInvestmentApprovedEmail({
  investorName,
  opportunityTitle,
  totalCommitmentAmountCents,
  fundingObligationAmountCents,
  currency,
  jointInvestmentUrl,
}: {
  investorName: string;
  opportunityTitle: string;
  totalCommitmentAmountCents: number;
  fundingObligationAmountCents: number;
  currency: string;
  jointInvestmentUrl: string;
}) {
  const safeInvestorName =
    investorName.trim() ||
    "Investor";

  const safeOpportunityTitle =
    opportunityTitle.trim() ||
    "Joint investment";

  const normalizedCurrency =
    currency.trim().toUpperCase() ||
    "USD";

  const formatAmount = (
    amountCents: number,
  ) =>
    new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency:
          normalizedCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    ).format(
      amountCents / 100,
    );

  const totalCommitment =
    formatAmount(
      totalCommitmentAmountCents,
    );

  const fundingObligation =
    formatAmount(
      fundingObligationAmountCents,
    );

  const subject =
    `Joint investment approved — ${safeOpportunityTitle}`;

  const text = [
    `Hello ${safeInvestorName},`,
    "",
    `Your joint investment in ${safeOpportunityTitle} has been approved.`,
    "",
    `Total joint commitment: ${totalCommitment}`,
    `Your funding obligation: ${fundingObligation}`,
    "",
    "Your funding obligation is now available. Complete your funding to continue the investment process.",
    "",
    `Complete funding obligation: ${jointInvestmentUrl}`,
    "",
    "Tevuah Reserve",
  ].join("\n");

  const html = `
    <div
      style="
        margin:0;
        padding:0;
        background:#f6f3ea;
        font-family:Arial,Helvetica,sans-serif;
        color:#173b2c;
      "
    >
      <div
        style="
          max-width:640px;
          margin:0 auto;
          padding:40px 20px;
        "
      >
        <div
          style="
            background:#ffffff;
            border:1px solid #e8e1d2;
            border-radius:16px;
            overflow:hidden;
          "
        >
          <div
            style="
              background:#173b2c;
              padding:30px 34px;
            "
          >
            <div
              style="
                color:#d4b66a;
                font-size:12px;
                font-weight:700;
                letter-spacing:1.5px;
                text-transform:uppercase;
                margin-bottom:10px;
              "
            >
              Joint Investment
            </div>

            <h1
              style="
                margin:0;
                color:#ffffff;
                font-size:26px;
                line-height:1.3;
                font-weight:600;
              "
            >
              Your joint investment has been approved
            </h1>
          </div>

          <div
            style="
              padding:34px;
            "
          >
            <p
              style="
                margin:0 0 18px;
                color:#4b5563;
                font-size:15px;
                line-height:1.75;
              "
            >
              Hello ${safeInvestorName},
            </p>

            <p
              style="
                margin:0 0 24px;
                color:#4b5563;
                font-size:15px;
                line-height:1.75;
              "
            >
              Your joint investment in
              <strong>${safeOpportunityTitle}</strong>
              has been approved. The investment has now
              progressed to the funding stage.
            </p>

            <div
              style="
                margin:24px 0;
                padding:20px;
                background:#f8f6f0;
                border:1px solid #ebe4d5;
                border-radius:12px;
              "
            >
              <div
                style="
                  margin-bottom:16px;
                "
              >
                <div
                  style="
                    color:#8a8174;
                    font-size:11px;
                    font-weight:700;
                    letter-spacing:1px;
                    text-transform:uppercase;
                    margin-bottom:5px;
                  "
                >
                  Opportunity
                </div>

                <div
                  style="
                    color:#173b2c;
                    font-size:16px;
                    font-weight:600;
                  "
                >
                  ${safeOpportunityTitle}
                </div>
              </div>

              <div
                style="
                  margin-bottom:16px;
                "
              >
                <div
                  style="
                    color:#8a8174;
                    font-size:11px;
                    font-weight:700;
                    letter-spacing:1px;
                    text-transform:uppercase;
                    margin-bottom:5px;
                  "
                >
                  Total joint commitment
                </div>

                <div
                  style="
                    color:#173b2c;
                    font-size:16px;
                    font-weight:600;
                  "
                >
                  ${totalCommitment}
                </div>
              </div>

              <div>
                <div
                  style="
                    color:#8a8174;
                    font-size:11px;
                    font-weight:700;
                    letter-spacing:1px;
                    text-transform:uppercase;
                    margin-bottom:5px;
                  "
                >
                  Your funding obligation
                </div>

                <div
                  style="
                    color:#173b2c;
                    font-size:20px;
                    font-weight:700;
                  "
                >
                  ${fundingObligation}
                </div>
              </div>
            </div>

            <p
              style="
                margin:0 0 28px;
                color:#4b5563;
                font-size:15px;
                line-height:1.75;
              "
            >
              Your funding obligation is now available.
              Open the joint investment in your secure
              dashboard to review the funding options and
              complete your obligation.
            </p>

            <a
              href="${jointInvestmentUrl}"
              style="
                display:inline-block;
                padding:14px 22px;
                background:#173b2c;
                color:#ffffff;
                text-decoration:none;
                border-radius:8px;
                font-size:14px;
                font-weight:700;
              "
            >
              Complete funding obligation
            </a>
          </div>

          <div
            style="
              padding:20px 34px;
              border-top:1px solid #eee8dc;
              color:#8a8174;
              font-size:12px;
              line-height:1.6;
            "
          >
            This message relates to activity on your
            Tevuah Reserve investor account.
          </div>
        </div>
      </div>
    </div>
  `;

  return {
    subject,
    text,
    html,
  };
}


/*
 * ==========================================================
 * JOINT INVESTMENT — FUNDING VERIFIED
 * ==========================================================
 *
 * Used by Step 32D after the canonical external-funding
 * verification RPC has completed successfully.
 *
 * The same template handles:
 *
 * 1. The investor whose funding was verified.
 * 2. The other joint member receiving a progress update.
 */
export function jointInvestmentFundingVerifiedEmail({
  recipientName,
  opportunityTitle,
  fundedInvestorName,
  isFundedInvestor,
  verifiedPrincipalAmountCents,
  currency,
  paymentMethod,
  fundedMemberCount,
  totalMemberCount,
  totalFundedCents,
  totalObligationCents,
  allMembersFunded,
  jointInvestmentUrl,
}: {
  recipientName: string;
  opportunityTitle: string;
  fundedInvestorName: string;
  isFundedInvestor: boolean;
  verifiedPrincipalAmountCents: number;
  currency: string;
  paymentMethod: string;
  fundedMemberCount: number;
  totalMemberCount: number;
  totalFundedCents: number;
  totalObligationCents: number;
  allMembersFunded: boolean;
  jointInvestmentUrl: string;
}) {
  const safeRecipientName =
    recipientName.trim() ||
    "Investor";

  const safeOpportunityTitle =
    opportunityTitle.trim() ||
    "Joint investment";

  const safeFundedInvestorName =
    fundedInvestorName.trim() ||
    "Your joint investment partner";

  const normalizedCurrency =
    currency.trim().toUpperCase() ||
    "USD";

  const formatAmount = (
    amountCents: number,
  ) =>
    new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency:
          normalizedCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    ).format(
      amountCents / 100,
    );

  const verifiedAmount =
    formatAmount(
      verifiedPrincipalAmountCents,
    );

  const totalFunded =
    formatAmount(
      totalFundedCents,
    );

  const totalRequired =
    formatAmount(
      totalObligationCents,
    );

  const subject =
    isFundedInvestor
      ? `Funding verified — ${safeOpportunityTitle}`
      : `Joint investment funding update — ${safeOpportunityTitle}`;

  const headline =
    isFundedInvestor
      ? "Your funding has been verified"
      : "Your joint investment has a funding update";

  const summary =
    isFundedInvestor
      ? `Your ${paymentMethod} funding of ${verifiedAmount} for ${safeOpportunityTitle} has been successfully verified.`
      : `${safeFundedInvestorName}'s funding obligation for ${safeOpportunityTitle} has been successfully verified.`;

  const nextStep =
    allMembersFunded
      ? "Both joint investors have now satisfied their funding obligations. The investment is ready for the next administrative finalization step."
      : "The joint investment remains in the funding stage until both investors have satisfied their funding obligations.";

  const text = [
    `Hello ${safeRecipientName},`,
    "",
    summary,
    "",
    `Verified funding: ${verifiedAmount}`,
    `Funding method: ${paymentMethod}`,
    `Joint funding progress: ${fundedMemberCount} of ${totalMemberCount} members funded`,
    `Total funded: ${totalFunded}`,
    `Total required: ${totalRequired}`,
    "",
    nextStep,
    "",
    `View funding status: ${jointInvestmentUrl}`,
    "",
    "Tevuah Reserve",
  ].join("\n");

  const html = `
    <div
      style="
        margin:0;
        padding:0;
        background:#f6f3ea;
        font-family:Arial,Helvetica,sans-serif;
        color:#173b2c;
      "
    >
      <div
        style="
          max-width:640px;
          margin:0 auto;
          padding:40px 20px;
        "
      >
        <div
          style="
            background:#ffffff;
            border:1px solid #e8e1d2;
            border-radius:16px;
            overflow:hidden;
          "
        >
          <div
            style="
              background:#173b2c;
              padding:30px 34px;
            "
          >
            <div
              style="
                color:#d4b66a;
                font-size:12px;
                font-weight:700;
                letter-spacing:1.5px;
                text-transform:uppercase;
                margin-bottom:10px;
              "
            >
              Joint Investment Funding
            </div>

            <h1
              style="
                margin:0;
                color:#ffffff;
                font-size:26px;
                line-height:1.3;
                font-weight:600;
              "
            >
              ${headline}
            </h1>
          </div>

          <div
            style="
              padding:34px;
            "
          >
            <p
              style="
                margin:0 0 18px;
                color:#4b5563;
                font-size:15px;
                line-height:1.75;
              "
            >
              Hello ${safeRecipientName},
            </p>

            <p
              style="
                margin:0 0 24px;
                color:#4b5563;
                font-size:15px;
                line-height:1.75;
              "
            >
              ${summary}
            </p>

            <div
              style="
                margin:24px 0;
                padding:20px;
                background:#f8f6f0;
                border:1px solid #ebe4d5;
                border-radius:12px;
              "
            >
              <div
                style="
                  margin-bottom:16px;
                "
              >
                <div
                  style="
                    color:#8a8174;
                    font-size:11px;
                    font-weight:700;
                    letter-spacing:1px;
                    text-transform:uppercase;
                    margin-bottom:5px;
                  "
                >
                  Verified funding
                </div>

                <div
                  style="
                    color:#173b2c;
                    font-size:20px;
                    font-weight:700;
                  "
                >
                  ${verifiedAmount}
                </div>
              </div>

              <div
                style="
                  margin-bottom:16px;
                "
              >
                <div
                  style="
                    color:#8a8174;
                    font-size:11px;
                    font-weight:700;
                    letter-spacing:1px;
                    text-transform:uppercase;
                    margin-bottom:5px;
                  "
                >
                  Funding method
                </div>

                <div
                  style="
                    color:#173b2c;
                    font-size:15px;
                    font-weight:600;
                  "
                >
                  ${paymentMethod}
                </div>
              </div>

              <div
                style="
                  margin-bottom:16px;
                "
              >
                <div
                  style="
                    color:#8a8174;
                    font-size:11px;
                    font-weight:700;
                    letter-spacing:1px;
                    text-transform:uppercase;
                    margin-bottom:5px;
                  "
                >
                  Member progress
                </div>

                <div
                  style="
                    color:#173b2c;
                    font-size:15px;
                    font-weight:600;
                  "
                >
                  ${fundedMemberCount} of ${totalMemberCount}
                  members funded
                </div>
              </div>

              <div>
                <div
                  style="
                    color:#8a8174;
                    font-size:11px;
                    font-weight:700;
                    letter-spacing:1px;
                    text-transform:uppercase;
                    margin-bottom:5px;
                  "
                >
                  Joint funding progress
                </div>

                <div
                  style="
                    color:#173b2c;
                    font-size:15px;
                    font-weight:600;
                  "
                >
                  ${totalFunded} of ${totalRequired}
                </div>
              </div>
            </div>

            <p
              style="
                margin:0 0 28px;
                color:#4b5563;
                font-size:15px;
                line-height:1.75;
              "
            >
              ${nextStep}
            </p>

            <a
              href="${jointInvestmentUrl}"
              style="
                display:inline-block;
                padding:14px 22px;
                background:#173b2c;
                color:#ffffff;
                text-decoration:none;
                border-radius:8px;
                font-size:14px;
                font-weight:700;
              "
            >
              View funding status
            </a>
          </div>

          <div
            style="
              padding:20px 34px;
              border-top:1px solid #eee8dc;
              color:#8a8174;
              font-size:12px;
              line-height:1.6;
            "
          >
            This message relates to verified funding activity
            on your Tevuah Reserve investor account.
          </div>
        </div>
      </div>
    </div>
  `;

  return {
    subject,
    text,
    html,
  };
}


/*
 * ==========================================================
 * JOINT INVESTMENT — POSITION CREATED
 * ==========================================================
 *
 * Used by Step 32E after finalize_joint_investment() has
 * successfully created both investor positions.
 */
export function jointInvestmentPositionCreatedEmail({
  investorName,
  opportunityTitle,
  positionPrincipalAmountCents,
  totalJointCommitmentAmountCents,
  ownershipBps,
  currency,
  positionId,
  positionStatus,
  finalizedAt,
  jointInvestmentUrl,
}: {
  investorName: string;
  opportunityTitle: string;
  positionPrincipalAmountCents: number;
  totalJointCommitmentAmountCents: number;
  ownershipBps: number;
  currency: string;
  positionId: string;
  positionStatus: string;
  finalizedAt: string | null;
  jointInvestmentUrl: string;
}) {
  const safeInvestorName =
    investorName.trim() ||
    "Investor";

  const safeOpportunityTitle =
    opportunityTitle.trim() ||
    "Joint investment";

  const normalizedCurrency =
    currency.trim().toUpperCase() ||
    "USD";

  const formatAmount = (
    amountCents: number,
  ) =>
    new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency:
          normalizedCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    ).format(
      amountCents / 100,
    );

  const positionPrincipal =
    formatAmount(
      positionPrincipalAmountCents,
    );

  const totalJointCommitment =
    formatAmount(
      totalJointCommitmentAmountCents,
    );

  const ownershipPercent =
    `${(
      ownershipBps /
      100
    ).toFixed(2)}%`;

  const normalizedStatus =
    positionStatus
      .trim()
      .replace(
        /_/g,
        " ",
      );

  const displayStatus =
    normalizedStatus
      ? normalizedStatus
          .charAt(0)
          .toUpperCase() +
        normalizedStatus.slice(1)
      : "Active";

  const finalizedDate =
    finalizedAt
      ? new Intl.DateTimeFormat(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          },
        ).format(
          new Date(
            finalizedAt,
          ),
        )
      : null;

  const subject =
    `Investment position created — ${safeOpportunityTitle}`;

  const text = [
    `Hello ${safeInvestorName},`,
    "",
    `Your joint investment in ${safeOpportunityTitle} has been finalized successfully.`,
    "",
    "Your investment position has been created and is now available in your Tevuah Reserve dashboard.",
    "",
    `Your position principal: ${positionPrincipal}`,
    `Total joint commitment: ${totalJointCommitment}`,
    `Ownership: ${ownershipPercent}`,
    `Position status: ${displayStatus}`,
    `Position ID: ${positionId}`,
    ...(finalizedDate
      ? [
          `Finalized: ${finalizedDate}`,
        ]
      : []),
    "",
    `View investment position: ${jointInvestmentUrl}`,
    "",
    "Tevuah Reserve",
  ].join("\n");

  const html = `
    <div
      style="
        margin:0;
        padding:0;
        background:#f6f3ea;
        font-family:Arial,Helvetica,sans-serif;
        color:#173b2c;
      "
    >
      <div
        style="
          max-width:640px;
          margin:0 auto;
          padding:40px 20px;
        "
      >
        <div
          style="
            background:#ffffff;
            border:1px solid #e8e1d2;
            border-radius:16px;
            overflow:hidden;
          "
        >
          <div
            style="
              background:#173b2c;
              padding:30px 34px;
            "
          >
            <div
              style="
                color:#d4b66a;
                font-size:12px;
                font-weight:700;
                letter-spacing:1.5px;
                text-transform:uppercase;
                margin-bottom:10px;
              "
            >
              Investment Position
            </div>

            <h1
              style="
                margin:0;
                color:#ffffff;
                font-size:26px;
                line-height:1.3;
                font-weight:600;
              "
            >
              Your investment position is active
            </h1>
          </div>

          <div
            style="
              padding:34px;
            "
          >
            <p
              style="
                margin:0 0 18px;
                color:#4b5563;
                font-size:15px;
                line-height:1.75;
              "
            >
              Hello ${safeInvestorName},
            </p>

            <p
              style="
                margin:0 0 24px;
                color:#4b5563;
                font-size:15px;
                line-height:1.75;
              "
            >
              Your joint investment in
              <strong>${safeOpportunityTitle}</strong>
              has been finalized successfully. Your individual
              investment position has been created and is now
              available in your secure investor dashboard.
            </p>

            <div
              style="
                margin:24px 0;
                padding:20px;
                background:#f8f6f0;
                border:1px solid #ebe4d5;
                border-radius:12px;
              "
            >
              <div
                style="
                  margin-bottom:16px;
                "
              >
                <div
                  style="
                    color:#8a8174;
                    font-size:11px;
                    font-weight:700;
                    letter-spacing:1px;
                    text-transform:uppercase;
                    margin-bottom:5px;
                  "
                >
                  Opportunity
                </div>

                <div
                  style="
                    color:#173b2c;
                    font-size:16px;
                    font-weight:600;
                  "
                >
                  ${safeOpportunityTitle}
                </div>
              </div>

              <div
                style="
                  margin-bottom:16px;
                "
              >
                <div
                  style="
                    color:#8a8174;
                    font-size:11px;
                    font-weight:700;
                    letter-spacing:1px;
                    text-transform:uppercase;
                    margin-bottom:5px;
                  "
                >
                  Your position principal
                </div>

                <div
                  style="
                    color:#173b2c;
                    font-size:20px;
                    font-weight:700;
                  "
                >
                  ${positionPrincipal}
                </div>
              </div>

              <div
                style="
                  margin-bottom:16px;
                "
              >
                <div
                  style="
                    color:#8a8174;
                    font-size:11px;
                    font-weight:700;
                    letter-spacing:1px;
                    text-transform:uppercase;
                    margin-bottom:5px;
                  "
                >
                  Ownership
                </div>

                <div
                  style="
                    color:#173b2c;
                    font-size:15px;
                    font-weight:600;
                  "
                >
                  ${ownershipPercent}
                </div>
              </div>

              <div
                style="
                  margin-bottom:16px;
                "
              >
                <div
                  style="
                    color:#8a8174;
                    font-size:11px;
                    font-weight:700;
                    letter-spacing:1px;
                    text-transform:uppercase;
                    margin-bottom:5px;
                  "
                >
                  Position status
                </div>

                <div
                  style="
                    color:#173b2c;
                    font-size:15px;
                    font-weight:600;
                  "
                >
                  ${displayStatus}
                </div>
              </div>

              <div
                style="
                  margin-bottom:16px;
                "
              >
                <div
                  style="
                    color:#8a8174;
                    font-size:11px;
                    font-weight:700;
                    letter-spacing:1px;
                    text-transform:uppercase;
                    margin-bottom:5px;
                  "
                >
                  Total joint commitment
                </div>

                <div
                  style="
                    color:#173b2c;
                    font-size:15px;
                    font-weight:600;
                  "
                >
                  ${totalJointCommitment}
                </div>
              </div>

              ${
                finalizedDate
                  ? `
              <div>
                <div
                  style="
                    color:#8a8174;
                    font-size:11px;
                    font-weight:700;
                    letter-spacing:1px;
                    text-transform:uppercase;
                    margin-bottom:5px;
                  "
                >
                  Finalized
                </div>

                <div
                  style="
                    color:#173b2c;
                    font-size:15px;
                    font-weight:600;
                  "
                >
                  ${finalizedDate}
                </div>
              </div>
              `
                  : ""
              }
            </div>

            <p
              style="
                margin:0 0 28px;
                color:#4b5563;
                font-size:15px;
                line-height:1.75;
              "
            >
              You can now review your active position and
              ongoing investment information from your
              Tevuah Reserve dashboard.
            </p>

            <a
              href="${jointInvestmentUrl}"
              style="
                display:inline-block;
                padding:14px 22px;
                background:#173b2c;
                color:#ffffff;
                text-decoration:none;
                border-radius:8px;
                font-size:14px;
                font-weight:700;
              "
            >
              View investment position
            </a>
          </div>

          <div
            style="
              padding:20px 34px;
              border-top:1px solid #eee8dc;
              color:#8a8174;
              font-size:12px;
              line-height:1.6;
            "
          >
            This message relates to your investment activity
            with Tevuah Reserve.
          </div>
        </div>
      </div>
    </div>
  `;

  return {
    subject,
    text,
    html,
  };
}

/*
 * STEP 38B
 * Append this export to:
 *   src/lib/email/joint-investment.ts
 *
 * This version is self-contained so it can coexist with the existing
 * joint email exports without depending on private helpers.
 */

export function jointWithdrawalRequestedEmail(input: {
  recipientName: string;
  requesterName: string;
  opportunityTitle: string;
  totalCommitmentAmountCents: number;
  currency: string;
  reviewUrl: string;
  recipientIsAdmin: boolean;
  recipientAccountRestricted: boolean;
}) {
  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: input.currency || "USD",
  }).format(input.totalCommitmentAmountCents / 100);

  const esc = (value: string) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const recipientName = esc(input.recipientName);
  const requesterName = esc(input.requesterName);
  const opportunityTitle = esc(input.opportunityTitle);
  const reviewUrl = esc(input.reviewUrl);

  const subject = input.recipientIsAdmin
    ? `Joint withdrawal requested — ${input.opportunityTitle}`
    : `Approval required — joint withdrawal for ${input.opportunityTitle}`;

  const restrictedNote =
    !input.recipientIsAdmin && input.recipientAccountRestricted
      ? `
        <div style="margin:24px 0;padding:18px 20px;border:1px solid #d8c89e;border-radius:14px;background:#fbf7eb;">
          <div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#8b6925;">
            Account restriction notice
          </div>
          <p style="margin:8px 0 0;color:#4d514c;font-size:14px;line-height:1.7;">
            Your account is currently restricted. You may still review and provide your
            decision on this joint withdrawal. If you approve and sign, the review page
            will clearly disclose the proceeds direction that applies to this restricted-member
            withdrawal before your signature is accepted. This does not remove or modify
            your account restriction.
          </p>
        </div>`
      : "";

  const bodyCopy = input.recipientIsAdmin
    ? `${requesterName} has requested a full withdrawal of the joint investment below. The co-investor must review and sign before the request can proceed to administrative execution.`
    : `${requesterName} has requested withdrawal of 100% of your joint investment. Your approval is required before Tevuah Reserve can proceed. Review the request carefully before signing or declining.`;

  const cta = input.recipientIsAdmin
    ? "View withdrawal"
    : "Review & approve withdrawal";

  const html = `
  <!doctype html>
  <html>
    <body style="margin:0;background:#f7f5ef;font-family:Arial,Helvetica,sans-serif;color:#24332e;">
      <div style="padding:40px 16px;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e7e2d7;border-radius:22px;overflow:hidden;">
          <div style="padding:34px 36px 18px;">
            <div style="font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#a47c2d;">
              Tevuah Reserve
            </div>
            <h1 style="margin:12px 0 12px;font-family:Georgia,serif;font-size:30px;line-height:1.2;color:#102f27;">
              ${input.recipientIsAdmin ? "Joint withdrawal requested" : "Your approval is required"}
            </h1>
            <p style="margin:0;color:#5c625f;font-size:15px;line-height:1.8;">
              Hello ${recipientName},
            </p>
            <p style="margin:16px 0 0;color:#4d514c;font-size:15px;line-height:1.8;">
              ${bodyCopy}
            </p>

            <div style="margin:28px 0;padding:22px;border-radius:16px;background:#f7f5ef;">
              <div style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#8b8e89;">Opportunity</div>
              <div style="margin-top:6px;font-weight:700;color:#102f27;">${opportunityTitle}</div>

              <div style="margin-top:18px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#8b8e89;">Total joint position</div>
              <div style="margin-top:6px;font-size:22px;font-weight:700;color:#102f27;">${esc(money)}</div>

              <div style="margin-top:18px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#8b8e89;">Withdrawal scope</div>
              <div style="margin-top:6px;font-weight:700;color:#102f27;">100% of joint investment</div>
            </div>

            ${restrictedNote}

            <a href="${reviewUrl}"
              style="display:inline-block;margin:8px 0 12px;padding:14px 22px;border-radius:12px;background:#12372d;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">
              ${cta}
            </a>

            <p style="margin:20px 0 0;color:#777c78;font-size:12px;line-height:1.7;">
              For security, sign in to your Tevuah Reserve account before reviewing this request.
              Do not forward this message or its action link.
            </p>
          </div>

          <div style="padding:20px 36px;background:#102f27;color:#dfe7e3;font-size:12px;line-height:1.7;">
            Tevuah Reserve · Secure investment administration
          </div>
        </div>
      </div>
    </body>
  </html>`;

  const text = [
    "TEVUAH RESERVE",
    "",
    input.recipientIsAdmin
      ? "Joint withdrawal requested"
      : "Joint withdrawal approval required",
    "",
    `Hello ${input.recipientName},`,
    "",
    input.recipientIsAdmin
      ? `${input.requesterName} requested a full withdrawal of the joint investment in ${input.opportunityTitle}.`
      : `${input.requesterName} requested withdrawal of 100% of the joint investment in ${input.opportunityTitle}. Your approval is required.`,
    "",
    `Total joint position: ${money}`,
    "Withdrawal scope: 100% of joint investment",
    "",
    input.recipientAccountRestricted && !input.recipientIsAdmin
      ? "Your account is restricted, but you may still review and provide your decision on this joint withdrawal. The review page will disclose the restricted-member proceeds direction before approval."
      : "",
    "",
    `${cta}: ${input.reviewUrl}`,
    "",
    "Sign in to Tevuah Reserve before reviewing this request.",
  ]
    .filter((line) => line !== "")
    .join("\n");

  return { subject, text, html };
}

/*
 * STEP 38C
 * Append to src/lib/email/joint-investment.ts
 */
export function jointWithdrawalMemberDecisionEmail(input: {
  recipientName: string;
  actorName: string;
  opportunityTitle: string;
  totalCommitmentAmountCents: number;
  currency: string;
  approved: boolean;
  proceedsAllocation: string;
  restrictedApprover: boolean;
  actionUrl: string;
  recipientIsAdmin: boolean;
}) {
  const esc = (v: string) => v
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: input.currency || "USD",
  }).format(input.totalCommitmentAmountCents / 100);

  const approved = input.approved;
  const redirect = input.proceedsAllocation === "member_one_full";

  const subject = approved
    ? `Joint withdrawal approved by co-investor — ${input.opportunityTitle}`
    : `Joint withdrawal declined — ${input.opportunityTitle}`;

  const headline = approved
    ? (input.recipientIsAdmin ? "Joint withdrawal ready for review" : "Co-investor approval completed")
    : "Joint withdrawal declined";

  const allocation = redirect
    ? "Restricted-member authorization recorded: 100% of redemption proceeds are directed to member slot 1's Tevuah Reserve Cash Account, subject to administrative approval."
    : "Redemption proceeds remain allocated according to the joint investment's 50/50 ownership structure.";

  const body = approved
    ? `${esc(input.actorName)} approved and signed the full joint withdrawal request. ${esc(allocation)}`
    : `${esc(input.actorName)} declined the full joint withdrawal request. No investment position has been redeemed and no Cash Account balance has been changed.`;

  const cta = input.recipientIsAdmin ? "Review withdrawal" : "View withdrawal";

  const html = `<!doctype html>
<html><body style="margin:0;background:#f7f5ef;font-family:Arial,Helvetica,sans-serif;color:#24332e;">
<div style="padding:40px 16px;">
<div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e7e2d7;border-radius:22px;overflow:hidden;">
<div style="padding:34px 36px;">
<div style="font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#a47c2d;">Tevuah Reserve</div>
<h1 style="margin:12px 0;font-family:Georgia,serif;font-size:30px;line-height:1.2;color:#102f27;">${headline}</h1>
<p style="color:#5c625f;font-size:15px;line-height:1.8;">Hello ${esc(input.recipientName)},</p>
<p style="color:#4d514c;font-size:15px;line-height:1.8;">${body}</p>
<div style="margin:26px 0;padding:22px;border-radius:16px;background:#f7f5ef;">
<div style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#8b8e89;">Opportunity</div>
<div style="margin-top:6px;font-weight:700;color:#102f27;">${esc(input.opportunityTitle)}</div>
<div style="margin-top:18px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#8b8e89;">Joint position</div>
<div style="margin-top:6px;font-size:22px;font-weight:700;color:#102f27;">${esc(money)}</div>
<div style="margin-top:18px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#8b8e89;">Status</div>
<div style="margin-top:6px;font-weight:700;color:#102f27;">${approved ? "Investor approvals complete — administrative review required" : "Declined — no redemption"}</div>
</div>
${approved && input.restrictedApprover ? `<div style="margin:22px 0;padding:18px;border:1px solid #d8c89e;border-radius:14px;background:#fbf7eb;color:#5a4a24;font-size:14px;line-height:1.7;">The approving investor was restricted at signature time. Their explicit signed proceeds-direction authorization was recorded as part of the consent evidence.</div>` : ""}
<a href="${esc(input.actionUrl)}" style="display:inline-block;padding:14px 22px;border-radius:12px;background:#12372d;color:#fff;text-decoration:none;font-size:14px;font-weight:700;">${cta}</a>
<p style="margin-top:22px;color:#777c78;font-size:12px;line-height:1.7;">No redemption or Cash Account credit occurs until Tevuah Reserve completes administrative approval and execution.</p>
</div>
<div style="padding:20px 36px;background:#102f27;color:#dfe7e3;font-size:12px;">Tevuah Reserve · Secure investment administration</div>
</div></div></body></html>`;

  const text = [
    "TEVUAH RESERVE",
    "",
    headline,
    "",
    `Hello ${input.recipientName},`,
    "",
    approved
      ? `${input.actorName} approved and signed the full withdrawal request for ${input.opportunityTitle}.`
      : `${input.actorName} declined the full withdrawal request for ${input.opportunityTitle}.`,
    `Joint position: ${money}`,
    approved ? allocation : "No positions or Cash Account balances were changed.",
    "",
    `${cta}: ${input.actionUrl}`,
  ].join("\n");

  return { subject, text, html };
}

/*
 * Append to:
 *   src/lib/email/joint-investment.ts
 *
 * Step 38 — Joint withdrawal executed.
 */
export function jointWithdrawalExecutedEmail(input: {
  recipientName: string;
  opportunityTitle: string;
  totalRedeemedAmountCents: number;
  creditedAmountCents: number;
  currency: string;
  proceedsAllocation: string;
  recipientIsRedirectedMember: boolean;
  redirectedRecipientName: string;
  cashAccountUrl: string;
  jointInvestmentUrl: string;
}) {
  const esc = (value: string) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const formatMoney = (cents: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: input.currency || "USD",
    }).format(Number(cents || 0) / 100);

  const recipientName = esc(input.recipientName);
  const opportunityTitle = esc(input.opportunityTitle);
  const redirectedRecipientName = esc(
    input.redirectedRecipientName,
  );

  const total = formatMoney(input.totalRedeemedAmountCents);
  const credited = formatMoney(input.creditedAmountCents);

  const subject = `Joint withdrawal completed — ${input.opportunityTitle}`;

  const redirectedCopy = input.recipientIsRedirectedMember
    ? `
      <div style="margin:24px 0;padding:18px 20px;border:1px solid #d8c89e;border-radius:14px;background:#fbf7eb;">
        <div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#8b6925;">
          Signed proceeds direction applied
        </div>
        <p style="margin:8px 0 0;color:#4d514c;font-size:14px;line-height:1.7;">
          Your joint position was redeemed as part of the full withdrawal.
          Because you explicitly signed the restricted-member proceeds
          direction, your redemption proceeds were credited to
          ${redirectedRecipientName}'s Tevuah Cash Account. No redemption
          proceeds were credited to your Cash Account.
        </p>
      </div>`
    : "";

  const mainCopy = input.recipientIsRedirectedMember
    ? `The full joint investment has been redeemed. Your Cash Account credit from this withdrawal is ${credited}.`
    : `The full joint investment has been redeemed and ${credited} has been credited to your Tevuah Cash Account.`;

  const actionUrl = input.recipientIsRedirectedMember
    ? input.jointInvestmentUrl
    : input.cashAccountUrl;

  const actionLabel = input.recipientIsRedirectedMember
    ? "View joint investment"
    : "View Cash Account";

  const html = `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f7f5ef;font-family:Arial,Helvetica,sans-serif;color:#26342f;">
    <div style="max-width:680px;margin:0 auto;padding:40px 18px;">
      <div style="background:#102f27;border-radius:22px 22px 0 0;padding:30px 32px;color:#ffffff;">
        <div style="font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#d2b56b;">
          Tevuah Reserve
        </div>
        <h1 style="margin:14px 0 0;font-size:28px;line-height:1.25;">
          Joint withdrawal completed
        </h1>
      </div>

      <div style="background:#ffffff;border:1px solid #e8e2d5;border-top:0;border-radius:0 0 22px 22px;padding:32px;">
        <p style="margin:0;color:#26342f;font-size:15px;line-height:1.8;">
          Hello ${recipientName},
        </p>

        <p style="margin:18px 0 0;color:#4d514c;font-size:15px;line-height:1.8;">
          ${mainCopy}
        </p>

        <div style="margin:26px 0;padding:20px;border-radius:14px;background:#f7f5ef;">
          <div style="font-size:12px;color:#7a7f7b;text-transform:uppercase;letter-spacing:.08em;">
            Investment
          </div>
          <div style="margin-top:6px;font-size:16px;font-weight:700;color:#102f27;">
            ${opportunityTitle}
          </div>

          <div style="margin-top:18px;font-size:12px;color:#7a7f7b;text-transform:uppercase;letter-spacing:.08em;">
            Total joint amount redeemed
          </div>
          <div style="margin-top:6px;font-size:22px;font-weight:700;color:#102f27;">
            ${total}
          </div>

          <div style="margin-top:18px;font-size:12px;color:#7a7f7b;text-transform:uppercase;letter-spacing:.08em;">
            Credited to your Cash Account
          </div>
          <div style="margin-top:6px;font-size:22px;font-weight:700;color:#a47c2d;">
            ${credited}
          </div>
        </div>

        ${redirectedCopy}

        <a
          href="${esc(actionUrl)}"
          style="display:inline-block;margin-top:6px;padding:13px 22px;border-radius:999px;background:#102f27;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;"
        >
          ${actionLabel}
        </a>

        <p style="margin:28px 0 0;color:#7a7f7b;font-size:12px;line-height:1.7;">
          This message confirms completed accounting. The underlying joint
          positions have been redeemed and the applicable Cash Account
          credit has been posted.
        </p>
      </div>
    </div>
  </body>
</html>`;

  const text = [
    `Hello ${input.recipientName},`,
    "",
    "Your joint withdrawal has been completed.",
    `Investment: ${input.opportunityTitle}`,
    `Total joint amount redeemed: ${total}`,
    `Credited to your Cash Account: ${credited}`,
    "",
    input.recipientIsRedirectedMember
      ? `Under the restricted-member proceeds direction you explicitly signed, your redemption proceeds were credited to ${input.redirectedRecipientName}'s Tevuah Cash Account.`
      : "Your applicable redemption proceeds were credited to your Tevuah Cash Account.",
    "",
    actionUrl,
  ].join("\n");

  return {
    subject,
    html,
    text,
  };
}