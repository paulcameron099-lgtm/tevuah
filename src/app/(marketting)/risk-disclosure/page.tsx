import type {
  Metadata,
} from "next";

import Image from "next/image";
import Link from "next/link";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUpRight,
  BarChart3,
  CloudSun,
  Coins,
  Database,
  FileSearch,
  Grape,
  Landmark,
  Layers3,
  LockKeyhole,
  Scale,
  ShieldAlert,
  Users,
  Wine,
} from "lucide-react";

import {
  RiskHeroImage,
  RiskHeroLine,
  RiskHeroOverlay,
  RiskHeroReveal,
  RiskReveal,
  RiskRevealSoft,
  RiskStagger,
  RiskStaggerItem,
} from "@/src/components/risk-disclosure/risk-disclosure-motion";

import {
  Button,
} from "@/src/components/ui/button";

import {
  Container,
} from "@/src/components/ui/container";

export const metadata: Metadata = {
  title: "Risk Disclosure",
  description:
    "Important information about the risks associated with private investments and opportunities presented through Tevuah Reserve.",
};

type RiskSection = {
  id: string;
  number: string;
  title: string;
  icon: typeof AlertTriangle;
  paragraphs: string[];
  points?: string[];
};

const riskSections: RiskSection[] = [
  {
    id: "capital-loss",
    number: "01",
    title:
      "Loss of capital and investment performance",
    icon: ShieldAlert,
    paragraphs: [
      "Investing involves risk. The value of an investment may fall as well as rise, and an investor may receive back less than the amount invested. In some circumstances, an investor may lose all of the capital committed to an investment.",
      "Target returns, projected distributions, expected durations, forecasts, assumptions and other forward-looking information are estimates rather than guarantees. Actual performance may differ materially from any target or projection.",
    ],
    points: [
      "Investment returns are not guaranteed.",
      "Capital may be lost in part or in full.",
      "Past or historical performance does not guarantee future results.",
      "Projected returns and distributions may not be achieved.",
    ],
  },

  {
    id: "liquidity",
    number: "02",
    title:
      "Liquidity and holding-period risk",
    icon: Coins,
    paragraphs: [
      "Private investments may be illiquid. There may be no established public market in which an investor can sell an investment, and a secondary buyer may not be available when an investor wishes to exit.",
      "Expected investment durations are estimates and may change. Investors should be prepared to hold an investment for longer than originally anticipated and should not commit capital that they may need to access at short notice.",
    ],
    points: [
      "There may be no readily available secondary market.",
      "An early exit may be unavailable, restricted or economically unattractive.",
      "Realisation events may occur later than expected.",
      "Capital may remain committed for an extended period.",
    ],
  },

  {
    id: "agriculture",
    number: "03",
    title:
      "Agricultural and estate operating risk",
    icon: Grape,
    paragraphs: [
      "Agricultural assets are exposed to operational and environmental factors that can materially affect production, costs, asset performance and investment outcomes.",
      "Vineyards, olive estates and other agricultural operations may experience changes in crop yields, input costs, labour availability, disease pressure, water availability, infrastructure requirements and market conditions.",
    ],
    points: [
      "Crop yields may be lower than expected.",
      "Pests, disease or plant health issues may affect production.",
      "Labour, energy, fertiliser and other operating costs may increase.",
      "Equipment or infrastructure may require unexpected repair or replacement.",
      "Product prices and agricultural markets may fluctuate.",
    ],
  },

  {
    id: "climate",
    number: "04",
    title:
      "Weather, climate and natural-event risk",
    icon: CloudSun,
    paragraphs: [
      "Agricultural performance can be materially affected by weather and environmental conditions. Drought, excessive rainfall, frost, heat, wildfire, flooding, storms and other natural events may affect crops, infrastructure and operating results.",
      "Longer-term changes in climate patterns may alter water requirements, growing conditions, crop suitability, disease pressure and the economics of agricultural operations.",
    ],
  },

  {
    id: "fine-wine",
    number: "05",
    title:
      "Fine-wine investment risk",
    icon: Wine,
    paragraphs: [
      "Fine wine is a specialist asset category whose value can be affected by market demand, producer reputation, vintage characteristics, critic sentiment, provenance, storage conditions, authenticity and broader economic conditions.",
      "Wine valuations are estimates and may not represent the price at which a holding can actually be sold. Transaction costs, storage, insurance, custody and market liquidity may also affect realised returns.",
    ],
    points: [
      "Market valuations can rise or fall.",
      "There may be limited liquidity for particular wines or vintages.",
      "Storage and custody conditions can affect value.",
      "Provenance and authenticity are material considerations.",
      "Quoted or estimated valuations do not guarantee a sale price.",
    ],
  },

  {
    id: "valuation",
    number: "06",
    title:
      "Valuation and pricing risk",
    icon: BarChart3,
    paragraphs: [
      "Private and specialist assets may not have continuously observable market prices. Valuations may therefore rely on third-party information, comparable transactions, market data, appraisals, models or other assumptions.",
      "A reported valuation may differ from the amount ultimately realised through a sale, refinancing, distribution or other liquidity event. Valuation methodologies and available market information may also change over time.",
    ],
  },

  {
    id: "concentration",
    number: "07",
    title:
      "Concentration and diversification risk",
    icon: Layers3,
    paragraphs: [
      "Concentrating a significant proportion of capital in one opportunity, operator, geography, agricultural category or specialist asset can increase exposure to adverse events affecting that particular investment.",
      "Diversification may reduce some forms of concentration risk, but it cannot eliminate investment risk or guarantee against loss.",
    ],
  },

  {
    id: "currency",
    number: "08",
    title:
      "Currency and cross-border risk",
    icon: Landmark,
    paragraphs: [
      "An opportunity may involve assets, revenues, expenses or transactions denominated in currencies different from an investor's home currency. Exchange-rate movements can therefore increase or reduce investment returns when measured in the investor's preferred currency.",
      "Cross-border investments may also be affected by different legal systems, banking arrangements, tax rules, transfer restrictions and economic or political conditions.",
    ],
  },

  {
    id: "distributions",
    number: "09",
    title:
      "Distribution and cash-flow risk",
    icon: Coins,
    paragraphs: [
      "Any expected distribution schedule is subject to the actual performance, liquidity and cash requirements of the relevant investment structure or underlying asset.",
      "Distributions may be lower than expected, delayed, suspended or not made at all. Investors should not rely on projected distributions as guaranteed income.",
    ],
  },

  {
    id: "operators",
    number: "10",
    title:
      "Operator, counterparty and third-party risk",
    icon: Users,
    paragraphs: [
      "Investment outcomes may depend on estate operators, managers, custodians, banks, service providers, suppliers, advisers and other third parties performing their obligations appropriately.",
      "Operational failure, financial distress, misconduct, disputes, delays or errors by a relevant counterparty or service provider may adversely affect an investment.",
    ],
  },

  {
    id: "joint-investment",
    number: "11",
    title:
      "Joint-investment risk",
    icon: Users,
    paragraphs: [
      "Where an investment is made jointly, participating investors may have shared rights, obligations or economic interests under the applicable investment structure and documentation.",
      "A joint investment may require acceptance or action from more than one participating member. Delays, disagreements or a failure by a required participant to complete an applicable step may affect the progression or administration of the joint investment.",
    ],
  },

  {
    id: "technology",
    number: "12",
    title:
      "Technology, AgTech and data risk",
    icon: Database,
    paragraphs: [
      "Technology can improve visibility into agricultural operations, but sensors, communications networks, software platforms and data sources can fail, become unavailable or produce incomplete or inaccurate information.",
      "AgTech and operational measurements should be interpreted according to their source, timestamp, methodology and validation status. Data displayed through the platform should not be assumed to be continuously available or error-free.",
    ],
  },

  {
    id: "cybersecurity",
    number: "13",
    title:
      "Cybersecurity and platform risk",
    icon: LockKeyhole,
    paragraphs: [
      "Digital platforms and service providers are exposed to cybersecurity threats, system outages, unauthorised access, software defects and other technology-related risks.",
      "Security controls can reduce risk but cannot eliminate it entirely. Interruptions or security incidents may temporarily affect access to accounts, documents, reporting or other platform functionality.",
    ],
  },

  {
    id: "legal-tax",
    number: "14",
    title:
      "Legal, regulatory and tax risk",
    icon: Scale,
    paragraphs: [
      "Laws, regulations, tax rules and regulatory interpretations can change and may affect an investment, an underlying asset, an operator or an investor's own position.",
      "Tax consequences can differ materially between investors and jurisdictions. Information provided by Tevuah Reserve should not be treated as personalised legal or tax advice. Investors should obtain independent professional advice where appropriate.",
    ],
  },

  {
    id: "information",
    number: "15",
    title:
      "Information and disclosure risk",
    icon: FileSearch,
    paragraphs: [
      "Private investments may provide less publicly available information than securities traded on established public markets. Information may also be received periodically rather than continuously.",
      "Investors should review all material information made available for a specific opportunity, ask questions where information is unclear and consider whether they have sufficient information to make an informed decision.",
    ],
  },

  {
    id: "forward-looking",
    number: "16",
    title:
      "Forward-looking statements and assumptions",
    icon: BarChart3,
    paragraphs: [
      "The platform or opportunity materials may contain projections, forecasts, estimates, targets, expected durations and other forward-looking statements. These depend on assumptions and circumstances that may not occur as expected.",
      "Actual events and results may differ materially because of operational, financial, market, environmental, regulatory or other factors. Forward-looking statements should not be treated as promises or guarantees.",
    ],
  },
];

