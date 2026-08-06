import { AlertTriangle } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { OpportunityRisk } from "@/src/types/opportunity-detail";

type OpportunityRisksProps = {
  risks: OpportunityRisk[];
};

const severityClasses = {
  Lower: "bg-emerald-50 text-emerald-800",
  Moderate: "bg-amber-50 text-amber-800",
  Elevated: "bg-red-50 text-red-800",
};

export function OpportunityRisks({
  risks,
}: OpportunityRisksProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {risks.map((risk) => (
        <article
          key={risk.id}
          className="rounded-[1.25rem] border border-forest-900/10 bg-white p-6"
        >
          <div className="flex items-start justify-between gap-5">
            <span className="flex size-11 items-center justify-center rounded-full bg-forest-950 text-gold-400">
              <AlertTriangle className="size-5" />
            </span>

            <span
              className={cn(
                "rounded-full px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em]",
                severityClasses[risk.severity],
              )}
            >
              {risk.severity}
            </span>
          </div>

          <h3 className="font-display mt-6 text-2xl font-semibold text-forest-950">
            {risk.title}
          </h3>

          <p className="mt-3 text-sm leading-7 text-stone-700">
            {risk.description}
          </p>
        </article>
      ))}
    </div>
  );
}