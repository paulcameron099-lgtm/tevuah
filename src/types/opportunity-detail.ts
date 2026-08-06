import type { LucideIcon } from "lucide-react";

export type OpportunityMetric = {
  label: string;
  value: string;
  description?: string;
};

export type UseOfFundsItem = {
  label: string;
  percentage: number;
  amount: number;
};

export type FinancialAssumption = {
  label: string;
  value: string;
  note: string;
};

export type ProjectMilestone = {
  id: string;
  date: string;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming";
};

export type OpportunityRisk = {
  id: string;
  title: string;
  description: string;
  severity: "Lower" | "Moderate" | "Elevated";
};

export type OpportunityDocument = {
  id: string;
  title: string;
  category: string;
  format: "PDF";
  size: string;
  status: "Available" | "Preview only" | "Coming soon";
};

export type OpportunityFaq = {
  question: string;
  answer: string;
};

export type OperatorDetail = {
  name: string;
  role: string;
  location: string;
  description: string;
  experience: string;
  estatesManaged: string;
  image: string;
};

export type OpportunityUpdate = {
  id: string;
  date: string;
  title: string;
  description: string;
};

export type OpportunityHighlight = {
  label: string;
  value: string;
  icon: LucideIcon;
};

export type OpportunityDetail = {
  slug: string;
  thesis: string[];
  assetDescription: string;
  metrics: OpportunityMetric[];
  useOfFunds: UseOfFundsItem[];
  financialAssumptions: FinancialAssumption[];
  fees: FinancialAssumption[];
  timeline: ProjectMilestone[];
  risks: OpportunityRisk[];
  documents: OpportunityDocument[];
  faqs: OpportunityFaq[];
  operator: OperatorDetail;
  updates: OpportunityUpdate[];
};