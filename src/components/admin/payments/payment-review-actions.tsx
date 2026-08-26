"use client";

import {
  CheckCircle2,
  CircleAlert,
  Loader2,
  XCircle,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

type Props = {
  paymentId: string;

  currentStatus: string;

  expectedAmount: number;

  reportedAmount:
    | number
    | null;

  remainingAllocation: number;

  proofAvailable: boolean;
};

type ReviewResponse = {
  success?: boolean;

  action?: string;

  error?: string;

  result?: unknown;
};

export function PaymentReviewActions({
  paymentId,
  currentStatus,
  expectedAmount,
  reportedAmount,
  remainingAllocation,
  proofAvailable,
}: Props) {
  const router =
    useRouter();

  /*
   * IMPORTANT:
   *
   * All monetary values supplied to this
   * component are in CENTS.
   *
   * Example:
   *
   * $25,000
   * =
   * 2500000
   */
  const [
    verifiedAmount,
    setVerifiedAmount,
  ] =
    useState(
      String(
        reportedAmount ??
          expectedAmount,
      ),
    );

  const [
    rejectionReason,
    setRejectionReason,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState<
      "verify" |
      "reject" |
      null
    >(null);

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

  /*
   * Only reported payments can be reviewed.
   */
  const canReview =
    currentStatus ===
      "pending_verification" ||
    currentStatus ===
      "payment_reported";

  /*
   * Verified is final.
   */
  const finalStatus =
    currentStatus ===
    "verified";

  /*
   * --------------------------------------------------
   * SAFE RESPONSE PARSER
   * --------------------------------------------------
   *
   * This prevents:
   *
   * Unexpected token '<'
   *
   * when Next.js returns an HTML error page
   * instead of JSON.
   */
  async function readApiResponse(
    response: Response,
    actionName: string,
  ): Promise<
    ReviewResponse | null
  > {
    const contentType =
      response.headers.get(
        "content-type",
      );

    const rawResponse =
      await response.text();

    /*
     * Useful temporary debugging.
     *
     * You can remove this console.log
     * once everything works.
     */
    console.log(
      `${actionName} PAYMENT RESPONSE`,
      {
        url:
          response.url,

        status:
          response.status,

        statusText:
          response.statusText,

        redirected:
          response.redirected,

        contentType,

        rawResponse:
          rawResponse.slice(
            0,
            1000,
          ),
      },
    );

    /*
     * The API should always respond with JSON.
     *
     * If it doesn't, this usually means:
     *
     * - wrong route
     * - route compile error
     * - Next.js error page
     * - redirect
     */
    if (
      !contentType?.includes(
        "application/json",
      )
    ) {
      console.error(
        `${actionName} payment returned non-JSON response.`,
        {
          url:
            response.url,

          status:
            response.status,

          statusText:
            response.statusText,

          redirected:
            response.redirected,

          contentType,

          rawResponse:
            rawResponse.slice(
              0,
              1000,
            ),
        },
      );

      setError(
        `Payment review endpoint returned ${response.status} ${response.statusText || "non-JSON response"}. Check the terminal running npm run dev for the server error.`,
      );

      return null;
    }

    try {
      return JSON.parse(
        rawResponse,
      ) as ReviewResponse;
    } catch (
      parseError
    ) {
      console.error(
        `${actionName} payment JSON parse error:`,
        parseError,
      );

      setError(
        "The payment review API returned invalid JSON.",
      );

      return null;
    }
  }

  /*
   * --------------------------------------------------
   * VERIFY PAYMENT
   * --------------------------------------------------
   */
  async function verifyPayment() {
    setError(null);
    setSuccess(null);

    const amount =
      Number(
        verifiedAmount,
      );

    /*
     * Validate amount.
     */
    if (
      !Number.isFinite(
        amount,
      ) ||
      amount <= 0
    ) {
      setError(
        "Enter a valid verified payment amount.",
      );

      return;
    }

    /*
     * First funding implementation requires
     * exact commitment funding.
     */
    if (
      amount !==
      expectedAmount
    ) {
      setError(
        "The verified amount must exactly equal the approved commitment amount.",
      );

      return;
    }

    /*
     * Opportunity capacity check.
     *
     * Server/RPC checks this again.
     */
   if (
  amount >
  remainingAllocation
) {
  setError(
    `This payment cannot be verified because the commitment is ${formatMoney(
      amount,
    )}, while only ${formatMoney(
      remainingAllocation,
    )} remains available in this opportunity.`,
  );

  return;
}

    /*
     * Payment proof is required.
     */
    if (
      !proofAvailable
    ) {
      setError(
        "Payment proof must be available before verification.",
      );

      return;
    }

    setLoading(
      "verify",
    );

    try {
     const response =
  await fetch(
    "/api/admin/payment-review",
    {
      method:
        "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify({
          paymentId,

          action:
            "verify",

          verifiedAmount:
            amount,
        }),
    },
  );

      const result =
        await readApiResponse(
          response,
          "VERIFY",
        );

      if (!result) {
        return;
      }

      if (
        !response.ok
      ) {
        setError(
          result.error ??
            "Unable to verify payment.",
        );

        return;
      }

      setSuccess(
        "Payment verified and funded investment position created successfully.",
      );

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "Payment verification request error:",
        requestError,
      );

      setError(
        "Unable to verify payment. Check your network connection and server console.",
      );
    } finally {
      setLoading(null);
    }
  }

  /*
   * --------------------------------------------------
   * REJECT PAYMENT
   * --------------------------------------------------
   */
  async function rejectPayment() {
    setError(null);
    setSuccess(null);

    const reason =
      rejectionReason.trim();

    if (!reason) {
      setError(
        "Enter a reason for rejecting the payment.",
      );

      return;
    }

    setLoading(
      "reject",
    );

    try {
      const response =
        await fetch(
            "/api/admin/payment-review",
            {
            method:
                "POST",

            headers: {
                "Content-Type":
                "application/json",
            },

            body:
                JSON.stringify({
                paymentId,

                action:
                    "reject",

                note:
                    rejectionReason.trim(),
                }),
            },
        );

      const result =
        await readApiResponse(
          response,
          "REJECT",
        );

      if (!result) {
        return;
      }

      if (
        !response.ok
      ) {
        setError(
          result.error ??
            "Unable to reject payment.",
        );

        return;
      }

      setSuccess(
        "Payment submission rejected. The investor can now correct and resubmit the payment information.",
      );

      setRejectionReason(
        "",
      );

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "Payment rejection request error:",
        requestError,
      );

      setError(
        "Unable to reject payment. Check your network connection and server console.",
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <aside className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 xl:sticky xl:top-28 xl:self-start">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
        Payment decision
      </p>

      <h2 className="font-display mt-3 text-2xl font-semibold text-forest-950">
        Verify received capital
      </h2>

      {/* ==========================================
          PAYMENT SUMMARY
      ========================================== */}

      <div className="mt-6 rounded-xl border border-forest-900/10 bg-ivory-50 p-4">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
          Expected commitment
        </p>

        <p className="mt-1 text-xl font-semibold text-forest-950">
          {formatMoney(
            expectedAmount,
          )}
        </p>

        <p className="mt-5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
          Investor reported
        </p>

        <p className="mt-1 text-sm font-semibold text-forest-950">
          {reportedAmount !=
          null
            ? formatMoney(
                reportedAmount,
              )
            : "Not reported"}
        </p>

        <p className="mt-5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
          Remaining allocation
        </p>

        <p className="mt-1 text-sm font-semibold text-forest-950">
          {formatMoney(
            remainingAllocation,
          )}
        </p>
      </div>

      {/* ==========================================
          ERROR
      ========================================== */}

      {error ? (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-700" />

          <p className="text-sm leading-6 text-red-700">
            {error}
          </p>
        </div>
      ) : null}

      {/* ==========================================
          SUCCESS
      ========================================== */}

      {success ? (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />

          <p className="text-sm leading-6 text-emerald-700">
            {success}
          </p>
        </div>
      ) : null}

      {/* ==========================================
          VERIFIED
      ========================================== */}

      {finalStatus ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
            Payment verified
          </p>

          <p className="mt-2 text-sm leading-7 text-emerald-900">
            This payment has already been verified.
            The funded investment position has been
            created.
          </p>
        </div>
      ) : canReview ? (
        <>
          {/* ======================================
              VERIFY
          ====================================== */}

          <label className="mt-6 block">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
              Verified amount
            </span>

            <input
              type="number"
              value={
                verifiedAmount
              }
              onChange={(
                event,
              ) => {
                setVerifiedAmount(
                  event.target
                    .value,
                );

                setError(null);
                setSuccess(null);
              }}
              className="focus-ring mt-3 min-h-12 w-full rounded-xl border border-forest-900/10 bg-ivory-50 px-4 text-sm font-semibold text-forest-950 outline-none"
            />

            <p className="mt-2 text-xs leading-6 text-stone-500">
              Internal amount is stored in cents. For
              example, $25,000 is stored as 2500000.
            </p>
          </label>

          <button
            type="button"
            disabled={
              loading !==
              null
            }
            onClick={
              verifyPayment
            }
            className="focus-ring mt-5 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ===
            "verify" ? (
              <>
                <Loader2 className="size-4 animate-spin" />

                Verifying...
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />

                Verify payment
              </>
            )}
          </button>

          {/* ======================================
              REJECT
          ====================================== */}

          <div className="mt-7 border-t border-forest-900/10 pt-6">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
                Rejection reason
              </span>

              <textarea
                value={
                  rejectionReason
                }
                onChange={(
                  event,
                ) => {
                  setRejectionReason(
                    event.target
                      .value,
                  );

                  setError(null);
                  setSuccess(null);
                }}
                rows={5}
                placeholder="Explain what is wrong with the payment submission..."
                className="focus-ring mt-3 w-full rounded-xl border border-forest-900/10 bg-ivory-50 p-4 text-sm leading-7 text-forest-950 outline-none"
              />
            </label>

            <button
              type="button"
              disabled={
                loading !==
                null
              }
              onClick={
                rejectPayment
              }
              className="focus-ring mt-4 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ===
              "reject" ? (
                <>
                  <Loader2 className="size-4 animate-spin" />

                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="size-4" />

                  Reject payment
                </>
              )}
            </button>
          </div>
        </>
      ) : currentStatus ===
        "rejected" ? (
        /*
         * ==========================================
         * WAITING FOR INVESTOR RESUBMISSION
         * ==========================================
         */
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
            Waiting for investor
          </p>

          <p className="mt-2 text-sm leading-7 text-amber-900">
            This payment submission was rejected.
            The investor must correct the payment
            information and resubmit it before the
            payment can be reviewed again.
          </p>
        </div>
      ) : (
        /*
         * ==========================================
         * AWAITING INVESTOR PAYMENT
         * ==========================================
         */
        <div className="mt-6 rounded-xl border border-forest-900/10 bg-ivory-50 p-5">
          <p className="text-sm leading-7 text-stone-600">
            This payment has not yet been submitted
            for verification.
          </p>
        </div>
      )}
    </aside>
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
        0,
    },
  ).format(
    cents / 100,
  );
}