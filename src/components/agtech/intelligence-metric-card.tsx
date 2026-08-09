import type { IntelligenceMetric } from "@/src/data/agtech-platform";

type IntelligenceMetricCardProps = {
  metric: IntelligenceMetric;
};

export function IntelligenceMetricCard({
  metric,
}: IntelligenceMetricCardProps) {
  const Icon = metric.icon;

  return (
    <article className="rounded-2xl border border-white/10 bg-white/6 p-5 backdrop-blur-md">
      <div className="flex items-start justify-between gap-4">
        <span className="flex size-10 items-center justify-center rounded-full bg-gold-500/15 text-gold-400">
          <Icon className="size-4.5" />
        </span>

        <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-white/55">
          Illustrative
        </span>
      </div>

      <p className="mt-5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/45">
        {metric.label}
      </p>

      <div className="mt-2 flex items-end justify-between gap-4">
        <p className="font-display text-3xl font-semibold text-white">
          {metric.value}
          {metric.unit ? (
            <span className="ml-1 text-xl text-white/55">
              {metric.unit}
            </span>
          ) : null}
        </p>

        <p className="text-xs font-medium text-gold-400">
          {metric.status}
        </p>
      </div>

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gold-500"
          style={{
            width: `${metric.progress}%`,
          }}
        />
      </div>
    </article>
  );
}