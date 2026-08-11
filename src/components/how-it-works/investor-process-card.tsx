import { Check } from "lucide-react";

import type { InvestorProcessStep } from "@/src/data/investor-process";

type InvestorProcessCardProps = {
  step: InvestorProcessStep;
};

export function InvestorProcessCard({
  step,
}: InvestorProcessCardProps) {
  const Icon = step.icon;

  return (
    <article
      id={step.id}
      className="scroll-mt-36 rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8"
    >
      <div className="flex items-start justify-between gap-5">
        <span className="flex size-12 items-center justify-center rounded-full bg-forest-950 text-gold-400">
          <Icon className="size-5" />
        </span>

        <span className="font-display text-4xl font-semibold text-forest-900/10">
          {step.number}
        </span>
      </div>

      <h3 className="font-display mt-7 text-3xl font-semibold tracking-[-0.03em] text-forest-950">
        {step.title}
      </h3>

      <p className="mt-4 text-sm leading-7 text-stone-700">
        {step.description}
      </p>

      <ul className="mt-6 space-y-3 border-t border-forest-900/10 pt-6">
        {step.details.map((detail) => (
          <li
            key={detail}
            className="flex items-start gap-3 text-sm text-stone-700"
          >
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gold-500/15">
              <Check className="size-3 text-gold-600" />
            </span>

            {detail}
          </li>
        ))}
      </ul>
    </article>
  );
}