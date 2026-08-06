import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowDown,
  Leaf,
  ShieldCheck,
} from "lucide-react";

import { InvestmentMarketplace } from "@/src/components/investments/investment-marketplace";
import { Container } from "@/src/components/ui/container";
import { opportunities } from "@/src/data/opportunities";

export const metadata: Metadata = {
  title: "Investment Opportunities",
  description:
    "Explore illustrative vineyard, olive estate, AgTech and fine-wine opportunities through the Tevuah Reserve marketplace.",
};

export default function InvestmentsPage() {
  return (
    <main className="bg-ivory-100">
      <section className="relative flex min-h-155 items-end overflow-hidden bg-forest-950 pt-19 text-white lg:min-h-170 lg:pt-22">
        <Image
          src="/images/hero/investments-page-hero.jpg"
          alt="Cultivated landscape representing Tevuah Reserve investment opportunities"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-linear-to-r from-forest-950 via-forest-950/78 to-forest-950/25" />
        <div className="absolute inset-0 bg-linear-to-t from-forest-950/85 via-transparent to-forest-950/15" />

        <Container className="relative z-10 pb-14 pt-20 sm:pb-18 lg:pb-20">
          <div className="max-w-5xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-gold-400" />

              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
                Investment marketplace
              </p>
            </div>

            <h1 className="font-display mt-7 max-w-5xl text-balance text-5xl leading-[0.94] font-medium tracking-[-0.045em] sm:text-6xl lg:text-8xl">
              Explore opportunities rooted in enduring assets.
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
              Discover illustrative opportunities across vineyard
              estates, olive agriculture, AgTech infrastructure and
              professionally managed fine wine.
            </p>
          </div>

          <div className="mt-12 grid gap-5 border-t border-white/15 pt-7 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <Leaf className="mt-0.5 size-5 text-gold-400" />

              <div>
                <p className="text-sm font-semibold text-white">
                  Cultivated assets
                </p>

                <p className="mt-1 text-xs leading-5 text-white/45">
                  Land, technology and collections
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 text-gold-400" />

              <div>
                <p className="text-sm font-semibold text-white">
                  Clear disclosures
                </p>

                <p className="mt-1 text-xs leading-5 text-white/45">
                  Risk-aware opportunity information
                </p>
              </div>
            </div>

            <a
              href="#marketplace"
              className="focus-ring flex items-center gap-3 rounded-md text-sm font-semibold text-white/70 transition hover:text-white sm:justify-end"
            >
              Browse marketplace

              <span className="flex size-10 items-center justify-center rounded-full border border-white/20">
                <ArrowDown className="size-4" />
              </span>
            </a>
          </div>
        </Container>
      </section>

      <section
        id="marketplace"
        className="py-16 sm:py-20 lg:py-24"
      >
        <Container>
          <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Current opportunities
              </p>

              <h2 className="font-display mt-5 max-w-4xl text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl lg:text-6xl">
                Find an opportunity that matches your perspective.
              </h2>
            </div>

            <p className="max-w-xl text-sm leading-7 text-stone-700 lg:justify-self-end">
              Use the marketplace filters to compare asset classes,
              locations, investment minimums, status and illustrative risk
              classifications.
            </p>
          </div>

          <InvestmentMarketplace
            opportunities={opportunities}
          />

          <div className="mt-12 rounded-2xl border border-gold-500/25 bg-gold-500/5 px-6 py-5">
            <p className="text-xs leading-6 text-stone-700">
              The opportunities, images, locations, funding values and
              classifications shown in this marketplace are illustrative
              development content. They are not live investment offers and
              do not represent guaranteed performance.
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}