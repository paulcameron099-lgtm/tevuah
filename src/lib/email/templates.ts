type VerificationSubmittedEmailParams = {
  investorName: string;
  investorEmail: string;
  submittedAt: string;
};

export function verificationSubmittedEmail({
  investorName,
  investorEmail,
  submittedAt,
}: VerificationSubmittedEmailParams) {
  return {
    subject:
      `New investor verification submitted — ${investorName}`,

    text:
      `${investorName} (${investorEmail}) has completed and submitted the Tevuah Reserve investor verification process and is now awaiting compliance review.`,

    html: `
      <div style="
        margin:0;
        padding:32px 16px;
        background:#f5f3ed;
        font-family:Arial,Helvetica,sans-serif;
        color:#1d2b24;
      ">
        <div style="
          max-width:640px;
          margin:0 auto;
          background:#ffffff;
          border-radius:18px;
          overflow:hidden;
          border:1px solid #e7e2d7;
        ">

          <div style="
            background:#13271f;
            padding:30px;
            color:#ffffff;
          ">
            <div style="
              font-size:12px;
              letter-spacing:2px;
              text-transform:uppercase;
              color:#c8a86b;
              font-weight:700;
            ">
              Tevuah Reserve
            </div>

            <h1 style="
              margin:12px 0 0;
              font-size:26px;
              line-height:1.3;
            ">
              New Investor Verification Submitted
            </h1>
          </div>

          <div style="padding:30px;">
            <p style="
              margin:0;
              font-size:15px;
              line-height:1.8;
              color:#4d5852;
            ">
              A new investor has completed the full onboarding
              and verification process and is now awaiting
              compliance approval.
            </p>

            <div style="
              margin-top:24px;
              padding:20px;
              border-radius:14px;
              background:#f8f6f1;
              border:1px solid #ebe5da;
            ">
              <table
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="font-size:14px;"
              >
                <tr>
                  <td style="
                    padding:8px 0;
                    color:#7a817d;
                  ">
                    Investor
                  </td>

                  <td style="
                    padding:8px 0;
                    text-align:right;
                    font-weight:700;
                    color:#13271f;
                  ">
                    ${investorName}
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding:8px 0;
                    color:#7a817d;
                  ">
                    Email
                  </td>

                  <td style="
                    padding:8px 0;
                    text-align:right;
                    color:#13271f;
                  ">
                    ${investorEmail}
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding:8px 0;
                    color:#7a817d;
                  ">
                    Submitted
                  </td>

                  <td style="
                    padding:8px 0;
                    text-align:right;
                    color:#13271f;
                  ">
                    ${submittedAt}
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding:8px 0;
                    color:#7a817d;
                  ">
                    Status
                  </td>

                  <td style="
                    padding:8px 0;
                    text-align:right;
                    font-weight:700;
                    color:#9a6f21;
                  ">
                    Pending Compliance Review
                  </td>
                </tr>
              </table>
            </div>

            <p style="
              margin:24px 0 0;
              font-size:14px;
              line-height:1.8;
              color:#5d6762;
            ">
              Please review the investor's identity,
              address, eligibility, suitability and tax
              documentation from the compliance dashboard.
            </p>
          </div>

          <div style="
            padding:20px 30px;
            background:#faf9f6;
            border-top:1px solid #eee9df;
            font-size:12px;
            line-height:1.7;
            color:#8b918e;
          ">
            This is an automated compliance notification
            from Tevuah Reserve.
          </div>

        </div>
      </div>
    `,
  };
}

type VerificationApprovedEmailParams = {
  investorName: string;
};

