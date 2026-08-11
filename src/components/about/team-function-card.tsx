import type { TeamFunction } from "@/src/data/about-platform";

type TeamFunctionCardProps = {
  item: TeamFunction;
};

export function TeamFunctionCard({
  item,
}: TeamFunctionCardProps) {
  const Icon = item.icon;

  return (
    <article className="rounded-3xl border border-forest-900/10 bg-white p-6">
      <span className="flex size-11 items-center justify-center rounded-full bg-forest-950 text-gold-400">
        <Icon className="size-5" />
      </span>

      <h3 className="font-display mt-6 text-2xl font-semibold text-forest-950">
        {item.title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-stone-700">
        {item.description}
      </p>
    </article>
  );
}