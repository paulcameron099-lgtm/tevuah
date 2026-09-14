import "server-only";

export type EditableOnboardingSection =
  | "profile"
  | "identity"
  | "address"
  | "eligibility"
  | "suitability"
  | "tax";

const SECTION_LABELS: Record<
  EditableOnboardingSection,
  string
> = {
  profile: "Investor Profile",
  identity: "Identity Verification",
  address: "Address Verification",
  eligibility: "Investor Eligibility",
  suitability: "Suitability Assessment",
  tax: "Tax & IRS Certification",
};

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

function layout({
  heading,
  body,
  buttonLabel,
  buttonUrl,
}: {
  heading: string;
  body: string;
  buttonLabel: string;
  buttonUrl: string;
}) {
  return `
    <div style="margin:0;padding:32px 16px;background:#f7f5ef;font-family:Arial,sans-serif;color:#17352c">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e7e2d8;border-radius:18px;padding:32px">
        <div style="font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#a47c2d">
          TEVUAH RESERVE
        </div>
        <h1 style="font-size:28px;line-height:1.2;margin:18px 0;color:#102f27">${escapeHtml(heading)}</h1>
        ${body}
        <p style="margin:28px 0 0">
          <a href="${escapeHtml(buttonUrl)}" style="display:inline-block;background:#102f27;color:#ffffff;text-decoration:none;padding:13px 20px;border-radius:999px;font-weight:700">
            ${escapeHtml(buttonLabel)}
          </a>
        </p>
        <p style="margin:30px 0 0;font-size:12px;line-height:1.6;color:#78716c">
          This is an account and compliance notification from Tevuah Reserve.
        </p>
      </div>
    </div>
  `;
}

function sectionList(
  sections: EditableOnboardingSection[],
) {
  return sections
    .map(
      (section) =>
        `<li style="margin:6px 0">${escapeHtml(SECTION_LABELS[section])}</li>`,
    )
    .join("");
}

export function investorSubmissionEmail({
  investorName,
  isResubmission,
  origin,
}: {
  investorName: string;
  isResubmission: boolean;
  origin: string;
}) {
  const heading = isResubmission
    ? "Your onboarding updates were resubmitted"
    : "Your onboarding package was submitted";

  const text = isResubmission
    ? `Hello ${investorName}, your corrected onboarding information has been resubmitted to Tevuah Reserve Compliance and is now under review.`
    : `Hello ${investorName}, your onboarding package has been submitted to Tevuah Reserve Compliance and is now under review.`;

  return {
    subject: isResubmission
      ? "Tevuah Reserve — onboarding resubmitted"
      : "Tevuah Reserve — onboarding submitted",
    text: `${text}\n\nReview status: ${absoluteUrl(origin, "/dashboard/onboarding/review")}`,
    html: layout({
      heading,
      body: `<p style="font-size:15px;line-height:1.75;color:#57534e">Hello ${escapeHtml(investorName)},</p>
             <p style="font-size:15px;line-height:1.75;color:#57534e">${escapeHtml(
               isResubmission
                 ? "We received your corrected onboarding information. Your package has been returned to the compliance review queue."
                 : "We received your completed onboarding package. It is now in the compliance review queue.",
             )}</p>`,
      buttonLabel: "View review status",
      buttonUrl: absoluteUrl(
        origin,
        "/dashboard/onboarding/review",
      ),
    }),
  };
}

export function companySubmissionEmail({
  investorName,
  investorEmail,
  investorId,
  isResubmission,
  origin,
}: {
  investorName: string;
  investorEmail: string;
  investorId: string;
  isResubmission: boolean;
  origin: string;
}) {
  const event = isResubmission
    ? "resubmitted onboarding"
    : "submitted onboarding";

  return {
    subject: `Investor ${event} — ${investorName}`,
    text:
      `${investorName} (${investorEmail}) has ${event} and is ready for compliance review.\n\n` +
      `Review: ${absoluteUrl(origin, `/admin/compliance/${investorId}`)}`,
    html: layout({
      heading: isResubmission
        ? "Investor onboarding resubmitted"
        : "New investor onboarding submission",
      body: `<p style="font-size:15px;line-height:1.75;color:#57534e"><strong>${escapeHtml(investorName)}</strong> (${escapeHtml(investorEmail)}) has ${escapeHtml(event)} and is ready for compliance review.</p>`,
      buttonLabel: "Open compliance review",
      buttonUrl: absoluteUrl(
        origin,
        `/admin/compliance/${investorId}`,
      ),
    }),
  };
}

