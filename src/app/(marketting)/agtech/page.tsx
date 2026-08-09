import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Database,
  FileCheck2,
  Satellite,
  ShieldCheck,
} from "lucide-react";

import { AgTechPillarCard } from "@/src/components/agtech/agtech-pillar-card";
import { IntelligenceMetricCard } from "@/src/components/agtech/intelligence-metric-card";
import { MonitoringWorkflow } from "@/src/components/agtech/monitoring-workflow";
import { EstateCard } from "@/src/components/estates/estate-card";
import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import {
  agTechPillars,
  intelligenceMetrics,
  monitoringSteps,
} from "@/src/data/agtech-platform";
import { featuredEstates } from "@/src/data/estates";

export const metadata: Metadata = {
  title: "AgTech",
  description:
    "Explore the Tevuah Reserve agricultural intelligence approach across estate monitoring, irrigation, field data and investor reporting.",
};

const reportingPrinciples = [
  "Source and timestamp visibility",
  "Estate-specific measurements",
  "Clear distinction between raw and interpreted data",
  "Investor-friendly reporting",
];

export default function AgTechPage() {
  return (
    <main className="bg-ivory-100">
      <section className="relative flex min-h-180 items-end overflow-hidden bg-forest-950 pt-19 text-white lg:pt-22">
        <Image
          src="/images/hero/agtech-page-hero.jpg"
          alt="Precision agriculture representing the Tevuah Reserve AgTech platform"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-linear-to-r from-forest-950 via-forest-950/82 to-forest-950/25" />
        <div className="absolute inset-0 bg-linear-to-t from-forest-950/88 via-transparent to-forest-950/15" />

        <Container className="relative z-10 pb-16 pt-24 lg:pb-20">
          <div className="max-w-5xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-gold-400" />

              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
                Agricultural intelligence
              </p>
            </div>

            <h1 className="font-display mt-7 max-w-5xl text-balance text-5xl leading-[0.94] font-medium tracking-[-0.045em] sm:text-6xl lg:text-8xl">
              Better estate visibility begins in the field.
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
              Tevuah Reserve is designed to bring operational
              agricultural information into a structured investor
              experience through monitoring, reporting and
              verified estate updates.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button href="#estate-intelligence" size="lg">
                Explore estate intelligence
                <ArrowDown className="size-4" />
              </Button>

              <Button
                href="/investments?category=agtech"
                variant="outline"
                size="lg"
                className="border-white/25 text-white hover:bg-white/10 hover:text-white"
              >
                View AgTech opportunities
                <ArrowUpRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="mt-14 grid gap-6 border-t border-white/15 pt-7 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-white/40">
                Monitoring
              </p>

              <p className="mt-2 text-sm font-semibold">
                Estate-level observations
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-white/40">
                Reporting
              </p>

              <p className="mt-2 text-sm font-semibold">
                Structured investor information
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-white/40">
                Purpose
              </p>

              <p className="mt-2 text-sm font-semibold">
                Improved transparency
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Technology pillars
              </p>
            </div>

            <div>
              <h2 className="font-display max-w-4xl text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl lg:text-6xl">
                Technology should support the estate—not distract
                from the asset.
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-8 text-stone-700">
                The objective is not to turn agriculture into a
                technology demonstration. Data should make estate
                operations easier to understand, verify and report.
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {agTechPillars.map((pillar, index) => (
              <AgTechPillarCard
                key={pillar.id}
                pillar={pillar}
                index={index}
              />
            ))}
          </div>
        </Container>
      </section>

      <section
        id="estate-intelligence"
        className="overflow-hidden bg-forest-950 py-16 text-white sm:py-20 lg:py-24"
      >
        <Container>
          <div className="grid gap-14 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-20">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-9 bg-gold-400" />

                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
                  Estate intelligence
                </p>
              </div>

              <h2 className="font-display mt-6 max-w-3xl text-balance text-4xl leading-none font-medium tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                Turn field information into investor visibility.
              </h2>

              <p className="mt-7 max-w-xl text-base leading-8 text-white/60">
                A future Tevuah Reserve investor dashboard can
                present selected estate readings, trends and
                operational milestones after they have been
                validated and approved for reporting.
              </p>

              <div className="mt-8 space-y-4">
                {reportingPrinciples.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-white/75"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10">
                      <Check className="size-3.5 text-gold-400" />
                    </span>

                    {item}
                  </div>
                ))}
              </div>

              <Button
                href="/estates"
                size="lg"
                className="mt-9"
              >
                Explore estate profiles
                <ArrowUpRight className="size-4" />
              </Button>
            </div>

            <div className="relative">
              <div className="relative min-h-245 overflow-hidden rounded-4xl border border-white/10 bg-forest-900 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:min-h-190">
                <Image
                  src="/images/agtech/agtech-field-monitoring.jpg"
                  alt="Agricultural estate monitoring interface"
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-linear-to-t from-forest-950 via-forest-950/72 to-forest-950/20" />

                <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-white/10 bg-forest-950/45 px-5 py-4 backdrop-blur-md sm:px-7">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-gold-500/15 text-gold-400">
                      <Satellite className="size-4" />
                    </span>

                    <div>
                      <p className="text-sm font-semibold">
                        Estate intelligence console
                      </p>

                      <p className="mt-0.5 text-[0.62rem] uppercase tracking-[0.14em] text-white/40">
                        Demonstration dashboard
                      </p>
                    </div>
                  </div>

                  <span className="flex items-center gap-2 text-xs text-white/55">
                    <span className="size-2 rounded-full bg-emerald-400" />
                    Data active
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                  <div className="mb-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-forest-950/60 p-5 backdrop-blur-md">
                      <p className="text-xs uppercase tracking-[0.14em] text-white/40">
                        Estate
                      </p>

                      <p className="font-display mt-2 text-2xl font-semibold">
                        Val d’Orcia
                      </p>

                      <p className="mt-2 text-xs text-white/45">
                        Tuscany · Vineyard estate
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-forest-950/60 p-5 backdrop-blur-md">
                      <p className="text-xs uppercase tracking-[0.14em] text-white/40">
                        Overall status
                      </p>

                      <p className="font-display mt-2 text-2xl font-semibold text-gold-400">
                        86%
                      </p>

                      <p className="mt-2 text-xs text-white/45">
                        Illustrative estate health
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {intelligenceMetrics.map((metric) => (
                      <IntelligenceMetricCard
                        key={metric.id}
                        metric={metric}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/4 px-6 py-5">
            <p className="text-xs leading-6 text-white/45">
              All metrics shown in this interface are illustrative.
              Genuine estate reporting should identify the data
              source, collection time, measurement method and
              verification status.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="mb-12 max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
              Monitoring workflow
            </p>

            <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl lg:text-6xl">
              From the field to the investor dashboard.
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-700">
              Good reporting requires more than simply receiving
              sensor readings. Information needs a clear path from
              source to validation, interpretation and publication.
            </p>
          </div>

          <MonitoringWorkflow steps={monitoringSteps} />
        </Container>
      </section>

      <section className="border-y border-forest-900/10 bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
            <div className="relative min-h-130 overflow-hidden rounded-4xl">
              <Image
                src="/images/agtech/agtech-irrigation-control.jpg"
                alt="Agricultural irrigation technology"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-t from-forest-950/65 via-transparent to-transparent" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Precision irrigation
              </p>

              <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                Water visibility can support better estate
                management.
              </h2>

              <p className="mt-6 text-base leading-8 text-stone-700">
                Irrigation data can help operators understand
                resource usage, timing and selected performance
                indicators. It should support operational
                decisions rather than imply guaranteed agricultural
                outcomes.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-forest-900/10 bg-ivory-100 p-5">
                  <Database className="size-5 text-gold-600" />

                  <p className="mt-4 font-semibold text-forest-950">
                    Logged readings
                  </p>

                  <p className="mt-2 text-xs leading-6 text-stone-600">
                    Store timestamped measurements and
                    infrastructure activity.
                  </p>
                </div>

                <div className="rounded-xl border border-forest-900/10 bg-ivory-100 p-5">
                  <FileCheck2 className="size-5 text-gold-600" />

                  <p className="mt-4 font-semibold text-forest-950">
                    Approved reporting
                  </p>

                  <p className="mt-2 text-xs leading-6 text-stone-600">
                    Publish selected metrics only after appropriate
                    review.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
            <div className="order-2 lg:order-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Remote estate visibility
              </p>

              <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                Combine field observations with broader estate
                context.
              </h2>

              <p className="mt-6 text-base leading-8 text-stone-700">
                Drone and satellite imagery may help identify
                patterns across larger areas, while operator
                inspections remain important for understanding
                what is actually happening on the ground.
              </p>

              <div className="mt-8 flex items-start gap-4 rounded-3xl border border-gold-500/25 bg-gold-500/5 p-6">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold-600" />

                <p className="text-sm leading-7 text-stone-700">
                  Technology should improve reporting discipline,
                  not be used to create a false impression of
                  certainty or eliminate agricultural risk.
                </p>
              </div>
            </div>

            <div className="relative order-1 min-h-130 overflow-hidden rounded-4xl lg:order-2">
              <Image
                src="/images/agtech/agtech-drone-monitoring.jpg"
                alt="Drone monitoring agricultural land"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-t from-forest-950/45 via-transparent to-transparent" />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-ivory-50 py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Estate examples
              </p>

              <h2 className="font-display mt-5 max-w-4xl text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                See how agricultural intelligence connects to the
                asset itself.
              </h2>
            </div>

            <Button
              href="/estates"
              variant="secondary"
              size="lg"
              className="w-fit"
            >
              View all estates
              <ArrowUpRight className="size-4" />
            </Button>
          </div>

          <div className="mt-10 grid gap-7 lg:grid-cols-2">
            {featuredEstates.map((estate) => (
              <EstateCard
                key={estate.id}
                estate={estate}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-forest-950 py-16 text-white sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                From field to portfolio
              </p>

              <h2 className="font-display mt-5 max-w-4xl text-4xl leading-none font-medium tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                Agricultural intelligence becomes most valuable
                when investors can understand it.
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-8 text-white/60">
                Later, we’ll connect verified estate metrics,
                updates and milestones directly into each
                investor’s portfolio dashboard.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Button href="/investments?category=agtech" size="lg">
                Explore AgTech investments
              </Button>

              <Button
                href="/register"
                variant="outline"
                size="lg"
                className="border-white/25 text-white hover:bg-white/10 hover:text-white"
              >
                Create investor account
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}