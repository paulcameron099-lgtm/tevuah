"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { usePathname } from "next/navigation";

import { onboardingSteps } from "@/src/config/onboarding-navigation";
import { cn } from "@/src/lib/utils";

type OnboardingProgressProps = {
  completedSteps?: string[];
};

export function OnboardingProgress({
  completedSteps = [],
}: OnboardingProgressProps) {
  const pathname = usePathname();

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max gap-3 pb-2">
        {onboardingSteps.map((step) => {
          const Icon = step.icon;

          const active =
            pathname === step.href;

          const completed =
            completedSteps.includes(step.id);

          return (
            <Link
              key={step.id}
              href={step.href}
              className={cn(
                "flex min-w-47.5 items-center gap-3 rounded-xl border p-3 transition",
                active
                  ? "border-forest-950 bg-forest-950 text-white"
                  : "border-forest-900/10 bg-white text-forest-950",
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full",
                  active
                    ? "bg-gold-500 text-forest-950"
                    : completed
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-ivory-100 text-stone-500",
                )}
              >
                {completed ? (
                  <Check className="size-4" />
                ) : (
                  <Icon className="size-4" />
                )}
              </span>

              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.13em] opacity-50">
                  Step {step.number}
                </p>

                <p className="mt-0.5 text-xs font-semibold">
                  {step.label}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}