import type { AgTechMetric } from "@/src/data/agtech-metrics";

type AgTechMetricCardProps = {
  metric: AgTechMetric;
};

export function AgTechMetricCard({
  metric,
}: AgTechMetricCardProps) {
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

      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-white/45">
        {metric.label}
      </p>

      <div className="mt-2 flex items-end justify-between gap-4">
        <p className="font-display text-3xl font-semibold text-white">
          {metric.value}
        </p>

        <p className="text-xs font-medium text-gold-400">
          {metric.change}
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

      <p className="mt-4 text-xs leading-5 text-white/45">
        {metric.description}
      </p>
    </article>
  );
}