export function verificationApprovedEmail({
  investorName,
}: VerificationApprovedEmailParams) {
  return {
    subject:
      "Your Tevuah Reserve verification has been approved",

    text:
      `Hello ${investorName}, your Tevuah Reserve investor verification has been approved.`,

    html: `
      <div style="
        margin:0;
        padding:32px 16px;
        background:#f5f3ed;
        font-family:Arial,Helvetica,sans-serif;
        color:#1d2b24;
      ">
        <div style="
          max-width:640px;
          margin:0 auto;
          background:#ffffff;
          border-radius:18px;
          overflow:hidden;
          border:1px solid #e7e2d7;
        ">

          <div style="
            background:#13271f;
            padding:30px;
            color:#ffffff;
          ">
            <div style="
              font-size:12px;
              letter-spacing:2px;
              text-transform:uppercase;
              color:#c8a86b;
              font-weight:700;
            ">
              Tevuah Reserve
            </div>

            <h1 style="
              margin:12px 0 0;
              font-size:26px;
              line-height:1.3;
            ">
              Verification Approved
            </h1>
          </div>

          <div style="padding:30px;">
            <p style="
              margin:0;
              font-size:16px;
              line-height:1.8;
            ">
              Dear <strong>${investorName}</strong>,
            </p>

            <p style="
              margin:18px 0 0;
              font-size:15px;
              line-height:1.8;
              color:#4d5852;
            ">
              Your investor verification and onboarding
              information have been reviewed and approved
              by the Tevuah Reserve compliance team.
            </p>

            <div style="
              margin-top:24px;
              padding:20px;
              border-radius:14px;
              background:#eef7f1;
              border:1px solid #d8ebde;
            ">
              <div style="
                font-size:12px;
                text-transform:uppercase;
                letter-spacing:1.5px;
                font-weight:700;
                color:#277248;
              ">
                Verification Status
              </div>

              <div style="
                margin-top:7px;
                font-size:20px;
                font-weight:700;
                color:#173f2b;
              ">
                Approved
              </div>
            </div>

            <p style="
              margin:24px 0 0;
              font-size:15px;
              line-height:1.8;
              color:#4d5852;
            ">
              You may now continue through your investor
              dashboard and access the opportunities and
              features available to your approved account.
            </p>

            <p style="
              margin:24px 0 0;
              font-size:15px;
              line-height:1.8;
            ">
              Regards,<br />
              <strong>Tevuah Reserve Compliance Team</strong>
            </p>
          </div>

          <div style="
            padding:20px 30px;
            background:#faf9f6;
            border-top:1px solid #eee9df;
            font-size:12px;
            line-height:1.7;
            color:#8b918e;
          ">
            This is an automated account notification from
            Tevuah Reserve.
          </div>

        </div>
      </div>
    `,
  };
}

type VerificationActionRequiredEmailParams = {
  investorName: string;

  reason: string;

  sections: string[];
};

export function verificationActionRequiredEmail({
  investorName,
  reason,
  sections,
}: VerificationActionRequiredEmailParams) {
  const sectionText =
    sections
      .map(
        (section) =>
          section
            .replaceAll(
              "_",
              " ",
            )
            .replace(
              /\b\w/g,
              (letter) =>
                letter.toUpperCase(),
            ),
      )
      .join(", ");

  return {
    subject:
      "Additional information required — Tevuah Reserve",

    text:
      `Hello ${investorName}, the Tevuah Reserve compliance team requires additional information before your investor verification can be completed. Requested sections: ${sectionText}. Reason: ${reason}`,

    html: `
      <div style="
        margin:0;
        padding:32px 16px;
        background:#f5f3ed;
        font-family:Arial,Helvetica,sans-serif;
        color:#1d2b24;
      ">
        <div style="
          max-width:640px;
          margin:0 auto;
          background:#ffffff;
          border:1px solid #e7e2d7;
          border-radius:18px;
          overflow:hidden;
        ">

          <div style="
            background:#13271f;
            padding:30px;
            color:#ffffff;
          ">
            <div style="
              color:#c8a86b;
              font-size:12px;
              font-weight:700;
              letter-spacing:2px;
              text-transform:uppercase;
            ">
              Tevuah Reserve
            </div>

            <h1 style="
              margin:12px 0 0;
              font-size:26px;
              line-height:1.3;
            ">
              Additional Information Required
            </h1>
          </div>

          <div style="padding:30px;">
            <p style="
              margin:0;
              font-size:16px;
              line-height:1.8;
            ">
              Dear <strong>${investorName}</strong>,
            </p>

            <p style="
              margin:18px 0 0;
              color:#4d5852;
              font-size:15px;
              line-height:1.8;
            ">
              The Tevuah Reserve compliance team has
              reviewed your investor verification and
              requires additional information before
              the review can be completed.
            </p>

            <div style="
              margin-top:24px;
              padding:20px;
              background:#fff8e7;
              border:1px solid #ecdca9;
              border-radius:14px;
            ">
              <div style="
                color:#906c22;
                font-size:11px;
                font-weight:700;
                letter-spacing:1.3px;
                text-transform:uppercase;
              ">
                Sections requiring attention
              </div>

              <div style="
                margin-top:8px;
                color:#302719;
                font-size:15px;
                font-weight:700;
              ">
                ${sectionText}
              </div>
            </div>

            <div style="
              margin-top:18px;
              padding:20px;
              background:#f8f6f1;
              border-radius:14px;
            ">
              <div style="
                color:#7a817d;
                font-size:11px;
                font-weight:700;
                letter-spacing:1.3px;
                text-transform:uppercase;
              ">
                Compliance guidance
              </div>

              <p style="
                margin:8px 0 0;
                color:#4d5852;
                font-size:14px;
                line-height:1.8;
              ">
                ${reason}
              </p>
            </div>

            <p style="
              margin:24px 0 0;
              color:#4d5852;
              font-size:14px;
              line-height:1.8;
            ">
              Sign in to your investor dashboard,
              update the requested sections and submit
              your onboarding package again for review.
            </p>

            <p style="
              margin:24px 0 0;
              font-size:14px;
              line-height:1.8;
            ">
              Regards,<br />
              <strong>Tevuah Reserve Compliance Team</strong>
            </p>
          </div>
        </div>
      </div>
    `,
  };
}


