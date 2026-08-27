"use client";

import {
  AlertCircle,
  CheckCircle2,
  HandCoins,
  Loader2,
  Send,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

type Allocation = {
  id: string;

  investorName: string;

  investorEmail:
    | string
    | null;

  grossAmount: number;

  withholdingAmount: number;

  netAmount: number;

  status: string;

  paymentReference:
    | string
    | null;

  paidAt:
    | string
    | null;
};

type Props = {
  distributionId: string;

  distributionStatus:
    string;

  allocations:
    Allocation[];
};

export function DistributionPaymentActions({
  distributionId,
  distributionStatus,
  allocations,
}: Props) {
  const router =
    useRouter();

  const [
    loadingAction,
    setLoadingAction,
  ] =
    useState<
      string | null
    >(null);

  const [
    references,
    setReferences,
  ] =
    useState<
      Record<
        string,
        string
      >
    >(
      Object.fromEntries(
        allocations.map(
          (
            allocation,
          ) => [
            allocation.id,
            allocation.paymentReference ??
              "",
          ],
        ),
      ),
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const [
    success,
    setSuccess,
  ] =
    useState<
      string | null
    >(null);

  const paidCount =
    allocations.filter(
      (allocation) =>
        allocation.status ===
        "paid",
    ).length;

  const totalNet =
    allocations.reduce(
      (
        total,
        allocation,
      ) =>
        total +
        allocation.netAmount,
      0,
    );

  const paidNet =
    allocations
      .filter(
        (allocation) =>
          allocation.status ===
          "paid",
      )
      .reduce(
        (
          total,
          allocation,
        ) =>
          total +
          allocation.netAmount,
        0,
      );

  /*
   * ==================================================
   * START PROCESSING
   * ==================================================
   */
  async function startProcessing() {
    setError(null);
    setSuccess(null);

    setLoadingAction(
      "start",
    );

    try {
      const response =
        await fetch(
          "/api/admin/distribution-payment",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                action:
                  "start_processing",

                distributionId,
              }),
          },
        );

      const result =
        (await response.json()) as {
          error?: string;
        };

      if (!response.ok) {
        setError(
          result.error ??
            "Unable to start payment processing.",
        );

        return;
      }

      setSuccess(
        "Distribution payment processing started.",
      );

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "Start distribution processing request error:",
        requestError,
      );

      setError(
        "Unable to start payment processing.",
      );
    } finally {
      setLoadingAction(
        null,
      );
    }
  }

  /*
   * ==================================================
   * MARK ONE INVESTOR PAID
   * ==================================================
   */
  async function markPaid(
    allocationId: string,
  ) {
    setError(null);
    setSuccess(null);

    const paymentReference =
      references[
        allocationId
      ]?.trim();

    if (!paymentReference) {
      setError(
        "Enter the payment reference before marking this investor as paid.",
      );

      return;
    }

    setLoadingAction(
      allocationId,
    );

    try {
      const response =
        await fetch(
          "/api/admin/distribution-payment",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                action:
                  "mark_paid",

                investorDistributionId:
                  allocationId,

                paymentReference,
              }),
          },
        );

      const result =
        (await response.json()) as {
          error?: string;
        };

      if (!response.ok) {
        setError(
          result.error ??
            "Unable to mark investor distribution as paid.",
        );

        return;
      }

      setSuccess(
        "Investor distribution marked as paid.",
      );

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "Mark distribution paid request error:",
        requestError,
      );

      setError(
        "Unable to mark investor distribution as paid.",
      );
    } finally {
      setLoadingAction(
        null,
      );
    }
  }

  return (
    <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <HandCoins className="size-5 text-gold-600" />

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
            Payment operations
          </p>

          <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
            Distribution Payments
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
            Record the actual payment reference for
            each investor only after the transfer has
            been completed.
          </p>
        </div>

        <DistributionStatusBadge
          status={
            distributionStatus
          }
        />
      </div>

      {/* SUMMARY */}

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <PaymentSummary
          label="Payments completed"
          value={`${paidCount}/${allocations.length}`}
        />

        <PaymentSummary
          label="Net payable"
          value={formatMoney(
            totalNet,
          )}
        />

        <PaymentSummary
          label="Net paid"
          value={formatMoney(
            paidNet,
          )}
        />
      </div>

      {error ? (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-700" />

          <p className="text-sm leading-6 text-red-700">
            {error}
          </p>
        </div>
      ) : null}

      {success ? (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />

          <p className="text-sm leading-6 text-emerald-700">
            {success}
          </p>
        </div>
      ) : null}

      {/* APPROVED → PROCESSING */}

      {distributionStatus ===
      "approved" ? (
        <div className="mt-7 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-sm font-semibold text-blue-950">
            Allocations are approved but payment
            processing has not started.
          </p>

          <p className="mt-2 text-xs leading-6 text-blue-800">
            Starting processing will move all approved
            investor allocations to processing. This
            still does not mark anyone as paid.
          </p>

          <button
            type="button"
            disabled={
              loadingAction !==
              null
            }
            onClick={
              startProcessing
            }
            className="focus-ring mt-5 inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-blue-900 px-5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingAction ===
            "start" ? (
              <>
                <Loader2 className="size-4 animate-spin" />

                Starting...
              </>
            ) : (
              <>
                <Send className="size-4" />

                Start payment processing
              </>
            )}
          </button>
        </div>
      ) : null}

      {/* ALLOCATION PAYMENTS */}

      {distributionStatus ===
        "processing" ||
      distributionStatus ===
        "paid" ? (
        <div className="mt-7 space-y-4">
          {allocations.map(
            (
              allocation,
            ) => {
              const isPaid =
                allocation.status ===
                "paid";

              return (
                <div
                  key={
                    allocation.id
                  }
                  className="rounded-[1.25rem] border border-forest-900/10 bg-ivory-50 p-5"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-forest-950">
                          {
                            allocation.investorName
                          }
                        </p>

                        <AllocationStatusBadge
                          status={
                            allocation.status
                          }
                        />
                      </div>

                      {allocation.investorEmail ? (
                        <p className="mt-1 text-xs text-stone-400">
                          {
                            allocation.investorEmail
                          }
                        </p>
                      ) : null}

                      <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        <MiniData
                          label="Gross"
                          value={formatMoney(
                            allocation.grossAmount,
                          )}
                        />

                        <MiniData
                          label="Withholding"
                          value={formatMoney(
                            allocation.withholdingAmount,
                          )}
                        />

                        <MiniData
                          label="Net payment"
                          value={formatMoney(
                            allocation.netAmount,
                          )}
                        />
                      </div>

                      {isPaid &&
                      allocation.paidAt ? (
                        <p className="mt-4 text-xs text-emerald-700">
                          Paid{" "}
                          {formatDateTime(
                            allocation.paidAt,
                          )}
                        </p>
                      ) : null}
                    </div>

                    {isPaid ? (
                      <div className="shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 p-4 lg:min-w-64">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-emerald-700">
                          Payment reference
                        </p>

                        <p className="mt-2 break-all text-sm font-semibold text-emerald-950">
                          {allocation.paymentReference ??
                            "—"}
                        </p>
                      </div>
                    ) : (
                      <div className="w-full shrink-0 lg:w-80">
                        <label className="block">
                          <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-stone-500">
                            Payment reference
                          </span>

                          <input
                            type="text"
                            value={
                              references[
                                allocation.id
                              ] ??
                              ""
                            }
                            onChange={(
                              event,
                            ) =>
                              setReferences(
                                (
                                  current,
                                ) => ({
                                  ...current,

                                  [allocation.id]:
                                    event.target.value,
                                }),
                              )
                            }
                            placeholder="Bank / ACH / wire reference"
                            className="focus-ring mt-2 min-h-11 w-full rounded-xl border border-forest-900/10 bg-white px-4 text-sm text-forest-950 outline-none"
                          />
                        </label>

                        <button
                          type="button"
                          disabled={
                            loadingAction !==
                            null
                          }
                          onClick={() =>
                            markPaid(
                              allocation.id,
                            )
                          }
                          className="focus-ring mt-3 flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-4 text-xs font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {loadingAction ===
                          allocation.id ? (
                            <>
                              <Loader2 className="size-4 animate-spin" />

                              Saving...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="size-4" />

                              Mark investor paid
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            },
          )}
        </div>
      ) : null}

      {distributionStatus ===
      "paid" ? (
        <div className="mt-7 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <CheckCircle2 className="size-5 text-emerald-700" />

          <p className="mt-3 text-sm font-semibold text-emerald-950">
            Distribution fully paid.
          </p>

          <p className="mt-2 text-xs leading-6 text-emerald-800">
            Every investor allocation has a completed
            payment record.
          </p>
        </div>
      ) : null}
    </section>
  );
}

function PaymentSummary({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="rounded-xl bg-ivory-50 p-4">
      <p className="text-xs text-stone-500">
        {label}
      </p>

      <p className="font-display mt-1 text-2xl font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

function MiniData({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div>
      <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-stone-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

function DistributionStatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-blue-700">
      {humanize(
        status,
      )}
    </span>
  );
}

function AllocationStatusBadge({
  status,
}: {
  status: string;
}) {
  const paid =
    status ===
    "paid";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-widest ${
        paid
          ? "bg-emerald-50 text-emerald-700"
          : "bg-blue-50 text-blue-700"
      }`}
    >
      {humanize(
        status,
      )}
    </span>
  );
}

function humanize(
  value: string,
) {
  return value
    .replaceAll(
      "_",
      " ",
    )
    .replace(
      /\b\w/g,
      (
        letter,
      ) =>
        letter.toUpperCase(),
    );
}

function formatMoney(
  cents: number,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style:
        "currency",

      currency:
        "USD",

      maximumFractionDigits:
        2,
    },
  ).format(
    cents / 100,
  );
}

function formatDateTime(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      year:
        "numeric",

      month:
        "short",

      day:
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