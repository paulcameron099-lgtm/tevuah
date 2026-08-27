"use client";

import {
  AlertCircle,
  CheckCircle2,
  HandCoins,
  Loader2,
  Save,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useMemo,
  useState,
} from "react";

type OpportunityOption = {
  id: string;

  title: string;

  assetCategory:
    | string
    | null;

  totalFunded: number;

  investorCount: number;

  status: string;
};

type Props = {
  opportunities:
    OpportunityOption[];
};

export function DistributionCreateForm({
  opportunities,
}: Props) {
  const router =
    useRouter();

  const [
    opportunityId,
    setOpportunityId,
  ] =
    useState("");

  const [
    title,
    setTitle,
  ] =
    useState("");

  const [
    distributionType,
    setDistributionType,
  ] =
    useState(
      "income",
    );

  const [
    recordDate,
    setRecordDate,
  ] =
    useState("");

  const [
    paymentDate,
    setPaymentDate,
  ] =
    useState("");

  /*
   * Admin enters dollars.
   */
  const [
    totalAmount,
    setTotalAmount,
  ] =
    useState("");

  const [
    notes,
    setNotes,
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

  const [
    success,
    setSuccess,
  ] =
    useState<
      string | null
    >(null);

  const selectedOpportunity =
    useMemo(
      () =>
        opportunities.find(
          (
            opportunity,
          ) =>
            opportunity.id ===
            opportunityId,
        ) ??
        null,
      [
        opportunities,
        opportunityId,
      ],
    );

  const amountCents =
    useMemo(
      () => {
        const amount =
          Number(
            totalAmount,
          );

        if (
          !Number.isFinite(
            amount,
          ) ||
          amount <= 0
        ) {
          return null;
        }

        return Math.round(
          amount * 100,
        );
      },
      [
        totalAmount,
      ],
    );

  const distributionYield =
    selectedOpportunity &&
    amountCents != null &&
    selectedOpportunity.totalFunded >
      0
      ? (
          amountCents /
          selectedOpportunity.totalFunded
        ) *
        100
      : null;

  async function submitDistribution() {
    setError(null);
    setSuccess(null);

    if (!opportunityId) {
      setError(
        "Select a funded investment opportunity.",
      );

      return;
    }

    if (!title.trim()) {
      setError(
        "Distribution title is required.",
      );

      return;
    }

    if (!recordDate) {
      setError(
        "Record date is required.",
      );

      return;
    }

    const amount =
      Number(
        totalAmount,
      );

    if (
      !Number.isFinite(
        amount,
      ) ||
      amount <= 0
    ) {
      setError(
        "Enter a valid distribution amount.",
      );

      return;
    }

    if (
      paymentDate &&
      paymentDate <
        recordDate
    ) {
      setError(
        "Payment date cannot be before the record date.",
      );

      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/admin/create-distribution",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                opportunityId,

                title:
                  title.trim(),

                distributionType,

                recordDate,

                paymentDate:
                  paymentDate ||
                  null,

                /*
                 * Client sends dollars.
                 */
                totalAmount:
                  amount,

                notes:
                  notes.trim() ||
                  null,
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
          "Create distribution returned non-JSON:",
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
          `Distribution endpoint returned ${response.status} ${response.statusText}.`,
        );

        return;
      }

      const result =
        (await response.json()) as {
          success?: boolean;

          distributionId?: string;

          error?: string;
        };

      if (!response.ok) {
        setError(
          result.error ??
            "Unable to create distribution.",
        );

        return;
      }

      if (
        !result.distributionId
      ) {
        setError(
          "Distribution was created but its ID was not returned.",
        );

        return;
      }

      setSuccess(
        "Draft distribution created successfully.",
      );

      router.push(
        `/admin/distributions/${result.distributionId}`,
      );

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "Create distribution request error:",
        requestError,
      );

      setError(
        "Unable to create distribution.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (
    opportunities.length ===
    0
  ) {
    return (
      <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-7">
        <HandCoins className="size-6 text-amber-700" />

        <h2 className="font-display mt-5 text-3xl font-semibold text-amber-950">
          No funded opportunities are available.
        </h2>

        <p className="mt-4 text-sm leading-7 text-amber-900">
          An opportunity needs at least one funded
          investment position before a distribution
          can be created.
        </p>
      </section>
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Distribution record
        </p>

        <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
          Distribution Details
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
          This creates a draft only. Investor
          allocations are not created until the
          distribution is reviewed.
        </p>

        <div className="mt-7 grid gap-6 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <FieldLabel>
              Investment opportunity
            </FieldLabel>

            <select
              value={
                opportunityId
              }
              onChange={(
                event,
              ) => {
                setOpportunityId(
                  event.target.value,
                );

                setError(null);
              }}
              className={inputClass}
            >
              <option value="">
                Select funded opportunity
              </option>

              {opportunities.map(
                (
                  opportunity,
                ) => (
                  <option
                    key={
                      opportunity.id
                    }
                    value={
                      opportunity.id
                    }
                  >
                    {
                      opportunity.title
                    }
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="block sm:col-span-2">
            <FieldLabel>
              Distribution title
            </FieldLabel>

            <input
              type="text"
              value={
                title
              }
              onChange={(
                event,
              ) => {
                setTitle(
                  event.target.value,
                );

                setError(null);
              }}
              placeholder="Example: Q3 2026 Income Distribution"
              className={inputClass}
            />
          </label>

          <label className="block">
            <FieldLabel>
              Distribution type
            </FieldLabel>

            <select
              value={
                distributionType
              }
              onChange={(
                event,
              ) => {
                setDistributionType(
                  event.target.value,
                );

                setError(null);
              }}
              className={inputClass}
            >
              <option value="income">
                Income
              </option>

              <option value="dividend">
                Dividend
              </option>

              <option value="interest">
                Interest
              </option>

              <option value="profit_distribution">
                Profit distribution
              </option>

              <option value="return_of_capital">
                Return of capital
              </option>

              <option value="redemption">
                Redemption
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </label>

          <label className="block">
            <FieldLabel>
              Total distribution (USD)
            </FieldLabel>

            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-stone-500">
                $
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  totalAmount
                }
                onChange={(
                  event,
                ) => {
                  setTotalAmount(
                    event.target.value,
                  );

                  setError(null);
                }}
                placeholder="10000"
                className={`${inputClass} pl-8`}
              />
            </div>
          </label>

          <label className="block">
            <FieldLabel>
              Record date
            </FieldLabel>

            <input
              type="date"
              value={
                recordDate
              }
              onChange={(
                event,
              ) => {
                setRecordDate(
                  event.target.value,
                );

                setError(null);
              }}
              className={inputClass}
            />
          </label>

          <label className="block">
            <FieldLabel>
              Payment date
            </FieldLabel>

            <input
              type="date"
              value={
                paymentDate
              }
              onChange={(
                event,
              ) => {
                setPaymentDate(
                  event.target.value,
                );

                setError(null);
              }}
              className={inputClass}
            />

            <p className="mt-2 text-xs text-stone-500">
              Optional while creating the draft.
            </p>
          </label>
        </div>

        <label className="mt-6 block">
          <FieldLabel>
            Notes
          </FieldLabel>

          <textarea
            rows={6}
            value={
              notes
            }
            onChange={(
              event,
            ) => {
              setNotes(
                event.target.value,
              );

              setError(null);
            }}
            placeholder="Describe the source, period, calculation basis or other distribution information."
            className={textareaClass}
          />
        </label>

        {error ? (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-700" />

            <p className="text-sm leading-6 text-red-700">
              {error}
            </p>
          </div>
        ) : null}

        {success ? (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />

            <p className="text-sm leading-6 text-emerald-700">
              {success}
            </p>
          </div>
        ) : null}

        <button
          type="button"
          disabled={
            loading
          }
          onClick={
            submitDistribution
          }
          className="focus-ring mt-7 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />

              Creating draft...
            </>
          ) : (
            <>
              <Save className="size-4" />

              Create draft distribution
            </>
          )}
        </button>
      </section>

      <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
        <section className="rounded-[1.75rem] bg-forest-950 p-7 text-white">
          <HandCoins className="size-6 text-gold-400" />

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">
            Distribution preview
          </p>

          {!selectedOpportunity ? (
            <p className="mt-4 text-sm leading-7 text-white/60">
              Select a funded opportunity to preview
              its capital base.
            </p>
          ) : (
            <>
              <h2 className="font-display mt-3 text-3xl font-semibold">
                {
                  selectedOpportunity.title
                }
              </h2>

              <div className="mt-7 space-y-5 border-t border-white/10 pt-6">
                <PreviewData
                  label="Funded principal"
                  value={formatMoney(
                    selectedOpportunity.totalFunded,
                  )}
                />

                <PreviewData
                  label="Funded investors"
                  value={String(
                    selectedOpportunity.investorCount,
                  )}
                />

                <PreviewData
                  label="Distribution amount"
                  value={
                    amountCents !=
                    null
                      ? formatMoney(
                          amountCents,
                        )
                      : "—"
                  }
                />

                <PreviewData
                  label="Distribution / funded capital"
                  value={
                    distributionYield !=
                    null
                      ? `${distributionYield.toFixed(
                          2,
                        )}%`
                      : "—"
                  }
                />
              </div>
            </>
          )}
        </section>

        <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
            Draft only
          </p>

          <p className="mt-3 text-sm leading-7 text-amber-900">
            No investor distribution allocation is
            created and no money is considered payable
            until this draft is reviewed and approved.
          </p>
        </section>
      </aside>
    </div>
  );
}

const inputClass =
  "focus-ring mt-3 min-h-12 w-full cursor-pointer rounded-xl border border-forest-900/10 bg-ivory-50 px-4 text-sm text-forest-950 outline-none";

const textareaClass =
  "focus-ring mt-3 w-full rounded-xl border border-forest-900/10 bg-ivory-50 p-4 text-sm leading-7 text-forest-950 outline-none";

function FieldLabel({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
      {children}
    </span>
  );
}

function PreviewData({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
      <p className="text-xs text-white/40">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-white">
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