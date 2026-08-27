"use client";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  FileText,
  History,
  Loader2,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useMemo,
  useState,
} from "react";

type Investor = {
  id: string;

  firstName: string;

  lastName: string;

  email:
    | string
    | null;

  accountStatus: string;
};

type Props = {
  investors:
    Investor[];
};

export function StatementGenerateForm({
  investors,
}: Props) {
  const router =
    useRouter();

  const [
    investorId,
    setInvestorId,
  ] =
    useState("");

  const [
    statementType,
    setStatementType,
  ] =
    useState(
      "quarterly",
    );

  const [
    periodStart,
    setPeriodStart,
  ] =
    useState("");

  const [
    periodEnd,
    setPeriodEnd,
  ] =
    useState("");

  const [
    reconstructed,
    setReconstructed,
  ] =
    useState(false);

  const [
    historicalGeneratedAt,
    setHistoricalGeneratedAt,
  ] =
    useState("");

  const [
    historicalPublishedAt,
    setHistoricalPublishedAt,
  ] =
    useState("");

  const [
    reconstructionNote,
    setReconstructionNote,
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

  const selectedInvestor =
    useMemo(
      () =>
        investors.find(
          (
            investor,
          ) =>
            investor.id ===
            investorId,
        ) ??
        null,
      [
        investorId,
        investors,
      ],
    );

  async function generateStatement() {
    setError(null);
    setSuccess(null);

    if (!investorId) {
      setError(
        "Select an investor.",
      );

      return;
    }

    if (!periodStart) {
      setError(
        "Statement period start is required.",
      );

      return;
    }

    if (!periodEnd) {
      setError(
        "Statement period end is required.",
      );

      return;
    }

    if (
      periodEnd <
      periodStart
    ) {
      setError(
        "Period end cannot be before period start.",
      );

      return;
    }

    if (
      reconstructed &&
      !reconstructionNote.trim()
    ) {
      setError(
        "Explain why this historical statement is being reconstructed.",
      );

      return;
    }

    if (
      reconstructed &&
      historicalGeneratedAt &&
      historicalPublishedAt &&
      historicalPublishedAt <
        historicalGeneratedAt
    ) {
      setError(
        "Historical published date cannot be before historical generated date.",
      );

      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/admin/generate-statement",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                investorId,

                statementType,

                periodStart,

                periodEnd,

                reconstructedFromLegacy:
                  reconstructed,

                historicalGeneratedAt:
                  reconstructed &&
                  historicalGeneratedAt
                    ? new Date(
                        historicalGeneratedAt,
                      ).toISOString()
                    : null,

                historicalPublishedAt:
                  reconstructed &&
                  historicalPublishedAt
                    ? new Date(
                        historicalPublishedAt,
                      ).toISOString()
                    : null,

                reconstructionNote:
                  reconstructed
                    ? reconstructionNote.trim()
                    : null,

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
          "Generate statement returned non-JSON:",
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
          `Statement endpoint returned ${response.status} ${response.statusText}.`,
        );

        return;
      }

      const result =
        (await response.json()) as {
          success?: boolean;

          statementId?: string;

          error?: string;
        };

      if (!response.ok) {
        setError(
          result.error ??
            "Unable to generate statement.",
        );

        return;
      }

      if (
        !result.statementId
      ) {
        setError(
          "Statement was generated but its ID was not returned.",
        );

        return;
      }

      setSuccess(
        "Draft statement generated successfully.",
      );

      router.push(
        `/admin/statements/${result.statementId}`,
      );

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "Generate statement request error:",
        requestError,
      );

      setError(
        "Unable to generate statement.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Statement configuration
        </p>

        <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
          Reporting Period
        </h2>

        <div className="mt-7 grid gap-6 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <FieldLabel>
              Investor
            </FieldLabel>

            <select
              value={
                investorId
              }
              onChange={(
                event,
              ) => {
                setInvestorId(
                  event.target.value,
                );

                setError(null);
              }}
              className={inputClass}
            >
              <option value="">
                Select investor
              </option>

              {investors.map(
                (
                  investor,
                ) => (
                  <option
                    key={
                      investor.id
                    }
                    value={
                      investor.id
                    }
                  >
                    {[
                      investor.firstName,
                      investor.lastName,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    {investor.email
                      ? ` — ${investor.email}`
                      : ""}
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="block">
            <FieldLabel>
              Statement type
            </FieldLabel>

            <select
              value={
                statementType
              }
              onChange={(
                event,
              ) =>
                setStatementType(
                  event.target.value,
                )
              }
              className={inputClass}
            >
              <option value="monthly">
                Monthly
              </option>

              <option value="quarterly">
                Quarterly
              </option>

              <option value="annual">
                Annual
              </option>

              <option value="periodic">
                Custom period
              </option>

              <option value="final">
                Final
              </option>
            </select>
          </label>

          <div />

          <label className="block">
            <FieldLabel>
              Period start
            </FieldLabel>

            <input
              type="date"
              value={
                periodStart
              }
              onChange={(
                event,
              ) => {
                setPeriodStart(
                  event.target.value,
                );

                setError(null);
              }}
              className={inputClass}
            />
          </label>

          <label className="block">
            <FieldLabel>
              Period end
            </FieldLabel>

            <input
              type="date"
              value={
                periodEnd
              }
              onChange={(
                event,
              ) => {
                setPeriodEnd(
                  event.target.value,
                );

                setError(null);
              }}
              className={inputClass}
            />
          </label>
        </div>

        {/* HISTORICAL RECONSTRUCTION */}

        <div className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-5">
          <label className="flex cursor-pointer items-start gap-4">
            <input
              type="checkbox"
              checked={
                reconstructed
              }
              onChange={(
                event,
              ) => {
                setReconstructed(
                  event.target.checked,
                );

                setError(null);
              }}
              className="mt-1 size-4 cursor-pointer accent-blue-900"
            />

            <span>
              <span className="block text-sm font-semibold text-blue-950">
                Reconstructed legacy statement
              </span>

              <span className="mt-1 block text-xs leading-6 text-blue-800">
                Use this when rebuilding a historical
                statement from the previous system or
                records that were lost during migration.
              </span>
            </span>
          </label>

          {reconstructed ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <label className="block">
                <FieldLabel>
                  Historical generated date
                </FieldLabel>

                <input
                  type="datetime-local"
                  value={
                    historicalGeneratedAt
                  }
                  onChange={(
                    event,
                  ) => {
                    setHistoricalGeneratedAt(
                      event.target.value,
                    );

                    setError(null);
                  }}
                  className={inputClass}
                />
              </label>

              <label className="block">
                <FieldLabel>
                  Historical published date
                </FieldLabel>

                <input
                  type="datetime-local"
                  value={
                    historicalPublishedAt
                  }
                  onChange={(
                    event,
                  ) => {
                    setHistoricalPublishedAt(
                      event.target.value,
                    );

                    setError(null);
                  }}
                  className={inputClass}
                />
              </label>

              <label className="block sm:col-span-2">
                <FieldLabel>
                  Reconstruction reason
                </FieldLabel>

                <textarea
                  rows={5}
                  value={
                    reconstructionNote
                  }
                  onChange={(
                    event,
                  ) => {
                    setReconstructionNote(
                      event.target.value,
                    );

                    setError(null);
                  }}
                  placeholder="Example: Historical statement reconstructed after migration from the previous Tevuah Reserve platform."
                  className={textareaClass}
                />
              </label>
            </div>
          ) : null}
        </div>

        <label className="mt-6 block">
          <FieldLabel>
            Internal notes
          </FieldLabel>

          <textarea
            rows={5}
            value={
              notes
            }
            onChange={(
              event,
            ) =>
              setNotes(
                event.target.value,
              )
            }
            className={textareaClass}
            placeholder="Optional administrative notes..."
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
            generateStatement
          }
          className="focus-ring mt-7 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />

              Generating...
            </>
          ) : (
            <>
              <FileText className="size-4" />

              Generate draft statement
            </>
          )}
        </button>
      </section>

      <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
        <section className="rounded-[1.75rem] bg-forest-950 p-7 text-white">
          <CalendarDays className="size-6 text-gold-400" />

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">
            Statement preview
          </p>

          {selectedInvestor ? (
            <>
              <h2 className="font-display mt-3 text-3xl font-semibold">
                {[
                  selectedInvestor.firstName,
                  selectedInvestor.lastName,
                ]
                  .filter(Boolean)
                  .join(" ")}
              </h2>

              {selectedInvestor.email ? (
                <p className="mt-2 text-xs text-white/50">
                  {
                    selectedInvestor.email
                  }
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-4 text-sm leading-7 text-white/60">
              Select an investor to begin.
            </p>
          )}

          <div className="mt-7 space-y-5 border-t border-white/10 pt-6">
            <PreviewData
              label="Statement type"
              value={humanize(
                statementType,
              )}
            />

            <PreviewData
              label="Period start"
              value={
                periodStart ||
                "—"
              }
            />

            <PreviewData
              label="Period end"
              value={
                periodEnd ||
                "—"
              }
            />

            <PreviewData
              label="Legacy reconstruction"
              value={
                reconstructed
                  ? "Yes"
                  : "No"
              }
            />
          </div>
        </section>

        {reconstructed ? (
          <section className="rounded-[1.75rem] border border-blue-200 bg-blue-50 p-6">
            <History className="size-5 text-blue-700" />

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
              Historical reconstruction
            </p>

            <p className="mt-3 text-sm leading-7 text-blue-900">
              Historical generated and published dates
              will be preserved separately from the
              system audit timestamps for this
              reconstruction.
            </p>
          </section>
        ) : null}
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

function humanize(
  value: string,
) {
  return value
    .replaceAll(
      "_",
      " ",
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}