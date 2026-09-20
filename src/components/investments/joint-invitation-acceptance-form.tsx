"use client";

import {
  Check,
  FileCheck2,
  Loader2,
  PenLine,
  ShieldCheck,
  UsersRound,
  WalletCards,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useMemo,
  useState,
} from "react";

export function JointInvitationAcceptanceForm({
  token,
  jointSubscriptionId,
  opportunityTitle,
  inviterName,
  inviteeName,
  totalCommitmentCents,
  obligationAmountCents,
  currency,
}: {
  token: string;
  jointSubscriptionId: string;
  opportunityTitle: string;
  inviterName: string;
  inviteeName: string;
  totalCommitmentCents: number;
  obligationAmountCents: number;
  currency: string;
}) {
  const router =
    useRouter();

  const [
    ownershipAccepted,
    setOwnershipAccepted,
  ] =
    useState(false);

  const [
    fundingAccepted,
    setFundingAccepted,
  ] =
    useState(false);

  const [
    riskAccepted,
    setRiskAccepted,
  ] =
    useState(false);

  const [
    termsAccepted,
    setTermsAccepted,
  ] =
    useState(false);

  const [
    signatureName,
    setSignatureName,
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
    useState(false);

  const allAcknowledged =
    ownershipAccepted &&
    fundingAccepted &&
    riskAccepted &&
    termsAccepted;

  const canSubmit =
    allAcknowledged &&
    signatureName
      .trim()
      .length >= 2 &&
    !loading;

  const completedCount =
    useMemo(
      () =>
        [
          ownershipAccepted,
          fundingAccepted,
          riskAccepted,
          termsAccepted,
        ].filter(Boolean)
          .length,
      [
        ownershipAccepted,
        fundingAccepted,
        riskAccepted,
        termsAccepted,
      ],
    );

  if (success) {
    return (
      <section className="overflow-hidden rounded-[1.75rem] border border-emerald-200 bg-white">
        <div className="bg-emerald-50 p-7 sm:p-8">
          <div className="flex size-12 items-center justify-center rounded-full bg-emerald-700 text-white">
            <Check className="size-5" />
          </div>

          <h2 className="font-display mt-6 text-3xl font-semibold text-forest-950">
            Joint investment accepted
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-emerald-900">
            Your acceptance and
            electronic signature have
            been recorded. You are now
            a confirmed member of this
            joint investment.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/dashboard/investments/joint/${jointSubscriptionId}`,
              )
            }
            className="focus-ring mt-7 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800"
          >
            View joint investment
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="border-b border-forest-900/10 px-6 py-7 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
              Consent & Signature
            </p>

            <h2 className="font-display mt-2 text-3xl font-semibold text-forest-950">
              Accept your joint
              investment allocation
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Complete all four
              acknowledgements and
              enter your legal name to
              electronically sign your
              acceptance.
            </p>
          </div>

          <div className="rounded-full bg-ivory-100 px-3 py-1.5 text-xs font-semibold text-forest-950">
            {completedCount}/4 reviewed
          </div>
        </div>
      </div>

      {/* =====================================================
          AGREEMENT SUMMARY
      ===================================================== */}

      <div className="px-6 py-7 sm:px-8">
        <div className="rounded-3xl bg-forest-950 p-5 text-white sm:p-6">
          <div className="grid gap-5 sm:grid-cols-3">
            <DarkValue
              label="Investment"
              value={
                opportunityTitle
              }
            />

            <DarkValue
              label="Your obligation"
              value={formatMoney(
                obligationAmountCents,
                currency,
              )}
            />

            <DarkValue
              label="Joint commitment"
              value={formatMoney(
                totalCommitmentCents,
                currency,
              )}
            />
          </div>
        </div>

        {/* ===================================================
            ACKNOWLEDGEMENTS
        =================================================== */}

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
            Required acknowledgements
          </p>

          <div className="mt-4 divide-y divide-forest-900/10 overflow-hidden rounded-3xl border border-forest-900/10">
            <Acknowledgement
              checked={
                ownershipAccepted
              }
              onChange={
                setOwnershipAccepted
              }
              icon={
                <UsersRound className="size-5" />
              }
              title="50/50 joint ownership"
              description={`I acknowledge that ${inviterName} and I will each hold 50% ownership of this joint investment.`}
            />

            <Acknowledgement
              checked={
                fundingAccepted
              }
              onChange={
                setFundingAccepted
              }
              icon={
                <WalletCards className="size-5" />
              }
              title="Individual funding obligation"
              description={`I acknowledge that my funding obligation is ${formatMoney(
                obligationAmountCents,
                currency,
              )}, representing 50% of the ${formatMoney(
                totalCommitmentCents,
                currency,
              )} joint commitment.`}
            />

            <Acknowledgement
              checked={
                riskAccepted
              }
              onChange={
                setRiskAccepted
              }
              icon={
                <ShieldCheck className="size-5" />
              }
              title="Investment risk disclosure"
              description="I acknowledge that I have reviewed the applicable investment risk disclosures and understand that investment returns are not guaranteed."
            />

            <Acknowledgement
              checked={
                termsAccepted
              }
              onChange={
                setTermsAccepted
              }
              icon={
                <FileCheck2 className="size-5" />
              }
              title="Joint investment terms"
              description="I acknowledge the joint investment terms, the equal ownership structure, and my individual obligations associated with this investment."
            />
          </div>
        </div>

        {/* ===================================================
            SIGNATURE
        =================================================== */}

        <div className="mt-8 border-t border-forest-900/10 pt-8">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ivory-100 text-forest-950">
              <PenLine className="size-4" />
            </div>

            <div>
              <p className="text-sm font-semibold text-forest-950">
                Electronic signature
              </p>

              <p className="mt-1 text-sm leading-6 text-stone-500">
                Type your legal name
                exactly as you intend
                it to appear on this
                acceptance.
              </p>
            </div>
          </div>

          <label className="mt-5 block">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.13em] text-stone-400">
              Signature name
            </span>

            <input
              type="text"
              value={
                signatureName
              }
              onChange={(
                event,
              ) =>
                setSignatureName(
                  event.target
                    .value,
                )
              }
              autoComplete="name"
              placeholder={
                inviteeName
              }
              className="focus-ring mt-2 min-h-12 w-full rounded-xl border border-forest-900/10 bg-white px-4 text-sm font-medium text-forest-950 outline-none placeholder:text-stone-300"
            />
          </label>

          <div className="mt-4 rounded-xl bg-stone-50 p-4">
            <p className="text-xs leading-6 text-stone-500">
              By selecting{" "}
              <strong className="text-forest-950">
                Accept & Sign
              </strong>
              , you are applying your
              typed electronic
              signature to this joint
              investment acceptance
              and the acknowledgements
              selected above.
            </p>
          </div>

          {error ? (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
              {error}
            </div>
          ) : null}

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-xs leading-6 text-stone-400">
              Your acceptance is
              recorded against your
              authenticated investor
              account.
            </p>

            <button
              type="button"
              disabled={
                !canSubmit
              }
              onClick={
                acceptInvitation
              }
              className="focus-ring inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />

                  Recording signature...
                </>
              ) : (
                <>
                  <FileSignatureIcon />

                  Accept & Sign
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  async function acceptInvitation() {
    setError("");

    if (
      !allAcknowledged
    ) {
      setError(
        "Review and accept all four required acknowledgements.",
      );

      return;
    }

    const cleanSignature =
      signatureName.trim();

    if (
      cleanSignature.length <
      2
    ) {
      setError(
        "Enter your legal name to sign the joint investment acceptance.",
      );

      return;
    }

    setLoading(true);

    try {
      /*
       * IMPORTANT:
       *
       * Keep these agreement/document values aligned with the
       * existing acceptance route that was built in Step 2F.
       *
       * The API/database, not this UI, remains the authority.
       */
      const response =
        await fetch(
          `/api/investments/joint/invitations/accept`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

           body:
  JSON.stringify({
    token,

    signatureName:
      cleanSignature,

    jointOwnershipAcknowledged:
      ownershipAccepted,

    fundingObligationAcknowledged:
      fundingAccepted,

    riskDisclosureAcknowledged:
      riskAccepted,

    termsAcknowledged:
      termsAccepted,
  }),
          },
        );

      const result =
        (await response.json()) as {
          success?: boolean;
          error?: string;
          jointSubscriptionId?: string;
        };

      if (
        !response.ok ||
        !result.success
      ) {
        setError(
          result.error ??
            "Unable to accept this joint investment invitation.",
        );

        return;
      }

      setSuccess(true);

      router.refresh();
    } catch (
      acceptanceError
    ) {
      console.error(
        "Joint invitation acceptance error:",
        acceptanceError,
      );

      setError(
        "Unable to accept this joint investment invitation.",
      );
    } finally {
      setLoading(false);
    }
  }
}

/* ============================================================
 * ACKNOWLEDGEMENT
 * ============================================================ */

function Acknowledgement({
  checked,
  onChange,
  icon,
  title,
  description,
}: {
  checked: boolean;
  onChange: (
    checked: boolean,
  ) => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <label
      className={`flex cursor-pointer gap-4 p-5 transition sm:p-6 ${
        checked
          ? "bg-ivory-50"
          : "bg-white hover:bg-stone-50/70"
      }`}
    >
      <input
        type="checkbox"
        checked={
          checked
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target
              .checked,
          )
        }
        className="sr-only"
      />

      <span
        className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border transition ${
          checked
            ? "border-forest-950 bg-forest-950 text-white"
            : "border-stone-300 bg-white text-transparent"
        }`}
      >
        <Check className="size-3.5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-sm font-semibold text-forest-950">
          <span className="text-gold-700">
            {icon}
          </span>

          {title}
        </span>

        <span className="mt-2 block text-sm leading-7 text-stone-600">
          {description}
        </span>
      </span>
    </label>
  );
}

/* ============================================================
 * DARK VALUE
 * ============================================================ */

function DarkValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.13em] text-white/40">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold leading-6 text-white">
        {value}
      </p>
    </div>
  );
}

function FileSignatureIcon() {
  return (
    <PenLine className="size-4" />
  );
}

function formatMoney(
  cents: number,
  currency = "USD",
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    },
  ).format(
    cents / 100,
  );
}