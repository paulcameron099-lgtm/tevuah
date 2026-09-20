"use client";

import {
  Bitcoin,
  CheckCircle2,
  CircleAlert,
  Landmark,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

type Props = {
  externalFundingId: string;
  paymentMethod: "wire_transfer" | "bitcoin";
  status: string;
  principalAmountCents: number;
  currency: string;
  reportedWireReference: string | null;
  reportedBitcoinTxHash: string | null;
  investorReportNote: string | null;
};

export function JointFundingAdminActions({
  externalFundingId,
  paymentMethod,
  status,
  principalAmountCents,
  currency,
  reportedWireReference,
  reportedBitcoinTxHash,
  investorReportNote,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState<
    "instructions" | "verify" | null
  >(null);
  const [verificationNote, setVerificationNote] = useState("");
  const [bankName, setBankName] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [iban, setIban] = useState("");
  const [bankAddress, setBankAddress] = useState("");
  const [wireInstructions, setWireInstructions] = useState("");
  const [bitcoinAmount, setBitcoinAmount] = useState("");
  const [bitcoinAddress, setBitcoinAddress] = useState("");
  const [bitcoinNetwork, setBitcoinNetwork] = useState("Bitcoin");
  const [bitcoinPaymentUrl, setBitcoinPaymentUrl] = useState("");
  const [bitcoinInstructions, setBitcoinInstructions] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isWire = paymentMethod === "wire_transfer";
  const isBitcoin = paymentMethod === "bitcoin";
  const canIssueInstructions = status === "instructions_requested";
  const canVerify = status === "pending_verification";
  const isVerified = status === "verified";
  const paymentEvidence = isWire
    ? reportedWireReference
    : reportedBitcoinTxHash;

  async function issueInstructions() {
    if (!canIssueInstructions || loading) return;

    let requestBody: Record<string, string | number | null>;

    if (isWire) {
      if (!bankName.trim()) {
        setError("Enter the receiving bank name.");
        return;
      }

      if (!beneficiaryName.trim()) {
        setError("Enter the beneficiary/account name.");
        return;
      }

      if (!accountNumber.trim()) {
        setError("Enter the receiving account number.");
        return;
      }

      requestBody = {
        bankName: bankName.trim(),
        beneficiaryName: beneficiaryName.trim(),
        accountNumber: accountNumber.trim(),
        routingNumber: routingNumber.trim() || null,
        swiftCode: swiftCode.trim() || null,
        iban: iban.trim() || null,
        bankAddress: bankAddress.trim() || null,
        wireInstructions: wireInstructions.trim() || null,
      };
    } else {
      const parsedAmount = Number(bitcoinAmount.trim());

      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        setError("Enter a valid Bitcoin amount greater than zero.");
        return;
      }
      if (!bitcoinAddress.trim()) {
        setError("Enter the public Bitcoin receiving address.");
        return;
      }
      if (!bitcoinNetwork.trim()) {
        setError("Enter the Bitcoin network.");
        return;
      }

      requestBody = {
        bitcoinAmount: parsedAmount,
        bitcoinAddress: bitcoinAddress.trim(),
        bitcoinNetwork: bitcoinNetwork.trim(),
        bitcoinPaymentUrl: bitcoinPaymentUrl.trim() || null,
        bitcoinInstructions: bitcoinInstructions.trim() || null,
      };
    }

    setError("");
    setSuccess("");
    setLoading("instructions");

    try {
      const response = await fetch(
        `/api/admin/investments/joint/funding/${externalFundingId}/issue-instructions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        },
      );

      const responseText = await response.text();
      let result: {
        error?: string;
        investorEmailSent?: boolean;
      } = {};

      if (responseText) {
        try {
          result = JSON.parse(responseText) as {
            error?: string;
            investorEmailSent?: boolean;
          };
        } catch {
          console.error(
            "Joint funding instruction API returned a non-JSON response:",
            {
              status: response.status,
              responseText,
            },
          );
        }
      }

      if (!response.ok) {
        setError(result.error ?? `Unable to issue payment instructions (${response.status}).`);
        return;
      }

      setSuccess(
        result.investorEmailSent === false
          ? "Payment instructions were issued. Email delivery should be checked."
          : `${isBitcoin ? "Bitcoin" : "Wire Transfer"} instructions issued successfully.`,
      );
      router.refresh();
    } catch (requestError) {
      console.error("Joint funding instruction issuance error:", requestError);
      setError("Unable to issue payment instructions.");
    } finally {
      setLoading(null);
    }
  }

  async function verifyPayment() {
    if (!canVerify || loading) return;

    if (!paymentEvidence) {
      setError(
        isWire
          ? "A reported Wire Transfer reference is required before verification."
          : "A reported Bitcoin transaction hash is required before verification.",
      );
      return;
    }

    setError("");
    setSuccess("");
    setLoading("verify");

    try {
      const response = await fetch(
        `/api/admin/investments/joint/funding/${externalFundingId}/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            verificationNote: verificationNote.trim() || null,
          }),
        },
      );

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Unable to verify payment.");
        return;
      }

      setSuccess(
        "Payment verified successfully. This member's funding obligation is now funded.",
      );
      setVerificationNote("");
      router.refresh();
    } catch (requestError) {
      console.error("Joint funding verification error:", requestError);
      setError("Unable to verify payment.");
    } finally {
      setLoading(null);
    }
  }

  if (isVerified) {
    return (
      <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" />
          <div>
            <p className="text-sm font-semibold text-emerald-950">
              Payment verified
            </p>
            <p className="mt-1 text-xs leading-6 text-emerald-800">
              This member&apos;s principal funding obligation has been
              verified and marked funded.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (canIssueInstructions && isWire) {
    return (
      <div className="mt-6 rounded-2xl border border-gold-500/30 bg-gold-50/50 p-5">
        <div className="flex items-start gap-3">
          <Landmark className="mt-0.5 size-5 shrink-0 text-gold-700" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-700">
              Admin action required
            </p>
            <h4 className="font-display mt-2 text-xl font-semibold text-forest-950">
              Issue Wire Transfer instructions
            </h4>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Enter the receiving bank details for {formatMoney(principalAmountCents, currency)} principal.
              The fixed Wire charge remains separate from investment principal.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Bank name" required>
                <TextInput value={bankName} onChange={setBankName} placeholder="Receiving bank" maxLength={255} />
              </Field>
              <Field label="Beneficiary / account name" required>
                <TextInput value={beneficiaryName} onChange={setBeneficiaryName} placeholder="Beneficiary name" maxLength={255} />
              </Field>
            </div>

            <Field label="Account number" required>
              <TextInput value={accountNumber} onChange={setAccountNumber} placeholder="Account number" maxLength={255} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Routing number" optional>
                <TextInput value={routingNumber} onChange={setRoutingNumber} placeholder="ABA / routing number" maxLength={100} />
              </Field>
              <Field label="SWIFT / BIC" optional>
                <TextInput value={swiftCode} onChange={setSwiftCode} placeholder="SWIFT / BIC" maxLength={100} />
              </Field>
            </div>

            <Field label="IBAN" optional>
              <TextInput value={iban} onChange={setIban} placeholder="IBAN" maxLength={100} />
            </Field>

            <Field label="Bank address" optional>
              <textarea rows={3} maxLength={1000} value={bankAddress} onChange={(e) => setBankAddress(e.target.value)} placeholder="Receiving bank address" className="focus-ring mt-2 w-full resize-none rounded-xl border border-forest-900/10 bg-white px-4 py-3 text-sm text-forest-950 outline-none placeholder:text-stone-400" />
            </Field>

            <Field label="Investor instructions" optional>
              <textarea rows={4} maxLength={4000} value={wireInstructions} onChange={(e) => setWireInstructions(e.target.value)} placeholder="Optional. Leave blank to use the canonical default Wire instructions." className="focus-ring mt-2 w-full resize-none rounded-xl border border-forest-900/10 bg-white px-4 py-3 text-sm text-forest-950 outline-none placeholder:text-stone-400" />
            </Field>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2">
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-700" />
                <p className="text-xs leading-5 text-amber-800">
                  Confirm the destination details independently before issuance.
                  The Tevuah Reserve payment reference is generated automatically.
                </p>
              </div>
            </div>

            <Feedback error={error} success={success} />
            <ActionButton
              loading={loading === "instructions"}
              disabled={loading !== null || !bankName.trim() || !beneficiaryName.trim() || !accountNumber.trim()}
              onClick={issueInstructions}
              icon={<Landmark className="size-4" />}
              label="Issue Wire instructions"
            />
          </div>
        </div>
      </div>
    );
  }

  if (canIssueInstructions && isBitcoin) {
    return (
      <div className="mt-6 rounded-2xl border border-gold-500/30 bg-gold-50/50 p-5">
        <div className="flex items-start gap-3">
          <Bitcoin className="mt-0.5 size-5 shrink-0 text-gold-700" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-700">
              Admin action required
            </p>
            <h4 className="font-display mt-2 text-xl font-semibold text-forest-950">
              Issue Bitcoin instructions
            </h4>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Enter the exact BTC amount, public receiving address and
              network. Never enter a private key, seed phrase or recovery phrase.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Exact BTC amount" required>
                <input
                  type="text"
                  inputMode="decimal"
                  value={bitcoinAmount}
                  onChange={(e) => setBitcoinAmount(e.target.value)}
                  placeholder="0.00000000"
                  className="focus-ring mt-2 w-full rounded-xl border border-forest-900/10 bg-white px-4 py-3 text-sm text-forest-950 outline-none placeholder:text-stone-400"
                />
              </Field>

              <Field label="Bitcoin network" required>
                <input
                  type="text"
                  maxLength={100}
                  value={bitcoinNetwork}
                  onChange={(e) => setBitcoinNetwork(e.target.value)}
                  placeholder="Bitcoin"
                  className="focus-ring mt-2 w-full rounded-xl border border-forest-900/10 bg-white px-4 py-3 text-sm text-forest-950 outline-none placeholder:text-stone-400"
                />
              </Field>
            </div>

            <Field label="Public receiving address" required>
              <input
                type="text"
                maxLength={255}
                value={bitcoinAddress}
                onChange={(e) => setBitcoinAddress(e.target.value)}
                placeholder="Bitcoin receiving address"
                className="focus-ring mt-2 w-full rounded-xl border border-forest-900/10 bg-white px-4 py-3 font-mono text-sm text-forest-950 outline-none placeholder:font-sans placeholder:text-stone-400"
              />
            </Field>

            <Field label="Payment URL" optional>
              <input
                type="url"
                maxLength={2000}
                value={bitcoinPaymentUrl}
                onChange={(e) => setBitcoinPaymentUrl(e.target.value)}
                placeholder="https://..."
                className="focus-ring mt-2 w-full rounded-xl border border-forest-900/10 bg-white px-4 py-3 text-sm text-forest-950 outline-none placeholder:text-stone-400"
              />
            </Field>

            <Field label="Investor instructions" optional>
              <textarea
                rows={4}
                maxLength={4000}
                value={bitcoinInstructions}
                onChange={(e) => setBitcoinInstructions(e.target.value)}
                placeholder="Optional. Leave blank to use the canonical default."
                className="focus-ring mt-2 w-full resize-none rounded-xl border border-forest-900/10 bg-white px-4 py-3 text-sm text-forest-950 outline-none placeholder:text-stone-400"
              />
            </Field>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2">
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-700" />
                <p className="text-xs leading-5 text-amber-800">
                  Confirm amount, address and network independently before
                  issuance. Bitcoin has no Wire charge; USD principal remains
                  the canonical investment obligation.
                </p>
              </div>
            </div>

            <Feedback error={error} success={success} />
            <ActionButton
              loading={loading === "instructions"}
              disabled={
                loading !== null ||
                !bitcoinAmount.trim() ||
                !bitcoinAddress.trim() ||
                !bitcoinNetwork.trim()
              }
              onClick={issueInstructions}
              icon={<Bitcoin className="size-4" />}
              label="Issue Bitcoin instructions"
            />
          </div>
        </div>
      </div>
    );
  }

  if (canVerify) {
    return (
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-amber-700" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
              Verification required
            </p>
            <h4 className="font-display mt-2 text-xl font-semibold text-forest-950">
              Review reported {isWire ? "Wire Transfer" : "Bitcoin"} payment
            </h4>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Independently confirm receipt before verifying this
              member&apos;s principal obligation.
            </p>

            <div className="mt-5 rounded-xl border border-amber-200 bg-white p-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
                {isWire
                  ? "Reported Wire reference"
                  : "Reported Bitcoin transaction hash"}
              </p>
              <p className="mt-2 break-all text-sm font-semibold text-forest-950">
                {paymentEvidence || "No payment evidence supplied"}
              </p>
            </div>

            {investorReportNote ? (
              <div className="mt-4 rounded-xl border border-forest-900/10 bg-white p-4">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
                  Investor note
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-600">
                  {investorReportNote}
                </p>
              </div>
            ) : null}

            <Field label="Verification note" optional>
              <textarea
                rows={3}
                maxLength={2000}
                value={verificationNote}
                onChange={(e) => setVerificationNote(e.target.value)}
                placeholder="Internal verification note..."
                className="focus-ring mt-2 w-full resize-none rounded-xl border border-forest-900/10 bg-white px-4 py-3 text-sm text-forest-950 outline-none placeholder:text-stone-400"
              />
            </Field>

            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-2">
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-700" />
                <p className="text-xs leading-5 text-red-800">
                  Verify only after independently confirming receipt.
                  Verification credits only{" "}
                  {formatMoney(principalAmountCents, currency)} principal.
                  Wire charges never count as investment principal.
                </p>
              </div>
            </div>

            <Feedback error={error} success={success} />
            <ActionButton
              loading={loading === "verify"}
              disabled={loading !== null || !paymentEvidence}
              onClick={verifyPayment}
              icon={<ShieldCheck className="size-4" />}
              label={`Verify ${formatMoney(principalAmountCents, currency)}`}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function TextInput({
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
}) {
  return (
    <input
      type="text"
      maxLength={maxLength}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="focus-ring mt-2 w-full rounded-xl border border-forest-900/10 bg-white px-4 py-3 text-sm text-forest-950 outline-none placeholder:text-stone-400"
    />
  );
}

function Field({
  label,
  required = false,
  optional = false,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="mt-4 block">
      <span className="text-xs font-semibold text-forest-950">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
        {optional ? (
          <span className="ml-1 font-normal text-stone-400">Optional</span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

function ActionButton({
  loading,
  disabled,
  onClick,
  icon,
  label,
}: {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="focus-ring mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </button>
  );
}

function Feedback({
  error,
  success,
}: {
  error: string;
  success: string;
}) {
  if (!error && !success) return null;

  return (
    <div
      className={`mt-5 rounded-xl border p-4 text-xs leading-5 ${
        error
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {error || success}
    </div>
  );
}

function formatMoney(
  cents: number,
  currency = "USD",
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
