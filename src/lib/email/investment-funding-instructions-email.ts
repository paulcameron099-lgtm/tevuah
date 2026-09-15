import "server-only";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

type Args = {
  investorName: string;
  opportunityTitle: string;
  commitmentAmountCents: number;
  currency: string;
  paymentMethod: "wire_transfer" | "bitcoin";
  bankName?: string | null;
  beneficiaryName?: string | null;
  accountNumber?: string | null;
  routingNumber?: string | null;
  swiftCode?: string | null;
  iban?: string | null;
  bankAddress?: string | null;
  paymentReference?: string | null;
  bitcoinAmount?: string | number | null;
  bitcoinAddress?: string | null;
  bitcoinPaymentUrl?: string | null;
  bitcoinNetwork?: string | null;
  instructions?: string | null;
  fundingUrl: string;
};

export function investorFundingInstructionsEmail(args: Args) {
  const title = escapeHtml(args.opportunityTitle);
  const name = escapeHtml(args.investorName);
  const commitment = money(args.commitmentAmountCents, args.currency);

  const wireChargeCents =
    Math.round(args.commitmentAmountCents * 0.2);
  const totalWireCents =
    args.commitmentAmountCents + wireChargeCents;

  const details =
    args.paymentMethod === "wire_transfer"
      ? `
        <p><strong>Investment commitment:</strong> ${commitment}</p>
        <p><strong>Fixed wire transfer charge (20%):</strong> ${money(wireChargeCents, args.currency)}</p>
        <p><strong>Total amount to wire:</strong> ${money(totalWireCents, args.currency)}</p>
        <hr />
        <p><strong>Bank:</strong> ${escapeHtml(args.bankName ?? "—")}</p>
        <p><strong>Beneficiary:</strong> ${escapeHtml(args.beneficiaryName ?? "—")}</p>
        <p><strong>Account number:</strong> ${escapeHtml(args.accountNumber ?? "—")}</p>
        <p><strong>Routing number:</strong> ${escapeHtml(args.routingNumber ?? "—")}</p>
        <p><strong>SWIFT:</strong> ${escapeHtml(args.swiftCode ?? "—")}</p>
        <p><strong>IBAN:</strong> ${escapeHtml(args.iban ?? "—")}</p>
        <p><strong>Bank address:</strong> ${escapeHtml(args.bankAddress ?? "—")}</p>
        <p><strong>Payment reference:</strong> ${escapeHtml(args.paymentReference ?? "—")}</p>
      `
      : `
        <p><strong>Investment commitment:</strong> ${commitment}</p>
        <p><strong>Exact BTC amount:</strong> ${escapeHtml(String(args.bitcoinAmount ?? "—"))}</p>
        <p><strong>Network:</strong> ${escapeHtml(args.bitcoinNetwork ?? "Bitcoin")}</p>
        <p><strong>Receiving address:</strong> ${escapeHtml(args.bitcoinAddress ?? "—")}</p>
        ${
          args.bitcoinPaymentUrl
            ? `<p><strong>Payment link:</strong> <a href="${escapeHtml(args.bitcoinPaymentUrl)}">${escapeHtml(args.bitcoinPaymentUrl)}</a></p>`
            : ""
        }
      `;

  const extra = args.instructions
    ? `<p><strong>Additional instructions:</strong><br />${escapeHtml(args.instructions).replaceAll("\n", "<br />")}</p>`
    : "";

  return {
    subject: `Funding instructions — ${args.opportunityTitle}`,
    text:
      args.paymentMethod === "wire_transfer"
        ? `Hello ${args.investorName}, your funding instructions for ${args.opportunityTitle} are ready. Investment commitment: ${commitment}. Fixed wire transfer charge (20%): ${money(wireChargeCents, args.currency)}. Total amount to wire: ${money(totalWireCents, args.currency)}. Review the authenticated Tevuah Reserve dashboard for the complete instructions: ${args.fundingUrl}`
        : `Hello ${args.investorName}, your Bitcoin funding instructions for ${args.opportunityTitle} are ready. Review the authenticated Tevuah Reserve dashboard for the complete instructions: ${args.fundingUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#17372d;line-height:1.65">
        <h2>Funding instructions are ready</h2>
        <p>Hello ${name},</p>
        <p>Your payment instructions for <strong>${title}</strong> are now available.</p>
        ${details}
        ${extra}
        <p style="margin-top:28px">
          <a href="${escapeHtml(args.fundingUrl)}" style="display:inline-block;background:#17372d;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700">
            Review funding instructions
          </a>
        </p>
        <p style="font-size:12px;color:#6b7280;margin-top:24px">
          For security, confirm all payment details inside your authenticated Tevuah Reserve dashboard before sending funds.
          Never provide a Bitcoin private key, seed phrase, recovery phrase, or signing key.
        </p>
      </div>
    `,
  };
}
