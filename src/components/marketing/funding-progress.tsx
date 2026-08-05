import {
  calculateFundingPercentage,
  formatCurrency,
} from "@/src/lib/formatters";

type FundingProgressProps = {
  fundedAmount: number;
  fundingTarget: number;
  currency: "EUR" | "USD" | "GBP";
};

export function FundingProgress({
  fundedAmount,
  fundingTarget,
  currency,
}: FundingProgressProps) {
  const percentage = calculateFundingPercentage(
    fundedAmount,
    fundingTarget,
  );

  return (
    <div>
      <div className="flex items-end justify-between gap-5">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-stone-500">
            Funding progress
          </p>

          <p className="mt-1 text-sm font-semibold text-forest-950">
            {formatCurrency(fundedAmount, currency, true)}
            <span className="font-normal text-stone-500">
              {" "}
              of {formatCurrency(fundingTarget, currency, true)}
            </span>
          </p>
        </div>

        <p className="font-display text-2xl font-semibold text-forest-950">
          {percentage}%
        </p>
      </div>

      <div
        role="progressbar"
        aria-label="Opportunity funding progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        className="mt-4 h-2 overflow-hidden rounded-full bg-forest-900/10"
      >
        <div
          className="h-full rounded-full bg-gold-500 transition-[width] duration-700"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}