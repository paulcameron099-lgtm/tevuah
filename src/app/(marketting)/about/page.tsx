import type { Metadata } from "next";

import Image from "next/image";
import {
  ArrowDown,
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

import {
  AboutHeroImage,
  AboutHeroLine,
  AboutHeroOverlay,
  AboutHeroReveal,
  AboutImageReveal,
  AboutListItem,
  AboutReveal,
  AboutRevealSoft,
  AboutStagger,
  AboutStaggerItem,
} from "@/src/components/about/about-motion";
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

const philosophyPoints = [
  "Understand the productive or collectible asset",
  "Review who operates or controls it",
  "Understand how investor capital is used",
  "Identify material risks before publishing",
];

const controlPoints = [
  "Role-based permissions",
  "Document version control",
  "Audit logs",
  "Sensitive-action approvals",
];

export default function AboutPage() {
  return (
    <main className="bg-ivory-100">
      {/* Hero */}
      <section className="relative flex min-h-180 items-end overflow-hidden bg-forest-950 pt-19 text-white lg:pt-22">
        <AboutHeroImage className="absolute inset-0">
          <Image
            src="/images/hero/about-page-hero.jpg"
            alt="Cultivated estate representing Tevuah Reserve"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </AboutHeroImage>

        <AboutHeroOverlay
          className="absolute inset-0 bg-linear-to-r from-forest-950 via-forest-950/82 to-forest-950/25"
          delay={0.04}
        />

        <AboutHeroOverlay
          className="absolute inset-0 bg-linear-to-t from-forest-950/88 via-transparent to-forest-950/15"
          delay={0.1}
        />

        <Container className="relative z-10 pb-16 pt-24 lg:pb-20">
          <div className="max-w-5xl">
            <AboutHeroReveal delay={0.12}>
              <div className="flex items-center gap-3">
                <AboutHeroLine className="h-px w-10 origin-left bg-gold-400" />

                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
                  About Tevuah Reserve
                </p>
              </div>
            </AboutHeroReveal>

            <AboutHeroReveal delay={0.22}>
              <h1 className="font-display mt-7 max-w-5xl text-balance text-5xl leading-[0.94] font-medium tracking-[-0.045em] sm:text-6xl lg:text-8xl">
                A long-term view of cultivated wealth.
              </h1>
            </AboutHeroReveal>

            <AboutHeroReveal delay={0.34}>
              <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
                Tevuah Reserve is being built around productive land,
                agricultural intelligence, fine wine and a disciplined
                approach to investor transparency.
              </p>
            </AboutHeroReveal>

            <AboutHeroReveal delay={0.44}>
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
            </AboutHeroReveal>
          </div>

          <AboutStagger
            className="mt-14 grid gap-6 border-t border-white/15 pt-7 sm:grid-cols-3"
            delay={0.5}
            stagger={0.1}
            amount={0.05}
          >
            <AboutStaggerItem>
              <p className="text-xs uppercase tracking-[0.15em] text-white/40">
                Perspective
              </p>
              <p className="mt-2 text-sm font-semibold">
                Long-term asset stewardship
              </p>
            </AboutStaggerItem>

            <AboutStaggerItem>
              <p className="text-xs uppercase tracking-[0.15em] text-white/40">
                Focus
              </p>
              <p className="mt-2 text-sm font-semibold">
                Productive and collectible assets
              </p>
            </AboutStaggerItem>

            <AboutStaggerItem>
              <p className="text-xs uppercase tracking-[0.15em] text-white/40">
                Principle
              </p>
              <p className="mt-2 text-sm font-semibold">
                Transparency before commitment
              </p>
            </AboutStaggerItem>
          </AboutStagger>
        </Container>
      </section>

      {/* Purpose */}
      <section className="border-b border-forest-900/10 bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-20">
            <AboutRevealSoft>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Our purpose
              </p>
            </AboutRevealSoft>

            <AboutReveal>
              <h2 className="font-display max-w-4xl text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl lg:text-6xl">
                Build an investment experience where the asset remains visible.
              </h2>

              <p className="mt-6 max-w-3xl text-base leading-8 text-stone-700">
                Tevuah Reserve is designed to connect investors with carefully
                presented opportunities across vineyard estates, olive
                agriculture, AgTech infrastructure and fine wine.
              </p>

              <p className="mt-5 max-w-3xl text-base leading-8 text-stone-700">
                The platform should help investors understand what they are
                investing in, how the opportunity is structured, where the
                capital is being used and which risks remain.
              </p>
            </AboutReveal>
          </div>
        </Container>
      </section>

      {/* Philosophy */}
      <section
        id="our-philosophy"
        className="py-16 sm:py-20 lg:py-24"
      >
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
            <AboutReveal>
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

              <AboutStagger
                className="mt-8 space-y-4"
                stagger={0.07}
                amount={0.15}
              >
                {philosophyPoints.map((item) => (
                  <AboutListItem
                    key={item}
                    className="flex items-start gap-3 text-sm font-medium text-forest-950"
                  >
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-gold-600" />
                    {item}
                  </AboutListItem>
                ))}
              </AboutStagger>
            </AboutReveal>

            <AboutImageReveal className="relative min-h-140 overflow-hidden rounded-4xl">
              <Image
                src="/images/about/investment-philosophy.jpg"
                alt="Vineyard estate representing the Tevuah Reserve investment philosophy"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-t from-forest-950/55 via-transparent to-transparent" />
            </AboutImageReveal>
          </div>

          <AboutStagger
            className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
            stagger={0.1}
          >
            {investmentPrinciples.map((principle, index) => (
              <AboutStaggerItem
                key={principle.id}
                className="h-full"
              >
                <InvestmentPrincipleCard
                  principle={principle}
                  index={index}
                />
              </AboutStaggerItem>
            ))}
          </AboutStagger>
        </Container>
      </section>

      {/* Governance */}
      <section className="bg-forest-950 py-16 text-white sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-start lg:gap-20">
            <AboutReveal>
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

              <AboutRevealSoft delay={0.08}>
                <div className="mt-8 flex items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold-400" />

                  <p className="text-sm leading-7 text-white/60">
                    The final governance framework should be developed with
                    qualified legal, compliance, financial and regulatory
                    advisers.
                  </p>
                </div>
              </AboutRevealSoft>
            </AboutReveal>

            <AboutReveal delay={0.08}>
              <GovernanceProcess stages={governanceStages} />
            </AboutReveal>
          </div>
        </Container>
      </section>

      {/* Review controls */}
      <section className="border-b border-forest-900/10 bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
            <AboutImageReveal className="relative min-h-135 overflow-hidden rounded-4xl">
              <Image
                src="/images/about/governance-review.jpg"
                alt="Professional estate review representing Tevuah Reserve governance"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-t from-forest-950/60 via-transparent to-transparent" />
            </AboutImageReveal>

            <AboutReveal>
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

              <AboutStagger
                className="mt-8 grid gap-4 sm:grid-cols-2"
                stagger={0.08}
                amount={0.15}
              >
                {controlPoints.map((item) => (
                  <AboutStaggerItem key={item}>
                    <div className="rounded-xl border border-forest-900/10 bg-ivory-100 p-5">
                      <ShieldCheck className="size-5 text-gold-600" />

                      <p className="mt-4 text-sm font-semibold text-forest-950">
                        {item}
                      </p>
                    </div>
                  </AboutStaggerItem>
                ))}
              </AboutStagger>
            </AboutReveal>
          </div>
        </Container>
      </section>

      {/* Team */}
      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <AboutReveal className="mb-12 max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
              Team structure
            </p>

            <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl lg:text-6xl">
              A multidisciplinary platform needs clearly defined
              responsibilities.
            </h2>

            <p className="mt-6 max-w-3xl text-base leading-8 text-stone-700">
              We are defining the functions the final Tevuah Reserve team will
              require before publishing real leadership profiles.
            </p>
          </AboutReveal>

          <AboutStagger
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
            stagger={0.09}
          >
            {teamFunctions.map((item) => (
              <AboutStaggerItem
                key={item.id}
                className="h-full"
              >
                <TeamFunctionCard item={item} />
              </AboutStaggerItem>
            ))}
          </AboutStagger>

          <AboutRevealSoft delay={0.08}>
            <div className="mt-8 rounded-3xl border border-gold-500/25 bg-gold-500/5 p-6">
              <p className="text-xs leading-6 text-stone-700">
                We are intentionally not displaying invented executives or
                stock portraits as real members of Tevuah Reserve. Genuine
                leadership profiles should only be published once real people,
                roles and biographies have been confirmed.
              </p>
            </div>
          </AboutRevealSoft>
        </Container>
      </section>

      {/* Operating partners */}
      <section className="border-y border-forest-900/10 bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
            <AboutReveal>
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
                partner responsible for each asset, what their role is and how
                their performance is monitored.
              </p>

              <AboutRevealSoft delay={0.08}>
                <Button
                  href="/estates"
                  variant="secondary"
                  size="lg"
                  className="mt-9"
                >
                  Explore estate profiles
                  <ArrowUpRight className="size-4" />
                </Button>
              </AboutRevealSoft>
            </AboutReveal>

            <AboutImageReveal className="relative min-h-140 overflow-hidden rounded-4xl">
              <Image
                src="/images/about/operating-partners.jpg"
                alt="Estate operator representing Tevuah Reserve operating partnerships"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-t from-forest-950/65 via-transparent to-transparent" />
            </AboutImageReveal>
          </div>
        </Container>
      </section>

      {/* Stewardship */}
      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <AboutReveal>
            <div className="grid overflow-hidden rounded-4xl bg-forest-950 text-white lg:grid-cols-[1.05fr_0.95fr]">
              <AboutImageReveal className="relative min-h-120 lg:min-h-155">
                <Image
                  src="/images/about/stewardship.jpg"
                  alt="Cultivated land representing long-term stewardship"
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-linear-to-t from-forest-950/70 via-transparent to-transparent" />
              </AboutImageReveal>

              <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
                <AboutRevealSoft>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                    Stewardship
                  </p>
                </AboutRevealSoft>

                <AboutRevealSoft delay={0.06}>
                  <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] sm:text-5xl">
                    Long-term assets require long-term accountability.
                  </h2>
                </AboutRevealSoft>

                <AboutRevealSoft delay={0.1}>
                  <p className="mt-6 text-base leading-8 text-white/60">
                    Productive agricultural assets are not passive digital
                    entries. They rely on operators, infrastructure, water,
                    maintenance, planning and disciplined reporting.
                  </p>
                </AboutRevealSoft>

                <AboutStagger
                  className="mt-8 space-y-4"
                  stagger={0.07}
                  amount={0.15}
                >
                  {stewardshipPoints.map((item) => (
                    <AboutListItem
                      key={item}
                      className="flex items-center gap-3 text-sm text-white/75"
                    >
                      <CheckCircle2 className="size-5 shrink-0 text-gold-400" />
                      {item}
                    </AboutListItem>
                  ))}
                </AboutStagger>
              </div>
            </div>
          </AboutReveal>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="bg-forest-950 py-16 text-white sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <AboutReveal>
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
            </AboutReveal>

            <AboutRevealSoft
              className="flex flex-col gap-3 sm:flex-row lg:justify-end"
              delay={0.1}
            >
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
            </AboutRevealSoft>
          </div>
        </Container>
      </section>
    </main>
  );
}