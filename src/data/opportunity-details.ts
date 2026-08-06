import type { OpportunityDetail } from "@/src/types/opportunity-detail";
import type { Opportunity } from "@/src/types/investment";

const sharedDocuments = [
  {
    id: "document-overview",
    title: "Opportunity overview",
    category: "Investment",
    format: "PDF" as const,
    size: "2.4 MB",
    status: "Preview only" as const,
  },
  {
    id: "document-risk",
    title: "Illustrative risk summary",
    category: "Risk",
    format: "PDF" as const,
    size: "1.1 MB",
    status: "Preview only" as const,
  },
  {
    id: "document-financial",
    title: "Illustrative financial model",
    category: "Financial",
    format: "PDF" as const,
    size: "3.8 MB",
    status: "Coming soon" as const,
  },
];

const sharedFaqs = [
  {
    question: "Is this a live investment opportunity?",
    answer:
      "No. The opportunity, figures, documents and project information shown on this page are demonstration content for the Tevuah Reserve platform.",
  },
  {
    question: "Does registration commit me to invest?",
    answer:
      "No. Registering interest or creating an account does not create an investment commitment or guarantee access to a future offering.",
  },
  {
    question: "Are the projected figures guaranteed?",
    answer:
      "No. Financial assumptions and projections are uncertain and must never be presented as guaranteed outcomes.",
  },
  {
    question: "Will identity verification be required?",
    answer:
      "A genuine investment workflow may require identity, eligibility, suitability and source-of-funds verification before participation.",
  },
];

export const opportunityDetails: Record<string, OpportunityDetail> = {
  "val-dorcia-vineyard-estate": {
    slug: "val-dorcia-vineyard-estate",
    thesis: [
      "Exposure to productive vineyard land in an established agricultural region.",
      "A long-term estate-development strategy combining vines, infrastructure and professional operations.",
      "Technology-supported monitoring intended to improve visibility into estate activity.",
    ],
    assetDescription:
      "The illustrative project represents a vineyard estate strategy involving productive land, vineyard infrastructure, estate improvements and specialist agricultural management.",
    metrics: [
      {
        label: "Estate area",
        value: "86 hectares",
        description: "Illustrative total estate area",
      },
      {
        label: "Productive vines",
        value: "54 hectares",
        description: "Illustrative planted vineyard area",
      },
      {
        label: "Primary crop",
        value: "Wine grapes",
      },
      {
        label: "Development stage",
        value: "Operating estate",
      },
    ],
    useOfFunds: [
      {
        label: "Estate acquisition",
        percentage: 46,
        amount: 1_610_000,
      },
      {
        label: "Vineyard improvement",
        percentage: 24,
        amount: 840_000,
      },
      {
        label: "Irrigation and infrastructure",
        percentage: 14,
        amount: 490_000,
      },
      {
        label: "Working capital",
        percentage: 10,
        amount: 350_000,
      },
      {
        label: "Professional and transaction costs",
        percentage: 6,
        amount: 210_000,
      },
    ],
    financialAssumptions: [
      {
        label: "Illustrative holding period",
        value: "7–10 years",
        note: "Actual duration could be shorter or longer.",
      },
      {
        label: "Revenue sources",
        value: "Grape sales and estate operations",
        note: "Revenue depends on production, pricing and operator performance.",
      },
      {
        label: "Valuation approach",
        value: "Asset and operating review",
        note: "Any genuine valuation would require qualified independent input.",
      },
      {
        label: "Distribution frequency",
        value: "Not yet determined",
        note: "Distributions would depend on available cash and legal terms.",
      },
    ],
    fees: [
      {
        label: "Platform arrangement fee",
        value: "Illustrative 2.0%",
        note: "Charged once on committed capital in this demonstration.",
      },
      {
        label: "Annual administration",
        value: "Illustrative 1.0%",
        note: "Potentially charged for reporting and administration.",
      },
      {
        label: "Performance participation",
        value: "Not determined",
        note: "Any performance fee must be clearly defined before launch.",
      },
    ],
    timeline: [
      {
        id: "timeline-01",
        date: "Q3 2026",
        title: "Opportunity preparation",
        description:
          "Illustrative legal, operating and financial review completed.",
        status: "completed",
      },
      {
        id: "timeline-02",
        date: "Q4 2026",
        title: "Funding period",
        description:
          "Investor commitments collected subject to eligibility and documentation.",
        status: "current",
      },
      {
        id: "timeline-03",
        date: "Q1 2027",
        title: "Estate programme begins",
        description:
          "Initial vineyard, irrigation and estate-improvement programme starts.",
        status: "upcoming",
      },
      {
        id: "timeline-04",
        date: "2027–2029",
        title: "Operational development",
        description:
          "Estate improvements, production monitoring and periodic reporting.",
        status: "upcoming",
      },
      {
        id: "timeline-05",
        date: "2033 onward",
        title: "Potential liquidity review",
        description:
          "Possible refinancing, sale or continuation subject to conditions.",
        status: "upcoming",
      },
    ],
    risks: [
      {
        id: "risk-weather",
        title: "Weather and climate risk",
        description:
          "Drought, frost, excessive rain, heat or other conditions may reduce yield or damage vines.",
        severity: "Elevated",
      },
      {
        id: "risk-market",
        title: "Agricultural pricing risk",
        description:
          "Grape and wine-market prices can fluctuate and may affect estate revenue.",
        severity: "Moderate",
      },
      {
        id: "risk-operator",
        title: "Operator dependency",
        description:
          "Performance depends materially on the experience and execution of the estate operator.",
        severity: "Moderate",
      },
      {
        id: "risk-liquidity",
        title: "Limited liquidity",
        description:
          "Private agricultural investments may be difficult to sell before the end of the holding period.",
        severity: "Elevated",
      },
    ],
    documents: sharedDocuments,
    faqs: sharedFaqs,
    operator: {
      name: "Valterra Estate Operations",
      role: "Illustrative estate operator",
      location: "Tuscany, Italy",
      description:
        "A demonstration operator profile representing a specialist team responsible for vineyard management, estate maintenance and agricultural reporting.",
      experience: "18 years",
      estatesManaged: "7 estates",
      image: "/images/operators/vineyard-operator.jpg",
    },
    updates: [
      {
        id: "update-01",
        date: "2026-07-26",
        title: "Illustrative estate review completed",
        description:
          "The demonstration commercial and operating review has been added to the opportunity data room.",
      },
      {
        id: "update-02",
        date: "2026-07-12",
        title: "Irrigation plan prepared",
        description:
          "A preliminary illustration of the proposed irrigation-improvement programme has been completed.",
      },
    ],
  },
};

