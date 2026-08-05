import type { InvestorJourneyStep } from "@/src/data/investor-journey";
import { cn } from "@/src/lib/utils";

type JourneyStepCardProps = {
  step: InvestorJourneyStep;
  isLast?: boolean;
};

export function JourneyStepCard({
  step,
  isLast = false,
}: JourneyStepCardProps) {
  const Icon = step.icon;

  return (
    <article className="relative">
      {!isLast ? (
        <div
          aria-hidden="true"
          className="absolute left-6 top-12 hidden h-px w-[calc(100%-1.5rem)] bg-forest-900/10 xl:block"
        />
      ) : null}

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-4">
          <span className="flex size-12 items-center justify-center rounded-full bg-forest-950 text-gold-400 shadow-[0_10px_30px_rgba(10,23,18,0.14)]">
            <Icon className="size-5" />
          </span>

          <span className="font-display text-3xl font-semibold text-forest-900/15">
            {step.number}
          </span>
        </div>

        <h3 className="font-display mt-7 text-3xl font-medium tracking-tight text-forest-950">
          {step.title}
        </h3>

        <p className="mt-4 text-sm leading-7 text-stone-700">
          {step.description}
        </p>
      </div>
    </article>
  );
}