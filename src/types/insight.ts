export type InsightCategory =
  | "Vineyards"
  | "Olive Estates"
  | "AgTech"
  | "Fine Wine"
  | "Investor Education";

export type InsightSection = {
  heading?: string;
  paragraphs: string[];
};

export type InsightArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: InsightCategory;
  publishedAt: string;
  readingTime: string;
  image: string;
  featured: boolean;

  author: string;
  authorRole: string;

  introduction: string;
  sections: InsightSection[];

  keyTakeaways: string[];
};