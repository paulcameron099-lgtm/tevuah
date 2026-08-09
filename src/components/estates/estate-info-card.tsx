import type { ReactNode } from "react";

type EstateInfoCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

export function EstateInfoCard({
  icon,
  title,
  description,
}: EstateInfoCardProps) {
  return (
    <article className="rounded-[1.25rem] border border-forest-900/10 bg-white p-6">
      <span className="flex size-11 items-center justify-center rounded-full bg-forest-950 text-gold-400">
        {icon}
      </span>

      <h3 className="font-display mt-6 text-2xl font-semibold text-forest-950">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-stone-700">
        {description}
      </p>
    </article>
  );
}