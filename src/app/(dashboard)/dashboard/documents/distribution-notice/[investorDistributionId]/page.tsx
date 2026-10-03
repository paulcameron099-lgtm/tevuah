import {
  ArrowLeft,
  CheckCircle2,
  Download,
  HandCoins,
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
    investorDistributionId: string;
  }>;
};

export default async function DistributionNoticeDetailPage({
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
    investorDistributionId,
  } = await params;

  const admin =
    createAdminClient();

  const {
    data: allocation,
    error,
  } =
    await admin
      .from(
        "investor_distributions",
      )
      .select(
        `
        id,
        investor_id,
        distribution_id,
        position_id,
        gross_amount,
        withholding_amount,
        net_amount,
        currency,
        status,
        paid_at,
        historical_paid_at,
        payment_reference,
        created_at,

        distribution:investment_distributions!investor_distributions_distribution_id_fkey (
          id,
          title,
          distribution_type,
          record_date,
          payment_date,
          status,
          notes
        ),

        position:investment_positions!investor_distributions_position_id_fkey (
          id,
          opportunity_id,
          principal_amount,
          status,
          funded_at,

          opportunity:investment_opportunities!investment_positions_opportunity_id_fkey (
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
        investorDistributionId,
      )
      .eq(
        "investor_id",
        user.id,
      )
      .eq(
        "status",
        "paid",
      )
      .maybeSingle();

  if (
    error ||
    !allocation
  ) {
    console.error(
      "Distribution notice detail load error:",
      error,
    );

    notFound();
  }

  /*
   * ----------------------------------------------------------
   * Historical Distribution Notice document
   * ----------------------------------------------------------
   *
   * The canonical Distribution Paid notification synchronizes
   * its historical timestamp into:
   *
   *   investor_distributions.historical_paid_at
   *   investor_documents.historical_published_at
   *
   * We read the exact document here as the investor-facing
   * document chronology source.
   *
   * Actual timestamps remain untouched.
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
        user.id,
      )
      .eq(
        "document_type",
        "distribution_notice",
      )
      .eq(
        "source_type",
        "investor_distribution",
      )
      .eq(
        "source_id",
        allocation.id,
      )
      .maybeSingle();

  if (
    documentError
  ) {
    console.error(
      "Distribution notice historical date lookup error:",
      documentError,
    );
  }

  const distribution =
    normalizeRelation(
      allocation.distribution,
    );

  const position =
    normalizeRelation(
      allocation.position,
    );

  const opportunity =
    normalizeRelation(
      position?.opportunity,
    );

  const currency =
    allocation.currency ??
    "USD";

  /*
   * ----------------------------------------------------------
   * Effective investor-facing chronology
   * ----------------------------------------------------------
   *
   * Prefer the document historical timestamp.
   *
   * historical_paid_at is a safe secondary source because
   * Step 2 synchronizes it from the same canonical notification.
   *
   * With no historical override, preserve original behavior.
   * ----------------------------------------------------------
   */

  const historicalDate =
    documentRecord
      ?.historical_published_at ??
    allocation.historical_paid_at ??
    null;

  const displayedRecordDate =
    historicalDate ??
    distribution?.record_date;

  const displayedPaymentDate =
    historicalDate ??
    allocation.paid_at ??
    distribution?.payment_date;

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
          href={`/api/documents/distribution-notice/${allocation.id}/pdf`}
          className="focus-ring inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-forest-950 px-4 text-xs font-semibold text-white transition hover:bg-forest-800"
        >
          Download PDF
          <Download className="size-3.5" />
        </Link>
      </div>

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ivory-50 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-stone-600">
            <HandCoins className="size-3" />
            Distribution notice
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-emerald-700">
            <CheckCircle2 className="size-3" />
            Paid
          </span>
        </div>

        <h1 className="font-display mt-5 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          {distribution?.title ??
            "Distribution Notice"}
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Paid investor distribution for{" "}
          {opportunity?.title ??
            "your investment"}.
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
            label="Distribution type"
            value={humanize(
              distribution
                ?.distribution_type,
            )}
          />

          <DataCard
            label="Record date"
            value={formatDate(
              displayedRecordDate,
            )}
          />

          <DataCard
            label="Payment date"
            value={formatDate(
              displayedPaymentDate,
            )}
          />

          <DataCard
            label="Gross amount"
            value={formatMoney(
              allocation.gross_amount,
              currency,
            )}
          />

          <DataCard
            label="Withholding"
            value={formatMoney(
              allocation.withholding_amount,
              currency,
            )}
          />

          <DataCard
            label="Net amount"
            value={formatMoney(
              allocation.net_amount,
              currency,
            )}
          />

          <DataCard
            label="Payment reference"
            value={
              allocation.payment_reference ??
              "Not provided"
            }
          />

          <DataCard
            label="Status"
            value={humanize(
              allocation.status,
            )}
          />
        </div>

        {position?.id ? (
          <div className="mt-8">
            <Link
              href={`/dashboard/portfolio/${position.id}`}
              className="focus-ring inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950 transition hover:bg-ivory-50"
            >
              View related position
            </Link>
          </div>
        ) : null}
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
  currency: string,
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