export function createGenericOpportunityDetail(
  opportunity: Opportunity,
): OpportunityDetail {
  return {
    slug: opportunity.slug,
    thesis: [
      `Exposure to the ${opportunity.categoryLabel.toLowerCase()} asset category.`,
      "A structured project approach supported by opportunity documentation and periodic reporting.",
      "A long-term investment perspective with material operating and liquidity risks.",
    ],
    assetDescription:
      opportunity.summary,
    metrics: [
      {
        label: "Asset category",
        value: opportunity.categoryLabel,
      },
      {
        label: "Location",
        value: opportunity.location,
      },
      {
        label: "Indicative duration",
        value: opportunity.duration,
      },
      {
        label: "Risk classification",
        value: opportunity.riskLevel,
      },
    ],
    useOfFunds: [
      {
        label: "Asset and project costs",
        percentage: 60,
        amount: opportunity.fundingTarget * 0.6,
      },
      {
        label: "Infrastructure and operations",
        percentage: 20,
        amount: opportunity.fundingTarget * 0.2,
      },
      {
        label: "Working capital",
        percentage: 12,
        amount: opportunity.fundingTarget * 0.12,
      },
      {
        label: "Professional and transaction costs",
        percentage: 8,
        amount: opportunity.fundingTarget * 0.08,
      },
    ],
    financialAssumptions: [
      {
        label: "Illustrative holding period",
        value: opportunity.duration,
        note: "Actual duration may differ materially.",
      },
      {
        label: "Funding target",
        value: new Intl.NumberFormat("en", {
          style: "currency",
          currency: opportunity.currency,
          maximumFractionDigits: 0,
        }).format(opportunity.fundingTarget),
        note: "Demonstration funding value.",
      },
      {
        label: "Revenue model",
        value: "Asset-dependent",
        note: "The genuine model would be described in offering documents.",
      },
      {
        label: "Distribution policy",
        value: "Not yet determined",
        note: "No distributions should be assumed.",
      },
    ],
    fees: [
      {
        label: "Arrangement fee",
        value: "To be confirmed",
        note: "Any fee must be clearly disclosed before commitment.",
      },
      {
        label: "Annual administration",
        value: "To be confirmed",
        note: "May include platform and reporting costs.",
      },
      {
        label: "Performance participation",
        value: "To be confirmed",
        note: "No performance fee has been finalised.",
      },
    ],
    timeline: [
      {
        id: "generic-01",
        date: "Preparation",
        title: "Opportunity review",
        description:
          "Legal, financial, operational and risk information prepared.",
        status: "completed",
      },
      {
        id: "generic-02",
        date: "Current",
        title: "Illustrative funding phase",
        description:
          "Demonstration investor-interest and funding process.",
        status: "current",
      },
      {
        id: "generic-03",
        date: "Next stage",
        title: "Project implementation",
        description:
          "Capital deployment and operating programme begin.",
        status: "upcoming",
      },
      {
        id: "generic-04",
        date: opportunity.duration,
        title: "Long-term monitoring",
        description:
          "Operating updates, valuation reviews and potential liquidity assessment.",
        status: "upcoming",
      },
    ],
    risks: [
      {
        id: "generic-market",
        title: "Market risk",
        description:
          "The value and commercial performance of the asset may rise or fall.",
        severity: "Moderate",
      },
      {
        id: "generic-operating",
        title: "Operating risk",
        description:
          "The project may experience delays, increased costs or weaker-than-expected performance.",
        severity: "Elevated",
      },
      {
        id: "generic-liquidity",
        title: "Liquidity risk",
        description:
          "The investment may not be transferable or sellable when an investor wishes to exit.",
        severity: "Elevated",
      },
      {
        id: "generic-capital",
        title: "Capital-loss risk",
        description:
          "Investors could lose some or all of their invested capital.",
        severity: "Elevated",
      },
    ],
    documents: sharedDocuments,
    faqs: sharedFaqs,
    operator: {
      name: "Specialist operating partner",
      role: "Illustrative project operator",
      location: opportunity.location,
      description:
        "A demonstration operator profile. Genuine operator identity, experience and responsibilities would require verification.",
      experience: "To be verified",
      estatesManaged: "To be verified",
      image: "/images/operators/vineyard-operator.jpg",
    },
    updates: [
      {
        id: "generic-update-01",
        date: opportunity.publishedAt,
        title: "Opportunity added to the marketplace",
        description:
          "This illustrative opportunity was published as part of the Tevuah Reserve platform demonstration.",
      },
    ],
  };
}

export function getOpportunityDetail(
  opportunity: Opportunity,
): OpportunityDetail {
  return (
    opportunityDetails[opportunity.slug] ??
    createGenericOpportunityDetail(opportunity)
  );
}