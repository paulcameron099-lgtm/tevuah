import {
  ArrowLeft,
  BadgeCheck,
  FileCheck2,
  FileText,
  MapPin,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";

import Link from "next/link";
import { notFound } from "next/navigation";

import { ComplianceReviewActions } from "@/src/components/admin/compliance/compliance-review-actions";
import { RevealSensitiveValue } from "@/src/components/admin/compliance/reveal-sensitive-value";

import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { AdminNotes } from "@/src/components/admin/compliance/admin-notes";

type PageProps = {
  params: Promise<{
    userId: string;
  }>;
};

function humanize(
  value:
    | string
    | null
    | undefined,
) {
  if (!value) {
    return "—";
  }

  return value
    .replaceAll(
      "_",
      " ",
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

async function signedUrl(
  admin: ReturnType<
    typeof createAdminClient
  >,
  path:
    | string
    | null
    | undefined,
) {
  if (!path) {
    return null;
  }

  const {
    data,
    error,
  } = await admin.storage
    .from(
      "investor-verification",
    )
    .createSignedUrl(
      path,
      60 * 10,
    );

  if (error) {
    console.error(
      "Signed URL error:",
      error,
    );

    return null;
  }

  return data.signedUrl;
}

export default async function ComplianceInvestorPage({
  params,
}: PageProps) {
  await requireAdmin();

  const {
    userId,
  } = await params;

  const admin =
    createAdminClient();

const [
  profileResult,
  reviewResult,
  kycResult,
  addressResult,
  eligibilityResult,
  suitabilityResult,
  taxResult,
  auditResult,
] = await Promise.all([
    admin
      .from("profiles")
      .select(
        `
        id,
        first_name,
        last_name,
        phone,
        date_of_birth,
        nationality,
        profession,
        country,
        city,
        state,
        postal_code,
        onboarding_status
        `,
      )
      .eq(
        "id",
        userId,
      )
      .maybeSingle(),

    admin
      .from(
        "compliance_reviews",
      )
      .select(
        `
        id,
        status,
        submitted_at,
        reviewed_at,
        admin_notes,
        rejection_reason
        `,
      )
      .eq(
        "user_id",
        userId,
      )
      .maybeSingle(),

    admin
      .from(
        "investor_kyc",
      )
      .select(
        `
        legal_first_name,
        legal_middle_name,
        legal_last_name,
        date_of_birth,
        nationality,
        drivers_license_last_four,
        ssn_last_four,
        drivers_license_front_path,
        drivers_license_back_path,
        ssn_front_path,
        ssn_back_path,
        verification_status,
        status
        `,
      )
      .eq(
        "user_id",
        userId,
      )
      .maybeSingle(),

    admin
      .from(
        "investor_address_verification",
      )
      .select(
        `
        address_line_1,
        address_line_2,
        city,
        state_region,
        postal_code,
        country,
        proof_document_type,
        proof_document_path,
        status
        `,
      )
      .eq(
        "user_id",
        userId,
      )
      .maybeSingle(),

    admin
      .from(
        "investor_eligibility",
      )
      .select("*")
      .eq(
        "user_id",
        userId,
      )
      .maybeSingle(),

    admin
      .from(
        "investor_suitability",
      )
      .select("*")
      .eq(
        "user_id",
        userId,
      )
      .maybeSingle(),

    admin
      .from(
        "investor_tax_profiles",
      )
      .select(
        `
        taxpayer_name,
        tax_form_type,
        tax_residency_country,
        country_of_citizenship,
        tin_type,
        tin_last_four,
        foreign_tin_last_four,
        w9_document_path,
        w9_supporting_document_path,
        w8ben_document_path,
        w8ben_supporting_document_path,
        certification_accepted,
        certification_name,
        status
        `,
      )
      .eq(
        "user_id",
        userId,
      )
      .maybeSingle(),

      admin
  .from(
    "compliance_audit_logs",
  )
  .select(
    `
    id,
    actor_user_id,
    action,
    field_name,
    metadata,
    created_at
    `,
  )
  .eq(
    "investor_user_id",
    userId,
  )
  .order(
    "created_at",
    {
      ascending:
        false,
    },
  )
  .limit(50),
  ]);

  const profile =
    profileResult.data;

  if (!profile) {
    notFound();
  }

  const {
  data: authUserData,
  error: authUserError,
} =
  await admin.auth.admin.getUserById(
    userId,
  );

if (authUserError) {
  console.error(
    "Investor auth lookup error:",
    authUserError,
  );
}

const investorEmail =
  authUserData.user?.email ??
  "Email unavailable";

  const review =
    reviewResult.data;

  const kyc =
    kycResult.data;

  const address =
    addressResult.data;

  const eligibility =
    eligibilityResult.data;

  const suitability =
    suitabilityResult.data;

  const tax =
    taxResult.data;

  const auditLogs =
  auditResult.data ??
  [];

  /*
   * Generate short-lived private
   * verification document URLs.
   */
  const [
    dlFrontUrl,
    dlBackUrl,
    ssnFrontUrl,
    ssnBackUrl,
    addressProofUrl,
    w9Url,
    w9SupportingUrl,
    w8Url,
    w8SupportingUrl,
  ] =
    await Promise.all([
      signedUrl(
        admin,
        kyc?.drivers_license_front_path,
      ),

      signedUrl(
        admin,
        kyc?.drivers_license_back_path,
      ),

      signedUrl(
        admin,
        kyc?.ssn_front_path,
      ),

      signedUrl(
        admin,
        kyc?.ssn_back_path,
      ),

      signedUrl(
        admin,
        address?.proof_document_path,
      ),

      signedUrl(
        admin,
        tax?.w9_document_path,
      ),

      signedUrl(
        admin,
        tax?.w9_supporting_document_path,
      ),

      signedUrl(
        admin,
        tax?.w8ben_document_path,
      ),

      signedUrl(
        admin,
        tax?.w8ben_supporting_document_path,
      ),
    ]);

  const investorName = [
    profile.first_name,
    profile.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-8">
      <Link
        href="/admin/compliance"
        className="inline-flex items-center gap-2 text-sm font-semibold text-forest-950"
      >
        <ArrowLeft className="size-4" />

        Compliance queue
      </Link>

      <div className="rounded-[1.75rem] bg-forest-950 p-7 text-white sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
          Investor review
        </p>

        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-4xl font-semibold sm:text-5xl">
              {investorName}
            </h1>

            <p className="mt-3 text-sm text-white/60">
              {investorEmail}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-white/40">
              Compliance status
            </p>

            <p className="mt-2 text-lg font-semibold text-gold-400">
              {humanize(
                review?.status,
              )}
            </p>
          </div>
        </div>
      </div>

      <AdminSection
        icon={UserRound}
        title="Personal profile"
      >
        <DataGrid
          items={[
            [
              "Name",
              investorName,
            ],

            [
            "Email",
            investorEmail,
            ],

            [
              "Phone",
              profile.phone,
            ],

            [
              "Date of birth",
              profile.date_of_birth,
            ],

            [
              "Nationality",
              profile.nationality,
            ],

            [
              "Profession",
              profile.profession,
            ],

            [
              "Country",
              profile.country,
            ],

            [
              "City",
              profile.city,
            ],
          ]}
        />
      </AdminSection>

      <AdminSection
        icon={ShieldCheck}
        title="Identity verification"
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
          Status
        </p>

        <p className="mt-2 text-sm text-forest-950">
          {humanize(
            kyc?.verification_status ??
              kyc?.status,
          )}
        </p>
      </div>

      <RevealSensitiveValue
        userId={userId}
        field="drivers_license"
        label="Driver's License Number"
        maskedValue={
          kyc?.drivers_license_last_four
            ? `••••${kyc.drivers_license_last_four}`
            : "Unavailable"
        }
      />

      <RevealSensitiveValue
        userId={userId}
        field="ssn"
        label="Social Security Number"
        maskedValue={
          kyc?.ssn_last_four
            ? `•••-••-${kyc.ssn_last_four}`
            : "Unavailable"
        }
      />
    </div>

        <DocumentGrid
          documents={[
            [
              "Driver's License Front",
              dlFrontUrl,
            ],

            [
              "Driver's License Back",
              dlBackUrl,
            ],

            [
              "SSN Front",
              ssnFrontUrl,
            ],

            [
              "SSN Back",
              ssnBackUrl,
            ],
          ]}
        />
      </AdminSection>

      <AdminSection
        icon={MapPin}
        title="Address verification"
      >
        <DataGrid
          items={[
            [
              "Address",
              address?.address_line_1,
            ],

            [
              "City",
              address?.city,
            ],

            [
              "Region",
              address?.state_region,
            ],

            [
              "Postal code",
              address?.postal_code,
            ],

            [
              "Country",
              address?.country,
            ],

            [
              "Status",
              humanize(
                address?.status,
              ),
            ],
          ]}
        />

        <DocumentGrid
          documents={[
            [
              "Proof of Address",
              addressProofUrl,
            ],
          ]}
        />
      </AdminSection>

      <AdminSection
        icon={BadgeCheck}
        title="Investor eligibility"
      >
        <DataGrid
          items={[
            [
              "Investor type",
              humanize(
                eligibility?.investor_type,
              ),
            ],

            [
              "Employment",
              humanize(
                eligibility?.employment_status,
              ),
            ],

            [
              "Occupation",
              eligibility?.occupation,
            ],

            [
              "Annual income",
              humanize(
                eligibility?.annual_income_band,
              ),
            ],

            [
              "Net worth",
              humanize(
                eligibility?.net_worth_band,
              ),
            ],

            [
              "Liquid net worth",
              humanize(
                eligibility?.liquid_net_worth_band,
              ),
            ],

            [
              "Investment experience",
              humanize(
                eligibility?.investment_experience,
              ),
            ],

            [
              "Source of funds",
              humanize(
                eligibility?.source_of_funds,
              ),
            ],
          ]}
        />
      </AdminSection>

      <AdminSection
        icon={WalletCards}
        title="Suitability assessment"
      >
        <DataGrid
          items={[
            [
              "Objective",
              humanize(
                suitability?.investment_objective,
              ),
            ],

            [
              "Horizon",
              humanize(
                suitability?.investment_horizon,
              ),
            ],

            [
              "Liquidity",
              humanize(
                suitability?.liquidity_needs,
              ),
            ],

            [
              "Risk tolerance",
              humanize(
                suitability?.risk_tolerance,
              ),
            ],

            [
              "Status",
              humanize(
                suitability?.status,
              ),
            ],
          ]}
        />
      </AdminSection>

      <AdminSection
        icon={FileText}
        title="Tax & IRS certification"
      >
        <DataGrid
          items={[
            [
              "Tax form",
              tax?.tax_form_type,
            ],

            [
              "Taxpayer",
              tax?.taxpayer_name,
            ],

            [
              "Tax residence",
              tax?.tax_residency_country,
            ],

            [
              "TIN type",
              tax?.tin_type,
            ],

            [
              "Certification",
              tax?.certification_accepted
                ? "Accepted"
                : "Missing",
            ],

            [
              "Status",
              humanize(
                tax?.status,
              ),
            ],
          ]}
        />

        <div className="mt-7 grid gap-6 border-t border-forest-900/10 pt-6 sm:grid-cols-2">
          {tax?.tin_last_four ? (
            <RevealSensitiveValue
              userId={userId}
              field="tin"
              label="Full U.S. TIN"
              maskedValue={`••••${tax.tin_last_four}`}
            />
          ) : null}

          {tax?.foreign_tin_last_four ? (
            <RevealSensitiveValue
              userId={userId}
              field="foreign_tin"
              label="Full Foreign TIN"
              maskedValue={`••••${tax.foreign_tin_last_four}`}
            />
          ) : null}
        </div>

        <DocumentGrid
          documents={[
            [
              "W-9",
              w9Url,
            ],

            [
              "W-9 Supporting Document",
              w9SupportingUrl,
            ],

            [
              "W-8BEN",
              w8Url,
            ],

            [
              "W-8BEN Supporting Document",
              w8SupportingUrl,
            ],
          ]}
        />
      </AdminSection>

      <AdminNotes
      userId={userId}
      initialNotes={
        review?.admin_notes ??
        null
      }
    />
      <AuditHistory
    logs={auditLogs}
    />

      <ComplianceReviewActions
        userId={userId}
        investorName={
          investorName
        }
        currentStatus={
          review?.status ??
          "pending"
        }
      />
    </div>
  );
}

function AdminSection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof UserRound;

  title: string;

  children:
    React.ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
      <div className="flex items-center gap-4">
        <span className="flex size-11 items-center justify-center rounded-full bg-forest-950 text-gold-400">
          <Icon className="size-5" />
        </span>

        <h2 className="font-display text-3xl font-semibold text-forest-950">
          {title}
        </h2>
      </div>

      <div className="mt-7">
        {children}
      </div>
    </section>
  );
}

function DataGrid({
  items,
}: {
  items: [
    string,
    unknown,
  ][];
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(
        ([label, value]) => (
          <div
            key={label}
          >
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
              {label}
            </p>

            <p className="mt-2 wrap-break-word text-sm text-forest-950">
              {String(
                value ??
                  "—",
              )}
            </p>
          </div>
        ),
      )}
    </div>
  );
}

