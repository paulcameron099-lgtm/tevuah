import type { ReactNode } from "react";

import {
  ArrowUpRight,
  BriefcaseBusiness,
  FileText,
  WalletCards,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { getCurrentUser } from "@/src/lib/auth/get-current-user";

export default async function DashboardPage() {
  const user =
    await getCurrentUser();

  return (
    <div>
      <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
            Portfolio overview
          </p>

          <h1 className="font-display mt-4 text-4xl font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
            Welcome
            {user?.first_name
              ? `, ${user.first_name}`
              : ""}
            .
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
            This is your Tevuah Reserve investor
            dashboard. Portfolio data will appear here
            as your investment account is completed.
          </p>
        </div>

        <Button
          href="/investments"
          variant="secondary"
          size="lg"
          className="w-fit"
        >
          Explore opportunities
          <ArrowUpRight className="size-4" />
        </Button>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <DashboardMetric
          label="Portfolio value"
          value="€0"
          description="No funded investments yet"
          icon={
            <WalletCards className="size-5" />
          }
        />

        <DashboardMetric
          label="Active investments"
          value="0"
          description="No active holdings"
          icon={
            <BriefcaseBusiness className="size-5" />
          }
        />

        <DashboardMetric
          label="Documents"
          value="0"
          description="No investor documents yet"
          icon={
            <FileText className="size-5" />
          }
        />
      </div>

      <div className="mt-8 rounded-[1.75rem] border border-forest-900/10 bg-white p-7 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Getting started
        </p>

        <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
          Complete your investor profile.
        </h2>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
          Investor onboarding, identity verification
          and eligibility status will appear here in
          the next development phase.
        </p>

        <Button
          href="/dashboard/profile"
          variant="secondary"
          size="md"
          className="mt-6"
        >
          Review profile
        </Button>
      </div>
    </div>
  );
}

type DashboardMetricProps = {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
};

function DashboardMetric({
  label,
  value,
  description,
  icon,
}: DashboardMetricProps) {
  return (
    <article className="rounded-3xl border border-forest-900/10 bg-white p-6">
      <div className="flex items-center justify-between">
        <span className="flex size-11 items-center justify-center rounded-full bg-forest-950 text-gold-400">
          {icon}
        </span>
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
        {label}
      </p>

      <p className="font-display mt-2 text-4xl font-semibold text-forest-950">
        {value}
      </p>

      <p className="mt-2 text-xs text-stone-500">
        {description}
      </p>
    </article>
  );
}