import type { Metadata } from "next";

import Image from "next/image";

import { notFound } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { OpportunityStatusBadge } from "@/src/components/marketing/opportunity-status";
import { AssumptionGrid } from "@/src/components/opportunities/assumption-grid";
import {
  OpportunityDetailHeroImage,
  OpportunityDetailHeroOverlay,
  OpportunityDetailHeroReveal,
  OpportunityDetailImageReveal,
  OpportunityDetailListItem,
  OpportunityDetailReveal,
  OpportunityDetailRevealSoft,
  OpportunityDetailStagger,
  OpportunityDetailStaggerItem,
} from "@/src/components/opportunities/opportunity-detail-motion";
import { OpportunityDocuments } from "@/src/components/opportunities/opportunity-documents";
import { OpportunityFaqs } from "@/src/components/opportunities/opportunity-faqs";
import { OpportunityNavigation } from "@/src/components/opportunities/opportunity-navigation";
import { OpportunityRisks } from "@/src/components/opportunities/opportunity-risks";
import { OpportunitySection } from "@/src/components/opportunities/opportunity-section";
import { ProjectTimeline } from "@/src/components/opportunities/project-timeline";
import { UseOfFunds } from "@/src/components/opportunities/use-of-funds";
import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import { getOpportunityDetail } from "@/src/data/opportunity-details";
import {
  getOpportunityBySlug,
  opportunities,
} from "@/src/data/opportunities";
import {
  formatArticleDate,
  formatCurrency,
} from "@/src/lib/formatters";

type OpportunityPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return opportunities.map((opportunity) => ({
    slug: opportunity.slug,
  }));
}

export async function generateMetadata({
  params,
}: OpportunityPageProps): Promise<Metadata> {
  const { slug } = await params;

  const opportunity =
    getOpportunityBySlug(slug);

  if (!opportunity) {
    return {
      title: "Opportunity not found",
    };
  }

  return {
    title: opportunity.title,
    description: opportunity.summary,

    openGraph: {
      title: opportunity.title,
      description: opportunity.summary,

      images: [
        {
          url: opportunity.image,
          alt: opportunity.title,
        },
      ],
    },
  };
}

