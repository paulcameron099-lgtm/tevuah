"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileCheck2,
  Loader2,
  Search,
  ShieldCheck,
  Signature,
  UsersRound,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

/* ============================================================
 * TYPES
 * ============================================================ */

type InvestorResult = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
};

type Opportunity = {
  id: string;
  title: string;
  slug: string;

  assetCategory:
    | string
    | null;

  location:
    | string
    | null;

  currency: string;

  minimumInvestmentCents: number;
  remainingCapacityCents: number;
};

type Props = {
  opportunity: Opportunity;
};

type Stage =
  | "create"
  | "review"
  | "submitting"
  | "invitation_warning";

type CreateJointResponse = {
  success?: boolean;

  jointCreated?: boolean;

  consentRecorded?: boolean;

  jointSubscriptionId?: string;

  status?: string;

  error?: string;

  consent?: {
    memberId?: string;
    consentId?: string;
    memberStatus?: string;
    consentStatus?: string;
    parentStatus?: string;
  };
};

type InvitationResponse = {
  success?: boolean;

  invitationCreated?: boolean;

  emailSent?: boolean;

  error?: string;

  invitation?: {
    invitationId?: string;

    jointSubscriptionId?: string;

    memberId?: string;

    inviteeInvestorId?: string;

    expiresAt?: string;

    status?: string;

    emailSent?: boolean;
  };
};

/* ============================================================
 * COMPONENT
 * ============================================================ */

