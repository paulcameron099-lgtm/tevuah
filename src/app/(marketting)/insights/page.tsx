import type { Metadata } from "next";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Clock3,
} from "lucide-react";

import {
  InsightsHeroImage,
  InsightsHeroLine,
  InsightsHeroOverlay,
  InsightsHeroReveal,
  InsightsImageReveal,
  InsightsReveal,
  InsightsRevealSoft,
} from "@/src/components/insights/insights-motion";
import { InsightsExplorer } from "@/src/components/insights/insights-explorer";
import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import { insights } from "@/src/data/insights";
import { formatArticleDate } from "@/src/lib/formatters";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Explore Tevuah Reserve perspectives on vineyards, olive estates, AgTech, fine wine and private-asset investing.",
};

export default function InsightsPage() {
  const featuredArticle =
    insights.find(
      (article) => article.featured,
    ) ?? insights[0];

  const remainingArticles =
    insights.filter(
      (article) =>
        article.id !== featuredArticle.id,
    );

  return (
    <main className="bg-ivory-100">
      {/* ==========================================
          HERO
      ========================================== */}

      <section className="relative flex min-h-165 items-end overflow-hidden bg-forest-950 pt-19 text-white lg:pt-22">
        <InsightsHeroImage className="absolute inset-0">
          <Image
            src="/images/hero/insights-page-hero.jpg"
            alt="Cultivated landscape representing Tevuah Reserve insights"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </InsightsHeroImage>

        <InsightsHeroOverlay
          className="absolute inset-0 bg-linear-to-r from-forest-950 via-forest-950/82 to-forest-950/25"
          delay={0.04}
        />

        <InsightsHeroOverlay
          className="absolute inset-0 bg-linear-to-t from-forest-950/88 via-transparent to-forest-950/15"
          delay={0.1}
        />

        <Container className="relative z-10 pb-16 pt-24 lg:pb-20">
          <div className="max-w-5xl">
            <InsightsHeroReveal delay={0.1}>
              <div className="flex items-center gap-3">
                <InsightsHeroLine className="h-px w-10 origin-left bg-gold-400" />

                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
                  Insights
                </p>
              </div>
            </InsightsHeroReveal>

            <InsightsHeroReveal delay={0.2}>
              <h1 className="font-display mt-7 max-w-5xl text-balance text-5xl leading-[0.94] font-medium tracking-[-0.045em] sm:text-6xl lg:text-8xl">
                Perspectives from the field,
                cellar and investment process.
              </h1>
            </InsightsHeroReveal>

            <InsightsHeroReveal delay={0.31}>
              <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
                Explore educational content
                across productive agriculture,
                technology, fine wine and private
                investment considerations.
              </p>
            </InsightsHeroReveal>

            <InsightsHeroReveal delay={0.41}>
              <div className="mt-10">
                <Button
                  href="#editorial-library"
                  size="lg"
                >
                  Explore insights

                  <ArrowDown className="size-4" />
                </Button>
              </div>
            </InsightsHeroReveal>
          </div>
        </Container>
      </section>

      {/* ==========================================
          FEATURED ARTICLE
      ========================================== */}

      <section className="border-b border-forest-900/10 bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <InsightsReveal>
            <div className="mb-10 flex items-end justify-between gap-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Featured perspective
                </p>

                <h2 className="font-display mt-4 text-4xl font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                  From the Tevuah Reserve
                  editorial desk.
                </h2>
              </div>
            </div>
          </InsightsReveal>

          <article className="grid overflow-hidden rounded-4xl border border-forest-900/10 bg-ivory-100 lg:grid-cols-[1.15fr_0.85fr]">
            <InsightsImageReveal className="min-h-110 lg:min-h-155">
              <Link
                href={`/insights/${featuredArticle.slug}`}
                className="relative block h-full min-h-110 overflow-hidden lg:min-h-155"
              >
                <Image
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover transition duration-700 hover:scale-[1.03]"
                />

                <div className="absolute inset-0 bg-linear-to-t from-forest-950/50 via-transparent to-transparent" />
              </Link>
            </InsightsImageReveal>

            <InsightsReveal
              className="flex flex-col justify-center p-7 sm:p-10 lg:p-12"
              delay={0.08}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
                {featuredArticle.category}
              </p>

              <h3 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                {featuredArticle.title}
              </h3>

              <p className="mt-6 text-base leading-8 text-stone-700">
                {featuredArticle.excerpt}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-4 text-xs text-stone-500">
                <time
                  dateTime={
                    featuredArticle.publishedAt
                  }
                >
                  {formatArticleDate(
                    featuredArticle.publishedAt,
                  )}
                </time>

                <span className="size-1 rounded-full bg-gold-600" />

                <span className="flex items-center gap-1.5">
                  <Clock3 className="size-3.5" />

                  {featuredArticle.readingTime}
                </span>
              </div>

              <Button
                href={`/insights/${featuredArticle.slug}`}
                variant="secondary"
                size="lg"
                className="mt-9 w-fit"
              >
                Read featured insight

                <ArrowUpRight className="size-4" />
              </Button>
            </InsightsReveal>
          </article>
        </Container>
      </section>

      {/* ==========================================
          EDITORIAL LIBRARY
      ========================================== */}

      <section
        id="editorial-library"
        className="py-16 sm:py-20 lg:py-24"
      >
        <Container>
          <div className="mb-12 grid gap-7 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <InsightsReveal>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Editorial library
                </p>

                <h2 className="font-display mt-5 max-w-4xl text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl lg:text-6xl">
                  Explore the subjects behind the
                  assets.
                </h2>
              </div>
            </InsightsReveal>

            <InsightsRevealSoft
              className="lg:justify-self-end"
              delay={0.08}
            >
              <p className="max-w-xl text-sm leading-7 text-stone-700">
                Search and filter the Tevuah
                Reserve educational library by
                asset category or topic.
              </p>
            </InsightsRevealSoft>
          </div>

          {/*
           * InsightsExplorer owns its interactive
           * filtering/search state. We animate the
           * complete explorer from outside rather
           * than interfering with its children.
           */}

          <InsightsReveal>
            <InsightsExplorer
              articles={remainingArticles}
            />
          </InsightsReveal>
        </Container>
      </section>

      {/* ==========================================
          EDITORIAL STANDARD
      ========================================== */}

      <section className="border-y border-forest-900/10 bg-white py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
            <InsightsRevealSoft>
              <div className="flex size-16 items-center justify-center rounded-full bg-forest-950 text-gold-400">
                <BookOpen className="size-7" />
              </div>
            </InsightsRevealSoft>

            <InsightsReveal delay={0.06}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Editorial standard
                </p>

                <h2 className="font-display mt-5 text-4xl font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                  Education should explain
                  uncertainty, not hide it.
                </h2>

                <p className="mt-6 max-w-3xl text-base leading-8 text-stone-700">
                  Genuine Tevuah Reserve
                  editorial content should
                  distinguish facts, analysis and
                  opinion, cite reliable sources
                  where appropriate, and avoid
                  presenting educational material
                  as personalised investment
                  advice.
                </p>
              </div>
            </InsightsReveal>
          </div>
        </Container>
      </section>
    </main>
  );
}