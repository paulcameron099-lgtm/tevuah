"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock3,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  formatCashMoney,
} from "@/src/lib/cash-account/cash-money";

type WithdrawalStatus =
  | "submitted"
  | "under_review"
  | "processing"
  | "paid"
  | "rejected"
  | "cancelled";

type Withdrawal = {
  id: string;

  amount_cents: number;

  currency: string;

  withdrawal_method:
    string;

  bank_name:
    | string
    | null;

  account_holder_name:
    | string
    | null;

  masked_account_number:
    | string
    | null;

  investor_note:
    | string
    | null;

  status:
    WithdrawalStatus;

  rejection_reason:
    | string
    | null;

  payment_reference:
    | string
    | null;

  payment_note:
    | string
    | null;

  reviewed_at:
    | string
    | null;

  approved_at:
    | string
    | null;

  paid_at:
    | string
    | null;

  cancelled_at:
    | string
    | null;

  created_at: string;

  updated_at: string;
};

type CashAccountWithdrawalCenterProps = {
  availableBalanceCents: number;

  currency: string;

  initialWithdrawals:
    Withdrawal[];
};

type FormState = {
  amount: string;

  bankName: string;

  accountHolderName: string;

  accountNumber: string;

  routingNumber: string;

  swiftCode: string;

  iban: string;

  bankAddress: string;

  investorNote: string;
};

const initialFormState: FormState = {
  amount: "",
  bankName: "",
  accountHolderName: "",
  accountNumber: "",
  routingNumber: "",
  swiftCode: "",
  iban: "",
  bankAddress: "",
  investorNote: "",
};

function formatDate(
  value:
    | string
    | null,
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month:
        "short",

      day:
        "numeric",

      year:
        "numeric",

      hour:
        "numeric",

      minute:
        "2-digit",
    },
  ).format(
    new Date(
      value,
    ),
  );
}

function parseDisplayAmountToCents(
  value: string,
) {
  const normalized =
    value
      .trim()
      .replace(
        /,/g,
        "",
      );

  if (
    !/^\d+(?:\.\d{1,2})?$/.test(
      normalized,
    )
  ) {
    return null;
  }

  const [
    dollars,
    cents = "",
  ] =
    normalized.split(
      ".",
    );

  const total =
    Number(
      dollars,
    ) *
      100 +
    Number(
      cents.padEnd(
        2,
        "0",
      ),
    );

  return Number.isSafeInteger(
    total,
  )
    ? total
    : null;
}

function getStatusPresentation(
  status:
    WithdrawalStatus,
) {
  switch (status) {
    case "submitted":
      return {
        label:
          "Submitted",

        className:
          "border-amber-200 bg-amber-50 text-amber-800",

        icon:
          Clock3,
      };

    case "under_review":
      return {
        label:
          "Under review",

        className:
          "border-blue-200 bg-blue-50 text-blue-800",

        icon:
          Clock3,
      };

    case "processing":
      return {
        label:
          "Processing",

        className:
          "border-violet-200 bg-violet-50 text-violet-800",

        icon:
          Loader2,
      };

    case "paid":
      return {
        label:
          "Paid",

        className:
          "border-emerald-200 bg-emerald-50 text-emerald-800",

        icon:
          CheckCircle2,
      };

    case "rejected":
      return {
        label:
          "Not approved",

        className:
          "border-red-200 bg-red-50 text-red-700",

        icon:
          XCircle,
      };

    case "cancelled":
      return {
        label:
          "Cancelled",

        className:
          "border-stone-200 bg-stone-50 text-stone-600",

        icon:
          XCircle,
      };
  }
}

