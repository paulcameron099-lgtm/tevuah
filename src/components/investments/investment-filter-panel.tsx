import { RotateCcw } from "lucide-react";

import {
  categoryOptions,
  minimumOptions,
  riskOptions,
  statusOptions,
  type CategoryFilterValue,
  type MinimumFilterValue,
  type RiskFilterValue,
  type StatusFilterValue,
} from "@/src/config/investment-filters";

import { FilterSelect } from "./filter-select";

type InvestmentFilterPanelProps = {
  category: CategoryFilterValue;
  status: StatusFilterValue;
  risk: RiskFilterValue;
  country: string;
  minimum: MinimumFilterValue;
  countries: string[];
  onCategoryChange: (value: CategoryFilterValue) => void;
  onStatusChange: (value: StatusFilterValue) => void;
  onRiskChange: (value: RiskFilterValue) => void;
  onCountryChange: (value: string) => void;
  onMinimumChange: (value: MinimumFilterValue) => void;
  onReset: () => void;
};

export function InvestmentFilterPanel({
  category,
  status,
  risk,
  country,
  minimum,
  countries,
  onCategoryChange,
  onStatusChange,
  onRiskChange,
  onCountryChange,
  onMinimumChange,
  onReset,
}: InvestmentFilterPanelProps) {
  const countryOptions = [
    {
      label: "All countries",
      value: "all",
    },
    ...countries.map((item) => ({
      label: item,
      value: item,
    })),
  ];

  return (
    <aside className="rounded-3xl border border-forest-900/10 bg-ivory-50 p-6">
      <div className="flex items-center justify-between gap-5">
        <div>
          <p className="font-display text-2xl font-semibold text-forest-950">
            Filter opportunities
          </p>

          <p className="mt-1 text-xs text-stone-500">
            Refine the marketplace
          </p>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="focus-ring inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-stone-600 transition hover:bg-white hover:text-forest-950"
        >
          <RotateCcw className="size-3.5" />
          Reset
        </button>
      </div>

      <div className="mt-7 space-y-5">
        <FilterSelect
          id="desktop-category-filter"
          label="Asset category"
          value={category}
          options={categoryOptions}
          onChange={(value) =>
            onCategoryChange(value as CategoryFilterValue)
          }
        />

        <FilterSelect
          id="desktop-status-filter"
          label="Status"
          value={status}
          options={statusOptions}
          onChange={(value) =>
            onStatusChange(value as StatusFilterValue)
          }
        />

        <FilterSelect
          id="desktop-risk-filter"
          label="Risk level"
          value={risk}
          options={riskOptions}
          onChange={(value) =>
            onRiskChange(value as RiskFilterValue)
          }
        />

        <FilterSelect
          id="desktop-country-filter"
          label="Country"
          value={country}
          options={countryOptions}
          onChange={onCountryChange}
        />

        <FilterSelect
          id="desktop-minimum-filter"
          label="Minimum investment"
          value={minimum}
          options={minimumOptions}
          onChange={(value) =>
            onMinimumChange(value as MinimumFilterValue)
          }
        />
      </div>
    </aside>
  );
}