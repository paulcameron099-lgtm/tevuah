"use client";

import {
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

type EligibilityFormProps = {
  initialValues?: {
    investorType?: string | null;

    employmentStatus?: string | null;
    occupation?: string | null;
    employerName?: string | null;

    annualIncomeBand?: string | null;
    netWorthBand?: string | null;
    liquidNetWorthBand?: string | null;

    investmentExperience?: string | null;
    privateMarketExperience?: string | null;

    sourceOfWealth?: string | null;
    sourceOfFunds?: string | null;

    accreditedInvestorClaim?: boolean;
    professionalInvestorClaim?: boolean;

    status?: string | null;
  };
};

export function EligibilityForm({
  initialValues,
}: EligibilityFormProps) {
  const router =
    useRouter();

  const [form, setForm] =
    useState({
      investorType:
        initialValues?.investorType ??
        "individual",

      employmentStatus:
        initialValues?.employmentStatus ??
        "",

      occupation:
        initialValues?.occupation ??
        "",

      employerName:
        initialValues?.employerName ??
        "",

      annualIncomeBand:
        initialValues?.annualIncomeBand ??
        "",

      netWorthBand:
        initialValues?.netWorthBand ??
        "",

      liquidNetWorthBand:
        initialValues?.liquidNetWorthBand ??
        "",

      investmentExperience:
        initialValues?.investmentExperience ??
        "",

      privateMarketExperience:
        initialValues?.privateMarketExperience ??
        "",

      sourceOfWealth:
        initialValues?.sourceOfWealth ??
        "",

      sourceOfFunds:
        initialValues?.sourceOfFunds ??
        "",

      accreditedInvestorClaim:
        initialValues?.accreditedInvestorClaim ??
        false,

      professionalInvestorClaim:
        initialValues?.professionalInvestorClaim ??
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

  const isEligible =
    currentStatus ===
    "eligible";

  const needsAction =
    currentStatus ===
      "rejected" ||
    currentStatus ===
      "restricted" ||
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
        "/api/onboarding/eligibility",
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
          "Unable to submit eligibility questionnaire.",
      );

      setLoading(false);

      return;
    }

    router.push(
      result.next ??
        "/dashboard/onboarding/suitability",
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
          title="Eligibility review is in progress."
          text="Your questionnaire has been submitted. Final investment access should only be determined after the relevant compliance review."
        />
      ) : null}

      {isEligible ? (
        <StatusBox
          tone="green"
          title="Eligibility review completed."
          text="Your account has been marked eligible subject to the requirements of each individual investment opportunity."
        />
      ) : null}

      {needsAction ? (
        <StatusBox
          tone="red"
          title="Eligibility requires attention."
          text="Your current eligibility status requires additional review or information."
        />
      ) : null}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest-950 text-gold-400">
            <BadgeCheck className="size-5" />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Investor profile
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              Investor classification
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Tell us how you intend to invest through
              Tevuah Reserve.
            </p>
          </div>
        </div>

        <div className="mt-7">
          <SelectField
            label="Investor type"
            value={
              form.investorType
            }
            onChange={(value) =>
              updateField(
                "investorType",
                value,
              )
            }
            options={[
              {
                value:
                  "individual",
                label:
                  "Individual",
              },
              {
                value:
                  "joint",
                label:
                  "Joint",
              },
              {
                value:
                  "trust",
                label:
                  "Trust",
              },
              {
                value:
                  "company",
                label:
                  "Company",
              },
              {
                value:
                  "partnership",
                label:
                  "Partnership",
              },
              {
                value:
                  "other",
                label:
                  "Other",
              },
            ]}
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest-950 text-gold-400">
            <BriefcaseBusiness className="size-5" />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Employment
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              Employment and occupation
            </h2>
          </div>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Employment status"
            value={
              form.employmentStatus
            }
            required
            onChange={(value) =>
              updateField(
                "employmentStatus",
                value,
              )
            }
            options={[
              {
                value:
                  "employed",
                label:
                  "Employed",
              },
              {
                value:
                  "self_employed",
                label:
                  "Self-employed",
              },
              {
                value:
                  "business_owner",
                label:
                  "Business owner",
              },
              {
                value:
                  "retired",
                label:
                  "Retired",
              },
              {
                value:
                  "student",
                label:
                  "Student",
              },
              {
                value:
                  "unemployed",
                label:
                  "Not currently employed",
              },
              {
                value:
                  "other",
                label:
                  "Other",
              },
            ]}
          />

          <Field
            label="Occupation"
            value={
              form.occupation
            }
            onChange={(value) =>
              updateField(
                "occupation",
                value,
              )
            }
          />

          <div className="sm:col-span-2">
            <Field
              label="Employer / Business name"
              value={
                form.employerName
              }
              onChange={(value) =>
                updateField(
                  "employerName",
                  value,
                )
              }
            />
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest-950 text-gold-400">
            <CircleDollarSign className="size-5" />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Financial profile
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              Financial ranges
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Select the range that most closely reflects
              your current circumstances.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-3">
          <SelectField
            label="Annual income"
            value={
              form.annualIncomeBand
            }
            required
            onChange={(value) =>
              updateField(
                "annualIncomeBand",
                value,
              )
            }
            options={[
              {
                value:
                  "under_50000",
                label:
                  "Under $50,000",
              },
              {
                value:
                  "50000_99999",
                label:
                  "$50,000 – $99,999",
              },
              {
                value:
                  "100000_249999",
                label:
                  "$100,000 – $249,999",
              },
              {
                value:
                  "250000_499999",
                label:
                  "$250,000 – $499,999",
              },
              {
                value:
                  "500000_plus",
                label:
                  "$500,000+",
              },
            ]}
          />

          <SelectField
            label="Net worth"
            value={
              form.netWorthBand
            }
            required
            onChange={(value) =>
              updateField(
                "netWorthBand",
                value,
              )
            }
            options={[
              {
                value:
                  "under_100000",
                label:
                  "Under $100,000",
              },
              {
                value:
                  "100000_499999",
                label:
                  "$100,000 – $499,999",
              },
              {
                value:
                  "500000_999999",
                label:
                  "$500,000 – $999,999",
              },
              {
                value:
                  "1000000_4999999",
                label:
                  "$1,000,000 – $4,999,999",
              },
              {
                value:
                  "5000000_plus",
                label:
                  "$5,000,000+",
              },
            ]}
          />

          <SelectField
            label="Liquid net worth"
            value={
              form.liquidNetWorthBand
            }
            required
            onChange={(value) =>
              updateField(
                "liquidNetWorthBand",
                value,
              )
            }
            options={[
              {
                value:
                  "under_50000",
                label:
                  "Under $50,000",
              },
              {
                value:
                  "50000_249999",
                label:
                  "$50,000 – $249,999",
              },
              {
                value:
                  "250000_499999",
                label:
                  "$250,000 – $499,999",
              },
              {
                value:
                  "500000_999999",
                label:
                  "$500,000 – $999,999",
              },
              {
                value:
                  "1000000_plus",
                label:
                  "$1,000,000+",
              },
            ]}
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Experience
        </p>

        <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
          Investment experience
        </h2>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <SelectField
            label="General investment experience"
            value={
              form.investmentExperience
            }
            required
            onChange={(value) =>
              updateField(
                "investmentExperience",
                value,
              )
            }
            options={
              experienceOptions
            }
          />

          <SelectField
            label="Private-market experience"
            value={
              form.privateMarketExperience
            }
            required
            onChange={(value) =>
              updateField(
                "privateMarketExperience",
                value,
              )
            }
            options={
              experienceOptions
            }
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Wealth and funding
        </p>

        <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
          Source of wealth and funds
        </h2>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Primary source of wealth"
            value={
              form.sourceOfWealth
            }
            required
            onChange={(value) =>
              updateField(
                "sourceOfWealth",
                value,
              )
            }
            options={
              sourceOptions
            }
          />

          <SelectField
            label="Expected source of investment funds"
            value={
              form.sourceOfFunds
            }
            required
            onChange={(value) =>
              updateField(
                "sourceOfFunds",
                value,
              )
            }
            options={
              sourceOptions
            }
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <ShieldCheck className="mt-1 size-5 shrink-0 text-gold-600" />

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Classification declarations
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              Investor declarations
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
              These are investor declarations only.
              Selecting them does not automatically
              establish legal eligibility.
            </p>
          </div>
        </div>

        <div className="mt-7 space-y-4">
          <CheckboxField
            checked={
              form.accreditedInvestorClaim
            }
            onChange={(checked) =>
              updateField(
                "accreditedInvestorClaim",
                checked,
              )
            }
            label="I believe I may qualify as an accredited investor under the rules applicable to me."
          />

          <CheckboxField
            checked={
              form.professionalInvestorClaim
            }
            onChange={(checked) =>
              updateField(
                "professionalInvestorClaim",
                checked,
              )
            }
            label="I believe I may qualify as a professional, sophisticated or equivalent investor where applicable."
          />
        </div>
      </section>

      <div className="flex justify-end">
        {isUnderReview ||
        isEligible ? (
          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/onboarding/suitability",
              )
            }
            className="focus-ring min-h-13 rounded-full bg-forest-950 px-7 text-sm font-semibold text-white transition hover:bg-forest-800"
          >
            Continue to suitability
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="focus-ring flex min-h-13 items-center justify-center gap-2 rounded-full bg-forest-950 px-7 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Submitting eligibility...
              </>
            ) : (
              "Submit eligibility questionnaire"
            )}
          </button>
        )}
      </div>
    </form>
  );
}

