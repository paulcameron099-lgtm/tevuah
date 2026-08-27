"use client";

import {
  AlertCircle,
  CheckCircle2,
  HandCoins,
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
  distributionId: string;

  currentStatus: string;

  totalDistribution: number;

  eligiblePrincipal: number;

  positionCount: number;

  previewGrossTotal: number;

  previewNetTotal: number;
};

export function DistributionReviewActions({
  distributionId,
  currentStatus,
  totalDistribution,
  eligiblePrincipal,
  positionCount,
  previewGrossTotal,
  previewNetTotal,
}: Props) {
  const router =
    useRouter();

  const [
    confirmed,
    setConfirmed,
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

  const approved =
    currentStatus !==
    "draft";

  async function approveDistribution() {
    setError(null);
    setSuccess(null);

    if (
      currentStatus !==
      "draft"
    ) {
      setError(
        "Only draft distributions can be approved.",
      );

      return;
    }

    if (
      positionCount <=
      0
    ) {
      setError(
        "There are no eligible investor positions for this distribution.",
      );

      return;
    }

    if (
      eligiblePrincipal <=
      0
    ) {
      setError(
        "Eligible funded principal must be greater than zero.",
      );

      return;
    }

    if (
      totalDistribution <=
      0
    ) {
      setError(
        "Distribution amount must be greater than zero.",
      );

      return;
    }

    /*
     * Critical safety:
     * preview must allocate exactly 100% of parent.
     */
    if (
      previewGrossTotal !==
      totalDistribution
    ) {
      setError(
        "Allocation preview does not equal the distribution total.",
      );

      return;
    }

    if (
      previewNetTotal >
      previewGrossTotal
    ) {
      setError(
        "Net distribution cannot exceed gross distribution.",
      );

      return;
    }

    if (!confirmed) {
      setError(
        "Confirm that you reviewed the distribution and investor allocations.",
      );

      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/admin/approve-distribution",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                distributionId,
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
        const rawResponse =
          await response.text();

        console.error(
          "Approve distribution returned non-JSON response:",
          {
            status:
              response.status,

            statusText:
              response.statusText,

            rawResponse:
              rawResponse.slice(
                0,
                1000,
              ),
          },
        );

        setError(
          `Distribution approval endpoint returned ${response.status} ${response.statusText}.`,
        );

        return;
      }

      const result =
        (await response.json()) as {
          success?: boolean;

          error?: string;

          investorCount?: number;

          totalAllocated?: number;
        };

      if (!response.ok) {
        setError(
          result.error ??
            "Unable to approve distribution.",
        );

        return;
      }

      setSuccess(
        "Distribution approved and investor allocations created successfully.",
      );

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "Approve distribution request error:",
        requestError,
      );

      setError(
        "Unable to approve distribution.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6">
        <ShieldCheck className="size-6 text-gold-600" />

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
          Distribution decision
        </p>

        <h2 className="font-display mt-3 text-2xl font-semibold text-forest-950">
          Approve allocations
        </h2>

        <div className="mt-6 rounded-xl bg-ivory-50 p-4">
          <Summary
            label="Distribution"
            value={formatMoney(
              totalDistribution,
            )}
          />

          <Summary
            label="Eligible principal"
            value={formatMoney(
              eligiblePrincipal,
            )}
          />

          <Summary
            label="Investor positions"
            value={String(
              positionCount,
            )}
          />

          <Summary
            label="Gross allocated"
            value={formatMoney(
              previewGrossTotal,
            )}
          />

          <Summary
            label="Net allocated"
            value={formatMoney(
              previewNetTotal,
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

        {approved ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <CheckCircle2 className="size-5 text-emerald-700" />

            <p className="mt-3 text-sm font-semibold text-emerald-900">
              Distribution allocations approved.
            </p>

            <p className="mt-2 text-xs leading-6 text-emerald-700">
              The next step is payment processing.
              Approval itself does not mean investors
              have received cash.
            </p>
          </div>
        ) : (
          <>
            <label className="mt-6 flex cursor-pointer items-start gap-4 rounded-xl border border-forest-900/10 bg-ivory-50 p-5">
              <input
                type="checkbox"
                checked={
                  confirmed
                }
                onChange={(
                  event,
                ) => {
                  setConfirmed(
                    event.target.checked,
                  );

                  setError(null);
                }}
                className="mt-1 size-4 cursor-pointer accent-forest-950"
              />

              <span>
                <span className="block text-sm font-semibold text-forest-950">
                  I reviewed this distribution
                </span>

                <span className="mt-1 block text-xs leading-6 text-stone-600">
                  I confirm the record date, total
                  distribution and investor allocation
                  preview are correct.
                </span>
              </span>
            </label>

            <button
              type="button"
              disabled={
                loading
              }
              onClick={
                approveDistribution
              }
              className="focus-ring mt-6 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />

                  Approving...
                </>
              ) : (
                <>
                  <HandCoins className="size-4" />

                  Approve distribution
                </>
              )}
            </button>
          </>
        )}
      </section>

      <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
          Important
        </p>

        <p className="mt-3 text-sm leading-7 text-amber-900">
          Approval creates payable investor allocation
          records. It does not mark any allocation as
          paid and does not confirm that cash has been
          transferred.
        </p>
      </section>
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