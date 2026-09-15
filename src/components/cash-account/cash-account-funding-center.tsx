"use client";

import {
  Bitcoin,
  CircleCheck,
  Landmark,
  Loader2,
  Plus,
  Send,
} from "lucide-react";
import {
  useRouter,
} from "next/navigation";
import {
  useMemo,
  useState,
} from "react";

type Deposit = {
  id: string;
  amount_cents: number;
  currency: string;
  payment_method:
    | "wire_transfer"
    | "bitcoin";
  status: string;

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
  rejection_reason?: string | null;
  created_at: string;
};

function money(
  cents: number,
  currency = "USD",
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style:
        "currency",
      currency,
    },
  ).format(
    cents / 100,
  );
}

function statusLabel(
  status: string,
) {
  return status
    .replaceAll(
      "_",
      " ",
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

export function CashAccountFundingCenter({
  initialDeposits,
}: {
  initialDeposits: Deposit[];
}) {
  const router =
    useRouter();

  const [
    amount,
    setAmount,
  ] =
    useState("");

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState<
    | "wire_transfer"
    | "bitcoin"
  >(
    "wire_transfer",
  );

  const [
    creating,
    setCreating,
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

  const amountCents =
    useMemo(
      () => {
        const numeric =
          Number(
            amount,
          );

        return Number.isFinite(
          numeric,
        )
          ? Math.round(
              numeric *
                100,
            )
          : 0;
      },
      [
        amount,
      ],
    );

  async function createRequest() {
    setError("");
    setSuccess("");

    if (
      amountCents <=
      0
    ) {
      setError(
        "Enter the amount you want to add to your Cash Account.",
      );
      return;
    }

    setCreating(true);

    try {
      const response =
        await fetch(
          "/api/cash-account/deposits",
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify(
                {
                  amountCents,
                  paymentMethod,
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
            "Unable to create funding request.",
        );
        return;
      }

      setAmount("");
      setSuccess(
        "Funding request created. Tevuah Reserve will prepare the exact payment instructions for your selected method.",
      );
      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "Cash deposit create error:",
        requestError,
      );

      setError(
        "Unable to create funding request.",
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="rounded-4xl border border-forest-900/10 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold-700">
            Add funds
          </p>

          <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">
            Fund your Tevuah Cash Account
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-500">
            Request Wire Transfer or Bitcoin instructions.
            Your balance is credited only after Tevuah Reserve verifies the payment.
          </p>
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {success}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_260px_auto] md:items-end">
        <label className="block">
          <span className="text-xs font-semibold text-stone-600">
            Amount (USD)
          </span>

          <input
            type="number"
            min="1"
            step="0.01"
            value={
              amount
            }
            onChange={(event) =>
              setAmount(
                event.target.value,
              )
            }
            placeholder="10000"
            className="focus-ring mt-2 w-full rounded-xl border border-forest-900/10 bg-white px-4 py-3 text-sm text-forest-950 outline-none"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-stone-600">
            Payment method
          </span>

          <select
            value={
              paymentMethod
            }
            onChange={(event) =>
              setPaymentMethod(
                event.target.value as
                  | "wire_transfer"
                  | "bitcoin",
              )
            }
            className="focus-ring mt-2 w-full cursor-pointer rounded-xl border border-forest-900/10 bg-white px-4 py-3 text-sm text-forest-950 outline-none"
          >
            <option value="wire_transfer">
              Wire Transfer
            </option>
            <option value="bitcoin">
              Bitcoin
            </option>
          </select>
        </label>

        <button
          type="button"
          disabled={
            creating
          }
          onClick={
            createRequest
          }
          className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}

          Request instructions
        </button>
      </div>

      <div className="mt-8 border-t border-forest-900/10 pt-7">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
          Funding requests
        </p>

        {initialDeposits.length ===
        0 ? (
          <p className="mt-4 text-sm text-stone-500">
            You have not created a Cash Account funding request yet.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {initialDeposits.map(
              (
                deposit,
              ) => (
                <DepositCard
                  key={
                    deposit.id
                  }
                  deposit={
                    deposit
                  }
                />
              ),
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function DepositCard({
  deposit,
}: {
  deposit: Deposit;
}) {
  const router =
    useRouter();

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

  const isBitcoin =
    deposit.payment_method ===
    "bitcoin";

  const canReport =
    deposit.status ===
      "awaiting_payment" ||
    deposit.status ===
      "rejected";

  async function reportPaid() {
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
          `/api/cash-account/deposits/${deposit.id}/report`,
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

      setSuccess(
        "Payment reported successfully. Tevuah Reserve will verify it before crediting your Cash Account.",
      );
      setReference("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="rounded-2xl border border-forest-900/10 bg-ivory-50 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            {isBitcoin ? (
              <Bitcoin className="size-4 text-gold-700" />
            ) : (
              <Landmark className="size-4 text-gold-700" />
            )}

            <p className="text-sm font-semibold text-forest-950">
              {isBitcoin
                ? "Bitcoin"
                : "Wire Transfer"}
            </p>
          </div>

          <p className="mt-2 font-display text-2xl font-semibold text-forest-950">
            {money(
              deposit.amount_cents,
              deposit.currency,
            )}
          </p>
        </div>

        <span className="w-fit rounded-full border border-forest-900/10 bg-white px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-stone-600">
          {statusLabel(
            deposit.status,
          )}
        </span>
      </div>

      {deposit.status ===
      "awaiting_instructions" ? (
        <p className="mt-5 text-sm leading-6 text-stone-600">
          Tevuah Reserve is preparing your payment instructions.
          You will receive an email when they are ready.
        </p>
      ) : null}

      {deposit.status !==
        "awaiting_instructions" &&
      deposit.status !==
        "cancelled" ? (
        <div className="mt-5 rounded-xl border border-forest-900/10 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
            Payment instructions
          </p>

          {isBitcoin ? (
            <div className="mt-4 space-y-3 text-sm text-stone-600">
              <Detail
                label="BTC amount"
                value={
                  deposit.bitcoin_amount
                    ? String(
                        deposit.bitcoin_amount,
                      )
                    : "—"
                }
              />
              <Detail
                label="Network"
                value={
                  deposit.bitcoin_network ??
                  "Bitcoin"
                }
              />
              <Detail
                label="Receiving address"
                value={
                  deposit.bitcoin_address ??
                  "—"
                }
              />

              {deposit.bitcoin_payment_url ? (
                <a
                  href={
                    deposit.bitcoin_payment_url
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-forest-950 underline"
                >
                  Open payment link
                  <Send className="size-3.5" />
                </a>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Detail
                label="Bank"
                value={
                  deposit.bank_name ??
                  "—"
                }
              />
              <Detail
                label="Beneficiary"
                value={
                  deposit.beneficiary_name ??
                  "—"
                }
              />
              <Detail
                label="Account number"
                value={
                  deposit.account_number ??
                  "—"
                }
              />
              <Detail
                label="Routing number"
                value={
                  deposit.routing_number ??
                  "—"
                }
              />
              <Detail
                label="SWIFT"
                value={
                  deposit.swift_code ??
                  "—"
                }
              />
              <Detail
                label="IBAN"
                value={
                  deposit.iban ??
                  "—"
                }
              />
              <Detail
                label="Reference"
                value={
                  deposit.payment_reference ??
                  "—"
                }
              />
            </div>
          )}

          {deposit.instructions ? (
            <p className="mt-4 border-t border-forest-900/10 pt-4 text-sm leading-6 text-stone-600">
              {deposit.instructions}
            </p>
          ) : null}
        </div>
      ) : null}

      {deposit.rejection_reason ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <strong>Action required:</strong>{" "}
          {
            deposit.rejection_reason
          }
        </div>
      ) : null}

      {canReport ? (
        <div className="mt-5">
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
              className="focus-ring mt-2 w-full rounded-xl border border-forest-900/10 bg-white px-4 py-3 text-sm text-forest-950 outline-none"
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
              reportPaid
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
    </article>
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
