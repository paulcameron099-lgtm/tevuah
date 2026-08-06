import { ChevronDown } from "lucide-react";

import { cn } from "@/src/lib/utils";

type FilterOption = {
  label: string;
  value: string;
};

type FilterSelectProps = {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  className?: string;
};

export function FilterSelect({
  id,
  label,
  value,
  options,
  onChange,
  className,
}: FilterSelectProps) {
  return (
    <div className={cn("relative", className)}>
      <label
        htmlFor={id}
        className="mb-2 block text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-stone-500"
      >
        {label}
      </label>

      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="focus-ring min-h-12 w-full appearance-none rounded-xl border border-forest-900/10 bg-white py-3 pl-4 pr-11 text-sm font-medium text-forest-950 outline-none transition hover:border-forest-900/20"
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-stone-500" />
      </div>
    </div>
  );
}