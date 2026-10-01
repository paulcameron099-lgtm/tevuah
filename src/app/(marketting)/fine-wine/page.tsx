import type { Metadata } from "next";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowDown,
  ArrowUpRight,
  BadgeCheck,
  Boxes,
  BriefcaseBusiness,
  CalendarDays,
  FileCheck2,
  ShieldCheck,
  Thermometer,
  WalletCards,
  Wine,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";

import {
  FineWineHeroImage,
  FineWineHeroLine,
  FineWineHeroOverlay,
  FineWineHeroReveal,
  FineWineImageReveal,
  FineWineListItem,
  FineWinePortfolioReveal,
  FineWineProgress,
  FineWineReveal,
  FineWineRevealSoft,
  FineWineStagger,
  FineWineStaggerItem,
} from "@/src/components/fine-wine/fine-wine-motion";

import { WineHoldingsTable } from "@/src/components/fine-wine/wine-holdings-table";
import { WinePortfolioMetricCard } from "@/src/components/fine-wine/wine-portfolio-metric";
import { WinePrincipleCard } from "@/src/components/fine-wine/wine-principle-card";
import { WineRegionAllocation } from "@/src/components/fine-wine/wine-region-allocation";

import {
  wineCollectionHoldings,
  winePortfolioMetrics,
  winePrinciples,
  wineRegions,
} from "@/src/data/fine-wine-platform";

import { createAdminClient } from "@/src/lib/supabase/admin";

/*
 * --------------------------------------------------
 * PAGE BEHAVIOUR
 * --------------------------------------------------
 *
 * Fine-wine opportunities are live investment
 * opportunities created by Admin.
 *
 * They are NOT duplicated into another table.
 *
 * A published fine-wine opportunity therefore appears:
 *
 *   1. /investments
 *   2. /fine-wine
 *
 * The canonical opportunity detail page remains:
 *
 *   /investments/[slug]
 *
 * --------------------------------------------------
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Fine Wine",
  description:
    "Explore the Tevuah Reserve approach to fine-wine sourcing, provenance, professional storage, custody and portfolio reporting.",
};

/*
 * --------------------------------------------------
 * STATIC EDITORIAL CONTENT
 * --------------------------------------------------
 */

const custodyPrinciples = [
  {
    title: "Climate control",
    description:
      "Appropriate temperature and humidity conditions are important for long-term storage.",
    icon: Thermometer,
  },
  {
    title: "Documented custody",
    description:
      "Storage location, ownership records and movement history should be clearly recorded.",
    icon: Boxes,
  },
  {
    title: "Condition review",
    description:
      "Selected holdings may require periodic visual or specialist condition checks.",
    icon: BadgeCheck,
  },
  {
    title: "Insurance framework",
    description:
      "High-value collections should have clear insurance and asset-protection arrangements.",
    icon: ShieldCheck,
  },
];

/*
 * --------------------------------------------------
 * LIVE FINE-WINE OPPORTUNITY TYPE
 * --------------------------------------------------
 */

type FineWineOpportunity = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  location: string | null;
  asset_category: string;

  funding_target: number;
  minimum_investment: number;
  total_funded: number;
  investor_count: number;

  expected_duration_months: number | null;

  target_return_min: number | null;
  target_return_max: number | null;
  target_return_note: string | null;

  cover_image_path: string | null;
  coverImageUrl: string | null;

  published_at: string | null;
  funding_closed_at: string | null;
};

/*
 * ==================================================
 * PAGE
 * ==================================================
 */

