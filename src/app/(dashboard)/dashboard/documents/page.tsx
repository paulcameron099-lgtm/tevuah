import {
  ArrowRight,
  CalendarDays,
  Download,
  FileCheck2,
  FileText,
  FolderOpen,
  History,
  Landmark,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

import Link from "next/link";

import {
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

export default async function InvestorDocumentsPage() {
  /*
   * ==================================================
   * 1. AUTH
   * ==================================================
   */
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

  const accountAccess =
    await checkAccountAccess(
      user.id,
    );

  if (
    !accountAccess.allowed
  ) {
    redirect(
      "/account-restricted",
    );
  }

  const admin =
    createAdminClient();

  /*
   * ==================================================
   * 2. LOAD INVESTOR DOCUMENTS
   * ==================================================
   *
   * Server-side ownership and publication filter.
   */
  const {
    data: documents,
    error,
  } = await admin
    .from(
      "investor_documents",
    )
    .select(
      `
      id,

      document_type,

      title,
      description,

      opportunity_id,
      subscription_id,
      payment_id,
      position_id,
      distribution_id,
      statement_id,

      storage_bucket,
      storage_path,

      view_path,
      download_path,

      effective_date,
      published_at,
      historical_document_date,

      reconstructed_from_legacy,

      status,

      created_at
      `,
    )
    .eq(
      "investor_id",
      user.id,
    )
    .eq(
      "status",
      "published",
    )
    .order(
      "effective_date",
      {
        ascending:
          false,
        nullsFirst:
          false,
      },
    )
    .order(
      "published_at",
      {
        ascending:
          false,
        nullsFirst:
          false,
      },
    )
    .order(
      "created_at",
      {
        ascending:
          false,
      },
    );

  if (error) {
    console.error(
      "Investor documents load error:",
      error,
    );

    throw new Error(
      "Unable to load your document library.",
    );
  }

  const records =
    documents ?? [];

  /*
   * ==================================================
   * 3. SUMMARY
   * ==================================================
   */
  const statementCount =
    records.filter(
      (
        document,
      ) =>
        document.document_type ===
        "statement",
    ).length;

  const agreementCount =
    records.filter(
      (
        document,
      ) =>
        document.document_type ===
        "subscription_agreement",
    ).length;

  const fundingCount =
    records.filter(
      (
        document,
      ) =>
        document.document_type ===
        "funding_confirmation",
    ).length;

  const distributionCount =
    records.filter(
      (
        document,
      ) =>
        document.document_type ===
        "distribution_notice",
    ).length;

  /*
   * ==================================================
   * 4. RENDER
   * ==================================================
   */
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Investor records
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          Documents & Reporting
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Access your published statements, investment
          agreements, funding confirmations,
          distribution notices and other investor
          records from one secure library.
        </p>
      </div>

      {/* ==========================================
          SUMMARY
      ========================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          icon={
            FolderOpen
          }
          label="All documents"
          value={String(
            records.length,
          )}
        />

        <SummaryCard
          icon={
            FileText
          }
          label="Statements"
          value={String(
            statementCount,
          )}
        />

        <SummaryCard
          icon={
            FileCheck2
          }
          label="Agreements"
          value={String(
            agreementCount,
          )}
        />

        <SummaryCard
          icon={
            Landmark
          }
          label="Funding records"
          value={String(
            fundingCount,
          )}
        />

        <SummaryCard
          icon={
            ReceiptText
          }
          label="Distribution notices"
          value={String(
            distributionCount,
          )}
        />
      </div>

      {/* ==========================================
          LIBRARY
      ========================================== */}

      <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
        <div className="border-b border-forest-900/10 px-6 py-6 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
            Secure library
          </p>

          <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
            Investor Documents
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
            Only documents currently published to your
            investor account appear here.
          </p>
        </div>

        {records.length ===
        0 ? (
          <div className="px-6 py-16 text-center sm:px-8">
            <FolderOpen className="mx-auto size-8 text-stone-300" />

            <h3 className="font-display mt-5 text-3xl font-semibold text-forest-950">
              No published documents yet.
            </h3>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-500">
              Statements and other investment records
              will appear here when they are published
              to your account.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-forest-900/10">
            {records.map(
              (
                document,
              ) => {
                const displayDate =
                  document.reconstructed_from_legacy &&
                  document.historical_document_date
                    ? document.historical_document_date
                    : document.effective_date ??
                      document.published_at?.slice(
                        0,
                        10,
                      ) ??
                      document.created_at.slice(
                        0,
                        10,
                      );

                return (
                  <article
                    key={
                      document.id
                    }
                    className="p-6 sm:p-8"
                  >
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <DocumentTypeBadge
                            type={
                              document.document_type
                            }
                          />

                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-emerald-700">
                            <ShieldCheck className="size-3" />

                            Published
                          </span>

                          {document.reconstructed_from_legacy ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-blue-700">
                              <History className="size-3" />

                              Historical
                            </span>
                          ) : null}
                        </div>

                        <h3 className="font-display mt-4 text-2xl font-semibold text-forest-950">
                          {
                            document.title
                          }
                        </h3>

                        {document.description ? (
                          <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-500">
                            {
                              document.description
                            }
                          </p>
                        ) : null}

                        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-stone-400">
                          <CalendarDays className="size-3.5 text-gold-600" />

                          <span>
                            {formatDate(
                              displayDate,
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-3">
                        {document.view_path ? (
                          <Link
                            href={
                              document.view_path
                            }
                            className="focus-ring inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950 transition hover:bg-ivory-50"
                          >
                            View

                            <ArrowRight className="size-3.5" />
                          </Link>
                        ) : null}

                        {document.download_path ? (
                          <Link
                            href={
                              document.download_path
                            }
                            className="focus-ring inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-forest-950 px-4 text-xs font-semibold text-white transition hover:bg-forest-800"
                          >
                            Download

                            <Download className="size-3.5" />
                          </Link>
                        ) : null}

                        {!document.view_path &&
                        !document.download_path ? (
                          <span className="inline-flex min-h-10 items-center rounded-full bg-stone-100 px-4 text-xs font-semibold text-stone-500">
                            Record only
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>

      {/* ==========================================
          SECURITY NOTE
      ========================================== */}

      <section className="rounded-[1.75rem] bg-forest-950 p-6 text-white sm:p-8">
        <ShieldCheck className="size-6 text-gold-400" />

        <h2 className="font-display mt-5 text-3xl font-semibold">
          Secure investor records
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
          Your document library only shows records
          published specifically to your investor
          account. Private file downloads remain
          protected by their existing authenticated
          routes or private storage controls.
        </p>
      </section>
    </div>
  );
}

/*
 * ==================================================
 * SUMMARY CARD
 * ==================================================
 */

function SummaryCard({
  icon:
    Icon,

  label,

  value,
}: {
  icon:
    typeof FolderOpen;

  label:
    string;

  value:
    string;
}) {
  return (
    <div className="rounded-widest border border-forest-900/10 bg-white p-5">
      <div className="flex size-10 items-center justify-center rounded-full bg-ivory-50">
        <Icon className="size-4.5 text-gold-600" />
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
        {
          label
        }
      </p>

      <p className="font-display mt-2 text-3xl font-semibold text-forest-950">
        {
          value
        }
      </p>
    </div>
  );
}

/*
 * ==================================================
 * TYPE BADGE
 * ==================================================
 */

function DocumentTypeBadge({
  type,
}: {
  type:
    string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-ivory-50 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-stone-600">
      <FileText className="size-3" />

      {humanize(
        type,
      )}
    </span>
  );
}

/*
 * ==================================================
 * HELPERS
 * ==================================================
 */

function humanize(
  value:
    string,
) {
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

function formatDate(
  value:
    string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      year:
        "numeric",

      month:
        "short",

      day:
        "numeric",
    },
  ).format(
    new Date(
      `${value}T00:00:00`,
    ),
  );
}