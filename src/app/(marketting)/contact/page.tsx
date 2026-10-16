import type { Metadata } from "next";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowDown,
  ArrowUpRight,
  CheckCircle2,
  Compass,
  FileCheck2,
  Mail,
  MessagesSquare,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

import {
  ContactHeroImage,
  ContactHeroLine,
  ContactHeroOverlay,
  ContactHeroReveal,
  ContactReveal,
  ContactRevealSoft,
  ContactStagger,
  ContactStaggerItem,
} from "@/src/components/contact/contact-motion";
import { InvestorEnquiryForm } from "@/src/components/contact/investor-enquiry-form";
import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import { siteConfig } from "@/src/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Tevuah Reserve to discuss investment opportunities, investor access and private-asset portfolio considerations.",
};

const conversationTopics = [
  {
    icon: Compass,
    title: "Explore opportunities",
    description:
      "Discuss available vineyard, olive estate, AgTech and fine-wine opportunities, including their investment structure, terms, risks and applicable documentation.",
  },
  {
    icon: MessagesSquare,
    title: "Discuss portfolio objectives",
    description:
      "Share your investment interests, objectives and time horizon so the conversation can focus on relevant opportunities and portfolio considerations.",
  },
  {
    icon: FileCheck2,
    title: "Understand the process",
    description:
      "Learn how opportunity review, investor verification, documentation, funding and ongoing reporting are handled through Tevuah Reserve.",
  },
];

const investorJourney = [
  {
    number: "01",
    title: "Start the conversation",
    description:
      "Tell us which opportunities, asset categories or investment questions you would like to discuss.",
  },
  {
    number: "02",
    title: "Discuss your interests",
    description:
      "The Tevuah Reserve team will discuss relevant opportunities, the investment process and the information available for review.",
  },
  {
    number: "03",
    title: "Eligibility and verification",
    description:
      "Where applicable, investor eligibility, identity and required verification information are reviewed before access progresses.",
  },
  {
    number: "04",
    title: "Investor access",
    description:
      "Investor accounts are established through the Tevuah Reserve administrative process rather than through public self-registration.",
  },
  {
    number: "05",
    title: "Review before investing",
    description:
      "Eligible investors review the applicable opportunity information, investment documents, terms and risk disclosures before deciding whether to proceed.",
  },
];

