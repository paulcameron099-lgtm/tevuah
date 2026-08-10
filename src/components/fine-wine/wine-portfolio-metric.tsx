import type { WinePortfolioMetric } from "@/src/data/fine-wine-platform";

type WinePortfolioMetricProps = {
  metric: WinePortfolioMetric;
};

export function WinePortfolioMetricCard({
  metric,
}: WinePortfolioMetricProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/6 p-5 backdrop-blur-md">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/45">
        {metric.label}
      </p>

      <p className="font-display mt-3 text-3xl font-semibold text-white">
        {metric.value}
      </p>

      <p className="mt-2 text-xs leading-5 text-white/45">
        {metric.description}
      </p>
    </article>
  );
}