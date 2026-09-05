"use client";

import {
  type FormEvent,
  type ReactNode,
  useState,
} from "react";

import {
  CircleCheck,
  Loader2,
  Plus,
  ShieldCheck,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

type FormState = {
  accountType: string;
  institutionName: string;
  planProvider: string;
  planSponsor: string;
  accountHolderName: string;
  accountNumber: string;
  participantId: string;
  approximateBalanceDollars: string;
  employmentStatus: string;
  rolloverEligibility: string;
};

const INITIAL_STATE: FormState = {
  accountType:
    "401k",
  institutionName:
    "",
  planProvider:
    "",
  planSponsor:
    "",
  accountHolderName:
    "",
  accountNumber:
    "",
  participantId:
    "",
  approximateBalanceDollars:
    "",
  employmentStatus:
    "unknown",
  rolloverEligibility:
    "unknown",
};

export function AddRetirementAccountForm() {
  const router =
    useRouter();

  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      INITIAL_STATE,
    );

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
    success,
    setSuccess,
  ] =
    useState(false);

  function updateField(
    field:
      keyof FormState,
    value:
      string,
  ) {
    setForm(
      (
        current,
      ) => ({
        ...current,
        [field]:
          value,
      }),
    );
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      submitting
    ) {
      return;
    }

    setSubmitting(
      true,
    );

    setError(
      "",
    );

    setSuccess(
      false,
    );

    try {
      const response =
        await fetch(
          "/api/retirement-accounts",
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
                  ...form,

                  approximateBalanceDollars:
                    form.approximateBalanceDollars ||
                    null,
                },
              ),
          },
        );

      const result =
        (await response.json()) as {
          success?: boolean;
          error?: string;
          accountId?: string | null;
        };

      if (
        !response.ok ||
        !result.success
      ) {
        setError(
          result.error ||
            "Unable to add retirement account.",
        );

        return;
      }

      setSuccess(
        true,
      );

      setForm(
        INITIAL_STATE,
      );

      router.refresh();
    } catch (requestError) {
      console.error(
        "Retirement account request error:",
        requestError,
      );

      setError(
        "Unable to add the retirement account.",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8"
    >
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest-950 text-white">
          <Plus className="size-4" />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
            Add account
          </p>

          <h2 className="font-display mt-2 text-3xl font-semibold text-forest-950">
            Add Retirement Account
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
            Add plan and account information for review. Adding an account does not automatically make it an eligible investment funding source.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Field
          label="Account type"
        >
          <select
            value={
              form.accountType
            }
            onChange={(
              event,
            ) =>
              updateField(
                "accountType",
                event.target.value,
              )
            }
            className="focus-ring min-h-12 w-full cursor-pointer rounded-xl border border-forest-900/10 bg-white px-4 text-sm text-forest-950"
          >
            <option value="401k">
              401(k)
            </option>

            <option value="403b">
              403(b)
            </option>

            <option value="457b">
              457(b)
            </option>

            <option value="traditional_ira">
              Traditional IRA
            </option>

            <option value="roth_ira">
              Roth IRA
            </option>

            <option value="sep_ira">
              SEP IRA
            </option>

            <option value="simple_ira">
              SIMPLE IRA
            </option>

            <option value="rollover_ira">
              Rollover IRA
            </option>

            <option value="pension">
              Pension
            </option>

            <option value="other">
              Other
            </option>
          </select>
        </Field>

        <Field
          label="Institution / plan provider"
        >
          <input
            required
            value={
              form.institutionName
            }
            onChange={(
              event,
            ) =>
              updateField(
                "institutionName",
                event.target.value,
              )
            }
            placeholder="e.g. Fidelity"
            className="focus-ring min-h-12 w-full rounded-xl border border-forest-900/10 px-4 text-sm text-forest-950"
          />
        </Field>

        <Field
          label="Plan provider"
          optional
        >
          <input
            value={
              form.planProvider
            }
            onChange={(
              event,
            ) =>
              updateField(
                "planProvider",
                event.target.value,
              )
            }
            placeholder="Provider or administrator"
            className="focus-ring min-h-12 w-full rounded-xl border border-forest-900/10 px-4 text-sm text-forest-950"
          />
        </Field>

        <Field
          label="Employer / plan sponsor"
          optional
        >
          <input
            value={
              form.planSponsor
            }
            onChange={(
              event,
            ) =>
              updateField(
                "planSponsor",
                event.target.value,
              )
            }
            placeholder="Employer or plan sponsor"
            className="focus-ring min-h-12 w-full rounded-xl border border-forest-900/10 px-4 text-sm text-forest-950"
          />
        </Field>

        <Field
          label="Account holder name"
        >
          <input
            required
            value={
              form.accountHolderName
            }
            onChange={(
              event,
            ) =>
              updateField(
                "accountHolderName",
                event.target.value,
              )
            }
            placeholder="Legal account holder"
            className="focus-ring min-h-12 w-full rounded-xl border border-forest-900/10 px-4 text-sm text-forest-950"
          />
        </Field>

        <Field
          label="Approximate balance"
        >
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-stone-400">
              $
            </span>

            <input
              inputMode="decimal"
              value={
                form.approximateBalanceDollars
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "approximateBalanceDollars",
                  event.target.value,
                )
              }
              placeholder="250000"
              className="focus-ring min-h-12 w-full rounded-xl border border-forest-900/10 pl-8 pr-4 text-sm text-forest-950"
            />
          </div>
        </Field>

        <Field
          label="Account number"
          hint="Encrypted before storage. Only the last four are shown normally."
        >
          <input
            autoComplete="off"
            value={
              form.accountNumber
            }
            onChange={(
              event,
            ) =>
              updateField(
                "accountNumber",
                event.target.value,
              )
            }
            placeholder="Full account number"
            className="focus-ring min-h-12 w-full rounded-xl border border-forest-900/10 px-4 text-sm text-forest-950"
          />
        </Field>

        <Field
          label="Participant ID"
          optional
          hint="Encrypted before storage."
        >
          <input
            autoComplete="off"
            value={
              form.participantId
            }
            onChange={(
              event,
            ) =>
              updateField(
                "participantId",
                event.target.value,
              )
            }
            placeholder="Participant identifier"
            className="focus-ring min-h-12 w-full rounded-xl border border-forest-900/10 px-4 text-sm text-forest-950"
          />
        </Field>

        <Field
          label="Employment status"
        >
          <select
            value={
              form.employmentStatus
            }
            onChange={(
              event,
            ) =>
              updateField(
                "employmentStatus",
                event.target.value,
              )
            }
            className="focus-ring min-h-12 w-full cursor-pointer rounded-xl border border-forest-900/10 bg-white px-4 text-sm text-forest-950"
          >
            <option value="unknown">
              Not sure
            </option>

            <option value="currently_employed">
              Currently employed by plan sponsor
            </option>

            <option value="former_employee">
              Former employee
            </option>

            <option value="retired">
              Retired
            </option>

            <option value="self_employed">
              Self-employed
            </option>

            <option value="not_applicable">
              Not applicable
            </option>
          </select>
        </Field>

        <Field
          label="Rollover eligibility"
        >
          <select
            value={
              form.rolloverEligibility
            }
            onChange={(
              event,
            ) =>
              updateField(
                "rolloverEligibility",
                event.target.value,
              )
            }
            className="focus-ring min-h-12 w-full cursor-pointer rounded-xl border border-forest-900/10 bg-white px-4 text-sm text-forest-950"
          >
            <option value="unknown">
              Not sure
            </option>

            <option value="eligible">
              Eligible
            </option>

            <option value="not_eligible">
              Not eligible
            </option>

            <option value="requires_review">
              Requires review
            </option>
          </select>
        </Field>
      </div>

      {/* <div className="mt-6 rounded-2xl border border-forest-900/10 bg-ivory-50 p-4">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-forest-950" />

          <p className="text-xs leading-6 text-stone-600">
            Do not enter your institution password, security answers, authentication PIN, MFA code or recovery code. Tevuah does not store those credentials.
          </p>
        </div>
      </div> */}

      {error ? (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {success ? (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CircleCheck className="size-4 shrink-0" />

          Retirement account added successfully.
        </div>
      ) : null}

      <button
        type="submit"
        disabled={
          submitting
        }
        className="focus-ring mt-6 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4" />
        )}

        {submitting
          ? "Adding account..."
          : "Add retirement account"}
      </button>
    </form>
  );
}

function Field({
  label,
  optional = false,
  hint,
  children,
}: {
  label: string;
  optional?: boolean;
  hint?: string;
  children:
    ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
        {label}

        {optional ? (
          <span className="ml-1 font-normal normal-case tracking-normal text-stone-400">
            (optional)
          </span>
        ) : null}
      </span>

      <div className="mt-2">
        {children}
      </div>

      {hint ? (
        <span className="mt-2 block text-xs leading-5 text-stone-400">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
