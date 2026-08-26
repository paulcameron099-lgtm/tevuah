import type { ReactNode } from "react";

import { OnboardingProgress } from "@/src/components/onboarding/onboarding-progress";

type OnboardingLayoutProps = {
  children: ReactNode;
};

export default function OnboardingLayout({
  children,
}: OnboardingLayoutProps) {
  return (
    <div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
          Investor onboarding
        </p>

        <h1 className="font-display mt-4 text-4xl font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
          Complete your investor profile.
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Complete the required identity, investor,
          suitability and tax information before
          accessing eligible investment opportunities.
        </p>
      </div>

      <div className="mt-8">
        <OnboardingProgress />
      </div>

      <div className="mt-8">
        {children}
      </div>
    </div>
  );
}