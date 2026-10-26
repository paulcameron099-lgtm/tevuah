import type {
  Metadata,
} from "next";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowDown,
  ArrowUpRight,
  CircleDollarSign,
  FileCheck2,
  HelpCircle,
  Landmark,
  Layers3,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

import {
  FaqAccordion,
  type FaqItem,
} from "@/src/components/faq/faq-accordion";

import {
  FaqHeroImage,
  FaqHeroLine,
  FaqHeroOverlay,
  FaqHeroReveal,
  FaqReveal,
  FaqRevealSoft,
  FaqStagger,
  FaqStaggerItem,
} from "@/src/components/faq/faq-motion";

import {
  Button,
} from "@/src/components/ui/button";

import {
  Container,
} from "@/src/components/ui/container";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about Tevuah Reserve investor access, opportunities, verification, funding, portfolio reporting and investment risk.",
};

type FaqCategory = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  items: FaqItem[];
};

const faqCategories: FaqCategory[] = [
  {
    id: "investor-access",
    eyebrow: "Investor access",
    title:
      "Becoming a Tevuah Reserve investor",
    description:
      "Learn how investor relationships begin, how access is established and what happens before an investment can proceed.",
    items: [
      {
        question:
          "How do I become a Tevuah Reserve investor?",
        answer:
          "Tevuah Reserve does not offer public self-registration. Prospective investors begin by contacting the company to discuss their interests and the investment process. If the investor decides to proceed, Tevuah Reserve establishes the investor account and completes the applicable administrative, eligibility and verification requirements.",
      },
      {
        question:
          "Why is there no public registration page?",
        answer:
          "Investor access is established through a direct onboarding process rather than open public registration. This allows Tevuah Reserve to establish the appropriate investor relationship, complete required verification and provide access based on the applicable eligibility and administrative requirements.",
      },
      {
        question:
          "Does contacting Tevuah Reserve guarantee that I can invest?",
        answer:
          "No. Contacting Tevuah Reserve begins a conversation about investor access and available opportunities. It does not guarantee eligibility, acceptance, allocation or investment capacity. Each investment is subject to its applicable requirements, terms and availability.",
      },
      {
        question:
          "What information may be required during investor verification?",
        answer:
          "The information required depends on the applicable investor and investment requirements. Verification may include information needed to establish identity, address, eligibility and other required administrative or compliance information before investment access is provided.",
      },
      {
        question:
          "I already have an investor account. Where should I go?",
        answer:
          "Existing investors can use their secure investor access to review available portfolio information, investment documents and relevant activity. If you need assistance with your account or access, contact the Tevuah Reserve team.",
      },
    ],
  },

  {
    id: "opportunities",
    eyebrow: "Opportunities",
    title:
      "Reviewing investment opportunities",
    description:
      "Understand how opportunities are presented and what to review before deciding whether to proceed.",
    items: [
      {
        question:
          "What types of opportunities does Tevuah Reserve present?",
        answer:
          "Tevuah Reserve offers selected private-market opportunities across productive agricultural estates, vineyards, olive agriculture, agricultural technology and fine wine. Each opportunity has its own structure, terms, minimum investment, duration, risks and disclosures.",
      },
      {
        question:
          "Where can I view current opportunities?",
        answer:
          "Current opportunities are available through the Tevuah Reserve investment opportunities section. Investors can review the information provided for each opportunity and contact the team when they would like to discuss an opportunity or begin the investment process.",
      },
      {
        question:
          "Does every opportunity have the same minimum investment?",
        answer:
          "No. Minimum investment amounts vary by opportunity. The applicable minimum is stated with the individual investment opportunity and forms part of the terms investors should review before proceeding.",
      },
      {
        question:
          "What happens when an opportunity becomes fully funded?",
        answer:
          "Once an opportunity reaches its available funding capacity, additional investment may no longer be accepted. Investors should not assume that an opportunity remains available after it has been fully funded.",
      },
      {
        question:
          "Does Tevuah Reserve guarantee the target return shown for an opportunity?",
        answer:
          "No. A target return is not a guarantee of performance. Investment outcomes can differ from the stated target and may be affected by the risks, costs, timing and performance associated with the underlying investment. Investors should review the specific return assumptions and risk disclosures before investing.",
      },
    ],
  },

  {
    id: "portfolio",
    eyebrow: "Portfolio",
    title:
      "Building and monitoring exposure",
    description:
      "Understand how your investments are viewed and monitored after you invest.",
    items: [
      {
        question:
          "Can Tevuah Reserve help me understand how different opportunities compare?",
        answer:
          "Yes. Tevuah Reserve can provide information about its investment opportunities, asset categories, structures and investment process and can discuss relevant portfolio considerations with investors. Investors remain responsible for their own investment decisions and should obtain qualified financial, legal or tax advice where personalized advice is required.",
      },
      {
        question:
          "What should I consider when building a private-asset portfolio?",
        answer:
          "Investors should consider factors such as the type of underlying asset, investment structure, minimum commitment, expected holding period, liquidity, potential return, fees, risks and the investor's overall portfolio objectives. Different private assets can behave differently, so investors should consider how each opportunity fits within their broader investment position.",
      },
      {
        question:
          "What can I see in my investor dashboard?",
        answer:
          "The investor dashboard provides access to information associated with an investor's portfolio and investments. Depending on the investment and information available, this can include investment positions, documents, transaction activity, reporting and relevant updates.",
      },
      {
        question:
          "Will I receive operational updates after investing?",
        answer:
          "Where relevant information is available, investors can receive updates concerning the underlying investment and its reported activity. The nature and frequency of reporting depend on the investment, underlying asset and information available from the relevant operators and reporting sources.",
      },
    ],
  },

  {
    id: "funding",
    eyebrow: "Funding",
    title:
      "Subscriptions, funding and joint investments",
    description:
      "Understand what happens after an investor decides to proceed with an opportunity.",
    items: [
      {
        question:
          "How does an investor begin an investment?",
        answer:
          "An eligible investor begins with the relevant investment opportunity and follows the applicable investment process. This includes reviewing the investment terms, completing required acknowledgements and documentation, and following the funding instructions provided for that investment.",
      },
      {
        question:
          "How are funding instructions provided?",
        answer:
          "Funding instructions are provided through the applicable investment process after the required documentation and acknowledgements have been completed. Investors should use only the funding instructions provided through the authorized Tevuah Reserve process and should contact the team if they have questions before transferring funds.",
      },
      {
        question:
          "Can two investors invest jointly?",
        answer:
          "Joint investment may be available where the structure of a particular opportunity permits it. The applicable ownership, funding, documentation and administrative requirements must be completed for each investor involved.",
      },
      {
        question:
          "Does a joint investment proceed as soon as one person accepts?",
        answer:
          "No. A joint investment does not automatically proceed when only one investor accepts. The applicable requirements for all participating investors must be completed before the investment can proceed.",
      },
      {
        question:
          "Does starting an investment guarantee capacity?",
        answer:
          "No. Beginning the investment process does not guarantee that investment capacity will remain available. An opportunity may become fully funded or otherwise unavailable before the investment is completed.",
      },
    ],
  },

  {
    id: "documents-reporting",
    eyebrow: "Documents & reporting",
    title:
      "Information throughout the investment lifecycle",
    description:
      "Understand how investment documents, statements and reporting are provided after you invest.",
    items: [
      {
        question:
          "Where can I access investment documents?",
        answer:
          "Approved investors can access documents associated with their investments through the secure investor experience, subject to the applicable access controls. These may include investment documents, reports, statements and other information relevant to the investment.",
      },
      {
        question:
          "Will joint investors have access to relevant documents?",
        answer:
          "Access to documents is provided according to the investor's role, ownership and applicable access permissions. Joint investors receive access to information for which they are authorized.",
      },
      {
        question:
          "How are distributions reflected?",
        answer:
          "Where an investment makes a distribution, the applicable transaction and distribution information is reflected in the investor's portfolio records and reporting. The timing and treatment of distributions depend on the terms of the individual investment.",
      },
      {
        question:
          "Are estate and AgTech measurements guaranteed to be real-time?",
        answer:
          "No. Estate and AgTech information depends on the underlying reporting systems, monitoring processes and availability of source data. Information may be reported periodically rather than continuously, and reported measurements should not be treated as a guarantee of real-time conditions.",
      },
      {
        question:
          "How is fine-wine valuation information handled?",
        answer:
          "Fine-wine valuation information is presented based on the valuation information and supporting sources available for the relevant collection or position. Valuations can change over time and should not be treated as guaranteed realizable prices. Investors should consider provenance, authenticity, custody, condition, storage, market conditions and available valuation evidence when reviewing fine-wine investments.",
      },
    ],
  },

  {
    id: "risk",
    eyebrow: "Risk & responsibility",
    title:
      "Understanding private investment risk",
    description:
      "Private investments involve risks that should be understood before committing capital.",
    items: [
      {
        question:
          "Can I lose money through a Tevuah Reserve investment?",
        answer:
          "Yes. Private investments involve risk, including the possible loss of some or all invested capital. Investors should carefully review the risks associated with each opportunity and should not invest capital they cannot afford to lose.",
      },
      {
        question:
          "Are private investments liquid?",
        answer:
          "Private investments can be illiquid. An investor may not be able to sell or transfer an investment when they want to, and there may be no established secondary market. Investors should consider the potential holding period and liquidity restrictions before committing capital.",
      },
      {
        question:
          "What risks can affect agricultural investments?",
        answer:
          "Agricultural investments can be affected by factors including weather, climate, water availability, crop yields, operating costs, commodity and market conditions, land and asset values, regulation and the performance of the underlying operator. The specific risks vary by investment and should be reviewed in the opportunity's documentation.",
      },
      {
        question:
          "What risks apply to fine wine?",
        answer:
          "Fine-wine investments can be affected by changes in market demand, producer and vintage performance, condition, authenticity, provenance, storage, custody, valuation and liquidity. Market values can change, and an investor may not be able to sell wine at a desired price or within a desired timeframe.",
      },
      {
        question:
          "Is information on the website investment advice?",
        answer:
          "Information provided on the Tevuah Reserve website is general information about the company, its platform, investment opportunities and related processes. It is not a substitute for personalized financial, legal or tax advice. Investors should obtain independent professional advice where appropriate.",
      },
      {
        question:
          "Where can I read more about investment risk?",
        answer:
          "Investors should review the Tevuah Reserve Risk Disclosure together with the risk information and disclosures provided for each individual investment opportunity.",
      },
    ],
  },
];