export function CashAccountWithdrawalCenter({
  availableBalanceCents,
  currency,
  initialWithdrawals,
}: CashAccountWithdrawalCenterProps) {
  const router =
    useRouter();

  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      initialFormState,
    );

  const [
    withdrawals,
    setWithdrawals,
  ] =
    useState<
      Withdrawal[]
    >(
      initialWithdrawals,
    );

  const [
    isFormOpen,
    setIsFormOpen,
  ] =
    useState(
      false,
    );

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(
      false,
    );

  const [
    cancellingId,
    setCancellingId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    success,
    setSuccess,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const enteredAmountCents =
    useMemo(
      () =>
        parseDisplayAmountToCents(
          form.amount,
        ),
      [
        form.amount,
      ],
    );

  const exceedsBalance =
    enteredAmountCents !==
      null &&
    enteredAmountCents >
      availableBalanceCents;

  function updateField(
    field:
      keyof FormState,
    value: string,
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]:
          value,
      }),
    );
  }

  async function submitWithdrawal(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      isSubmitting
    ) {
      return;
    }

    setError(
      null,
    );

    setSuccess(
      null,
    );

    if (
      enteredAmountCents ===
        null ||
      enteredAmountCents <=
        0
    ) {
      setError(
        "Enter a valid withdrawal amount.",
      );

      return;
    }

    if (
      enteredAmountCents >
      availableBalanceCents
    ) {
      setError(
        "The withdrawal amount exceeds your available balance.",
      );

      return;
    }

    if (
      !form.bankName.trim()
    ) {
      setError(
        "Bank name is required.",
      );

      return;
    }

    if (
      !form.accountHolderName.trim()
    ) {
      setError(
        "Account holder name is required.",
      );

      return;
    }

    if (
      !form.accountNumber.trim()
    ) {
      setError(
        "Account number is required.",
      );

      return;
    }

    setIsSubmitting(
      true,
    );

    try {
      const response =
        await fetch(
          "/api/cash-account/withdrawals",
          {
            method:
              "POST",

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

      const payload =
        (await response.json()) as {
          success?:
            boolean;

          withdrawal?:
            Withdrawal;

          error?:
            string;
        };

      if (
        !response.ok ||
        !payload.success ||
        !payload.withdrawal
      ) {
        throw new Error(
          payload.error ||
            "Unable to submit withdrawal request.",
        );
      }

      setWithdrawals(
        (current) => [
          payload.withdrawal as Withdrawal,
          ...current,
        ],
      );

      setForm(
        initialFormState,
      );

      setIsFormOpen(
        false,
      );

      setSuccess(
        "Your withdrawal request was submitted for review.",
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to submit withdrawal request.",
      );
    } finally {
      setIsSubmitting(
        false,
      );
    }
  }

  async function cancelWithdrawal(
    withdrawalId:
      string,
  ) {
    if (
      cancellingId
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Cancel this withdrawal request?",
      );

    if (!confirmed) {
      return;
    }

    setError(
      null,
    );

    setSuccess(
      null,
    );

    setCancellingId(
      withdrawalId,
    );

    try {
      const response =
        await fetch(
          `/api/cash-account/withdrawals/${withdrawalId}/cancel`,
          {
            method:
              "POST",
          },
        );

      const payload =
        (await response.json()) as {
          success?:
            boolean;

          status?:
            string;

          error?:
            string;
        };

      if (
        !response.ok ||
        !payload.success
      ) {
        throw new Error(
          payload.error ||
            "Unable to cancel withdrawal.",
        );
      }

      setWithdrawals(
        (current) =>
          current.map(
            (
              withdrawal,
            ) =>
              withdrawal.id ===
              withdrawalId
                ? {
                    ...withdrawal,
                    status:
                      "cancelled",
                    cancelled_at:
                      new Date().toISOString(),
                  }
                : withdrawal,
          ),
      );

      setSuccess(
        "Withdrawal request cancelled.",
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to cancel withdrawal.",
      );
    } finally {
      setCancellingId(
        null,
      );
    }
  }

  return (
    <section className="overflow-hidden rounded-4xl border border-forest-900/10 bg-white">
      <div className="flex flex-col gap-5 border-b border-forest-900/10 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <div className="flex items-center gap-2 text-forest-950">
            <ArrowUpRight className="size-4.5" />

            <h2 className="font-display text-xl font-semibold">
              Withdraw funds
            </h2>
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
            Request a withdrawal from your available Tevuah Cash balance.
            Withdrawals are reviewed before funds are released.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError(
              null,
            );

            setSuccess(
              null,
            );

            setIsFormOpen(
              (current) =>
                !current,
            );
          }}
          disabled={
            availableBalanceCents <=
            0
          }
          className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowUpRight className="size-4" />

          {isFormOpen
            ? "Close"
            : "Request withdrawal"}
        </button>
      </div>

      <div className="p-6 sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-ivory-100 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
              Available to withdraw
            </p>

            <p className="mt-2 font-display text-2xl font-semibold text-forest-950">
              {formatCashMoney(
                availableBalanceCents,
                currency,
              )}
            </p>
          </div>

          <div className="rounded-3xl border border-forest-900/10 p-5">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <ShieldCheck className="size-4" />
              </div>

              <div>
                <p className="text-sm font-semibold text-forest-950">
                  Review before release
                </p>

                <p className="mt-1 text-xs leading-5 text-stone-500">
                  Submitting a request does not immediately debit your
                  Cash Account. Funds are debited only after approval.
                </p>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />

            <p>
              {error}
            </p>
          </div>
        ) : null}

        {success ? (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />

            <p>
              {success}
            </p>
          </div>
        ) : null}

        {isFormOpen ? (
          <form
            onSubmit={
              submitWithdrawal
            }
            className="mt-6 rounded-3xl border border-forest-900/10 bg-ivory-50 p-5 sm:p-6"
          >
            <div className="border-b border-forest-900/10 pb-5">
              <p className="font-display text-lg font-semibold text-forest-950">
                Withdrawal details
              </p>

              <p className="mt-1 text-xs leading-5 text-stone-500">
                Enter the bank account that should receive this withdrawal.
              </p>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="text-xs font-semibold text-forest-950">
                  Amount (USD)
                </span>

                <div className="mt-2 flex min-h-12 items-center rounded-2xl border border-forest-900/10 bg-white px-4 focus-within:border-forest-900/30">
                  <span className="mr-2 text-sm font-semibold text-stone-400">
                    $
                  </span>

                  <input
                    type="text"
                    inputMode="decimal"
                    value={
                      form.amount
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "amount",
                        event.target.value,
                      )
                    }
                    placeholder="0.00"
                    className="min-w-0 flex-1 bg-transparent py-3 text-sm font-semibold text-forest-950 outline-none placeholder:text-stone-300"
                  />
                </div>

                {exceedsBalance ? (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    Amount exceeds your available balance.
                  </p>
                ) : null}
              </label>

              <label>
                <span className="text-xs font-semibold text-forest-950">
                  Bank name
                </span>

                <input
                  type="text"
                  autoComplete="organization"
                  value={
                    form.bankName
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "bankName",
                      event.target.value,
                    )
                  }
                  placeholder="Bank name"
                  className="focus-ring mt-2 min-h-12 w-full rounded-2xl border border-forest-900/10 bg-white px-4 text-sm text-forest-950 outline-none placeholder:text-stone-300"
                />
              </label>

              <label>
                <span className="text-xs font-semibold text-forest-950">
                  Account holder name
                </span>

                <input
                  type="text"
                  autoComplete="name"
                  value={
                    form.accountHolderName
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "accountHolderName",
                      event.target.value,
                    )
                  }
                  placeholder="Name on account"
                  className="focus-ring mt-2 min-h-12 w-full rounded-2xl border border-forest-900/10 bg-white px-4 text-sm text-forest-950 outline-none placeholder:text-stone-300"
                />
              </label>

              <label>
                <span className="text-xs font-semibold text-forest-950">
                  Account number
                </span>

                <input
                  type="text"
                  autoComplete="off"
                  value={
                    form.accountNumber
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "accountNumber",
                      event.target.value,
                    )
                  }
                  placeholder="Account number"
                  className="focus-ring mt-2 min-h-12 w-full rounded-2xl border border-forest-900/10 bg-white px-4 text-sm text-forest-950 outline-none placeholder:text-stone-300"
                />
              </label>

              <label>
                <span className="text-xs font-semibold text-forest-950">
                  Routing number
                </span>

                <input
                  type="text"
                  autoComplete="off"
                  value={
                    form.routingNumber
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "routingNumber",
                      event.target.value,
                    )
                  }
                  placeholder="Optional"
                  className="focus-ring mt-2 min-h-12 w-full rounded-2xl border border-forest-900/10 bg-white px-4 text-sm text-forest-950 outline-none placeholder:text-stone-300"
                />
              </label>

              <label>
                <span className="text-xs font-semibold text-forest-950">
                  SWIFT / BIC
                </span>

                <input
                  type="text"
                  autoComplete="off"
                  value={
                    form.swiftCode
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "swiftCode",
                      event.target.value,
                    )
                  }
                  placeholder="Optional"
                  className="focus-ring mt-2 min-h-12 w-full rounded-2xl border border-forest-900/10 bg-white px-4 text-sm uppercase text-forest-950 outline-none placeholder:normal-case placeholder:text-stone-300"
                />
              </label>

              <label>
                <span className="text-xs font-semibold text-forest-950">
                  IBAN
                </span>

                <input
                  type="text"
                  autoComplete="off"
                  value={
                    form.iban
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "iban",
                      event.target.value,
                    )
                  }
                  placeholder="Optional"
                  className="focus-ring mt-2 min-h-12 w-full rounded-2xl border border-forest-900/10 bg-white px-4 text-sm uppercase text-forest-950 outline-none placeholder:normal-case placeholder:text-stone-300"
                />
              </label>

              <label className="sm:col-span-2">
                <span className="text-xs font-semibold text-forest-950">
                  Bank address
                </span>

                <input
                  type="text"
                  value={
                    form.bankAddress
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "bankAddress",
                      event.target.value,
                    )
                  }
                  placeholder="Optional"
                  className="focus-ring mt-2 min-h-12 w-full rounded-2xl border border-forest-900/10 bg-white px-4 text-sm text-forest-950 outline-none placeholder:text-stone-300"
                />
              </label>

              <label className="sm:col-span-2">
                <span className="text-xs font-semibold text-forest-950">
                  Note
                </span>

                <textarea
                  rows={3}
                  value={
                    form.investorNote
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "investorNote",
                      event.target.value,
                    )
                  }
                  placeholder="Optional note for the Tevuah Reserve team"
                  className="focus-ring mt-2 w-full resize-none rounded-2xl border border-forest-900/10 bg-white px-4 py-3 text-sm text-forest-950 outline-none placeholder:text-stone-300"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-forest-900/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Building2 className="size-4" />

                Wire transfer withdrawal
              </div>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  exceedsBalance
                }
                className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-gold-500 px-6 text-sm font-semibold text-forest-950 transition hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    Submit withdrawal
                    <ArrowUpRight className="size-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : null}

        <div className="mt-8 border-t border-forest-900/10 pt-7">
          <div>
            <h3 className="font-display text-lg font-semibold text-forest-950">
              Withdrawal requests
            </h3>

            <p className="mt-1 text-xs leading-5 text-stone-500">
              Track submitted, processing and completed withdrawals.
            </p>
          </div>

          {withdrawals.length >
          0 ? (
            <div className="mt-5 space-y-3">
              {withdrawals.map(
                (
                  withdrawal,
                ) => {
                  const status =
                    getStatusPresentation(
                      withdrawal.status,
                    );

                  const StatusIcon =
                    status.icon;

                  return (
                    <article
                      key={
                        withdrawal.id
                      }
                      className="rounded-3xl border border-forest-900/10 p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-display text-xl font-semibold text-forest-950">
                            {formatCashMoney(
                              withdrawal.amount_cents,
                              withdrawal.currency,
                            )}
                          </p>

                          <p className="mt-1 text-xs text-stone-500">
                            {withdrawal.bank_name ||
                              "Bank account"}

                            {withdrawal.masked_account_number
                              ? ` • ${withdrawal.masked_account_number}`
                              : ""}
                          </p>
                        </div>

                        <span
                          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.className}`}
                        >
                          <StatusIcon
                            className={`size-3.5 ${
                              withdrawal.status ===
                              "processing"
                                ? "animate-spin"
                                : ""
                            }`}
                          />

                          {status.label}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 border-t border-forest-900/8 pt-4 text-xs sm:grid-cols-2">
                        <div>
                          <p className="text-stone-400">
                            Requested
                          </p>

                          <p className="mt-1 font-medium text-forest-950">
                            {formatDate(
                              withdrawal.created_at,
                            )}
                          </p>
                        </div>

                        {withdrawal.payment_reference ? (
                          <div>
                            <p className="text-stone-400">
                              Payment reference
                            </p>

                            <p className="mt-1 font-medium text-forest-950">
                              {
                                withdrawal.payment_reference
                              }
                            </p>
                          </div>
                        ) : null}
                      </div>

                      {withdrawal.rejection_reason ? (
                        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">
                          <p className="text-xs font-semibold text-red-700">
                            Review note
                          </p>

                          <p className="mt-1 text-xs leading-5 text-red-700/80">
                            {
                              withdrawal.rejection_reason
                            }
                          </p>
                        </div>
                      ) : null}

                      {withdrawal.status ===
                      "submitted" ? (
                        <div className="mt-4 flex justify-end border-t border-forest-900/8 pt-4">
                          <button
                            type="button"
                            disabled={
                              cancellingId ===
                              withdrawal.id
                            }
                            onClick={() =>
                              void cancelWithdrawal(
                                withdrawal.id,
                              )
                            }
                            className="focus-ring inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full border border-forest-900/10 px-4 text-xs font-semibold text-stone-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {cancellingId ===
                            withdrawal.id
                              ? "Cancelling…"
                              : "Cancel request"}
                          </button>
                        </div>
                      ) : null}
                    </article>
                  );
                },
              )}
            </div>
          ) : (
            <div className="mt-5 rounded-3xl border border-dashed border-forest-900/15 px-6 py-10 text-center">
              <ArrowUpRight className="mx-auto size-5 text-stone-300" />

              <p className="mt-3 text-sm font-semibold text-forest-950">
                No withdrawal requests
              </p>

              <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-stone-500">
                Withdrawal requests will appear here after you submit one.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}