export default function ContactPage() {
  return (
    <main className="bg-ivory-100">
      {/* ==========================================
          HERO
      ========================================== */}

      <section className="relative flex min-h-170 items-end overflow-hidden bg-forest-950 pt-19 text-white lg:pt-22">
        <ContactHeroImage className="absolute inset-0">
          <Image
            src="/images/hero/estates-page-hero.jpg"
            alt="Cultivated estate landscape representing Tevuah Reserve investor relationships"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </ContactHeroImage>

        <ContactHeroOverlay
          className="absolute inset-0 bg-linear-to-r from-forest-950 via-forest-950/88 to-forest-950/30"
          delay={0.04}
        />

        <ContactHeroOverlay
          className="absolute inset-0 bg-linear-to-t from-forest-950/90 via-transparent to-forest-950/15"
          delay={0.1}
        />

        <Container className="relative z-10 pb-14 pt-24 sm:pb-18 lg:pb-20">
          <div className="max-w-5xl">
            <ContactHeroReveal delay={0.1}>
              <div className="flex items-center gap-3">
                <ContactHeroLine className="h-px w-10 origin-left bg-gold-400" />

                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
                  Investor enquiries
                </p>
              </div>
            </ContactHeroReveal>

            <ContactHeroReveal delay={0.2}>
              <h1 className="font-display mt-7 max-w-5xl text-balance text-5xl leading-[0.94] font-medium tracking-[-0.045em] sm:text-6xl lg:text-8xl">
                Begin with a conversation.
              </h1>
            </ContactHeroReveal>

            <ContactHeroReveal delay={0.31}>
              <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
                Contact Tevuah Reserve to discuss available investment opportunities, investor access and the process for evaluating opportunities across vineyards, olive estates, AgTech and fine wine.
              </p>
            </ContactHeroReveal>

            <ContactHeroReveal delay={0.41}>
              <div className="mt-10 flex flex-wrap gap-4">
                <Button
                  href="#investor-enquiry"
                  size="lg"
                >
                  Start an enquiry
                  <ArrowDown className="size-4" />
                </Button>

                <Button
                  href="/investments"
                  variant="outline"
                  size="lg"
                  className="border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  View opportunities
                  <ArrowUpRight className="size-4" />
                </Button>
              </div>
            </ContactHeroReveal>
          </div>

          <ContactStagger className="mt-12 grid gap-6 border-t border-white/15 pt-7 sm:grid-cols-3">
            <ContactStaggerItem>
              <div>
                <p className="text-sm font-semibold">
                  Direct investor access
                </p>

                <p className="mt-1 text-xs leading-5 text-white/45">
                  Investor relationships begin directly with the Tevuah Reserve team.
                </p>
              </div>
            </ContactStaggerItem>

            <ContactStaggerItem>
              <div>
                <p className="text-sm font-semibold">
                  Focused opportunities
                </p>

                <p className="mt-1 text-xs leading-5 text-white/45">
                  Discuss opportunities aligned with your interests, investment objectives and preferred asset categories.
                </p>
              </div>
            </ContactStaggerItem>

            <ContactStaggerItem>
              <div>
                <p className="text-sm font-semibold">
                  Structured onboarding
                </p>

                <p className="mt-1 text-xs leading-5 text-white/45">
                  Investor access is established through the applicable eligibility, verification and onboarding process.
                </p>
              </div>
            </ContactStaggerItem>
          </ContactStagger>
        </Container>
      </section>

      {/* ==========================================
          INTRODUCTION
      ========================================== */}

      <section className="border-b border-forest-900/10 bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <ContactReveal>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  A considered starting point
                </p>

                <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                  Private investing begins with a conversation.
                </h2>
              </div>
            </ContactReveal>

            <ContactReveal delay={0.08}>
              <div>
                <p className="text-base leading-8 text-stone-700">
                  Tevuah Reserve does not offer public self-registration for investors. Prospective investors begin by contacting the team to discuss their interests, understand available opportunities and learn about the investment process.
                </p>

                <p className="mt-6 text-base leading-8 text-stone-700">
                  Where an investor chooses to proceed, the required eligibility, administrative and verification steps are completed before investor access is established and investment activity can take place.
                </p>

                <div className="mt-8 rounded-2xl border border-gold-500/25 bg-gold-500/5 p-5">
                  <p className="text-xs leading-6 text-stone-700">
                    An enquiry is informational and does not guarantee eligibility, access to a specific opportunity, allocation, suitability or acceptance of an investment.
                  </p>
                </div>
              </div>
            </ContactReveal>
          </div>
        </Container>
      </section>

      {/* ==========================================
          WHAT WE CAN DISCUSS
      ========================================== */}

      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <ContactReveal className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
              Investor conversations
            </p>

            <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl lg:text-6xl">
              Tell us what you are looking for.
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-700">
              Whether you are interested in a particular opportunity, exploring a specific asset category or considering private assets as part of a broader portfolio, the first step is a direct conversation with the Tevuah Reserve team.
            </p>
          </ContactReveal>

          <ContactStagger className="mt-12 grid gap-6 lg:grid-cols-3">
            {conversationTopics.map((topic) => {
              const Icon = topic.icon;

              return (
                <ContactStaggerItem
                  key={topic.title}
                  className="h-full"
                >
                  <article className="h-full rounded-3xl border border-forest-900/10 bg-white p-7">
                    <span className="flex size-12 items-center justify-center rounded-full bg-forest-950 text-gold-400">
                      <Icon className="size-5" />
                    </span>

                    <h3 className="font-display mt-7 text-2xl font-semibold text-forest-950">
                      {topic.title}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-stone-600">
                      {topic.description}
                    </p>
                  </article>
                </ContactStaggerItem>
              );
            })}
          </ContactStagger>
        </Container>
      </section>

      {/* ==========================================
          INVESTOR JOURNEY
      ========================================== */}

      <section className="bg-forest-950 py-16 text-white sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <ContactReveal>
              <div className="lg:sticky lg:top-32">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                  From enquiry to access
                </p>

                <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] sm:text-5xl">
                  A deliberate investor journey.
                </h2>

                <p className="mt-6 max-w-md text-sm leading-7 text-white/60">
                  Tevuah Reserve follows a structured process from initial enquiry through investor access and opportunity review.
                </p>
              </div>
            </ContactReveal>

            <ContactStagger className="divide-y divide-white/10 border-y border-white/10">
              {investorJourney.map((step) => (
                <ContactStaggerItem
                  key={step.number}
                >
                  <div className="grid gap-4 py-7 sm:grid-cols-[70px_1fr] sm:gap-7">
                    <p className="font-display text-2xl text-gold-400">
                      {step.number}
                    </p>

                    <div>
                      <h3 className="font-display text-2xl font-semibold">
                        {step.title}
                      </h3>

                      <p className="mt-3 max-w-xl text-sm leading-7 text-white/55">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </ContactStaggerItem>
              ))}
            </ContactStagger>
          </div>
        </Container>
      </section>

      {/* ==========================================
          PORTFOLIO CONVERSATION
      ========================================== */}

      <section className="border-b border-forest-900/10 bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-20">
            <ContactReveal>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Portfolio considerations
                </p>

                <h2 className="font-display mt-5 max-w-3xl text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                  Consider the investment as part of the wider portfolio.
                </h2>

                <p className="mt-6 max-w-2xl text-base leading-8 text-stone-700">
                  Investment decisions involve more than the characteristics of an individual opportunity. Asset exposure, investment horizon, liquidity, concentration and risk should be considered alongside the investor's broader objectives.
                </p>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-600">
                  Relevant considerations may include:
                </p>
              </div>
            </ContactReveal>

            <ContactStagger className="grid gap-4">
              {[
                "Investment objective and time horizon",
                "Asset-category exposure",
                "Liquidity expectations",
                "Opportunity-specific risk",
                "Investment size and concentration",
                "Reporting and document requirements",
              ].map((item) => (
                <ContactStaggerItem key={item}>
                  <div className="flex items-center gap-4 rounded-2xl border border-forest-900/10 bg-ivory-100 p-5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-forest-950 text-gold-400">
                      <CheckCircle2 className="size-4" />
                    </span>

                    <p className="text-sm font-semibold text-forest-950">
                      {item}
                    </p>
                  </div>
                </ContactStaggerItem>
              ))}
            </ContactStagger>
          </div>
        </Container>
      </section>

      {/* ==========================================
          CONTACT FORM
      ========================================== */}

      <section
        id="investor-enquiry"
        className="py-16 sm:py-20 lg:py-24"
      >
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <ContactReveal>
              <div className="lg:sticky lg:top-32">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Contact Tevuah Reserve
                </p>

                <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                  Tell us where you would like to
                  begin.
                </h2>

                <p className="mt-6 text-sm leading-7 text-stone-700">
                  Use the investor enquiry form to ask about an opportunity, discuss portfolio considerations or learn more about becoming a Tevuah Reserve investor.
                </p>

                <div className="mt-8 border-t border-forest-900/10 pt-7">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 size-5 text-gold-600" />

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                        Email
                      </p>

                      <a
                        href={`mailto:${siteConfig.email}`}
                        className="focus-ring mt-2 inline-block rounded-sm text-sm font-semibold text-forest-950 transition hover:text-olive-700"
                      >
                        {siteConfig.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </ContactReveal>

            <ContactReveal delay={0.08}>
              <InvestorEnquiryForm
                email={siteConfig.email}
              />
            </ContactReveal>
          </div>
        </Container>
      </section>

      {/* ==========================================
          INVESTOR PROTECTION
      ========================================== */}

      <section className="border-y border-forest-900/10 bg-white py-16 sm:py-20">
        <Container>
          <ContactReveal>
            <div className="grid gap-8 rounded-4xl bg-forest-950 p-7 text-white sm:p-10 lg:grid-cols-[auto_1fr] lg:gap-10 lg:p-12">
              <span className="flex size-14 items-center justify-center rounded-full bg-gold-500/15 text-gold-400">
                <ShieldCheck className="size-6" />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                  Before investing
                </p>

                <h2 className="font-display mt-4 max-w-3xl text-3xl font-medium tracking-[-0.03em] sm:text-4xl">
                  Review the opportunity and understand the risks.
                </h2>

                <p className="mt-5 max-w-3xl text-sm leading-7 text-white/60">
                  Private investments can involve limited liquidity, extended holding periods and the risk of losing some or all invested capital. Investors should review the specific terms, documentation and risk disclosures applicable to each opportunity before committing capital.
                </p>

                <Link
                  href="/risk-disclosure"
                  className="focus-ring mt-7 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-white transition hover:text-gold-400"
                >
                  Review risk disclosures

                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </div>
          </ContactReveal>
        </Container>
      </section>

      {/* ==========================================
          FINAL GUIDANCE
      ========================================== */}

      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <ContactReveal>
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <UserRoundCheck className="size-5 text-gold-600" />

                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                    Already an investor?
                  </p>
                </div>

                <h2 className="font-display mt-5 max-w-3xl text-4xl font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                  Access your investor account.
                </h2>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-700">
                  Existing investors can use their secure account to review investment positions, documents and account activity. For account assistance or other investor enquiries, contact Tevuah Reserve directly.
                </p>
              </div>

              <Button
                href="/login"
                variant="secondary"
                size="lg"
                className="w-fit"
              >
                Investor login
                <ArrowUpRight className="size-4" />
              </Button>
            </div>
          </ContactReveal>
        </Container>
      </section>
    </main>
  );
}