type VerificationRejectedEmailParams = {
  investorName: string;
  reason: string;
};

export function verificationRejectedEmail({
  investorName,
  reason,
}: VerificationRejectedEmailParams) {
  return {
    subject:
      "Investor verification update — Tevuah Reserve",

    text:
      `Hello ${investorName}, your Tevuah Reserve investor verification was not approved. Reason: ${reason}`,

    html: `
      <div style="
        margin:0;
        padding:32px 16px;
        background:#f5f3ed;
        font-family:Arial,Helvetica,sans-serif;
        color:#1d2b24;
      ">
        <div style="
          max-width:640px;
          margin:0 auto;
          background:#ffffff;
          border:1px solid #e7e2d7;
          border-radius:18px;
          overflow:hidden;
        ">
          <div style="
            background:#13271f;
            padding:30px;
            color:#ffffff;
          ">
            <div style="
              color:#c8a86b;
              font-size:12px;
              font-weight:700;
              letter-spacing:2px;
              text-transform:uppercase;
            ">
              Tevuah Reserve
            </div>

            <h1 style="
              margin:12px 0 0;
              font-size:26px;
            ">
              Investor Verification Update
            </h1>
          </div>

          <div style="padding:30px;">
            <p style="
              margin:0;
              font-size:16px;
              line-height:1.8;
            ">
              Dear <strong>${investorName}</strong>,
            </p>

            <p style="
              margin:18px 0 0;
              color:#4d5852;
              font-size:15px;
              line-height:1.8;
            ">
              Following a compliance review, your current
              investor verification submission has not
              been approved.
            </p>

            <div style="
              margin-top:24px;
              padding:20px;
              background:#fff1f1;
              border:1px solid #f1cccc;
              border-radius:14px;
            ">
              <div style="
                color:#9c3333;
                font-size:11px;
                font-weight:700;
                letter-spacing:1.3px;
                text-transform:uppercase;
              ">
                Compliance reason
              </div>

              <p style="
                margin:8px 0 0;
                color:#5b3131;
                font-size:14px;
                line-height:1.8;
              ">
                ${reason}
              </p>
            </div>

            <p style="
              margin:24px 0 0;
              color:#4d5852;
              font-size:14px;
              line-height:1.8;
            ">
              If further action is available for your
              account, additional instructions will be
              provided through your investor dashboard.
            </p>

            <p style="
              margin:24px 0 0;
              font-size:14px;
              line-height:1.8;
            ">
              Regards,<br />
              <strong>Tevuah Reserve Compliance Team</strong>
            </p>
          </div>
        </div>
      </div>
    `,
  };
}

