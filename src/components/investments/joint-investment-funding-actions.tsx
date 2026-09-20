"use client";
import {
  Bitcoin,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Landmark,
  Loader2,
  WalletCards,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

type PaymentMethod =
  | "wire_transfer"
  | "bitcoin";

type FundingMethod =
  | PaymentMethod
  | "cash_account";

type FundingState = {
  id: string;
  payment_method: string;
  status: string;

  payment_reference:
    | string
    | null;

  instructions_issued_at:
    | string
    | null;

  bank_name:
    | string
    | null;

  beneficiary_name:
    | string
    | null;

  account_number:
    | string
    | null;

  routing_number:
    | string
    | null;

  swift_code:
    | string
    | null;

  iban:
    | string
    | null;

  bank_address:
    | string
    | null;

  bitcoin_amount:
    | string
    | number
    | null;

  bitcoin_address:
    | string
    | null;

  bitcoin_network:
    | string
    | null;

  instructions:
    | string
    | null;

  reported_at:
    | string
    | null;

  reported_wire_reference:
    | string
    | null;

  reported_bitcoin_tx_hash:
    | string
    | null;

  investor_report_note:
    | string
    | null;

  verified_at:
    | string
    | null;
};

export function JointInvestmentFundingActions({
  fundingObligationId,
  obligationAmountCents,
  currency,
  jointStatus,
  cashAccountAvailableBalanceCents,
  funding,
}: {
  fundingObligationId: string;
  obligationAmountCents: number;
  currency: string;
  jointStatus: string;
  cashAccountAvailableBalanceCents:
    | number
    | null;

  funding:
    | FundingState
    | null;
}) {
  const router =
    useRouter();

  const [
    selectedMethod,
    setSelectedMethod,
  ] =
    useState<FundingMethod | null>(
      null,
    );

  const [
    reference,
    setReference,
  ] =
    useState("");

  const [
    note,
    setNote,
  ] =
    useState("");

  const [
    loading,
    setLoading,
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

  /* ==========================================================
   * COMPLETED
   * ========================================================== */

  if (
    funding?.status ===
    "verified"
  ) {
    return (
      <div className="mt-7 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" />

          <div>
            <p className="text-sm font-semibold text-emerald-900">
              Your funding is
              verified
            </p>

            <p className="mt-1 text-sm leading-6 text-emerald-800">
              Your funding
              obligation has been
              completed. No further
              payment action is
              required.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================
   * REPORTED / ADMIN VERIFICATION
   * ========================================================== */

  if (
    funding?.status ===
      "payment_reported" ||
    funding?.status ===
      "pending_verification"
  ) {
    return (
      <div className="mt-7 rounded-3xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex gap-3">
          <Clock3 className="mt-0.5 size-5 shrink-0 text-amber-700" />

          <div>
            <p className="text-sm font-semibold text-amber-900">
              Payment awaiting
              verification
            </p>

            <p className="mt-1 text-sm leading-6 text-amber-800">
              Your payment has been
              reported to Tevuah
              Reserve. Administrative
              verification is required
              before your investment
              principal is recognized
              as funded.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================
   * INSTRUCTIONS REQUESTED
   * ========================================================== */

  if (
    funding?.status ===
    "instructions_requested"
  ) {
    return (
      <div className="mt-7 rounded-3xl border border-gold-200 bg-ivory-50 p-5">
        <div className="flex gap-3">
          <Clock3 className="mt-0.5 size-5 shrink-0 text-gold-700" />

          <div>
            <p className="text-sm font-semibold text-forest-950">
              Payment instructions
              requested
            </p>

            <p className="mt-1 text-sm leading-6 text-stone-600">
              Tevuah Reserve has
              received your{" "}
              <strong>
                {paymentMethodLabel(
                  funding.payment_method,
                )}
              </strong>{" "}
              request. You will be
              notified when your
              payment instructions are
              ready.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================
   * INSTRUCTIONS ISSUED
   * ========================================================== */

  if (
    funding?.status ===
    "instructions_issued"
  ) {
    const bitcoin =
      funding.payment_method ===
      "bitcoin";

    return (
      <div className="mt-7 border-t border-forest-900/10 pt-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
            Report Payment
          </p>

          <h3 className="font-display mt-2 text-2xl font-semibold text-forest-950">
            Have you sent the funds?
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-600">
            After sending the exact
            amount using the
            instructions above,
            provide your{" "}
            {bitcoin
              ? "Bitcoin transaction hash"
              : "bank transfer reference"}{" "}
            so Tevuah Reserve can
            verify your payment.
          </p>
        </div>

        <div className="mt-6 max-w-2xl">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
              {bitcoin
                ? "Bitcoin transaction hash"
                : "Wire transfer reference"}
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
                  event.target
                    .value,
                )
              }
              placeholder={
                bitcoin
                  ? "Enter transaction hash"
                  : "Enter bank transfer reference"
              }
              className="focus-ring mt-2 min-h-12 w-full rounded-xl border border-forest-900/10 bg-white px-4 text-sm text-forest-950 outline-none placeholder:text-stone-400"
            />
          </label>

          <label className="mt-5 block">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
              Note{" "}
              <span className="font-normal normal-case tracking-normal text-stone-400">
                (optional)
              </span>
            </span>

            <textarea
              value={
                note
              }
              onChange={(
                event,
              ) =>
                setNote(
                  event.target
                    .value,
                )
              }
              rows={4}
              placeholder="Add any information that may help Tevuah Reserve identify your payment."
              className="focus-ring mt-2 w-full resize-none rounded-xl border border-forest-900/10 bg-white px-4 py-3 text-sm leading-6 text-forest-950 outline-none placeholder:text-stone-400"
            />
          </label>

          <Feedback
            error={error}
            success={
              success
            }
          />

          <button
            type="button"
            disabled={
              loading
            }
            onClick={() =>
              reportPayment(
                funding.id,
                funding.payment_method as PaymentMethod,
              )
            }
            className="focus-ring mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />

                Reporting payment...
              </>
            ) : (
              "Report payment"
            )}
          </button>
        </div>
      </div>
    );
  }

  /* ==========================================================
   * REJECTED PAYMENT
   * ========================================================== */

  if (
    funding?.status ===
    "rejected"
  ) {
    return (
      <div className="mt-7">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5">
          <div className="flex gap-3">
            <CircleAlert className="mt-0.5 size-5 shrink-0 text-red-700" />

            <div>
              <p className="text-sm font-semibold text-red-900">
                Payment could not
                be verified
              </p>

              <p className="mt-1 text-sm leading-6 text-red-800">
                Review the payment
                information shown
                above. A new funding
                request may be
                required before
                resubmitting payment
                evidence.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================
   * NOT READY FOR FUNDING
   * ========================================================== */

  if (
    jointStatus !==
      "approved" &&
    jointStatus !==
      "funding"
  ) {
    return null;
  }

  /* ==========================================================
   * SELECT METHOD
   * ========================================================== */

  return (
    <div className="mt-7 border-t border-forest-900/10 pt-7">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
          Funding Method
        </p>

        <h3 className="font-display mt-2 text-2xl font-semibold text-forest-950">
          Fund your{" "}
          {formatMoney(
            obligationAmountCents,
            currency,
          )}{" "}
          obligation
        </h3>

        <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-600">
          Select how you want to
          fund your share of this
          joint investment. Payment
          instructions are issued by
          Tevuah Reserve before you
          send funds.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <MethodButton
          active={
            selectedMethod ===
            "cash_account"
          }
          icon={
            <WalletCards className="size-5" />
          }
          title="Tevuah Cash Account"
          description="Fund your exact 50% obligation immediately from your available Tevuah Cash Account balance."
          onClick={() =>
            setSelectedMethod(
              "cash_account",
            )
          }
        />

        <MethodButton
          active={
            selectedMethod ===
            "wire_transfer"
          }
          icon={
            <Landmark className="size-5" />
          }
          title="Wire Transfer"
          description="Request bank transfer instructions from Tevuah Reserve."
          onClick={() =>
            setSelectedMethod(
              "wire_transfer",
            )
          }
        />

        <MethodButton
          active={
            selectedMethod ===
            "bitcoin"
          }
          icon={
            <Bitcoin className="size-5" />
          }
          title="Bitcoin"
          description="Request a public Bitcoin payment address and exact payment amount."
          onClick={() =>
            setSelectedMethod(
              "bitcoin",
            )
          }
        />
      </div>

      {selectedMethod ===
      "cash_account" ? (
        <div className="mt-5 rounded-2xl border border-gold-200 bg-ivory-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-forest-950 text-gold-300">
              <WalletCards className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-forest-950">
                Tevuah Cash Account
              </p>

              <p className="mt-2 text-sm leading-6 text-stone-600">
                Your exact joint funding obligation will be debited immediately
                from your Tevuah Cash Account. No Wire Transfer charge applies,
                and no external payment instructions are required.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <MiniValue
              label="Available balance"
              value={
                cashAccountAvailableBalanceCents ===
                null
                  ? "Unavailable"
                  : formatMoney(
                      cashAccountAvailableBalanceCents,
                      currency,
                    )
              }
            />

            <MiniValue
              label="Amount to debit"
              value={formatMoney(
                obligationAmountCents,
                currency,
              )}
            />

            <MiniValue
              label="Balance after funding"
              value={
                cashAccountAvailableBalanceCents ===
                null
                  ? "Unavailable"
                  : formatMoney(
                      Math.max(
                        0,
                        cashAccountAvailableBalanceCents -
                          obligationAmountCents,
                      ),
                      currency,
                    )
              }
            />
          </div>

          {cashAccountAvailableBalanceCents ===
          null ? (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              Your Tevuah Cash Account is not available for this currency.
              Use Wire Transfer or Bitcoin, or fund your Cash Account first.
            </p>
          ) : cashAccountAvailableBalanceCents <
            obligationAmountCents ? (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              Your available Cash Account balance is below this funding
              obligation. Add funds to your Cash Account or choose another
              funding method.
            </p>
          ) : (
            <p className="mt-4 text-xs leading-5 text-stone-500">
              By confirming below, you authorize Tevuah Reserve to debit{" "}
              <strong className="text-forest-950">
                {formatMoney(
                  obligationAmountCents,
                  currency,
                )}
              </strong>{" "}
              from your available Cash Account balance for this joint
              investment obligation.
            </p>
          )}
        </div>
      ) : null}

      {selectedMethod ===
      "wire_transfer" ? (
        <div className="mt-5 rounded-2xl border border-gold-200 bg-ivory-50 p-5">
          <p className="text-sm font-semibold text-forest-950">
            Wire Transfer funding
          </p>

          <p className="mt-2 text-sm leading-6 text-stone-600">
            Wire funding carries
            the platform-controlled
            20% wire charge. This
            charge is separate from
            your investment
            principal and does not
            increase your position
            value.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <MiniValue
              label="Principal"
              value={formatMoney(
                obligationAmountCents,
                currency,
              )}
            />

            <MiniValue
              label="Wire charge"
              value={formatMoney(
                Math.round(
                  obligationAmountCents *
                    0.2,
                ),
                currency,
              )}
            />

            <MiniValue
              label="Estimated total"
              value={formatMoney(
                Math.round(
                  obligationAmountCents *
                    1.2,
                ),
                currency,
              )}
            />
          </div>
        </div>
      ) : null}

      {selectedMethod ===
      "bitcoin" ? (
        <div className="mt-5 rounded-2xl border border-forest-900/10 bg-stone-50 p-5">
          <p className="text-sm font-semibold text-forest-950">
            Bitcoin funding
          </p>

          <p className="mt-2 text-sm leading-6 text-stone-600">
            Tevuah Reserve will
            provide the exact BTC
            amount, public receiving
            address and network.
            Bitcoin funding does not
            carry the Wire Transfer
            charge.
          </p>
        </div>
      ) : null}

      <Feedback
        error={error}
        success={
          success
        }
      />

      <button
        type="button"
        disabled={
          !selectedMethod ||
          loading ||
          (
            selectedMethod ===
              "cash_account" &&
            (
              cashAccountAvailableBalanceCents ===
                null ||
              cashAccountAvailableBalanceCents <
                obligationAmountCents
            )
          )
        }
        onClick={
          selectedMethod ===
          "cash_account"
            ? fundFromCashAccount
            : requestInstructions
        }
        className="focus-ring mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />

            {selectedMethod ===
            "cash_account"
              ? "Funding investment..."
              : "Sending request..."}
          </>
        ) : selectedMethod ===
          "cash_account" ? (
          "Fund from Cash Account"
        ) : selectedMethod ===
          "bitcoin" ? (
          "Request Bitcoin instructions"
        ) : selectedMethod ===
          "wire_transfer" ? (
          "Request Wire instructions"
        ) : (
          "Select a funding method"
        )}
      </button>
    </div>
  );

  /* ==========================================================
   * REQUEST INSTRUCTIONS
   * ========================================================== */

  async function requestInstructions() {
    if (
      selectedMethod !==
        "wire_transfer" &&
      selectedMethod !==
        "bitcoin"
    ) {
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/investments/joint/funding/request-instructions",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                fundingObligationId,
                paymentMethod:
                  selectedMethod,
              }),
          },
        );

      const result =
        (await response.json()) as {
          success?: boolean;
          error?: string;
        };

      if (
        !response.ok
      ) {
        setError(
          result.error ??
            "Unable to request payment instructions.",
        );

        return;
      }

      setSuccess(
        selectedMethod ===
          "wire_transfer"
          ? "Wire Transfer instructions requested successfully."
          : "Bitcoin instructions requested successfully.",
      );

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "Joint funding instruction request error:",
        requestError,
      );

      setError(
        "Unable to request payment instructions.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* ==========================================================
   * FUND FROM TEVUAH CASH ACCOUNT
   * ========================================================== */

  async function fundFromCashAccount() {
    if (
      cashAccountAvailableBalanceCents ===
        null ||
      cashAccountAvailableBalanceCents <
        obligationAmountCents
    ) {
      setError(
        "Your Tevuah Cash Account does not have enough available balance for this obligation.",
      );
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    /*
     * One deliberate click receives one unique idempotency key.
     * The same key is reused for the request itself; database
     * uniqueness and joint-obligation provenance provide the
     * authoritative replay/concurrency protection.
     */
    const idempotencyKey =
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID ===
        "function"
        ? crypto.randomUUID()
        : `joint-cash-${fundingObligationId}-${Date.now()}`;

    try {
      const response =
        await fetch(
          "/api/investments/joint/funding/from-cash-account",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                fundingObligationId,
                idempotencyKey,
              }),
          },
        );

      const result =
        (await response.json()) as {
          success?: boolean;
          error?: string;
          funding?: {
            availableBalanceCents?: number;
            obligationStatus?: string;
            jointStatus?: string;
          };
        };

      if (!response.ok) {
        setError(
          result.error ??
            "Unable to fund this joint investment from your Tevuah Cash Account.",
        );
        return;
      }

      setSuccess(
        "Your Tevuah Cash Account was debited successfully and your joint funding obligation is now funded.",
      );

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "Joint Cash Account funding error:",
        requestError,
      );

      setError(
        "Unable to fund this joint investment from your Tevuah Cash Account.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* ==========================================================
   * REPORT PAYMENT
   * ========================================================== */

  async function reportPayment(
    externalFundingId: string,
    method: PaymentMethod,
  ) {
    setError("");
    setSuccess("");

    const cleanReference =
      reference.trim();

    if (
      !cleanReference
    ) {
      setError(
        method ===
          "bitcoin"
          ? "Enter the Bitcoin transaction hash."
          : "Enter your Wire Transfer reference.",
      );

      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/investments/joint/funding/report-payment",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                externalFundingId,

                wireReference:
                  method ===
                  "wire_transfer"
                    ? cleanReference
                    : null,

                bitcoinTxHash:
                  method ===
                  "bitcoin"
                    ? cleanReference
                    : null,

                paymentProofStoragePath:
                  null,

                investorReportNote:
                  note.trim() ||
                  null,
              }),
          },
        );

      const result =
        (await response.json()) as {
          success?: boolean;
          error?: string;
        };

      if (
        !response.ok
      ) {
        setError(
          result.error ??
            "Unable to report payment.",
        );

        return;
      }

      setReference("");
      setNote("");

      setSuccess(
        "Payment reported successfully. Tevuah Reserve will verify it before your investment principal is recognized as funded.",
      );

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "Joint payment report error:",
        requestError,
      );

      setError(
        "Unable to report payment.",
      );
    } finally {
      setLoading(false);
    }
  }
}

