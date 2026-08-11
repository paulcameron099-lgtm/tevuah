import type { InvestmentPrinciple } from "@/src/data/about-platform";

type InvestmentPrincipleCardProps = {
  principle: InvestmentPrinciple;
  index: number;
};

export function InvestmentPrincipleCard({
  principle,
  index,
}: InvestmentPrincipleCardProps) {
  const Icon = principle.icon;

  return (
    <article className="rounded-3xl border border-forest-900/10 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(10,23,18,0.08)] sm:p-7">
      <div className="flex items-start justify-between gap-5">
        <span className="flex size-12 items-center justify-center rounded-full bg-forest-950 text-gold-400">
          <Icon className="size-5" />
        </span>

        <span className="font-display text-3xl font-semibold text-forest-900/10">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <h3 className="font-display mt-7 text-3xl font-medium tracking-[-0.03em] text-forest-950">
        {principle.title}
      </h3>

      <p className="mt-4 text-sm leading-7 text-stone-700">
        {principle.description}
      </p>
    </article>
  );
}