function DocumentGrid({
  documents,
}: {
  documents: [
    string,
    string | null,
  ][];
}) {
  const visible =
    documents.filter(
      ([, url]) =>
        Boolean(url),
    );

  if (
    visible.length ===
    0
  ) {
    return null;
  }

  return (
    <div className="mt-7 grid gap-4 border-t border-forest-900/10 pt-6 sm:grid-cols-2">
      {visible.map(
        ([label, url]) => (
          <a
            key={label}
            href={
              url ??
              "#"
            }
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-xl border border-forest-900/10 bg-ivory-50 p-5 transition hover:border-forest-900/20"
          >
            <div className="flex items-center gap-3">
              <FileCheck2 className="size-5 text-gold-600" />

              <span className="text-sm font-semibold text-forest-950">
                {label}
              </span>
            </div>

            <span className="text-xs font-semibold text-stone-500">
              View
            </span>
          </a>
        ),
      )}
    </div>
  );
}

function AuditHistory({
  logs,
}: {
  logs: {
    id: string;

    actor_user_id: string;

    action: string;

    field_name:
      | string
      | null;

    metadata:
      unknown;

    created_at: string;
  }[];
}) {
  function actionLabel(
    action: string,
  ) {
    const labels:
      Record<string, string> = {
        sensitive_value_revealed:
          "Sensitive value revealed",

        investor_approved:
          "Investor approved",

        investor_rejected:
          "Investor rejected",

        information_requested:
          "Additional information requested",

        onboarding_submitted:
          "Onboarding submitted",

        admin_note_added:
          "Admin note added",

        document_viewed:
          "Document viewed",
      };

    return (
      labels[action] ??
      action
        .replaceAll(
          "_",
          " ",
        )
        .replace(
          /\b\w/g,
          (letter) =>
            letter.toUpperCase(),
        )
    );
  }

  return (
    <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
        Compliance history
      </p>

      <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
        Audit history
      </h2>

      <p className="mt-3 text-sm leading-7 text-stone-600">
        Administrative and sensitive-data access
        activity recorded for this investor.
      </p>

      {logs.length === 0 ? (
        <p className="mt-6 text-sm text-stone-500">
          No compliance audit activity has been
          recorded yet.
        </p>
      ) : (
        <div className="mt-7 divide-y divide-forest-900/10">
          {logs.map(
            (log) => (
              <div
                key={log.id}
                className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-forest-950">
                    {actionLabel(
                      log.action,
                    )}
                  </p>

                  {log.field_name ? (
                    <p className="mt-1 text-xs text-stone-500">
                      Field:{" "}
                      {log.field_name}
                    </p>
                  ) : null}
                </div>

                <div className="sm:text-right">
                  <p className="text-xs text-stone-500">
                    {new Date(
                      log.created_at,
                    ).toLocaleString()}
                  </p>

                  <p className="mt-1 text-[0.65rem] text-stone-400">
                    Admin ID:{" "}
                    {log.actor_user_id}
                  </p>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </section>
  );
}