import Image from "next/image";
import {
  ArrowUpRight,
  BadgeCheck,
  MapPin,
  PackageCheck,
  Thermometer,
} from "lucide-react";

import { WineFeatureCard } from "@/src/components/marketing/wine-feature-card";
import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import { Section } from "@/src/components/ui/section";
import { fineWineFeatures } from "@/src/data/fine-wine-features";

const collectionDetails = [
  {
    label: "Storage environment",
    value: "Climate controlled",
    icon: Thermometer,
  },
  {
    label: "Provenance status",
    value: "Documented",
    icon: BadgeCheck,
  },
  {
    label: "Custody location",
    value: "Specialist facility",
    icon: MapPin,
  },
  {
    label: "Collection handling",
    value: "Professional",
    icon: PackageCheck,
  },
];

export function WineSection() {
  return (
    <Section className="overflow-hidden bg-burgundy-900 text-white">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-9 bg-gold-400" />

              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
                Fine-wine assets
              </p>
            </div>

            <h2 className="font-display mt-6 max-w-4xl text-balance text-4xl leading-[0.98] font-medium tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              A collection built for more than the cellar.
            </h2>

            <p className="mt-7 max-w-2xl text-base leading-8 text-white/65">
              Tevuah Reserve can provide investors with carefully presented
              access to fine-wine opportunities supported by provenance
              records, professional storage, documented custody and
              transparent portfolio reporting.
            </p>

            <div className="mt-10 grid gap-7 sm:grid-cols-2">
              {fineWineFeatures.map((feature) => (
                <WineFeatureCard
                  key={feature.id}
                  feature={feature}
                />
              ))}
            </div>

            <Button
              href="/fine-wine"
              size="lg"
              className="mt-10"
            >
              Explore fine wine
              <ArrowUpRight className="size-4" />
            </Button>
          </div>

          <div className="relative">
            <div className="relative min-h-190 overflow-hidden rounded-4xl border border-white/10 bg-burgundy-800 shadow-[0_30px_100px_rgba(20,4,9,0.4)] sm:min-h-170">
              <Image
                src="/images/wine/fine-wine-section.jpg"
                alt="A professional wine cellar representing Tevuah Reserve fine-wine assets"
                fill
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-t from-burgundy-900 via-burgundy-900/55 to-burgundy-900/10" />

              <div className="absolute left-5 right-5 top-5 rounded-2xl border border-white/15 bg-burgundy-900/50 p-5 backdrop-blur-md sm:left-7 sm:right-auto sm:max-w-sm">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold-400">
                  Illustrative collection
                </p>

                <p className="font-display mt-2 text-2xl font-medium text-white">
                  European Fine-Wine Reserve
                </p>

                <p className="mt-2 text-xs leading-5 text-white/50">
                  Demonstration interface for collection reporting.
                </p>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                <div className="rounded-3xl border border-white/15 bg-burgundy-900/70 p-5 backdrop-blur-xl sm:p-6">
                  <div className="flex items-end justify-between gap-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                        Illustrative collection value
                      </p>

                      <p className="font-display mt-2 text-4xl font-semibold text-white">
                        €485,000
                      </p>
                    </div>

                    <span className="rounded-full border border-gold-400/25 bg-gold-400/10 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-gold-400">
                      Demonstration
                    </span>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {collectionDetails.map((detail) => {
                      const Icon = detail.icon;

                      return (
                        <div
                          key={detail.label}
                          className="rounded-xl border border-white/10 bg-white/5 p-4"
                        >
                          <div className="flex items-start gap-3">
                            <Icon className="mt-0.5 size-4 shrink-0 text-gold-400" />

                            <div>
                              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-white/40">
                                {detail.label}
                              </p>

                              <p className="mt-1 text-sm font-semibold text-white">
                                {detail.value}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="absolute -right-20 -top-20 size-64 rounded-full bg-gold-500/10 blur-3xl"
            />
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/4 px-6 py-5">
          <p className="text-xs leading-6 text-white/45">
            Fine wine can be illiquid and may involve storage, insurance,
            valuation, authenticity, custody and resale risks. The figures and
            collection information shown here are illustrative and do not
            represent a live investment product.
          </p>
        </div>
      </Container>
    </Section>
  );
}