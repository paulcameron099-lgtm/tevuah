"use client";

import Link from "next/link";

import {
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import {
  useRef,
  useState,
} from "react";

type ResetPasswordFormProps = {
  mode?: "create" | "reset";
};

export function ResetPasswordForm({
  mode = "reset",
}: ResetPasswordFormProps) {
  const isCreateMode =
    mode === "create";

  const passwordRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const confirmPasswordRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

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

  function togglePassword() {
    const input =
      passwordRef.current;

    if (!input) {
      return;
    }

    const nextVisible =
      input.type === "password";

    input.type =
      nextVisible
        ? "text"
        : "password";

    setShowPassword(
      nextVisible,
    );
  }

  function toggleConfirmPassword() {
    const input =
      confirmPasswordRef.current;

    if (!input) {
      return;
    }

    const nextVisible =
      input.type === "password";

    input.type =
      nextVisible
        ? "text"
        : "password";

    setShowConfirmPassword(
      nextVisible,
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError(
      null,
    );

    if (
      password.length < 8
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
              "include",

            cache:
              "no-store",

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
          purpose?:
            | "invite"
            | "recovery";
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

        setLoading(
          false,
        );

        return;
      }

      /*
       * AUTH REDIRECTION RULES
       *
       * Invite:
       * password created
       * -> authenticated investor dashboard
       *
       * Recovery:
       * password changed
       * -> normal sign-in page
       *
       * Use a hard browser navigation here.
       * Do not use router.replace() across this
       * authentication/session boundary.
       */
      if (
        result.purpose ===
          "invite" ||
        isCreateMode
      ) {
        window.location.replace(
          "/dashboard",
        );

        return;
      }

      window.location.replace(
        "/login?password=updated",
      );
    } catch (submitError) {
      console.error(
        "Password submission error:",
        submitError,
      );

      setError(
        "Unable to save your password. Please try again.",
      );

      setLoading(
        false,
      );
    }
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

      <div className="block">
        <label
          htmlFor="new-password"
          className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-600"
        >
          {isCreateMode
            ? "Create password"
            : "New password"}
        </label>

        <div className="relative">
          <input
            ref={
              passwordRef
            }
            id="new-password"
            name="new-password"
            type="password"
            required
            autoComplete="new-password"
            value={
              password
            }
            onChange={(
              event,
            ) =>
              setPassword(
                event.target.value,
              )
            }
            className="focus-ring min-h-13 w-full rounded-xl border border-forest-900/10 bg-white px-4 pr-14 text-sm text-forest-950 outline-none"
          />

          <button
            type="button"
            onClick={
              togglePassword
            }
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            aria-pressed={
              showPassword
            }
            className="absolute right-2 top-1/2 z-20 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-stone-500 transition hover:bg-ivory-100 hover:text-forest-950"
          >
            {showPassword ? (
              <EyeOff className="pointer-events-none size-5" />
            ) : (
              <Eye className="pointer-events-none size-5" />
            )}
          </button>
        </div>
      </div>

      <div className="block">
        <label
          htmlFor="confirm-new-password"
          className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-600"
        >
          {isCreateMode
            ? "Confirm password"
            : "Confirm new password"}
        </label>

        <div className="relative">
          <input
            ref={
              confirmPasswordRef
            }
            id="confirm-new-password"
            name="confirm-new-password"
            type="password"
            required
            autoComplete="new-password"
            value={
              confirmPassword
            }
            onChange={(
              event,
            ) =>
              setConfirmPassword(
                event.target.value,
              )
            }
            className="focus-ring min-h-13 w-full rounded-xl border border-forest-900/10 bg-white px-4 pr-14 text-sm text-forest-950 outline-none"
          />

          <button
            type="button"
            onClick={
              toggleConfirmPassword
            }
            aria-label={
              showConfirmPassword
                ? "Hide password"
                : "Show password"
            }
            aria-pressed={
              showConfirmPassword
            }
            className="absolute right-2 top-1/2 z-20 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-stone-500 transition hover:bg-ivory-100 hover:text-forest-950"
          >
            {showConfirmPassword ? (
              <EyeOff className="pointer-events-none size-5" />
            ) : (
              <Eye className="pointer-events-none size-5" />
            )}
          </button>
        </div>
      </div>

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