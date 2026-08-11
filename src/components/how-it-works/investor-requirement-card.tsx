import type { InvestorRequirement } from "@/src/data/investor-process";

type InvestorRequirementCardProps = {
  requirement: InvestorRequirement;
};

export function InvestorRequirementCard({
  requirement,
}: InvestorRequirementCardProps) {
  const Icon = requirement.icon;

  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <span className="flex size-11 items-center justify-center rounded-full bg-gold-500/15 text-gold-400">
        <Icon className="size-5" />
      </span>

      <h3 className="font-display mt-6 text-2xl font-semibold text-white">
        {requirement.title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-white/55">
        {requirement.description}
      </p>
    </article>
  );
}