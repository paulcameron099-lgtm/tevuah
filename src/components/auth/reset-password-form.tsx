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

import {
  useState,
} from "react";

type ResetPasswordFormProps = {
  mode?: "create" | "reset";
};

export function ResetPasswordForm({
  mode = "reset",
}: ResetPasswordFormProps) {
  const router =
    useRouter();

  const isCreateMode =
    mode === "create";

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);

  const [
    loading,
    setLoading,
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
    useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(
      null,
    );

    if (
      password.length <
      8
    ) {
      setError(
        "Your password must be at least 8 characters.",
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "The passwords you entered do not match.",
      );

      return;
    }

    setLoading(
      true,
    );

    try {
      const response =
        await fetch(
          "/api/auth/set-password",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "same-origin",

            body:
              JSON.stringify({
                password,
                confirmPassword,
              }),
          },
        );

      const result =
        (await response.json()) as {
          success?: boolean;
          email?: string | null;
          error?: string;
        };

      if (
        !response.ok ||
        !result.success
      ) {
        setError(
          result.error ??
            "Unable to save your password.",
        );

        return;
      }

      setSuccess(
        true,
      );

      /*
       * The hardened server route:
       *
       * 1. verifies the activation identity
       * 2. changes the password
       * 3. destroys the activation authorization
       * 4. locally signs out the temporary activation session
       *
       * The user must then prove the new credential
       * through the normal login screen.
       */
      window.setTimeout(
        () => {
          router.replace(
            isCreateMode
              ? "/login?account=activated"
              : "/login?password=updated",
          );

          router.refresh();
        },
        1200,
      );
    } catch {
      setError(
        "Unable to save your password. Please try again.",
      );
    } finally {
      setLoading(
        false,
      );
    }
  }

  if (
    success
  ) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
        <span className="flex size-11 items-center justify-center rounded-full bg-emerald-700 text-white">
          <ShieldCheck className="size-5" />
        </span>

        <h2 className="font-display mt-5 text-2xl font-semibold text-forest-950">
          {isCreateMode
            ? "Account activated."
            : "Password updated."}
        </h2>

        <p className="mt-3 text-sm leading-7 text-stone-700">
          {isCreateMode
            ? "Your Tevuah Reserve investor account password has been created successfully. You’re being redirected to sign in."
            : "Your Tevuah Reserve password has been updated successfully. You’re being redirected to sign in."}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-6"
    >
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          {error}
        </div>
      ) : null}

      {isCreateMode ? (
        <div className="rounded-xl border border-forest-900/10 bg-ivory-100 p-4">
          <p className="text-sm leading-6 text-stone-700">
            Your invitation has been verified.
            Create a secure password to activate
            your investor account.
          </p>
        </div>
      ) : null}

      <PasswordField
        label={
          isCreateMode
            ? "Create password"
            : "New password"
        }
        value={
          password
        }
        showPassword={
          showPassword
        }
        onChange={
          setPassword
        }
        onToggle={() =>
          setShowPassword(
            (
              current,
            ) =>
              !current,
          )
        }
      />

      <PasswordField
        label={
          isCreateMode
            ? "Confirm password"
            : "Confirm new password"
        }
        value={
          confirmPassword
        }
        showPassword={
          showPassword
        }
        onChange={
          setConfirmPassword
        }
        onToggle={() =>
          setShowPassword(
            (
              current,
            ) =>
              !current,
          )
        }
      />

      <div className="rounded-xl border border-forest-900/10 bg-ivory-100 p-4">
        <p className="text-xs leading-6 text-stone-600">
          Use at least 8 characters.
          A longer, unique password is strongly recommended.
        </p>
      </div>

      <button
        type="submit"
        disabled={
          loading
        }
        className="flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />

            {isCreateMode
              ? "Creating password..."
              : "Updating password..."}
          </>
        ) : isCreateMode ? (
          "Create password"
        ) : (
          "Reset password"
        )}
      </button>

      <Link
        href="/login"
        className="focus-ring mx-auto block w-fit cursor-pointer rounded-md text-sm font-semibold text-forest-950 underline-offset-4 hover:underline"
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

  onChange: (
    value: string,
  ) => void;

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
          value={
            value
          }
          onChange={(
            event,
          ) =>
            onChange(
              event.target.value,
            )
          }
          className="focus-ring min-h-13 w-full rounded-xl border border-forest-900/10 bg-white px-4 pr-12 text-sm text-forest-950 outline-none"
        />

        <button
          type="button"
          onClick={
            onToggle
          }
          aria-label={
            showPassword
              ? "Hide password"
              : "Show password"
          }
          className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-stone-500 transition hover:bg-ivory-100 hover:text-forest-950"
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