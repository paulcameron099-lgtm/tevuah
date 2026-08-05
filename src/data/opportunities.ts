import type { Opportunity } from "@/src/types/investment";

export const featuredOpportunities: Opportunity[] = [
  {
    id: "opp_demo_tuscany_01",
    slug: "val-dorcia-vineyard-estate",
    title: "Val d’Orcia Vineyard Estate",
    location: "Tuscany, Italy",
    category: "vineyard",
    categoryLabel: "Vineyard Estate",
    summary:
      "An illustrative vineyard opportunity focused on productive land, estate development and specialist agricultural operations.",
    currency: "EUR",
    fundingTarget: 3_500_000,
    fundedAmount: 2_380_000,
    minimumInvestment: 10_000,
    duration: "7–10 years",
    riskLevel: "Moderate",
    status: "open",
    image: "/images/opportunities/val-dorcia-vineyard.jpg",
    featured: true,
  },
  {
    id: "opp_demo_andalusia_01",
    slug: "andalusia-heritage-olive-estate",
    title: "Andalusia Heritage Olive Estate",
    location: "Andalusia, Spain",
    category: "olive",
    categoryLabel: "Olive Estate",
    summary:
      "An illustrative estate project centred on grove improvement, irrigation efficiency and premium olive production.",
    currency: "EUR",
    fundingTarget: 2_400_000,
    fundedAmount: 1_080_000,
    minimumInvestment: 7_500,
    duration: "6–9 years",
    riskLevel: "Moderate",
    status: "open",
    image: "/images/opportunities/andalusia-olive-estate.jpg",
    featured: true,
  },
  {
    id: "opp_demo_agtech_01",
    slug: "precision-irrigation-network",
    title: "Precision Irrigation Network",
    location: "Southern Europe",
    category: "agtech",
    categoryLabel: "AgTech Infrastructure",
    summary:
      "An illustrative infrastructure project involving sensor-supported irrigation and agricultural resource management.",
    currency: "EUR",
    fundingTarget: 1_800_000,
    fundedAmount: 1_476_000,
    minimumInvestment: 5_000,
    duration: "4–6 years",
    riskLevel: "Elevated",
    status: "closing-soon",
    image: "/images/opportunities/precision-irrigation-network.jpg",
    featured: true,
  },
];

export function getOpportunityBySlug(slug: string) {
  return featuredOpportunities.find(
    (opportunity) => opportunity.slug === slug,
  );
}