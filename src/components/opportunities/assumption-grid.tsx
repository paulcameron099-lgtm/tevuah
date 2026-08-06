import type { FinancialAssumption } from "@/src/types/opportunity-detail";

type AssumptionGridProps = {
  assumptions: FinancialAssumption[];
};

export function AssumptionGrid({
  assumptions,
}: AssumptionGridProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {assumptions.map((assumption) => (
        <article
          key={assumption.label}
          className="rounded-[1.25rem] border border-forest-900/10 bg-white p-6"
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-stone-500">
            {assumption.label}
          </p>

          <p className="font-display mt-3 text-2xl font-semibold text-forest-950">
            {assumption.value}
          </p>

          <p className="mt-3 text-xs leading-6 text-stone-600">
            {assumption.note}
          </p>
        </article>
      ))}
    </div>
  );
}