export function JointInvestmentCreationForm({
  opportunity,
}: Props) {
  /* ----------------------------------------------------------
   * CREATION STATE
   * ---------------------------------------------------------- */

  const [
    stage,
    setStage,
  ] =
    useState<Stage>(
      "create",
    );

  const [
    commitment,
    setCommitment,
  ] =
    useState("");

  const [
    investorSearch,
    setInvestorSearch,
  ] =
    useState("");

  const [
    investorResults,
    setInvestorResults,
  ] =
    useState<
      InvestorResult[]
    >([]);

  const [
    selectedInvestor,
    setSelectedInvestor,
  ] =
    useState<
      InvestorResult | null
    >(null);

  const [
    searching,
    setSearching,
  ] =
    useState(false);

  const [
    searchError,
    setSearchError,
  ] =
    useState("");

  /* ----------------------------------------------------------
   * REVIEW / CONSENT STATE
   * ---------------------------------------------------------- */

  const [
    ownershipAcknowledged,
    setOwnershipAcknowledged,
  ] =
    useState(false);

  const [
    fundingAcknowledged,
    setFundingAcknowledged,
  ] =
    useState(false);

  const [
    riskAcknowledged,
    setRiskAcknowledged,
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

  /*
   * Once the database creates a joint subscription we retain
   * its ID locally.
   *
   * This is important because if invitation delivery fails,
   * we must NEVER blindly call the creation endpoint again.
   */
  const [
    createdJointSubscriptionId,
    setCreatedJointSubscriptionId,
  ] =
    useState<
      string | null
    >(null);

  const [
    invitationFailureMessage,
    setInvitationFailureMessage,
  ] =
    useState("");

  /* ==========================================================
   * COMMITMENT
   * ========================================================== */

  const commitmentCents =
    useMemo(() => {
      const normalized =
        commitment
          .replaceAll(
            ",",
            "",
          )
          .trim();

      if (!normalized) {
        return 0;
      }

      const amount =
        Number(
          normalized,
        );

      if (
        !Number.isFinite(
          amount,
        ) ||
        amount <= 0
      ) {
        return 0;
      }

      return Math.round(
        amount * 100,
      );
    }, [
      commitment,
    ]);

  const memberAmount =
    commitmentCents > 0
      ? commitmentCents / 2
      : 0;

  const belowMinimum =
    commitmentCents > 0 &&
    commitmentCents <
      opportunity.minimumInvestmentCents;

  const aboveCapacity =
    commitmentCents > 0 &&
    commitmentCents >
      opportunity.remainingCapacityCents;

  /*
   * Each member's obligation must be an exact whole number
   * of cents.
   */
  const invalidSplit =
    commitmentCents > 0 &&
    commitmentCents % 2 !==
      0;

  const validCommitment =
    commitmentCents > 0 &&
    !belowMinimum &&
    !aboveCapacity &&
    !invalidSplit;

  const canContinue =
    validCommitment &&
    selectedInvestor !==
      null;

  /* ==========================================================
   * INVESTOR SEARCH
   * ========================================================== */

  useEffect(() => {
    if (
      selectedInvestor
    ) {
      return;
    }

    const query =
      investorSearch
        .trim()
        .toLowerCase();

    if (
      query.length < 5 ||
      !query.includes(
        "@",
      )
    ) {
      return;
    }

    const controller =
      new AbortController();

    const timer =
      window.setTimeout(
        async () => {
          setSearching(
            true,
          );

          setSearchError(
            "",
          );

          try {
            const response =
              await fetch(
                `/api/investments/joint/investors/search?q=${encodeURIComponent(
                  query,
                )}`,
                {
                  method:
                    "GET",

                  cache:
                    "no-store",

                  signal:
                    controller.signal,
                },
              );

            const body =
              await response.json();

            if (
              !response.ok
            ) {
              throw new Error(
                body?.error ??
                  "Unable to search for this investor.",
              );
            }

            const investors =
              Array.isArray(
                body?.investors,
              )
                ? body.investors
                : body?.investor
                  ? [
                      body.investor,
                    ]
                  : [];

            setInvestorResults(
              investors,
            );
          } catch (
            error
          ) {
            if (
              error instanceof
                DOMException &&
              error.name ===
                "AbortError"
            ) {
              return;
            }

            setInvestorResults(
              [],
            );

            setSearchError(
              error instanceof
                Error
                ? error.message
                : "Unable to search for this investor.",
            );
          } finally {
            if (
              !controller
                .signal
                .aborted
            ) {
              setSearching(
                false,
              );
            }
          }
        },
        450,
      );

    return () => {
      window.clearTimeout(
        timer,
      );

      controller.abort();
    };
  }, [
    investorSearch,
    selectedInvestor,
  ]);

  /* ==========================================================
   * REVIEW
   * ========================================================== */

  function continueToReview() {
    if (
      !canContinue ||
      !selectedInvestor
    ) {
      return;
    }

    setSubmitError(
      "",
    );

    setStage(
      "review",
    );

    window.scrollTo({
      top: 0,
      behavior:
        "smooth",
    });
  }

  /* ==========================================================
   * ISSUE INVITATION
   * ========================================================== */

  async function issueInvitation(
    jointSubscriptionId: string,
  ) {
    const response =
      await fetch(
        `/api/investments/joint/${encodeURIComponent(
          jointSubscriptionId,
        )}/invitation`,
        {
          method:
            "POST",

          headers: {
            Accept:
              "application/json",
          },

          cache:
            "no-store",
        },
      );

    let body:
      | InvitationResponse
      | null =
      null;

    try {
      body =
        (await response.json()) as
          InvitationResponse;
    } catch {
      body =
        null;
    }

    /*
     * Full success:
     *
     * - invitation exists
     * - email delivered
     */
    if (
      response.ok &&
      body?.success ===
        true
    ) {
      return {
        success:
          true as const,

        body,
      };
    }

    /*
     * Special partial success:
     *
     * PostgreSQL already created the invitation, but SMTP
     * delivery failed.
     *
     * The existing invitation route intentionally returns this
     * state because email cannot participate in the PostgreSQL
     * transaction.
     *
     * Do NOT issue another invitation automatically.
     */
    if (
      body?.invitationCreated ===
        true
    ) {
      return {
        success:
          false as const,

        invitationCreated:
          true as const,

        body,
      };
    }

    throw new Error(
      body?.error ??
        "The joint investment was created, but the invitation could not be issued.",
    );
  }

  /* ==========================================================
   * CREATE + CONSENT + INVITATION
   * ========================================================== */

  async function submitJointInvestment() {
    if (
      submitting
    ) {
      return;
    }

    if (
      !selectedInvestor
    ) {
      setSubmitError(
        "Select the joint investor before continuing.",
      );

      return;
    }

    const allAcknowledged =
      ownershipAcknowledged &&
      fundingAcknowledged &&
      riskAcknowledged &&
      termsAcknowledged;

    if (
      !validCommitment ||
      !allAcknowledged ||
      signatureName
        .trim()
        .length < 2
    ) {
      setSubmitError(
        "Complete all required acknowledgements and provide your electronic signature.",
      );

      return;
    }

    /*
     * A database joint already exists.
     *
     * Never manufacture another parent by calling /create again.
     */
    if (
      createdJointSubscriptionId
    ) {
      setSubmitError(
        "This joint investment has already been created. Open the investment to continue.",
      );

      return;
    }

    setSubmitting(
      true,
    );

    setStage(
      "submitting",
    );

    setSubmitError(
      "",
    );

    setInvitationFailureMessage(
      "",
    );

    try {
      /* ======================================================
       * 1. CREATE JOINT + RECORD INITIATOR CONSENT
       * ====================================================== */

      const createResponse =
        await fetch(
          "/api/investments/joint/create",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            cache:
              "no-store",

            body:
              JSON.stringify({
                opportunityId:
                  opportunity.id,

                secondInvestorId:
                  selectedInvestor.id,

                totalCommitmentAmount:
                  commitmentCents,

                signatureName:
                  signatureName.trim(),

                jointOwnershipAcknowledged:
                  ownershipAcknowledged,

                fundingObligationAcknowledged:
                  fundingAcknowledged,

                riskDisclosureAcknowledged:
                  riskAcknowledged,

                termsAcknowledged:
                  termsAcknowledged,
              }),
          },
        );

      let createBody:
        | CreateJointResponse
        | null =
        null;

      try {
        createBody =
          (await createResponse.json()) as
            CreateJointResponse;
      } catch {
        createBody =
          null;
      }

      /*
       * CRITICAL PARTIAL-FAILURE CASE:
       *
       * create_joint_investment_subscription() succeeded but
       * initiator consent failed.
       *
       * The server deliberately returns the created joint ID.
       *
       * Store that ID immediately and NEVER call /create again.
       */
      if (
        !createResponse.ok
      ) {
        if (
          createBody?.jointCreated ===
            true &&
          typeof createBody
            ?.jointSubscriptionId ===
            "string" &&
          createBody
            .jointSubscriptionId
        ) {
          const existingId =
            createBody
              .jointSubscriptionId;

          setCreatedJointSubscriptionId(
            existingId,
          );

          setStage(
            "review",
          );

          setSubmitError(
            `${
              createBody.error ??
              "The joint investment was created, but your consent could not be completed."
            } Do not create another joint investment. Open the existing investment to continue.`,
          );

          return;
        }

        throw new Error(
          createBody?.error ??
            "Unable to create the joint investment.",
        );
      }

      const jointSubscriptionId =
        createBody
          ?.jointSubscriptionId;

      if (
        typeof jointSubscriptionId !==
          "string" ||
        !jointSubscriptionId
      ) {
        throw new Error(
          "The joint investment was created without a valid identifier.",
        );
      }

      /*
       * From this point forward the database parent exists.
       *
       * We retain the ID BEFORE performing any external action.
       */
      setCreatedJointSubscriptionId(
        jointSubscriptionId,
      );

      /* ======================================================
       * 2. ISSUE SECURE INVITATION + SEND EMAIL
       * ====================================================== */

      let invitationResult;

      try {
        invitationResult =
          await issueInvitation(
            jointSubscriptionId,
          );
      } catch (
        invitationError
      ) {
        /*
         * Creation + initiator consent succeeded, but invitation
         * issuance itself failed.
         *
         * Never retry /create.
         */
        setInvitationFailureMessage(
          invitationError instanceof
            Error
            ? invitationError.message
            : "The joint investment was created, but the invitation could not be issued.",
        );

        setStage(
          "invitation_warning",
        );

        window.scrollTo({
          top: 0,
          behavior:
            "smooth",
        });

        return;
      }

      /* ======================================================
       * 3. INVITATION EXISTS BUT EMAIL FAILED
       * ====================================================== */

      if (
        invitationResult.success ===
          false &&
        invitationResult.invitationCreated ===
          true
      ) {
        setInvitationFailureMessage(
          invitationResult
            .body
            ?.error ??
            "The invitation was created, but the email could not be delivered.",
        );

        setStage(
          "invitation_warning",
        );

        window.scrollTo({
          top: 0,
          behavior:
            "smooth",
        });

        return;
      }

      /* ======================================================
       * 4. COMPLETE SUCCESS
       * ====================================================== */

      window.location.assign(
        `/dashboard/investments/joint/${jointSubscriptionId}`,
      );
    } catch (
      error
    ) {
      /*
       * Only return to the review stage if no known joint
       * subscription was created.
       */
      setStage(
        "review",
      );

      setSubmitError(
        error instanceof
          Error
          ? error.message
          : "Unable to create the joint investment.",
      );

      window.scrollTo({
        top: 0,
        behavior:
          "smooth",
      });
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  /* ==========================================================
   * PARTIAL SUCCESS / INVITATION WARNING
   * ========================================================== */

  if (
    stage ===
      "invitation_warning" &&
    createdJointSubscriptionId
  ) {
    return (
      <div className="mx-auto max-w-3xl">
        <section className="overflow-hidden rounded-[1.75rem] border border-amber-200 bg-white">
          <div className="bg-forest-950 p-6 text-white sm:p-9">
            <div className="flex size-12 items-center justify-center rounded-full bg-white/10">
              <CheckCircle2 className="size-5 text-gold-400" />
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
              Joint Investment
              Created
            </p>

            <h1 className="font-display mt-3 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
              Your joint
              investment exists.
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65">
              Your joint
              investment and
              initiator consent
              have been recorded.
              However, the
              invitation process
              needs attention.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="rounded-[1.25rem] border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-semibold text-amber-950">
                Invitation not
                fully completed
              </p>

              <p className="mt-2 text-sm leading-7 text-amber-900">
                {invitationFailureMessage ||
                  "The joint investment was created, but the invitation could not be completed."}
              </p>
            </div>

            <div className="mt-6 rounded-[1.25rem] bg-ivory-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
                Important
              </p>

              <p className="mt-2 text-sm leading-7 text-stone-600">
                Do not create
                another joint
                investment for
                this commitment.
                The existing
                investment should
                be used for any
                invitation recovery
                or resend action.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                window.location.assign(
                  `/dashboard/investments/joint/${createdJointSubscriptionId}`,
                );
              }}
              className="focus-ring mt-7 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800"
            >
              Open joint
              investment

              <ArrowRight className="size-4" />
            </button>
          </div>
        </section>
      </div>
    );
  }

  /* ==========================================================
   * SUBMITTING
   * ========================================================== */

  if (
    stage ===
    "submitting"
  ) {
    return (
      <div className="mx-auto max-w-3xl">
        <section className="overflow-hidden rounded-[1.75rem] bg-forest-950 text-white">
          <div className="p-8 text-center sm:p-12">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-white/10">
              <Loader2 className="size-6 animate-spin text-gold-400" />
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
              Creating Joint
              Investment
            </p>

            <h1 className="font-display mt-3 text-4xl font-semibold tracking-[-0.035em]">
              Recording your
              investment and
              consent.
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/65">
              Please keep this
              page open while we
              create the joint
              investment, record
              your electronic
              consent and issue the
              secure invitation to
              the second investor.
            </p>
          </div>
        </section>
      </div>
    );
  }

  /* ==========================================================
   * REVIEW STAGE
   * ========================================================== */

  if (
    stage === "review" &&
    selectedInvestor
  ) {
    const allAcknowledged =
      ownershipAcknowledged &&
      fundingAcknowledged &&
      riskAcknowledged &&
      termsAcknowledged;

    const acknowledgementCount =
      [
        ownershipAcknowledged,
        fundingAcknowledged,
        riskAcknowledged,
        termsAcknowledged,
      ].filter(
        Boolean,
      ).length;

    const validSignature =
      signatureName
        .trim()
        .length >= 2;

    const canSubmit =
      validCommitment &&
      allAcknowledged &&
      validSignature &&
      !submitting &&
      !createdJointSubscriptionId;

    return (
      <div className="space-y-8">
        {/* ====================================================
            BACK
        ==================================================== */}

        {!createdJointSubscriptionId ? (
          <button
            type="button"
            disabled={
              submitting
            }
            onClick={() => {
              setSubmitError(
                "",
              );

              setStage(
                "create",
              );

              window.scrollTo({
                top: 0,
                behavior:
                  "smooth",
              });
            }}
            className="focus-ring inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-forest-950 transition hover:text-gold-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft className="size-4" />

            Back to joint
            investment
          </button>
        ) : null}

        {/* ====================================================
            HERO
        ==================================================== */}

        <section className="overflow-hidden rounded-[1.75rem] bg-forest-950 text-white">
          <div className="p-6 sm:p-9">
            <div className="flex size-12 items-center justify-center rounded-full bg-white/10">
              <FileCheck2 className="size-5 text-gold-400" />
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
              Joint Investment
              Review
            </p>

            <h1 className="font-display mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
              Review and sign your
              joint investment.
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65">
              Review the
              commitment,
              ownership structure
              and funding
              obligations
              carefully. Your
              joint investment
              will only be created
              after you
              acknowledge these
              terms and provide
              your electronic
              signature.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              <span className="rounded-full bg-gold-400 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-forest-950">
                50 / 50 ownership
              </span>

              <span className="rounded-full border border-white/15 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white/75">
                Two investor
                consent
              </span>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <div className="space-y-8">
            {/* ================================================
                STRUCTURE
            ================================================ */}

            <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
                Investment
                Structure
              </p>

              <h2 className="font-display mt-2 text-3xl font-semibold text-forest-950">
                Your proposed
                joint investment
              </h2>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <ReviewValue
                  label="Opportunity"
                  value={
                    opportunity.title
                  }
                />

                <ReviewValue
                  label="Total commitment"
                  value={formatMoney(
                    commitmentCents,
                    opportunity.currency,
                  )}
                />

                <ReviewValue
                  label="Your ownership"
                  value="50%"
                />

                <ReviewValue
                  label="Your funding obligation"
                  value={formatMoney(
                    memberAmount,
                    opportunity.currency,
                  )}
                />

                <ReviewValue
                  label="Joint investor"
                  value={investorName(
                    selectedInvestor,
                  )}
                />

                <ReviewValue
                  label="Joint investor obligation"
                  value={formatMoney(
                    memberAmount,
                    opportunity.currency,
                  )}
                />
              </div>
            </section>

            {/* ================================================
                MEMBERS
            ================================================ */}

            <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
              <UsersRound className="size-5 text-gold-600" />

              <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
                Two-member
                ownership
              </h2>

              <p className="mt-3 text-sm leading-7 text-stone-600">
                This joint
                investment uses a
                fixed equal
                ownership and
                funding structure.
              </p>

              <div className="mt-7 overflow-hidden rounded-3xl border border-forest-900/10">
                <div className="grid sm:grid-cols-2">
                  <div className="bg-ivory-50 p-5 sm:p-6">
                    <span className="rounded-full bg-forest-950 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-white">
                      You ·
                      Initiator
                    </span>

                    <p className="font-display mt-5 text-3xl font-semibold text-forest-950">
                      50%
                    </p>

                    <p className="mt-2 text-sm text-stone-500">
                      {formatMoney(
                        memberAmount,
                        opportunity.currency,
                      )}{" "}
                      funding
                      obligation
                    </p>
                  </div>

                  <div className="border-t border-forest-900/10 bg-white p-5 sm:border-l sm:border-t-0 sm:p-6">
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-stone-600">
                      Invited
                      investor
                    </span>

                    <p className="mt-5 text-sm font-semibold text-forest-950">
                      {investorName(
                        selectedInvestor,
                      )}
                    </p>

                    <p className="mt-1 break-all text-xs text-stone-500">
                      {
                        selectedInvestor.email
                      }
                    </p>

                    <p className="font-display mt-4 text-3xl font-semibold text-forest-950">
                      50%
                    </p>

                    <p className="mt-2 text-sm text-stone-500">
                      {formatMoney(
                        memberAmount,
                        opportunity.currency,
                      )}{" "}
                      funding
                      obligation
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ================================================
                ACKNOWLEDGEMENTS
            ================================================ */}

            <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
              <ShieldCheck className="size-5 text-gold-600" />

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
                Required Consent
              </p>

              <h2 className="font-display mt-2 text-3xl font-semibold text-forest-950">
                Review each
                acknowledgement
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
                All four items must
                be acknowledged
                before you can
                electronically sign
                and create the
                joint investment.
              </p>

              <div className="mt-7 space-y-3">
                <Acknowledgement
                  checked={
                    ownershipAcknowledged
                  }
                  disabled={
                    submitting
                  }
                  onChange={
                    setOwnershipAcknowledged
                  }
                  title="Joint ownership"
                >
                  I acknowledge that
                  this investment is
                  owned equally by
                  the two joint
                  investors, with
                  each investor
                  holding a 50%
                  ownership
                  interest.
                </Acknowledgement>

                <Acknowledgement
                  checked={
                    fundingAcknowledged
                  }
                  disabled={
                    submitting
                  }
                  onChange={
                    setFundingAcknowledged
                  }
                  title="Funding obligation"
                >
                  I acknowledge that
                  I am responsible
                  for exactly 50% of
                  the total joint
                  commitment and
                  that the other
                  investor is
                  separately
                  responsible for
                  their 50% funding
                  obligation.
                </Acknowledgement>

                <Acknowledgement
                  checked={
                    riskAcknowledged
                  }
                  disabled={
                    submitting
                  }
                  onChange={
                    setRiskAcknowledged
                  }
                  title="Risk disclosure"
                >
                  I acknowledge that
                  I have reviewed
                  the applicable
                  investment risk
                  disclosures and
                  understand that
                  the investment
                  involves risk,
                  including
                  potential loss of
                  invested capital.
                </Acknowledgement>

                <Acknowledgement
                  checked={
                    termsAcknowledged
                  }
                  disabled={
                    submitting
                  }
                  onChange={
                    setTermsAcknowledged
                  }
                  title="Joint investment terms"
                >
                  I acknowledge the
                  joint investment
                  terms and
                  understand that
                  the invited
                  investor must
                  independently
                  review and accept
                  their own consent
                  before this joint
                  investment can
                  proceed to
                  administrative
                  review.
                </Acknowledgement>
              </div>
            </section>

            {/* ================================================
                SIGNATURE
            ================================================ */}

            <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
              <Signature className="size-5 text-gold-600" />

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
                Electronic
                Signature
              </p>

              <h2 className="font-display mt-2 text-3xl font-semibold text-forest-950">
                Sign as the
                initiating investor
              </h2>

              <p className="mt-3 text-sm leading-7 text-stone-600">
                Type your full
                legal name below.
                Your typed name
                will be recorded
                as your electronic
                signature together
                with the consent
                record.
              </p>

              <label className="mt-7 block">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.13em] text-stone-400">
                  Full legal name
                </span>

                <input
                  type="text"
                  value={
                    signatureName
                  }
                  disabled={
                    submitting
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
                  placeholder="Type your full legal name"
                  className="focus-ring mt-2 min-h-12 w-full rounded-xl border border-forest-900/10 bg-white px-4 text-sm font-semibold text-forest-950 outline-none placeholder:font-normal placeholder:text-stone-400 disabled:cursor-not-allowed disabled:bg-stone-50"
                />
              </label>
            </section>

            {/* ================================================
                ERROR
            ================================================ */}

            {submitError ? (
              <div className="rounded-[1.25rem] border border-red-200 bg-red-50 p-5">
                <p className="text-sm font-semibold text-red-900">
                  Unable to
                  continue
                </p>

                <p className="mt-2 text-sm leading-6 text-red-800">
                  {submitError}
                </p>

                {createdJointSubscriptionId ? (
                  <button
                    type="button"
                    onClick={() => {
                      window.location.assign(
                        `/dashboard/investments/joint/${createdJointSubscriptionId}`,
                      );
                    }}
                    className="focus-ring mt-4 inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-xs font-semibold text-white"
                  >
                    Open existing
                    joint investment

                    <ArrowRight className="size-3.5" />
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* ==================================================
              SIDEBAR
          ================================================== */}

          <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
            <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
                Review Summary
              </p>

              <h3 className="font-display mt-2 text-2xl font-semibold text-forest-950">
                Before you sign
              </h3>

              <div className="mt-6 space-y-5">
                <SummaryValue
                  label="Total commitment"
                  value={formatMoney(
                    commitmentCents,
                    opportunity.currency,
                  )}
                />

                <SummaryValue
                  label="Your obligation"
                  value={formatMoney(
                    memberAmount,
                    opportunity.currency,
                  )}
                />

                <SummaryValue
                  label="Your ownership"
                  value="50%"
                />

                <SummaryValue
                  label="Joint investor"
                  value={investorName(
                    selectedInvestor,
                  )}
                />

                <SummaryValue
                  label="Acknowledgements"
                  value={`${acknowledgementCount} / 4 reviewed`}
                />
              </div>
            </section>

            <section className="rounded-[1.75rem] bg-ivory-50 p-6">
              <CheckCircle2 className="size-5 text-forest-950" />

              <h3 className="font-display mt-4 text-xl font-semibold text-forest-950">
                What happens after
                signing?
              </h3>

              <p className="mt-3 text-sm leading-7 text-stone-600">
                The joint
                investment will be
                created and the
                second investor
                will receive a
                secure invitation.
                They must sign
                their own consent
                before the
                investment is
                submitted for
                administrative
                review.
              </p>
            </section>

            {createdJointSubscriptionId ? (
              <button
                type="button"
                onClick={() => {
                  window.location.assign(
                    `/dashboard/investments/joint/${createdJointSubscriptionId}`,
                  );
                }}
                className="focus-ring flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800"
              >
                Open joint
                investment

                <ArrowRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={
                  !canSubmit
                }
                onClick={
                  submitJointInvestment
                }
                className="focus-ring flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />

                    Creating joint
                    investment...
                  </>
                ) : (
                  <>
                    Sign & create
                    joint investment

                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            )}

            <p className="px-2 text-center text-[0.7rem] leading-5 text-stone-400">
              The invited investor
              cannot be accepted
              on your behalf. They
              must authenticate
              and provide their own
              consent.
            </p>
          </aside>
        </div>
      </div>
    );
  }

  /* ==========================================================
   * CREATION STAGE
   * ========================================================== */

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
      <div className="space-y-8">
        {/* ====================================================
            OPPORTUNITY
        ==================================================== */}

        <section className="overflow-hidden rounded-[1.75rem] bg-forest-950 text-white">
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gold-400 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-forest-950">
                Joint · 50/50
              </span>

              {opportunity.assetCategory ? (
                <span className="rounded-full border border-white/15 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white/70">
                  {humanize(
                    opportunity.assetCategory,
                  )}
                </span>
              ) : null}
            </div>

            <h1 className="font-display mt-6 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
              {opportunity.title}
            </h1>

            {opportunity.location ? (
              <p className="mt-3 text-sm text-white/55">
                {
                  opportunity.location
                }
              </p>
            ) : null}

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65">
              Create one shared
              investment with
              another eligible
              Tevuah Reserve
              investor. Ownership
              and funding are fixed
              equally at 50% per
              member.
            </p>
          </div>
        </section>

        {/* ====================================================
            STEP 1 — COMMITMENT
        ==================================================== */}

        <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <StepNumber>
              1
            </StepNumber>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
                Commitment
              </p>

              <h2 className="font-display mt-2 text-3xl font-semibold text-forest-950">
                Set the joint
                commitment
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
                Enter the total
                amount both
                investors will
                commit together.
                Each investor will
                be responsible for
                exactly half.
              </p>
            </div>
          </div>

          <label className="mt-8 block">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.13em] text-stone-400">
              Total joint
              commitment
            </span>

            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-stone-400">
                $
              </span>

              <input
                type="text"
                inputMode="decimal"
                value={
                  commitment
                }
                onChange={(
                  event,
                ) =>
                  setCommitment(
                    sanitizeMoneyInput(
                      event.target
                        .value,
                    ),
                  )
                }
                placeholder="500,000"
                className="focus-ring min-h-14 w-full rounded-xl border border-forest-900/10 bg-white pl-8 pr-4 text-lg font-semibold text-forest-950 outline-none placeholder:font-normal placeholder:text-stone-300"
              />
            </div>
          </label>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <SmallFinancialCard
              label="Minimum joint commitment"
              value={formatMoney(
                opportunity.minimumInvestmentCents,
                opportunity.currency,
              )}
            />

            <SmallFinancialCard
              label="Available allocation"
              value={formatMoney(
                opportunity.remainingCapacityCents,
                opportunity.currency,
              )}
            />
          </div>

          {belowMinimum ? (
            <ValidationMessage>
              The total joint
              commitment must be
              at least{" "}
              {formatMoney(
                opportunity.minimumInvestmentCents,
                opportunity.currency,
              )}
              .
            </ValidationMessage>
          ) : null}

          {aboveCapacity ? (
            <ValidationMessage>
              This commitment is
              greater than the
              currently available
              allocation of{" "}
              {formatMoney(
                opportunity.remainingCapacityCents,
                opportunity.currency,
              )}
              .
            </ValidationMessage>
          ) : null}

          {invalidSplit ? (
            <ValidationMessage>
              The commitment must
              split evenly between
              both investors down
              to the cent.
            </ValidationMessage>
          ) : null}

          {validCommitment ? (
            <div className="mt-6 overflow-hidden rounded-3xl border border-forest-900/10">
              <div className="grid sm:grid-cols-2">
                <div className="bg-ivory-50 p-5">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
                    Your obligation
                  </p>

                  <p className="font-display mt-2 text-2xl font-semibold text-forest-950">
                    {formatMoney(
                      memberAmount,
                      opportunity.currency,
                    )}
                  </p>

                  <p className="mt-1 text-xs text-stone-500">
                    50% of total
                    commitment
                  </p>
                </div>

                <div className="border-t border-forest-900/10 bg-white p-5 sm:border-l sm:border-t-0">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
                    Joint investor
                    obligation
                  </p>

                  <p className="font-display mt-2 text-2xl font-semibold text-forest-950">
                    {formatMoney(
                      memberAmount,
                      opportunity.currency,
                    )}
                  </p>

                  <p className="mt-1 text-xs text-stone-500">
                    50% of total
                    commitment
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        {/* ====================================================
            STEP 2 — INVESTOR
        ==================================================== */}

        <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <StepNumber>
              2
            </StepNumber>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
                Joint Investor
              </p>

              <h2 className="font-display mt-2 text-3xl font-semibold text-forest-950">
                Choose your joint
                investor
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
                Enter the exact
                email address of
                the Tevuah Reserve
                investor you want
                to invite.
              </p>
            </div>
          </div>

          {!selectedInvestor ? (
            <>
              <label className="mt-8 block">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.13em] text-stone-400">
                  Investor email
                </span>

                <div className="relative mt-2">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />

                  <input
                    type="email"
                    value={
                      investorSearch
                    }
                    onChange={(
                      event,
                    ) =>
                      setInvestorSearch(
                        event.target
                          .value,
                      )
                    }
                    autoComplete="off"
                    placeholder="investor@example.com"
                    className="focus-ring min-h-12 w-full rounded-xl border border-forest-900/10 bg-white pl-11 pr-4 text-sm font-semibold text-forest-950 outline-none placeholder:font-normal placeholder:text-stone-400"
                  />

                  {searching ? (
                    <Loader2 className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-stone-400" />
                  ) : null}
                </div>
              </label>

              <p className="mt-3 text-xs leading-5 text-stone-500">
                For privacy,
                search requires
                the exact investor
                email address.
                Tevuah Reserve
                does not expose an
                investor
                directory.
              </p>

              {searchError ? (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
                  {searchError}
                </div>
              ) : null}

              {!searching &&
              investorSearch
                .trim()
                .includes(
                  "@",
                ) &&
              investorSearch
                .trim()
                .length >=
                5 &&
              investorResults.length ===
                0 &&
              !searchError ? (
                <div className="mt-5 rounded-xl bg-ivory-50 p-4">
                  <p className="text-sm font-semibold text-forest-950">
                    No investor
                    found
                  </p>

                  <p className="mt-1 text-xs leading-5 text-stone-500">
                    Check the email
                    address and
                    make sure the
                    other person
                    already has an
                    eligible Tevuah
                    Reserve
                    investor
                    account.
                  </p>
                </div>
              ) : null}

              {investorResults.length >
              0 ? (
                <div className="mt-5 space-y-3">
                  {investorResults.map(
                    (
                      investor,
                    ) => (
                      <button
                        key={
                          investor.id
                        }
                        type="button"
                        onClick={() => {
                          setSelectedInvestor(
                            investor,
                          );
                setInvestorResults(
                  [],
                );

                setSearchError(
                  "",
                );

                setSearching(
                  false,
                );

                          setInvestorResults(
                            [],
                          );

                          setSearchError(
                            "",
                          );
                        }}
                        className="focus-ring flex w-full cursor-pointer items-center gap-4 rounded-[1.25rem] border border-forest-900/10 bg-white p-4 text-left transition hover:border-forest-900/20 hover:bg-ivory-50"
                      >
                        <InvestorAvatar
                          investor={
                            investor
                          }
                        />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-forest-950">
                            {investorName(
                              investor,
                            )}
                          </p>

                          <p className="mt-1 truncate text-xs text-stone-500">
                            {
                              investor.email
                            }
                          </p>
                        </div>

                        <ArrowRight className="size-4 shrink-0 text-stone-400" />
                      </button>
                    ),
                  )}
                </div>
              ) : null}
            </>
          ) : (
            <div className="mt-8 rounded-3xl border border-forest-900/10 bg-ivory-50 p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <InvestorAvatar
                  investor={
                    selectedInvestor
                  }
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-forest-950">
                      {investorName(
                        selectedInvestor,
                      )}
                    </p>

                    <span className="rounded-full bg-forest-950 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-white">
                      Selected
                    </span>
                  </div>

                  <p className="mt-1 break-all text-xs text-stone-500">
                    {
                      selectedInvestor.email
                    }
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Remove selected investor"
                  onClick={() => {
                    setSelectedInvestor(
                      null,
                    );

                    setInvestorSearch(
                      "",
                    );

                    setInvestorResults(
                      [],
                    );

                    setSearchError(
                      "",
                    );
                  }}
                  className="focus-ring flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-forest-900/10 bg-white text-stone-500 transition hover:text-red-600"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="mt-5 grid gap-3 border-t border-forest-900/10 pt-5 sm:grid-cols-2">
                <SmallFinancialCard
                  label="Ownership"
                  value="50%"
                />

                <SmallFinancialCard
                  label="Funding obligation"
                  value={
                    validCommitment
                      ? formatMoney(
                          memberAmount,
                          opportunity.currency,
                        )
                      : "Set commitment first"
                  }
                />
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ======================================================
          SUMMARY SIDEBAR
      ====================================================== */}

      <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
        <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
            Joint Summary
          </p>

          <h3 className="font-display mt-2 text-2xl font-semibold text-forest-950">
            Equal ownership.
            Equal obligation.
          </h3>

          <div className="mt-6 space-y-5">
            <SummaryValue
              label="Total commitment"
              value={
                commitmentCents >
                0
                  ? formatMoney(
                      commitmentCents,
                      opportunity.currency,
                    )
                  : "Not set"
              }
            />

            <SummaryValue
              label="Your ownership"
              value="50%"
            />

            <SummaryValue
              label="Your obligation"
              value={
                validCommitment
                  ? formatMoney(
                      memberAmount,
                      opportunity.currency,
                    )
                  : "—"
              }
            />

            <SummaryValue
              label="Joint investor"
              value={
                selectedInvestor
                  ? investorName(
                      selectedInvestor,
                    )
                  : "Not selected"
              }
            />

            <SummaryValue
              label="Joint investor ownership"
              value="50%"
            />

            <SummaryValue
              label="Joint investor obligation"
              value={
                validCommitment
                  ? formatMoney(
                      memberAmount,
                      opportunity.currency,
                    )
                  : "—"
              }
            />
          </div>
        </section>

        <section className="rounded-[1.75rem] bg-ivory-50 p-6">
          <UsersRound className="size-5 text-forest-950" />

          <h3 className="font-display mt-4 text-xl font-semibold text-forest-950">
            Both investors must
            consent
          </h3>

          <p className="mt-3 text-sm leading-7 text-stone-600">
            You will review and
            sign first. After the
            joint investment is
            created, the second
            investor receives a
            secure invitation and
            must independently
            accept and sign.
          </p>
        </section>

        <button
          type="button"
          disabled={
            !canContinue
          }
          onClick={
            continueToReview
          }
          className="focus-ring flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue to review

          <ArrowRight className="size-4" />
        </button>

        {!validCommitment ? (
          <p className="px-2 text-center text-[0.7rem] leading-5 text-stone-400">
            Enter a valid joint
            commitment before
            continuing.
          </p>
        ) : !selectedInvestor ? (
          <p className="px-2 text-center text-[0.7rem] leading-5 text-stone-400">
            Select the second
            investor before
            continuing.
          </p>
        ) : null}
      </aside>
    </div>
  );
}

/* ============================================================
 * COMPONENT HELPERS
 * ============================================================ */

function StepNumber({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-forest-950 text-sm font-semibold text-white">
      {children}
    </div>
  );
}

function InvestorAvatar({
  investor,
}: {
  investor: InvestorResult;
}) {
  const initials =
    [
      investor.firstName,
      investor.lastName,
    ]
      .filter(
        Boolean,
      )
      .map(
        (value) =>
          value
            ?.charAt(0)
            .toUpperCase(),
      )
      .join("")
      .slice(
        0,
        2,
      ) || "I";

  return (
    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest-950 text-xs font-semibold uppercase text-white">
      {initials}
    </div>
  );
}

function SmallFinancialCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-ivory-50 p-4">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

function ReviewValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-ivory-50 p-4">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <p className="mt-2 wrap-break-word text-sm font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

function SummaryValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-forest-900/10 pb-4 last:border-b-0 last:pb-0">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <p className="mt-2 wrap-break-word text-sm font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

function ValidationMessage({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-xs leading-6 text-red-800">
      {children}
    </div>
  );
}

function Acknowledgement({
  checked,
  disabled,
  onChange,
  title,
  children,
}: {
  checked: boolean;

  disabled?: boolean;

  onChange: (
    value: boolean,
  ) => void;

  title: string;

  children: ReactNode;
}) {
  return (
    <label
      className={`flex gap-4 rounded-[1.25rem] border p-5 transition ${
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer"
      } ${
        checked
          ? "border-forest-900/20 bg-ivory-50"
          : "border-forest-900/10 bg-white"
      }`}
    >
      <input
        type="checkbox"
        checked={
          checked
        }
        disabled={
          disabled
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
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition ${
          checked
            ? "border-forest-950 bg-forest-950 text-white"
            : "border-stone-300 bg-white text-transparent"
        }`}
      >
        <Check className="size-3" />
      </span>

      <span>
        <span className="block text-sm font-semibold text-forest-950">
          {title}
        </span>

        <span className="mt-2 block text-xs leading-6 text-stone-500">
          {children}
        </span>
      </span>
    </label>
  );
}

/* ============================================================
 * FORMATTERS
 * ============================================================ */

function investorName(
  investor: InvestorResult,
) {
  const name =
    [
      investor.firstName,
      investor.lastName,
    ]
      .filter(
        Boolean,
      )
      .join(" ")
      .trim();

  return (
    name ||
    investor.email
  );
}

function sanitizeMoneyInput(
  value: string,
) {
  const cleaned =
    value
      .replace(
        /[^0-9.,]/g,
        "",
      )
      .replaceAll(
        ",",
        "",
      );

  const [
    whole,
    ...decimalParts
  ] =
    cleaned.split(
      ".",
    );

  const decimal =
    decimalParts
      .join("")
      .slice(
        0,
        2,
      );

  const normalizedWhole =
    whole.replace(
      /^0+(?=\d)/,
      "",
    );

  const formattedWhole =
    normalizedWhole
      ? Number(
          normalizedWhole,
        ).toLocaleString(
          "en-US",
        )
      : "";

  if (
    cleaned.includes(
      ".",
    )
  ) {
    return `${formattedWhole}.${decimal}`;
  }

  return formattedWhole;
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
      (letter) =>
        letter.toUpperCase(),
    );
}

function formatMoney(
  cents: number,
  currency = "USD",
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style:
        "currency",

      currency:
        currency ||
        "USD",

      maximumFractionDigits:
        2,
    },
  ).format(
    cents / 100,
  );
}