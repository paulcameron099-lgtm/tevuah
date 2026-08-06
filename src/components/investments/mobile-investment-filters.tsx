import { useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import type {
  CategoryFilterValue,
  MinimumFilterValue,
  RiskFilterValue,
  StatusFilterValue,
} from "@/src/config/investment-filters";
import { cn } from "@/src/lib/utils";

import { InvestmentFilterPanel } from "./investment-filter-panel";

type MobileInvestmentFiltersProps = {
  open: boolean;
  activeFilterCount: number;
  category: CategoryFilterValue;
  status: StatusFilterValue;
  risk: RiskFilterValue;
  country: string;
  minimum: MinimumFilterValue;
  countries: string[];
  onClose: () => void;
  onCategoryChange: (value: CategoryFilterValue) => void;
  onStatusChange: (value: StatusFilterValue) => void;
  onRiskChange: (value: RiskFilterValue) => void;
  onCountryChange: (value: string) => void;
  onMinimumChange: (value: MinimumFilterValue) => void;
  onReset: () => void;
};

export function MobileInvestmentFilters({
  open,
  activeFilterCount,
  category,
  status,
  risk,
  country,
  minimum,
  countries,
  onClose,
  onCategoryChange,
  onStatusChange,
  onRiskChange,
  onCountryChange,
  onMinimumChange,
  onReset,
}: MobileInvestmentFiltersProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (!open) {
            return;
          }

          onClose();
        }}
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        className={cn(
          "fixed inset-0 z-80 bg-forest-950/60 backdrop-blur-sm transition-opacity lg:hidden",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Investment filters"
        className={cn(
          "fixed inset-y-0 right-0 z-90 flex w-[min(92%,420px)] flex-col bg-ivory-100 shadow-2xl transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-forest-900/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-forest-950 text-gold-400">
              <SlidersHorizontal className="size-4" />
            </span>

            <div>
              <p className="font-display text-xl font-semibold text-forest-950">
                Filters
              </p>

              <p className="text-xs text-stone-500">
                {activeFilterCount} active
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="focus-ring flex size-11 items-center justify-center rounded-full border border-forest-900/10 bg-white text-forest-950"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <InvestmentFilterPanel
            category={category}
            status={status}
            risk={risk}
            country={country}
            minimum={minimum}
            countries={countries}
            onCategoryChange={onCategoryChange}
            onStatusChange={onStatusChange}
            onRiskChange={onRiskChange}
            onCountryChange={onCountryChange}
            onMinimumChange={onMinimumChange}
            onReset={onReset}
          />
        </div>

        <div className="border-t border-forest-900/10 bg-white p-5">
          <button
            type="button"
            onClick={onClose}
            className="focus-ring min-h-12 w-full rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition hover:bg-forest-800"
          >
            View opportunities
          </button>
        </div>
      </aside>
    </>
  );
}