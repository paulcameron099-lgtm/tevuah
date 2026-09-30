import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import { InvestmentStartAction } from "@/src/components/investments/investment-start-action";
import {
  OpportunityHeroImage,
  OpportunityHeroOverlay,
  OpportunityHeroReveal,
  OpportunityProgress,
  OpportunityReveal,
  OpportunityStagger,
  OpportunityStaggerItem,
  OpportunitySummaryReveal,
} from "@/src/components/investments/opportunity-motion";
import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function InvestmentOpportunityPage({
  params,
}: PageProps) {
  const {
    slug,
  } = await params;

  const admin =
    createAdminClient();

  /*
   * --------------------------------------------------
   * 1. PUBLISHED OPPORTUNITY ONLY
   * --------------------------------------------------
   */
  const {
    data: opportunity,
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
      full_description,

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
      funding_closed_at,

      estate:investment_estates (
        id,
        name,
        estate_type,
        country,
        region,
        description
      )
      `,
    )
    .eq(
      "slug",
      slug,
    )
    .eq(
      "status",
      "published",
    )
    .maybeSingle();

  if (
    error ||
    !opportunity
  ) {
    notFound();
  }

  /*
   * --------------------------------------------------
   * NORMALIZE ESTATE RELATION
   * --------------------------------------------------
   */
  const estate =
    Array.isArray(
      opportunity.estate,
    )
      ? opportunity.estate[0] ??
        null
      : opportunity.estate;

  /*
   * --------------------------------------------------
   * 2. COVER IMAGE
   * --------------------------------------------------
   */
  let coverImageUrl:
    | string
    | null =
    null;

  if (
    opportunity.cover_image_path
  ) {
    const {
      data,
    } = await admin.storage
      .from(
        "investment-media",
      )
      .createSignedUrl(
        opportunity.cover_image_path,
        60 * 30,
      );

    coverImageUrl =
      data?.signedUrl ??
      null;
  }

  /*
   * --------------------------------------------------
   * 3. INVESTMENT DOCUMENTS
   * --------------------------------------------------
   */
  const {
    data: documents,
  } = await admin
    .from(
      "investment_opportunity_documents",
    )
    .select(
      `
      id,
      label,
      document_type,
      file_name
      `,
    )
    .eq(
      "opportunity_id",
      opportunity.id,
    )
    .order(
      "created_at",
    );

  /*
   * --------------------------------------------------
   * 4. CURRENT USER
   * --------------------------------------------------
   */
  const user =
    await getCurrentUser();

  let investorState = {
    signedIn:
      false,

    isInvestor:
      false,

    accountActive:
      false,

    verified:
      false,
  };

  if (user) {
    investorState = {
      signedIn:
        true,

      isInvestor:
        user.role ===
        "investor",

      accountActive:
        user.account_status ===
        "active",

      verified:
        user.onboarding_status ===
        "approved",
    };
  }

  const fundingTarget =
    Number(
      opportunity.funding_target,
    );

  const totalFunded =
    Number(
      opportunity.total_funded,
    );

  const progress =
    fundingTarget > 0
      ? Math.min(
          100,
          Math.round(
            (totalFunded /
              fundingTarget) *
              100,
          ),
        )
      : 0;

  // Persistent closure prevents a later redemption from reopening
  // an offering that already reached its target.
  const fullyFunded =
    Boolean(
      opportunity.funding_closed_at,
    ) ||
    (fundingTarget > 0 &&
      totalFunded >=
        fundingTarget);

  return (
    <main className="bg-ivory-50">
      {/* ==========================================
          HERO
      ========================================== */}

      <section className="bg-forest-950 text-white">
        {coverImageUrl ? (
          <div className="relative h-110 overflow-hidden">
            <OpportunityHeroImage className="absolute inset-0">
              <img
                src={
                  coverImageUrl
                }
                alt={
                  opportunity.title
                }
                className="size-full object-cover opacity-55"
              />
            </OpportunityHeroImage>

            <OpportunityHeroOverlay className="absolute inset-0 bg-linear-to-t from-forest-950 via-forest-950/30 to-transparent" />

            <div className="absolute inset-x-0 bottom-0">
              <div className="mx-auto max-w-7xl px-5 pb-12 sm:px-8">
                <OpportunityHero
                  opportunity={
                    opportunity
                  }
                  fullyFunded={
                    fullyFunded
                  }
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <OpportunityHero
              opportunity={
                opportunity
              }
              fullyFunded={
                fullyFunded
              }
            />
          </div>
        )}
      </section>

      {/* ==========================================
          CONTENT
      ========================================== */}

      <section className="px-5 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            {/* OVERVIEW */}

            <OpportunityReveal>
              <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
                  Opportunity overview
                </p>

                <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
                  Investment thesis
                </h2>

                <div className="mt-5 whitespace-pre-line text-sm leading-8 text-stone-600">
                  {opportunity.full_description ??
                    opportunity.short_description}
                </div>
              </section>
            </OpportunityReveal>

            {/* ESTATE */}

            {estate ? (
              <OpportunityReveal delay={0.04}>
                <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
                    Estate / underlying asset
                  </p>

                  <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
                    {
                      estate.name
                    }
                  </h2>

                  <p className="mt-4 text-sm leading-7 text-stone-600">
                    {estate.description ??
                      "Underlying asset assigned to this investment opportunity."}
                  </p>

                  <OpportunityStagger className="mt-6 flex flex-wrap gap-3">
                    {estate.region ? (
                      <OpportunityStaggerItem>
                        <span className="inline-flex rounded-full bg-ivory-50 px-3 py-1.5 text-xs font-semibold text-forest-950">
                          {
                            estate.region
                          }
                        </span>
                      </OpportunityStaggerItem>
                    ) : null}

                    {estate.country ? (
                      <OpportunityStaggerItem>
                        <span className="inline-flex rounded-full bg-ivory-50 px-3 py-1.5 text-xs font-semibold text-forest-950">
                          {
                            estate.country
                          }
                        </span>
                      </OpportunityStaggerItem>
                    ) : null}
                  </OpportunityStagger>
                </section>
              </OpportunityReveal>
            ) : null}

            {/* DOCUMENTS */}

            <OpportunityReveal delay={0.04}>
              <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
                <FileText className="size-5 text-gold-600" />

                <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
                  Investment documents
                </h2>

                <p className="mt-3 text-sm leading-7 text-stone-600">
                  Private investment documents are
                  available through controlled account
                  access.
                </p>

                {(documents ?? [])
                  .length > 0 ? (
                  <OpportunityStagger className="mt-6 space-y-3">
                    {(documents ?? []).map(
                      (
                        document,
                      ) => (
                        <OpportunityStaggerItem
                          key={
                            document.id
                          }
                        >
                          <div className="flex items-center gap-3 rounded-xl border border-forest-900/10 bg-ivory-50 p-4">
                            <FileText className="size-4 shrink-0 text-gold-600" />

                            <div>
                              <p className="text-sm font-semibold text-forest-950">
                                {
                                  document.label
                                }
                              </p>

                              <p className="mt-1 text-xs text-stone-500">
                                {humanize(
                                  document.document_type,
                                )}
                              </p>
                            </div>
                          </div>
                        </OpportunityStaggerItem>
                      ),
                    )}
                  </OpportunityStagger>
                ) : (
                  <p className="mt-6 text-sm text-stone-500">
                    No investor documents are currently
                    available.
                  </p>
                )}
              </section>
            </OpportunityReveal>
          </div>

          {/* ========================================
              INVESTMENT PANEL
          ======================================== */}

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <OpportunitySummaryReveal>
              <div className="rounded-[1.75rem] bg-forest-950 p-6 text-white sm:p-7">
                <ShieldCheck className="size-5 text-gold-400" />

                <h2 className="font-display mt-5 text-3xl font-semibold">
                  Investment summary
                </h2>

                <OpportunityStagger className="mt-7 space-y-5">
                  <OpportunityStaggerItem>
                    <SideData
                      label="Funding target"
                      value={formatMoney(
                        opportunity.funding_target,
                      )}
                    />
                  </OpportunityStaggerItem>

                  <OpportunityStaggerItem>
                    <SideData
                      label="Minimum investment"
                      value={formatMoney(
                        opportunity.minimum_investment,
                      )}
                    />
                  </OpportunityStaggerItem>

                  <OpportunityStaggerItem>
                    <SideData
                      label="Expected duration"
                      value={
                        opportunity.expected_duration_months
                          ? `${opportunity.expected_duration_months} months`
                          : "See offering materials"
                      }
                    />
                  </OpportunityStaggerItem>

                  <OpportunityStaggerItem>
                    <SideData
                      label="Target return"
                      value={returnDisplay(
                        opportunity.target_return_min,
                        opportunity.target_return_max,
                      )}
                    />
                  </OpportunityStaggerItem>
                </OpportunityStagger>

                <div className="mt-7 border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">
                      Funding progress
                    </span>

                    <span className="text-white/50">
                      {progress}%
                    </span>
                  </div>

                  <OpportunityProgress
                    progress={
                      progress
                    }
                    className="mt-3 h-2"
                  />

                  <p className="mt-3 text-xs text-white/50">
                    {formatMoney(
                      opportunity.total_funded,
                    )}{" "}
                    currently funded
                  </p>
                </div>

                {fullyFunded ? (
                  <OpportunityReveal>
                    <div className="mt-7 rounded-2xl border border-gold-400/25 bg-white/5 p-5">
                      <div className="flex items-center gap-2 text-gold-300">
                        <CheckCircle2 className="size-4" />

                        <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                          Fully Funded
                        </span>
                      </div>

                      <p className="mt-3 text-sm font-semibold text-white">
                        This opportunity is closed to new investments.
                      </p>

                      <p className="mt-2 text-xs leading-6 text-white/50">
                        The offering reached its funding target and remains
                        visible for investor transparency.
                      </p>
                    </div>
                  </OpportunityReveal>
                ) : (
                  <InvestmentStartAction
                    opportunityId={
                      opportunity.id
                    }
                    investorState={
                      investorState
                    }
                  />
                )}

                <p className="mt-5 text-xs leading-6 text-white/40">
                  Target returns are illustrative and
                  are not guaranteed. Private-market
                  investments involve risk, including
                  potential loss of capital and
                  illiquidity.
                </p>
              </div>
            </OpportunitySummaryReveal>
          </aside>
        </div>
      </section>
    </main>
  );
}

function OpportunityHero({
  opportunity,
  fullyFunded,
}: {
  opportunity: {
    title: string;

    short_description:
      | string
      | null;

    asset_category: string;

    location:
      | string
      | null;
  };

  fullyFunded: boolean;
}) {
  return (
    <>
      <OpportunityHeroReveal delay={0.06}>
        <Link
          href="/investments"
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white"
        >
          <ArrowLeft className="size-4" />

          All opportunities
        </Link>
      </OpportunityHeroReveal>

      <OpportunityHeroReveal delay={0.14}>
        <div className="mt-8 flex flex-wrap gap-2">
          <span className="rounded-full bg-gold-400 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-forest-950">
            {humanize(
              opportunity.asset_category,
            )}
          </span>

          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-white">
            {fullyFunded
              ? "Fully Funded · Closed"
              : "Open"}
          </span>
        </div>
      </OpportunityHeroReveal>

      <OpportunityHeroReveal delay={0.23}>
        <h1 className="font-display mt-5 max-w-4xl text-5xl font-semibold tracking-[-0.045em] sm:text-6xl">
          {
            opportunity.title
          }
        </h1>
      </OpportunityHeroReveal>

      <OpportunityHeroReveal delay={0.32}>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/65">
          {
            opportunity.short_description
          }
        </p>
      </OpportunityHeroReveal>

      {opportunity.location ? (
        <OpportunityHeroReveal delay={0.4}>
          <div className="mt-5 flex items-center gap-2 text-sm text-white/60">
            <MapPin className="size-4" />

            {
              opportunity.location
            }
          </div>
        </OpportunityHeroReveal>
      ) : null}
    </>
  );
}

function SideData({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-white/10 pb-4">
      <span className="text-xs text-white/45">
        {label}
      </span>

      <span className="text-right text-sm font-semibold">
        {value}
      </span>
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

  return "See offering materials";
}