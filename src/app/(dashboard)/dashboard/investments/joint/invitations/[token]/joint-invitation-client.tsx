"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";


type JointInvitationClientProps = {
  token: string;
};


type InvitationPreview = {
  invitationId: string;
  jointSubscriptionId: string;
  status: string;
  expiresAt: string;
  parentStatus: string;

  investment: {
    id: string;
    title: string;
    slug: string;
    assetCategory: string;
    location: string | null;
    currency: string;
    totalCommitmentAmount: number;
  };

  inviter: {
    firstName: string;
    lastName: string;
  };

  invitee: {
    firstName: string;
    lastName: string;
  };

  member: {
    memberId: string;
    memberSlot: number;
    status: string;
    ownershipBps: number;
    fundingObligationBps: number;
    obligationAmount: number;
  };
};


type PreviewResponse = {
  success?: boolean;
  invitation?: InvitationPreview;
  error?: string;
};

type AcceptanceResponse = {
  success?: boolean;

  acceptance?: {
    jointSubscriptionId: string;
    memberId: string;
    invitationId: string;
    consentId: string;
    memberStatus: string;
    invitationStatus: string;
    consentStatus: string;
    parentStatus: string;
    readyForSubmission: boolean;
  };

  error?: string;
};


function formatMoney(
  amountCents: number,
  currency = "USD",
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(
    amountCents / 100,
  );
}


function formatPercentage(
  basisPoints: number,
) {
  return `${(
    basisPoints / 100
  ).toFixed(
    basisPoints % 100 === 0
      ? 0
      : 2,
  )}%`;
}


function formatDateTime(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    },
  ).format(date);
}


function fullName(
  firstName?: string,
  lastName?: string,
) {
  return [
    firstName,
    lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}


export default function JointInvitationClient({
  token,
}: JointInvitationClientProps) {
  const [
    invitation,
    setInvitation,
  ] =
    useState<InvitationPreview | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    jointOwnershipAcknowledged,
    setJointOwnershipAcknowledged,
  ] =
    useState(false);

  const [
    fundingObligationAcknowledged,
    setFundingObligationAcknowledged,
  ] =
    useState(false);

  const [
    riskDisclosureAcknowledged,
    setRiskDisclosureAcknowledged,
  ] =
    useState(false);

  const [
    termsAcknowledged,
    setTermsAcknowledged,
  ] =
    useState(false);

  const [
    signatureName,
    setSignatureName,
  ] =
    useState("");

    const [
  submitting,
  setSubmitting,
] =
  useState(false);

const [
  submitError,
  setSubmitError,
] =
  useState("");

const [
  accepted,
  setAccepted,
] =
  useState<AcceptanceResponse["acceptance"] | null>(
    null,
  );


  /*
   * ==========================================================
   * LOAD INVITATION
   * ==========================================================
   */

  useEffect(() => {
    let cancelled =
      false;


    async function loadInvitation() {
      setLoading(true);
      setError("");

      try {
        const response =
          await fetch(
            "/api/investments/joint/invitations/preview",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              cache:
                "no-store",

              body:
                JSON.stringify({
                  token,
                }),
            },
          );


        const result =
          (await response.json()) as
            PreviewResponse;


        if (cancelled) {
          return;
        }


        if (
          !response.ok ||
          !result.success ||
          !result.invitation
        ) {
          setInvitation(
            null,
          );

          setError(
            result.error ||
              "This invitation is invalid, expired, or is not associated with your account.",
          );

          return;
        }


        setInvitation(
          result.invitation,
        );
      } catch {
        if (cancelled) {
          return;
        }

        setInvitation(
          null,
        );

        setError(
          "Unable to load this joint investment invitation. Please try again.",
        );
      } finally {
        if (!cancelled) {
          setLoading(
            false,
          );
        }
      }
    }


    void loadInvitation();


    return () => {
      cancelled = true;
    };
  }, [
    token,
  ]);


  /*
   * ==========================================================
   * FORM READINESS
   * ==========================================================
   */

const canAccept =
  useMemo(
    () =>
      Boolean(
        invitation &&
          !submitting &&
          !accepted &&
          jointOwnershipAcknowledged &&
          fundingObligationAcknowledged &&
          riskDisclosureAcknowledged &&
          termsAcknowledged &&
          signatureName.trim(),
      ),
      [
        invitation,
        submitting,
        accepted,
        jointOwnershipAcknowledged,
        fundingObligationAcknowledged,
        riskDisclosureAcknowledged,
        termsAcknowledged,
        signatureName,
      ],
    );

