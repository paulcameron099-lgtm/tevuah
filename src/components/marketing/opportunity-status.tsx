import { cn } from "@/src/lib/utils";
import type { OpportunityStatus } from "@/src/types/investment";

type OpportunityStatusProps = {
  status: OpportunityStatus;
};

const statusConfig: Record<
  OpportunityStatus,
  {
    label: string;
    className: string;
    dotClassName: string;
  }
> = {
  open: {
    label: "Open",
    className:
      "border-emerald-200/70 bg-emerald-50 text-emerald-800",
    dotClassName: "bg-emerald-600",
  },
  "closing-soon": {
    label: "Closing soon",
    className:
      "border-amber-200/80 bg-amber-50 text-amber-800",
    dotClassName: "bg-amber-600",
  },
  "coming-soon": {
    label: "Coming soon",
    className:
      "border-blue-200/70 bg-blue-50 text-blue-800",
    dotClassName: "bg-blue-600",
  },
  "fully-funded": {
    label: "Fully funded",
    className:
      "border-stone-200 bg-stone-100 text-stone-700",
    dotClassName: "bg-stone-500",
  },
};

export function OpportunityStatusBadge({
  status,
}: OpportunityStatusProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em]",
        config.className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          config.dotClassName,
        )}
      />

      {config.label}
    </span>
  );
}