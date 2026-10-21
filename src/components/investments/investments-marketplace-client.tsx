"use client";

import {
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  BriefcaseBusiness,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  MarketplaceCard,
  MarketplaceGrid,
  MarketplaceHeroLine,
  MarketplaceHeroReveal,
  MarketplaceImage,
  MarketplaceProgress,
  MarketplaceReveal,
} from "@/src/components/investments/marketplace-motion";

/*
 * --------------------------------------------------
 * TYPES
 * --------------------------------------------------
 */

export type MarketplaceOpportunity = {
  id: string;
  slug: string;
  title: string;

  short_description: string | null;
  asset_category: string;
  location: string | null;

  funding_target: number;
  minimum_investment: number;
  total_funded: number;

  expected_duration_months: number | null;

  target_return_min: number | null;
  target_return_max: number | null;

  funding_closed_at: string | null;

  coverImageUrl: string | null;
};

type InvestmentsMarketplaceClientProps = {
  opportunities: MarketplaceOpportunity[];
};

type CategoryFilter =
  | "all"
  | "fine_wine"
  | "agtech"
  | "olive"
  | "vineyard";

/*
 * --------------------------------------------------
 * CATEGORY CONFIGURATION
 * --------------------------------------------------
 */

const CATEGORY_FILTERS: {
  value: CategoryFilter;
  label: string;
}[] = [
  {
    value: "all",
    label: "All opportunities",
  },
  {
    value: "fine_wine",
    label: "Fine Wine",
  },
  {
    value: "agtech",
    label: "AgTech",
  },
  {
    value: "olive",
    label: "Olive Estate",
  },
  {
    value: "vineyard",
    label: "Vineyard",
  },
];

/*
 * --------------------------------------------------
 * HELPERS
 * --------------------------------------------------
 */

function normalize(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");
}

function resolveCategory(
  value: string | null | undefined,
): Exclude<CategoryFilter, "all"> | null {
  const category = normalize(value);

  if (
    [
      "fine_wine",
      "fine_wines",
      "wine",
      "wine_investment",
    ].includes(category)
  ) {
    return "fine_wine";
  }

  if (
    [
      "agtech",
      "ag_tech",
      "agricultural_technology",
      "agricultural_infrastructure",
    ].includes(category)
  ) {
    return "agtech";
  }

  if (
    [
      "olive",
      "olives",
      "olive_estate",
      "olive_estates",
      "olive_agriculture",
    ].includes(category)
  ) {
    return "olive";
  }

  if (
    [
      "vineyard",
      "vineyards",
      "vineyard_estate",
      "vineyard_estates",
    ].includes(category)
  ) {
    return "vineyard";
  }

  return null;
}

function humanize(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(cents) / 100);
}

function returnDisplay(
  minimum: number | null,
  maximum: number | null,
) {
  if (minimum != null && maximum != null) {
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

function isFullyFunded(
  opportunity: MarketplaceOpportunity,
) {
  const target = opportunity.funding_target;
  const funded = opportunity.total_funded;

  return (
    Boolean(opportunity.funding_closed_at) ||
    (target > 0 && funded >= target)
  );
}

/*
 * --------------------------------------------------
 * DATA POINT
 * --------------------------------------------------
 */

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

/*
 * --------------------------------------------------
 * INVESTMENT CARD
 * --------------------------------------------------
 */

function InvestmentCard({
  opportunity,
}: {
  opportunity: MarketplaceOpportunity;
}) {
  const fundingTarget =
    opportunity.funding_target;

  const totalFunded =
    opportunity.total_funded;

  const progress =
    fundingTarget > 0
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(
              (totalFunded / fundingTarget) * 100,
            ),
          ),
        )
      : 0;

  const fullyFunded =
    isFullyFunded(opportunity);

  return (
    <MarketplaceCard className="h-full">
      <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(10,23,18,0.08)]">
        {/* IMAGE */}

        <div className="h-60 shrink-0 overflow-hidden bg-forest-950">
          {opportunity.coverImageUrl ? (
            <MarketplaceImage className="size-full">
              <img
                src={opportunity.coverImageUrl}
                alt={opportunity.title}
                className="size-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
              />
            </MarketplaceImage>
          ) : (
            <div className="flex h-full items-center justify-center text-white/30">
              <BriefcaseBusiness className="size-8" />
            </div>
          )}
        </div>

        {/* CARD CONTENT */}

        <div className="flex flex-1 flex-col p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-forest-950 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-white">
              {humanize(opportunity.asset_category)}
            </span>

            <span
              className={
                fullyFunded
                  ? "rounded-full bg-stone-100 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-700"
                  : "rounded-full bg-emerald-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-emerald-700"
              }
            >
              {fullyFunded
                ? "Fully Funded · Closed"
                : "Open"}
            </span>
          </div>

          <h3 className="font-display mt-5 text-3xl font-semibold text-forest-950">
            {opportunity.title}
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

          {/* FUNDING PROGRESS */}

          <div className="mt-auto pt-6">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-forest-950">
                Funding progress
              </span>

              <span className="text-stone-500">
                {progress}%
              </span>
            </div>

            <MarketplaceProgress
              progress={progress}
              className="mt-2 h-2"
            />

            <p className="mt-2 text-xs text-stone-500">
              {formatMoney(
                opportunity.total_funded,
              )}{" "}
              funded
            </p>

            <Link
              href={`/investments/${opportunity.slug}`}
              className="focus-ring mt-7 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800"
            >
              View opportunity

              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </article>
    </MarketplaceCard>
  );
}

