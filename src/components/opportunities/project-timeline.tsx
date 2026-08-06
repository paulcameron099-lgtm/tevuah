import { Check, Circle } from "lucide-react";

import { cn } from "@/src/lib/utils";
import type { ProjectMilestone } from "@/src/types/opportunity-detail";

type ProjectTimelineProps = {
  milestones: ProjectMilestone[];
};

export function ProjectTimeline({
  milestones,
}: ProjectTimelineProps) {
  return (
    <div className="space-y-0">
      {milestones.map((milestone, index) => {
        const completed = milestone.status === "completed";
        const current = milestone.status === "current";
        const isLast = index === milestones.length - 1;

        return (
          <article
            key={milestone.id}
            className="grid grid-cols-[48px_minmax(0,1fr)] gap-5"
          >
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "relative z-10 flex size-11 items-center justify-center rounded-full border",
                  completed &&
                    "border-forest-950 bg-forest-950 text-gold-400",
                  current &&
                    "border-gold-500 bg-gold-500 text-forest-950",
                  milestone.status === "upcoming" &&
                    "border-forest-900/15 bg-white text-stone-500",
                )}
              >
                {completed ? (
                  <Check className="size-4" />
                ) : (
                  <Circle className="size-3" />
                )}
              </span>

              {!isLast ? (
                <span className="min-h-20 w-px flex-1 bg-forest-900/10" />
              ) : null}
            </div>

            <div className="pb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold-600">
                {milestone.date}
              </p>

              <h3 className="font-display mt-2 text-2xl font-semibold text-forest-950">
                {milestone.title}
              </h3>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-700">
                {milestone.description}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}