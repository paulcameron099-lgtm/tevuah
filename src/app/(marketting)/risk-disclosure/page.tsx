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
      "Investing involves the risk of losing capital. The value of an investment may rise or fall, and an investor may receive less than the amount invested. In some circumstances, an investor may lose all of the capital committed.",
      "Target returns, projected distributions, expected holding periods, forecasts, assumptions and other forward-looking information are estimates and are not guarantees. Actual performance may differ materially from expectations.",
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
      "Private investments may be illiquid. There may be no established public market for an investment, and a secondary buyer may not be available when an investor wishes to sell or transfer their position.",
      "The expected duration of an investment may change. An investment may need to be held longer than initially anticipated, and investors should not commit capital that they may need to access in the short term.",
    ],
    points: [
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
      "Agricultural investments are exposed to operational, environmental and market conditions that can materially affect production, costs, asset values and investment performance.",
      "Vineyards, olive estates and other agricultural operations may be affected by changes in crop yields, input costs, labour availability, plant disease, water availability, infrastructure requirements and market conditions.",
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
      "Agricultural performance can be materially affected by weather and environmental conditions. Drought, excessive rainfall, frost, extreme heat, wildfire, flooding, storms and other natural events may damage crops, infrastructure and other assets and may adversely affect operating results.",
      "Long-term changes in climate conditions may also affect water availability, growing conditions, crop suitability, disease pressure and the economics of agricultural operations.",
    ],
  },

  {
    id: "fine-wine",
    number: "05",
    title:
      "Fine-wine investment risk",
    icon: Wine,
    paragraphs: [
      "Fine wine is a specialist asset category whose value can be affected by market demand, producer reputation, vintage characteristics, market sentiment, provenance, storage conditions, authenticity and broader economic conditions.",
      "Wine valuations are estimates and may differ from the amount that can ultimately be realised through a sale. Transaction costs, storage, insurance, custody and market liquidity may also affect realised returns.",
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
      "Private and specialist assets may not have continuously observable market prices. Valuations may therefore rely on third-party information, comparable transactions, market data, appraisals, valuation models or other assumptions.",
      "A reported valuation may differ materially from the amount ultimately realised through a sale, refinancing, distribution or other liquidity event.",
      "Valuation methodologies, market conditions and available information may change over time.",
    ],
  },

  {
    id: "concentration",
    number: "07",
    title:
      "Concentration and diversification risk",
    icon: Layers3,
    paragraphs: [
      "Concentrating a significant portion of capital in a single opportunity, operator, geography, agricultural category or specialist asset can increase exposure to adverse events affecting that particular investment.",
      "Diversification may reduce certain concentration risks but cannot eliminate investment risk or guarantee against loss.",
      "Investors should consider the effect of each investment on their overall portfolio and level of exposure to particular assets, markets and risk factors.",
    ],
  },

  {
    id: "currency",
    number: "08",
    title:
      "Currency and cross-border risk",
    icon: Landmark,
    paragraphs: [
      "An investment may involve assets, revenues, expenses or transactions denominated in a currency different from the investor's home currency. Changes in exchange rates may therefore increase or reduce investment returns when measured in the investor's preferred currency.",
      "Cross-border investments may also be affected by different legal systems, banking arrangements, tax requirements, transfer restrictions and economic or political conditions.",
    ],
  },

  {
    id: "distributions",
    number: "09",
    title:
      "Distribution and cash-flow risk",
    icon: Coins,
    paragraphs: [
      "Distributions depend on the performance, liquidity and cash requirements of the relevant investment structure and underlying assets.",
      "Distributions may be lower than expected, delayed, suspended or not made.",
      "Projected distributions should not be treated as guaranteed income or relied upon as a fixed source of cash flow.",
    ],
  },

  {
    id: "operators",
    number: "10",
    title:
      "Operator, counterparty and third-party risk",
    icon: Users,
    paragraphs: [
      "Investment performance may depend on estate operators, managers, custodians, banks, service providers, suppliers, advisers and other third parties performing their respective obligations.",
      "Operational failures, financial distress, misconduct, disputes, delays or errors by an operator, counterparty or service provider may adversely affect an investment.",
      "The performance of an investment may therefore depend on parties outside the direct control of the investor or Tevuah Reserve.",
    ],
  },

  {
    id: "joint-investment",
    number: "11",
    title:
      "Joint-investment risk",
    icon: Users,
    paragraphs: [
      "Where an investment is held jointly, participating investors may have shared rights, obligations and economic interests under the applicable investment structure and documentation.",
      "A joint investment may require action, consent or completion of required steps by more than one participating investor. Delays, disagreements or a failure by a required participant to complete an applicable requirement may affect the administration or progression of the investment.",
    ],
  },

  {
    id: "technology",
    number: "12",
    title:
      "Technology, AgTech and data risk",
    icon: Database,
    paragraphs: [
      "Technology can improve visibility into agricultural operations, but sensors, communications networks, software platforms and data sources may fail, become unavailable or produce incomplete, delayed or inaccurate information.",
      "AgTech and operational measurements should be evaluated according to their source, timestamp, methodology and validation status.",
      "Information displayed through the platform should not be assumed to be continuously available, complete or error-free.",
      "Technology and data are used to support reporting and operational visibility; they do not eliminate the underlying risks associated with agricultural operations or investment decisions.",
    ],
  },

  {
    id: "cybersecurity",
    number: "13",
    title:
      "Cybersecurity and platform risk",
    icon: LockKeyhole,
    paragraphs: [
      "Digital platforms and service providers are exposed to cybersecurity threats, system outages, unauthorized access, software defects, data loss and other technology-related risks.",
      "Security controls can reduce these risks but cannot eliminate them entirely.",
      "A system interruption or security incident may temporarily affect access to investor accounts, documents, reporting or other platform functionality.",
    ],
  },

  {
    id: "legal-tax",
    number: "14",
    title:
      "Legal, regulatory and tax risk",
    icon: Scale,
    paragraphs: [
      "Laws, regulations, tax rules and regulatory interpretations may change and may affect an investment, its underlying assets, the operator or an investor's position.",
      "Tax consequences may differ materially between investors and jurisdictions.",
      "TInformation provided by Tevuah Reserve is general information and should not be treated as personalized legal or tax advice. Investors should obtain independent professional advice where appropriate.",
    ],
  },

  {
    id: "information",
    number: "15",
    title:
      "Information and disclosure risk",
    icon: FileSearch,
    paragraphs: [
      "Private investments may involve less publicly available information than securities traded on established public markets. Information may also be provided periodically rather than continuously.",
      "Investors should review all material information made available for a specific opportunity and seek clarification where information is unclear or incomplete.",
      "Investors are responsible for determining whether they have sufficient information to make an informed investment decision.",
    ],
  },

  {
    id: "forward-looking",
    number: "16",
    title:
      "Forward-looking statements and assumptions",
    icon: BarChart3,
    paragraphs: [
      "Investment materials may contain projections, forecasts, estimates, targets, expected durations and other forward-looking statements.",
      "These statements depend on assumptions and circumstances that may change or may not occur as expected.",
      "Actual events and results may differ materially from projections because of operational, financial, market, environmental, regulatory and other factors.",
      "Forward-looking statements should not be interpreted as promises, guarantees or assurances of future performance.",
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
                Private investments involve significant risk. Investors may experience partial or complete loss of capital, limited liquidity, changes in valuation, operational disruptions and other risks that may materially affect investment performance.
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
                  You may lose some or all of the capital you invest.
                </p>
              </div>
            </RiskStaggerItem>

            <RiskStaggerItem>
              <div>
                <p className="text-sm font-semibold">
                  Limited liquidity
                </p>

                <p className="mt-1 text-xs leading-5 text-white/45">
                  Private investments may be difficult to sell or transfer when you want to exit.
                </p>
              </div>
            </RiskStaggerItem>

            <RiskStaggerItem>
              <div>
                <p className="text-sm font-semibold">
                  Returns are not guaranteed
                </p>

                <p className="mt-1 text-xs leading-5 text-white/45">
                  Target returns, projections and forecasts are not guarantees of future performance.
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
                  Do not invest unless you understand the investment and can bear the risk of loss.
                </h2>

                <p className="mt-6 max-w-4xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
                  Investments offered through Tevuah Reserve may involve private, specialist, illiquid and operational assets. Their value and performance may be affected by market conditions, operating performance, environmental events, regulatory changes and other circumstances beyond the control of Tevuah Reserve, the investor or the underlying operator.
                </p>

                <p className="mt-5 max-w-4xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
                  Before investing, investors should consider their financial circumstances, investment objectives, investment time horizon, liquidity needs and ability to withstand a loss of capital.
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
                  Understand the risks before committing capital.
                </h2>
              </div>
            </RiskReveal>

            <RiskReveal delay={0.08}>
              <div className="space-y-6 text-base leading-8 text-stone-700">
                <p>
                  This Risk Disclosure sets out material risks associated with investments offered through Tevuah Reserve. It is intended to help investors understand the nature of private-market investing and the risks that may affect an investment.
                </p>

                <p>
                 This disclosure does not cover every risk that may apply to an investment. Each opportunity has its own terms, structure, underlying assets, operators, jurisdictions, holding period and risk factors. Investors must review the information, agreements, disclosures and risk factors applicable to the specific opportunity before investing.
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
                   Every investment requires its own risk assessment.
                </h2>
              </div>

              <div className="space-y-5 text-sm leading-8 text-stone-700">
                <p>
                  The risks associated with an investment depend on its structure, underlying assets, operator, geography, financing arrangements, commercial terms and other circumstances.
                </p>

                <p>
                  Before investing, review the opportunity information, applicable agreements, supporting documents and opportunity-specific risk disclosures made available to you.
                </p>

                <p>
                  If material information, assumptions, investment mechanics or risks are unclear, seek clarification before committing capital.
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
                  Make an informed investment decision.
                </h2>

                <p className="mt-6 max-w-md text-sm leading-7 text-white/60">
                  An investment decision should take into account both the potential opportunity and the investor's ability to withstand the associated risks.
                </p>
              </div>
            </RiskReveal>

            <RiskStagger className="divide-y divide-white/10 border-y border-white/10">
              {[
                {
                  number: "01",
                  title:
                    "Review the available information",
                  description:
                    "Review the investment terms, documents, assumptions and risk disclosures applicable to the opportunity.",
                },
                {
                  number: "02",
                  title:
                    "Consider your financial position",
                  description:
                    "Consider whether you can withstand a partial or complete loss of your investment and whether the committed capital may be needed elsewhere during the expected holding period.",
                },
                {
                  number: "03",
                  title:
                    "Consider concentration",
                  description:
                    "Assess how the investment would affect your exposure to a particular asset, sector, geography or category of risk.",
                },
                {
                  number: "04",
                  title:
                    "Ask questions",
                  description:
                    "Seek clarification when material information, assumptions, investment mechanics or risks are not understood.",
                },
                {
                  number: "05",
                  title:
                    "Obtain professional advice where needed",
                  description:
                    "Obtain advice from appropriately qualified financial, legal, tax or other professional advisers where such advice is necessary for your circumstances.",
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
                  General information does not constitute personalised advice.
                </p>
                <p className="mt-5 text-sm leading-7 text-stone-700">
                  Information provided through Tevuah Reserve is general information about investments, investment processes, assets and related risks. It does not constitute personalised financial, legal, tax or accounting advice.
                </p>
                <p className="mt-5 text-sm leading-7 text-stone-700">
                  Investors are responsible for evaluating whether an investment is appropriate for their individual circumstances and for obtaining independent professional advice where appropriate.
                </p>
              </article>

              <article className="rounded-3xl border border-forest-900/10 p-7 sm:p-8">
                <ShieldAlert className="size-6 text-gold-600" />

                <h2 className="font-display mt-6 text-3xl font-medium tracking-[-0.03em] text-forest-950">
                  No guarantee
                </h2>

                <p className="mt-5 text-sm leading-7 text-stone-700">
                  Investment outcomes are not guaranteed.
                </p>
                <p className="mt-5 text-sm leading-7 text-stone-700">
                  Nothing presented through the Tevuah Reserve platform should be interpreted as a guarantee of investment performance, capital preservation, liquidity, distributions, valuation, timing or any particular investment outcome.
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
                Understand the investment and its risks.
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-stone-700">
                Investors should review the available information, understand the applicable terms and consider the possibility that actual results may differ materially from expectations.
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
                This disclosure provides general information about material investment risks and should be read together with the terms, documents and risk factors applicable to each specific investment opportunity. Each investor is responsible for reviewing the applicable information and determining whether an investment is appropriate for their circumstances.
              </p>
            </div>
          </RiskRevealSoft>
        </Container>
      </section>
    </main>
  );
}