async function acceptInvitation() {
  if (
    !invitation ||
    !canAccept ||
    submitting
  ) {
    return;
  }


  setSubmitting(true);
  setSubmitError("");


  try {
    const response =
      await fetch(
        "/api/investments/joint/invitations/accept",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          cache:
            "no-store",

          body:
            JSON.stringify({
              token,

              jointOwnershipAcknowledged,

              fundingObligationAcknowledged,

              riskDisclosureAcknowledged,

              termsAcknowledged,

              signatureName:
                signatureName.trim(),
            }),
        },
      );


    const result =
      (await response.json()) as
        AcceptanceResponse;


    if (
      !response.ok ||
      !result.success ||
      !result.acceptance
    ) {
      setSubmitError(
        result.error ||
          "Unable to accept the joint investment invitation.",
      );

      return;
    }


    setAccepted(
      result.acceptance,
    );
  } catch {
    setSubmitError(
      "Unable to accept the joint investment invitation. Please try again.",
    );
  } finally {
    setSubmitting(false);
  }
}


  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 rounded-lg bg-slate-200 dark:bg-slate-800" />

          <div className="h-4 w-96 max-w-full rounded bg-slate-200 dark:bg-slate-800" />

          <div className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800" />

          <div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </main>
    );
  }


  /*
   * ==========================================================
   * INVALID / EXPIRED / WRONG ACCOUNT
   * ==========================================================
   */

  if (
    error ||
    !invitation
  ) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-xl dark:bg-amber-950/40">
            !
          </div>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Invitation unavailable
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            {error ||
              "This invitation is invalid, expired, or is not associated with your account."}
          </p>

          <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-500">
            Make sure you are signed in using the Tevuah Reserve
            account that received this invitation.
          </p>
        </div>
      </main>
    );
  }

  if (accepted) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-emerald-200 bg-white p-8 shadow-sm dark:border-emerald-900 dark:bg-slate-950 sm:p-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-xl font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
          ✓
        </div>

        <p className="mt-6 text-sm font-medium uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
          Acceptance recorded
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
          Joint investment accepted
        </h1>

        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
          Your electronic acceptance and signature have been
          recorded successfully.
        </p>

        <div className="mt-8 rounded-xl bg-slate-50 p-5 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-500">
              Your participation
            </span>

            <span className="text-sm font-semibold capitalize text-slate-950 dark:text-white">
              {accepted.memberStatus}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <span className="text-sm text-slate-500">
              Consent
            </span>

            <span className="text-sm font-semibold capitalize text-slate-950 dark:text-white">
              {accepted.consentStatus}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <span className="text-sm text-slate-500">
              Joint investment
            </span>

            <span className="text-sm font-semibold capitalize text-slate-950 dark:text-white">
              {accepted.parentStatus.replaceAll(
                "_",
                " ",
              )}
            </span>
          </div>
        </div>

        {accepted.readyForSubmission ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
              Both investors have completed their required
              acceptance.
            </p>

            <p className="mt-2 text-sm leading-6 text-emerald-800 dark:text-emerald-300">
              The joint investment has progressed to the next
              review stage. No funds have been transferred by
              this acceptance.
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Your acceptance is complete. The joint
              investment is still waiting for the remaining
              required participant action.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}


  const inviterName =
    fullName(
      invitation.inviter.firstName,
      invitation.inviter.lastName,
    ) ||
    "Joint investor";


  const inviteeName =
    fullName(
      invitation.invitee.firstName,
      invitation.invitee.lastName,
    ) ||
    "Investor";


  /*
   * ==========================================================
   * ACCEPTANCE SCREEN
   * ==========================================================
   */

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Header */}

      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
          Tevuah Reserve
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          Joint Investment Invitation
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-400">
          {inviterName} has invited you to participate in a
          joint investment. Review the investment details,
          your ownership interest, funding obligation and
          disclosures before deciding whether to accept.
        </p>
      </div>


      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        {/* LEFT */}

        <div className="space-y-8">
          {/* Investment */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Investment opportunity
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                  {invitation.investment.title}
                </h2>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    {invitation.investment.assetCategory}
                  </span>

                  {invitation.investment.location && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                      {invitation.investment.location}
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                  Ownership
                </p>

                <p className="mt-1 text-xl font-semibold text-emerald-950 dark:text-emerald-100">
                  {formatPercentage(
                    invitation.member.ownershipBps,
                  )}
                </p>
              </div>
            </div>


            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total joint commitment
                </p>

                <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                  {formatMoney(
                    invitation.investment.totalCommitmentAmount,
                    invitation.investment.currency,
                  )}
                </p>
              </div>


              <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Your funding obligation
                </p>

                <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                  {formatMoney(
                    invitation.member.obligationAmount,
                    invitation.investment.currency,
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {formatPercentage(
                    invitation.member.fundingObligationBps,
                  )}{" "}
                  of the joint commitment
                </p>
              </div>
            </div>
          </section>


          {/* Participants */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              Joint investors
            </h2>

            <div className="mt-6 divide-y divide-slate-200 dark:divide-slate-800">
              <div className="flex items-center justify-between gap-4 py-4 first:pt-0">
                <div>
                  <p className="font-medium text-slate-950 dark:text-white">
                    {inviterName}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Initiating investor
                  </p>
                </div>

                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  50%
                </span>
              </div>


              <div className="flex items-center justify-between gap-4 py-4 last:pb-0">
                <div>
                  <p className="font-medium text-slate-950 dark:text-white">
                    {inviteeName}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    You
                  </p>
                </div>

                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {formatPercentage(
                    invitation.member.ownershipBps,
                  )}
                </span>
              </div>
            </div>
          </section>
        </div>


        {/* RIGHT */}

        <div>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-8 lg:sticky lg:top-8">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
              Review & acknowledge
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Each joint investor must independently review
              and accept the investment terms.
            </p>


            <div className="mt-7 space-y-5">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={
                    jointOwnershipAcknowledged
                  }
                  onChange={(event) =>
                    setJointOwnershipAcknowledged(
                      event.target.checked,
                    )
                  }
                  className="mt-1 h-4 w-4 rounded border-slate-300"
                />

                <span className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                  I acknowledge that this investment will be
                  owned jointly on a{" "}
                  <strong>50/50 basis</strong> between the two
                  participating investors.
                </span>
              </label>


              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={
                    fundingObligationAcknowledged
                  }
                  onChange={(event) =>
                    setFundingObligationAcknowledged(
                      event.target.checked,
                    )
                  }
                  className="mt-1 h-4 w-4 rounded border-slate-300"
                />

                <span className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                  I acknowledge my individual funding
                  obligation of{" "}
                  <strong>
                    {formatMoney(
                      invitation.member.obligationAmount,
                      invitation.investment.currency,
                    )}
                  </strong>
                  .
                </span>
              </label>


              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={
                    riskDisclosureAcknowledged
                  }
                  onChange={(event) =>
                    setRiskDisclosureAcknowledged(
                      event.target.checked,
                    )
                  }
                  className="mt-1 h-4 w-4 rounded border-slate-300"
                />

                <span className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                  I acknowledge that I have reviewed the
                  applicable investment risk disclosures and
                  understand that investment returns are not
                  guaranteed.
                </span>
              </label>


              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={
                    termsAcknowledged
                  }
                  onChange={(event) =>
                    setTermsAcknowledged(
                      event.target.checked,
                    )
                  }
                  className="mt-1 h-4 w-4 rounded border-slate-300"
                />

                <span className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                  I have reviewed and agree to the joint
                  investment terms and participation
                  conditions.
                </span>
              </label>
            </div>


            <div className="my-7 border-t border-slate-200 dark:border-slate-800" />


            {/* Signature */}

            <div>
              <label
                htmlFor="signatureName"
                className="text-sm font-medium text-slate-950 dark:text-white"
              >
                Legal signature
              </label>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Type your full legal name to sign this joint
                investment acceptance electronically.
              </p>

              <input
                id="signatureName"
                type="text"
                autoComplete="name"
                value={
                  signatureName
                }
                onChange={(event) =>
                  setSignatureName(
                    event.target.value,
                  )
                }
                placeholder={
                  inviteeName
                }
                className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>


            {/* Expiry */}

            <div className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Invitation expires
              </p>

              <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                {formatDateTime(
                  invitation.expiresAt,
                )}
              </p>
            </div>

            {submitError && (
            <div
                role="alert"
                className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
            >
                {submitError}
            </div>
            )}


            {/* Button */}

            <button
            type="button"
            onClick={
                acceptInvitation
            }
            disabled={
                !canAccept
            }
            className="mt-6 w-full rounded-xl bg-emerald-700 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
            >
            {submitting
                ? "Recording Acceptance..."
                : "Accept Joint Investment"}
            </button>


            <p className="mt-4 text-xs leading-5 text-slate-500">
              Clicking Accept Joint Investment will constitute
              your electronic acceptance and signature. No
              funds will be transferred by this screen.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}