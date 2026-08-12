"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Mail,
} from "lucide-react";
import { useState } from "react";

import { createClient } from "@/src/lib/supabase/client";

export function ForgotPasswordForm() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState<string | null>(null);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setMessage(null);
    setLoading(true);

    const redirectTo =
      `${window.location.origin}` +
      "/auth/callback?next=/reset-password";

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo,
        },
      );

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "If an account exists for this email address, password reset instructions have been sent.",
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
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-800">
          {message}
        </div>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">
          Email address
        </span>

        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />

          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="you@example.com"
            className="focus-ring min-h-13 w-full rounded-xl border border-forest-900/10 bg-white py-3 pl-11 pr-4 text-sm text-forest-950 outline-none placeholder:text-stone-400"
          />
        </div>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Sending instructions...
          </>
        ) : (
          "Send reset instructions"
        )}
      </button>

      <Link
        href="/login"
        className="focus-ring mx-auto flex w-fit items-center gap-2 rounded-md text-sm font-semibold text-forest-950 transition hover:text-olive-700"
      >
        <ArrowLeft className="size-4" />
        Back to sign in
      </Link>
    </form>
  );
}