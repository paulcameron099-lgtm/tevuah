"use client";

import {
  Bitcoin,
  CheckCircle2,
  Landmark,
  Loader2,
  Send,
  XCircle,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

type Deposit = {
  id: string;
  investor_id: string;
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

  wire_reference?: string | null;
  bitcoin_transaction_hash?: string | null;
  investor_note?: string | null;
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

export function AdminCashDepositRequests({
  deposits,
}: {
  deposits: Deposit[];
}) {
  return (
    <section className="rounded-4xl border border-forest-900/10 bg-white p-6 shadow-sm sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold-700">
        Investor self-funding
      </p>

      <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">
        Cash Account deposit requests
      </h2>

      <p className="mt-2 text-sm leading-7 text-stone-500">
        Prepare Wire Transfer or Bitcoin instructions,
        then verify reported payments before funds are credited.
      </p>

      {deposits.length ===
      0 ? (
        <p className="mt-6 rounded-xl border border-forest-900/10 bg-ivory-50 p-5 text-sm text-stone-500">
          No Cash Account deposit requests yet.
        </p>
      ) : (
        <div className="mt-6 space-y-5">
          {deposits.map(
            (
              deposit,
            ) => (
              <AdminDepositCard
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
    </section>
  );
}

function AdminDepositCard({
  deposit,
}: {
  deposit: Deposit;
}) {
  const router =
    useRouter();

  const isBitcoin =
    deposit.payment_method ===
    "bitcoin";

  const [
    form,
    setForm,
  ] = useState({
    bankName:
      deposit.bank_name ??
      "",
    beneficiaryName:
      deposit.beneficiary_name ??
      "",
    accountNumber:
      deposit.account_number ??
      "",
    routingNumber:
      deposit.routing_number ??
      "",
    swiftCode:
      deposit.swift_code ??
      "",
    iban:
      deposit.iban ??
      "",
    bankAddress:
      deposit.bank_address ??
      "",
    paymentReference:
      deposit.payment_reference ??
      "",

    bitcoinAmount:
      deposit.bitcoin_amount
        ? String(
            deposit.bitcoin_amount,
          )
        : "",
    bitcoinAddress:
      deposit.bitcoin_address ??
      "",
    bitcoinPaymentUrl:
      deposit.bitcoin_payment_url ??
      "",
    bitcoinNetwork:
      deposit.bitcoin_network ??
      "Bitcoin",

    instructions:
      "",
  });

  const [
    rejectionReason,
    setRejectionReason,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] = useState<
    | "instructions"
    | "verify"
    | "reject"
    | null
  >(null);

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

  function update(
    key: keyof typeof form,
    value: string,
  ) {
    setForm(
      (current) => ({
        ...current,
        [key]:
          value,
      }),
    );
  }

  async function saveInstructions() {
    setError("");
    setSuccess("");
    setLoading(
      "instructions",
    );

    try {
      const response =
        await fetch(
          `/api/admin/cash-account/deposits/${deposit.id}/instructions`,
          {
            method:
              "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify(
                form,
              ),
          },
        );

      const result =
        (await response.json()) as {
          success?: boolean;
          error?: string;
          emailSent?: boolean;
        };

      if (
        !response.ok ||
        !result.success
      ) {
        setError(
          result.error ??
            "Unable to send funding instructions.",
        );
        return;
      }

      setSuccess(
        result.emailSent
          ? "Funding instructions saved and emailed to the investor."
          : "Funding instructions saved. Email delivery should be checked in the server log.",
      );
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function review(
    action:
      | "verify"
      | "reject",
  ) {
    setError("");
    setSuccess("");

    if (
      action ===
        "reject" &&
      !rejectionReason.trim()
    ) {
      setError(
        "Enter the reason for rejecting the reported deposit.",
      );
      return;
    }

    setLoading(
      action,
    );

    try {
      const response =
        await fetch(
          `/api/admin/cash-account/deposits/${deposit.id}/review`,
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                action,
                reason:
                  rejectionReason,
              }),
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
            "Unable to review deposit.",
        );
        return;
      }

      setSuccess(
        action ===
        "verify"
          ? "Deposit verified. Funds were credited to the investor Cash Account."
          : "Deposit rejected and the investor was notified.",
      );
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  const canConfigure =
    ![
      "verified",
      "cancelled",
    ].includes(
      deposit.status,
    );

  const canReview =
    deposit.status ===
      "payment_reported" ||
    deposit.status ===
      "pending_verification";

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
                ? "Bitcoin Cash Account deposit"
                : "Wire Cash Account deposit"}
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
          {deposit.status.replaceAll(
            "_",
            " ",
          )}
        </span>
      </div>

      {canConfigure ? (
        <div className="mt-6 rounded-xl border border-forest-900/10 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
            Payment instructions
          </p>

          {isBitcoin ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                label="Exact BTC amount"
                value={
                  form.bitcoinAmount
                }
                onChange={(value) =>
                  update(
                    "bitcoinAmount",
                    value,
                  )
                }
              />
              <Field
                label="Network"
                value={
                  form.bitcoinNetwork
                }
                onChange={(value) =>
                  update(
                    "bitcoinNetwork",
                    value,
                  )
                }
              />
              <div className="sm:col-span-2">
                <Field
                  label="Bitcoin receiving address"
                  value={
                    form.bitcoinAddress
                  }
                  onChange={(value) =>
                    update(
                      "bitcoinAddress",
                      value,
                    )
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Field
                  label="Payment link (optional)"
                  value={
                    form.bitcoinPaymentUrl
                  }
                  onChange={(value) =>
                    update(
                      "bitcoinPaymentUrl",
                      value,
                    )
                  }
                />
              </div>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                label="Bank name"
                value={
                  form.bankName
                }
                onChange={(value) =>
                  update(
                    "bankName",
                    value,
                  )
                }
              />
              <Field
                label="Beneficiary name"
                value={
                  form.beneficiaryName
                }
                onChange={(value) =>
                  update(
                    "beneficiaryName",
                    value,
                  )
                }
              />
              <Field
                label="Account number"
                value={
                  form.accountNumber
                }
                onChange={(value) =>
                  update(
                    "accountNumber",
                    value,
                  )
                }
              />
              <Field
                label="Routing number"
                value={
                  form.routingNumber
                }
                onChange={(value) =>
                  update(
                    "routingNumber",
                    value,
                  )
                }
              />
              <Field
                label="SWIFT"
                value={
                  form.swiftCode
                }
                onChange={(value) =>
                  update(
                    "swiftCode",
                    value,
                  )
                }
              />
              <Field
                label="IBAN"
                value={
                  form.iban
                }
                onChange={(value) =>
                  update(
                    "iban",
                    value,
                  )
                }
              />
              <Field
                label="Payment reference"
                value={
                  form.paymentReference
                }
                onChange={(value) =>
                  update(
                    "paymentReference",
                    value,
                  )
                }
              />
              <Field
                label="Bank address"
                value={
                  form.bankAddress
                }
                onChange={(value) =>
                  update(
                    "bankAddress",
                    value,
                  )
                }
              />
            </div>
          )}

          <textarea
            value={
              form.instructions
            }
            onChange={(event) =>
              update(
                "instructions",
                event.target.value,
              )
            }
            rows={3}
            placeholder="Additional payment instructions..."
            className="focus-ring mt-4 w-full rounded-xl border border-forest-900/10 px-4 py-3 text-sm outline-none"
          />

          <button
            type="button"
            disabled={
              loading !==
              null
            }
            onClick={
              saveInstructions
            }
            className="focus-ring mt-4 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-forest-950 px-4 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ===
            "instructions" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}

            Save & send instructions
          </button>
        </div>
      ) : null}

      {canReview ? (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-800">
            Investor reported payment
          </p>

          <div className="mt-4 space-y-2 text-sm text-amber-950">
            {isBitcoin ? (
              <p>
                Transaction hash:{" "}
                <strong className="break-all">
                  {
                    deposit.bitcoin_transaction_hash ??
                    "—"
                  }
                </strong>
              </p>
            ) : (
              <p>
                Wire reference:{" "}
                <strong>
                  {
                    deposit.wire_reference ??
                    "—"
                  }
                </strong>
              </p>
            )}
          </div>

          <textarea
            value={
              rejectionReason
            }
            onChange={(event) =>
              setRejectionReason(
                event.target.value,
              )
            }
            rows={3}
            placeholder="Reason if rejecting the payment..."
            className="focus-ring mt-4 w-full rounded-xl border border-amber-300 bg-white px-4 py-3 text-sm outline-none"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={
                loading !==
                null
              }
              onClick={() =>
                review(
                  "verify",
                )
              }
              className="focus-ring inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-emerald-700 px-4 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ===
              "verify" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="size-3.5" />
              )}
              Verify & credit Cash Account
            </button>

            <button
              type="button"
              disabled={
                loading !==
                null
              }
              onClick={() =>
                review(
                  "reject",
                )
              }
              className="focus-ring inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-red-200 bg-white px-4 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ===
              "reject" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <XCircle className="size-3.5" />
              )}
              Reject report
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="mt-4 text-sm text-emerald-700">
          {success}
        </p>
      ) : null}
    </article>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-stone-600">
        {label}
      </span>
      <input
        value={
          value
        }
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="focus-ring mt-2 w-full rounded-xl border border-forest-900/10 bg-white px-4 py-3 text-sm text-forest-950 outline-none"
      />
    </label>
  );
}
