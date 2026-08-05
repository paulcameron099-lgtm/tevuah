import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";

import { AssetIntroduction } from "@/src/components/marketing/asset-introduction";
import { InvestmentCategories } from "@/src/components/marketing/investment-categories";
import { TrustStrip } from "@/src/components/marketing/trust-strip";
import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import { FeaturedOpportunities } from "@/src/components/marketing/featured-opportunities";
import { AgTechSection } from "@/src/components/marketing/agtech-section";
import { HowItWorks } from "@/src/components/marketing/how-it-works";
import { GovernanceSection } from "@/src/components/marketing/governance-section";
import { WineSection } from "@/src/components/marketing/wine-section";
import { FinalCta } from "@/src/components/marketing/final-cta";
import { InsightsPreview } from "@/src/components/marketing/insights-preview";

export default function HomePage() {
  return (
    <main>
      <section className="relative flex min-h-190 items-end overflow-hidden bg-forest-950 text-white sm:min-h-205 lg:min-h-screen">
        <Image
          src="/images/hero/tevuah-vineyard-hero.jpg"
          alt="A vineyard estate representing Tevuah Reserve investments"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,23,18,0.96)_0%,rgba(10,23,18,0.78)_42%,rgba(10,23,18,0.25)_100%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(10,23,18,0.85)_0%,transparent_60%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_25%,rgba(194,162,102,0.12),transparent_35%)]" />

        <Container className="relative z-10 pb-16 pt-36 sm:pb-20 sm:pt-44 lg:pb-24">
          <div className="max-w-5xl">
            <div className="mb-7 flex items-center gap-3">
              <span className="h-px w-10 bg-gold-500" />

              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">
                Tevuah Reserve
              </p>
            </div>

            <h1 className="font-display max-w-5xl text-balance text-[3.5rem] leading-[0.91] font-medium tracking-[-0.045em] sm:text-7xl lg:text-[6.2rem] xl:text-[7rem]">
              Where enduring assets take root.
            </h1>

            <p className="mt-8 max-w-2xl text-pretty text-base leading-8 text-white/70 sm:text-lg">
              Discover carefully considered opportunities across vineyard
              estates, olive agriculture, AgTech infrastructure and
              professionally managed fine wine.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button href="/investments" size="lg">
                Explore investments
                <ArrowUpRight className="size-4" />
              </Button>

              <Button
                href="/how-it-works"
                variant="outline"
                size="lg"
                className="border-white/25 text-white hover:bg-white/10"
              >
                How it works
              </Button>
            </div>
          </div>

          <div className="mt-16 flex flex-col gap-7 border-t border-white/15 pt-7 md:flex-row md:items-end md:justify-between lg:mt-20">
            <div className="grid max-w-3xl gap-5 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                  Asset focus
                </p>

                <p className="mt-2 text-sm text-white/80">
                  Productive real assets
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                  Reporting
                </p>

                <p className="mt-2 text-sm text-white/80">
                  Transparent estate data
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                  Perspective
                </p>

                <p className="mt-2 text-sm text-white/80">
                  Long-term stewardship
                </p>
              </div>
            </div>

            <a
              href="#introduction"
              className="focus-ring hidden items-center gap-3 rounded-full text-xs font-semibold uppercase tracking-[0.16em] text-white/60 transition hover:text-white md:flex"
            >
              Discover more

              <span className="flex size-10 items-center justify-center rounded-full border border-white/20">
                <ArrowDown className="size-4" />
              </span>
            </a>
          </div>
        </Container>
      </section>

      <TrustStrip />

      <AssetIntroduction />

      <InvestmentCategories />

      <FeaturedOpportunities />

      <HowItWorks />

      <AgTechSection />

      <WineSection />

      <GovernanceSection />

      <InsightsPreview />

      <FinalCta />
    </main>
  );
}