"use client";

import {
  Loader2,
  UserRound,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { useState } from "react";

type ProfileFormProps = {
  initialValues?: {
    firstName?: string | null;
    lastName?: string | null;

    phone?: string | null;

    dateOfBirth?: string | null;
    nationality?: string | null;

    profession?: string | null;

    country?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
  };

  completed?: boolean;
};

export function ProfileForm({
  initialValues,
  completed = false,
}: ProfileFormProps) {
  const router =
    useRouter();

  const [form, setForm] =
    useState({
      firstName:
        initialValues?.firstName ??
        "",

      lastName:
        initialValues?.lastName ??
        "",

      phone:
        initialValues?.phone ??
        "",

      dateOfBirth:
        initialValues?.dateOfBirth ??
        "",

      nationality:
        initialValues?.nationality ??
        "",

      profession:
        initialValues?.profession ??
        "",

      country:
        initialValues?.country ??
        "",

      city:
        initialValues?.city ??
        "",

      state:
        initialValues?.state ??
        "",

      postalCode:
        initialValues?.postalCode ??
        "",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  function updateField(
    field: keyof typeof form,
    value: string,
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
        "/api/onboarding/profile",
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
          "Unable to save investor profile.",
      );

      setLoading(false);

      return;
    }

    router.push(
      result.next ??
        "/dashboard/onboarding/identity",
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

      {completed ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
            Profile status
          </p>

          <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">
            Personal profile completed.
          </h2>

          <p className="mt-3 text-sm leading-7 text-stone-600">
            You can review and update your personal
            information below.
          </p>
        </div>
      ) : null}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest-950 text-gold-400">
            <UserRound className="size-5" />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Personal information
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              Tell us about yourself.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Enter your personal information as it
              should appear throughout your investor
              account and verification records.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <Field
            label="First name"
            value={form.firstName}
            required
            onChange={(value) =>
              updateField(
                "firstName",
                value,
              )
            }
          />

          <Field
            label="Last name"
            value={form.lastName}
            required
            onChange={(value) =>
              updateField(
                "lastName",
                value,
              )
            }
          />

          <Field
            label="Phone number"
            type="tel"
            value={form.phone}
            onChange={(value) =>
              updateField(
                "phone",
                value,
              )
            }
          />

          <Field
            label="Date of birth"
            type="date"
            value={
              form.dateOfBirth
            }
            required
            onChange={(value) =>
              updateField(
                "dateOfBirth",
                value,
              )
            }
          />

          <Field
            label="Nationality"
            value={
              form.nationality
            }
            required
            onChange={(value) =>
              updateField(
                "nationality",
                value,
              )
            }
          />

          <Field
            label="Profession / occupation"
            value={
              form.profession
            }
            onChange={(value) =>
              updateField(
                "profession",
                value,
              )
            }
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Location
        </p>

        <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
          Primary residence.
        </h2>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <Field
            label="Country"
            value={
              form.country
            }
            required
            onChange={(value) =>
              updateField(
                "country",
                value,
              )
            }
          />

          <Field
            label="City"
            value={
              form.city
            }
            required
            onChange={(value) =>
              updateField(
                "city",
                value,
              )
            }
          />

          <Field
            label="State / Province / Region"
            value={
              form.state
            }
            onChange={(value) =>
              updateField(
                "state",
                value,
              )
            }
          />

          <Field
            label="Postal code"
            value={
              form.postalCode
            }
            required
            onChange={(value) =>
              updateField(
                "postalCode",
                value,
              )
            }
          />
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="focus-ring flex min-h-13 items-center justify-center gap-2 rounded-full bg-forest-950 px-7 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />

              Saving profile...
            </>
          ) : completed ? (
            "Save changes & continue"
          ) : (
            "Save profile & continue"
          )}
        </button>
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  value: string;

  type?: string;
  required?: boolean;

  onChange: (
    value: string,
  ) => void;
};

function Field({
  label,
  value,
  type = "text",
  required = false,
  onChange,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">
        {label}
      </span>

      <input
        type={type}
        value={value}
        required={required}
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