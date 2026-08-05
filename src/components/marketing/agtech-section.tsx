import Image from "next/image";
import {
  ArrowUpRight,
  Check,
  Satellite,
  ScanLine,
} from "lucide-react";

import { AgTechMetricCard } from "@/src/components/marketing/agtech-metric-card";
import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import { Section } from "@/src/components/ui/section";
import { agTechMetrics } from "@/src/data/agtech-metrics";

const transparencyFeatures = [
  "Estate operating updates",
  "Irrigation and water-use data",
  "Crop and harvest indicators",
  "Weather and field observations",
];

export function AgTechSection() {
  return (
    <Section className="overflow-hidden bg-forest-950 text-white">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-20">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-9 bg-gold-400" />

              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
                AgTech transparency
              </p>
            </div>

            <h2 className="font-display mt-6 max-w-3xl text-balance text-4xl leading-none font-medium tracking-[-0.035em] sm:text-5xl lg:text-6xl">
              Every estate has a story. Investors deserve the data behind it.
            </h2>

            <p className="mt-7 max-w-xl text-base leading-8 text-white/60">
              Tevuah Reserve can bring estate reporting, agricultural metrics
              and project milestones into one investor experience—without
              suggesting that technology removes investment risk.
            </p>

            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {transparencyFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-3 text-sm text-white/75"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <Check className="size-3.5 text-gold-400" />
                  </span>

                  {feature}
                </li>
              ))}
            </ul>

            <Button
              href="/agtech"
              size="lg"
              className="mt-9"
            >
              Explore our AgTech approach
              <ArrowUpRight className="size-4" />
            </Button>
          </div>

          <div className="relative">
            <div className="relative min-h-235 overflow-hidden rounded-4xl border border-white/10 bg-forest-900 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:min-h-190">
              <Image
                src="/images/agtech/agtech-field-monitoring.jpg"
                alt="Agricultural field monitoring representing Tevuah Reserve reporting technology"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-t from-forest-950 via-forest-950/70 to-forest-950/20" />

              <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-white/10 bg-forest-950/40 px-5 py-4 backdrop-blur-md sm:px-7">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-gold-500/15 text-gold-400">
                    <Satellite className="size-4" />
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Estate intelligence
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
                <div className="mb-5 flex items-center justify-between rounded-2xl border border-white/10 bg-forest-950/55 p-4 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <ScanLine className="size-5 text-gold-400" />

                    <div>
                      <p className="text-sm font-semibold text-white">
                        Estate health overview
                      </p>

                      <p className="mt-1 text-xs text-white/45">
                        Last illustrative update: today
                      </p>
                    </div>
                  </div>

                  <p className="font-display text-2xl font-semibold text-gold-400">
                    86%
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {agTechMetrics.map((metric) => (
                    <AgTechMetricCard
                      key={metric.id}
                      metric={metric}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="absolute -right-24 -top-24 z-0 size-64 rounded-full bg-gold-500/10 blur-3xl"
            />

            <div
              aria-hidden="true"
              className="absolute -bottom-20 -left-16 z-0 size-64 rounded-full bg-olive-500/10 blur-3xl"
            />
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/4 px-6 py-5">
          <p className="text-xs leading-6 text-white/45">
            The metrics shown in this section are illustrative interface data
            for the Tevuah Reserve design. Genuine estate information should
            come from verified operational sources and clearly identify when
            readings were collected, how they were measured and whether they
            were independently reviewed.
          </p>
        </div>
      </Container>
    </Section>
  );
}