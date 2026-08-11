import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Clock3,
} from "lucide-react";

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
    insights.find((article) => article.featured) ??
    insights[0];

  const remainingArticles = insights.filter(
    (article) =>
      article.id !== featuredArticle.id,
  );

  return (
    <main className="bg-ivory-100">
      <section className="relative flex min-h-165src/ items-end overflow-hidden bg-forest-950 pt-19 text-white lg:pt-22">
        <Image
          src="/images/hero/insights-page-hero.jpg"
          alt="Cultivated landscape representing Tevuah Reserve insights"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-linear-to-r from-forest-950 via-forest-950/82 to-forest-950/25" />
        <div className="absolute inset-0 bg-linear-to-t from-forest-950/88 via-transparent to-forest-950/15" />

        <Container className="relative z-10 pb-16 pt-24 lg:pb-20">
          <div className="max-w-5xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-gold-400" />

              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
                Insights
              </p>
            </div>

            <h1 className="font-display mt-7 max-w-5xl text-balance text-5xl leading-[0.94] font-medium tracking-[-0.045em] sm:text-6xl lg:text-8xl">
              Perspectives from the field, cellar and investment process.
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
              Explore educational content across productive
              agriculture, technology, fine wine and private
              investment considerations.
            </p>

            <div className="mt-10">
              <Button href="#editorial-library" size="lg">
                Explore insights
                <ArrowDown className="size-4" />
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-forest-900/10 bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="mb-10 flex items-end justify-between gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Featured perspective
              </p>

              <h2 className="font-display mt-4 text-4xl font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                From the Tevuah Reserve editorial desk.
              </h2>
            </div>
          </div>

          <article className="grid overflow-hidden rounded-4xl border border-forest-900/10 bg-ivory-100 lg:grid-cols-[1.15fr_0.85fr]">
            <Link
              href={`/insights/${featuredArticle.slug}`}
              className="relative min-h-110 overflow-hidden lg:min-h-155"
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

            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
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
            </div>
          </article>
        </Container>
      </section>

      <section
        id="editorial-library"
        className="py-16 sm:py-20 lg:py-24"
      >
        <Container>
          <div className="mb-12 grid gap-7 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Editorial library
              </p>

              <h2 className="font-display mt-5 max-w-4xl text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl lg:text-6xl">
                Explore the subjects behind the assets.
              </h2>
            </div>

            <p className="max-w-xl text-sm leading-7 text-stone-700 lg:justify-self-end">
              Search and filter the Tevuah Reserve
              educational library by asset category or topic.
            </p>
          </div>

          <InsightsExplorer
            articles={remainingArticles}
          />
        </Container>
      </section>

      <section className="border-y border-forest-900/10 bg-white py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
            <div className="flex size-16 items-center justify-center rounded-full bg-forest-950 text-gold-400">
              <BookOpen className="size-7" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Editorial standard
              </p>

              <h2 className="font-display mt-5 text-4xl font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                Education should explain uncertainty, not hide it.
              </h2>

              <p className="mt-6 max-w-3xl text-base leading-8 text-stone-700">
                Genuine Tevuah Reserve editorial content
                should distinguish facts, analysis and opinion,
                cite reliable sources where appropriate, and
                avoid presenting educational material as
                personalised investment advice.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}