/* ============================================================
 * METHOD BUTTON
 * ============================================================ */

function MethodButton({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`focus-ring cursor-pointer rounded-3xl border p-5 text-left transition ${
        active
          ? "border-forest-950 bg-forest-950 text-white"
          : "border-forest-900/10 bg-white text-forest-950 hover:border-forest-900/20 hover:bg-ivory-50"
      }`}
    >
      <div
        className={`flex size-10 items-center justify-center rounded-full ${
          active
            ? "bg-white/10 text-gold-300"
            : "bg-ivory-100 text-forest-950"
        }`}
      >
        {icon}
      </div>

      <p className="mt-4 text-sm font-semibold">
        {title}
      </p>

      <p
        className={`mt-2 text-xs leading-6 ${
          active
            ? "text-white/65"
            : "text-stone-500"
        }`}
      >
        {description}
      </p>
    </button>
  );
}

/* ============================================================
 * FEEDBACK
 * ============================================================ */

function Feedback({
  error,
  success,
}: {
  error: string;
  success: string;
}) {
  if (
    !error &&
    !success
  ) {
    return null;
  }

  return (
    <div
      className={`mt-5 rounded-xl border p-4 text-sm leading-6 ${
        error
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {error ||
        success}
    </div>
  );
}

/* ============================================================
 * MINI VALUE
 * ============================================================ */

function MiniValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
 * FORMATTERS
 * ============================================================ */

function paymentMethodLabel(
  method: string,
) {
  switch (method) {
    case "wire_transfer":
      return "Wire Transfer";

    case "bitcoin":
      return "Bitcoin";

    default:
      return method
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
}

function formatMoney(
  cents: number,
  currency = "USD",
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency:
        currency ||
        "USD",
      maximumFractionDigits: 0,
    },
  ).format(
    Number(
      cents,
    ) /
      100,
  );
}