export function actionRequiredEmail({
  investorName,
  reason,
  sections,
  origin,
  reopened = false,
}: {
  investorName: string;
  reason: string;
  sections: EditableOnboardingSection[];
  origin: string;
  reopened?: boolean;
}) {
  const labels = sections.map(
    (section) => SECTION_LABELS[section],
  );

  return {
    subject: reopened
      ? "Tevuah Reserve — onboarding reopened for correction"
      : "Action required — update your Tevuah Reserve onboarding",
    text:
      `Hello ${investorName},\n\n` +
      `Tevuah Reserve Compliance requires updates to: ${labels.join(", ")}.\n\n` +
      `Reason: ${reason}\n\n` +
      `Review and correct: ${absoluteUrl(origin, "/dashboard/onboarding/review")}`,
    html: layout({
      heading: reopened
        ? "Your onboarding has been reopened"
        : "Additional onboarding information is required",
      body: `<p style="font-size:15px;line-height:1.75;color:#57534e">Hello ${escapeHtml(investorName)},</p>
             <p style="font-size:15px;line-height:1.75;color:#57534e">Please update the following onboarding section${sections.length === 1 ? "" : "s"}:</p>
             <ul style="font-size:15px;line-height:1.65;color:#57534e">${sectionList(sections)}</ul>
             <div style="margin-top:20px;padding:16px;border-radius:12px;background:#fff7ed;border:1px solid #fed7aa">
               <strong>Compliance guidance</strong>
               <p style="margin:8px 0 0;line-height:1.65">${escapeHtml(reason)}</p>
             </div>`,
      buttonLabel: "Review requested updates",
      buttonUrl: absoluteUrl(
        origin,
        "/dashboard/onboarding/review",
      ),
    }),
  };
}

export function rejectedEmail({
  investorName,
  reason,
  origin,
}: {
  investorName: string;
  reason: string;
  origin: string;
}) {
  return {
    subject: "Update regarding your Tevuah Reserve verification",
    text:
      `Hello ${investorName},\n\nYour current investor verification was not approved.\n\n` +
      `Reason: ${reason}\n\nReview: ${absoluteUrl(origin, "/dashboard/onboarding/review")}`,
    html: layout({
      heading: "Your investor verification was not approved",
      body: `<p style="font-size:15px;line-height:1.75;color:#57534e">Hello ${escapeHtml(investorName)},</p>
             <p style="font-size:15px;line-height:1.75;color:#57534e">Your current investor verification submission was not approved.</p>
             <div style="margin-top:20px;padding:16px;border-radius:12px;background:#fef2f2;border:1px solid #fecaca">
               <strong>Reason for decision</strong>
               <p style="margin:8px 0 0;line-height:1.65">${escapeHtml(reason)}</p>
             </div>`,
      buttonLabel: "View verification details",
      buttonUrl: absoluteUrl(
        origin,
        "/dashboard/onboarding/review",
      ),
    }),
  };
}

export function approvedEmail({
  investorName,
  origin,
}: {
  investorName: string;
  origin: string;
}) {
  return {
    subject: "Tevuah Reserve — investor verification approved",
    text:
      `Hello ${investorName}, your investor onboarding and verification have been approved by Tevuah Reserve Compliance.\n\n` +
      `Dashboard: ${absoluteUrl(origin, "/dashboard")}`,
    html: layout({
      heading: "Your investor verification is approved",
      body: `<p style="font-size:15px;line-height:1.75;color:#57534e">Hello ${escapeHtml(investorName)},</p>
             <p style="font-size:15px;line-height:1.75;color:#57534e">Your investor onboarding and verification have been reviewed and approved by Tevuah Reserve Compliance.</p>`,
      buttonLabel: "Open investor dashboard",
      buttonUrl: absoluteUrl(origin, "/dashboard"),
    }),
  };
}
