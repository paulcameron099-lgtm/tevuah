import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { FundingProgress } from "@/src/components/marketing/funding-progress";
import { OpportunityStatusBadge } from "@/src/components/marketing/opportunity-status";
import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import {
  featuredOpportunities,
  getOpportunityBySlug,
} from "@/src/data/opportunities";
import { formatCurrency } from "@/src/lib/formatters";

type OpportunityPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return featuredOpportunities.map((opportunity) => ({
    slug: opportunity.slug,
  }));
}

export async function generateMetadata({
  params,
}: OpportunityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const opportunity = getOpportunityBySlug(slug);

  if (!opportunity) {
    return {
      title: "Opportunity not found",
    };
  }

  return {
    title: opportunity.title,
    description: opportunity.summary,
  };
}

export default async function OpportunityPage({
  params,
}: OpportunityPageProps) {
  const { slug } = await params;
  const opportunity = getOpportunityBySlug(slug);

  if (!opportunity) {
    notFound();
  }

  return (
    <main className="bg-ivory-100 pt-19 lg:pt-22">
      <section className="relative min-h-155 overflow-hidden bg-forest-950 text-white">
        <Image
          src={opportunity.image}
          alt={`${opportunity.title} illustrative imagery`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-linear-to-r from-forest-950 via-forest-950/80 to-forest-950/25" />
        <div className="absolute inset-0 bg-linear-to-t from-forest-950/90 via-transparent to-transparent" />

        <Container className="relative z-10 flex min-h-155 flex-col justify-end py-16 sm:py-20">
          <Button
            href="/investments"
            variant="outline"
            size="sm"
            className="mb-10 w-fit border-white/25 text-white hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="size-4" />
            All opportunities
          </Button>

          <div className="flex flex-wrap items-center gap-3">
            <OpportunityStatusBadge status={opportunity.status} />

            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
              Illustrative opportunity
            </span>
          </div>

          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
            {opportunity.categoryLabel}
          </p>

          <h1 className="font-display mt-5 max-w-5xl text-balance text-5xl leading-[0.95] font-medium tracking-[-0.04em] sm:text-6xl lg:text-8xl">
            {opportunity.title}
          </h1>

          <div className="mt-7 flex items-center gap-2 text-base text-white/75">
            <MapPin className="size-5 text-gold-400" />
            {opportunity.location}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.4fr_0.75fr] lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Opportunity overview
              </p>

              <h2 className="font-display mt-5 text-4xl font-medium tracking-[-0.03em] text-forest-950 sm:text-5xl">
                An introduction to the opportunity.
              </h2>

              <p className="mt-7 max-w-3xl text-base leading-8 text-stone-700">
                {opportunity.summary}
              </p>

              <div className="mt-10 rounded-2xl border border-gold-500/25 bg-gold-500/5 p-6">
                <p className="text-sm leading-7 text-stone-700">
                  This page contains illustrative demonstration content. The
                  project, figures and imagery are not a live investment offer.
                  Full legal, financial and risk documentation would be
                  required before a genuine opportunity could be published.
                </p>
              </div>
            </div>

            <aside className="h-fit rounded-3xl border border-forest-900/10 bg-white p-6 shadow-[0_18px_60px_rgba(10,23,18,0.06)] sm:p-8">
              <FundingProgress
                fundedAmount={opportunity.fundedAmount}
                fundingTarget={opportunity.fundingTarget}
                currency={opportunity.currency}
              />

              <dl className="mt-8 space-y-6 border-y border-forest-900/10 py-7">
                <div className="flex gap-4">
                  <WalletCards className="mt-0.5 size-5 text-gold-600" />

                  <div>
                    <dt className="text-xs uppercase tracking-[0.14em] text-stone-500">
                      Minimum investment
                    </dt>

                    <dd className="mt-1 font-semibold text-forest-950">
                      {formatCurrency(
                        opportunity.minimumInvestment,
                        opportunity.currency,
                      )}
                    </dd>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CalendarDays className="mt-0.5 size-5 text-gold-600" />

                  <div>
                    <dt className="text-xs uppercase tracking-[0.14em] text-stone-500">
                      Indicative duration
                    </dt>

                    <dd className="mt-1 font-semibold text-forest-950">
                      {opportunity.duration}
                    </dd>
                  </div>
                </div>

                <div className="flex gap-4">
                  <ShieldCheck className="mt-0.5 size-5 text-gold-600" />

                  <div>
                    <dt className="text-xs uppercase tracking-[0.14em] text-stone-500">
                      Illustrative risk level
                    </dt>

                    <dd className="mt-1 font-semibold text-forest-950">
                      {opportunity.riskLevel}
                    </dd>
                  </div>
                </div>
              </dl>

              <Button
                href="/register"
                size="lg"
                className="mt-7 w-full"
              >
                Register interest
              </Button>

              <p className="mt-4 text-center text-xs leading-5 text-stone-500">
                Registration does not constitute an investment commitment.
              </p>
            </aside>
          </div>
        </Container>
      </section>
    </main>
  );
}