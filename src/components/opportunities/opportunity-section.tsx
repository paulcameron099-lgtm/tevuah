    import type { ReactNode } from "react";

import { cn } from "@/src/lib/utils";

type OpportunitySectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function OpportunitySection({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
}: OpportunitySectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-40 border-b border-forest-900/10 py-16 sm:py-20 lg:py-24",
        className,
      )}
    >
      <div className="mb-10 max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
          {eyebrow}
        </p>

        <h2 className="font-display mt-5 text-balance text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
          {title}
        </h2>

        {description ? (
          <p className="mt-6 max-w-3xl text-base leading-8 text-stone-700">
            {description}
          </p>
        ) : null}
      </div>

      {children}
    </section>
  );
}