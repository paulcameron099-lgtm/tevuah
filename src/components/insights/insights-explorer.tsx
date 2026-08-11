"use client";

import {
  Search,
  X,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

import { InsightCard } from "@/src/components/marketing/insight-card";
import {
  insightCategoryOptions,
  type InsightCategoryFilter,
} from "@/src/config/insight-filters";
import { cn } from "@/src/lib/utils";
import type { InsightArticle } from "@/src/types/insight";

type InsightsExplorerProps = {
  articles: InsightArticle[];
};

export function InsightsExplorer({
  articles,
}: InsightsExplorerProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState<InsightCategoryFilter>("All");

  const filteredArticles = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return articles.filter((article) => {
      const matchesCategory =
        category === "All" ||
        article.category === category;

      const matchesSearch =
        !normalizedSearch ||
        article.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        article.excerpt
          .toLowerCase()
          .includes(normalizedSearch) ||
        article.category
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [
    articles,
    category,
    search,
  ]);

  const reset = () => {
    setSearch("");
    setCategory("All");
  };

  return (
    <div>
      <div className="rounded-3xl border border-forest-900/10 bg-white p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <label
              htmlFor="insight-search"
              className="mb-2 block text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-stone-500"
            >
              Search insights
            </label>

            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-500" />

              <input
                id="insight-search"
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search articles..."
                className="focus-ring min-h-12 w-full rounded-xl border border-forest-900/10 bg-ivory-50 py-3 pl-11 pr-11 text-sm text-forest-950 outline-none placeholder:text-stone-500"
              />

              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="focus-ring absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-stone-500 transition hover:bg-white hover:text-forest-950"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={reset}
            className="focus-ring w-fit rounded-full px-4 py-3 text-xs font-semibold text-stone-600 transition hover:bg-ivory-100 hover:text-forest-950"
          >
            Reset filters
          </button>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {insightCategoryOptions.map((option) => {
            const active = category === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() =>
                  setCategory(option)
                }
                className={cn(
                  "focus-ring min-h-10 shrink-0 rounded-full border px-4 text-xs font-semibold transition",
                  active
                    ? "border-forest-950 bg-forest-950 text-white"
                    : "border-forest-900/10 bg-ivory-50 text-stone-700 hover:border-forest-900/20 hover:bg-white",
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-forest-950">
            {filteredArticles.length}{" "}
            {filteredArticles.length === 1
              ? "article"
              : "articles"}
          </p>

          <p className="mt-1 text-xs text-stone-500">
            Tevuah Reserve editorial library
          </p>
        </div>
      </div>

      {filteredArticles.length > 0 ? (
        <div className="mt-7 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {filteredArticles.map(
            (article, index) => (
              <InsightCard
                key={article.id}
                article={article}
                priority={index < 2}
              />
            ),
          )}
        </div>
      ) : (
        <div className="mt-7 rounded-4xl border border-dashed border-forest-900/20 bg-white px-6 py-16 text-center">
          <p className="font-display text-3xl font-semibold text-forest-950">
            No insights match your search.
          </p>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-600">
            Try another search term or remove the
            category filter.
          </p>

          <button
            type="button"
            onClick={reset}
            className="focus-ring mt-7 rounded-full bg-forest-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-forest-800"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}