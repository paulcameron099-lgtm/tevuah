import { cn } from "@/src/lib/utils";
import type { EstateStatus } from "@/src/types/estate";

type EstateStatusBadgeProps = {
  status: EstateStatus;
};

const statusStyles: Record<EstateStatus, string> = {
  Operating:
    "border-emerald-200 bg-emerald-50 text-emerald-800",
  Development:
    "border-amber-200 bg-amber-50 text-amber-800",
  Illustrative:
    "border-stone-200 bg-stone-100 text-stone-700",
};

export function EstateStatusBadge({
  status,
}: EstateStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.13em]",
        statusStyles[status],
      )}
    >
      {status}
    </span>
  );
}