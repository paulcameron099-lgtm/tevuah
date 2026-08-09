import type { EstateMetric } from "@/src/types/estate";

type EstateMetricsProps = {
  metrics: EstateMetric[];
};

export function EstateMetrics({
  metrics,
}: EstateMetricsProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <article
          key={metric.label}
          className="rounded-[1.25rem] border border-forest-900/10 bg-white p-5"
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-stone-500">
            {metric.label}
          </p>

          <p className="font-display mt-3 text-3xl font-semibold text-forest-950">
            {metric.value}
          </p>

          {metric.description ? (
            <p className="mt-2 text-xs leading-5 text-stone-500">
              {metric.description}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}