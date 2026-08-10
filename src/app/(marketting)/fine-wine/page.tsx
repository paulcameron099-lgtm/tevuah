import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUpRight,
  BadgeCheck,
  Boxes,
  FileCheck2,
  ShieldCheck,
  Thermometer,
  Wine,
} from "lucide-react";

import { OpportunityCard } from "@/src/components/marketing/opportunity-card";
import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import { WineHoldingsTable } from "@/src/components/fine-wine/wine-holdings-table";
import { WinePortfolioMetricCard } from "@/src/components/fine-wine/wine-portfolio-metric";
import { WinePrincipleCard } from "@/src/components/fine-wine/wine-principle-card";
import { WineRegionAllocation } from "@/src/components/fine-wine/wine-region-allocation";
import {
  wineCollectionHoldings,
  winePortfolioMetrics,
  winePrinciples,
  wineRegions,
} from "@/src/data/fine-wine-platform";
import { opportunities } from "@/src/data/opportunities";

export const metadata: Metadata = {
  title: "Fine Wine",
  description:
    "Explore the Tevuah Reserve approach to fine-wine sourcing, provenance, professional storage, custody and portfolio reporting.",
};

const fineWineOpportunities = opportunities.filter(
  (opportunity) => opportunity.category === "fine-wine",
);

const custodyPrinciples = [
  {
    title: "Climate control",
    description:
      "Appropriate temperature and humidity conditions are important for long-term storage.",
    icon: Thermometer,
  },
  {
    title: "Documented custody",
    description:
      "Storage location, ownership records and movement history should be clearly recorded.",
    icon: Boxes,
  },
  {
    title: "Condition review",
    description:
      "Selected holdings may require periodic visual or specialist condition checks.",
    icon: BadgeCheck,
  },
  {
    title: "Insurance framework",
    description:
      "High-value collections should have clear insurance and asset-protection arrangements.",
    icon: ShieldCheck,
  },
];

