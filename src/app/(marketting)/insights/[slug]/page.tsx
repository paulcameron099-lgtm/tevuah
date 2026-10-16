
import type { Metadata } from "next";

import Image from "next/image";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import { notFound } from "next/navigation";

import {
  InsightsArticleHero,
  InsightsArticleImage,
  InsightsArticleSection,
  InsightsListItem,
  InsightsRevealSoft,
  InsightsStagger,
  InsightsTakeawayCard,
} from "@/src/components/insights/insights-motion";

import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";

import {
  getInsightBySlug,
  insights,
} from "@/src/data/insights";

import { formatArticleDate } from "@/src/lib/formatters";

type InsightPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const questionSectionHeadings = new Set([
  "What investors should look for",
  "Questions to consider before investing",
]);

export function generateStaticParams() {
  return insights.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: InsightPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getInsightBySlug(slug);

  if (!article) {
    return {
      title: "Insight not found",
    };
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [
        {
          url: article.image,
          alt: article.title,
        },
      ],
    },
  };
}

export default async function InsightPage({
  params,
}: InsightPageProps) {
  const { slug } = await params;
  const article = getInsightBySlug(slug);

  if (!article) {
    notFound();
  }

  const isInvestorEducation =
    article.slug ===
    "understanding-illiquidity-in-private-assets";

  return (
    <main className="bg-ivory-100 pt-19 lg:pt-22">
      {/* ARTICLE HEADER */}

      <section className="py-12 sm:py-16 lg:py-20">
        <Container>
          <InsightsArticleHero delay={0.05}>
            <Button
              href="/insights"
              variant="outline"
              size="sm"
              className="mb-10 w-fit border-forest-900/15 bg-white px-5 text-forest-950 hover:border-forest-900/25 hover:bg-ivory-50 hover:text-forest-950"
            >
              <ArrowLeft className="size-4 shrink-0" />
              <span>All insights</span>
            </Button>
          </InsightsArticleHero>

          <div className="max-w-5xl">
            <InsightsArticleHero delay={0.12}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                {article.category}
              </p>
            </InsightsArticleHero>

            <InsightsArticleHero delay={0.2}>
              <h1 className="font-display mt-6 text-balance text-4xl leading-[0.98] font-medium tracking-[-0.04em] text-forest-950 sm:text-6xl lg:text-8xl">
                {article.title}
              </h1>
            </InsightsArticleHero>

            <InsightsArticleHero delay={0.3}>
              <p className="mt-8 max-w-3xl text-base leading-8 text-stone-700 sm:text-lg">
                {article.excerpt}
              </p>
            </InsightsArticleHero>

            <InsightsArticleHero delay={0.4}>
              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm text-stone-500">
                <time dateTime={article.publishedAt}>
                  {formatArticleDate(article.publishedAt)}
                </time>

                <span
                  aria-hidden="true"
                  className="size-1 rounded-full bg-gold-600"
                />

                <span className="flex items-center gap-2">
                  <Clock3 className="size-4" />
                  {article.readingTime}
                </span>

                <span
                  aria-hidden="true"
                  className="size-1 rounded-full bg-gold-600"
                />

                <span>{article.author}</span>
              </div>
            </InsightsArticleHero>
          </div>
        </Container>
      </section>

      {/* ARTICLE IMAGE */}

      <Container>
        <InsightsArticleImage className="relative aspect-4/3 overflow-hidden rounded-3xl bg-forest-950 sm:aspect-16/10 sm:rounded-4xl lg:aspect-16/8">
          <Image
            src={article.image}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 1400px"
            className="object-cover object-center"
          />

          <div className="absolute inset-0 bg-linear-to-t from-forest-950/30 to-transparent" />
        </InsightsArticleImage>
      </Container>

      {/* ARTICLE BODY */}

      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[280px_minmax(0,760px)] lg:justify-center lg:gap-16">
            {/* SIDEBAR */}

            <aside>
              <div className="sticky top-32 space-y-5">
                <InsightsRevealSoft>
                  <div className="rounded-3xl border border-forest-900/10 bg-white p-6">
                    <div className="flex size-10 items-center justify-center rounded-full bg-forest-950 text-gold-400">
                      <BookOpen className="size-4" />
                    </div>

                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
                      About this article
                    </p>

                    <p className="mt-4 text-xs leading-6 text-stone-600">
                      Written by {article.author}.
                    </p>

                    <p className="mt-2 text-xs leading-6 text-stone-600">
                      {article.authorRole}
                    </p>
                  </div>
                </InsightsRevealSoft>

                <InsightsRevealSoft delay={0.07}>
                  <div className="rounded-3xl border border-gold-500/25 bg-gold-500/5 p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
                      Educational content
                    </p>

                    <p className="mt-3 text-xs leading-6 text-stone-600">
                      This content is for general
                      information and education. It
                      should not be treated as
                      personalised financial,
                      legal or tax advice.
                    </p>
                  </div>
                </InsightsRevealSoft>
              </div>
            </aside>

            {/* ARTICLE */}

            <article className="min-w-0">
              <InsightsArticleSection>
                <p className="font-display text-3xl leading-[1.32] text-forest-950 sm:text-4xl">
                  {article.introduction}
                </p>
              </InsightsArticleSection>

              <div className="mt-12 space-y-12">
                {article.sections.map((section, index) => {
                  const isQuestionSection =
                    questionSectionHeadings.has(
                      section.heading ?? "",
                    );

                  const hasQuestionList =
                    isQuestionSection &&
                    section.paragraphs.length >= 3;

                  const openingParagraph =
                    hasQuestionList
                      ? section.paragraphs[0]
                      : null;

                  const closingParagraph =
                    hasQuestionList
                      ? section.paragraphs[
                          section.paragraphs.length - 1
                        ]
                      : null;

                  const listItems =
                    hasQuestionList
                      ? section.paragraphs.slice(1, -1)
                      : [];

                  return (
                    <InsightsArticleSection
                      key={`${article.id}-${index}`}
                    >
                      {section.heading ? (
                        <h2 className="font-display text-3xl font-medium tracking-[-0.03em] text-forest-950 sm:text-4xl">
                          {section.heading}
                        </h2>
                      ) : null}

                      {hasQuestionList ? (
                        <div className="mt-6 space-y-6">
                          <p className="text-base leading-8 text-stone-700">
                            {openingParagraph}
                          </p>

                          <ul className="space-y-4 pl-1">
                            {listItems.map((item) => (
                              <li
                                key={item}
                                className="flex items-start gap-4 text-base leading-8 text-stone-700"
                              >
                                <span
                                  aria-hidden="true"
                                  className="mt-3 size-1.5 shrink-0 rounded-full bg-gold-600"
                                />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>

                          <p className="text-base leading-8 text-stone-700">
                            {closingParagraph}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-6 space-y-6">
                          {section.paragraphs.map(
                            (paragraph) => (
                              <p
                                key={paragraph}
                                className="text-base leading-8 text-stone-700"
                              >
                                {paragraph}
                              </p>
                            ),
                          )}
                        </div>
                      )}
                    </InsightsArticleSection>
                  );
                })}
              </div>

              {/* KEY TAKEAWAYS */}

              <InsightsTakeawayCard className="mt-14 rounded-[1.75rem] bg-forest-950 p-7 text-white sm:p-9">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
                  Key takeaways
                </p>

                <InsightsStagger className="mt-6 space-y-4">
                  {article.keyTakeaways.map(
                    (takeaway) => (
                      <InsightsListItem
                        key={takeaway}
                        className="flex items-start gap-3 text-sm leading-7 text-white/70"
                      >
                        <CheckCircle2 className="mt-1 size-4 shrink-0 text-gold-400" />
                        <span>{takeaway}</span>
                      </InsightsListItem>
                    ),
                  )}
                </InsightsStagger>
              </InsightsTakeawayCard>

              {/* INVESTOR EDUCATION CTA */}

              {isInvestorEducation ? (
                <InsightsRevealSoft>
                  <div className="mt-12 rounded-3xl border border-forest-900/10 bg-white p-7 sm:p-9">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
                      Explore further
                    </p>

                    <h2 className="font-display mt-4 text-3xl font-medium tracking-[-0.03em] text-forest-950 sm:text-4xl">
                      Continue your investment research
                    </h2>

                    <p className="mt-5 max-w-xl text-base leading-8 text-stone-700">
                      Review available opportunities,
                      their investment terms and
                      supporting information, or
                      contact Tevuah Reserve with
                      questions about the platform.
                    </p>

                    <div className="mt-10 flex flex-wrap gap-3">
                      <Button
                        href="/investments"
                        size="sm"
                      >
                        Review investment opportunities
                      </Button>

                      <Button
                        href="/contact"
                        variant="outline"
                        size="sm"
                      >
                        Speak with Tevuah Reserve
                      </Button>
                    </div>
                  </div>
                </InsightsRevealSoft>
              ) : null}

              {/* EDITORIAL NOTICE */}

              <InsightsRevealSoft>
                <div className="mt-12 border-t border-forest-900/10 pt-8">
                  <p className="text-xs leading-6 text-stone-500">
                    Published for general educational
                    purposes. Information may change
                    over time and should be considered
                    alongside the relevant investment
                    documentation and risk disclosures.
                  </p>
                </div>
              </InsightsRevealSoft>
            </article>
          </div>
        </Container>
      </section>
    </main>
  );
}
