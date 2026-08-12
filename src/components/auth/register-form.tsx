"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { createClient } from "@/src/lib/supabase/client";

export function RegisterForm() {
  const supabase = createClient();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    state: "",
    postalCode: "",
    password: "",
    confirmPassword: "",
  });

  const [acceptedTerms, setAcceptedTerms] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const updateField = (
    field: keyof typeof form,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setMessage(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError(
        "Password must be at least 8 characters.",
      );
      return;
    }

    if (!acceptedTerms) {
      setError(
        "Please accept the Terms & Conditions.",
      );
      return;
    }

    setLoading(true);

const { error } =
  await supabase.auth.signUp({
    email: form.email,
    password: form.password,

    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,

      data: {
        first_name: form.firstName,
        last_name: form.lastName,
        phone: form.phone,
        country: form.country,
        city: form.city,
        state: form.state,
        postal_code: form.postalCode,
      },
    },
  });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Your account has been created. Please check your email to verify your account.",
    );

    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">
          {message}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="First name"
          value={form.firstName}
          onChange={(value) =>
            updateField("firstName", value)
          }
          required
        />

        <Field
          label="Last name"
          value={form.lastName}
          onChange={(value) =>
            updateField("lastName", value)
          }
          required
        />
      </div>

      <Field
        label="Email address"
        type="email"
        value={form.email}
        onChange={(value) =>
          updateField("email", value)
        }
        required
      />

      <Field
        label="Phone number"
        type="tel"
        value={form.phone}
        onChange={(value) =>
          updateField("phone", value)
        }
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Country"
          value={form.country}
          onChange={(value) =>
            updateField("country", value)
          }
        />

        <Field
          label="City"
          value={form.city}
          onChange={(value) =>
            updateField("city", value)
          }
        />

        <Field
          label="State / Province"
          value={form.state}
          onChange={(value) =>
            updateField("state", value)
          }
        />

        <Field
          label="Postal code"
          value={form.postalCode}
          onChange={(value) =>
            updateField("postalCode", value)
          }
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={(value) =>
            updateField("password", value)
          }
          required
        />

        <Field
          label="Confirm password"
          type="password"
          value={form.confirmPassword}
          onChange={(value) =>
            updateField(
              "confirmPassword",
              value,
            )
          }
          required
        />
      </div>

      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(event) =>
            setAcceptedTerms(
              event.target.checked,
            )
          }
          className="mt-1 size-4 rounded border-forest-900/20 accent-forest-950"
        />

        <span className="text-xs leading-6 text-stone-600">
          I agree to the{" "}
          <Link
            href="/terms"
            className="font-semibold text-forest-950 underline underline-offset-4"
          >
            Terms & Conditions
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="font-semibold text-forest-950 underline underline-offset-4"
          >
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create investor account"
        )}
      </button>

      <p className="text-center text-sm text-stone-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-forest-950 underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
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
          onChange(event.target.value)
        }
        className="focus-ring min-h-13 w-full rounded-xl border border-forest-900/10 bg-white px-4 text-sm text-forest-950 outline-none transition placeholder:text-stone-400"
      />
    </label>
  );
}