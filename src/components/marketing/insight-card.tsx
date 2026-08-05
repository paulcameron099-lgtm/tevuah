import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
} from "lucide-react";

import { formatArticleDate } from "@/src/lib/formatters";
import type { InsightArticle } from "@/src/types/insight";

type InsightCardProps = {
  article: InsightArticle;
  priority?: boolean;
};

export function InsightCard({
  article,
  priority = false,
}: InsightCardProps) {
  const articleHref = `/insights/${article.slug}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-forest-900/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(10,23,18,0.09)]">
      <Link
        href={articleHref}
        aria-label={`Read ${article.title}`}
        className="relative block aspect-16/10 overflow-hidden bg-forest-950"
      >
        <Image
          src={article.image}
          alt={article.title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
        />

        <div className="absolute inset-0 bg-linear-to-t from-forest-950/60 via-transparent to-transparent" />

        <span className="absolute left-5 top-5 rounded-full border border-white/20 bg-forest-950/45 px-3 py-1.5 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
          {article.category}
        </span>

        <span className="absolute bottom-5 right-5 flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition group-hover:border-gold-400 group-hover:bg-gold-500 group-hover:text-forest-950">
          <ArrowUpRight className="size-5" />
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-500">
          <time dateTime={article.publishedAt}>
            {formatArticleDate(article.publishedAt)}
          </time>

          <span
            aria-hidden="true"
            className="size-1 rounded-full bg-gold-600"
          />

          <span className="flex items-center gap-1.5">
            <Clock3 className="size-3.5" />
            {article.readingTime}
          </span>
        </div>

        <h3 className="font-display mt-5 text-3xl leading-[1.04] font-medium tracking-[-0.03em] text-forest-950">
          <Link
            href={articleHref}
            className="transition-colors hover:text-olive-700"
          >
            {article.title}
          </Link>
        </h3>

        <p className="mt-4 text-sm leading-7 text-stone-700">
          {article.excerpt}
        </p>

        <div className="mt-auto pt-7">
          <Link
            href={articleHref}
            className="focus-ring inline-flex items-center gap-2 rounded-md text-sm font-semibold text-forest-950 transition hover:text-olive-700"
          >
            Read insight
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}