export type InvestmentCategorySlug =
  | "vineyard"
  | "olive"
  | "agtech"
  | "fine-wine";

export type InvestmentCategory = {
  id: InvestmentCategorySlug;
  title: string;
  eyebrow: string;
  description: string;
  href: string;
  image: string;
  highlights: string[];
};

export type OpportunityStatus =
  | "coming-soon"
  | "open"
  | "closing-soon"
  | "fully-funded";

export type RiskLevel = "Lower" | "Moderate" | "Elevated";

export type Opportunity = {
  id: string;
  slug: string;
  title: string;
  location: string;
  category: InvestmentCategorySlug;
  categoryLabel: string;
  summary: string;
  currency: "EUR" | "USD" | "GBP";
  fundingTarget: number;
  fundedAmount: number;
  minimumInvestment: number;
  duration: string;
  riskLevel: RiskLevel;
  status: OpportunityStatus;
  image: string;
  featured: boolean;
};