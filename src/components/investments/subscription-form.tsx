"use client";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

type SubscriptionFormProps = {
  opportunity: {
    id: string;

    title: string;

    minimumInvestment: number;

    remainingAllocation: number;
  };
};

export function SubscriptionForm({
  opportunity,
}: SubscriptionFormProps) {
  const router =
    useRouter();

  const [
    amount,
    setAmount,
  ] =
    useState(
      String(
        opportunity.minimumInvestment,
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

  const declarationsComplete =
    offeringAcknowledged &&
    riskAccepted &&
    signature.trim().length >=
      3;

  const canSubmit =
    amountValid &&
    declarationsComplete &&
    !loading;

  async function submitSubscription() {
    setError(null);

    /*
     * Client-side validation improves UX.
     *
     * The API performs all of these checks
     * again on the server.
     */
    if (
      !Number.isFinite(
        investmentAmount,
      ) ||
      investmentAmount <= 0
    ) {
      setError(
        "Enter a valid investment amount.",
      );

      return;
    }

    if (
      investmentAmount <
      opportunity.minimumInvestment
    ) {
      setError(
        `The minimum investment is ${formatMoney(
          opportunity.minimumInvestment,
        )}.`,
      );

      return;
    }

    if (
      investmentAmount >
      opportunity.remainingAllocation
    ) {
      setError(
        `Your investment cannot exceed the remaining allocation of ${formatMoney(
          opportunity.remainingAllocation,
        )}.`,
      );

      return;
    }

    if (
      !offeringAcknowledged
    ) {
      setError(
        "Confirm that you reviewed the offering documents.",
      );

      return;
    }

    if (!riskAccepted) {
      setError(
        "Accept the investment risk disclosure before submitting.",
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

          subscriptionId?: string;

          next?: string;

          error?: string;
        };

      if (!response.ok) {
        setError(
          result.error ??
            "Unable to submit your investment subscription.",
        );

        return;
      }

      router.push(
        result.next ??
          "/dashboard/investments",
      );

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "Investment subscription request error:",
        requestError,
      );

      setError(
        "Unable to submit your investment subscription. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* ==========================================
          HEADER
      ========================================== */}

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Investment subscription
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          {opportunity.title}
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Select your intended capital commitment,
          review the required acknowledgements and
          electronically sign your subscription.
        </p>
      </div>

      {/* ==========================================
          AMOUNT
      ========================================== */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Capital commitment
        </p>

        <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
          Select your investment amount
        </h2>

        <div className="mt-7">
          <label className="block">
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
                    event.target
                      .value,
                  );

                  setError(
                    null,
                  );
                }}
                className="focus-ring min-h-13 w-full rounded-xl border border-forest-900/10 bg-ivory-50 pl-8 pr-4 text-base font-semibold text-forest-950 outline-none"
              />
            </div>
          </label>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <DataCard
              label="Minimum investment"
              value={formatMoney(
                opportunity.minimumInvestment,
              )}
            />

            <DataCard
              label="Remaining allocation"
              value={formatMoney(
                opportunity.remainingAllocation,
              )}
            />
          </div>

          {amount &&
          !amountValid ? (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-700" />

              <p className="text-sm leading-6 text-amber-800">
                Enter an amount between{" "}
                <strong>
                  {formatMoney(
                    opportunity.minimumInvestment,
                  )}
                </strong>{" "}
                and{" "}
                <strong>
                  {formatMoney(
                    opportunity.remainingAllocation,
                  )}
                </strong>
                .
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {/* ==========================================
          OFFERING ACKNOWLEDGEMENT
      ========================================== */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <ShieldCheck className="size-5 text-gold-600" />

        <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
          Required acknowledgements
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
          These acknowledgements form part of your
          electronic subscription record.
        </p>

        <div className="mt-7 space-y-4">
          <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-forest-900/10 bg-ivory-50 p-5">
            <input
              type="checkbox"
              checked={
                offeringAcknowledged
              }
              onChange={(
                event,
              ) => {
                setOfferingAcknowledged(
                  event.target
                    .checked,
                );

                setError(
                  null,
                );
              }}
              className="mt-1 size-4 cursor-pointer accent-forest-950"
            />

            <span>
              <span className="block text-sm font-semibold text-forest-950">
                Offering documents
              </span>

              <span className="mt-1 block text-xs leading-6 text-stone-600">
                I acknowledge that I have had access to
                and reviewed the investment materials
                made available for this opportunity.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-forest-900/10 bg-ivory-50 p-5">
            <input
              type="checkbox"
              checked={
                riskAccepted
              }
              onChange={(
                event,
              ) => {
                setRiskAccepted(
                  event.target
                    .checked,
                );

                setError(
                  null,
                );
              }}
              className="mt-1 size-4 cursor-pointer accent-forest-950"
            />

            <span>
              <span className="block text-sm font-semibold text-forest-950">
                Investment risk disclosure
              </span>

              <span className="mt-1 block text-xs leading-6 text-stone-600">
                I understand that private investments
                involve risk, including potential loss
                of capital, illiquidity, long holding
                periods and no guaranteed return.
              </span>
            </span>
          </label>
        </div>
      </section>

      {/* ==========================================
          SIGNATURE
      ========================================== */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Electronic signature
        </p>

        <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
          Sign your subscription
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
          Type your full legal name to electronically
          sign this investment subscription.
        </p>

        <label className="mt-6 block">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
            Full legal name
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
                event.target
                  .value,
              );

              setError(
                null,
              );
            }}
            placeholder="Type your full legal name"
            className="focus-ring mt-3 min-h-13 w-full rounded-xl border border-forest-900/10 bg-ivory-50 px-4 text-sm text-forest-950 outline-none"
          />
        </label>
      </section>

      {/* ==========================================
          FEEDBACK
      ========================================== */}

      {error ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-700" />

          <p className="text-sm leading-6 text-red-700">
            {error}
          </p>
        </div>
      ) : null}

      {/* ==========================================
          SUBMIT
      ========================================== */}

      <section className="rounded-[1.75rem] bg-forest-950 p-6 text-white sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">
              Subscription summary
            </p>

            <p className="font-display mt-2 text-3xl font-semibold">
              {Number.isFinite(
                investmentAmount,
              )
                ? formatMoney(
                    investmentAmount,
                  )
                : "$0"}
            </p>

            <p className="mt-2 text-xs leading-6 text-white/50">
              This is a requested capital commitment.
              Funds are not counted as accepted capital
              until the subscription is approved.
            </p>
          </div>

          <button
            type="button"
            disabled={
              !canSubmit
            }
            onClick={
              submitSubscription
            }
            className="focus-ring inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-gold-400 px-7 text-sm font-semibold text-forest-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />

                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />

                Submit investment subscription
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}

function DataCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-forest-900/10 bg-ivory-50 p-4">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-forest-950">
        {value}
      </p>
    </div>
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