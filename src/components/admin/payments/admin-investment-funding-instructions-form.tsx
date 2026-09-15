"use client";

import {
  Bitcoin,
  Landmark,
  Loader2,
  Save,
} from "lucide-react";
import {
  useRouter,
} from "next/navigation";
import {
  useState,
} from "react";

type Instruction = {
  payment_method?:
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

export function AdminInvestmentFundingInstructionsForm({
  paymentId,
  initialInstruction,
  commitmentAmountCents,
}: {
  paymentId: string;
  initialInstruction:
    | Instruction
    | null;
  commitmentAmountCents: number;
}) {
  const router =
    useRouter();

  const wireTaxRate =
    0.2;
  const wireTaxCents =
    Math.round(
      commitmentAmountCents *
        wireTaxRate,
    );
  const totalWireAmountCents =
    commitmentAmountCents +
    wireTaxCents;

  function formatMoney(
    cents: number,
  ) {
    return new Intl.NumberFormat(
      "en-US",
      {
        style:
          "currency",
        currency:
          "USD",
      },
    ).format(
      cents / 100,
    );
  }

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState<
    | "wire_transfer"
    | "bitcoin"
  >(
    initialInstruction
      ?.payment_method ??
      "wire_transfer",
  );

  const [
    form,
    setForm,
  ] = useState({
    bankName:
      initialInstruction
        ?.bank_name ??
      "",
    beneficiaryName:
      initialInstruction
        ?.beneficiary_name ??
      "",
    accountNumber:
      initialInstruction
        ?.account_number ??
      "",
    routingNumber:
      initialInstruction
        ?.routing_number ??
      "",
    swiftCode:
      initialInstruction
        ?.swift_code ??
      "",
    iban:
      initialInstruction
        ?.iban ??
      "",
    bankAddress:
      initialInstruction
        ?.bank_address ??
      "",
    paymentReference:
      initialInstruction
        ?.payment_reference ??
      "",

    bitcoinAmount:
      initialInstruction
        ?.bitcoin_amount
        ? String(
            initialInstruction
              .bitcoin_amount,
          )
        : "",
    bitcoinAddress:
      initialInstruction
        ?.bitcoin_address ??
      "",
    bitcoinPaymentUrl:
      initialInstruction
        ?.bitcoin_payment_url ??
      "",
    bitcoinNetwork:
      initialInstruction
        ?.bitcoin_network ??
      "Bitcoin",

    instructions:
      initialInstruction
        ?.instructions ??
      "",
  });

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

  async function save() {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response =
        await fetch(
          `/api/admin/investment-payments/${paymentId}/instructions`,
          {
            method:
              "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                paymentMethod,
                ...form,
              }),
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
            "Unable to save payment instructions.",
        );
        return;
      }

      setSuccess(
        result.emailSent
          ? "Funding instructions saved and emailed to the investor."
          : "Funding instructions saved. The investor can view them in the dashboard, but email delivery should be checked.",
      );
      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "Funding instruction save error:",
        requestError,
      );

      setError(
        "Unable to save payment instructions.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-4xl border border-forest-900/10 bg-white p-6 shadow-sm sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold-700">
        Payment instructions
      </p>

      <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">
        Prepare investor funding details
      </h2>

      <p className="mt-2 text-sm leading-7 text-stone-500">
        Choose the external payment rail and enter exactly what the investor should use.
        Never store a Bitcoin private key or seed phrase.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() =>
            setPaymentMethod(
              "wire_transfer",
            )
          }
          className={`focus-ring flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-left ${
            paymentMethod ===
            "wire_transfer"
              ? "border-forest-950 bg-forest-950 text-white"
              : "border-forest-900/10 bg-white text-forest-950"
          }`}
        >
          <Landmark className="size-5" />
          <span className="font-semibold">
            Wire Transfer
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            setPaymentMethod(
              "bitcoin",
            )
          }
          className={`focus-ring flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-left ${
            paymentMethod ===
            "bitcoin"
              ? "border-forest-950 bg-forest-950 text-white"
              : "border-forest-900/10 bg-white text-forest-950"
          }`}
        >
          <Bitcoin className="size-5" />
          <span className="font-semibold">
            Bitcoin
          </span>
        </button>
      </div>

      {paymentMethod ===
      "wire_transfer" ? (
        <div className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
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

          <div className="rounded-xl border border-gold-500/30 bg-ivory-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold-700">
              Fixed wire transfer tax charge
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <AmountDetail
                label="Investment commitment"
                value={
                  formatMoney(
                    commitmentAmountCents,
                  )
                }
              />

              <AmountDetail
                label="Tax charge (20%)"
                value={
                  formatMoney(
                    wireTaxCents,
                  )
                }
              />

              <AmountDetail
                label="Total wire amount due"
                value={
                  formatMoney(
                    totalWireAmountCents,
                  )
                }
              />
            </div>

            <p className="mt-4 text-xs leading-6 text-stone-500">
              The 20% wire transfer charge is fixed by the platform and cannot be edited from this form.
              Only the approved investment commitment is treated as investment principal.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
            label="Bitcoin network"
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
        rows={4}
        placeholder="Additional funding instructions..."
        className="focus-ring mt-5 w-full rounded-xl border border-forest-900/10 px-4 py-3 text-sm outline-none"
      />

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {success}
        </div>
      ) : null}

      <button
        type="button"
        disabled={
          loading
        }
        onClick={
          save
        }
        className="focus-ring mt-5 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        Save & send instructions
      </button>
    </section>
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
        className="focus-ring mt-2 w-full rounded-xl border border-forest-900/10 px-4 py-3 text-sm text-forest-950 outline-none"
      />
    </label>
  );
}


function AmountDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-stone-500">
        {label}
      </p>
      <p className="mt-1 font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}
