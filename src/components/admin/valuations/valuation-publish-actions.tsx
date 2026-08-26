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

type Props = {
  valuationId: string;

  currentStatus: string;

  totalPrincipal: number;

  totalAssetValue: number;

  positionCount: number;
};

export function ValuationPublishActions({
  valuationId,
  currentStatus,
  totalPrincipal,
  totalAssetValue,
  positionCount,
}: Props) {
  const router =
    useRouter();

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

  const [
    success,
    setSuccess,
  ] =
    useState<
      string | null
    >(null);

  const alreadyPublished =
    currentStatus ===
    "published";

  async function publishValuation() {
    setError(null);
    setSuccess(null);

    if (
      positionCount ===
      0
    ) {
      setError(
        "This valuation has no funded positions to allocate.",
      );

      return;
    }

    if (
      totalPrincipal <=
      0
    ) {
      setError(
        "Funded principal must be greater than zero.",
      );

      return;
    }

    if (
      totalAssetValue <=
      0
    ) {
      setError(
        "Total asset value must be greater than zero.",
      );

      return;
    }

    if (!confirmation) {
      setError(
        "Confirm that you reviewed the valuation and investor allocations.",
      );

      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/admin/publish-valuation",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                valuationId,
              }),
          },
        );

      const contentType =
        response.headers.get(
          "content-type",
        );

      if (
        !contentType?.includes(
          "application/json",
        )
      ) {
        const raw =
          await response.text();

        console.error(
          "Publish valuation returned non-JSON:",
          {
            status:
              response.status,

            body:
              raw.slice(
                0,
                1000,
              ),
          },
        );

        setError(
          `Publish valuation endpoint returned ${response.status} ${response.statusText}.`,
        );

        return;
      }

      const result =
        (await response.json()) as {
          success?: boolean;

          error?: string;
        };

      if (!response.ok) {
        setError(
          result.error ??
            "Unable to publish valuation.",
        );

        return;
      }

      setSuccess(
        "Valuation published successfully. Investor position values are now active.",
      );

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "Publish valuation request error:",
        requestError,
      );

      setError(
        "Unable to publish valuation.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 xl:sticky xl:top-28 xl:self-start">
      <ShieldCheck className="size-6 text-gold-600" />

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
        Valuation decision
      </p>

      <h2 className="font-display mt-3 text-2xl font-semibold text-forest-950">
        Publish investor valuation
      </h2>

      <div className="mt-6 rounded-xl bg-ivory-50 p-4">
        <Summary
          label="Funded principal"
          value={formatMoney(
            totalPrincipal,
          )}
        />

        <Summary
          label="Proposed asset value"
          value={formatMoney(
            totalAssetValue,
          )}
        />

        <Summary
          label="Positions affected"
          value={String(
            positionCount,
          )}
          last
        />
      </div>

      {error ? (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-700" />

          <p className="text-sm leading-6 text-red-700">
            {error}
          </p>
        </div>
      ) : null}

      {success ? (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />

          <p className="text-sm leading-6 text-emerald-700">
            {success}
          </p>
        </div>
      ) : null}

      {alreadyPublished ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
            Published
          </p>

          <p className="mt-2 text-sm leading-7 text-emerald-900">
            This valuation has already been published and
            is part of investor performance reporting.
          </p>
        </div>
      ) : (
        <>
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
                I reviewed this valuation
              </span>

              <span className="mt-1 block text-xs leading-6 text-stone-600">
                I confirm that the valuation amount,
                methodology and investor allocation preview
                have been reviewed and are ready for
                publication.
              </span>
            </span>
          </label>

          <button
            type="button"
            disabled={
              loading
            }
            onClick={
              publishValuation
            }
            className="focus-ring mt-6 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />

                Publishing...
              </>
            ) : (
              <>
                <ShieldCheck className="size-4" />

                Publish valuation
              </>
            )}
          </button>

          <p className="mt-4 text-xs leading-6 text-stone-500">
            Publication creates investor position valuation
            snapshots. This action should not be treated as
            a target-return projection.
          </p>
        </>
      )}
    </aside>
  );
}

function Summary({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`py-3 ${
        last
          ? ""
          : "border-b border-forest-900/10"
      }`}
    >
      <p className="text-xs text-stone-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

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

      maximumFractionDigits:
        0,
    },
  ).format(
    cents / 100,
  );
}