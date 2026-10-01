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
      "How investor relationships begin, how access is established and what happens before an investor can proceed.",
    items: [
      {
        question:
          "How do I become a Tevuah Reserve investor?",
        answer:
          "Tevuah Reserve does not use public self-registration for investor accounts. Prospective investors begin by contacting the company to discuss their interests and the investment process. Where an investor proceeds, account access is established through the applicable administrative, eligibility and verification process.",
      },
      {
        question:
          "Why is there no public registration page?",
        answer:
          "Investor access is deliberately established through the Tevuah Reserve administrative process rather than through automatic public account creation. This allows the company to manage investor onboarding, verification and access before investment activity takes place.",
      },
      {
        question:
          "Does contacting Tevuah Reserve guarantee that I can invest?",
        answer:
          "No. An enquiry does not guarantee eligibility, account approval, access to a particular opportunity or an investment allocation. Any applicable investor requirements, verification steps and opportunity-specific conditions must be satisfied before an investment can proceed.",
      },
      {
        question:
          "What information may be required during investor verification?",
        answer:
          "Depending on the applicable process, Tevuah Reserve may request identity information, address information and supporting documentation required to verify the investor and complete relevant compliance checks. Additional information may be requested where necessary.",
      },
      {
        question:
          "I already have an investor account. Where should I go?",
        answer:
          "Existing investors should use the secure investor login to access their dashboard, review investment positions and documents, and continue applicable investment or account activity.",
      },
    ],
  },

  {
    id: "opportunities",
    eyebrow: "Opportunities",
    title:
      "Reviewing investment opportunities",
    description:
      "How opportunities are presented and what investors should consider before deciding whether to proceed.",
    items: [
      {
        question:
          "What types of opportunities does Tevuah Reserve present?",
        answer:
          "The platform is designed around selected private-market opportunities connected with productive agricultural estates, vineyards, olive agriculture, agricultural technology and fine wine. Availability varies and investors should review the information provided for each individual opportunity.",
      },
      {
        question:
          "Where can I view current opportunities?",
        answer:
          "Published opportunities are presented through the Tevuah Reserve investment marketplace. Individual opportunity pages provide the available project information, investment terms, funding information and relevant supporting material.",
      },
      {
        question:
          "Does every opportunity have the same minimum investment?",
        answer:
          "No. Minimum investment amounts can differ between opportunities. The applicable minimum should be reviewed on the specific opportunity before an investor begins the investment process.",
      },
      {
        question:
          "What happens when an opportunity becomes fully funded?",
        answer:
          "Once the available investment capacity has been filled, the opportunity is closed to new investment. A fully funded opportunity may remain visible on the platform for transparency and historical context even though additional investment is no longer available.",
      },
      {
        question:
          "Does Tevuah Reserve guarantee the target return shown for an opportunity?",
        answer:
          "No. Target returns, projections, assumptions or similar forward-looking information are not guarantees of performance. Actual outcomes can differ materially and investors should consider the risks, assumptions and opportunity-specific documentation before committing capital.",
      },
    ],
  },

  {
    id: "portfolio",
    eyebrow: "Portfolio",
    title:
      "Building and monitoring exposure",
    description:
      "How investors can think about different opportunities and use the platform after investing.",
    items: [
      {
        question:
          "Can Tevuah Reserve help me understand how different opportunities compare?",
        answer:
          "Tevuah Reserve can provide information about its opportunities, asset categories and platform process and can discuss relevant portfolio considerations. Investors remain responsible for their own investment decisions and should obtain qualified financial, legal or tax advice where personalised advice is required.",
      },
      {
        question:
          "What should I consider when building a private-asset portfolio?",
        answer:
          "Relevant considerations can include investment objectives, time horizon, concentration, asset-category exposure, liquidity expectations, opportunity-specific risks and the amount of capital committed to private investments. The appropriate balance depends on each investor's circumstances.",
      },
      {
        question:
          "What can I see in my investor dashboard?",
        answer:
          "The investor dashboard is designed to provide a structured view of investment positions, relevant documents, transaction activity and other applicable portfolio information made available through the platform.",
      },
      {
        question:
          "Will I receive operational updates after investing?",
        answer:
          "Where reporting is available, Tevuah Reserve can provide relevant investment, estate or asset updates through the investor experience. The nature, frequency and source of reporting may vary by opportunity.",
      },
    ],
  },

  {
    id: "funding",
    eyebrow: "Funding",
    title:
      "Subscriptions, funding and joint investments",
    description:
      "What happens when an investor decides to proceed with an opportunity.",
    items: [
      {
        question:
          "How does an investor begin an investment?",
        answer:
          "An eligible investor begins from the relevant opportunity and follows the applicable investment workflow. The process can include reviewing the commitment, completing required acknowledgements or documentation and following the funding instructions made available for that investment.",
      },
      {
        question:
          "How are funding instructions provided?",
        answer:
          "Applicable funding instructions are presented through the controlled investment process. Investors should use only instructions provided through authorised Tevuah Reserve channels and should verify any unexpected request to change payment details before transferring funds.",
      },
      {
        question:
          "Can two investors invest jointly?",
        answer:
          "Where joint investment is supported, a joint subscription can include an initiating investor and another participating investor. Each required member must complete the applicable acceptance and consent process before the joint investment can progress.",
      },
      {
        question:
          "Does a joint investment proceed as soon as one person accepts?",
        answer:
          "No. A joint investment requiring multiple member acceptances does not progress solely because one member has accepted. The required participating members must complete the applicable consent process before the subscription can move to the next stage.",
      },
      {
        question:
          "Does starting an investment guarantee capacity?",
        answer:
          "No. Availability can be limited and is subject to the applicable investment and capacity process. Investors should not assume that viewing or beginning an opportunity permanently reserves an allocation unless the platform expressly confirms the relevant reservation or investment status.",
      },
    ],
  },

  {
    id: "documents-reporting",
    eyebrow: "Documents & reporting",
    title:
      "Information throughout the investment lifecycle",
    description:
      "How investment documents, statements and reporting are handled through the platform.",
    items: [
      {
        question:
          "Where can I access investment documents?",
        answer:
          "Documents made available to an approved investor can be accessed through the relevant secure investor experience or opportunity workflow, subject to the applicable access controls.",
      },
      {
        question:
          "Will joint investors have access to relevant documents?",
        answer:
          "Where documents or statements relate to a joint investment, access can be provided through the applicable joint investment and investor-document framework, subject to the platform's permissions and document controls.",
      },
      {
        question:
          "How are distributions reflected?",
        answer:
          "Where an investment generates a distribution and that distribution has been processed through the applicable investment structure, relevant distribution activity can be reflected within the investor's investment records and reporting.",
      },
      {
        question:
          "Are estate and AgTech measurements guaranteed to be real-time?",
        answer:
          "No. Operational and AgTech reporting should be understood according to the source, measurement timestamp, validation process and reporting frequency provided with the relevant data. Not every metric should be assumed to be live or continuously updated.",
      },
      {
        question:
          "How is fine-wine valuation information handled?",
        answer:
          "Wine-specific valuation history or market information should be presented only where supported by appropriate valuation sources and reporting data. Valuations can change and should not be interpreted as guaranteed sale prices or investment returns.",
      },
    ],
  },

  {
    id: "risk",
    eyebrow: "Risk & responsibility",
    title:
      "Understanding private investment risk",
    description:
      "Important considerations that apply before committing capital.",
    items: [
      {
        question:
          "Can I lose money through a Tevuah Reserve investment?",
        answer:
          "Yes. Private investments involve risk, including the possible loss of some or all invested capital. Investors should assess the risks of each opportunity and should not invest capital they cannot afford to lose.",
      },
      {
        question:
          "Are private investments liquid?",
        answer:
          "They may not be. Private investments can involve long holding periods and limited or no readily available secondary market. Investors should not assume that an investment can be sold or redeemed whenever they choose.",
      },
      {
        question:
          "What risks can affect agricultural investments?",
        answer:
          "Agricultural and estate investments can be affected by factors including weather, climate conditions, crop performance, disease, water availability, labour, operating costs, commodity or product pricing, regulation and execution by operators. Opportunity-specific risks can differ materially.",
      },
      {
        question:
          "What risks apply to fine wine?",
        answer:
          "Fine wine can be affected by valuation changes, market demand, vintage and producer characteristics, provenance, storage conditions, insurance, custody, authenticity, transaction costs and liquidity. Historical pricing does not guarantee future value.",
      },
      {
        question:
          "Is information on the website investment advice?",
        answer:
          "General platform, educational and opportunity information should not be treated as personalised financial, legal or tax advice. Investors should obtain appropriate professional advice where their circumstances require it.",
      },
      {
        question:
          "Where can I read more about investment risk?",
        answer:
          "Tevuah Reserve provides a dedicated Risk Disclosure page covering important categories of risk associated with the platform and private investments. Opportunity-specific documentation should also be reviewed because individual investments can involve additional risks.",
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
            src="/images/hero/estates-page-hero.jpg"
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
                  Tevuah Reserve brings together
                  investment opportunities,
                  investor onboarding, funding,
                  documents and portfolio
                  reporting within a structured
                  private-market experience.
                </p>

                <p className="mt-6 text-base leading-8 text-stone-700">
                  These frequently asked
                  questions explain how the
                  platform works and highlight
                  important considerations that
                  investors should understand
                  before making an investment
                  decision.
                </p>

                <div className="mt-8 flex items-start gap-4 rounded-2xl border border-gold-500/25 bg-gold-500/5 p-5">
                  <HelpCircle className="mt-0.5 size-5 shrink-0 text-gold-600" />

                  <p className="text-xs leading-6 text-stone-700">
                    These answers provide general
                    platform information.
                    Opportunity-specific terms,
                    documents and disclosures
                    should always be reviewed
                    separately before investing.
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
                  Private investments require
                  careful consideration.
                </h2>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
                  Investments can be illiquid,
                  may involve long holding
                  periods and can result in the
                  loss of some or all invested
                  capital. Review both general
                  and opportunity-specific risks
                  before investing.
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
                  Contact the team if you would
                  like to discuss a particular
                  opportunity, investor access or
                  another question about the
                  platform.
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