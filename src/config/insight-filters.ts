import type { InsightCategory } from "@/src/types/insight";

export type InsightCategoryFilter =
  | "All"
  | InsightCategory;

export const insightCategoryOptions: InsightCategoryFilter[] = [
  "All",
  "Vineyards",
  "Olive Estates",
  "AgTech",
  "Fine Wine",
  "Investor Education",
];