type InvestorAccountSuspendedEmailParams = {
  investorName: string;
  reason: string;
};

export function investorAccountSuspendedEmail({
  investorName,
  reason,
}: InvestorAccountSuspendedEmailParams) {
  return {
    subject:
      "Your Tevuah Reserve account has been suspended",

    text:
      `Hello ${investorName}, your Tevuah Reserve investor account has been temporarily suspended. Reason: ${reason}`,

    html: `
      <div style="
        margin:0;
        padding:32px 16px;
        background:#f5f3ed;
        font-family:Arial,Helvetica,sans-serif;
        color:#1d2b24;
      ">
        <div style="
          max-width:640px;
          margin:0 auto;
          overflow:hidden;
          border:1px solid #e7e2d7;
          border-radius:18px;
          background:#ffffff;
        ">
          <div style="
            padding:30px;
            background:#13271f;
            color:#ffffff;
          ">
            <div style="
              color:#c8a86b;
              font-size:12px;
              font-weight:700;
              letter-spacing:2px;
              text-transform:uppercase;
            ">
              Tevuah Reserve
            </div>

            <h1 style="
              margin:12px 0 0;
              font-size:26px;
              line-height:1.3;
            ">
              Account temporarily suspended
            </h1>
          </div>

          <div style="padding:30px;">
            <p style="
              margin:0;
              font-size:16px;
              line-height:1.8;
            ">
              Dear <strong>${investorName}</strong>,
            </p>

            <p style="
              margin:18px 0 0;
              color:#4d5852;
              font-size:15px;
              line-height:1.8;
            ">
              Access to your Tevuah Reserve investor
              account has been temporarily suspended.
            </p>

            <div style="
              margin-top:24px;
              padding:20px;
              border:1px solid #ecdca9;
              border-radius:14px;
              background:#fff8e7;
            ">
              <div style="
                color:#906c22;
                font-size:11px;
                font-weight:700;
                letter-spacing:1.3px;
                text-transform:uppercase;
              ">
                Administrative reason
              </div>

              <p style="
                margin:8px 0 0;
                color:#4d5852;
                font-size:14px;
                line-height:1.8;
              ">
                ${reason}
              </p>
            </div>

            <p style="
              margin:24px 0 0;
              color:#4d5852;
              font-size:14px;
              line-height:1.8;
            ">
              While suspended, dashboard access and
              investor account actions are restricted.
            </p>

            <p style="
              margin:24px 0 0;
              font-size:14px;
              line-height:1.8;
            ">
              Regards,<br />
              <strong>
                Tevuah Reserve Administration
              </strong>
            </p>
          </div>
        </div>
      </div>
    `,
  };
}


type InvestorAccountReactivatedEmailParams = {
  investorName: string;
};

export function investorAccountReactivatedEmail({
  investorName,
}: InvestorAccountReactivatedEmailParams) {
  return {
    subject:
      "Your Tevuah Reserve account has been reactivated",

    text:
      `Hello ${investorName}, your Tevuah Reserve investor account has been reactivated and normal account access has been restored.`,

    html: `
      <div style="
        margin:0;
        padding:32px 16px;
        background:#f5f3ed;
        font-family:Arial,Helvetica,sans-serif;
        color:#1d2b24;
      ">
        <div style="
          max-width:640px;
          margin:0 auto;
          overflow:hidden;
          border:1px solid #e7e2d7;
          border-radius:18px;
          background:#ffffff;
        ">
          <div style="
            padding:30px;
            background:#13271f;
            color:#ffffff;
          ">
            <div style="
              color:#c8a86b;
              font-size:12px;
              font-weight:700;
              letter-spacing:2px;
              text-transform:uppercase;
            ">
              Tevuah Reserve
            </div>

            <h1 style="
              margin:12px 0 0;
              font-size:26px;
              line-height:1.3;
            ">
              Account access restored
            </h1>
          </div>

          <div style="padding:30px;">
            <p style="
              margin:0;
              font-size:16px;
              line-height:1.8;
            ">
              Dear <strong>${investorName}</strong>,
            </p>

            <p style="
              margin:18px 0 0;
              color:#4d5852;
              font-size:15px;
              line-height:1.8;
            ">
              Your Tevuah Reserve investor account has
              been reactivated.
            </p>

            <div style="
              margin-top:24px;
              padding:20px;
              border:1px solid #c9e4d1;
              border-radius:14px;
              background:#eef9f1;
            ">
              <p style="
                margin:0;
                color:#25633c;
                font-size:14px;
                line-height:1.8;
              ">
                Normal investor dashboard access and
                account actions have been restored.
              </p>
            </div>

            <p style="
              margin:24px 0 0;
              font-size:14px;
              line-height:1.8;
            ">
              Regards,<br />
              <strong>
                Tevuah Reserve Administration
              </strong>
            </p>
          </div>
        </div>
      </div>
    `,
  };
}

