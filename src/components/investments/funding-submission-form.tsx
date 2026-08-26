"use client";

import {
  AlertCircle,
  CheckCircle2,
  FileUp,
  Loader2,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

type Props = {
  paymentId: string;

  expectedAmount: number;

  paymentReference: string;

  initialInvestorReference:
    string;
};

export function FundingSubmissionForm({
  paymentId,
  expectedAmount,
  paymentReference,
  initialInvestorReference,
}: Props) {
  const router =
    useRouter();

  const [
    amount,
    setAmount,
  ] =
    useState(
      String(
        expectedAmount,
      ),
    );

  const [
    investorReference,
    setInvestorReference,
  ] =
    useState(
      initialInvestorReference,
    );

  const [
    proofFile,
    setProofFile,
  ] =
    useState<File | null>(
      null,
    );

  const [
    confirmation,
    setConfirmation,
  ] =
    useState(false);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const reportedAmount =
    Number(amount);

  const validAmount =
    Number.isFinite(
      reportedAmount,
    ) &&
    reportedAmount ===
      expectedAmount;

  const canSubmit =
    validAmount &&
    Boolean(
      investorReference.trim(),
    ) &&
    Boolean(
      proofFile,
    ) &&
    confirmation &&
    !loading;

  async function submitPayment() {
    setError(null);

    if (!validAmount) {
      setError(
        `For this funding flow, the reported amount must exactly equal ${formatMoney(
          expectedAmount,
        )}.`,
      );

      return;
    }

    if (
      !investorReference.trim()
    ) {
      setError(
        "Enter your bank transfer or transaction reference.",
      );

      return;
    }

    if (!proofFile) {
      setError(
        "Upload your proof of payment.",
      );

      return;
    }

    if (!confirmation) {
      setError(
        "Confirm that you have sent the funds before submitting.",
      );

      return;
    }

    setLoading(true);

    try {
      const formData =
        new FormData();

      formData.append(
        "reportedAmount",
        String(
          reportedAmount,
        ),
      );

      formData.append(
        "investorReference",
        investorReference.trim(),
      );

      formData.append(
        "paymentReference",
        paymentReference,
      );

      formData.append(
        "proof",
        proofFile,
      );

      const response =
        await fetch(
            `/api/investment-payments/${paymentId}`,
            {
            method:
                "POST",

            body:
                formData,
            },
        );

      const result =
        (await response.json()) as {
          success?: boolean;

          error?: string;
        };

      if (!response.ok) {
        setError(
          result.error ??
            "Unable to submit payment information.",
        );

        return;
      }

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "Payment submission request error:",
        requestError,
      );

      setError(
        "Unable to submit payment information.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
      <FileUp className="size-5 text-gold-600" />

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
        Payment confirmation
      </p>

      <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
        Report your transfer
      </h2>

      <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
        Complete this section only after the bank
        transfer has been sent.
      </p>

      {/* AMOUNT */}

      <label className="mt-7 block">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
          Amount sent (USD)
        </span>

        <div className="relative mt-3">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-stone-500">
            $
          </span>

          <input
            type="number"
            value={
              amount
            }
            step="0.01"
            onChange={(
              event,
            ) => {
              setAmount(
                event.target.value,
              );

              setError(null);
            }}
            className="focus-ring min-h-12 w-full rounded-xl border border-forest-900/10 bg-ivory-50 pl-8 pr-4 text-sm font-semibold text-forest-950 outline-none"
          />
        </div>

        <p className="mt-2 text-xs text-stone-500">
          Approved commitment:{" "}
          {formatMoney(
            expectedAmount,
          )}
        </p>
      </label>

      {/* TRANSFER REFERENCE */}

      <label className="mt-6 block">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
          Your transfer / transaction reference
        </span>

        <input
          type="text"
          value={
            investorReference
          }
          onChange={(
            event,
          ) => {
            setInvestorReference(
              event.target.value,
            );

            setError(null);
          }}
          placeholder="Example: BANK-TRX-984251"
          className="focus-ring mt-3 min-h-12 w-full rounded-xl border border-forest-900/10 bg-ivory-50 px-4 text-sm text-forest-950 outline-none"
        />
      </label>

      {/* REQUIRED PLATFORM REFERENCE */}

      <div className="mt-6 rounded-xl border border-gold-200 bg-gold-50/40 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold-700">
          Tevuah Reserve payment reference
        </p>

        <p className="mt-2 break-all font-mono text-sm font-semibold text-forest-950">
          {paymentReference}
        </p>
      </div>

      {/* PROOF */}

      <div className="mt-6">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
            Proof of payment
          </span>

          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
            onChange={(
              event,
            ) => {
              setProofFile(
                event.target
                  .files?.[0] ??
                  null,
              );

              setError(null);
            }}
            className="mt-3 block w-full cursor-pointer rounded-xl border border-forest-900/10 bg-ivory-50 p-3 text-sm text-forest-950 file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-forest-950 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
          />
        </label>

        {proofFile ? (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
              Selected proof
            </p>

            <p className="mt-1 break-all text-sm font-semibold text-forest-950">
              {proofFile.name}
            </p>

            <p className="mt-1 text-xs text-stone-500">
              {formatFileSize(
                proofFile.size,
              )}
            </p>
          </div>
        ) : null}
      </div>

      {/* CONFIRMATION */}

      <label className="mt-6 flex cursor-pointer items-start gap-4 rounded-xl border border-forest-900/10 bg-ivory-50 p-5">
        <input
          type="checkbox"
          checked={
            confirmation
          }
          onChange={(
            event,
          ) => {
            setConfirmation(
              event.target.checked,
            );

            setError(null);
          }}
          className="mt-1 size-4 cursor-pointer accent-forest-950"
        />

        <span>
          <span className="block text-sm font-semibold text-forest-950">
            I have sent the funds
          </span>

          <span className="mt-1 block text-xs leading-6 text-stone-600">
            I confirm that the transfer has been sent
            using the funding instructions and that
            the information above is accurate.
          </span>
        </span>
      </label>

      {error ? (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-700" />

          <p className="text-sm leading-6 text-red-700">
            {error}
          </p>
        </div>
      ) : null}

      <button
        type="button"
        disabled={
          !canSubmit
        }
        onClick={
          submitPayment
        }
        className="focus-ring mt-7 inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-7 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />

            Submitting...
          </>
        ) : (
          <>
            <CheckCircle2 className="size-4" />

            I have sent the funds
          </>
        )}
      </button>
    </section>
  );
}

function formatMoney(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style:
        "currency",

      currency:
        "USD",

      maximumFractionDigits:
        0,
    },
  ).format(
    value,
  );
}

function formatFileSize(
  bytes: number,
) {
  if (
    bytes <
    1024
  ) {
    return `${bytes} bytes`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(
      1,
    )} KB`;
  }

  return `${(
    bytes /
    (
      1024 *
      1024
    )
  ).toFixed(
    1,
  )} MB`;
}