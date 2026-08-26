"use client";

import {
  Eye,
  EyeOff,
  Loader2,
  ShieldAlert,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

type SensitiveField =
  | "ssn"
  | "drivers_license"
  | "tin"
  | "foreign_tin";

type RevealSensitiveValueProps = {
  userId: string;

  field:
    SensitiveField;

  maskedValue: string;

  label: string;
};

export function RevealSensitiveValue({
  userId,
  field,
  maskedValue,
  label,
}: RevealSensitiveValueProps) {
  const [
    value,
    setValue,
  ] =
    useState<string | null>(
      null,
    );

  const [
    visible,
    setVisible,
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

  /*
   * Automatically clear sensitive
   * plaintext after 60 seconds.
   */
  useEffect(() => {
    if (
      !visible ||
      !value
    ) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          setVisible(
            false,
          );

          setValue(
            null,
          );
        },
        60_000,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [
    visible,
    value,
  ]);

  /*
   * Hide AND remove plaintext
   * from React state.
   */
  function hideValue() {
    setVisible(
      false,
    );

    setValue(
      null,
    );

    setError(
      null,
    );
  }

  async function reveal() {
    setError(
      null,
    );

    setLoading(
      true,
    );

    try {
      const response =
        await fetch(
          `/api/admin/compliance/${userId}/sensitive`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                field,
              }),
          },
        );

      const result =
        (await response.json()) as {
          success?: boolean;

          value?: string;

          error?: string;
        };

      if (!response.ok) {
        setError(
          result.error ??
            "Unable to reveal sensitive information.",
        );

        return;
      }

      if (!result.value) {
        setError(
          "Sensitive value was not returned.",
        );

        return;
      }

      setValue(
        result.value,
      );

      setVisible(
        true,
      );
    } catch (
      requestError
    ) {
      console.error(
        "Sensitive reveal request error:",
        requestError,
      );

      setError(
        "Unable to reveal sensitive information.",
      );
    } finally {
      setLoading(
        false,
      );
    }
  }

  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <p className="font-mono text-sm font-semibold text-forest-950">
          {visible &&
          value
            ? value
            : maskedValue}
        </p>

        <button
          type="button"
          disabled={
            loading
          }
          onClick={
            visible
              ? hideValue
              : reveal
          }
          className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-lg border border-forest-900/10 bg-ivory-50 px-3 text-xs font-semibold text-forest-950 transition hover:border-forest-900/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />

              Loading...
            </>
          ) : visible ? (
            <>
              <EyeOff className="size-3.5" />

              Hide
            </>
          ) : (
            <>
              <Eye className="size-3.5" />

              Reveal
            </>
          )}
        </button>
      </div>

      {visible ? (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-amber-700" />

          <div>
            <p className="text-[0.65rem] font-semibold text-amber-900">
              Sensitive information visible
            </p>

            <p className="mt-1 text-[0.65rem] leading-5 text-amber-800">
              This value will automatically be hidden
              and removed from the browser state after
              60 seconds.
            </p>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-2 text-xs leading-5 text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}