type SubscriptionInformationRequestedEmailParams = {
  investorName: string;

  opportunityTitle: string;

  requestMessage: string;
};

export function subscriptionInformationRequestedEmail({
  investorName,
  opportunityTitle,
  requestMessage,
}: SubscriptionInformationRequestedEmailParams) {
  return {
    subject:
      "Action required for your Tevuah Reserve investment subscription",

    text:
      `Hello ${investorName}, additional information is required for your investment subscription in ${opportunityTitle}. Request: ${requestMessage}`,

    html: `
      <div style="
        margin:0;
        padding:32px 16px;
        background:#f5f3ed;
        font-family:Arial,Helvetica,sans-serif;
        color:#1d2b24;
      ">
        <div style="
          max-width:640px;
          margin:0 auto;
          overflow:hidden;
          border:1px solid #e7e2d7;
          border-radius:18px;
          background:#ffffff;
        ">
          <div style="
            padding:30px;
            background:#13271f;
            color:#ffffff;
          ">
            <div style="
              color:#c8a86b;
              font-size:12px;
              font-weight:700;
              letter-spacing:2px;
              text-transform:uppercase;
            ">
              Tevuah Reserve
            </div>

            <h1 style="
              margin:12px 0 0;
              font-size:26px;
              line-height:1.3;
            ">
              Additional information required
            </h1>
          </div>

          <div style="padding:30px;">
            <p style="font-size:15px;line-height:1.8;">
              Dear <strong>${investorName}</strong>,
            </p>

            <p style="
              margin-top:18px;
              color:#4d5852;
              font-size:15px;
              line-height:1.8;
            ">
              Our team has reviewed your subscription
              for <strong>${opportunityTitle}</strong>
              and requires additional information
              before a decision can be made.
            </p>

            <div style="
              margin-top:24px;
              padding:20px;
              border:1px solid #ecdca9;
              border-radius:14px;
              background:#fff8e7;
            ">
              <div style="
                color:#906c22;
                font-size:11px;
                font-weight:700;
                letter-spacing:1.3px;
                text-transform:uppercase;
              ">
                Requested information
              </div>

              <p style="
                margin:8px 0 0;
                color:#4d5852;
                font-size:14px;
                line-height:1.8;
              ">
                ${requestMessage}
              </p>
            </div>

            <p style="
              margin-top:24px;
              color:#4d5852;
              font-size:14px;
              line-height:1.8;
            ">
              Sign in to your investor dashboard,
              open My Investments, select this
              subscription and use the Resubmit
              Subscription section.
            </p>

            <p style="
              margin-top:24px;
              font-size:14px;
              line-height:1.8;
            ">
              Regards,<br />
              <strong>
                Tevuah Reserve Investment Administration
              </strong>
            </p>
          </div>
        </div>
      </div>
    `,
  };
}


type SubscriptionApprovedEmailParams = {
  investorName: string;

  opportunityTitle: string;

  commitmentDisplay: string;
};

