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
