"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Mail,
} from "lucide-react";
import {
  FormEvent,
  useState,
} from "react";

import {
  createClient,
} from "@/src/lib/supabase/client";

export function ForgotPasswordForm() {
  const [
    email,
    setEmail,
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

    if (!normalizedEmail) {
      setError(
        "Enter your email address.",
      );

      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase =
        createClient();

      const {
        error:
          recoveryError,
      } =
        await supabase.auth.resetPasswordForEmail(
          normalizedEmail,
        );

      if (recoveryError) {
        console.error(
          "Password recovery request error:",
          recoveryError,
        );

        setError(
          "Unable to send password reset instructions. Please try again.",
        );

        setLoading(false);

        return;
      }

      /*
       * Do NOT put the recovery OTP in the URL.
       *
       * The email address is not the authentication
       * credential. The OTP remains only in the
       * recovery email.
       */
      const params =
        new URLSearchParams();

      params.set(
        "email",
        normalizedEmail,
      );

      window.location.assign(
        `/verify-recovery?${params.toString()}`,
      );
    } catch (requestError) {
      console.error(
        "Password recovery request failed:",
        requestError,
      );

      setError(
        "Unable to send password reset instructions. Please try again.",
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
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          {error}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="recovery-email"
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
            id="recovery-email"
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
            className="focus-ring min-h-13 w-full rounded-xl border border-forest-900/10 bg-white px-4 pl-11 text-sm text-forest-950 outline-none"
          />
        </div>
      </div>

      <div className="rounded-xl border border-forest-900/10 bg-ivory-100 p-4">
        <p className="text-xs leading-6 text-stone-600">
          We will send a secure verification
          code to your email address. You will
          need that code before you can choose
          a new password.
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
            Sending code...
          </>
        ) : (
          "Send verification code"
        )}
      </button>

      <Link
        href="/login"
        className="focus-ring mx-auto flex w-fit items-center gap-2 rounded-md text-sm font-semibold text-forest-950 underline-offset-4 hover:underline"
      >
        <ArrowLeft className="size-4" />
        Return to sign in
      </Link>
    </form>
  );
}