const experienceOptions = [
  {
    value: "none",
    label: "No experience",
  },
  {
    value: "limited",
    label: "Limited",
  },
  {
    value: "moderate",
    label: "Moderate",
  },
  {
    value: "experienced",
    label: "Experienced",
  },
  {
    value: "professional",
    label: "Professional",
  },
];

const sourceOptions = [
  {
    value: "employment_income",
    label: "Employment income",
  },
  {
    value: "business_income",
    label: "Business income",
  },
  {
    value: "investments",
    label: "Investment income / proceeds",
  },
  {
    value: "inheritance",
    label: "Inheritance",
  },
  {
    value: "property_sale",
    label: "Property or asset sale",
  },
  {
    value: "savings",
    label: "Personal savings",
  },
  {
    value: "retirement_income",
    label: "Retirement income",
  },
  {
    value: "other",
    label: "Other",
  },
];

type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  label: string;
  value: string;
  required?: boolean;

  options: SelectOption[];

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

type FieldProps = {
  label: string;
  value: string;

  onChange: (
    value: string,
  ) => void;
};

function Field({
  label,
  value,
  onChange,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">
        {label}
      </span>

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="focus-ring min-h-13 w-full rounded-xl border border-forest-900/10 bg-ivory-50 px-4 text-sm text-forest-950 outline-none"
      />
    </label>
  );
}

type CheckboxFieldProps = {
  label: string;
  checked: boolean;

  onChange: (
    checked: boolean,
  ) => void;
};

function CheckboxField({
  label,
  checked,
  onChange,
}: CheckboxFieldProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-forest-900/10 bg-ivory-50 p-5">
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

      <span className="text-sm leading-7 text-stone-700">
        {label}
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