const quickLinks = [
  {
    href: "#capital-loss",
    label: "Capital loss",
  },
  {
    href: "#liquidity",
    label: "Liquidity",
  },
  {
    href: "#agriculture",
    label: "Agriculture",
  },
  {
    href: "#fine-wine",
    label: "Fine wine",
  },
  {
    href: "#valuation",
    label: "Valuation",
  },
  {
    href: "#technology",
    label: "Technology",
  },
  {
    href: "#legal-tax",
    label: "Legal & tax",
  },
  {
    href: "#information",
    label: "Information",
  },
];

export default function RiskDisclosurePage() {
  return (
    <main className="bg-ivory-100">
      {/* ==========================================
          HERO
      ========================================== */}

      <section className="relative flex min-h-155 items-end overflow-hidden bg-forest-950 pt-19 text-white lg:pt-22">
        <RiskHeroImage className="absolute inset-0">
          <Image
            src="/images/hero/estates-page-hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </RiskHeroImage>

        <RiskHeroOverlay
          className="absolute inset-0 bg-linear-to-r from-forest-950 via-forest-950/92 to-forest-950/40"
          delay={0.04}
        />

        <RiskHeroOverlay
          className="absolute inset-0 bg-linear-to-t from-forest-950/95 via-forest-950/20 to-forest-950/20"
          delay={0.1}
        />

        <Container className="relative z-10 pb-14 pt-24 sm:pb-18 lg:pb-20">
          <div className="max-w-5xl">
            <RiskHeroReveal delay={0.1}>
              <div className="flex items-center gap-3">
                <RiskHeroLine className="h-px w-10 origin-left bg-gold-400" />

                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
                  Investor information
                </p>
              </div>
            </RiskHeroReveal>

            <RiskHeroReveal delay={0.2}>
              <h1 className="font-display mt-7 max-w-5xl text-balance text-5xl leading-[0.94] font-medium tracking-[-0.045em] sm:text-6xl lg:text-8xl">
                Risk Disclosure
              </h1>
            </RiskHeroReveal>

            <RiskHeroReveal delay={0.31}>
              <p className="mt-7 max-w-3xl text-base leading-8 text-white/65 sm:text-lg">
                Private investments involve
                significant risk. Understand the
                potential for capital loss,
                illiquidity, operational
                uncertainty and other material
                risks before deciding whether to
                invest.
              </p>
            </RiskHeroReveal>

            <RiskHeroReveal
            delay={0.41}
            className="mt-10 sm:mt-12"
            >
            <Button
                href="#important-warning"
                size="lg"
            >
                Read the disclosure

                <ArrowDown className="size-4" />
            </Button>
            </RiskHeroReveal>
          </div>

          <RiskStagger className="mt-12 grid gap-6 border-t border-white/15 pt-7 sm:grid-cols-3">
            <RiskStaggerItem>
              <div>
                <p className="text-sm font-semibold">
                  Capital at risk
                </p>

                <p className="mt-1 text-xs leading-5 text-white/45">
                  You may lose some or all of the
                  capital you invest.
                </p>
              </div>
            </RiskStaggerItem>

            <RiskStaggerItem>
              <div>
                <p className="text-sm font-semibold">
                  Limited liquidity
                </p>

                <p className="mt-1 text-xs leading-5 text-white/45">
                  Private investments may be
                  difficult or impossible to sell
                  when desired.
                </p>
              </div>
            </RiskStaggerItem>

            <RiskStaggerItem>
              <div>
                <p className="text-sm font-semibold">
                  Returns are not guaranteed
                </p>

                <p className="mt-1 text-xs leading-5 text-white/45">
                  Targets, forecasts and
                  projections may not be achieved.
                </p>
              </div>
            </RiskStaggerItem>
          </RiskStagger>
        </Container>
      </section>

      {/* ==========================================
          IMPORTANT WARNING
      ========================================== */}

      <section
        id="important-warning"
        className="scroll-mt-28 border-b border-forest-900/10 bg-white py-16 sm:py-20 lg:py-24"
      >
        <Container>
          <RiskReveal>
            <div className="grid gap-8 rounded-4xl bg-forest-950 p-7 text-white sm:p-10 lg:grid-cols-[auto_1fr] lg:gap-10 lg:p-12">
              <span className="flex size-14 items-center justify-center rounded-full bg-gold-500/15 text-gold-400">
                <AlertTriangle className="size-6" />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                  Important risk warning
                </p>

                <h2 className="font-display mt-4 max-w-4xl text-3xl font-medium tracking-[-0.03em] sm:text-4xl lg:text-5xl">
                  Do not invest unless you
                  understand the investment and
                  can bear the risk of loss.
                </h2>

                <p className="mt-6 max-w-4xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
                  Investments presented through
                  Tevuah Reserve may involve
                  private, specialist, illiquid or
                  operational assets. The value
                  and performance of an investment
                  can be affected by events beyond
                  the control of Tevuah Reserve,
                  the investor or the underlying
                  operator.
                </p>

                <p className="mt-5 max-w-4xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
                  Investors should consider their
                  financial circumstances,
                  investment objectives, time
                  horizon, liquidity requirements
                  and ability to withstand loss
                  before committing capital.
                </p>
              </div>
            </div>
          </RiskReveal>
        </Container>
      </section>

      {/* ==========================================
          PURPOSE
      ========================================== */}

      <section className="border-b border-forest-900/10 py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
            <RiskReveal>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Purpose of this disclosure
                </p>

                <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                  Understand risk before
                  committing capital.
                </h2>
              </div>
            </RiskReveal>

            <RiskReveal delay={0.08}>
              <div className="space-y-6 text-base leading-8 text-stone-700">
                <p>
                  This Risk Disclosure provides
                  general information about
                  important risks that may arise
                  when considering investments
                  presented through Tevuah
                  Reserve.
                </p>

                <p>
                  It is not intended to describe
                  every possible risk and does not
                  replace the terms, disclosures,
                  agreements or other information
                  relating to a specific
                  investment opportunity.
                </p>

                <p>
                  Different opportunities may
                  involve different structures,
                  operators, assets, jurisdictions,
                  currencies, time horizons and
                  risk factors. Investors should
                  therefore review each
                  opportunity on its own merits.
                </p>

                <div className="rounded-2xl border border-gold-500/25 bg-gold-500/5 p-5">
                  <p className="text-xs leading-6 text-stone-700">
                    Where professional financial,
                    legal, accounting or tax
                    advice is required, investors
                    should obtain advice from
                    appropriately qualified
                    independent professionals.
                  </p>
                </div>
              </div>
            </RiskReveal>
          </div>
        </Container>
      </section>

      {/* ==========================================
          QUICK NAVIGATION
      ========================================== */}

      <section className="border-b border-forest-900/10 bg-white py-10">
        <Container>
          <RiskRevealSoft>
            <div className="flex flex-wrap items-center gap-3">
              <span className="mr-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Jump to
              </span>

              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="focus-ring rounded-full border border-forest-900/10 bg-ivory-100 px-4 py-2 text-xs font-semibold text-forest-950 transition hover:border-gold-500/40 hover:bg-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </RiskRevealSoft>
        </Container>
      </section>

      {/* ==========================================
          RISK SECTIONS
      ========================================== */}

      <section className="bg-white">
        <Container>
          {riskSections.map(
            (section) => {
              const Icon = section.icon;

              return (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-28 border-b border-forest-900/10 py-14 last:border-b-0 sm:py-16 lg:py-20"
                >
                  <div className="grid gap-8 lg:grid-cols-[0.55fr_1.45fr] lg:gap-20">
                    <RiskReveal>
                      <div className="lg:sticky lg:top-30 lg:self-start">
                        <div className="flex items-center gap-4">
                          <span className="flex size-11 items-center justify-center rounded-full bg-forest-950 text-gold-400">
                            <Icon className="size-5" />
                          </span>

                          <span className="font-display text-2xl text-forest-950/20">
                            {section.number}
                          </span>
                        </div>

                        <h2 className="font-display mt-6 max-w-md text-3xl leading-[1.05] font-medium tracking-[-0.03em] text-forest-950 sm:text-4xl">
                          {section.title}
                        </h2>
                      </div>
                    </RiskReveal>

                    <div>
                      <RiskStagger className="space-y-5">
                        {section.paragraphs.map(
                          (paragraph) => (
                            <RiskStaggerItem
                              key={paragraph}
                            >
                              <p className="text-[15px] leading-8 text-stone-700">
                                {paragraph}
                              </p>
                            </RiskStaggerItem>
                          ),
                        )}
                      </RiskStagger>

                      {section.points ? (
                        <RiskStagger className="mt-8 grid gap-3">
                          {section.points.map(
                            (point) => (
                              <RiskStaggerItem
                                key={point}
                              >
                                <div className="flex items-start gap-4 rounded-2xl bg-ivory-100 p-4 sm:p-5">
                                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-600" />

                                  <p className="text-sm leading-7 text-stone-700">
                                    {point}
                                  </p>
                                </div>
                              </RiskStaggerItem>
                            ),
                          )}
                        </RiskStagger>
                      ) : null}
                    </div>
                  </div>
                </section>
              );
            },
          )}
        </Container>
      </section>

      {/* ==========================================
          OPPORTUNITY-SPECIFIC RISK
      ========================================== */}

      <section className="border-y border-forest-900/10 bg-ivory-100 py-16 sm:py-20 lg:py-24">
        <Container>
          <RiskReveal>
            <div className="grid gap-10 rounded-4xl border border-forest-900/10 bg-white p-7 sm:p-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16 lg:p-12">
              <div>
                <span className="flex size-12 items-center justify-center rounded-full bg-forest-950 text-gold-400">
                  <FileSearch className="size-5" />
                </span>

                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Opportunity-specific risks
                </p>

                <h2 className="font-display mt-4 text-3xl font-medium tracking-[-0.03em] text-forest-950 sm:text-4xl">
                  This page is not the complete
                  risk analysis for any
                  investment.
                </h2>
              </div>

              <div className="space-y-5 text-sm leading-8 text-stone-700">
                <p>
                  Every investment can involve
                  risks that are specific to its
                  structure, underlying asset,
                  operator, geography, financing,
                  commercial arrangements and
                  other circumstances.
                </p>

                <p>
                  Before investing, review the
                  opportunity information,
                  applicable agreements,
                  supporting documents and
                  opportunity-specific risk
                  disclosures made available to
                  you.
                </p>

                <p>
                  If information is unclear or
                  incomplete, investors should
                  seek clarification before
                  committing capital rather than
                  relying on assumptions.
                </p>

                <Button
                  href="/investments"
                  variant="secondary"
                  className="mt-3"
                >
                  View opportunities

                  <ArrowUpRight className="size-4" />
                </Button>
              </div>
            </div>
          </RiskReveal>
        </Container>
      </section>

      {/* ==========================================
          INVESTOR RESPONSIBILITY
      ========================================== */}

      <section className="bg-forest-950 py-16 text-white sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <RiskReveal>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                  Investor responsibility
                </p>

                <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] sm:text-5xl">
                  Make an informed decision.
                </h2>

                <p className="mt-6 max-w-md text-sm leading-7 text-white/60">
                  An investment decision should
                  reflect both the potential
                  opportunity and the investor&apos;s
                  ability to tolerate the
                  associated risks.
                </p>
              </div>
            </RiskReveal>

            <RiskStagger className="divide-y divide-white/10 border-y border-white/10">
              {[
                {
                  number: "01",
                  title:
                    "Read the available information",
                  description:
                    "Review the investment terms, documents, assumptions and risk disclosures relevant to the opportunity.",
                },
                {
                  number: "02",
                  title:
                    "Consider your financial position",
                  description:
                    "Assess whether you can withstand a loss and whether committed capital may be required elsewhere during the expected holding period.",
                },
                {
                  number: "03",
                  title:
                    "Consider concentration",
                  description:
                    "Evaluate how the investment would affect your exposure to a particular asset, sector, geography or risk category.",
                },
                {
                  number: "04",
                  title:
                    "Ask questions",
                  description:
                    "Seek clarification where material information, assumptions, investment mechanics or risks are not understood.",
                },
                {
                  number: "05",
                  title:
                    "Obtain professional advice where needed",
                  description:
                    "Use appropriately qualified advisers where financial, legal, tax or other professional advice is necessary for your circumstances.",
                },
              ].map((item) => (
                <RiskStaggerItem
                  key={item.number}
                >
                  <div className="grid gap-4 py-7 sm:grid-cols-[70px_1fr] sm:gap-7">
                    <p className="font-display text-2xl text-gold-400">
                      {item.number}
                    </p>

                    <div>
                      <h3 className="font-display text-2xl font-semibold">
                        {item.title}
                      </h3>

                      <p className="mt-3 max-w-xl text-sm leading-7 text-white/55">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </RiskStaggerItem>
              ))}
            </RiskStagger>
          </div>
        </Container>
      </section>

      {/* ==========================================
          NO ADVICE / NO GUARANTEE
      ========================================== */}

      <section className="border-b border-forest-900/10 bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <RiskReveal>
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <article className="rounded-3xl border border-forest-900/10 p-7 sm:p-8">
                <Scale className="size-6 text-gold-600" />

                <h2 className="font-display mt-6 text-3xl font-medium tracking-[-0.03em] text-forest-950">
                  No personalised advice
                </h2>

                <p className="mt-5 text-sm leading-7 text-stone-700">
                  General information presented
                  through Tevuah Reserve does not
                  by itself constitute
                  personalised financial, legal,
                  tax or accounting advice.
                  Investors remain responsible
                  for evaluating whether an
                  investment is appropriate for
                  their own circumstances and for
                  obtaining independent
                  professional advice where
                  required.
                </p>
              </article>

              <article className="rounded-3xl border border-forest-900/10 p-7 sm:p-8">
                <ShieldAlert className="size-6 text-gold-600" />

                <h2 className="font-display mt-6 text-3xl font-medium tracking-[-0.03em] text-forest-950">
                  No guarantee
                </h2>

                <p className="mt-5 text-sm leading-7 text-stone-700">
                  Nothing presented through the
                  platform should be interpreted
                  as a guarantee of investment
                  performance, capital
                  preservation, liquidity,
                  distributions, valuation,
                  timing or any particular
                  investment outcome.
                </p>
              </article>
            </div>
          </RiskReveal>
        </Container>
      </section>

      {/* ==========================================
          ACKNOWLEDGEMENT
      ========================================== */}

      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <RiskReveal>
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Before investing
              </p>

              <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                Risk is part of the investment
                decision.
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-stone-700">
                Take the time to understand the
                investment, the available
                information and the possibility
                that actual outcomes may differ
                substantially from expectations.
              </p>

              <div className="mt-9 flex flex-wrap justify-center gap-4">
                <Button
                  href="/investments"
                  size="lg"
                >
                  View opportunities

                  <ArrowUpRight className="size-4" />
                </Button>

                <Button
                  href="/contact"
                  variant="secondary"
                  size="lg"
                >
                  Ask a question
                </Button>
              </div>
            </div>
          </RiskReveal>
        </Container>
      </section>

      {/* ==========================================
          DOCUMENT NOTE
      ========================================== */}

      <section className="border-t border-forest-900/10 bg-white py-8">
        <Container>
          <RiskRevealSoft>
            <div className="flex flex-col gap-3 text-xs leading-6 text-stone-500 sm:flex-row sm:items-start sm:justify-between">
              <p>
                General Risk Disclosure
              </p>

              <p className="max-w-3xl sm:text-right">
                This disclosure provides general
                risk information and should be
                read together with the terms,
                documents and risk factors
                applicable to each specific
                investment opportunity.
              </p>
            </div>
          </RiskRevealSoft>
        </Container>
      </section>
    </main>
  );
}