export function subscriptionApprovedEmail({
  investorName,
  opportunityTitle,
  commitmentDisplay,
}: SubscriptionApprovedEmailParams) {
  return {
    subject:
      "Your Tevuah Reserve investment subscription has been approved",

    text:
      `Hello ${investorName}, your ${commitmentDisplay} subscription for ${opportunityTitle} has been approved.`,

    html: `
      <div style="
        margin:0;
        padding:32px 16px;
        background:#f5f3ed;
        font-family:Arial,Helvetica,sans-serif;
        color:#1d2b24;
      ">
        <div style="
          max-width:640px;
          margin:0 auto;
          overflow:hidden;
          border:1px solid #e7e2d7;
          border-radius:18px;
          background:#ffffff;
        ">
          <div style="
            padding:30px;
            background:#13271f;
            color:#ffffff;
          ">
            <div style="
              color:#c8a86b;
              font-size:12px;
              font-weight:700;
              letter-spacing:2px;
              text-transform:uppercase;
            ">
              Tevuah Reserve
            </div>

            <h1 style="
              margin:12px 0 0;
              font-size:26px;
            ">
              Subscription approved
            </h1>
          </div>

          <div style="padding:30px;">
            <p style="font-size:15px;line-height:1.8;">
              Dear <strong>${investorName}</strong>,
            </p>

            <p style="
              margin-top:18px;
              color:#4d5852;
              font-size:15px;
              line-height:1.8;
            ">
              Your investment subscription for
              <strong>${opportunityTitle}</strong>
              has been approved.
            </p>

            <div style="
              margin-top:24px;
              padding:20px;
              border:1px solid #c9e4d1;
              border-radius:14px;
              background:#eef9f1;
            ">
              <div style="
                color:#25633c;
                font-size:11px;
                font-weight:700;
                letter-spacing:1.3px;
                text-transform:uppercase;
              ">
                Approved commitment
              </div>

              <p style="
                margin:8px 0 0;
                color:#25633c;
                font-size:22px;
                font-weight:700;
              ">
                ${commitmentDisplay}
              </p>
            </div>

            <p style="
              margin-top:24px;
              font-size:14px;
              line-height:1.8;
            ">
              Regards,<br />
              <strong>
                Tevuah Reserve Investment Administration
              </strong>
            </p>
          </div>
        </div>
      </div>
    `,
  };
}


type SubscriptionRejectedEmailParams = {
  investorName: string;

  opportunityTitle: string;

  reason: string;
};

export function subscriptionRejectedEmail({
  investorName,
  opportunityTitle,
  reason,
}: SubscriptionRejectedEmailParams) {
  return {
    subject:
      "Update regarding your Tevuah Reserve investment subscription",

    text:
      `Hello ${investorName}, your investment subscription for ${opportunityTitle} was not approved. Reason: ${reason}`,

    html: `
      <div style="
        margin:0;
        padding:32px 16px;
        background:#f5f3ed;
        font-family:Arial,Helvetica,sans-serif;
        color:#1d2b24;
      ">
        <div style="
          max-width:640px;
          margin:0 auto;
          border:1px solid #e7e2d7;
          border-radius:18px;
          background:#ffffff;
          overflow:hidden;
        ">
          <div style="
            padding:30px;
            background:#13271f;
            color:#ffffff;
          ">
            <div style="
              color:#c8a86b;
              font-size:12px;
              font-weight:700;
              letter-spacing:2px;
              text-transform:uppercase;
            ">
              Tevuah Reserve
            </div>

            <h1 style="
              margin:12px 0 0;
              font-size:26px;
            ">
              Subscription decision
            </h1>
          </div>

          <div style="padding:30px;">
            <p>
              Dear <strong>${investorName}</strong>,
            </p>

            <p style="
              margin-top:18px;
              color:#4d5852;
              font-size:15px;
              line-height:1.8;
            ">
              Your investment subscription for
              <strong>${opportunityTitle}</strong>
              was not approved.
            </p>

            <div style="
              margin-top:24px;
              padding:20px;
              border:1px solid #efcaca;
              border-radius:14px;
              background:#fff1f1;
            ">
              <div style="
                color:#a33;
                font-size:11px;
                font-weight:700;
                text-transform:uppercase;
                letter-spacing:1.3px;
              ">
                Reason
              </div>

              <p style="
                margin:8px 0 0;
                color:#6f3333;
                font-size:14px;
                line-height:1.8;
              ">
                ${reason}
              </p>
            </div>

            <p style="
              margin-top:24px;
              font-size:14px;
              line-height:1.8;
            ">
              Regards,<br />
              <strong>
                Tevuah Reserve Investment Administration
              </strong>
            </p>
          </div>
        </div>
      </div>
    `,
  };
}