export default async function OpportunityPage({
  params,
}: OpportunityPageProps) {
  const { slug } = await params;

  const opportunity =
    getOpportunityBySlug(slug);

  if (!opportunity) {
    notFound();
  }

  const detail =
    getOpportunityDetail(opportunity);

  return (
    <main className="bg-ivory-100 pt-19 lg:pt-22">
      {/* ==========================================
          HERO
      ========================================== */}

      <section className="relative min-h-170 overflow-hidden bg-forest-950 text-white">
        <OpportunityDetailHeroImage className="absolute inset-0">
          <Image
            src={opportunity.image}
            alt={`${opportunity.title} illustrative imagery`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </OpportunityDetailHeroImage>

        <OpportunityDetailHeroOverlay
          className="absolute inset-0 bg-linear-to-r from-forest-950 via-forest-950/82 to-forest-950/25"
          delay={0.04}
        />

        <OpportunityDetailHeroOverlay
          className="absolute inset-0 bg-linear-to-t from-forest-950/90 via-transparent to-forest-950/20"
          delay={0.1}
        />

        <Container className="relative z-10 flex min-h-170 flex-col justify-end py-14 sm:py-18 lg:py-20">
          <OpportunityDetailHeroReveal delay={0.08}>
            <Button
              href="/investments"
              variant="outline"
              size="sm"
              className="mb-10 w-fit border-white/25 bg-forest-950/20 text-white hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="size-4 shrink-0" />

              <span>All opportunities</span>
            </Button>
          </OpportunityDetailHeroReveal>

          <OpportunityDetailHeroReveal delay={0.16}>
            <div className="flex flex-wrap items-center gap-3">
              <OpportunityStatusBadge
                status={opportunity.status}
              />

              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
                Illustrative opportunity
              </span>
            </div>
          </OpportunityDetailHeroReveal>

          <OpportunityDetailHeroReveal delay={0.24}>
            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
              {opportunity.categoryLabel}
            </p>
          </OpportunityDetailHeroReveal>

          <OpportunityDetailHeroReveal delay={0.32}>
            <h1 className="font-display mt-5 max-w-5xl text-balance text-5xl leading-[0.94] font-medium tracking-[-0.045em] sm:text-6xl lg:text-8xl">
              {opportunity.title}
            </h1>
          </OpportunityDetailHeroReveal>

          <OpportunityDetailHeroReveal delay={0.42}>
            <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-white/75">
              <span className="flex items-center gap-2">
                <MapPin className="size-4 text-gold-400" />

                {opportunity.location}
              </span>

              <span className="flex items-center gap-2">
                <CalendarDays className="size-4 text-gold-400" />

                {opportunity.duration}
              </span>

              <span className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-gold-400" />

                {opportunity.riskLevel}{" "}
                illustrative risk
              </span>
            </div>
          </OpportunityDetailHeroReveal>
        </Container>
      </section>

      {/* ==========================================
          NAVIGATION
      ========================================== */}

      <OpportunityNavigation />

      {/* ==========================================
          DETAIL CONTENT
      ========================================== */}

      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-16">
          <div className="min-w-0">
            {/* =====================================
                OVERVIEW
            ===================================== */}

            <OpportunitySection
              id="overview"
              eyebrow="Opportunity overview"
              title="Understanding the asset and investment thesis."
              description={
                detail.assetDescription
              }
            >
              <div className="grid gap-8">
                <OpportunityDetailStagger className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {detail.metrics.map(
                    (metric) => (
                      <OpportunityDetailStaggerItem
                        key={metric.label}
                        className="h-full"
                      >
                        <article className="h-full rounded-[1.25rem] border border-forest-900/10 bg-white p-5">
                          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-stone-500">
                            {metric.label}
                          </p>

                          <p className="font-display mt-3 text-2xl font-semibold text-forest-950">
                            {metric.value}
                          </p>

                          {metric.description ? (
                            <p className="mt-2 text-xs leading-5 text-stone-500">
                              {
                                metric.description
                              }
                            </p>
                          ) : null}
                        </article>
                      </OpportunityDetailStaggerItem>
                    ),
                  )}
                </OpportunityDetailStagger>

                <OpportunityDetailReveal>
                  <div className="rounded-3xl bg-forest-950 p-6 text-white sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
                      Investment thesis
                    </p>

                    <OpportunityDetailStagger className="mt-6 space-y-5">
                      {detail.thesis.map(
                        (item) => (
                          <OpportunityDetailListItem
                            key={item}
                            className="flex items-start gap-4 text-sm leading-7 text-white/70"
                          >
                            <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-white/10">
                              <Check className="size-3.5 text-gold-400" />
                            </span>

                            <span>{item}</span>
                          </OpportunityDetailListItem>
                        ),
                      )}
                    </OpportunityDetailStagger>
                  </div>
                </OpportunityDetailReveal>
              </div>
            </OpportunitySection>

            {/* =====================================
                FINANCIALS
            ===================================== */}

            <OpportunitySection
              id="financials"
              eyebrow="Financial presentation"
              title="How illustrative capital could be allocated."
              description="These values are demonstration assumptions rather than audited forecasts or live offering terms."
            >
              <div className="grid gap-10">
                <OpportunityDetailReveal>
                  <UseOfFunds
                    items={detail.useOfFunds}
                    currency={
                      opportunity.currency
                    }
                  />
                </OpportunityDetailReveal>

                <OpportunityDetailReveal>
                  <div>
                    <h3 className="font-display mb-6 text-3xl font-semibold text-forest-950">
                      Financial assumptions
                    </h3>

                    <AssumptionGrid
                      assumptions={
                        detail.financialAssumptions
                      }
                    />
                  </div>
                </OpportunityDetailReveal>

                <OpportunityDetailReveal>
                  <div>
                    <h3 className="font-display mb-6 text-3xl font-semibold text-forest-950">
                      Illustrative fee structure
                    </h3>

                    <AssumptionGrid
                      assumptions={detail.fees}
                    />
                  </div>
                </OpportunityDetailReveal>
              </div>
            </OpportunitySection>

            {/* =====================================
                TIMELINE
            ===================================== */}

            <OpportunitySection
              id="timeline"
              eyebrow="Project timeline"
              title="A long-term programme with visible milestones."
              description="Actual project dates may change because of funding, approvals, weather, procurement and operating conditions."
            >
              <OpportunityDetailReveal>
                <ProjectTimeline
                  milestones={detail.timeline}
                />
              </OpportunityDetailReveal>
            </OpportunitySection>

            {/* =====================================
                OPERATOR
            ===================================== */}

            <OpportunitySection
              id="operator"
              eyebrow="Operating partner"
              title="The team responsible for asset operations."
            >
              <OpportunityDetailReveal>
                <div className="grid overflow-hidden rounded-3xl border border-forest-900/10 bg-white md:grid-cols-[0.8fr_1.2fr]">
                  <OpportunityDetailImageReveal className="relative min-h-85">
                    <Image
                      src={detail.operator.image}
                      alt={`${detail.operator.name} illustrative operator`}
                      fill
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className="object-cover"
                    />

                    <div className="absolute inset-0 bg-linear-to-t from-forest-950/55 to-transparent" />
                  </OpportunityDetailImageReveal>

                  <div className="p-6 sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
                      {detail.operator.role}
                    </p>

                    <h3 className="font-display mt-4 text-4xl font-semibold text-forest-950">
                      {detail.operator.name}
                    </h3>

                    <p className="mt-3 flex items-center gap-2 text-sm text-stone-500">
                      <MapPin className="size-4" />

                      {
                        detail.operator
                          .location
                      }
                    </p>

                    <p className="mt-6 text-sm leading-7 text-stone-700">
                      {
                        detail.operator
                          .description
                      }
                    </p>

                    <OpportunityDetailStagger className="mt-8 grid grid-cols-2 gap-5 border-t border-forest-900/10 pt-6">
                      <OpportunityDetailStaggerItem>
                        <div>
                          <p className="text-[0.65rem] uppercase tracking-[0.14em] text-stone-500">
                            Experience
                          </p>

                          <p className="mt-2 font-semibold text-forest-950">
                            {
                              detail.operator
                                .experience
                            }
                          </p>
                        </div>
                      </OpportunityDetailStaggerItem>

                      <OpportunityDetailStaggerItem>
                        <div>
                          <p className="text-[0.65rem] uppercase tracking-[0.14em] text-stone-500">
                            Estates managed
                          </p>

                          <p className="mt-2 font-semibold text-forest-950">
                            {
                              detail.operator
                                .estatesManaged
                            }
                          </p>
                        </div>
                      </OpportunityDetailStaggerItem>
                    </OpportunityDetailStagger>
                  </div>
                </div>
              </OpportunityDetailReveal>
            </OpportunitySection>

            {/* =====================================
                DOCUMENTS
            ===================================== */}

            <OpportunitySection
              id="documents"
              eyebrow="Opportunity documents"
              title="Review supporting information."
              description="Sensitive investment documents are made available through approved investor access and appropriate platform controls."
            >
              <OpportunityDetailReveal>
                <OpportunityDocuments
                  documents={detail.documents}
                />
              </OpportunityDetailReveal>
            </OpportunitySection>

            {/* =====================================
                RISKS
            ===================================== */}

            <OpportunitySection
              id="risks"
              eyebrow="Risk factors"
              title="Understand what could affect the investment."
              description="This list is illustrative and not exhaustive. Genuine offering documents must disclose all material project-specific risks."
            >
              <OpportunityDetailReveal>
                <OpportunityRisks
                  risks={detail.risks}
                />
              </OpportunityDetailReveal>
            </OpportunitySection>

            {/* =====================================
                UPDATES
            ===================================== */}

            <OpportunitySection
              id="updates"
              eyebrow="Project updates"
              title="Follow the opportunity over time."
            >
              <OpportunityDetailStagger className="space-y-5">
                {detail.updates.map(
                  (update) => (
                    <OpportunityDetailStaggerItem
                      key={update.id}
                    >
                      <article className="rounded-[1.25rem] border border-forest-900/10 bg-white p-6">
                        <time
                          dateTime={
                            update.date
                          }
                          className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600"
                        >
                          {formatArticleDate(
                            update.date,
                          )}
                        </time>

                        <h3 className="font-display mt-3 text-2xl font-semibold text-forest-950">
                          {update.title}
                        </h3>

                        <p className="mt-3 text-sm leading-7 text-stone-700">
                          {
                            update.description
                          }
                        </p>
                      </article>
                    </OpportunityDetailStaggerItem>
                  ),
                )}
              </OpportunityDetailStagger>
            </OpportunitySection>

            {/* =====================================
                FAQ
            ===================================== */}

            <OpportunitySection
              id="faqs"
              eyebrow="Frequently asked questions"
              title="Important information before registering interest."
            >
              <OpportunityDetailReveal>
                <OpportunityFaqs
                  faqs={detail.faqs}
                />
              </OpportunityDetailReveal>
            </OpportunitySection>
          </div>
        </div>
      </Container>

      {/* ==========================================
          MOBILE INVESTMENT BAR
      ========================================== */}

      <OpportunityDetailRevealSoft className="sticky bottom-0 z-30 lg:hidden">
        <div className="border-t border-forest-900/10 bg-white/95 p-4 backdrop-blur-xl">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.12em] text-stone-500">
                Minimum investment
              </p>

              <p className="mt-1 text-sm font-semibold text-forest-950">
                {formatCurrency(
                  opportunity.minimumInvestment,
                  opportunity.currency,
                )}
              </p>
            </div>
          </div>
        </div>
      </OpportunityDetailRevealSoft>
    </main>
  );
}