"use client";

import Link from "next/link";

import {
  KeyRound,
  Loader2,
  Mail,
} from "lucide-react";

import {
  FormEvent,
  useState,
} from "react";

type VerifyRecoveryFormProps = {
  initialEmail?: string;
};

type VerifyRecoveryResponse = {
  success?: boolean;
  error?: string;
};

export function VerifyRecoveryForm({
  initialEmail = "",
}: VerifyRecoveryFormProps) {
  const [
    email,
    setEmail,
  ] = useState(
    initialEmail,
  );

  const [
    token,
    setToken,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const normalizedToken =
      token
        .replace(/\s+/g, "")
        .trim();

    setError(null);

    if (!normalizedEmail) {
      setError(
        "Enter the email address used for your password recovery request.",
      );

      return;
    }

    if (!normalizedToken) {
      setError(
        "Enter the verification code from your email.",
      );

      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/auth/verify-recovery",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            cache:
              "no-store",

            body:
              JSON.stringify({
                email:
                  normalizedEmail,

                token:
                  normalizedToken,
              }),
          },
        );

      const result =
        (await response.json()) as VerifyRecoveryResponse;

      if (
        !response.ok ||
        !result.success
      ) {
        setError(
          result.error ??
            "Unable to verify your recovery code.",
        );

        setLoading(false);

        return;
      }

      /*
       * Hard navigation is intentional.
       *
       * The server has just established:
       *
       * 1. Supabase recovery session cookies
       * 2. Tevuah activation authorization cookie
       *
       * A full navigation guarantees that
       * /reset-password receives the new cookies.
       */
      window.location.replace(
        "/reset-password",
      );
    } catch (verificationError) {
      console.error(
        "Recovery verification request failed:",
        verificationError,
      );

      setError(
        "Unable to verify your recovery code. Please try again.",
      );

      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          {error}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="recovery-verification-email"
          className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-600"
        >
          Email address
        </label>

        <div className="relative">
          <Mail
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400"
          />

          <input
            id="recovery-verification-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value,
              )
            }
            placeholder="you@example.com"
            className="focus-ring min-h-13 w-full rounded-xl border border-forest-900/10 bg-white px-4 pl-11 text-sm text-forest-950 outline-none transition focus:border-gold-600"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="recovery-verification-code"
          className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-600"
        >
          Verification code
        </label>

        <div className="relative">
          <KeyRound
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400"
          />

          <input
            id="recovery-verification-code"
            name="token"
            type="text"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            value={token}
            onChange={(event) =>
              setToken(
                event.target.value,
              )
            }
            placeholder="Enter your code"
            className="focus-ring min-h-13 w-full rounded-xl border border-forest-900/10 bg-white px-4 pl-11 text-sm font-semibold tracking-[0.16em] text-forest-950 outline-none transition focus:border-gold-600"
          />
        </div>

        <p className="mt-2 text-xs leading-5 text-stone-500">
          Enter the verification code exactly as
          shown in your Tevuah Reserve recovery
          email.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify and continue"
        )}
      </button>

      <div className="border-t border-forest-900/10 pt-6 text-center">
        <p className="text-xs leading-5 text-stone-500">
          Didn&apos;t receive a code?
        </p>

        <Link
          href="/forgot-password"
          className="focus-ring mt-2 inline-block rounded-md text-sm font-semibold text-forest-950 underline-offset-4 hover:underline"
        >
          Request a new code
        </Link>
      </div>
    </form>
  );
}