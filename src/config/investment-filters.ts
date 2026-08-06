import type {
  InvestmentCategorySlug,
  OpportunityStatus,
  RiskLevel,
} from "@/src/types/investment";

export type CategoryFilterValue =
  | "all"
  | InvestmentCategorySlug;

export type StatusFilterValue =
  | "all"
  | OpportunityStatus;

export type RiskFilterValue =
  | "all"
  | RiskLevel;

export type MinimumFilterValue =
  | "all"
  | "5000"
  | "7500"
  | "10000"
  | "15000"
  | "20000";

export type SortValue =
  | "newest"
  | "funding-high"
  | "funding-low"
  | "minimum-low"
  | "minimum-high"
  | "duration-short";

export const categoryOptions: Array<{
  label: string;
  value: CategoryFilterValue;
}> = [
  {
    label: "All assets",
    value: "all",
  },
  {
    label: "Vineyard Estates",
    value: "vineyard",
  },
  {
    label: "Olive Estates",
    value: "olive",
  },
  {
    label: "AgTech",
    value: "agtech",
  },
  {
    label: "Fine Wine",
    value: "fine-wine",
  },
];

export const statusOptions: Array<{
  label: string;
  value: StatusFilterValue;
}> = [
  {
    label: "All statuses",
    value: "all",
  },
  {
    label: "Open",
    value: "open",
  },
  {
    label: "Closing soon",
    value: "closing-soon",
  },
  {
    label: "Coming soon",
    value: "coming-soon",
  },
  {
    label: "Fully funded",
    value: "fully-funded",
  },
];

export const riskOptions: Array<{
  label: string;
  value: RiskFilterValue;
}> = [
  {
    label: "All risk levels",
    value: "all",
  },
  {
    label: "Lower",
    value: "Lower",
  },
  {
    label: "Moderate",
    value: "Moderate",
  },
  {
    label: "Elevated",
    value: "Elevated",
  },
];

export const minimumOptions: Array<{
  label: string;
  value: MinimumFilterValue;
}> = [
  {
    label: "Any minimum",
    value: "all",
  },
  {
    label: "Up to €5,000",
    value: "5000",
  },
  {
    label: "Up to €7,500",
    value: "7500",
  },
  {
    label: "Up to €10,000",
    value: "10000",
  },
  {
    label: "Up to €15,000",
    value: "15000",
  },
  {
    label: "Up to €20,000",
    value: "20000",
  },
];

export const sortOptions: Array<{
  label: string;
  value: SortValue;
}> = [
  {
    label: "Newest",
    value: "newest",
  },
  {
    label: "Funding: highest",
    value: "funding-high",
  },
  {
    label: "Funding: lowest",
    value: "funding-low",
  },
  {
    label: "Minimum: lowest",
    value: "minimum-low",
  },
  {
    label: "Minimum: highest",
    value: "minimum-high",
  },
  {
    label: "Shortest duration",
    value: "duration-short",
  },
];