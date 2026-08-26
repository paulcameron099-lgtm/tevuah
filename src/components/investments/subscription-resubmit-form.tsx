"use client";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

type Props = {
  opportunity: {
    id: string;

    title: string;

    minimumInvestment: number;

    remainingAllocation: number;
  };

  existing: {
    amount: number;

    signature: string;
  };
};

export function SubscriptionResubmitForm({
  opportunity,
  existing,
}: Props) {
  const router =
    useRouter();

  const [
    amount,
    setAmount,
  ] =
    useState(
      String(
        existing.amount,
      ),
    );

  const [
    offeringAcknowledged,
    setOfferingAcknowledged,
  ] =
    useState(false);

  const [
    riskAccepted,
    setRiskAccepted,
  ] =
    useState(false);

  const [
    signature,
    setSignature,
  ] =
    useState(
      existing.signature,
    );

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

  const investmentAmount =
    Number(amount);

  const amountValid =
    Number.isFinite(
      investmentAmount,
    ) &&
    investmentAmount >=
      opportunity.minimumInvestment &&
    investmentAmount <=
      opportunity.remainingAllocation;

  const ready =
    amountValid &&
    offeringAcknowledged &&
    riskAccepted &&
    signature.trim().length >=
      3;

  async function resubmit() {
    setError(null);

    if (!amountValid) {
      setError(
        `Enter an amount between ${formatMoney(
          opportunity.minimumInvestment,
        )} and ${formatMoney(
          opportunity.remainingAllocation,
        )}.`,
      );

      return;
    }

    if (
      !offeringAcknowledged
    ) {
      setError(
        "Acknowledge the offering documents before resubmitting.",
      );

      return;
    }

    if (!riskAccepted) {
      setError(
        "Accept the investment risk disclosure before resubmitting.",
      );

      return;
    }

    if (
      signature.trim().length <
      3
    ) {
      setError(
        "Enter your full legal name as your electronic signature.",
      );

      return;
    }

    setLoading(true);

    try {
      /*
       * IMPORTANT:
       *
       * We deliberately reuse the same
       * subscribe API.
       *
       * That API detects the existing
       * action_required subscription and
       * updates that SAME row to submitted.
       */
      const response =
        await fetch(
          `/api/investments/${opportunity.id}/subscribe`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                amount:
                  investmentAmount,

                offeringAcknowledged,

                riskAccepted,

                signature:
                  signature.trim(),
              }),
          },
        );

      const result =
        (await response.json()) as {
          success?: boolean;

          error?: string;

          subscriptionId?:
            string;
        };

      if (!response.ok) {
        setError(
          result.error ??
            "Unable to resubmit your subscription.",
        );

        return;
      }

      /*
       * Refresh this same page.
       *
       * status should now be:
       * submitted
       *
       * therefore the resubmission form
       * disappears automatically.
       */
      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "Subscription resubmission error:",
        requestError,
      );

      setError(
        "Unable to resubmit your subscription.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[1.75rem] border border-gold-200 bg-white p-6 sm:p-8">
      <RotateCcw className="size-5 text-gold-600" />

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
        Resubmission
      </p>

      <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
        Update and resubmit your subscription
      </h2>

      <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
        Make any requested changes, reconfirm the
        required acknowledgements and electronically
        sign the updated subscription.
      </p>

      {/* AMOUNT */}

      <label className="mt-7 block">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
          Investment amount (USD)
        </span>

        <div className="relative mt-3">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-stone-500">
            $
          </span>

          <input
            type="number"
            min={
              opportunity.minimumInvestment
            }
            max={
              opportunity.remainingAllocation
            }
            step="1"
            value={
              amount
            }
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
          Minimum{" "}
          {formatMoney(
            opportunity.minimumInvestment,
          )}
          {" · "}
          Remaining allocation{" "}
          {formatMoney(
            opportunity.remainingAllocation,
          )}
        </p>
      </label>

      {/* ACKNOWLEDGEMENTS */}

      <div className="mt-7 space-y-3">
        <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-forest-900/10 bg-ivory-50 p-4">
          <input
            type="checkbox"
            checked={
              offeringAcknowledged
            }
            onChange={(
              event,
            ) =>
              setOfferingAcknowledged(
                event.target.checked,
              )
            }
            className="mt-1 size-4 cursor-pointer accent-forest-950"
          />

          <span className="text-sm leading-6 text-stone-600">
            I reconfirm that I have reviewed the
            offering documents currently available
            for this opportunity.
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-forest-900/10 bg-ivory-50 p-4">
          <input
            type="checkbox"
            checked={
              riskAccepted
            }
            onChange={(
              event,
            ) =>
              setRiskAccepted(
                event.target.checked,
              )
            }
            className="mt-1 size-4 cursor-pointer accent-forest-950"
          />

          <span className="text-sm leading-6 text-stone-600">
            I reconfirm my understanding and
            acceptance of the investment risk
            disclosure.
          </span>
        </label>
      </div>

      {/* SIGNATURE */}

      <label className="mt-7 block">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
          Electronic signature
        </span>

        <input
          type="text"
          value={
            signature
          }
          onChange={(
            event,
          ) => {
            setSignature(
              event.target.value,
            );

            setError(null);
          }}
          placeholder="Type your full legal name"
          className="focus-ring mt-3 min-h-12 w-full rounded-xl border border-forest-900/10 bg-ivory-50 px-4 text-sm text-forest-950 outline-none"
        />
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
          !ready ||
          loading
        }
        onClick={
          resubmit
        }
        className="focus-ring mt-7 inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-7 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />

            Resubmitting...
          </>
        ) : (
          <>
            <CheckCircle2 className="size-4" />

            Resubmit subscription
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