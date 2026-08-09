import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Droplets,
  Leaf,
  MapPin,
  RadioTower,
  Road,
  Satellite,
  Sprout,
  Warehouse,
} from "lucide-react";

import { EstateGallery } from "@/src/components/estates/estate-gallery";
import { EstateInfoCard } from "@/src/components/estates/estate-info-card";
import { EstateMetrics } from "@/src/components/estates/estate-metrics";
import { EstateStatusBadge } from "@/src/components/estates/estate-status-badge";
import { OpportunityCard } from "@/src/components/marketing/opportunity-card";
import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import {
  estates,
  getEstateBySlug,
} from "@/src/data/estates";
import { opportunities } from "@/src/data/opportunities";

type EstatePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return estates.map((estate) => ({
    slug: estate.slug,
  }));
}

export async function generateMetadata({
  params,
}: EstatePageProps): Promise<Metadata> {
  const { slug } = await params;
  const estate = getEstateBySlug(slug);

  if (!estate) {
    return {
      title: "Estate not found",
    };
  }

  return {
    title: estate.name,
    description: estate.summary,
    openGraph: {
      title: estate.name,
      description: estate.summary,
      images: [
        {
          url: estate.heroImage,
          alt: estate.name,
        },
      ],
    },
  };
}

export default async function EstatePage({
  params,
}: EstatePageProps) {
  const { slug } = await params;
  const estate = getEstateBySlug(slug);

  if (!estate) {
    notFound();
  }

  const relatedOpportunities = opportunities.filter(
    (opportunity) =>
      estate.relatedOpportunitySlugs.includes(
        opportunity.slug,
      ),
  );

  const infrastructureIcons = [
    Leaf,
    Droplets,
    Road,
    Warehouse,
  ];

  const technologyIcons = [
    Satellite,
    RadioTower,
    Sprout,
  ];

  return (
    <main className="bg-ivory-100 pt-19 lg:pt-22">
      <section className="relative min-h-175 overflow-hidden bg-forest-950 text-white">
        <Image
          src={estate.heroImage}
          alt={`${estate.name} illustrative estate`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-linear-to-r from-forest-950 via-forest-950/82 to-forest-950/20" />

        <div className="absolute inset-0 bg-linear-to-t from-forest-950/85 via-transparent to-forest-950/15" />

        <Container className="relative z-10 flex min-h-175 flex-col justify-end py-16 lg:py-20">
          <Button
            href="/estates"
            variant="outline"
            size="sm"
            className="mb-10 w-fit border-white/25 bg-forest-950/20 text-white hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="size-4 shrink-0" />
            All estates
          </Button>

          <div className="flex flex-wrap gap-3">
            <EstateStatusBadge status={estate.status} />

            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] backdrop-blur-md">
              Illustrative estate
            </span>
          </div>

          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
            {estate.estateTypeLabel}
          </p>

          <h1 className="font-display mt-5 max-w-5xl text-balance text-5xl leading-[0.94] font-medium tracking-[-0.045em] sm:text-6xl lg:text-8xl">
            {estate.name}
          </h1>

          <div className="mt-7 flex items-center gap-2 text-sm text-white/75">
            <MapPin className="size-4 text-gold-400" />
            {estate.location}
          </div>
        </Container>
      </section>

      <section className="border-b border-forest-900/10 bg-white py-7">
        <Container>
          <EstateMetrics metrics={estate.metrics} />
        </Container>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Estate overview
              </p>

              <h2 className="font-display mt-5 text-4xl font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                Productive land with visible operating context.
              </h2>
            </div>

            <div>
              <p className="text-base leading-8 text-stone-700">
                {estate.description}
              </p>

              <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-forest-900/10 pt-7">
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-stone-500">
                    Established
                  </dt>

                  <dd className="mt-2 font-semibold text-forest-950">
                    {estate.established}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-stone-500">
                    Primary crop
                  </dt>

                  <dd className="mt-2 font-semibold text-forest-950">
                    {estate.primaryCrop}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-14">
            <EstateGallery images={estate.gallery} />
          </div>
        </Container>
      </section>

      <section className="border-y border-forest-900/10 bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="mb-10 max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
              Estate infrastructure
            </p>

            <h2 className="font-display mt-5 text-4xl font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
              The physical systems supporting agricultural operations.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {estate.infrastructure.map(
              (item, index) => {
                const Icon =
                  infrastructureIcons[
                    index %
                      infrastructureIcons.length
                  ];

                return (
                  <EstateInfoCard
                    key={item.title}
                    icon={<Icon className="size-5" />}
                    title={item.title}
                    description={item.description}
                  />
                );
              },
            )}
          </div>
        </Container>
      </section>

      <section className="bg-forest-950 py-16 text-white sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                Estate intelligence
              </p>

              <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] sm:text-5xl">
                Agricultural reporting designed around the estate.
              </h2>

              <p className="mt-6 text-sm leading-7 text-white/60">
                Genuine operational reporting would require
                verified data sources, measurement timestamps and
                clear explanations of how each metric was
                collected.
              </p>

              <Button
                href="/agtech"
                size="lg"
                className="mt-8"
              >
                Explore AgTech
                <ArrowUpRight className="size-4" />
              </Button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {estate.technology.map(
                (item, index) => {
                  const Icon =
                    technologyIcons[
                      index %
                        technologyIcons.length
                    ];

                  return (
                    <article
                      key={item.title}
                      className="rounded-3xl border border-white/10 bg-white/5 p-6"
                    >
                      <span className="flex size-11 items-center justify-center rounded-full bg-gold-500/15 text-gold-400">
                        <Icon className="size-5" />
                      </span>

                      <h3 className="font-display mt-6 text-2xl font-semibold">
                        {item.title}
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-white/55">
                        {item.description}
                      </p>
                    </article>
                  );
                },
              )}
            </div>
          </div>
        </Container>
      </section>

      {relatedOpportunities.length > 0 ? (
        <section className="py-16 sm:py-20 lg:py-24">
          <Container>
            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Related investments
                </p>

                <h2 className="font-display mt-5 max-w-3xl text-4xl font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                  Explore opportunities connected to this estate.
                </h2>
              </div>

              <Link
                href="/investments"
                className="focus-ring inline-flex w-fit items-center gap-2 rounded-md text-sm font-semibold text-forest-950 transition hover:text-olive-700"
              >
                All opportunities
                <ArrowUpRight className="size-4" />
              </Link>
            </div>

            <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {relatedOpportunities.map(
                (opportunity) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                  />
                ),
              )}
            </div>
          </Container>
        </section>
      ) : null}

      <section className="border-t border-forest-900/10 bg-white py-12">
        <Container>
          <p className="max-w-4xl text-xs leading-6 text-stone-500">
            All estate imagery, agricultural statistics,
            coordinates and infrastructure information displayed
            on this development page are illustrative. Verified
            property records, operator information, title
            documents and site-specific data would be required
            before publishing a genuine estate profile.
          </p>
        </Container>
      </section>
    </main>
  );
}