export default async function FineWinePage() {
  /*
   * --------------------------------------------------
   * 1. LOAD LIVE FINE-WINE OPPORTUNITIES
   * --------------------------------------------------
   */

  const admin = createAdminClient();

  const {
    data: opportunityRows,
    error: opportunityError,
  } = await admin
    .from("investment_opportunities")
    .select(
      `
      id,
      slug,
      title,
      short_description,
      location,
      asset_category,
      funding_target,
      minimum_investment,
      total_funded,
      investor_count,
      expected_duration_months,
      target_return_min,
      target_return_max,
      target_return_note,
      cover_image_path,
      published_at,
      funding_closed_at
      `,
    )
    .eq("status", "published")
    .eq("asset_category", "fine_wine")
    .order("published_at", {
      ascending: false,
    });

  if (opportunityError) {
    console.error(
      "Fine-wine opportunities load error:",
      opportunityError,
    );

    throw new Error(
      "Unable to load fine-wine investment opportunities.",
    );
  }

  /*
   * --------------------------------------------------
   * 2. CREATE TEMPORARY COVER IMAGE URLS
   * --------------------------------------------------
   */

  const fineWineOpportunities: FineWineOpportunity[] =
    await Promise.all(
      (opportunityRows ?? []).map(
        async (opportunity) => {
          let coverImageUrl: string | null = null;

          if (opportunity.cover_image_path) {
            const {
              data,
              error: coverError,
            } = await admin.storage
              .from("investment-media")
              .createSignedUrl(
                opportunity.cover_image_path,
                60 * 30,
              );

            if (coverError) {
              console.error(
                `Fine-wine cover URL error for ${opportunity.id}:`,
                coverError,
              );
            }

            coverImageUrl =
              data?.signedUrl ?? null;
          }

          return {
            id: opportunity.id,
            slug: opportunity.slug,
            title: opportunity.title,

            short_description:
              opportunity.short_description,

            location:
              opportunity.location,

            asset_category:
              opportunity.asset_category,

            funding_target:
              Number(
                opportunity.funding_target,
              ),

            minimum_investment:
              Number(
                opportunity.minimum_investment,
              ),

            total_funded:
              Number(
                opportunity.total_funded,
              ),

            investor_count:
              Number(
                opportunity.investor_count,
              ),

            expected_duration_months:
              opportunity.expected_duration_months,

            target_return_min:
              opportunity.target_return_min != null
                ? Number(
                    opportunity.target_return_min,
                  )
                : null,

            target_return_max:
              opportunity.target_return_max != null
                ? Number(
                    opportunity.target_return_max,
                  )
                : null,

            target_return_note:
              opportunity.target_return_note,

            cover_image_path:
              opportunity.cover_image_path,

            coverImageUrl,

            published_at:
              opportunity.published_at,

            funding_closed_at:
              opportunity.funding_closed_at,
          };
        },
      ),
    );

  return (
    <main className="bg-ivory-100">
      {/* ==========================================
          HERO
      ========================================== */}

      <section className="relative flex min-h-180 items-end overflow-hidden bg-burgundy-900 pt-19 text-white lg:pt-22">
        <FineWineHeroImage className="absolute inset-0">
          <Image
            src="/images/hero/fine-wine-page-hero.jpg"
            alt="Fine-wine cellar representing the Tevuah Reserve collection experience"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </FineWineHeroImage>

        <FineWineHeroOverlay
          className="absolute inset-0 bg-linear-to-r from-burgundy-900 via-burgundy-900/84 to-burgundy-900/25"
          delay={0.04}
        />

        <FineWineHeroOverlay
          className="absolute inset-0 bg-linear-to-t from-burgundy-900/92 via-transparent to-burgundy-900/20"
          delay={0.1}
        />

        <Container className="relative z-10 pb-16 pt-24 lg:pb-20">
          <div className="max-w-5xl">
            <FineWineHeroReveal delay={0.1}>
              <div className="flex items-center gap-3">
                <FineWineHeroLine className="h-px w-10 origin-left bg-gold-400" />

                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
                  Fine-wine assets
                </p>
              </div>
            </FineWineHeroReveal>

            <FineWineHeroReveal delay={0.2}>
              <h1 className="font-display mt-7 max-w-5xl text-balance text-5xl leading-[0.94] font-medium tracking-[-0.045em] sm:text-6xl lg:text-8xl">
                Provenance, patience and
                professional custody.
              </h1>
            </FineWineHeroReveal>

            <FineWineHeroReveal delay={0.31}>
              <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
                Tevuah Reserve is designed to
                present fine-wine opportunities
                through careful sourcing,
                documented provenance, specialist
                storage and transparent portfolio
                reporting.
              </p>
            </FineWineHeroReveal>

            <FineWineHeroReveal delay={0.41}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button
                  href="#collection-experience"
                  size="lg"
                >
                  Explore the collection

                  <ArrowDown className="size-4" />
                </Button>

                <Button
                  href="#fine-wine-opportunities"
                  variant="outline"
                  size="lg"
                  className="border-white/25 text-white hover:bg-white/10 hover:text-white"
                >
                  View wine opportunities

                  <ArrowUpRight className="size-4" />
                </Button>
              </div>
            </FineWineHeroReveal>
          </div>

          <FineWineStagger className="mt-14 grid gap-6 border-t border-white/15 pt-7 sm:grid-cols-3">
            <FineWineStaggerItem>
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-white/40">
                  Selection
                </p>

                <p className="mt-2 text-sm font-semibold">
                  Carefully presented holdings
                </p>
              </div>
            </FineWineStaggerItem>

            <FineWineStaggerItem>
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-white/40">
                  Custody
                </p>

                <p className="mt-2 text-sm font-semibold">
                  Specialist storage
                </p>
              </div>
            </FineWineStaggerItem>

            <FineWineStaggerItem>
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-white/40">
                  Reporting
                </p>

                <p className="mt-2 text-sm font-semibold">
                  Portfolio-level visibility
                </p>
              </div>
            </FineWineStaggerItem>
          </FineWineStagger>
        </Container>
      </section>

      {/* ==========================================
          COLLECTION PRINCIPLES
      ========================================== */}

      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end lg:gap-20">
            <FineWineRevealSoft>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Collection principles
              </p>
            </FineWineRevealSoft>

            <FineWineReveal>
              <h2 className="font-display max-w-4xl text-4xl leading-none font-medium tracking-[-0.035em] text-burgundy-900 sm:text-5xl lg:text-6xl">
                Fine wine requires more than
                selecting a desirable bottle.
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-8 text-stone-700">
                The investment experience should
                make sourcing, provenance, custody,
                storage and reporting visible
                instead of presenting wine solely
                as a luxury object.
              </p>
            </FineWineReveal>
          </div>

          <FineWineStagger className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {winePrinciples.map(
              (principle, index) => (
                <FineWineStaggerItem
                  key={principle.id}
                  className="h-full"
                >
                  <WinePrincipleCard
                    principle={principle}
                    index={index}
                  />
                </FineWineStaggerItem>
              ),
            )}
          </FineWineStagger>
        </Container>
      </section>

      {/* ==========================================
          COLLECTION EXPERIENCE
      ========================================== */}

      <section
        id="collection-experience"
        className="overflow-hidden bg-burgundy-900 py-16 text-white sm:py-20 lg:py-24"
      >
        <Container>
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
            <FineWineReveal>
              <div className="flex items-center gap-3">
                <span className="h-px w-9 bg-gold-400" />

                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
                  Portfolio experience
                </p>
              </div>

              <h2 className="font-display mt-6 max-w-3xl text-balance text-4xl leading-none font-medium tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                See the collection as a portfolio,
                not simply a cellar.
              </h2>

              <p className="mt-7 max-w-xl text-base leading-8 text-white/60">
                The investor dashboard provides a
                structured foundation for
                presenting holdings, vintages,
                custody status, storage information
                and appropriately sourced
                wine-specific valuation reporting.
              </p>

              <FineWineRevealSoft delay={0.08}>
                <div className="mt-8 flex items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
                  <FileCheck2 className="mt-0.5 size-5 shrink-0 text-gold-400" />

                  <p className="text-sm leading-7 text-white/60">
                    Genuine valuations should
                    identify the source, valuation
                    date, methodology and any
                    material limitations.
                  </p>
                </div>
              </FineWineRevealSoft>
            </FineWineReveal>

            <FineWinePortfolioReveal className="relative">
              <div className="relative min-h-235 overflow-hidden rounded-4xl border border-white/10 bg-burgundy-800 shadow-[0_30px_100px_rgba(20,4,9,0.45)] sm:min-h-190">
                <Image
                  src="/images/wine/fine-wine-cellar-corridor.jpg"
                  alt="Fine-wine cellar portfolio interface"
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-linear-to-t from-burgundy-900 via-burgundy-900/75 to-burgundy-900/20" />

                <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-white/10 bg-burgundy-900/50 px-5 py-4 backdrop-blur-md sm:px-7">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-gold-500/15 text-gold-400">
                      <Wine className="size-4" />
                    </span>

                    <div>
                      <p className="text-sm font-semibold">
                        Fine-Wine Reserve
                      </p>

                      <p className="mt-0.5 text-[0.62rem] uppercase tracking-[0.14em] text-white/40">
                        Demonstration portfolio
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full border border-gold-400/25 bg-gold-400/10 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-gold-400">
                    Illustrative
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                  <FineWineStagger className="grid gap-4 sm:grid-cols-2">
                    {winePortfolioMetrics.map(
                      (metric) => (
                        <FineWineStaggerItem
                          key={metric.id}
                        >
                          <WinePortfolioMetricCard
                            metric={metric}
                          />
                        </FineWineStaggerItem>
                      ),
                    )}
                  </FineWineStagger>

                  <FineWineRevealSoft className="mt-5">
                    <WineHoldingsTable
                      holdings={
                        wineCollectionHoldings
                      }
                    />
                  </FineWineRevealSoft>
                </div>
              </div>
            </FineWinePortfolioReveal>
          </div>

          <FineWineRevealSoft>
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/4 px-6 py-5">
              <p className="text-xs leading-6 text-white/45">
                All holdings, producers, values
                and performance figures displayed
                here are fictitious demonstration
                content and are not investment
                recommendations or live portfolio
                data.
              </p>
            </div>
          </FineWineRevealSoft>
        </Container>
      </section>

      {/* ==========================================
          PROVENANCE
      ========================================== */}

      <section className="border-b border-burgundy-900/10 bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
            <FineWineImageReveal className="relative min-h-135 overflow-hidden rounded-4xl bg-burgundy-900">
              <Image
                src="/images/wine/fine-wine-provenance.jpg"
                alt="Fine-wine bottles representing provenance documentation"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-t from-burgundy-900/65 via-transparent to-transparent" />
            </FineWineImageReveal>

            <FineWineReveal>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Provenance
              </p>

              <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-burgundy-900 sm:text-5xl">
                Know what the collection contains
                and where it came from.
              </h2>

              <p className="mt-6 text-base leading-8 text-stone-700">
                Provenance information can include
                producer, vintage, acquisition
                records, storage history, bottle
                condition and authenticity
                documentation.
              </p>

              <FineWineStagger className="mt-8 space-y-4">
                {[
                  "Producer and vintage records",
                  "Acquisition history",
                  "Storage and custody trail",
                  "Condition and inspection notes",
                ].map((item) => (
                  <FineWineListItem
                    key={item}
                    className="flex items-center gap-3 text-sm font-medium text-burgundy-900"
                  >
                    <span className="flex size-7 items-center justify-center rounded-full bg-burgundy-900 text-gold-400">
                      <BadgeCheck className="size-3.5" />
                    </span>

                    {item}
                  </FineWineListItem>
                ))}
              </FineWineStagger>
            </FineWineReveal>
          </div>
        </Container>
      </section>

      {/* ==========================================
          STORAGE + CUSTODY
      ========================================== */}

      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
            <FineWineReveal>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Storage and custody
              </p>

              <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-burgundy-900 sm:text-5xl">
                Physical assets need physical
                protection.
              </h2>

              <p className="mt-6 text-base leading-8 text-stone-700">
                Fine wine can be damaged by
                unsuitable storage, mishandling or
                poor custody controls. Storage and
                ownership records therefore matter
                as much as the collection itself.
              </p>

              <FineWineStagger className="mt-8 grid gap-4 sm:grid-cols-2">
                {custodyPrinciples.map((item) => {
                  const Icon = item.icon;

                  return (
                    <FineWineStaggerItem
                      key={item.title}
                    >
                      <article className="h-full rounded-[1.25rem] border border-burgundy-900/10 bg-white p-5">
                        <Icon className="size-5 text-gold-600" />

                        <h3 className="mt-4 font-semibold text-burgundy-900">
                          {item.title}
                        </h3>

                        <p className="mt-2 text-xs leading-6 text-stone-600">
                          {item.description}
                        </p>
                      </article>
                    </FineWineStaggerItem>
                  );
                })}
              </FineWineStagger>
            </FineWineReveal>

            <FineWineImageReveal className="relative min-h-140 overflow-hidden rounded-4xl bg-burgundy-900">
              <Image
                src="/images/wine/fine-wine-storage.jpg"
                alt="Professional wine storage facility"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-t from-burgundy-900/55 via-transparent to-transparent" />
            </FineWineImageReveal>
          </div>
        </Container>
      </section>

      {/* ==========================================
          REGIONAL ALLOCATION
      ========================================== */}

      <section className="border-y border-burgundy-900/10 bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <FineWineReveal>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Regional allocation
              </p>

              <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-burgundy-900 sm:text-5xl">
                Understand where the collection is
                concentrated.
              </h2>

              <p className="mt-6 text-sm leading-7 text-stone-700">
                Geographic and producer
                concentration can affect portfolio
                behaviour, liquidity and exposure
                to market trends.
              </p>
            </FineWineReveal>

            <FineWineReveal delay={0.08}>
              <WineRegionAllocation
                regions={wineRegions}
              />
            </FineWineReveal>
          </div>
        </Container>
      </section>

      {/* ==========================================
          INVESTMENT RISKS
      ========================================== */}

      <section className="bg-burgundy-900 py-16 text-white sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
            <FineWineImageReveal className="relative min-h-125 overflow-hidden rounded-4xl border border-white/10">
              <Image
                src="/images/wine/fine-wine-bottle-detail.jpg"
                alt="Fine-wine bottles in specialist storage"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-t from-burgundy-900/70 via-transparent to-transparent" />
            </FineWineImageReveal>

            <FineWineReveal>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                Investment risks
              </p>

              <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] sm:text-5xl">
                Scarcity does not remove
                investment risk.
              </h2>

              <p className="mt-6 text-base leading-8 text-white/60">
                Fine-wine investing can involve
                significant uncertainty, long
                holding periods and specialist
                costs.
              </p>

              <FineWineStagger className="mt-8 space-y-4">
                {[
                  "Limited liquidity and uncertain resale timing",
                  "Storage, insurance and custody costs",
                  "Authenticity and provenance risk",
                  "Changing demand and market pricing",
                  "Physical damage or storage failure",
                  "Valuation uncertainty",
                ].map((risk) => (
                  <FineWineListItem
                    key={risk}
                    className="flex items-start gap-3 text-sm leading-7 text-white/70"
                  >
                    <ShieldCheck className="mt-1 size-4 shrink-0 text-gold-400" />

                    {risk}
                  </FineWineListItem>
                ))}
              </FineWineStagger>

              <FineWineRevealSoft delay={0.08}>
                <div className="mt-9 rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="text-xs leading-6 text-white/45">
                    No investment outcome, future
                    valuation or resale value
                    should be guaranteed. Genuine
                    offering materials must contain
                    project-specific risk
                    disclosures.
                  </p>
                </div>
              </FineWineRevealSoft>
            </FineWineReveal>
          </div>
        </Container>
      </section>

      {/* ==========================================
          LIVE FINE-WINE OPPORTUNITIES
      ========================================== */}

      <section
        id="fine-wine-opportunities"
        className="py-16 sm:py-20 lg:py-24"
      >
        <Container>
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <FineWineReveal>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Fine-wine opportunities
              </p>

              <h2 className="font-display mt-5 max-w-4xl text-4xl leading-none font-medium tracking-[-0.035em] text-burgundy-900 sm:text-5xl">
                Explore current fine-wine
                investment opportunities.
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-600">
                Published fine-wine opportunities
                created by Tevuah Reserve
                administrators appear here
                automatically and remain part of
                the main investment marketplace.
              </p>
            </FineWineReveal>

            <FineWineRevealSoft>
              <Button
                href="/investments"
                variant="secondary"
                size="lg"
                className="w-fit"
              >
                View all investments

                <ArrowUpRight className="size-4" />
              </Button>
            </FineWineRevealSoft>
          </div>

          {fineWineOpportunities.length > 0 ? (
            <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {fineWineOpportunities.map(
                (opportunity) => (
                  <FineWineStaggerItem
                    key={opportunity.id}
                    className="h-full"
                  >
                    <LiveFineWineOpportunityCard
                      opportunity={opportunity}
                    />
                  </FineWineStaggerItem>
                ),
              )}
            </div>
          ) : (
            <FineWineReveal>
              <div className="mt-10 rounded-[1.75rem] border border-burgundy-900/10 bg-white px-6 py-14 text-center sm:px-10">
                <BriefcaseBusiness className="mx-auto size-7 text-stone-300" />

                <h3 className="font-display mt-4 text-3xl font-semibold text-burgundy-900">
                  No fine-wine opportunities are
                  currently open.
                </h3>

                <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-stone-500">
                  Published opportunities with the
                  Fine Wine asset category will
                  automatically appear here.
                </p>

                <Link
                  href="/investments"
                  className="focus-ring mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-burgundy-900 px-5 text-sm font-semibold text-white transition hover:bg-burgundy-800"
                >
                  Explore all investments

                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </FineWineReveal>
          )}
        </Container>
      </section>

      {/* ==========================================
          FINAL CTA
      ========================================== */}

      <section className="bg-forest-950 py-16 text-white sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <FineWineReveal>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                Build the collection experience
              </p>

              <h2 className="font-display mt-5 max-w-4xl text-4xl leading-none font-medium tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                Bring provenance, custody and
                portfolio reporting into one
                investor experience.
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-8 text-white/60">
                Authenticated investors can review
                their investment positions,
                documents and transaction activity
                directly inside the Tevuah Reserve
                dashboard. Wine-specific valuation
                history should be presented when
                supported by appropriate valuation
                sources and reporting data.
              </p>
            </FineWineReveal>

            <FineWineRevealSoft
              className="flex flex-col gap-3 sm:flex-row lg:justify-end"
              delay={0.08}
            >
              <Button
                href="#fine-wine-opportunities"
                size="lg"
              >
                Explore wine investments
              </Button>
            </FineWineRevealSoft>
          </div>
        </Container>
      </section>
    </main>
  );
}

