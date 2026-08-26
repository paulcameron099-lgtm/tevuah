"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  Scale,
  ShieldCheck,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { useState } from "react";

type SuitabilityFormProps = {
  initialValues?: {
    investmentObjective?: string | null;

    investmentHorizon?: string | null;

    liquidityNeeds?: string | null;

    riskTolerance?: string | null;

    understandsCapitalLoss?: boolean;

    understandsIlliquidity?: boolean;

    understandsLongHoldingPeriod?: boolean;

    understandsNoGuaranteedReturn?: boolean;

    status?: string | null;
  };
};

export function SuitabilityForm({
  initialValues,
}: SuitabilityFormProps) {
  const router =
    useRouter();

  const [form, setForm] =
    useState({
      investmentObjective:
        initialValues?.investmentObjective ??
        "",

      investmentHorizon:
        initialValues?.investmentHorizon ??
        "",

      liquidityNeeds:
        initialValues?.liquidityNeeds ??
        "",

      riskTolerance:
        initialValues?.riskTolerance ??
        "",

      understandsCapitalLoss:
        initialValues?.understandsCapitalLoss ??
        false,

      understandsIlliquidity:
        initialValues?.understandsIlliquidity ??
        false,

      understandsLongHoldingPeriod:
        initialValues?.understandsLongHoldingPeriod ??
        false,

      understandsNoGuaranteedReturn:
        initialValues?.understandsNoGuaranteedReturn ??
        false,
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  const currentStatus =
    initialValues?.status ??
    "not_started";

  const isUnderReview =
    currentStatus ===
    "under_review";

  const isSuitable =
    currentStatus ===
    "suitable";

  const needsReview =
    currentStatus ===
      "review_required" ||
    currentStatus ===
      "restricted" ||
    currentStatus ===
      "rejected" ||
    currentStatus ===
      "action_required";

  function updateField(
    field: keyof typeof form,
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setLoading(true);

    const response =
      await fetch(
        "/api/onboarding/suitability",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              form,
            ),
        },
      );

    const result =
      (await response.json()) as {
        success?: boolean;
        error?: string;
        next?: string;
      };

    if (!response.ok) {
      setError(
        result.error ??
          "Unable to submit suitability assessment.",
      );

      setLoading(false);

      return;
    }

    router.push(
      result.next ??
        "/dashboard/onboarding/tax",
    );

    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700">
          {error}
        </div>
      ) : null}

      {isUnderReview ? (
        <StatusBox
          tone="amber"
          title="Suitability review is in progress."
          text="Your assessment has been submitted and is awaiting review."
        />
      ) : null}

      {isSuitable ? (
        <StatusBox
          tone="green"
          title="Suitability review completed."
          text="Your account has been marked suitable, subject to the requirements of individual investment opportunities."
        />
      ) : null}

      {needsReview ? (
        <StatusBox
          tone="red"
          title="Suitability requires additional review."
          text="Your current suitability status requires additional information or compliance review."
        />
      ) : null}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest-950 text-gold-400">
            <TrendingUp className="size-5" />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Investment objective
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              What are you primarily investing for?
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Select the objective that most closely reflects
              your reason for investing.
            </p>
          </div>
        </div>

        <div className="mt-7">
          <SelectField
            label="Primary investment objective"
            value={
              form.investmentObjective
            }
            required
            onChange={(value) =>
              updateField(
                "investmentObjective",
                value,
              )
            }
            options={[
              {
                value:
                  "capital_growth",
                label:
                  "Long-term capital growth",
              },
              {
                value:
                  "income",
                label:
                  "Income generation",
              },
              {
                value:
                  "capital_preservation",
                label:
                  "Capital preservation",
              },
              {
                value:
                  "diversification",
                label:
                  "Portfolio diversification",
              },
              {
                value:
                  "real_asset_exposure",
                label:
                  "Real-asset exposure",
              },
              {
                value:
                  "long_term_wealth",
                label:
                  "Long-term wealth accumulation",
              },
            ]}
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest-950 text-gold-400">
            <Clock3 className="size-5" />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Investment horizon
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              How long can you remain invested?
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Private agricultural and collectible investments
              may require extended holding periods.
            </p>
          </div>
        </div>

        <div className="mt-7">
          <SelectField
            label="Expected investment horizon"
            value={
              form.investmentHorizon
            }
            required
            onChange={(value) =>
              updateField(
                "investmentHorizon",
                value,
              )
            }
            options={[
              {
                value:
                  "under_1_year",
                label:
                  "Less than 1 year",
              },
              {
                value:
                  "1_3_years",
                label:
                  "1 – 3 years",
              },
              {
                value:
                  "3_5_years",
                label:
                  "3 – 5 years",
              },
              {
                value:
                  "5_10_years",
                label:
                  "5 – 10 years",
              },
              {
                value:
                  "10_plus_years",
                label:
                  "10+ years",
              },
            ]}
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest-950 text-gold-400">
            <WalletCards className="size-5" />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Liquidity
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              How important is access to this capital?
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Private investments may not offer a readily
              available resale market or predictable exit date.
            </p>
          </div>
        </div>

        <div className="mt-7">
          <SelectField
            label="Liquidity needs"
            value={
              form.liquidityNeeds
            }
            required
            onChange={(value) =>
              updateField(
                "liquidityNeeds",
                value,
              )
            }
            options={[
              {
                value:
                  "high",
                label:
                  "High — I may need access to this capital soon",
              },
              {
                value:
                  "moderate",
                label:
                  "Moderate",
              },
              {
                value:
                  "low",
                label:
                  "Low",
              },
              {
                value:
                  "very_low",
                label:
                  "Very low — I can commit this capital long term",
              },
            ]}
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest-950 text-gold-400">
            <Scale className="size-5" />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Risk tolerance
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              How much investment risk are you prepared to accept?
            </h2>
          </div>
        </div>

        <div className="mt-7">
          <SelectField
            label="Risk tolerance"
            value={
              form.riskTolerance
            }
            required
            onChange={(value) =>
              updateField(
                "riskTolerance",
                value,
              )
            }
            options={[
              {
                value:
                  "conservative",
                label:
                  "Conservative",
              },
              {
                value:
                  "moderately_conservative",
                label:
                  "Moderately conservative",
              },
              {
                value:
                  "balanced",
                label:
                  "Balanced",
              },
              {
                value:
                  "growth",
                label:
                  "Growth-oriented",
              },
              {
                value:
                  "aggressive",
                label:
                  "Aggressive",
              },
            ]}
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-red-200/70 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700">
            <AlertTriangle className="size-5" />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-700">
              Risk acknowledgements
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              Confirm your understanding of private-investment risks.
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
              All four acknowledgements are required before
              this assessment can be submitted.
            </p>
          </div>
        </div>

        <div className="mt-7 space-y-4">
          <Acknowledgement
            checked={
              form.understandsCapitalLoss
            }
            onChange={(checked) =>
              updateField(
                "understandsCapitalLoss",
                checked,
              )
            }
            title="Capital may be lost"
            description="I understand that I may lose some or all of the capital invested."
          />

          <Acknowledgement
            checked={
              form.understandsIlliquidity
            }
            onChange={(checked) =>
              updateField(
                "understandsIlliquidity",
                checked,
              )
            }
            title="Private investments may be illiquid"
            description="I understand that there may be no active market or immediate buyer for my investment."
          />

          <Acknowledgement
            checked={
              form.understandsLongHoldingPeriod
            }
            onChange={(checked) =>
              updateField(
                "understandsLongHoldingPeriod",
                checked,
              )
            }
            title="Holding periods may be long"
            description="I understand that I may need to remain invested for several years."
          />

          <Acknowledgement
            checked={
              form.understandsNoGuaranteedReturn
            }
            onChange={(checked) =>
              updateField(
                "understandsNoGuaranteedReturn",
                checked,
              )
            }
            title="Returns are not guaranteed"
            description="I understand that projected returns, valuations and exit dates are not guaranteed."
          />
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-xl bg-red-50 p-5">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-red-700" />

          <p className="text-xs leading-6 text-stone-700">
            Completing this assessment does not guarantee
            access to any specific Tevuah Reserve investment.
          </p>
        </div>
      </section>

      <div className="flex justify-end">
        {isUnderReview ||
        isSuitable ? (
          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/onboarding/tax",
              )
            }
            className="focus-ring min-h-13 rounded-full bg-forest-950 px-7 text-sm font-semibold text-white transition hover:bg-forest-800"
          >
            Continue to Tax & IRS
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="focus-ring flex min-h-13 items-center justify-center gap-2 rounded-full bg-forest-950 px-7 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Submitting assessment...
              </>
            ) : (
              "Submit suitability assessment"
            )}
          </button>
        )}
      </div>
    </form>
  );
}

