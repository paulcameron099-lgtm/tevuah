import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";

import type { InvestmentCategory } from "@/src/types/investment";

type CategoryCardProps = {
  category: InvestmentCategory;
  priority?: boolean;
};

export function CategoryCard({
  category,
  priority = false,
}: CategoryCardProps) {
  return (
    <article className="group relative min-h-120 overflow-hidden rounded-[1.75rem] bg-forest-950 text-white sm:min-h-135">
      <Image
        src={category.image}
        alt={`${category.title} investment category`}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
      />

      <div className="absolute inset-0 bg-linear-to-t from-forest-950 via-forest-950/55 to-forest-950/10" />

      <div className="absolute inset-0 bg-linear-to-r from-forest-950/35 to-transparent" />

      <div className="relative flex min-h-120 flex-col justify-between p-7 sm:min-h-135 sm:p-9">
        <div className="flex items-start justify-between gap-4">
          <span className="rounded-full border border-white/20 bg-forest-950/30 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
            {category.eyebrow}
          </span>

          <Link
            href={category.href}
            aria-label={`Explore ${category.title}`}
            className="focus-ring flex size-12 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-md transition hover:border-gold-400 hover:bg-gold-500 hover:text-forest-950"
          >
            <ArrowUpRight className="size-5" />
          </Link>
        </div>

        <div>
          <h3 className="font-display text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
            {category.title}
          </h3>

          <p className="mt-4 max-w-lg text-sm leading-7 text-white/70 sm:text-base">
            {category.description}
          </p>

          <ul className="mt-6 space-y-3">
            {category.highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-center gap-3 text-sm text-white/80"
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-white/10">
                  <Check className="size-3.5 text-gold-400" />
                </span>

                {highlight}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}