"use client";

import {
  type FormEvent,
  useMemo,
  useState,
} from "react";

import {
  CircleCheck,
  Loader2,
  Plus,
  ShieldCheck,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

type AdminFundCashAccountFormProps = {
  investorId: string;
  investorName: string;
};

type ApiResponse = {
  success?: boolean;
  error?: string;
  availableBalanceCents?: number | null;
};

function createIdempotencyKey(
  investorId: string,
) {
  return `admin-cash-funding:${investorId}:${crypto.randomUUID()}`;
}

export function AdminFundCashAccountForm({
  investorId,
  investorName,
}: AdminFundCashAccountFormProps) {
  const router =
    useRouter();

  const [amount, setAmount] =
    useState("");

  const [
    reference,
    setReference,
  ] =
    useState("");

  const [
    description,
    setDescription,
  ] =
    useState("");

  const [
    idempotencyKey,
    setIdempotencyKey,
  ] =
    useState(() =>
      createIdempotencyKey(
        investorId,
      ),
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
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  const formattedPreview =
    useMemo(
      () => {
        const parsed =
          Number(
            amount.replace(
              /,/g,
              "",
            ),
          );

        if (
          !Number.isFinite(
            parsed,
          ) ||
          parsed <=
            0
        ) {
          return "$0.00";
        }

        return new Intl.NumberFormat(
          "en-US",
          {
            style:
              "currency",
            currency:
              "USD",
          },
        ).format(
          parsed,
        );
      },
      [
        amount,
      ],
    );

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(
      true,
    );
    setError(
      "",
    );
    setSuccess(
      "",
    );

    try {
      const response =
        await fetch(
          "/api/admin/cash-account/fund",
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify(
                {
                  investorId,
                  amount,
                  reference,
                  description,
                  idempotencyKey,
                },
              ),
          },
        );

      const data =
        (await response.json()) as ApiResponse;

      if (
        !response.ok ||
        !data.success
      ) {
        setError(
          data.error ||
            "Unable to fund this account.",
        );
        return;
      }

      setSuccess(
        `${formattedPreview} was credited to ${investorName}'s Tevuah Cash Account.`,
      );

      setAmount(
        "",
      );
      setReference(
        "",
      );
      setDescription(
        "",
      );

      setIdempotencyKey(
        createIdempotencyKey(
          investorId,
        ),
      );

      router.refresh();
    } catch (requestError) {
      console.error(
        "Funding request error:",
        requestError,
      );

      setError(
        "Unable to complete the funding request.",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="rounded-4xl border border-forest-900/10 bg-white p-6 shadow-sm sm:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold-700">
            Admin funding
          </p>

          <h2 className="mt-2 font-display text-2xl font-semibold text-forest-950">
            Fund Cash Account
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-stone-500">
            Credit verified funds to this investor. The transaction is written
            to the immutable cash ledger and cannot be silently edited later.
          </p>
        </div>

        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest-950 text-gold-400">
          <Plus className="size-5" />
        </div>
      </div>

      <div className="mt-7 grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-forest-950">
            Amount
          </span>

          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-semibold text-stone-400">
              $
            </span>

            <input
              type="text"
              inputMode="decimal"
              value={
                amount
              }
              onChange={(
                event,
              ) =>
                setAmount(
                  event.target.value,
                )
              }
              placeholder="50,000.00"
              autoComplete="off"
              required
              className="focus-ring min-h-12 w-full rounded-2xl border border-forest-900/10 bg-ivory-50 pl-8 pr-4 text-sm font-semibold text-forest-950 outline-none transition placeholder:font-normal placeholder:text-stone-400"
            />
          </div>

          <span className="text-xs text-stone-400">
            Funding preview:{" "}
            <strong className="font-semibold text-forest-900">
              {formattedPreview}
            </strong>
          </span>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-forest-950">
            Funding reference
          </span>

          <input
            type="text"
            value={
              reference
            }
            onChange={(
              event,
            ) =>
              setReference(
                event.target.value,
              )
            }
            placeholder="WIRE-20260904-001"
            required
            maxLength={
              160
            }
            className="focus-ring min-h-12 w-full rounded-2xl border border-forest-900/10 bg-ivory-50 px-4 text-sm text-forest-950 outline-none transition placeholder:text-stone-400"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-forest-950">
            Description / reason
          </span>

          <textarea
            value={
              description
            }
            onChange={(
              event,
            ) =>
              setDescription(
                event.target.value,
              )
            }
            placeholder="Incoming investor wire verified."
            required
            maxLength={
              500
            }
            rows={
              4
            }
            className="focus-ring w-full resize-none rounded-2xl border border-forest-900/10 bg-ivory-50 px-4 py-3 text-sm leading-6 text-forest-950 outline-none transition placeholder:text-stone-400"
          />
        </label>
      </div>

      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 size-4.5 shrink-0 text-amber-700" />

          <p className="text-xs leading-5 text-amber-900">
            Confirm the incoming funds independently before crediting this
            account. If a posted credit is wrong, use a reversal rather than
            editing or deleting its ledger entry.
          </p>
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-5 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          <CircleCheck className="mt-0.5 size-4.5 shrink-0" />
          <span>
            {success}
          </span>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={
          submitting
        }
        className="focus-ring mt-6 inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition hover:bg-forest-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Funding account...
          </>
        ) : (
          <>
            <Plus className="size-4" />
            Confirm funding
          </>
        )}
      </button>
    </form>
  );
}