type InvestmentActivatedEmailParams = {
  investorName: string;

  opportunityTitle: string;

  principalDisplay: string;

  fundedDateDisplay: string;
};

export function investmentActivatedEmail({
  investorName,
  opportunityTitle,
  principalDisplay,
  fundedDateDisplay,
}: InvestmentActivatedEmailParams) {
  return {
    subject:
      "Your Tevuah Reserve investment is now active",

    text:
      `Hello ${investorName}, your funding for ${opportunityTitle} has been verified. Your funded investment position is now active with principal capital of ${principalDisplay}. Funding was verified on ${fundedDateDisplay}.`,

    html: `
      <div style="
        margin:0;
        padding:32px 16px;
        background:#f5f3ed;
        font-family:Arial,Helvetica,sans-serif;
        color:#1d2b24;
      ">
        <div style="
          max-width:640px;
          margin:0 auto;
          overflow:hidden;
          border:1px solid #e7e2d7;
          border-radius:18px;
          background:#ffffff;
        ">
          <div style="
            padding:30px;
            background:#13271f;
            color:#ffffff;
          ">
            <div style="
              color:#c8a86b;
              font-size:12px;
              font-weight:700;
              letter-spacing:2px;
              text-transform:uppercase;
            ">
              Tevuah Reserve
            </div>

            <h1 style="
              margin:12px 0 0;
              font-size:28px;
              line-height:1.3;
            ">
              Your investment is now active
            </h1>
          </div>

          <div style="padding:30px;">
            <p style="
              margin:0;
              font-size:15px;
              line-height:1.8;
            ">
              Dear <strong>${investorName}</strong>,
            </p>

            <p style="
              margin-top:18px;
              color:#4d5852;
              font-size:15px;
              line-height:1.8;
            ">
              We have verified receipt of your investment
              funding for
              <strong>${opportunityTitle}</strong>.
            </p>

            <p style="
              margin-top:16px;
              color:#4d5852;
              font-size:15px;
              line-height:1.8;
            ">
              Your funded investment position has now been
              activated in your Tevuah Reserve portfolio.
            </p>

            <div style="
              margin-top:26px;
              padding:22px;
              border:1px solid #c9e4d1;
              border-radius:14px;
              background:#eef9f1;
            ">
              <div style="
                color:#25633c;
                font-size:11px;
                font-weight:700;
                letter-spacing:1.3px;
                text-transform:uppercase;
              ">
                Verified principal
              </div>

              <p style="
                margin:8px 0 0;
                color:#1d5434;
                font-size:28px;
                font-weight:700;
              ">
                ${principalDisplay}
              </p>

              <div style="
                margin-top:18px;
                color:#25633c;
                font-size:11px;
                font-weight:700;
                letter-spacing:1.3px;
                text-transform:uppercase;
              ">
                Funding verified
              </div>

              <p style="
                margin:7px 0 0;
                color:#385346;
                font-size:14px;
                line-height:1.6;
              ">
                ${fundedDateDisplay}
              </p>
            </div>

            <div style="
              margin-top:26px;
              padding:20px;
              border-radius:14px;
              background:#f7f5ef;
            ">
              <p style="
                margin:0;
                color:#243b31;
                font-size:14px;
                font-weight:700;
              ">
                What happens next?
              </p>

              <p style="
                margin:10px 0 0;
                color:#59635e;
                font-size:14px;
                line-height:1.8;
              ">
                Sign in to your investor dashboard and open
                Portfolio to review your funded position,
                investment details and funding record.
              </p>
            </div>

            <p style="
              margin-top:26px;
              color:#6a726e;
              font-size:12px;
              line-height:1.8;
            ">
              Target returns and investment projections are
              not guarantees of future performance.
            </p>

            <p style="
              margin-top:24px;
              font-size:14px;
              line-height:1.8;
            ">
              Regards,<br />
              <strong>
                Tevuah Reserve Investment Administration
              </strong>
            </p>
          </div>
        </div>
      </div>
    `,
  };
}