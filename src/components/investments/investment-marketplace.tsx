"use client";

import {
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";


import { OpportunityCard } from "@/src/components/marketing/opportunity-card";
import {
  categoryOptions,
  sortOptions,
  type CategoryFilterValue,
  type MinimumFilterValue,
  type RiskFilterValue,
  type SortValue,
  type StatusFilterValue,
} from "@/src/config/investment-filters";
import { calculateFundingPercentage } from "@/src/lib/formatters";
import type { Opportunity } from "@/src/types/investment";

import { FilterSelect } from "./filter-select";
import { InvestmentEmptyState } from "./investment-empty-state";
import { InvestmentFilterPanel } from "./investment-filter-panel";
import { MobileInvestmentFilters } from "./mobile-investment-filters";

type InvestmentMarketplaceProps = {
  opportunities: Opportunity[];
};

const validCategories = new Set(
  categoryOptions.map((option) => option.value),
);

function getStringParam(
  searchParams: URLSearchParams,
  key: string,
  fallback: string,
) {
  const value = searchParams.get(key);

  return value?.trim() || fallback;
}

export function InvestmentMarketplace({
  opportunities,
}: InvestmentMarketplaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mobileFiltersOpen, setMobileFiltersOpen] =
    useState(false);

  const search = getStringParam(searchParams, "search", "");

  const rawCategory = getStringParam(
    searchParams,
    "category",
    "all",
  );

  const category: CategoryFilterValue =
    validCategories.has(rawCategory as CategoryFilterValue)
      ? (rawCategory as CategoryFilterValue)
      : "all";

  const status = getStringParam(
    searchParams,
    "status",
    "all",
  ) as StatusFilterValue;

  const risk = getStringParam(
    searchParams,
    "risk",
    "all",
  ) as RiskFilterValue;

  const country = getStringParam(
    searchParams,
    "country",
    "all",
  );

  const minimum = getStringParam(
    searchParams,
    "minimum",
    "all",
  ) as MinimumFilterValue;

  const sort = getStringParam(
    searchParams,
    "sort",
    "newest",
  ) as SortValue;

  const updateParams = useCallback(
    (
      updates: Record<
        string,
        string | null | undefined
      >,
    ) => {
      const params = new URLSearchParams(
        searchParams.toString(),
      );

      Object.entries(updates).forEach(([key, value]) => {
        if (
          !value ||
          value === "all" ||
          (key === "sort" && value === "newest")
        ) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      const query = params.toString();

      router.replace(
        query ? `${pathname}?${query}` : pathname,
        {
          scroll: false,
        },
      );
    },
    [pathname, router, searchParams],
  );

  const resetFilters = useCallback(() => {
    router.replace(pathname, {
      scroll: false,
    });
  }, [pathname, router]);

  const countries = useMemo(
    () =>
      Array.from(
        new Set(
          opportunities.map(
            (opportunity) => opportunity.country,
          ),
        ),
      ).sort((first, second) =>
        first.localeCompare(second),
      ),
    [opportunities],
  );

  const filteredOpportunities = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    const maximumMinimum =
      minimum === "all" ? null : Number(minimum);

    const results = opportunities.filter(
      (opportunity) => {
        const matchesSearch =
          !normalizedSearch ||
          opportunity.title
            .toLowerCase()
            .includes(normalizedSearch) ||
          opportunity.location
            .toLowerCase()
            .includes(normalizedSearch) ||
          opportunity.country
            .toLowerCase()
            .includes(normalizedSearch) ||
          opportunity.categoryLabel
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesCategory =
          category === "all" ||
          opportunity.category === category;

        const matchesStatus =
          status === "all" ||
          opportunity.status === status;

        const matchesRisk =
          risk === "all" ||
          opportunity.riskLevel === risk;

        const matchesCountry =
          country === "all" ||
          opportunity.country === country;

        const matchesMinimum =
          maximumMinimum === null ||
          opportunity.minimumInvestment <=
            maximumMinimum;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesStatus &&
          matchesRisk &&
          matchesCountry &&
          matchesMinimum
        );
      },
    );

    return [...results].sort((first, second) => {
      switch (sort) {
        case "funding-high":
          return (
            calculateFundingPercentage(
              second.fundedAmount,
              second.fundingTarget,
            ) -
            calculateFundingPercentage(
              first.fundedAmount,
              first.fundingTarget,
            )
          );

        case "funding-low":
          return (
            calculateFundingPercentage(
              first.fundedAmount,
              first.fundingTarget,
            ) -
            calculateFundingPercentage(
              second.fundedAmount,
              second.fundingTarget,
            )
          );

        case "minimum-low":
          return (
            first.minimumInvestment -
            second.minimumInvestment
          );

        case "minimum-high":
          return (
            second.minimumInvestment -
            first.minimumInvestment
          );

        case "duration-short":
          return (
            first.durationMonths -
            second.durationMonths
          );

        case "newest":
        default:
          return (
            new Date(second.publishedAt).getTime() -
            new Date(first.publishedAt).getTime()
          );
      }
    });
  }, [
    category,
    country,
    minimum,
    opportunities,
    risk,
    search,
    sort,
    status,
  ]);

  const activeFilterCount = [
    category !== "all",
    status !== "all",
    risk !== "all",
    country !== "all",
    minimum !== "all",
  ].filter(Boolean).length;

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <div className="sticky top-28">
            <InvestmentFilterPanel
              category={category}
              status={status}
              risk={risk}
              country={country}
              minimum={minimum}
              countries={countries}
              onCategoryChange={(value) =>
                updateParams({
                  category: value,
                })
              }
              onStatusChange={(value) =>
                updateParams({
                  status: value,
                })
              }
              onRiskChange={(value) =>
                updateParams({
                  risk: value,
                })
              }
              onCountryChange={(value) =>
                updateParams({
                  country: value,
                })
              }
              onMinimumChange={(value) =>
                updateParams({
                  minimum: value,
                })
              }
              onReset={resetFilters}
            />
          </div>
        </div>

        <div className="min-w-0">
          <div className="rounded-3xl border border-forest-900/10 bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
              <div className="flex-1">
                <label
                  htmlFor="opportunity-search"
                  className="mb-2 block text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-stone-500"
                >
                  Search opportunities
                </label>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-500" />

                  <input
                    id="opportunity-search"
                    type="search"
                    value={search}
                    onChange={(event) =>
                      updateParams({
                        search: event.target.value,
                      })
                    }
                    placeholder="Search by name, country or asset..."
                    className="focus-ring min-h-12 w-full rounded-xl border border-forest-900/10 bg-ivory-50 py-3 pl-11 pr-11 text-sm text-forest-950 outline-none placeholder:text-stone-500"
                  />

                  {search ? (
                    <button
                      type="button"
                      onClick={() =>
                        updateParams({
                          search: null,
                        })
                      }
                      aria-label="Clear search"
                      className="focus-ring absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-stone-500 transition hover:bg-white hover:text-forest-950"
                    >
                      <X className="size-4" />
                    </button>
                  ) : null}
                </div>
              </div>

              <FilterSelect
                id="marketplace-sort"
                label="Sort by"
                value={sort}
                options={sortOptions}
                onChange={(value) =>
                  updateParams({
                    sort: value,
                  })
                }
                className="xl:w-55"
              />

              <button
                type="button"
                onClick={() =>
                  setMobileFiltersOpen(true)
                }
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-forest-900/10 bg-ivory-50 px-5 text-sm font-semibold text-forest-950 lg:hidden"
              >
                <SlidersHorizontal className="size-4" />
                Filters

                {activeFilterCount > 0 ? (
                  <span className="flex size-6 items-center justify-center rounded-full bg-gold-500 text-[0.65rem] font-bold text-forest-950">
                    {activeFilterCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-forest-950">
                {filteredOpportunities.length}{" "}
                {filteredOpportunities.length === 1
                  ? "opportunity"
                  : "opportunities"}
              </p>

              <p className="mt-1 text-xs text-stone-500">
                Illustrative marketplace results
              </p>
            </div>

            {activeFilterCount > 0 || search ? (
              <button
                type="button"
                onClick={resetFilters}
                className="focus-ring w-fit rounded-md text-sm font-semibold text-olive-700 transition hover:text-forest-950"
              >
                Clear all filters
              </button>
            ) : null}
          </div>

          {filteredOpportunities.length > 0 ? (
            <div className="mt-7 grid items-stretch gap-7 md:grid-cols-2 2xl:grid-cols-3">
              {filteredOpportunities.map(
                (opportunity) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                  />
                ),
              )}
            </div>
          ) : (
            <div className="mt-7">
              <InvestmentEmptyState
                onReset={resetFilters}
              />
            </div>
          )}
        </div>
      </div>

      <MobileInvestmentFilters
        open={mobileFiltersOpen}
        activeFilterCount={activeFilterCount}
        category={category}
        status={status}
        risk={risk}
        country={country}
        minimum={minimum}
        countries={countries}
        onClose={() =>
          setMobileFiltersOpen(false)
        }
        onCategoryChange={(value) =>
          updateParams({
            category: value,
          })
        }
        onStatusChange={(value) =>
          updateParams({
            status: value,
          })
        }
        onRiskChange={(value) =>
          updateParams({
            risk: value,
          })
        }
        onCountryChange={(value) =>
          updateParams({
            country: value,
          })
        }
        onMinimumChange={(value) =>
          updateParams({
            minimum: value,
          })
        }
        onReset={resetFilters}
      />
    </>
  );
}