type Option = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  label: string;
  value: string;
  required?: boolean;
  options: Option[];

  onChange: (
    value: string,
  ) => void;
};

function SelectField({
  label,
  value,
  required = false,
  options,
  onChange,
}: SelectFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">
        {label}
      </span>

      <select
        value={value}
        required={required}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="focus-ring min-h-13 w-full rounded-xl border border-forest-900/10 bg-ivory-50 px-4 text-sm text-forest-950 outline-none"
      >
        <option value="">
          Select an option
        </option>

        {options.map(
          (option) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {option.label}
            </option>
          ),
        )}
      </select>
    </label>
  );
}

type AcknowledgementProps = {
  checked: boolean;
  title: string;
  description: string;

  onChange: (
    checked: boolean,
  ) => void;
};

function Acknowledgement({
  checked,
  title,
  description,
  onChange,
}: AcknowledgementProps) {
  return (
    <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-forest-900/10 bg-ivory-50 p-5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(
            event.target.checked,
          )
        }
        className="mt-1 size-4 shrink-0 accent-forest-950"
      />

      <span>
        <span className="block text-sm font-semibold text-forest-950">
          {title}
        </span>

        <span className="mt-1 block text-xs leading-6 text-stone-600">
          {description}
        </span>
      </span>
    </label>
  );
}

type StatusBoxProps = {
  tone:
    | "amber"
    | "green"
    | "red";

  title: string;
  text: string;
};

function StatusBox({
  tone,
  title,
  text,
}: StatusBoxProps) {
  const styles = {
    amber:
      "border-amber-200 bg-amber-50",
    green:
      "border-emerald-200 bg-emerald-50",
    red:
      "border-red-200 bg-red-50",
  };

  return (
    <div
      className={`rounded-3xl border p-6 ${styles[tone]}`}
    >
      <CheckCircle2 className="size-5 text-forest-950" />

      <h2 className="font-display mt-4 text-2xl font-semibold text-forest-950">
        {title}
      </h2>

      <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
        {text}
      </p>
    </div>
  );
}