export default function FineWinePage() {
  return (
    <main className="bg-ivory-100">
      <section className="relative flex min-h-180 items-end overflow-hidden bg-burgundy-900 pt-19 text-white lg:pt-22">
        <Image
          src="/images/hero/fine-wine-page-hero.jpg"
          alt="Fine-wine cellar representing the Tevuah Reserve collection experience"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-linear-to-r from-burgundy-900 via-burgundy-900/84 to-burgundy-900/25" />

        <div className="absolute inset-0 bg-linear-to-t from-burgundy-900/92 via-transparent to-burgundy-900/20" />

        <Container className="relative z-10 pb-16 pt-24 lg:pb-20">
          <div className="max-w-5xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-gold-400" />

              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
                Fine-wine assets
              </p>
            </div>

            <h1 className="font-display mt-7 max-w-5xl text-balance text-5xl leading-[0.94] font-medium tracking-[-0.045em] sm:text-6xl lg:text-8xl">
              Provenance, patience and professional custody.
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
              Tevuah Reserve is designed to present fine-wine
              opportunities through careful sourcing,
              documented provenance, specialist storage and
              transparent portfolio reporting.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button href="#collection-experience" size="lg">
                Explore the collection
                <ArrowDown className="size-4" />
              </Button>

              <Button
                href="/investments?category=fine-wine"
                variant="outline"
                size="lg"
                className="border-white/25 text-white hover:bg-white/10 hover:text-white"
              >
                View wine opportunities
                <ArrowUpRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="mt-14 grid gap-6 border-t border-white/15 pt-7 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-white/40">
                Selection
              </p>

              <p className="mt-2 text-sm font-semibold">
                Carefully presented holdings
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-white/40">
                Custody
              </p>

              <p className="mt-2 text-sm font-semibold">
                Specialist storage
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-white/40">
                Reporting
              </p>

              <p className="mt-2 text-sm font-semibold">
                Portfolio-level visibility
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Collection principles
              </p>
            </div>

            <div>
              <h2 className="font-display max-w-4xl text-4xl leading-none font-medium tracking-[-0.035em] text-burgundy-900 sm:text-5xl lg:text-6xl">
                Fine wine requires more than selecting a desirable bottle.
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-8 text-stone-700">
                The investment experience should make sourcing,
                provenance, custody, storage and reporting visible
                instead of presenting wine solely as a luxury
                object.
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {winePrinciples.map((principle, index) => (
              <WinePrincipleCard
                key={principle.id}
                principle={principle}
                index={index}
              />
            ))}
          </div>
        </Container>
      </section>

      <section
        id="collection-experience"
        className="overflow-hidden bg-burgundy-900 py-16 text-white sm:py-20 lg:py-24"
      >
        <Container>
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-9 bg-gold-400" />

                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
                  Portfolio experience
                </p>
              </div>

              <h2 className="font-display mt-6 max-w-3xl text-balance text-4xl leading-none font-medium tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                See the collection as a portfolio, not simply a cellar.
              </h2>

              <p className="mt-7 max-w-xl text-base leading-8 text-white/60">
                A future investor dashboard can show holdings,
                vintages, custody status, storage information and
                illustrative valuation changes in one structured
                experience.
              </p>

              <div className="mt-8 flex items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
                <FileCheck2 className="mt-0.5 size-5 shrink-0 text-gold-400" />

                <p className="text-sm leading-7 text-white/60">
                  Genuine valuations should identify the source,
                  valuation date, methodology and any material
                  limitations.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="relative min-h-235 overflow-hidden rounded-4xl border border-white/10 bg-burgundy-800 shadow-[0_30px_100px_rgba(20,4,9,0.45)] sm:min-h-190">
                <Image
                  src="/images/wine/fine-wine-cellar-corridor.jpg"
                  alt="Fine-wine cellar portfolio interface"
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-linear-to-t from-burgundy-900 via-burgundy-900/75 to-burgundy-900/20" />

                <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-white/10 bg-burgundy-900/50 px-5 py-4 backdrop-blur-md sm:px-7">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-gold-500/15 text-gold-400">
                      <Wine className="size-4" />
                    </span>

                    <div>
                      <p className="text-sm font-semibold">
                        Fine-Wine Reserve
                      </p>

                      <p className="mt-0.5 text-[0.62rem] uppercase tracking-[0.14em] text-white/40">
                        Demonstration portfolio
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full border border-gold-400/25 bg-gold-400/10 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-gold-400">
                    Illustrative
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {winePortfolioMetrics.map((metric) => (
                      <WinePortfolioMetricCard
                        key={metric.id}
                        metric={metric}
                      />
                    ))}
                  </div>

                  <div className="mt-5">
                    <WineHoldingsTable
                      holdings={wineCollectionHoldings}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/4 px-6 py-5">
            <p className="text-xs leading-6 text-white/45">
              All holdings, producers, values and performance
              figures displayed here are fictitious demonstration
              content and are not investment recommendations or
              live portfolio data.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-burgundy-900/10 bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
            <div className="relative min-h-135 overflow-hidden rounded-4xl bg-burgundy-900">
              <Image
                src="/images/wine/fine-wine-provenance.jpg"
                alt="Fine-wine bottles representing provenance documentation"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-t from-burgundy-900/65 via-transparent to-transparent" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Provenance
              </p>

              <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-burgundy-900 sm:text-5xl">
                Know what the collection contains and where it came from.
              </h2>

              <p className="mt-6 text-base leading-8 text-stone-700">
                Provenance information can include producer,
                vintage, acquisition records, storage history,
                bottle condition and authenticity documentation.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Producer and vintage records",
                  "Acquisition history",
                  "Storage and custody trail",
                  "Condition and inspection notes",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm font-medium text-burgundy-900"
                  >
                    <span className="flex size-7 items-center justify-center rounded-full bg-burgundy-900 text-gold-400">
                      <BadgeCheck className="size-3.5" />
                    </span>

                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Storage and custody
              </p>

              <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-burgundy-900 sm:text-5xl">
                Physical assets need physical protection.
              </h2>

              <p className="mt-6 text-base leading-8 text-stone-700">
                Fine wine can be damaged by unsuitable storage,
                mishandling or poor custody controls. Storage and
                ownership records therefore matter as much as the
                collection itself.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {custodyPrinciples.map((item) => {
                  const Icon = item.icon;

                  return (
                    <article
                      key={item.title}
                      className="rounded-[1.25rem] border border-burgundy-900/10 bg-white p-5"
                    >
                      <Icon className="size-5 text-gold-600" />

                      <h3 className="mt-4 font-semibold text-burgundy-900">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-xs leading-6 text-stone-600">
                        {item.description}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="relative min-h-140 overflow-hidden rounded-4xl bg-burgundy-900">
              <Image
                src="/images/wine/fine-wine-storage.jpg"
                alt="Professional wine storage facility"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-t from-burgundy-900/55 via-transparent to-transparent" />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-burgundy-900/10 bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Regional allocation
              </p>

              <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-burgundy-900 sm:text-5xl">
                Understand where the collection is concentrated.
              </h2>

              <p className="mt-6 text-sm leading-7 text-stone-700">
                Geographic and producer concentration can affect
                portfolio behaviour, liquidity and exposure to
                market trends.
              </p>
            </div>

            <WineRegionAllocation regions={wineRegions} />
          </div>
        </Container>
      </section>

      <section className="bg-burgundy-900 py-16 text-white sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
            <div className="relative min-h-125 overflow-hidden rounded-4xl border border-white/10">
              <Image
                src="/images/wine/fine-wine-bottle-detail.jpg"
                alt="Fine-wine bottles in specialist storage"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-t from-burgundy-900/70 via-transparent to-transparent" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                Investment risks
              </p>

              <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] sm:text-5xl">
                Scarcity does not remove investment risk.
              </h2>

              <p className="mt-6 text-base leading-8 text-white/60">
                Fine-wine investing can involve significant
                uncertainty, long holding periods and specialist
                costs.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Limited liquidity and uncertain resale timing",
                  "Storage, insurance and custody costs",
                  "Authenticity and provenance risk",
                  "Changing demand and market pricing",
                  "Physical damage or storage failure",
                  "Valuation uncertainty",
                ].map((risk) => (
                  <div
                    key={risk}
                    className="flex items-start gap-3 text-sm leading-7 text-white/70"
                  >
                    <ShieldCheck className="mt-1 size-4 shrink-0 text-gold-400" />
                    {risk}
                  </div>
                ))}
              </div>

              <div className="mt-9 rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs leading-6 text-white/45">
                  No investment outcome, future valuation or resale
                  value should be guaranteed. Genuine offering
                  materials must contain project-specific risk
                  disclosures.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {fineWineOpportunities.length > 0 ? (
        <section className="py-16 sm:py-20 lg:py-24">
          <Container>
            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Fine-wine opportunities
                </p>

                <h2 className="font-display mt-5 max-w-4xl text-4xl leading-none font-medium tracking-[-0.035em] text-burgundy-900 sm:text-5xl">
                  Explore illustrative collection opportunities.
                </h2>
              </div>

              <Button
                href="/investments?category=fine-wine"
                variant="secondary"
                size="lg"
                className="w-fit"
              >
                View all fine-wine opportunities
                <ArrowUpRight className="size-4" />
              </Button>
            </div>

            <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {fineWineOpportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <section className="bg-forest-950 py-16 text-white sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                Build the collection experience
              </p>

              <h2 className="font-display mt-5 max-w-4xl text-4xl leading-none font-medium tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                Bring provenance, custody and portfolio reporting
                into one investor experience.
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-8 text-white/60">
                Later, authenticated investors will be able to
                review their wine holdings, documents, valuation
                history and transaction activity directly inside
                the Tevuah Reserve dashboard.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Button
                href="/investments?category=fine-wine"
                size="lg"
              >
                Explore wine investments
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