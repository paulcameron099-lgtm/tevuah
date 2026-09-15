"use client";

import {
  Bitcoin,
  CircleCheck,
  Landmark,
  Loader2,
} from "lucide-react";
import {
  useRouter,
} from "next/navigation";
import {
  useState,
} from "react";

type Instruction = {
  id: string;
  payment_method:
    | "wire_transfer"
    | "bitcoin";

  bank_name?: string | null;
  beneficiary_name?: string | null;
  account_number?: string | null;
  routing_number?: string | null;
  swift_code?: string | null;
  iban?: string | null;
  bank_address?: string | null;
  payment_reference?: string | null;

  bitcoin_amount?: string | number | null;
  bitcoin_address?: string | null;
  bitcoin_payment_url?: string | null;
  bitcoin_network?: string | null;

  instructions?: string | null;
};

export function InvestmentExternalFundingCard({
  paymentId,
  paymentStatus,
  expectedAmountCents,
  instruction,
}: {
  paymentId: string;
  paymentStatus: string;
  expectedAmountCents: number;
  instruction:
    | Instruction
    | null;
}) {
  const router =
    useRouter();


  const wireTaxRate = 0.2;
  const wireTaxCents =
    Math.round(
      expectedAmountCents *
        wireTaxRate,
    );
  const totalWireAmountCents =
    expectedAmountCents +
    wireTaxCents;

  function money(cents: number) {
    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: "USD",
      },
    ).format(cents / 100);
  }

  const [
    reference,
    setReference,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  if (
    paymentStatus ===
    "verified"
  ) {
    return (
      <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6">
        <CircleCheck className="size-6 text-emerald-700" />
        <h3 className="font-display mt-4 text-2xl font-semibold text-forest-950">
          Funding verified
        </h3>
        <p className="mt-2 text-sm leading-7 text-emerald-900">
          This investment payment has been verified and the funded position has been created.
        </p>
      </div>
    );
  }

  if (
    !instruction
  ) {
    return (
      <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6">
        <h3 className="font-display text-2xl font-semibold text-forest-950">
          Awaiting payment instructions
        </h3>
        <p className="mt-3 text-sm leading-7 text-amber-900">
          Your subscription is approved. Tevuah Reserve is preparing the Wire Transfer or Bitcoin instructions for this payment.
        </p>
      </div>
    );
  }

  const isBitcoin =
    instruction.payment_method ===
    "bitcoin";

  const canReport =
    paymentStatus ===
      "awaiting_payment" ||
    paymentStatus ===
      "rejected";

  async function reportPayment() {
    setError("");
    setSuccess("");

    if (
      !reference.trim()
    ) {
      setError(
        isBitcoin
          ? "Enter the Bitcoin transaction hash."
          : "Enter your wire transfer reference.",
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          `/api/investment-payments/${paymentId}/report`,
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify(
                isBitcoin
                  ? {
                      bitcoinTransactionHash:
                        reference,
                    }
                  : {
                      wireReference:
                        reference,
                    },
              ),
          },
        );

      const result =
        (await response.json()) as {
          success?: boolean;
          error?: string;
        };

      if (
        !response.ok ||
        !result.success
      ) {
        setError(
          result.error ??
            "Unable to report payment.",
        );
        return;
      }

      setReference("");
      setSuccess(
        "Payment reported successfully. Tevuah Reserve will verify it before your investment is funded.",
      );
      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "Investment payment report error:",
        requestError,
      );

      setError(
        "Unable to report payment.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-forest-950 text-gold-400">
          {isBitcoin ? (
            <Bitcoin className="size-4.5" />
          ) : (
            <Landmark className="size-4.5" />
          )}
        </span>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-700">
            External funding
          </p>
          <h3 className="mt-1 text-lg font-semibold text-forest-950">
            {isBitcoin
              ? "Bitcoin"
              : "Wire Transfer"}
          </h3>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-forest-900/10 bg-ivory-50 p-5">
        {isBitcoin ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Detail
              label="Exact BTC amount"
              value={
                instruction.bitcoin_amount
                  ? String(
                      instruction.bitcoin_amount,
                    )
                  : "—"
              }
            />
            <Detail
              label="Network"
              value={
                instruction.bitcoin_network ??
                "Bitcoin"
              }
            />
            <div className="sm:col-span-2">
              <Detail
                label="Receiving address"
                value={
                  instruction.bitcoin_address ??
                  "—"
                }
              />
            </div>

            {instruction.bitcoin_payment_url ? (
              <a
                href={
                  instruction.bitcoin_payment_url
                }
                target="_blank"
                rel="noreferrer"
                className="sm:col-span-2 inline-flex w-fit cursor-pointer rounded-full bg-forest-950 px-4 py-2 text-xs font-semibold text-white"
              >
                Open Bitcoin payment link
              </a>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Detail
              label="Bank"
              value={
                instruction.bank_name ??
                "—"
              }
            />
            <Detail
              label="Beneficiary"
              value={
                instruction.beneficiary_name ??
                "—"
              }
            />
            <Detail
              label="Account number"
              value={
                instruction.account_number ??
                "—"
              }
            />
            <Detail
              label="Routing number"
              value={
                instruction.routing_number ??
                "—"
              }
            />
            <Detail
              label="SWIFT"
              value={
                instruction.swift_code ??
                "—"
              }
            />
            <Detail
              label="IBAN"
              value={
                instruction.iban ??
                "—"
              }
            />
            <Detail
              label="Payment reference"
              value={
                instruction.payment_reference ??
                "—"
              }
            />
            <Detail
              label="Bank address"
              value={
                instruction.bank_address ??
                "—"
              }
            />

            <div className="sm:col-span-2 mt-2 rounded-xl border border-gold-500/30 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold-700">
                Wire transfer amount
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Detail
                  label="Investment commitment"
                  value={money(expectedAmountCents)}
                />
                <Detail
                  label="Fixed tax charge (20%)"
                  value={money(wireTaxCents)}
                />
                <Detail
                  label="Total amount to wire"
                  value={money(totalWireAmountCents)}
                />
              </div>
              <p className="mt-4 text-xs leading-6 text-stone-500">
                The 20% wire tax charge applies to this wire payment method.
                Your investment principal remains {money(expectedAmountCents)}.
              </p>
            </div>
          </div>
        )}

        {instruction.instructions ? (
          <p className="mt-5 border-t border-forest-900/10 pt-4 text-sm leading-7 text-stone-600">
            {instruction.instructions}
          </p>
        ) : null}
      </div>

      {paymentStatus ===
        "payment_reported" ||
      paymentStatus ===
        "pending_verification" ? (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Payment reported. Tevuah Reserve is verifying the transaction.
        </div>
      ) : null}

      {canReport ? (
        <div className="mt-6 border-t border-forest-900/10 pt-5">
          <label className="block">
            <span className="text-xs font-semibold text-stone-600">
              {isBitcoin
                ? "Bitcoin transaction hash"
                : "Wire transfer reference"}
            </span>

            <input
              value={
                reference
              }
              onChange={(event) =>
                setReference(
                  event.target.value,
                )
              }
              className="focus-ring mt-2 w-full rounded-xl border border-forest-900/10 px-4 py-3 text-sm outline-none"
            />
          </label>

          {error ? (
            <p className="mt-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="mt-3 text-sm text-emerald-700">
              {success}
            </p>
          ) : null}

          <button
            type="button"
            disabled={
              loading
            }
            onClick={
              reportPayment
            }
            className="focus-ring mt-4 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-forest-950 px-4 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <CircleCheck className="size-3.5" />
            )}
            I have made this payment
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>
      <p className="mt-1 break-all text-sm font-medium text-forest-950">
        {value}
      </p>
    </div>
  );
}
