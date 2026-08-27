import {
  ArrowLeft,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  HandCoins,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import Link from "next/link";
import {
  DistributionPaymentActions,
} from "@/src/components/admin/distributions/distribution-payment-actions";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  DistributionReviewActions,
} from "@/src/components/admin/distributions/distribution-review-actions";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type PageProps = {
  params: Promise<{
    distributionId: string;
  }>;
};

type PreviewRow = {
  positionId: string;

  investorId: string;

  investorName: string;

  investorEmail:
    | string
    | null;

  principal: number;

  ownershipPercent: number;

  grossAmount: number;

  withholdingAmount: number;

  netAmount: number;
};

export default async function AdminDistributionDetailPage({
  params,
}: PageProps) {
  /*
   * ==================================================
   * 1. ADMIN AUTH
   * ==================================================
   */
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (
    user.role !== "admin" &&
    user.role !== "super_admin"
  ) {
    redirect("/dashboard");
  }

  const {
    distributionId,
  } = await params;

  const admin =
    createAdminClient();

  /*
   * ==================================================
   * 2. LOAD DISTRIBUTION
   * ==================================================
   */
  const {
    data: distribution,
    error: distributionError,
  } = await admin
    .from(
      "investment_distributions",
    )
    .select(
      `
      id,
      opportunity_id,

      title,
      distribution_type,

      record_date,
      payment_date,

      total_distribution_amount,
      currency,

      notes,

      status,

      created_by,
      approved_by,
      approved_at,

      created_at,
      updated_at,

      opportunity:investment_opportunities!investment_distributions_opportunity_id_fkey (
        id,
        slug,
        title,
        asset_category,
        location,
        total_funded,
        investor_count,
        status
      )
      `,
    )
    .eq(
      "id",
      distributionId,
    )
    .maybeSingle();

  if (
    distributionError ||
    !distribution
  ) {
    console.error(
      "Distribution detail load error:",
      distributionError,
    );

    notFound();
  }

  /*
   * ==================================================
   * 3. NORMALIZE OPPORTUNITY
   * ==================================================
   */
  const opportunity =
    Array.isArray(
      distribution.opportunity,
    )
      ? distribution.opportunity[0] ??
        null
      : distribution.opportunity;

  if (!opportunity) {
    notFound();
  }

  /*
   * ==================================================
   * 4. LOAD ELIGIBLE POSITIONS
   * ==================================================
   *
   * Must match the RPC exactly:
   *
   * active / matured
   * funded_at <= record date
   * ordered by ID
   */
  const recordDateEnd =
    `${distribution.record_date}T23:59:59.999Z`;

  const {
    data: positions,
    error: positionsError,
  } = await admin
    .from(
      "investment_positions",
    )
    .select(
      `
      id,
      investor_id,
      principal_amount,
      currency,
      status,
      funded_at,

      investor:profiles!investment_positions_investor_id_fkey (
        id,
        first_name,
        last_name
      )
      `,
    )
    .eq(
      "opportunity_id",
      distribution.opportunity_id,
    )
    .in(
      "status",
      [
        "active",
        "matured",
      ],
    )
    .lte(
      "funded_at",
      recordDateEnd,
    )
    .order(
      "id",
      {
        ascending:
          true,
      },
    );

  if (positionsError) {
    console.error(
      "Distribution eligible positions load error:",
      positionsError,
    );

    throw new Error(
      "Unable to load eligible investor positions.",
    );
  }

  const positionRecords =
    positions ?? [];

  /*
   * ==================================================
   * 5. ELIGIBLE PRINCIPAL
   * ==================================================
   */
  const totalEligiblePrincipal =
    positionRecords.reduce(
      (
        total,
        position,
      ) =>
        total +
        Number(
          position.principal_amount,
        ),
      0,
    );

  const totalDistribution =
    Number(
      distribution.total_distribution_amount,
    );

  /*
   * ==================================================
   * 6. BUILD PREVIEW
   * ==================================================
   *
   * We deliberately reproduce the same rounding
   * behavior as the database RPC:
   *
   * - proportional allocation
   * - last investor gets rounding remainder
   */
  let allocatedSoFar =
    0;

  const previewRows: PreviewRow[] =
    [];

  for (
    let index = 0;
    index <
    positionRecords.length;
    index += 1
  ) {
    const position =
      positionRecords[index];

    const investor =
      Array.isArray(
        position.investor,
      )
        ? position.investor[0] ??
          null
        : position.investor;

    const principal =
      Number(
        position.principal_amount,
      );

    const ownershipPercent =
      totalEligiblePrincipal >
      0
        ? (
            principal /
            totalEligiblePrincipal
          ) *
          100
        : 0;

    const isLast =
      index ===
      positionRecords.length -
        1;

    const grossAmount =
      totalEligiblePrincipal <=
      0
        ? 0
        : isLast
          ? totalDistribution -
            allocatedSoFar
          : Math.round(
              (
                principal /
                totalEligiblePrincipal
              ) *
                totalDistribution,
            );

    allocatedSoFar +=
      grossAmount;

    /*
     * Withholding is zero until tax rules exist.
     */
    const withholdingAmount =
      0;

    const netAmount =
      grossAmount -
      withholdingAmount;

    let investorEmail:
      | string
      | null =
      null;

    if (investor?.id) {
      const {
        data: authData,
        error: authError,
      } =
        await admin.auth.admin.getUserById(
          investor.id,
        );

      if (authError) {
        console.error(
          "Distribution investor Auth lookup error:",
          authError,
        );
      }

      investorEmail =
        authData.user
          ?.email ??
        null;
    }

    const investorName =
      investor
        ? [
            investor.first_name,
            investor.last_name,
          ]
            .filter(Boolean)
            .join(" ")
            .trim() ||
          "Investor"
        : "Investor";

    previewRows.push({
      positionId:
        position.id,

      investorId:
        position.investor_id,

      investorName,

      investorEmail,

      principal,

      ownershipPercent,

      grossAmount,

      withholdingAmount,

      netAmount,
    });
  }

  /*
   * ==================================================
   * 7. LOAD ACTUAL ALLOCATIONS
   * ==================================================
   *
   * These should exist only after approval.
   */
  const {
    data: allocations,
    error: allocationsError,
  } = await admin
    .from(
      "investor_distributions",
    )
   .select(
  `
  id,
  distribution_id,
  position_id,
  investor_id,

  gross_amount,
  withholding_amount,
  net_amount,

  currency,
  status,

  paid_at,
  payment_reference,

  created_at,
  updated_at,

  investor:profiles!investor_distributions_investor_id_fkey (
    id,
    first_name,
    last_name
  )
  `,
)
    .eq(
      "distribution_id",
      distribution.id,
    )
    .order(
      "created_at",
      {
        ascending:
          true,
      },
    );

  if (allocationsError) {
    console.error(
      "Distribution allocations load error:",
      allocationsError,
    );
  }

  const allocationRecords =
    allocations ?? [];

    /*
 * ==================================================
 * ENRICH REAL ALLOCATIONS FOR PAYMENT OPERATIONS
 * ==================================================
 */
const paymentAllocations =
  await Promise.all(
    allocationRecords.map(
      async (
        allocation,
      ) => {
        const investor =
          Array.isArray(
            allocation.investor,
          )
            ? allocation
                .investor[0] ??
              null
            : allocation.investor;

        let investorEmail:
          | string
          | null =
          null;

        if (investor?.id) {
          const {
            data:
              authUserData,
            error:
              authUserError,
          } =
            await admin.auth.admin.getUserById(
              investor.id,
            );

          if (
            authUserError
          ) {
            console.error(
              "Distribution payment investor Auth lookup error:",
              authUserError,
            );
          }

          investorEmail =
            authUserData.user
              ?.email ??
            null;
        }

        const investorName =
          investor
            ? [
                investor.first_name,
                investor.last_name,
              ]
                .filter(Boolean)
                .join(" ")
                .trim() ||
              "Investor"
            : "Investor";

        return {
          id:
            allocation.id,

          investorName,

          investorEmail,

          grossAmount:
            Number(
              allocation.gross_amount,
            ),

          withholdingAmount:
            Number(
              allocation.withholding_amount,
            ),

          netAmount:
            Number(
              allocation.net_amount,
            ),

          status:
            allocation.status,

          paymentReference:
            allocation.payment_reference,

          paidAt:
            allocation.paid_at,
        };
      },
    ),
  );

  /*
   * ==================================================
   * 8. SUMMARY
   * ==================================================
   */
  const previewGrossTotal =
    previewRows.reduce(
      (
        total,
        row,
      ) =>
        total +
        row.grossAmount,
      0,
    );

  const previewWithholding =
    previewRows.reduce(
      (
        total,
        row,
      ) =>
        total +
        row.withholdingAmount,
      0,
    );

  const previewNetTotal =
    previewRows.reduce(
      (
        total,
        row,
      ) =>
        total +
        row.netAmount,
      0,
    );

  /*
   * ==================================================
   * 9. RENDER
   * ==================================================
   */
  return (
    <div className="space-y-8">
      <Link
        href="/admin/distributions"
        className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-forest-950"
      >
        <ArrowLeft className="size-4" />

        Back to distributions
      </Link>

      {/* ==========================================
          HEADER
      ========================================== */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Investor distribution
            </p>

            <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
              {distribution.title}
            </h1>

            <div className="mt-5 flex flex-wrap gap-2">
              <DistributionStatusBadge
                status={
                  distribution.status
                }
              />

              <span className="rounded-full bg-ivory-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-500">
                {humanize(
                  distribution.distribution_type,
                )}
              </span>

              {opportunity.asset_category ? (
                <span className="rounded-full bg-ivory-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-500">
                  {humanize(
                    opportunity.asset_category,
                  )}
                </span>
              ) : null}
            </div>

            <p className="mt-4 text-sm text-stone-500">
              {opportunity.title}
            </p>
          </div>

          <div className="rounded-3xl bg-forest-950 p-6 text-white xl:min-w-72">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold-400">
              Distribution amount
            </p>

            <p className="font-display mt-2 text-4xl font-semibold">
              {formatMoney(
                totalDistribution,
              )}
            </p>

            <p className="mt-3 text-xs leading-6 text-white/45">
              Total cash amount allocated across
              eligible investor positions.
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          SUMMARY
      ========================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={
            CircleDollarSign
          }
          label="Eligible principal"
          value={formatMoney(
            totalEligiblePrincipal,
          )}
        />

        <SummaryCard
          icon={
            UserRound
          }
          label="Eligible positions"
          value={String(
            previewRows.length,
          )}
        />

        <SummaryCard
          icon={
            HandCoins
          }
          label="Gross distribution"
          value={formatMoney(
            previewGrossTotal,
          )}
        />

        <SummaryCard
          icon={
            ShieldCheck
          }
          label="Net distribution"
          value={formatMoney(
            previewNetTotal,
          )}
        />
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_390px]">
        <div className="space-y-8">
          {/* ======================================
              DISTRIBUTION DETAILS
          ====================================== */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <HandCoins className="size-5 text-gold-600" />

            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Distribution Details
            </h2>

            <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <DataPoint
                label="Distribution type"
                value={humanize(
                  distribution.distribution_type,
                )}
              />

              <DataPoint
                label="Record date"
                value={formatDate(
                  distribution.record_date,
                )}
              />

              <DataPoint
                label="Payment date"
                value={
                  distribution.payment_date
                    ? formatDate(
                        distribution.payment_date,
                      )
                    : "Not scheduled"
                }
              />

              <DataPoint
                label="Gross amount"
                value={formatMoney(
                  totalDistribution,
                )}
              />

              <DataPoint
                label="Currency"
                value={
                  distribution.currency
                }
              />

              <DataPoint
                label="Status"
                value={humanize(
                  distribution.status,
                )}
              />
            </div>

            {distribution.notes ? (
              <div className="mt-7 rounded-xl border border-forest-900/10 bg-ivory-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
                  Notes
                </p>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-stone-600">
                  {distribution.notes}
                </p>
              </div>
            ) : null}
          </section>

          {/* ======================================
              ALLOCATION PREVIEW
          ====================================== */}

          <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
            <div className="border-b border-forest-900/10 px-6 py-6 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
                Investor allocation
              </p>

              <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
                Distribution Allocation Preview
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
                Allocation is proportional to each
                eligible position&apos;s funded principal
                as of the record date.
              </p>
            </div>

            {previewRows.length ===
            0 ? (
              <div className="px-6 py-14 text-center">
                <UserRound className="mx-auto size-8 text-stone-300" />

                <h3 className="font-display mt-5 text-2xl font-semibold text-forest-950">
                  No eligible positions.
                </h3>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-stone-500">
                  No active or matured positions were
                  funded on or before the distribution
                  record date.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-forest-900/10">
                {previewRows.map(
                  (
                    row,
                  ) => (
                    <article
                      key={
                        row.positionId
                      }
                      className="p-6 sm:p-8"
                    >
                      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-forest-950">
                            {row.investorName}
                          </h3>

                          {row.investorEmail ? (
                            <p className="mt-1 text-xs text-stone-400">
                              {row.investorEmail}
                            </p>
                          ) : null}

                          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
                            <DataPoint
                              label="Principal"
                              value={formatMoney(
                                row.principal,
                              )}
                            />

                            <DataPoint
                              label="Ownership share"
                              value={`${row.ownershipPercent.toFixed(
                                2,
                              )}%`}
                            />

                            <DataPoint
                              label="Gross allocation"
                              value={formatMoney(
                                row.grossAmount,
                              )}
                            />

                            <DataPoint
                              label="Withholding"
                              value={formatMoney(
                                row.withholdingAmount,
                              )}
                            />

                            <DataPoint
                              label="Net allocation"
                              value={formatMoney(
                                row.netAmount,
                              )}
                            />
                          </div>
                        </div>

                        <Link
                          href={`/admin/positions/${row.positionId}`}
                          className="focus-ring inline-flex min-h-10 shrink-0 cursor-pointer items-center rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950 transition hover:bg-ivory-50"
                        >
                          View position
                        </Link>
                      </div>
                    </article>
                  ),
                )}
              </div>
            )}
          </section>

          {/* ======================================
              WITHHOLDING NOTICE
          ====================================== */}

          <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6 sm:p-8">
            <ShieldCheck className="size-5 text-amber-700" />

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
              Tax withholding
            </p>

            <h2 className="font-display mt-3 text-2xl font-semibold text-amber-950">
              Withholding is currently set to zero.
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-amber-900">
              Tax withholding rules have not yet been
              implemented. Gross and net allocations are
              therefore equal in this version. Do not use
              this as production tax determination logic.
            </p>

            <p className="mt-3 text-xs font-semibold text-amber-800">
              Preview withholding:{" "}
              {formatMoney(
                previewWithholding,
              )}
            </p>
          </section>

          {/* ======================================
              EXISTING ALLOCATIONS
          ====================================== */}

          {distribution.status !==
            "draft" ? (
            <section className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
              <CheckCircle2 className="size-6 text-emerald-700" />

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                Approved allocation
              </p>

              <h2 className="font-display mt-3 text-3xl font-semibold text-emerald-950">
                Investor allocations have been created.
              </h2>

              <p className="mt-4 text-sm leading-7 text-emerald-900">
                {allocationRecords.length} investor
                distribution allocation
                {allocationRecords.length ===
                1
                  ? ""
                  : "s"}{" "}
                currently exist for this distribution.
              </p>

              {distribution.approved_at ? (
                <p className="mt-3 text-xs text-emerald-700">
                  Approved{" "}
                  {formatDateTime(
                    distribution.approved_at,
                  )}
                </p>
              ) : null}
            </section>
          ) : null}
        </div>

        {/* ==========================================
            ACTION SIDEBAR
        ========================================== */}

        <DistributionReviewActions
          distributionId={
            distribution.id
          }
          currentStatus={
            distribution.status
          }
          totalDistribution={
            totalDistribution
          }
          eligiblePrincipal={
            totalEligiblePrincipal
          }
          positionCount={
            previewRows.length
          }
          previewGrossTotal={
            previewGrossTotal
          }
          previewNetTotal={
            previewNetTotal
          }
        />
      </div>
      {distribution.status ===
        "approved" ||
        distribution.status ===
        "processing" ||
        distribution.status ===
        "paid" ? (
        <DistributionPaymentActions
            distributionId={
            distribution.id
            }
            distributionStatus={
            distribution.status
            }
            allocations={
            paymentAllocations
            }
        />
        ) : null}
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
    typeof HandCoins;

  label: string;

  value: string;
}) {
  return (
    <div className="rounded-3xl border border-forest-900/10 bg-white p-5">
      <div className="flex size-10 items-center justify-center rounded-full bg-ivory-50">
        <Icon className="size-4.5 text-gold-600" />
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <p className="font-display mt-2 text-3xl font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

/*
 * ==================================================
 * DATA
 * ==================================================
 */

function DataPoint({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <p className="mt-1 wrap-break-word text-sm font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

/*
 * ==================================================
 * STATUS
 * ==================================================
 */

function DistributionStatusBadge({
  status,
}: {
  status: string;
}) {
  const classes =
    status === "paid"
      ? "bg-emerald-50 text-emerald-700"
      : status ===
            "approved" ||
          status ===
            "processing"
        ? "bg-blue-50 text-blue-700"
        : status ===
            "cancelled"
          ? "bg-red-50 text-red-700"
          : "bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest ${classes}`}
    >
      {status ===
      "draft" ? (
        <Clock3 className="size-3" />
      ) : (
        <CheckCircle2 className="size-3" />
      )}

      {humanize(
        status,
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
  value: string,
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

function formatMoney(
  cents: number,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style:
        "currency",

      currency:
        "USD",

      maximumFractionDigits:
        0,
    },
  ).format(
    cents / 100,
  );
}

function formatDate(
  value: string,
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

function formatDateTime(
  value: string,
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

      hour:
        "numeric",

      minute:
        "2-digit",
    },
  ).format(
    new Date(
      value,
    ),
  );
}