/*
 * ==================================================
 * LIVE OPPORTUNITY CARD
 * ==================================================
 */

function LiveFineWineOpportunityCard({
  opportunity,
}: {
  opportunity: FineWineOpportunity;
}) {
  const fundingTarget = Number(
    opportunity.funding_target,
  );

  const totalFunded = Number(
    opportunity.total_funded,
  );

  const progress =
    fundingTarget > 0
      ? Math.min(
          100,
          Math.round(
            (totalFunded / fundingTarget) *
              100,
          ),
        )
      : 0;

  /*
   * funding_closed_at is permanent once an offering
   * reaches its target. This prevents a later
   * redemption from visually reopening the offering.
   */

  const fullyFunded =
    Boolean(
      opportunity.funding_closed_at,
    ) ||
    (fundingTarget > 0 &&
      totalFunded >= fundingTarget);

  const opportunityHref =
    `/investments/${opportunity.slug}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-burgundy-900/10 bg-white shadow-[0_18px_60px_rgba(43,10,20,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(43,10,20,0.11)]">
      {/* IMAGE */}

      <Link
        href={opportunityHref}
        aria-label={`View ${opportunity.title}`}
        className="relative block h-64 overflow-hidden bg-burgundy-900"
      >
        {opportunity.coverImageUrl ? (
          <img
            src={
              opportunity.coverImageUrl
            }
            alt={opportunity.title}
            className="size-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-burgundy-900">
            <Wine className="size-10 text-white/20" />
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-burgundy-950/80 via-transparent to-burgundy-950/15" />

        <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-4">
          <span className="rounded-full border border-white/20 bg-burgundy-950/50 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-white backdrop-blur-md">
            Fine Wine
          </span>

          <span
            className={
              fullyFunded
                ? "rounded-full bg-white/90 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-burgundy-900"
                : "rounded-full bg-emerald-500/90 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-white"
            }
          >
            {fullyFunded
              ? "Fully Funded"
              : "Open"}
          </span>
        </div>

        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
          <div>
            {opportunity.location ? (
              <p className="text-sm font-medium text-white/80">
                {opportunity.location}
              </p>
            ) : (
              <p className="text-sm font-medium text-white/60">
                Fine-wine investment
              </p>
            )}
          </div>

          <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition group-hover:border-gold-400 group-hover:bg-gold-500 group-hover:text-forest-950">
            <ArrowUpRight className="size-5" />
          </span>
        </div>
      </Link>

      {/* CONTENT */}

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div>
          <h3 className="font-display text-[2rem] leading-[1.05] font-medium tracking-[-0.03em] text-burgundy-900">
            <Link
              href={opportunityHref}
              className="transition-colors hover:text-olive-700"
            >
              {opportunity.title}
            </Link>
          </h3>

          <p className="mt-4 line-clamp-3 text-sm leading-7 text-stone-700">
            {opportunity.short_description ??
              "Fine-wine investment opportunity available through Tevuah Reserve."}
          </p>
        </div>

        {/* FUNDING */}

        <div className="mt-7">
          <div className="flex items-center justify-between gap-4 text-xs">
            <span className="font-semibold text-burgundy-900">
              Funding progress
            </span>

            <span className="text-stone-500">
              {progress}%
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-burgundy-900/10">
            <FineWineProgress
              progress={progress}
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-4 text-xs text-stone-500">
            <span>
              {formatMoney(
                opportunity.total_funded,
              )}{" "}
              funded
            </span>

            <span>
              {formatMoney(
                opportunity.funding_target,
              )}{" "}
              target
            </span>
          </div>
        </div>

        {/* DATA */}

        <dl className="mt-7 grid grid-cols-2 gap-x-5 gap-y-5 border-y border-burgundy-900/10 py-6">
          <div className="flex gap-3">
            <WalletCards className="mt-0.5 size-4 shrink-0 text-gold-600" />

            <div>
              <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-500">
                Minimum
              </dt>

              <dd className="mt-1 text-sm font-semibold text-burgundy-900">
                {formatMoney(
                  opportunity.minimum_investment,
                )}
              </dd>
            </div>
          </div>

          <div className="flex gap-3">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-gold-600" />

            <div>
              <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-500">
                Duration
              </dt>

              <dd className="mt-1 text-sm font-semibold text-burgundy-900">
                {opportunity.expected_duration_months
                  ? `${opportunity.expected_duration_months} months`
                  : "See details"}
              </dd>
            </div>
          </div>

          <div className="col-span-2 flex gap-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold-600" />

            <div>
              <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-500">
                Target return
              </dt>

              <dd className="mt-1 text-sm font-semibold text-burgundy-900">
                {returnDisplay(
                  opportunity.target_return_min,
                  opportunity.target_return_max,
                )}
              </dd>

              {opportunity.target_return_note ? (
                <p className="mt-1 text-xs leading-5 text-stone-500">
                  {
                    opportunity.target_return_note
                  }
                </p>
              ) : null}
            </div>
          </div>
        </dl>

        {/* CTA */}

        <div className="mt-auto pt-6">
          <Link
            href={opportunityHref}
            className="focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-burgundy-900 px-5 text-sm font-semibold text-white transition hover:bg-burgundy-800"
          >
            View opportunity

            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

/*
 * ==================================================
 * FORMATTERS
 * ==================================================
 */

function formatMoney(
  cents: number,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    },
  ).format(
    Number(cents) / 100,
  );
}

function returnDisplay(
  minimum: number | null,
  maximum: number | null,
) {
  if (
    minimum != null &&
    maximum != null
  ) {
    return `${minimum}%–${maximum}%`;
  }

  if (minimum != null) {
    return `${minimum}% target`;
  }

  if (maximum != null) {
    return `Up to ${maximum}%`;
  }

  return "See details";
}