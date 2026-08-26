"use client";

import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
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

  fundingTarget: number;

  totalFunded: number;

  investorCount: number;

  status: string;
};

type Props = {
  opportunities:
    OpportunityOption[];
};

export function ValuationCreateForm({
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
    valuationDate,
    setValuationDate,
  ] =
    useState("");

  /*
   * User enters dollars.
   *
   * API converts to cents.
   */
  const [
    totalAssetValue,
    setTotalAssetValue,
  ] =
    useState("");

  const [
    navPerUnit,
    setNavPerUnit,
  ] =
    useState("");

  const [
    valuationType,
    setValuationType,
  ] =
    useState(
      "admin_estimate",
    );

  const [
    sourceName,
    setSourceName,
  ] =
    useState("");

  const [
    methodology,
    setMethodology,
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

  /*
   * Convert entered dollars to cents
   * for preview only.
   */
  const enteredAssetValueCents =
    useMemo(
      () => {
        const value =
          Number(
            totalAssetValue,
          );

        if (
          !Number.isFinite(
            value,
          ) ||
          value <= 0
        ) {
          return null;
        }

        return Math.round(
          value * 100,
        );
      },
      [
        totalAssetValue,
      ],
    );

  /*
   * Simple preview of appreciation/depreciation
   * relative to currently funded principal.
   */
  const estimatedChange =
    selectedOpportunity &&
    enteredAssetValueCents !=
      null
      ? enteredAssetValueCents -
        selectedOpportunity.totalFunded
      : null;

  const estimatedChangePercent =
    selectedOpportunity &&
    enteredAssetValueCents !=
      null &&
    selectedOpportunity.totalFunded >
      0
      ? (
          (
            enteredAssetValueCents -
            selectedOpportunity.totalFunded
          ) /
          selectedOpportunity.totalFunded
        ) *
        100
      : null;

  async function submitValuation() {
    setError(null);
    setSuccess(null);

    if (!opportunityId) {
      setError(
        "Select a funded investment opportunity.",
      );

      return;
    }

    if (!valuationDate) {
      setError(
        "Valuation date is required.",
      );

      return;
    }

    const assetValue =
      Number(
        totalAssetValue,
      );

    if (
      !Number.isFinite(
        assetValue,
      ) ||
      assetValue <= 0
    ) {
      setError(
        "Enter a valid total asset value.",
      );

      return;
    }

    const parsedNav =
      navPerUnit.trim()
        ? Number(
            navPerUnit,
          )
        : null;

    if (
      parsedNav !== null &&
      (
        !Number.isFinite(
          parsedNav,
        ) ||
        parsedNav <= 0
      )
    ) {
      setError(
        "NAV per unit must be greater than zero when provided.",
      );

      return;
    }

    if (
      !methodology.trim()
    ) {
      setError(
        "Valuation methodology is required.",
      );

      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/admin/create-valuation",
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

                valuationDate,

                /*
                 * Send dollars.
                 *
                 * Server converts to cents.
                 */
                totalAssetValue:
                  assetValue,

                navPerUnit:
                  parsedNav,

                valuationType,

                sourceName:
                  sourceName.trim() ||
                  null,

                methodology:
                  methodology.trim(),

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
        const rawResponse =
          await response.text();

        console.error(
          "Create valuation returned non-JSON response:",
          {
            status:
              response.status,

            statusText:
              response.statusText,

            body:
              rawResponse.slice(
                0,
                1000,
              ),
          },
        );

        setError(
          `Valuation endpoint returned ${response.status} ${response.statusText}.`,
        );

        return;
      }

      const result =
        (await response.json()) as {
          success?: boolean;

          valuationId?: string;

          error?: string;
        };

      if (!response.ok) {
        setError(
          result.error ??
            "Unable to create valuation.",
        );

        return;
      }

      if (
        !result.valuationId
      ) {
        setError(
          "Valuation was created but its ID was not returned.",
        );

        return;
      }

      setSuccess(
        "Draft valuation created successfully.",
      );

      /*
       * Take administrator directly to
       * valuation review.
       */
      router.push(
        `/admin/valuations/${result.valuationId}`,
      );

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "Create valuation request error:",
        requestError,
      );

      setError(
        "Unable to create valuation.",
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ==================================================
   * NO FUNDED OPPORTUNITIES
   * ==================================================
   */
  if (
    opportunities.length ===
    0
  ) {
    return (
      <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-7 sm:p-8">
        <BarChart3 className="size-6 text-amber-700" />

        <h2 className="font-display mt-5 text-3xl font-semibold text-amber-950">
          No funded opportunities are available.
        </h2>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-amber-900">
          An opportunity must have at least one funded
          investment position before a valuation can be
          created.
        </p>
      </section>
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
      {/* ==========================================
          FORM
      ========================================== */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Valuation record
        </p>

        <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
          Valuation Details
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
          This creates a draft only. No investor
          portfolio values will change until the draft
          is reviewed and published.
        </p>

        <div className="mt-7 grid gap-6 sm:grid-cols-2">
          {/* OPPORTUNITY */}

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
                setSuccess(null);
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
                    {opportunity.title}
                  </option>
                ),
              )}
            </select>
          </label>

          {/* DATE */}

          <label className="block">
            <FieldLabel>
              Valuation date
            </FieldLabel>

            <input
              type="date"
              value={
                valuationDate
              }
              onChange={(
                event,
              ) => {
                setValuationDate(
                  event.target.value,
                );

                setError(null);
              }}
              className={inputClass}
            />
          </label>

          {/* TYPE */}

          <label className="block">
            <FieldLabel>
              Valuation type
            </FieldLabel>

            <select
              value={
                valuationType
              }
              onChange={(
                event,
              ) => {
                setValuationType(
                  event.target.value,
                );

                setError(null);
              }}
              className={inputClass}
            >
              <option value="admin_estimate">
                Admin estimate
              </option>

              <option value="appraisal">
                Appraisal
              </option>

              <option value="market">
                Market valuation
              </option>

              <option value="external_valuation">
                External valuation
              </option>

              <option value="final">
                Final valuation
              </option>
            </select>
          </label>

          {/* ASSET VALUE */}

          <label className="block">
            <FieldLabel>
              Total asset value (USD)
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
                  totalAssetValue
                }
                onChange={(
                  event,
                ) => {
                  setTotalAssetValue(
                    event.target.value,
                  );

                  setError(null);
                }}
                placeholder="550000"
                className={`${inputClass} pl-8`}
              />
            </div>

            <p className="mt-2 text-xs leading-6 text-stone-500">
              Enter dollars. The system stores monetary
              amounts internally in cents.
            </p>
          </label>

          {/* NAV */}

          <label className="block">
            <FieldLabel>
              NAV per unit
            </FieldLabel>

            <input
              type="number"
              min="0"
              step="0.00000001"
              value={
                navPerUnit
              }
              onChange={(
                event,
              ) => {
                setNavPerUnit(
                  event.target.value,
                );

                setError(null);
              }}
              placeholder="Optional"
              className={inputClass}
            />

            <p className="mt-2 text-xs leading-6 text-stone-500">
              Optional until unit-based accounting is
              introduced.
            </p>
          </label>

          {/* SOURCE */}

          <label className="block sm:col-span-2">
            <FieldLabel>
              Valuation source
            </FieldLabel>

            <input
              type="text"
              value={
                sourceName
              }
              onChange={(
                event,
              ) => {
                setSourceName(
                  event.target.value,
                );

                setError(null);
              }}
              placeholder="Example: Independent appraisal, Tevuah Reserve Asset Management"
              className={inputClass}
            />
          </label>
        </div>

        {/* METHODOLOGY */}

        <label className="mt-6 block">
          <FieldLabel>
            Valuation methodology
          </FieldLabel>

          <textarea
            rows={6}
            value={
              methodology
            }
            onChange={(
              event,
            ) => {
              setMethodology(
                event.target.value,
              );

              setError(null);
            }}
            placeholder="Describe the methodology, assumptions, appraisal process, comparable transactions, income approach or other basis used to determine the valuation."
            className={textareaClass}
          />

          <p className="mt-2 text-xs leading-6 text-stone-500">
            Required. This should explain how the
            valuation was determined rather than
            repeating projected target returns.
          </p>
        </label>

        {/* NOTES */}

        <label className="mt-6 block">
          <FieldLabel>
            Internal / investor notes
          </FieldLabel>

          <textarea
            rows={5}
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
            placeholder="Optional supporting notes..."
            className={textareaClass}
          />
        </label>

        {/* ERROR */}

        {error ? (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-700" />

            <p className="text-sm leading-6 text-red-700">
              {error}
            </p>
          </div>
        ) : null}

        {/* SUCCESS */}

        {success ? (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />

            <p className="text-sm leading-6 text-emerald-700">
              {success}
            </p>
          </div>
        ) : null}

        {/* SAVE */}

        <button
          type="button"
          disabled={
            loading
          }
          onClick={
            submitValuation
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

              Create draft valuation
            </>
          )}
        </button>
      </section>

      {/* ==========================================
          PREVIEW
      ========================================== */}

      <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
        <section className="rounded-[1.75rem] bg-forest-950 p-7 text-white">
          <BarChart3 className="size-6 text-gold-400" />

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">
            Valuation preview
          </p>

          {!selectedOpportunity ? (
            <p className="mt-4 text-sm leading-7 text-white/60">
              Select a funded opportunity to preview
              its current funded capital before creating
              the valuation.
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
                  label="Current funded capital"
                  value={formatMoney(
                    selectedOpportunity.totalFunded,
                  )}
                />

                <PreviewData
                  label="Funding target"
                  value={formatMoney(
                    selectedOpportunity.fundingTarget,
                  )}
                />

                <PreviewData
                  label="Funded investors"
                  value={String(
                    selectedOpportunity.investorCount,
                  )}
                />

                <PreviewData
                  label="New asset value"
                  value={
                    enteredAssetValueCents !=
                    null
                      ? formatMoney(
                          enteredAssetValueCents,
                        )
                      : "—"
                  }
                />

                <PreviewData
                  label="Estimated value change"
                  value={
                    estimatedChange !=
                    null
                      ? formatSignedMoney(
                          estimatedChange,
                        )
                      : "—"
                  }
                />

                <PreviewData
                  label="Estimated change"
                  value={
                    estimatedChangePercent !=
                    null
                      ? `${estimatedChangePercent >= 0 ? "+" : ""}${estimatedChangePercent.toFixed(
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
            Creating this valuation does not alter
            investor portfolios. Position values are
            calculated only after an administrator
            reviews and publishes the valuation.
          </p>
        </section>
      </aside>
    </div>
  );
}

/*
 * ==================================================
 * STYLING
 * ==================================================
 */

const inputClass =
  "focus-ring mt-3 min-h-12 w-full cursor-pointer rounded-xl border border-forest-900/10 bg-ivory-50 px-4 text-sm text-forest-950 outline-none";

const textareaClass =
  "focus-ring mt-3 w-full rounded-xl border border-forest-900/10 bg-ivory-50 p-4 text-sm leading-7 text-forest-950 outline-none";

/*
 * ==================================================
 * FIELD LABEL
 * ==================================================
 */

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

/*
 * ==================================================
 * PREVIEW DATA
 * ==================================================
 */

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

      <p className="mt-1 wrap-break-word text-sm font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

/*
 * ==================================================
 * HELPERS
 * ==================================================
 */

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

function formatSignedMoney(
  cents: number,
) {
  const formatted =
    formatMoney(
      Math.abs(
        cents,
      ),
    );

  if (cents > 0) {
    return `+${formatted}`;
  }

  if (cents < 0) {
    return `-${formatted}`;
  }

  return formatted;
}