/*
 * --------------------------------------------------
 * MAIN MARKETPLACE COMPONENT
 * --------------------------------------------------
 */

export function InvestmentsMarketplaceClient({
  opportunities,
}: InvestmentsMarketplaceClientProps) {
  const [activeCategory, setActiveCategory] =
    useState<CategoryFilter>("all");

  const [searchQuery, setSearchQuery] =
    useState("");

  /*
   * --------------------------------------------------
   * CATEGORY COUNTS
   * --------------------------------------------------
   */

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryFilter, number> = {
      all: opportunities.length,
      fine_wine: 0,
      agtech: 0,
      olive: 0,
      vineyard: 0,
    };

    for (const opportunity of opportunities) {
      const category = resolveCategory(
        opportunity.asset_category,
      );

      if (category) {
        counts[category] += 1;
      }
    }

    return counts;
  }, [opportunities]);

  /*
   * --------------------------------------------------
   * FILTER OPPORTUNITIES
   * --------------------------------------------------
   */

  const filteredOpportunities = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    return opportunities.filter((opportunity) => {
      const category = resolveCategory(
        opportunity.asset_category,
      );

      const matchesCategory =
        activeCategory === "all" ||
        category === activeCategory;

      const searchableText = [
        opportunity.title,
        opportunity.short_description,
        opportunity.asset_category,
        opportunity.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query ||
        searchableText.includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [
    opportunities,
    activeCategory,
    searchQuery,
  ]);

  const filtersActive =
    activeCategory !== "all" ||
    searchQuery.trim().length > 0;

  function clearFilters() {
    setActiveCategory("all");
    setSearchQuery("");
  }

  return (
    <main>
      {/* ==========================================
          HERO
      ========================================== */}

      <section className="relative overflow-hidden bg-forest-950 px-5 py-20 text-white sm:px-8 lg:py-28">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-br from-forest-950 via-forest-950 to-forest-900"
        />

        <div
          aria-hidden="true"
          className="absolute -right-40 top-1/2 size-96 -translate-y-1/2 rounded-full bg-gold-500/5 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl">
          <MarketplaceHeroReveal delay={0.08}>
            <div className="flex items-center gap-3">
              <MarketplaceHeroLine className="h-px w-10 origin-left bg-gold-400" />

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
                Tevuah Reserve
              </p>
            </div>
          </MarketplaceHeroReveal>

          <MarketplaceHeroReveal delay={0.18}>
            <h1 className="font-display mt-5 max-w-4xl text-5xl font-semibold tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Investment opportunities
            </h1>
          </MarketplaceHeroReveal>

          <MarketplaceHeroReveal delay={0.3}>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/60">
              Explore currently available vineyard,
              olive-estate, agricultural technology
              and fine-wine opportunities.
            </p>
          </MarketplaceHeroReveal>
        </div>
      </section>

      {/* ==========================================
          MARKETPLACE
      ========================================== */}

      <section className="bg-ivory-50 px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          {/* MARKETPLACE HEADING */}

          <MarketplaceReveal>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
                  Marketplace
                </p>

                <h2 className="font-display mt-3 text-4xl font-semibold text-forest-950">
                  Available investments
                </h2>
              </div>

              <p
                className="text-sm text-stone-500"
                aria-live="polite"
              >
                {filteredOpportunities.length}{" "}
                {filteredOpportunities.length === 1
                  ? "opportunity"
                  : "opportunities"}
                {filtersActive
                  ? ` of ${opportunities.length}`
                  : ""}
              </p>
            </div>
          </MarketplaceReveal>

          {/* ==========================================
              SEARCH & FILTERS
          ========================================== */}

          <MarketplaceReveal
            className="mt-10"
            delay={0.08}
          >
            <div className="rounded-[1.75rem] border border-forest-900/10 bg-white p-5 shadow-[0_12px_40px_rgba(10,23,18,0.035)] sm:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-forest-950/5 text-forest-950">
                    <SlidersHorizontal className="size-4" />
                  </span>

                  <div>
                    <h3 className="text-sm font-semibold text-forest-950">
                      Find an opportunity
                    </h3>

                    <p className="mt-1 text-xs text-stone-500">
                      Search or filter by asset category
                    </p>
                  </div>
                </div>

                {/* SEARCH INPUT */}

                <div className="relative w-full lg:max-w-sm">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400"
                  />

                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    placeholder="Search opportunities..."
                    aria-label="Search investment opportunities"
                    className="focus-ring h-12 w-full rounded-xl border border-forest-900/10 bg-ivory-50 pl-11 pr-4 text-sm text-forest-950 outline-none transition placeholder:text-stone-400 focus:border-gold-500"
                  />
                </div>
              </div>

              {/* CATEGORY FILTER BUTTONS */}

              <div
                className="mt-7 flex flex-wrap gap-2.5 border-t border-forest-900/10 pt-6"
                role="group"
                aria-label="Filter investment opportunities by category"
              >
                {CATEGORY_FILTERS.map((filter) => {
                  const active =
                    activeCategory === filter.value;

                  return (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() =>
                        setActiveCategory(filter.value)
                      }
                      aria-pressed={active}
                      className={
                        active
                          ? "focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-forest-950 px-4 py-2.5 text-xs font-semibold text-white transition sm:text-sm"
                          : "focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-forest-900/10 bg-ivory-50 px-4 py-2.5 text-xs font-semibold text-stone-600 transition hover:border-forest-900/20 hover:bg-forest-950/5 hover:text-forest-950 sm:text-sm"
                      }
                    >
                      {filter.label}

                      <span
                        className={
                          active
                            ? "rounded-full bg-white/15 px-2 py-0.5 text-[0.65rem] text-white"
                            : "rounded-full bg-forest-950/5 px-2 py-0.5 text-[0.65rem] text-stone-500"
                        }
                      >
                        {categoryCounts[filter.value]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ACTIVE FILTER STATUS */}

              {filtersActive && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-stone-500">
                    Showing{" "}
                    <span className="font-semibold text-forest-950">
                      {filteredOpportunities.length}
                    </span>{" "}
                    matching{" "}
                    {filteredOpportunities.length === 1
                      ? "opportunity"
                      : "opportunities"}
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="focus-ring inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full px-3 text-xs font-semibold text-forest-950 transition hover:bg-forest-950/5"
                  >
                    <X className="size-4" />
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </MarketplaceReveal>

          {/* ==========================================
              INVESTMENT RESULTS
          ========================================== */}

          {filteredOpportunities.length === 0 ? (
            <MarketplaceReveal
              className="mt-10"
              delay={0.08}
            >
              <div className="rounded-[1.75rem] border border-forest-900/10 bg-white px-6 py-16 text-center">
                {filtersActive ? (
                  <Search className="mx-auto size-7 text-stone-300" />
                ) : (
                  <BriefcaseBusiness className="mx-auto size-7 text-stone-300" />
                )}

                <h3 className="font-display mt-4 text-3xl font-semibold text-forest-950">
                  {filtersActive
                    ? "No matching opportunities"
                    : "No opportunities are currently open."}
                </h3>

                <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-stone-500">
                  {filtersActive
                    ? "We couldn't find an investment matching your selected category and search. Try another category or clear your filters."
                    : "Published investment opportunities will appear here when they become available."}
                </p>

                {filtersActive && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="focus-ring mt-7 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition hover:bg-forest-800"
                  >
                    <X className="size-4" />
                    Clear all filters
                  </button>
                )}
              </div>
            </MarketplaceReveal>
          ) : (
            <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {filteredOpportunities.map(
                (opportunity) => (
                  <InvestmentCard
                    key={opportunity.id}
                    opportunity={opportunity}
                  />
                ),
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}