function firstConfigured(...values: Array<string | undefined>) {
  for (const value of values) {
    const cleaned = value?.trim();
    if (cleaned) return cleaned;
  }
  return null;
}

export function getInvestmentNotificationRecipient() {
  return firstConfigured(
    process.env.INVESTMENT_NOTIFICATION_EMAIL,
    process.env.COMPLIANCE_EMAIL,
    process.env.COMPLIANCE_NOTIFICATION_EMAIL,
    process.env.SMTP_USER,
  );
}

export function getPaymentNotificationRecipient() {
  return firstConfigured(
    process.env.PAYMENTS_NOTIFICATION_EMAIL,
    process.env.INVESTMENT_NOTIFICATION_EMAIL,
    process.env.COMPLIANCE_EMAIL,
    process.env.COMPLIANCE_NOTIFICATION_EMAIL,
    process.env.SMTP_USER,
  );
}