const categoryLinks = [
  {
    id: "investor-access",
    label: "Investor access",
    icon: UserRoundCheck,
  },
  {
    id: "opportunities",
    label: "Opportunities",
    icon: Landmark,
  },
  {
    id: "portfolio",
    label: "Portfolio",
    icon: Layers3,
  },
  {
    id: "funding",
    label: "Funding",
    icon: CircleDollarSign,
  },
  {
    id: "documents-reporting",
    label: "Documents",
    icon: FileCheck2,
  },
  {
    id: "risk",
    label: "Risk",
    icon: ShieldCheck,
  },
];

export default function FaqPage() {
  return (
    <main className="bg-ivory-100">
      {/* ==========================================
          HERO
      ========================================== */}

      <section className="relative flex min-h-155 items-end overflow-hidden bg-forest-950 pt-19 text-white lg:pt-22">
        <FaqHeroImage className="absolute inset-0">
          <Image
            src="/images/hero/faq-page-hero.jpeg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </FaqHeroImage>

        <FaqHeroOverlay
          className="absolute inset-0 bg-linear-to-r from-forest-950 via-forest-950/90 to-forest-950/35"
          delay={0.04}
        />

        <FaqHeroOverlay
          className="absolute inset-0 bg-linear-to-t from-forest-950/95 via-transparent to-forest-950/15"
          delay={0.1}
        />

        <Container className="relative z-10 pb-14 pt-24 sm:pb-18 lg:pb-20">
          <div className="max-w-5xl">
            <FaqHeroReveal delay={0.1}>
              <div className="flex items-center gap-3">
                <FaqHeroLine className="h-px w-10 origin-left bg-gold-400" />

                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
                  Investor guidance
                </p>
              </div>
            </FaqHeroReveal>

            <FaqHeroReveal delay={0.2}>
              <h1 className="font-display mt-7 max-w-5xl text-balance text-5xl leading-[0.94] font-medium tracking-[-0.045em] sm:text-6xl lg:text-8xl">
                Questions deserve clear answers.
              </h1>
            </FaqHeroReveal>

            <FaqHeroReveal delay={0.31}>
              <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
                Understand how investor access,
                opportunities, funding, reporting
                and risk work across the Tevuah
                Reserve platform before deciding
                whether to proceed.
              </p>
            </FaqHeroReveal>

            <FaqHeroReveal
              delay={0.41}
              className="mt-10 sm:mt-12"
            >
              <Button
                href="#faq-categories"
                size="lg"
              >
                Explore questions

                <ArrowDown className="size-4" />
              </Button>
            </FaqHeroReveal>
          </div>

          <FaqStagger className="mt-12 grid gap-6 border-t border-white/15 pt-7 sm:grid-cols-3">
            <FaqStaggerItem>
              <div>
                <p className="text-sm font-semibold">
                  Investor access
                </p>

                <p className="mt-1 text-xs leading-5 text-white/45">
                  Understand how investor
                  relationships and account access
                  begin.
                </p>
              </div>
            </FaqStaggerItem>

            <FaqStaggerItem>
              <div>
                <p className="text-sm font-semibold">
                  Investment process
                </p>

                <p className="mt-1 text-xs leading-5 text-white/45">
                  Learn how opportunities,
                  commitments and funding are
                  handled.
                </p>
              </div>
            </FaqStaggerItem>

            <FaqStaggerItem>
              <div>
                <p className="text-sm font-semibold">
                  Risk awareness
                </p>

                <p className="mt-1 text-xs leading-5 text-white/45">
                  Review important considerations
                  before committing capital.
                </p>
              </div>
            </FaqStaggerItem>
          </FaqStagger>
        </Container>
      </section>

      {/* ==========================================
          INTRODUCTION
      ========================================== */}

      <section className="border-b border-forest-900/10 bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <FaqReveal>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Before you proceed
                </p>

                <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                  Understand the process as well
                  as the opportunity.
                </h2>
              </div>
            </FaqReveal>

            <FaqReveal delay={0.08}>
              <div>
                <p className="text-base leading-8 text-stone-700">
                  Tevuah Reserve provides access to selected private-market opportunities alongside the investor onboarding, documentation, funding and portfolio reporting required throughout the investment process.
                </p>

                <p className="mt-6 text-base leading-8 text-stone-700">
                  These frequently asked questions explain how investor access works, how opportunities are reviewed, how investments are funded and how information is provided after an investment is made.
                </p>

                <div className="mt-8 flex items-start gap-4 rounded-2xl border border-gold-500/25 bg-gold-500/5 p-5">
                  <HelpCircle className="mt-0.5 size-5 shrink-0 text-gold-600" />

                  <p className="text-xs leading-6 text-stone-700">
                    The answers below provide general information about the Tevuah Reserve platform. Investors should review the specific terms, documents and disclosures associated with each opportunity before making an investment decision.
                  </p>
                </div>
              </div>
            </FaqReveal>
          </div>
        </Container>
      </section>

      {/* ==========================================
          CATEGORY NAVIGATION
      ========================================== */}

      <section
        id="faq-categories"
        className="border-b border-forest-900/10 py-12 sm:py-14"
      >
        <Container>
          <FaqRevealSoft>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Browse by topic
            </p>
          </FaqRevealSoft>

          <FaqStagger className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {categoryLinks.map((category) => {
              const Icon = category.icon;

              return (
                <FaqStaggerItem
                  key={category.id}
                >
                  <Link
                    href={`#${category.id}`}
                    className="focus-ring group flex min-h-25 items-center gap-4 rounded-2xl border border-forest-900/10 bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:border-gold-500/40 hover:shadow-[0_16px_40px_rgba(18,38,30,0.06)]"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-forest-950 text-gold-400">
                      <Icon className="size-4" />
                    </span>

                    <span className="text-sm font-semibold text-forest-950">
                      {category.label}
                    </span>
                  </Link>
                </FaqStaggerItem>
              );
            })}
          </FaqStagger>
        </Container>
      </section>

      {/* ==========================================
          FAQ CATEGORIES
      ========================================== */}

      <section className="bg-white">
        <Container>
          {faqCategories.map(
            (category, index) => (
              <section
                key={category.id}
                id={category.id}
                className="scroll-mt-28 border-b border-forest-900/10 py-16 last:border-b-0 sm:py-20 lg:py-24"
              >
                <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
                  <FaqReveal>
                    <div className="lg:sticky lg:top-30 lg:self-start">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                        {category.eyebrow}
                      </p>

                      <h2 className="font-display mt-5 text-3xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-4xl">
                        {category.title}
                      </h2>

                      <p className="mt-5 max-w-sm text-sm leading-7 text-stone-600">
                        {category.description}
                      </p>

                      <p className="mt-8 font-display text-5xl text-forest-950/8">
                        {String(
                          index + 1,
                        ).padStart(2, "0")}
                      </p>
                    </div>
                  </FaqReveal>

                  <FaqReveal delay={0.06}>
                    <FaqAccordion
                      items={category.items}
                    />
                  </FaqReveal>
                </div>
              </section>
            ),
          )}
        </Container>
      </section>

      {/* ==========================================
          RISK CALLOUT
      ========================================== */}

      <section className="border-y border-forest-900/10 bg-ivory-100 py-16 sm:py-20 lg:py-24">
        <Container>
          <FaqReveal>
            <div className="grid gap-8 rounded-4xl bg-forest-950 p-7 text-white sm:p-10 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-10 lg:p-12">
              <span className="flex size-14 items-center justify-center rounded-full bg-gold-500/15 text-gold-400">
                <ShieldCheck className="size-6" />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                  Investment risk
                </p>

                <h2 className="font-display mt-4 max-w-3xl text-3xl font-medium tracking-[-0.03em] sm:text-4xl">
                  Private investments require careful consideration.
                </h2>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
                  Private investments can be illiquid, may involve extended holding periods and can result in the loss of some or all invested capital. Investors should review both the general risk information provided by Tevuah Reserve and the specific risks disclosed for each opportunity before investing.
                </p>
              </div>

              <Button
                href="/risk-disclosure"
                variant="outline"
                size="lg"
                className="w-fit border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                Risk disclosure

                <ArrowUpRight className="size-4" />
              </Button>
            </div>
          </FaqReveal>
        </Container>
      </section>

      {/* ==========================================
          CONTACT
      ========================================== */}

      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <FaqReveal>
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Still have a question?
                </p>

                <h2 className="font-display mt-5 max-w-4xl text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl lg:text-6xl">
                  Speak with Tevuah Reserve.
                </h2>

                <p className="mt-6 max-w-2xl text-base leading-8 text-stone-700">
                  Contact the team to discuss a particular opportunity, investor access, the investment process or any other question about Tevuah Reserve.
                </p>
              </div>

              <Button
                href="/contact"
                size="lg"
                className="w-fit"
              >
                Contact us

                <ArrowUpRight className="size-4" />
              </Button>
            </div>
          </FaqReveal>
        </Container>
      </section>
    </main>
  );
}