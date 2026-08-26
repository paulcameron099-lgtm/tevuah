import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  UserRound,
} from "lucide-react";

import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  ValuationPublishActions,
} from "@/src/components/admin/valuations/valuation-publish-actions";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type PageProps = {
  params: Promise<{
    valuationId: string;
  }>;
};

export default async function AdminValuationDetailPage({
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
    valuationId,
  } = await params;

  const admin =
    createAdminClient();

  /*
   * ==================================================
   * 2. LOAD VALUATION
   * ==================================================
   */
  const {
    data: valuation,
    error: valuationError,
  } = await admin
    .from(
      "investment_valuations",
    )
    .select(
      `
      id,
      opportunity_id,
      valuation_date,
      total_asset_value,
      nav_per_unit,
      currency,

      valuation_type,
      source_name,
      methodology,
      notes,

      status,

      created_by,
      published_by,
      published_at,

      created_at,
      updated_at,

      opportunity:investment_opportunities!investment_valuations_opportunity_id_fkey (
        id,
        slug,
        title,
        asset_category,
        location,
        funding_target,
        total_funded,
        investor_count,
        status
      )
      `,
    )
    .eq(
      "id",
      valuationId,
    )
    .maybeSingle();

  if (
    valuationError ||
    !valuation
  ) {
    console.error(
      "Admin valuation detail load error:",
      valuationError,
    );

    notFound();
  }

  const opportunity =
    Array.isArray(
      valuation.opportunity,
    )
      ? valuation.opportunity[0] ??
        null
      : valuation.opportunity;

  if (!opportunity) {
    notFound();
  }

  /*
   * ==================================================
   * 3. LOAD FUNDED POSITIONS
   * ==================================================
   */
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
      valuation.opportunity_id,
    )
    .in(
      "status",
      [
        "active",
        "matured",
      ],
    )
    .order(
      "funded_at",
      {
        ascending:
          true,
      },
    );

  if (positionsError) {
    console.error(
      "Valuation positions load error:",
      positionsError,
    );

    throw new Error(
      "Unable to load funded positions for this valuation.",
    );
  }

  const positionRecords =
    positions ?? [];

  /*
   * ==================================================
   * 4. TOTAL PRINCIPAL
   * ==================================================
   */
  const totalPrincipal =
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

  /*
   * ==================================================
   * 5. LOAD AUTH EMAILS
   * ==================================================
   */
  const previewRows =
    await Promise.all(
      positionRecords.map(
        async (
          position,
        ) => {
          const investor =
            Array.isArray(
              position.investor,
            )
              ? position.investor[0] ??
                null
              : position.investor;

          let investorEmail:
            | string
            | null =
            null;

          if (investor?.id) {
            const {
              data:
                authInvestorData,
              error:
                authInvestorError,
            } =
              await admin.auth.admin.getUserById(
                investor.id,
              );

            if (
              authInvestorError
            ) {
              console.error(
                "Valuation investor auth lookup error:",
                authInvestorError,
              );
            }

            investorEmail =
              authInvestorData.user
                ?.email ??
              null;
          }

          const principal =
            Number(
              position.principal_amount,
            );

          const ownershipPercent =
            totalPrincipal > 0
              ? (
                  principal /
                  totalPrincipal
                ) *
                100
              : 0;

          const positionValue =
            totalPrincipal > 0
              ? Math.round(
                  (
                    principal /
                    totalPrincipal
                  ) *
                    Number(
                      valuation.total_asset_value,
                    ),
                )
              : 0;

          const unrealizedGainLoss =
            positionValue -
            principal;

          const unrealizedReturn =
            principal > 0
              ? (
                  unrealizedGainLoss /
                  principal
                ) *
                100
              : 0;

          return {
            positionId:
              position.id,

            investorId:
              position.investor_id,

            investorName:
              investor
                ? [
                    investor.first_name,
                    investor.last_name,
                  ]
                    .filter(Boolean)
                    .join(" ")
                    .trim() ||
                  "Investor"
                : "Investor",

            investorEmail,

            principal,

            ownershipPercent,

            positionValue,

            unrealizedGainLoss,

            unrealizedReturn,

            status:
              position.status,
          };
        },
      ),
    );

  /*
   * ==================================================
   * 6. EXISTING PUBLISHED POSITION VALUATIONS
   * ==================================================
   *
   * If already published, these should exist.
   */
  const {
    data: publishedPositionValues,
    error:
      publishedPositionValuesError,
  } = await admin
    .from(
      "investment_position_valuations",
    )
    .select(
      `
      id,
      position_id,
      principal_amount,
      position_value,
      unrealized_gain_loss,
      valuation_date
      `,
    )
    .eq(
      "valuation_id",
      valuation.id,
    );

  if (
    publishedPositionValuesError
  ) {
    console.error(
      "Published position valuations load error:",
      publishedPositionValuesError,
    );
  }

  /*
   * ==================================================
   * 7. DERIVED SUMMARY
   * ==================================================
   */
  const totalAssetValue =
    Number(
      valuation.total_asset_value,
    );

  const totalUnrealizedChange =
    totalAssetValue -
    totalPrincipal;

  const totalUnrealizedReturn =
    totalPrincipal > 0
      ? (
          totalUnrealizedChange /
          totalPrincipal
        ) *
        100
      : 0;

  const positive =
    totalUnrealizedChange >=
    0;

  /*
   * ==================================================
   * 8. RENDER
   * ==================================================
   */
  return (
    <div className="space-y-8">
      <Link
        href="/admin/valuations"
        className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-forest-950"
      >
        <ArrowLeft className="size-4" />

        Back to valuations
      </Link>

      {/* HEADER */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Investment valuation
            </p>

            <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
              {opportunity.title}
            </h1>

            <div className="mt-5 flex flex-wrap gap-2">
              <ValuationStatusBadge
                status={
                  valuation.status
                }
              />

              <span className="rounded-full bg-ivory-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-500">
                {humanize(
                  valuation.valuation_type,
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
              Valuation date:{" "}
              <strong className="text-forest-950">
                {formatDate(
                  valuation.valuation_date,
                )}
              </strong>
            </p>
          </div>

          <div className="rounded-3xl bg-forest-950 p-6 text-white xl:min-w-72">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold-400">
              Total asset value
            </p>

            <p className="font-display mt-2 text-4xl font-semibold">
              {formatMoney(
                totalAssetValue,
              )}
            </p>

            <p className="mt-3 text-xs leading-6 text-white/45">
              Proposed opportunity valuation for this
              valuation date.
            </p>
          </div>
        </div>
      </section>

      {/* SUMMARY */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Funded principal"
          value={formatMoney(
            totalPrincipal,
          )}
        />

        <SummaryCard
          label="Valuation"
          value={formatMoney(
            totalAssetValue,
          )}
        />

        <SummaryCard
          label={
            positive
              ? "Unrealized gain"
              : "Unrealized loss"
          }
          value={formatSignedMoney(
            totalUnrealizedChange,
          )}
        />

        <SummaryCard
          label="Estimated return"
          value={formatPercent(
            totalUnrealizedReturn,
          )}
        />
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_390px]">
        <div className="space-y-8">
          {/* VALUATION DETAILS */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <BarChart3 className="size-5 text-gold-600" />

            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Valuation Details
            </h2>

            <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <DataPoint
                label="Valuation date"
                value={formatDate(
                  valuation.valuation_date,
                )}
              />

              <DataPoint
                label="Valuation type"
                value={humanize(
                  valuation.valuation_type,
                )}
              />

              <DataPoint
                label="Currency"
                value={
                  valuation.currency
                }
              />

              <DataPoint
                label="NAV / unit"
                value={
                  valuation.nav_per_unit !=
                  null
                    ? formatNav(
                        Number(
                          valuation.nav_per_unit,
                        ),
                      )
                    : "—"
                }
              />

              <DataPoint
                label="Source"
                value={
                  valuation.source_name ??
                  "—"
                }
              />

              <DataPoint
                label="Status"
                value={humanize(
                  valuation.status,
                )}
              />
            </div>

            <div className="mt-7 rounded-xl border border-forest-900/10 bg-ivory-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
                Methodology
              </p>

              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-stone-600">
                {
                  valuation.methodology
                }
              </p>
            </div>

            {valuation.notes ? (
              <div className="mt-5 rounded-xl border border-forest-900/10 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
                  Notes
                </p>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-stone-600">
                  {valuation.notes}
                </p>
              </div>
            ) : null}
          </section>

          {/* ALLOCATION PREVIEW */}

          <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
            <div className="border-b border-forest-900/10 px-6 py-6 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
                Investor allocation
              </p>

              <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
                Position Valuation Preview
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
                Each position is allocated a proportional
                share of the opportunity valuation based on
                its funded principal.
              </p>
            </div>

            {previewRows.length ===
            0 ? (
              <div className="px-6 py-14 text-center">
                <UserRound className="mx-auto size-7 text-stone-300" />

                <p className="mt-4 text-sm text-stone-500">
                  No funded positions were found.
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
                          <div className="flex items-center gap-2">
                            {row.unrealizedGainLoss >=
                            0 ? (
                              <TrendingUp className="size-4 text-emerald-700" />
                            ) : (
                              <TrendingDown className="size-4 text-red-700" />
                            )}

                            <h3 className="text-sm font-semibold text-forest-950">
                              {row.investorName}
                            </h3>
                          </div>

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
                              label="Position value"
                              value={formatMoney(
                                row.positionValue,
                              )}
                            />

                            <DataPoint
                              label="Gain / loss"
                              value={formatSignedMoney(
                                row.unrealizedGainLoss,
                              )}
                            />

                            <DataPoint
                              label="Return"
                              value={formatPercent(
                                row.unrealizedReturn,
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

          {/* PUBLISHED VALUES */}

          {valuation.status ===
          "published" ? (
            <section className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
              <CheckCircle2 className="size-6 text-emerald-700" />

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                Published
              </p>

              <h2 className="font-display mt-3 text-3xl font-semibold text-emerald-950">
                This valuation is active in investor reporting.
              </h2>

              <p className="mt-4 text-sm leading-7 text-emerald-900">
                {
                  publishedPositionValues?.length ??
                  0
                }{" "}
                position valuation snapshots were generated.
              </p>

              {valuation.published_at ? (
                <p className="mt-3 text-xs text-emerald-700">
                  Published{" "}
                  {formatDateTime(
                    valuation.published_at,
                  )}
                </p>
              ) : null}
            </section>
          ) : null}
        </div>

        {/* ACTIONS */}

        <ValuationPublishActions
          valuationId={
            valuation.id
          }
          currentStatus={
            valuation.status
          }
          totalPrincipal={
            totalPrincipal
          }
          totalAssetValue={
            totalAssetValue
          }
          positionCount={
            previewRows.length
          }
        />
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-forest-900/10 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <p className="font-display mt-3 text-3xl font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

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

function ValuationStatusBadge({
  status,
}: {
  status: string;
}) {
  const published =
    status ===
    "published";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest ${
        published
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {published ? (
        <CheckCircle2 className="size-3" />
      ) : (
        <Clock3 className="size-3" />
      )}

      {humanize(
        status,
      )}
    </span>
  );
}

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

function formatSignedMoney(
  cents: number,
) {
  const formatted =
    formatMoney(
      Math.abs(
        cents,
      ),
    );

  if (cents > 0) {
    return `+${formatted}`;
  }

  if (cents < 0) {
    return `-${formatted}`;
  }

  return formatted;
}

function formatPercent(
  value: number,
) {
  return `${
    value > 0
      ? "+"
      : ""
  }${value.toFixed(
    2,
  )}%`;
}

function formatNav(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      minimumFractionDigits:
        2,

      maximumFractionDigits:
        8,
    },
  ).format(
    value,
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