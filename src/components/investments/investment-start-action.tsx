"use client";

import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

type InvestorState = {
  signedIn: boolean;

  isInvestor: boolean;

  accountActive: boolean;

  verified: boolean;
};

type InvestmentStartActionProps = {
  opportunityId: string;

  investorState:
    InvestorState;
};

export function InvestmentStartAction({
  opportunityId,
  investorState,
}: InvestmentStartActionProps) {
  const router =
    useRouter();

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

  /*
   * --------------------------------------------------
   * NOT SIGNED IN
   * --------------------------------------------------
   */
  if (
    !investorState.signedIn
  ) {
    return (
      <div className="mt-7">
        <button
          type="button"
          onClick={() =>
            router.push(
              "/login",
            )
          }
          className="focus-ring flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gold-400 px-5 text-sm font-semibold text-forest-950 transition hover:bg-gold-300"
        >
          Sign in to invest

          <ArrowRight className="size-4" />
        </button>
      </div>
    );
  }

  /*
   * --------------------------------------------------
   * ADMIN
   * --------------------------------------------------
   */
  if (
    !investorState.isInvestor
  ) {
    return (
      <div className="mt-7 rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-semibold text-white">
          Investor account required
        </p>

        <p className="mt-1 text-xs leading-6 text-white/50">
          Administrator accounts cannot create
          investor subscriptions.
        </p>
      </div>
    );
  }

  /*
   * --------------------------------------------------
   * RESTRICTED ACCOUNT
   * --------------------------------------------------
   */
  if (
    !investorState.accountActive
  ) {
    return (
      <div className="mt-7 rounded-xl border border-red-300/20 bg-red-500/10 p-4">
        <LockKeyhole className="size-4 text-red-200" />

        <p className="mt-3 text-sm font-semibold text-red-100">
          Account access restricted
        </p>

        <p className="mt-1 text-xs leading-6 text-red-100/60">
          Your investor account must be active before
          starting an investment.
        </p>
      </div>
    );
  }

  /*
   * --------------------------------------------------
   * NOT VERIFIED
   * --------------------------------------------------
   */
  if (
    !investorState.verified
  ) {
    return (
      <div className="mt-7">
        <div className="rounded-xl border border-amber-300/20 bg-amber-400/10 p-4">
          <p className="text-sm font-semibold text-amber-100">
            Verification required
          </p>

          <p className="mt-1 text-xs leading-6 text-amber-100/60">
            Complete and receive approval for investor
            onboarding before investing.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            router.push(
              "/dashboard/onboarding",
            )
          }
          className="focus-ring mt-4 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-sm font-semibold text-white transition hover:bg-white/5"
        >
          Go to onboarding

          <ArrowRight className="size-4" />
        </button>
      </div>
    );
  }

  /*
   * --------------------------------------------------
   * VERIFIED INVESTOR
   * --------------------------------------------------
   */
  async function beginInvestment() {
    setLoading(true);
    setError(null);

    try {
      const response =
        await fetch(
          `/api/investments/${opportunityId}/begin`,
          {
            method:
              "POST",
          },
        );

      const result =
        (await response.json()) as {
          error?: string;
          next?: string;
        };

      if (!response.ok) {
        setError(
          result.error ??
            "Unable to start investment.",
        );

        return;
      }

      router.push(
        result.next ??
          `/dashboard/investments/subscribe/${opportunityId}`,
      );
    } catch {
      setError(
        "Unable to start investment.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-7">
      <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-emerald-300">
        <CheckCircle2 className="size-4" />

        Verified investor
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-300/20 bg-red-500/10 p-4 text-xs leading-6 text-red-100">
          {error}
        </div>
      ) : null}

      <button
        type="button"
        disabled={
          loading
        }
        onClick={
          beginInvestment
        }
        className="focus-ring flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gold-400 px-5 text-sm font-semibold text-forest-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Checking eligibility..."
          : "Start investment"}

        {!loading ? (
          <ArrowRight className="size-4" />
        ) : null}
      </button>
    </div>
  );
}