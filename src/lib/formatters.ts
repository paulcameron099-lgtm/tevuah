export function formatCurrency(
  amount: number,
  currency: "EUR" | "USD" | "GBP",
  compact = false,
) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateFundingPercentage(
  fundedAmount: number,
  fundingTarget: number,
) {
  if (fundingTarget <= 0) {
    return 0;
  }

  const percentage = (fundedAmount / fundingTarget) * 100;

  return Math.min(Math.max(Math.round(percentage), 0), 100);
}

export function formatArticleDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}