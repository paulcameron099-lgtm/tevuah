import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

import { GovernanceProcess } from "@/src/components/about/governance-process";
import { InvestmentPrincipleCard } from "@/src/components/about/investment-principle-card";
import { TeamFunctionCard } from "@/src/components/about/team-function-card";
import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import {
  governanceStages,
  investmentPrinciples,
  teamFunctions,
} from "@/src/data/about-platform";

export const metadata: Metadata = {
  title: "About Tevuah Reserve",
  description:
    "Learn about the Tevuah Reserve investment philosophy, governance model, review process and approach to cultivated assets.",
};

const stewardshipPoints = [
  "Long-term land productivity",
  "Responsible water management",
  "Clear operating accountability",
  "Transparent investor reporting",
];

export default function AboutPage() {
  return (
    <main className="bg-ivory-100">
      <section className="relative flex min-h-180 items-end overflow-hidden bg-forest-950 pt-19 text-white lg:pt-22">
        <Image
          src="/images/hero/about-page-hero.jpg"
          alt="Cultivated estate representing Tevuah Reserve"
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
                About Tevuah Reserve
              </p>
            </div>

            <h1 className="font-display mt-7 max-w-5xl text-balance text-5xl leading-[0.94] font-medium tracking-[-0.045em] sm:text-6xl lg:text-8xl">
              A long-term view of cultivated wealth.
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
              Tevuah Reserve is being built around productive land,
              agricultural intelligence, fine wine and a disciplined
              approach to investor transparency.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button href="#our-philosophy" size="lg">
                Explore our philosophy
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
                Perspective
              </p>

              <p className="mt-2 text-sm font-semibold">
                Long-term asset stewardship
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-white/40">
                Focus
              </p>

              <p className="mt-2 text-sm font-semibold">
                Productive and collectible assets
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-white/40">
                Principle
              </p>

              <p className="mt-2 text-sm font-semibold">
                Transparency before commitment
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-forest-900/10 bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Our purpose
              </p>
            </div>

            <div>
              <h2 className="font-display max-w-4xl text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl lg:text-6xl">
                Build an investment experience where the asset remains visible.
              </h2>

              <p className="mt-6 max-w-3xl text-base leading-8 text-stone-700">
                Tevuah Reserve is designed to connect investors with
                carefully presented opportunities across vineyard estates,
                olive agriculture, AgTech infrastructure and fine wine.
              </p>

              <p className="mt-5 max-w-3xl text-base leading-8 text-stone-700">
                The platform should help investors understand what they are
                investing in, how the opportunity is structured, where the
                capital is being used and which risks remain.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section
        id="our-philosophy"
        className="py-16 sm:py-20 lg:py-24"
      >
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Investment philosophy
              </p>

              <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                Start with the asset, then build the investment around it.
              </h2>

              <p className="mt-6 text-base leading-8 text-stone-700">
                Attractive design should never become a substitute for
                understanding the underlying property, operating model,
                structure and risk.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Understand the productive or collectible asset",
                  "Review who operates or controls it",
                  "Understand how investor capital is used",
                  "Identify material risks before publishing",
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
            </div>

            <div className="relative min-h-140 overflow-hidden rounded-4xl">
              <Image
                src="/images/about/investment-philosophy.jpg"
                alt="Vineyard estate representing the Tevuah Reserve investment philosophy"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-t from-forest-950/55 via-transparent to-transparent" />
            </div>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {investmentPrinciples.map((principle, index) => (
              <InvestmentPrincipleCard
                key={principle.id}
                principle={principle}
                index={index}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-forest-950 py-16 text-white sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-start lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                Governance
              </p>

              <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] sm:text-5xl">
                Opportunities should pass through a defined review process.
              </h2>

              <p className="mt-6 max-w-xl text-base leading-8 text-white/60">
                No opportunity should become investable simply because basic
                information and attractive photography have been uploaded.
              </p>

              <div className="mt-8 flex items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold-400" />

                <p className="text-sm leading-7 text-white/60">
                  The final governance framework should be developed with
                  qualified legal, compliance, financial and regulatory
                  advisers.
                </p>
              </div>
            </div>

            <GovernanceProcess stages={governanceStages} />
          </div>
        </Container>
      </section>

      <section className="border-b border-forest-900/10 bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
            <div className="relative min-h-135 overflow-hidden rounded-4xl">
              <Image
                src="/images/about/governance-review.jpg"
                alt="Professional estate review representing Tevuah Reserve governance"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-t from-forest-950/60 via-transparent to-transparent" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Review before publication
              </p>

              <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                Trust depends on controls behind the interface.
              </h2>

              <p className="mt-6 text-base leading-8 text-stone-700">
                A professional investment platform requires permissions,
                documented approvals, secure records and audit history behind
                every important operational action.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  "Role-based permissions",
                  "Document version control",
                  "Audit logs",
                  "Sensitive-action approvals",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-forest-900/10 bg-ivory-100 p-5"
                  >
                    <ShieldCheck className="size-5 text-gold-600" />

                    <p className="mt-4 text-sm font-semibold text-forest-950">
                      {item}
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
          <div className="mb-12 max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
              Team structure
            </p>

            <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl lg:text-6xl">
              A multidisciplinary platform needs clearly defined responsibilities.
            </h2>

            <p className="mt-6 max-w-3xl text-base leading-8 text-stone-700">
              We are defining the functions the final Tevuah Reserve team will
              require before publishing real leadership profiles.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {teamFunctions.map((item) => (
              <TeamFunctionCard
                key={item.id}
                item={item}
              />
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-gold-500/25 bg-gold-500/5 p-6">
            <p className="text-xs leading-6 text-stone-700">
              We are intentionally not displaying invented executives or
              stock portraits as real members of Tevuah Reserve. Genuine
              leadership profiles should only be published once real people,
              roles and biographies have been confirmed.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-y border-forest-900/10 bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Operating partners
              </p>

              <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                Specialist assets need specialist operators.
              </h2>

              <p className="mt-6 text-base leading-8 text-stone-700">
                Tevuah Reserve does not need to pretend that the platform
                itself operates every vineyard, olive grove or wine-storage
                facility.
              </p>

              <p className="mt-5 text-base leading-8 text-stone-700">
                Instead, the platform should clearly identify the operating
                partner responsible for each asset, what their role is and
                how their performance is monitored.
              </p>

              <Button
                href="/estates"
                variant="secondary"
                size="lg"
                className="mt-9"
              >
                Explore estate profiles
                <ArrowUpRight className="size-4" />
              </Button>
            </div>

            <div className="relative min-h-140 overflow-hidden rounded-4xl">
              <Image
                src="/images/about/operating-partners.jpg"
                alt="Estate operator representing Tevuah Reserve operating partnerships"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-t from-forest-950/65 via-transparent to-transparent" />
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid overflow-hidden rounded-4xl bg-forest-950 text-white lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative min-h-120 lg:min-h-155">
              <Image
                src="/images/about/stewardship.jpg"
                alt="Cultivated land representing long-term stewardship"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-t from-forest-950/70 via-transparent to-transparent" />
            </div>

            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                Stewardship
              </p>

              <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] sm:text-5xl">
                Long-term assets require long-term accountability.
              </h2>

              <p className="mt-6 text-base leading-8 text-white/60">
                Productive agricultural assets are not passive digital
                entries. They rely on operators, infrastructure, water,
                maintenance, planning and disciplined reporting.
              </p>

              <div className="mt-8 space-y-4">
                {stewardshipPoints.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-white/75"
                  >
                    <CheckCircle2 className="size-5 shrink-0 text-gold-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-forest-950 py-16 text-white sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                Explore Tevuah Reserve
              </p>

              <h2 className="font-display mt-5 max-w-4xl text-4xl leading-none font-medium tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                Start with the assets, opportunities and information.
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-8 text-white/60">
                Explore the public marketplace now. Account creation,
                verification and the investor dashboard will be built in the
                next application phase.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Button href="/investments" size="lg">
                Explore investments
              </Button>

              <Button
                href="/how-it-works"
                variant="outline"
                size="lg"
                className="border-white/25 text-white hover:bg-white/10 hover:text-white"
              >
                How it works
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}