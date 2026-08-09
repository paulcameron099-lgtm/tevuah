import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowDown,
  Leaf,
  MapPinned,
  Sprout,
} from "lucide-react";

import { EstateExplorer } from "@/src/components/estates/estate-explorer";
import { Container } from "@/src/components/ui/container";
import { estates } from "@/src/data/estates";

export const metadata: Metadata = {
  title: "Our Estates",
  description:
    "Explore illustrative vineyard and olive estates presented through the Tevuah Reserve investment platform.",
};

export default function EstatesPage() {
  const totalHectares = estates.reduce(
    (total, estate) => total + estate.totalHectares,
    0,
  );

  const productiveHectares = estates.reduce(
    (total, estate) =>
      total + estate.productiveHectares,
    0,
  );

  return (
    <main className="bg-ivory-100">
      <section className="relative flex min-h-170 items-end overflow-hidden bg-forest-950 pt-19 text-white lg:pt-22">
        <Image
          src="/images/hero/estates-page-hero.jpg"
          alt="Mediterranean cultivated landscape representing Tevuah Reserve estates"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-linear-to-r from-forest-950 via-forest-950/80 to-forest-950/25" />

        <div className="absolute inset-0 bg-linear-to-t from-forest-950/85 via-transparent to-forest-950/15" />

        <Container className="relative z-10 pb-14 pt-24 sm:pb-18 lg:pb-20">
          <div className="max-w-5xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-gold-400" />

              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
                Our estates
              </p>
            </div>

            <h1 className="font-display mt-7 max-w-5xl text-balance text-5xl leading-[0.94] font-medium tracking-[-0.045em] sm:text-6xl lg:text-8xl">
              Discover the places behind cultivated investment.
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
              Explore illustrative vineyard and olive estates
              through operating metrics, development context,
              agricultural infrastructure and related investment
              opportunities.
            </p>
          </div>

          <div className="mt-12 grid gap-6 border-t border-white/15 pt-7 sm:grid-cols-3">
            <div className="flex gap-3">
              <MapPinned className="mt-0.5 size-5 text-gold-400" />

              <div>
                <p className="text-sm font-semibold">
                  {estates.length} estates
                </p>

                <p className="mt-1 text-xs text-white/45">
                  Illustrative portfolio
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Sprout className="mt-0.5 size-5 text-gold-400" />

              <div>
                <p className="text-sm font-semibold">
                  {totalHectares} hectares
                </p>

                <p className="mt-1 text-xs text-white/45">
                  Total illustrative land
                </p>
              </div>
            </div>

            <a
              href="#estate-explorer"
              className="focus-ring flex items-center gap-3 rounded-md text-sm font-semibold text-white/70 transition hover:text-white sm:justify-end"
            >
              Explore estates

              <span className="flex size-10 items-center justify-center rounded-full border border-white/20">
                <ArrowDown className="size-4" />
              </span>
            </a>
          </div>
        </Container>
      </section>

      <section className="border-b border-forest-900/10 bg-white">
        <Container>
          <div className="grid divide-y divide-forest-900/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="py-8 sm:px-7 sm:first:pl-0">
              <p className="text-xs uppercase tracking-[0.15em] text-stone-500">
                Productive area
              </p>

              <p className="font-display mt-3 text-4xl font-semibold text-forest-950">
                {productiveHectares} ha
              </p>
            </div>

            <div className="py-8 sm:px-7">
              <p className="text-xs uppercase tracking-[0.15em] text-stone-500">
                Estate categories
              </p>

              <p className="font-display mt-3 text-4xl font-semibold text-forest-950">
                2
              </p>

              <p className="mt-2 text-xs text-stone-500">
                Vineyards and olive estates
              </p>
            </div>

            <div className="py-8 sm:px-7 sm:last:pr-0">
              <div className="flex items-center gap-3">
                <Leaf className="size-5 text-gold-600" />

                <p className="text-sm font-semibold text-forest-950">
                  Real-asset focus
                </p>
              </div>

              <p className="mt-3 text-xs leading-6 text-stone-500">
                Estate data shown during development is
                illustrative rather than verified property data.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section
        id="estate-explorer"
        className="py-16 sm:py-20 lg:py-24"
      >
        <Container>
          <div className="mb-12 grid gap-7 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Estate portfolio
              </p>

              <h2 className="font-display mt-5 max-w-4xl text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl lg:text-6xl">
                Explore productive land by region and asset.
              </h2>
            </div>

            <p className="max-w-xl text-sm leading-7 text-stone-700 lg:justify-self-end">
              Each estate profile is designed to combine
              agricultural information, infrastructure,
              operating context and related investment
              opportunities.
            </p>
          </div>

          <EstateExplorer estates={estates} />

          <div className="mt-12 rounded-2xl border border-gold-500/25 bg-gold-500/5 px-6 py-5">
            <p className="text-xs leading-6 text-stone-700">
              Estate names, locations, operating metrics,
              photographs and agricultural characteristics shown
              during development are illustrative. Verified data
              must replace demonstration content before any
              genuine investment offering is published.
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}