import { formatCurrency } from "@/src/lib/formatters";
import type { UseOfFundsItem } from "@/src/types/opportunity-detail";

type UseOfFundsProps = {
  items: UseOfFundsItem[];
  currency: "EUR" | "USD" | "GBP";
};

export function UseOfFunds({
  items,
  currency,
}: UseOfFundsProps) {
  return (
    <div className="rounded-3xl border border-forest-900/10 bg-white p-6 sm:p-8">
      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-sm font-semibold text-forest-950">
                  {item.label}
                </p>

                <p className="mt-1 text-xs text-stone-500">
                  {formatCurrency(item.amount, currency)}
                </p>
              </div>

              <p className="font-display text-2xl font-semibold text-forest-950">
                {item.percentage}%
              </p>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-forest-900/10">
              <div
                className="h-full rounded-full bg-gold-500"
                style={{
                  width: `${item.percentage}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}