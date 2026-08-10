import type { WinePrinciple } from "@/src/data/fine-wine-platform";

type WinePrincipleCardProps = {
  principle: WinePrinciple;
  index: number;
};

export function WinePrincipleCard({
  principle,
  index,
}: WinePrincipleCardProps) {
  const Icon = principle.icon;

  return (
    <article className="rounded-3xl border border-burgundy-900/10 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(53,19,27,0.08)] sm:p-7">
      <div className="flex items-start justify-between gap-5">
        <span className="flex size-12 items-center justify-center rounded-full bg-burgundy-900 text-gold-400">
          <Icon className="size-5" />
        </span>

        <span className="font-display text-3xl font-semibold text-burgundy-900/10">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <h3 className="font-display mt-7 text-3xl font-medium tracking-[-0.03em] text-burgundy-900">
        {principle.title}
      </h3>

      <p className="mt-4 text-sm leading-7 text-stone-700">
        {principle.description}
      </p>
    </article>
  );
}