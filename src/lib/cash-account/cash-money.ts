export function formatCashMoney(
  amountCents:
    | number
    | null
    | undefined,
  currency = "USD",
) {
  const cents =
    typeof amountCents ===
    "number"
      ? amountCents
      : 0;

  return new Intl.NumberFormat(
    "en-US",
    {
      style:
        "currency",
      currency,
      minimumFractionDigits:
        2,
      maximumFractionDigits:
        2,
    },
  ).format(
    cents / 100,
  );
}
