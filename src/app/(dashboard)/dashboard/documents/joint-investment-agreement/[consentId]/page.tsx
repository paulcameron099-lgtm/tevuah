import {
  ArrowLeft,
  Download,
  FileSignature,
  ShieldCheck,
  Users,
} from "lucide-react";

import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import {
  checkAccountAccess,
} from "@/src/lib/auth/account-status";
import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";
import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type PageProps = {
  params: Promise<{
    consentId: string;
  }>;
};

export default async function JointInvestmentAgreementDetailPage({
  params,
}: PageProps) {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (
    user.role !==
    "investor"
  ) {
    redirect("/dashboard");
  }

  const access =
    await checkAccountAccess(
      user.id,
    );

  if (
    !access.allowed
  ) {
    redirect(
      "/account-restricted",
    );
  }

  const {
    consentId,
  } = await params;

  const admin =
    createAdminClient();

  const {
    data: consent,
    error,
  } =
    await admin
      .from(
        "joint_investment_member_consents",
      )
      .select(
        `
        id,
        joint_subscription_id,
        member_id,
        investor_id,

        consent_status,

        agreement_version,
        disclosure_version,
        agreement_document_ref,
        disclosure_document_ref,

        signature_name,
        signature_method,

        signed_at,
        accepted_at,
        created_at,

        member:joint_investment_members!joint_investment_member_consents_member_id_fkey (
          id,
          joint_subscription_id,
          investor_id,
          member_slot,
          ownership_bps,
          funding_obligation_bps,
          obligation_amount,
          member_status
        ),

        joint_subscription:joint_investment_subscriptions!joint_investment_member_consents_joint_subscription_id_fkey (
          id,
          opportunity_id,
          total_commitment_amount,
          currency,
          status,

          opportunity:investment_opportunities (
            id,
            title,
            asset_category,
            location
          )
        )
        `,
      )
      .eq(
        "id",
        consentId,
      )
      .eq(
        "investor_id",
        user.id,
      )
      .eq(
        "consent_status",
        "accepted",
      )
      .maybeSingle();

  if (
    error ||
    !consent
  ) {
    console.error(
      "Joint investment agreement detail load error:",
      error,
    );

    notFound();
  }

  const member =
    normalizeRelation(
      consent.member,
    );

  const jointSubscription =
    normalizeRelation(
      consent.joint_subscription,
    );

  const opportunity =
    normalizeRelation(
      jointSubscription?.opportunity,
    );

  /*
   * ----------------------------------------------------------
   * Defensive relationship validation
   * ----------------------------------------------------------
   *
   * The page must never display a consent whose member or
   * joint subscription does not match the authenticated
   * investor's canonical consent.
   * ----------------------------------------------------------
   */

  if (
    !member ||
    !jointSubscription ||
    member.id !==
      consent.member_id ||
    member.investor_id !==
      consent.investor_id ||
    member.joint_subscription_id !==
      consent.joint_subscription_id ||
    jointSubscription.id !==
      consent.joint_subscription_id
  ) {
    console.error(
      "Joint investment agreement relationship mismatch:",
      {
        consentId:
          consent.id,
      },
    );

    notFound();
  }

  /*
   * ----------------------------------------------------------
   * Historical Joint Investment Agreement document
   * ----------------------------------------------------------
   *
   * The document synchronization layer maps the investor's
   * canonical Joint Investment Approved notification onto the
   * individual member consent document.
   *
   * Document identity:
   *
   *   document_type = joint_investment_agreement
   *   source_type   = joint_investment_member_consent
   *   source_id     = consent.id
   *   investor_id   = consent.investor_id
   *
   * historical_published_at is therefore the investor-facing
   * historical agreement chronology.
   *
   * Actual consent.signed_at / accepted_at / created_at remain
   * untouched for administration and audit.
   * ----------------------------------------------------------
   */

  const {
    data: documentRecord,
    error: documentError,
  } =
    await admin
      .from(
        "investor_documents",
      )
      .select(
        `
        id,
        historical_published_at,
        published_at,
        effective_date
        `,
      )
      .eq(
        "investor_id",
        consent.investor_id,
      )
      .eq(
        "document_type",
        "joint_investment_agreement",
      )
      .eq(
        "source_type",
        "joint_investment_member_consent",
      )
      .eq(
        "source_id",
        consent.id,
      )
      .maybeSingle();

  if (
    documentError
  ) {
    console.error(
      "Joint investment agreement historical date lookup error:",
      documentError,
    );
  }

  const currency =
    jointSubscription.currency ??
    "USD";

  /*
   * ----------------------------------------------------------
   * Investor-facing agreement chronology
   * ----------------------------------------------------------
   *
   * Historical override:
   *
   *   Accepted / agreement date = historical_published_at
   *
   * No historical override:
   *
   *   Accepted / agreement date =
   *     accepted_at ?? signed_at
   *
   * The actual consent timestamps remain unchanged.
   * ----------------------------------------------------------
   */

  const historicalDate =
    documentRecord
      ?.historical_published_at ??
    null;

  const displayedAcceptedDate =
    historicalDate ??
    consent.accepted_at ??
    consent.signed_at;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/dashboard/documents"
          className="focus-ring inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950 transition hover:bg-ivory-50"
        >
          <ArrowLeft className="size-3.5" />
          Back to documents
        </Link>

        <Link
          href={`/api/documents/joint-investment-agreement/${consent.id}/pdf`}
          className="focus-ring inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-forest-950 px-4 text-xs font-semibold text-white transition hover:bg-forest-800"
        >
          Download PDF
          <Download className="size-3.5" />
        </Link>
      </div>

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ivory-50 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-stone-600">
            <FileSignature className="size-3" />
            Joint investment agreement
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-emerald-700">
            <ShieldCheck className="size-3" />
            Accepted
          </span>
        </div>

        <h1 className="font-display mt-5 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          Joint Investment Agreement
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Your accepted joint investment agreement for{" "}
          {opportunity?.title ??
            "this investment opportunity"}.
          This record represents your individual consent and
          signature within the joint investment.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DataCard
            label="Opportunity"
            value={
              opportunity?.title ??
              "Not available"
            }
          />

          <DataCard
            label="Joint member"
            value={`Member ${member.member_slot}`}
          />

          <DataCard
            label="Member commitment"
            value={formatMoney(
              member.obligation_amount,
              currency,
            )}
          />

          <DataCard
            label="Total joint commitment"
            value={formatMoney(
              jointSubscription.total_commitment_amount,
              currency,
            )}
          />

          <DataCard
            label="Ownership share"
            value={formatBasisPoints(
              member.ownership_bps,
            )}
          />

          <DataCard
            label="Funding share"
            value={formatBasisPoints(
              member.funding_obligation_bps,
            )}
          />

          <DataCard
            label="Member status"
            value={humanize(
              member.member_status,
            )}
          />

          <DataCard
            label="Joint investment status"
            value={humanize(
              jointSubscription.status,
            )}
          />

          <DataCard
            label="Asset category"
            value={humanize(
              opportunity?.asset_category,
            )}
          />

          <DataCard
            label="Location"
            value={
              opportunity?.location ??
              "Not specified"
            }
          />

          <DataCard
            label="Agreement version"
            value={
              consent.agreement_version ??
              "Not specified"
            }
          />

          <DataCard
            label="Disclosure version"
            value={
              consent.disclosure_version ??
              "Not specified"
            }
          />

          <DataCard
            label="Signature name"
            value={
              consent.signature_name ??
              "Not available"
            }
          />

          <DataCard
            label="Signature method"
            value={humanize(
              consent.signature_method,
            )}
          />

          <DataCard
            label="Accepted"
            value={formatDate(
              displayedAcceptedDate,
            )}
          />

          <DataCard
            label="Agreement reference"
            value={
              consent.agreement_document_ref ??
              "Not specified"
            }
          />

          <DataCard
            label="Disclosure reference"
            value={
              consent.disclosure_document_ref ??
              "Not specified"
            }
          />

          <DataCard
            label="Record reference"
            value={
              consent.id
            }
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] bg-forest-950 p-6 text-white sm:p-8">
        <Users className="size-6 text-gold-400" />

        <h2 className="font-display mt-5 text-3xl font-semibold">
          Your member agreement
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
          This document records your individual acceptance of
          the joint investment agreement. The other member of
          the joint investment has a separate consent record
          associated with their own investor account.
        </p>
      </section>
    </div>
  );
}

function DataCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-ivory-50 p-5">
      <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-stone-400">
        {label}
      </p>

      <p className="mt-2 wrap-break-word text-sm font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

function normalizeRelation<T>(
  value:
    | T
    | T[]
    | null
    | undefined,
) {
  return Array.isArray(
    value,
  )
    ? value[0] ?? null
    : value ?? null;
}

function formatMoney(
  cents:
    | number
    | null
    | undefined,
  currency = "USD",
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency,
    },
  ).format(
    Number(
      cents ?? 0,
    ) / 100,
  );
}

function formatBasisPoints(
  basisPoints:
    | number
    | null
    | undefined,
) {
  return `${(
    Number(
      basisPoints ?? 0,
    ) / 100
  ).toFixed(2)}%`;
}

function formatDate(
  value:
    | string
    | null
    | undefined,
) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  ).format(
    new Date(value),
  );
}

function humanize(
  value:
    | string
    | null
    | undefined,
) {
  if (!value) {
    return "Not specified";
  }

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