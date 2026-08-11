import type { GovernanceStage } from "@/src/data/about-platform";

type GovernanceProcessProps = {
  stages: GovernanceStage[];
};

export function GovernanceProcess({
  stages,
}: GovernanceProcessProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {stages.map((stage) => (
        <article
          key={stage.number}
          className="rounded-3xl border border-white/10 bg-white/5 p-6"
        >
          <p className="font-display text-4xl font-semibold text-gold-400">
            {stage.number}
          </p>

          <h3 className="font-display mt-5 text-2xl font-semibold text-white">
            {stage.title}
          </h3>

          <p className="mt-3 text-sm leading-7 text-white/55">
            {stage.description}
          </p>
        </article>
      ))}
    </div>
  );
}