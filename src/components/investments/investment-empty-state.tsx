import { SearchX } from "lucide-react";

type InvestmentEmptyStateProps = {
  onReset: () => void;
};

export function InvestmentEmptyState({
  onReset,
}: InvestmentEmptyStateProps) {
  return (
    <div className="rounded-4xl border border-dashed border-forest-900/20 bg-ivory-50 px-6 py-16 text-center sm:py-20">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-forest-950 text-gold-400">
        <SearchX className="size-6" />
      </span>

      <h2 className="font-display mt-6 text-3xl font-semibold text-forest-950">
        No opportunities match your filters.
      </h2>

      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-600">
        Adjust your search or remove one or more filters to see other
        illustrative opportunities.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="focus-ring mt-7 min-h-12 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition hover:bg-forest-800"
      >
        Clear all filters
      </button>
    </div>
  );
}