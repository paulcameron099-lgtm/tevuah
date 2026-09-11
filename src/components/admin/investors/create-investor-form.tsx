"use client";

import {
  ArrowLeft,
  CircleCheck,
  Loader2,
  Send,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import type {
  FormEvent,
  ReactNode,
} from "react";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profession: string;
  country: string;
  city: string;
  state: string;
  postalCode: string;
};

const INITIAL_FORM: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  profession: "",
  country: "",
  city: "",
  state: "",
  postalCode: "",
};

const INPUT_CLASS =
  "focus-ring mt-2 min-h-12 w-full rounded-xl border border-forest-900/10 bg-white px-4 text-sm text-forest-950 outline-none placeholder:text-stone-400";

export function CreateInvestorForm() {
  const router =
    useRouter();

  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      INITIAL_FORM,
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
    useState<string | null>(
      null,
    );

  const [
    success,
    setSuccess,
  ] =
    useState<string | null>(
      null,
    );

  function update(
    key: keyof FormState,
    value: string,
  ) {
    setForm(
      (current) => ({
        ...current,
        [key]: value,
      }),
    );
  }

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const response =
        await fetch(
          "/api/admin/investors",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify(form),
          },
        );

      const result =
        (await response.json()) as {
          success?: boolean;
          investorId?: string;
          message?: string;
          error?: string;
        };

      if (
        !response.ok ||
        !result.success ||
        !result.investorId
      ) {
        setError(
          result.error ??
            "Unable to create investor.",
        );

        return;
      }

      setSuccess(
        result.message ??
          "Investor created and invitation sent.",
      );

      router.push(
        `/admin/investors/${result.investorId}`,
      );

      router.refresh();
    } catch {
      setError(
        "Unable to create investor. Check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <Link
        href="/admin/investors"
        className="focus-ring inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-forest-950 transition hover:text-forest-700"
      >
        <ArrowLeft className="size-4" />
        Back to investors
      </Link>

      <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
        <div className="border-b border-forest-900/10 px-6 py-7 sm:px-8">
          <div className="flex size-11 items-center justify-center rounded-full bg-forest-950 text-white">
            <UserPlus className="size-5" />
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
            Investor access
          </p>

          <h1 className="font-display mt-3 text-4xl font-semibold tracking-[-0.035em] text-forest-950">
            Create investor account
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
            Create secure Tevuah Reserve access after your team has established
            the investor relationship. The investor receives an activation
            invitation and chooses their own password.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="p-6 sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="First name"
              required
            >
              <input
                required
                autoComplete="given-name"
                value={form.firstName}
                onChange={(event) =>
                  update(
                    "firstName",
                    event.target.value,
                  )
                }
                className={INPUT_CLASS}
              />
            </Field>

            <Field
              label="Last name"
              required
            >
              <input
                required
                autoComplete="family-name"
                value={form.lastName}
                onChange={(event) =>
                  update(
                    "lastName",
                    event.target.value,
                  )
                }
                className={INPUT_CLASS}
              />
            </Field>

            <Field
              label="Email"
              required
            >
              <input
                required
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) =>
                  update(
                    "email",
                    event.target.value,
                  )
                }
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Phone">
              <input
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(event) =>
                  update(
                    "phone",
                    event.target.value,
                  )
                }
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Profession">
              <input
                value={form.profession}
                onChange={(event) =>
                  update(
                    "profession",
                    event.target.value,
                  )
                }
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Country">
              <input
                autoComplete="country-name"
                value={form.country}
                onChange={(event) =>
                  update(
                    "country",
                    event.target.value,
                  )
                }
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="City">
              <input
                autoComplete="address-level2"
                value={form.city}
                onChange={(event) =>
                  update(
                    "city",
                    event.target.value,
                  )
                }
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="State">
              <input
                autoComplete="address-level1"
                value={form.state}
                onChange={(event) =>
                  update(
                    "state",
                    event.target.value,
                  )
                }
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Postal code">
              <input
                autoComplete="postal-code"
                value={form.postalCode}
                onChange={(event) =>
                  update(
                    "postalCode",
                    event.target.value,
                  )
                }
                className={INPUT_CLASS}
              />
            </Field>
          </div>

          <div className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-700" />

              <div>
                <p className="text-sm font-semibold text-emerald-900">
                  Secure account activation
                </p>

                <p className="mt-2 text-xs leading-6 text-emerald-800">
                  The admin does not create or receive the investor&apos;s
                  password. Account creation also does not approve KYC,
                  suitability, eligibility, tax certification or investment access.
                </p>
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mt-6 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              <CircleCheck className="mt-0.5 size-4 shrink-0" />
              {success}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="focus-ring mt-7 inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating investor...
              </>
            ) : (
              <>
                <Send className="size-4" />
                Create &amp; send invitation
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
        {label}
        {required ? (
          <span className="text-red-600">
            {" "}*
          </span>
        ) : null}
      </span>

      {children}
    </label>
  );
}
