import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";

import { InvestorProcessCard } from "@/src/components/how-it-works/investor-process-card";
import { InvestorRequirementCard } from "@/src/components/how-it-works/investor-requirement-card";
import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import {
  investorProcessSteps,
  investorRequirements,
} from "@/src/data/investor-process";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Understand the Tevuah Reserve investor journey from discovering opportunities and completing verification to funding, portfolio monitoring and reporting.",
};

export default function HowItWorksPage() {
  return (
    <main className="bg-ivory-100">
      <section className="relative flex min-h-180 items-end overflow-hidden bg-forest-950 pt-19 text-white lg:pt-22">
        <Image
          src="/images/hero/how-it-works-page-hero.jpg"
          alt="Estate review representing the Tevuah Reserve investor process"
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
                How it works
              </p>
            </div>

            <h1 className="font-display mt-7 max-w-5xl text-balance text-5xl leading-[0.94] font-medium tracking-[-0.045em] sm:text-6xl lg:text-8xl">
              A clear path from discovery to portfolio ownership.
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
              Tevuah Reserve is designed to guide investors through
              opportunity discovery, verification, investment review,
              funding and long-term portfolio monitoring.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button href="#investor-journey" size="lg">
                Explore the process
                <ArrowDown className="size-4" />
              </Button>

              <Button
                href="/investments"
                variant="outline"
                size="lg"
                className="border-white/25 text-white hover:bg-white/10 hover:text-white"
              >
                Explore investments
                <ArrowUpRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="mt-14 grid gap-6 border-t border-white/15 pt-7 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-white/40">
                Before investing
              </p>

              <p className="mt-2 text-sm font-semibold">
                Review and verification
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-white/40">
                During investment
              </p>

              <p className="mt-2 text-sm font-semibold">
                Commitment and funding
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-white/40">
                After investment
              </p>

              <p className="mt-2 text-sm font-semibold">
                Monitoring and reporting
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section
        id="investor-journey"
        className="py-16 sm:py-20 lg:py-24"
      >
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Investor journey
              </p>
            </div>

            <div>
              <h2 className="font-display max-w-4xl text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl lg:text-6xl">
                Eight stages designed around clarity and control.
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-8 text-stone-700">
                The platform should make each stage understandable without
                making investment decisions appear simpler or safer than
                they really are.
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {investorProcessSteps.map((step) => (
              <InvestorProcessCard
                key={step.id}
                step={step}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-forest-900/10 bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
            <div className="relative min-h-135 overflow-hidden rounded-4xl">
              <Image
                src="/images/how-it-works/investor-verification.jpg"
                alt="Investor verification and document review"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-t from-forest-950/65 via-transparent to-transparent" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Investor verification
              </p>

              <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                Verification happens before investment access.
              </h2>

              <p className="mt-6 text-base leading-8 text-stone-700">
                Real investment access may require identity verification,
                investor classification, suitability checks and
                source-of-funds information depending on the offering and
                jurisdiction.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Identity and address verification",
                  "Investor classification",
                  "Suitability or appropriateness review",
                  "Source-of-funds checks where required",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 text-sm font-medium text-forest-950"
                  >
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-gold-600" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-9 rounded-3xl border border-gold-500/25 bg-gold-500/5 p-6">
                <p className="text-xs leading-6 text-stone-700">
                  The exact onboarding requirements must eventually be
                  determined by qualified legal and compliance advisers for
                  the jurisdictions where Tevuah Reserve operates.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Opportunity review
              </p>

              <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                Understand the investment before committing capital.
              </h2>

              <p className="mt-6 text-base leading-8 text-stone-700">
                Investors should be able to review the asset, legal
                structure, use of funds, assumptions, fees, project
                timeline and material risks in one place.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  "Investment thesis",
                  "Financial assumptions",
                  "Risk factors",
                  "Documents",
                  "Operator information",
                  "Project timeline",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-forest-900/10 bg-white p-5"
                  >
                    <FileCheck2 className="size-5 text-gold-600" />

                    <p className="mt-4 text-sm font-semibold text-forest-950">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              <Button
                href="/investments"
                variant="secondary"
                size="lg"
                className="mt-9"
              >
                Browse opportunities
                <ArrowUpRight className="size-4" />
              </Button>
            </div>

            <div className="relative min-h-140 overflow-hidden rounded-4xl">
              <Image
                src="/images/how-it-works/opportunity-review.jpg"
                alt="Investment opportunity review"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-t from-forest-950/60 via-transparent to-transparent" />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-forest-950 py-16 text-white sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                Before funding
              </p>

              <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] sm:text-5xl">
                Important requirements should be completed first.
              </h2>

              <p className="mt-6 max-w-xl text-base leading-8 text-white/60">
                A commitment should only progress to funding once the
                investor, opportunity and documentation requirements have
                been satisfied.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {investorRequirements.map((requirement) => (
                <InvestorRequirementCard
                  key={requirement.id}
                  requirement={requirement}
                />
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-forest-900/10 bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
            <div className="relative min-h-135 overflow-hidden rounded-4xl">
              <Image
                src="/images/how-it-works/portfolio-monitoring.jpg"
                alt="Investor portfolio monitoring"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-t from-forest-950/55 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 rounded-3xl border border-white/15 bg-forest-950/65 p-5 text-white backdrop-blur-md sm:bottom-8 sm:left-8 sm:right-auto sm:max-w-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
                  Investor dashboard
                </p>

                <p className="font-display mt-3 text-2xl font-semibold">
                  Portfolio monitoring
                </p>

                <p className="mt-2 text-xs leading-6 text-white/55">
                  Future dashboard interface for investments, updates,
                  documents and distributions.
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                After investment
              </p>

              <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                Investing is the beginning of the relationship.
              </h2>

              <p className="mt-6 text-base leading-8 text-stone-700">
                Investors should continue to receive relevant information
                throughout the life of the investment rather than hearing
                only when capital is requested or distributed.
              </p>

              <div className="mt-8 space-y-5">
                {[
                  {
                    title: "Portfolio overview",
                    text: "Review holdings, investment amounts and portfolio allocation.",
                  },
                  {
                    title: "Estate and project updates",
                    text: "Follow milestones, operating activity and selected AgTech reporting.",
                  },
                  {
                    title: "Documents",
                    text: "Access agreements, statements, reports and future tax documentation.",
                  },
                  {
                    title: "Transactions and distributions",
                    text: "Review funding history, fees and any investment distributions.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="border-t border-forest-900/10 pt-5"
                  >
                    <p className="font-semibold text-forest-950">
                      {item.title}
                    </p>

                    <p className="mt-2 text-sm leading-7 text-stone-600">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
              Investor responsibilities
            </p>

            <h2 className="font-display mt-5 text-balance text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl lg:text-6xl">
              A clear process does not remove the need for careful
              decision-making.
            </h2>

            <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-stone-700">
              Investors remain responsible for reviewing the relevant
              information, understanding the risks and deciding whether an
              opportunity is appropriate for their circumstances.
            </p>

            <div className="mt-10 grid gap-5 text-left md:grid-cols-3">
              <article className="rounded-3xl border border-forest-900/10 bg-white p-6">
                <ShieldCheck className="size-5 text-gold-600" />

                <h3 className="font-display mt-5 text-2xl font-semibold text-forest-950">
                  Understand risk
                </h3>

                <p className="mt-3 text-sm leading-7 text-stone-700">
                  Private investments can involve capital loss, long holding
                  periods and limited liquidity.
                </p>
              </article>

              <article className="rounded-3xl border border-forest-900/10 bg-white p-6">
                <FileCheck2 className="size-5 text-gold-600" />

                <h3 className="font-display mt-5 text-2xl font-semibold text-forest-950">
                  Review documents
                </h3>

                <p className="mt-3 text-sm leading-7 text-stone-700">
                  Read relevant offering documents and disclosures before
                  making a commitment.
                </p>
              </article>

              <article className="rounded-3xl border border-forest-900/10 bg-white p-6">
                <BadgeCheck className="size-5 text-gold-600" />

                <h3 className="font-display mt-5 text-2xl font-semibold text-forest-950">
                  Decide independently
                </h3>

                <p className="mt-3 text-sm leading-7 text-stone-700">
                  Platform presentation should support informed review rather
                  than pressure investors into making decisions.
                </p>
              </article>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-forest-950 py-16 text-white sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                Ready to explore
              </p>

              <h2 className="font-display mt-5 max-w-4xl text-4xl leading-none font-medium tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                Start with the opportunity, then decide whether to continue.
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-8 text-white/60">
                Browse the marketplace now. Investor registration and the
                complete verification workflow will be added during the next
                application phase.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Button href="/investments" size="lg">
                Explore investments
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