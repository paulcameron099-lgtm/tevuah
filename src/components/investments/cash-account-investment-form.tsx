"use client";

import {
  type FormEvent,
  useMemo,
  useState,
} from "react";

import {
  CircleCheck,
  Loader2,
  WalletCards,
} from "lucide-react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  formatCashMoney,
} from "@/src/lib/cash-account/cash-money";

type CashAccountInvestmentFormProps = {
  subscriptionId: string;
  commitmentAmountCents: number;
  availableBalanceCents: number;
  currency?: string;
};

type FundingResponse = {
  success?: boolean;
  error?: string;
  paymentId?: string | null;
  positionId?: string | null;
  remainingBalanceCents?: number | null;
  verified?: boolean;
};

function createIdempotencyKey(
  subscriptionId: string,
) {
  return `cash-investment:${subscriptionId}:${crypto.randomUUID()}`;
}

export function CashAccountInvestmentForm({
  subscriptionId,
  commitmentAmountCents,
  availableBalanceCents,
  currency = "USD",
}: CashAccountInvestmentFormProps) {
  const router =
    useRouter();

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    result,
    setResult,
  ] =
    useState<FundingResponse | null>(
      null,
    );

  const [
    idempotencyKey,
  ] =
    useState(
      () =>
        createIdempotencyKey(
          subscriptionId,
        ),
    );

  const enoughBalance =
    availableBalanceCents >=
    commitmentAmountCents;

  const remainingPreview =
    useMemo(
      () =>
        Math.max(
          availableBalanceCents -
            commitmentAmountCents,
          0,
        ),
      [
        availableBalanceCents,
        commitmentAmountCents,
      ],
    );

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      submitting ||
      !enoughBalance ||
      result?.success
    ) {
      return;
    }

    setSubmitting(
      true,
    );

    setError(
      "",
    );

    try {
      const response =
        await fetch(
          "/api/investments/fund-from-cash-account",
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
                  subscriptionId,
                  idempotencyKey,
                },
              ),
          },
        );

      const data =
        (await response.json()) as FundingResponse;

      if (
        !response.ok ||
        !data.success
      ) {
        setError(
          data.error ||
            "Unable to fund this investment.",
        );

        return;
      }

      setResult(
        data,
      );

      router.refresh();
    } catch (requestError) {
      console.error(
        "Cash investment request error:",
        requestError,
      );

      setError(
        "Unable to complete the investment funding request.",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  if (
    result?.success
  ) {
    return (
      <section className="rounded-4xl border border-emerald-200 bg-emerald-50 p-6 sm:p-7">
        <CircleCheck className="size-7 text-emerald-700" />

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700">
          Funding verified
        </p>

        <h2 className="font-display mt-3 text-2xl font-semibold text-forest-950">
          Your investment is now funded.
        </h2>

        <p className="mt-3 text-sm leading-7 text-emerald-900">
          The commitment was debited from your Tevuah Cash Account,
          verified automatically, and your funded investment position
          was created.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard/portfolio"
            className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-900"
          >
            View portfolio
          </Link>

          {result.paymentId ? (
            <Link
              href={`/dashboard/documents/funding-confirmation/${result.paymentId}`}
              className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-forest-900/10 bg-white px-5 text-sm font-semibold text-forest-950 transition hover:bg-ivory-50"
            >
              Funding confirmation
            </Link>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="rounded-4xl border border-forest-900/10 bg-white p-6 shadow-sm sm:p-7"
    >
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest-950 text-gold-400">
          <WalletCards className="size-5" />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold-700">
            Funding source
          </p>

          <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">
            Tevuah Cash Account
          </h2>

          <p className="mt-2 text-sm leading-6 text-stone-500">
            Your available Tevuah Cash balance will be used immediately.
            Internal cash funding is verified automatically when the
            transaction completes.
          </p>
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-ivory-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
            Available
          </p>

          <p className="mt-2 text-lg font-semibold text-forest-950">
            {formatCashMoney(
              availableBalanceCents,
              currency,
            )}
          </p>
        </div>

        <div className="rounded-2xl bg-ivory-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
            Investment
          </p>

          <p className="mt-2 text-lg font-semibold text-forest-950">
            {formatCashMoney(
              commitmentAmountCents,
              currency,
            )}
          </p>
        </div>

        <div className="rounded-2xl bg-ivory-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
            Balance after
          </p>

          <p className="mt-2 text-lg font-semibold text-forest-950">
            {formatCashMoney(
              remainingPreview,
              currency,
            )}
          </p>
        </div>
      </div>

      {!enoughBalance ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          Your Tevuah Cash Account does not have enough available funds for
          this subscription.
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={
          submitting ||
          !enoughBalance
        }
        className="focus-ring mt-6 inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition hover:bg-forest-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Funding and verifying...
          </>
        ) : (
          <>
            <WalletCards className="size-4" />
            Invest with Tevuah Cash
          </>
        )}
      </button>
    </form>
  );
}
