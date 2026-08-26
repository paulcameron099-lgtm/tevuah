import {
  ArrowRight,
  BriefcaseBusiness,
} from "lucide-react";

import Link from "next/link";

import { createAdminClient } from "@/src/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

export default async function InvestmentsMarketplacePage() {
  const admin =
    createAdminClient();

  /*
   * --------------------------------------------------
   * 1. LOAD PUBLISHED OPPORTUNITIES ONLY
   * --------------------------------------------------
   */
  const {
    data: opportunities,
    error,
  } = await admin
    .from(
      "investment_opportunities",
    )
    .select(
      `
      id,
      slug,
      title,
      short_description,
      asset_category,
      location,

      funding_target,
      minimum_investment,
      total_funded,
      investor_count,

      expected_duration_months,

      target_return_min,
      target_return_max,
      target_return_note,

      cover_image_path,

      status,
      published_at,

      estate:investment_estates (
        id,
        name,
        country,
        region
      )
      `,
    )
    .eq(
      "status",
      "published",
    )
    .order(
      "published_at",
      {
        ascending:
          false,
      },
    );

  if (error) {
    console.error(
      "Published opportunities load error:",
      error,
    );

    throw new Error(
      "Unable to load investment opportunities.",
    );
  }

  /*
   * --------------------------------------------------
   * 2. CREATE TEMPORARY COVER IMAGE URLS
   * --------------------------------------------------
   */
  const records =
    await Promise.all(
      (
        opportunities ??
        []
      ).map(
        async (
          opportunity,
        ) => {
          let coverImageUrl:
            | string
            | null =
            null;

          if (
            opportunity.cover_image_path
          ) {
            const {
              data,
              error:
                coverError,
            } = await admin.storage
              .from(
                "investment-media",
              )
              .createSignedUrl(
                opportunity.cover_image_path,
                60 * 30,
              );

            if (coverError) {
              console.error(
                `Marketplace cover URL error for ${opportunity.id}:`,
                coverError,
              );
            }

            coverImageUrl =
              data?.signedUrl ??
              null;
          }

          return {
            ...opportunity,

            coverImageUrl,
          };
        },
      ),
    );

  return (
    <main>
      {/* ==========================================
          HERO
      ========================================== */}

      <section className="bg-forest-950 px-5 py-20 text-white sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
            Tevuah Reserve
          </p>

          <h1 className="font-display mt-5 max-w-4xl text-5xl font-semibold tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Investment opportunities
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/60">
            Explore currently available vineyard,
            olive-estate, agricultural technology
            and fine-wine opportunities.
          </p>
        </div>
      </section>

      {/* ==========================================
          MARKETPLACE
      ========================================== */}

      <section className="bg-ivory-50 px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
                Marketplace
              </p>

              <h2 className="font-display mt-3 text-4xl font-semibold text-forest-950">
                Available investments
              </h2>
            </div>

            <p className="text-sm text-stone-500">
              {records.length}{" "}
              {records.length ===
              1
                ? "opportunity"
                : "opportunities"}
            </p>
          </div>

          {records.length ===
          0 ? (
            <div className="mt-10 rounded-[1.75rem] border border-forest-900/10 bg-white px-6 py-16 text-center">
              <BriefcaseBusiness className="mx-auto size-7 text-stone-300" />

              <h3 className="font-display mt-4 text-3xl font-semibold text-forest-950">
                No opportunities are currently open.
              </h3>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-stone-500">
                Published investment opportunities
                will appear here when they become
                available.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {records.map(
                (
                  opportunity,
                ) => {
                  const progress =
                    opportunity.funding_target >
                    0
                      ? Math.min(
                          100,

                          Math.round(
                            (
                              opportunity.total_funded /
                              opportunity.funding_target
                            ) *
                              100,
                          ),
                        )
                      : 0;

                  return (
                    <article
                      key={
                        opportunity.id
                      }
                      className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white"
                    >
                      {/* IMAGE */}

                      {opportunity.coverImageUrl ? (
                        <img
                          src={
                            opportunity.coverImageUrl
                          }
                          alt={
                            opportunity.title
                          }
                          className="h-60 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-60 items-center justify-center bg-forest-950 text-white/30">
                          <BriefcaseBusiness className="size-8" />
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-forest-950 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-white">
                            {humanize(
                              opportunity.asset_category,
                            )}
                          </span>

                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-emerald-700">
                            Open
                          </span>
                        </div>

                        <h3 className="font-display mt-5 text-3xl font-semibold text-forest-950">
                          {
                            opportunity.title
                          }
                        </h3>

                        <p className="mt-3 line-clamp-3 text-sm leading-7 text-stone-600">
                          {opportunity.short_description ??
                            "Investment opportunity available through Tevuah Reserve."}
                        </p>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                          <DataPoint
                            label="Target"
                            value={formatMoney(
                              opportunity.funding_target,
                            )}
                          />

                          <DataPoint
                            label="Minimum"
                            value={formatMoney(
                              opportunity.minimum_investment,
                            )}
                          />

                          <DataPoint
                            label="Duration"
                            value={
                              opportunity.expected_duration_months
                                ? `${opportunity.expected_duration_months} months`
                                : "—"
                            }
                          />

                          <DataPoint
                            label="Target return"
                            value={returnDisplay(
                              opportunity.target_return_min,
                              opportunity.target_return_max,
                            )}
                          />
                        </div>

                        {/* PROGRESS */}

                        <div className="mt-6">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-forest-950">
                              Funding progress
                            </span>

                            <span className="text-stone-500">
                              {progress}%
                            </span>
                          </div>

                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
                            <div
                              className="h-full rounded-full bg-forest-950"
                              style={{
                                width:
                                  `${progress}%`,
                              }}
                            />
                          </div>

                          <p className="mt-2 text-xs text-stone-500">
                            {formatMoney(
                              opportunity.total_funded,
                            )}{" "}
                            funded
                          </p>
                        </div>

                        <Link
                          href={`/investments/${opportunity.slug}`}
                          className="focus-ring mt-7 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800"
                        >
                          View opportunity

                          <ArrowRight className="size-4" />
                        </Link>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          )}
        </div>
      </section>
    </main>
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

      <p className="mt-1 text-sm font-semibold text-forest-950">
        {value}
      </p>
    </div>
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
      (letter) =>
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
    Number(
      cents,
    ) / 100,
  );
}

function returnDisplay(
  minimum:
    | number
    | null,
  maximum:
    | number
    | null,
) {
  if (
    minimum != null &&
    maximum != null
  ) {
    return `${minimum}%–${maximum}%`;
  }

  if (
    minimum != null
  ) {
    return `${minimum}% target`;
  }

  if (
    maximum != null
  ) {
    return `Up to ${maximum}%`;
  }

  return "See details";
}