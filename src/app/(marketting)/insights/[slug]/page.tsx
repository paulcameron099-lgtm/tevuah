import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock3,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import {
  featuredInsights,
  getInsightBySlug,
} from "@/src/data/insights";
import { formatArticleDate } from "@/src/lib/formatters";

type InsightPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return featuredInsights.map((article) => ({
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

  return (
    <main className="bg-ivory-100 pt-19 lg:pt-22">
      <section className="py-14 sm:py-20 lg:py-24">
        <Container>
         <Button
            href="/insights"
            variant="outline"
            size="sm"
            className="mb-10 w-fit border-forest-900/15 bg-white px-5 text-forest-950 hover:border-forest-900/25 hover:bg-ivory-50 hover:text-forest-950"
            >
            <ArrowLeft className="size-4 shrink-0" />
            <span>All insights</span>
        </Button>

          <div className="max-w-5xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
              {article.category}
            </p>

            <h1 className="font-display mt-6 text-balance text-4xl leading-[0.98] font-medium tracking-[-0.04em] text-forest-950 sm:text-6xl lg:text-8xl">
              {article.title}
            </h1>

            <p className="mt-8 max-w-3xl text-lg leading-8 text-stone-700">
              {article.excerpt}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-stone-500">
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
            </div>
          </div>
        </Container>
      </section>

     <Container>
    <div className="relative aspect-4/3 overflow-hidden rounded-3xl bg-forest-950 sm:aspect-16/10 sm:rounded-4xl lg:aspect-16/8">
        <Image
        src={article.image}
        alt={article.title}
        fill
        priority
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 1400px"
        className="object-cover object-[center_45%] sm:object-center"
        />

        <div className="absolute inset-0 bg-linear-to-t from-forest-950/30 to-transparent" />
    </div>
    </Container>

      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.5fr] lg:gap-20">
            <aside>
              <div className="sticky top-32 rounded-2xl border border-forest-900/10 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
                  Educational content
                </p>

                <p className="mt-4 text-xs leading-6 text-stone-600">
                  This demonstration article is not personalised investment,
                  legal or tax advice. Genuine editorial content should cite
                  reliable sources and clearly separate facts, analysis and
                  opinion.
                </p>
              </div>
            </aside>

            <article className="max-w-3xl">
              <p className="font-display text-3xl leading-[1.3] text-forest-950">
                This article template is ready for the complete Tevuah Reserve
                editorial system.
              </p>

              <p className="mt-8 text-base leading-8 text-stone-700">
                The final article will contain researched content, supporting
                sources, section headings, visual examples and relevant risk
                or educational notes. Content can later be managed through
                Supabase or a dedicated content-management system.
              </p>

              <h2 className="font-display mt-12 text-4xl font-medium tracking-[-0.03em] text-forest-950">
                What this article will cover
              </h2>

              <p className="mt-6 text-base leading-8 text-stone-700">
                Each insight should help readers understand how cultivated
                assets operate, which factors influence performance, where
                risks may arise and what information should be reviewed before
                making an investment decision.
              </p>

              {/* <div className="mt-10 rounded-2xl border border-gold-500/25 bg-gold-500/5 p-6">
                <p className="text-sm leading-7 text-stone-700">
                  The text currently shown is development content. It should be
                  replaced with properly reviewed editorial material before
                  production launch.
                </p>
              </div> */}
            </article>
          </div>
        </Container>
      </section>
    </main>
  );
}