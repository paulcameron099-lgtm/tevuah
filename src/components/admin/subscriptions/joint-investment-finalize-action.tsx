"use client";

import {
  CheckCircle2,
  CircleAlert,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  jointSubscriptionId: string;
  commitmentAmountCents: number;
  currency: string;
};

export function JointInvestmentFinalizeAction({
  jointSubscriptionId,
  commitmentAmountCents,
  currency,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function finalize() {
    if (loading || !confirmed) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/investments/joint/${jointSubscriptionId}/finalize`,
        { method: "POST" },
      );

      const result = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        setError(result.error ?? "Unable to finalize joint investment.");
        return;
      }

      setSuccess(
        "Joint investment finalized successfully. Both positions are now active.",
      );
      setConfirmed(false);
      router.refresh();
    } catch (requestError) {
      console.error(
        "Joint investment finalization request error:",
        requestError,
      );
      setError("Unable to finalize joint investment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[1.75rem] border border-gold-500/30 bg-gold-50/50 p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold-700" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-700">
            Final funding action
          </p>
          <h2 className="font-display mt-2 text-3xl font-semibold text-forest-950">
            Finalize joint investment
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
            Both canonical 50/50 obligations are fully funded. Finalization
            creates exactly two positions, recognizes{" "}
            {formatMoney(commitmentAmountCents, currency)} of principal once,
            consumes the capacity reservation and marks the parent funded.
          </p>

          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-2">
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-700" />
              <p className="text-xs leading-5 text-red-800">
                This is a financial finalization action. The database will
                independently recheck consent, both funded obligations,
                canonical funding evidence, reservation, capacity and replay
                protection before creating positions.
              </p>
            </div>
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-forest-900/10 bg-white p-4">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 size-4"
            />
            <span className="text-xs leading-5 text-stone-600">
              I confirm both member funding obligations have been fully
              verified and I intend to finalize this joint investment.
            </span>
          </label>

          {error || success ? (
            <div
              className={`mt-5 rounded-xl border p-4 text-xs leading-5 ${
                error
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              {error || success}
            </div>
          ) : null}

          <button
            type="button"
            disabled={loading || !confirmed}
            onClick={finalize}
            className="focus-ring mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Finalizing...
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                Finalize joint investment
              </>
            )}
          </button>
        </div>
      </div>
    </section>
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
