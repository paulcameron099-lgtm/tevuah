"use client";

import Link from "next/link";
import {
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import {
  useRouter,
} from "next/navigation";
import { useState } from "react";

import { createClient } from "@/src/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    if (password.length < 8) {
      setError(
        "Your new password must be at least 8 characters.",
      );

      return;
    }

    if (password !== confirmPassword) {
      setError(
        "The passwords you entered do not match.",
      );

      return;
    }

    setLoading(true);

    const {
      error: updateError,
    } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    window.setTimeout(() => {
      router.replace("/dashboard");
      router.refresh();
    }, 1200);
  }

  if (success) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
        <span className="flex size-11 items-center justify-center rounded-full bg-emerald-700 text-white">
          <ShieldCheck className="size-5" />
        </span>

        <h2 className="font-display mt-5 text-2xl font-semibold text-forest-950">
          Password updated.
        </h2>

        <p className="mt-3 text-sm leading-7 text-stone-700">
          Your password has been changed successfully.
          You’re being redirected to your investor dashboard.
        </p>
      </div>
    );
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

      <PasswordField
        label="New password"
        value={password}
        showPassword={showPassword}
        onChange={setPassword}
        onToggle={() =>
          setShowPassword(
            (current) => !current,
          )
        }
      />

      <PasswordField
        label="Confirm new password"
        value={confirmPassword}
        showPassword={showPassword}
        onChange={setConfirmPassword}
        onToggle={() =>
          setShowPassword(
            (current) => !current,
          )
        }
      />

      <div className="rounded-xl border border-forest-900/10 bg-ivory-100 p-4">
        <p className="text-xs leading-6 text-stone-600">
          Use at least 8 characters. A longer,
          unique password is strongly recommended.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Updating password...
          </>
        ) : (
          "Update password"
        )}
      </button>

      <Link
        href="/login"
        className="focus-ring mx-auto block w-fit rounded-md text-sm font-semibold text-forest-950 underline-offset-4 hover:underline"
      >
        Return to sign in
      </Link>
    </form>
  );
}

type PasswordFieldProps = {
  label: string;
  value: string;
  showPassword: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
};

function PasswordField({
  label,
  value,
  showPassword,
  onChange,
  onToggle,
}: PasswordFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">
        {label}
      </span>

      <div className="relative">
        <input
          type={
            showPassword
              ? "text"
              : "password"
          }
          required
          autoComplete="new-password"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="focus-ring min-h-13 w-full rounded-xl border border-forest-900/10 bg-white px-4 pr-12 text-sm text-forest-950 outline-none"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={
            showPassword
              ? "Hide password"
              : "Show password"
          }
          className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-stone-500 transition hover:bg-ivory-100 hover:text-forest-950"
        >
          {showPassword ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      </div>
    </label>
  );
}