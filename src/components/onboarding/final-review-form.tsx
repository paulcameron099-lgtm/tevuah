"use client";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import { Button } from "@/src/components/ui/button";

type ReviewSection = {
  id: string;

  key: string;

  title: string;

  description: string;

  href: string;

  completed: boolean;

  status?:
    | string
    | null;

  missingReasons:
    string[];

  details: {
    label: string;
    value: string;
  }[];
};

type FinalReviewFormProps = {
  investorName: string;

  sections:
    ReviewSection[];

  completedCount: number;

  incompleteSections:
    ReviewSection[];

  alreadySubmitted: boolean;

  submittedAt?:
    | string
    | null;

  onboardingStatus: string;
};

export function FinalReviewForm({
  investorName,
  sections,
  completedCount,
  incompleteSections,
  alreadySubmitted,
  submittedAt,
  onboardingStatus,
}: FinalReviewFormProps) {
  /*
   * --------------------------------------------------
   * 1. STATUS
   * --------------------------------------------------
   */
  const isApproved =
    onboardingStatus ===
    "approved";

  const isUnderReview =
    onboardingStatus ===
    "under_review";

  const isActionRequired =
    onboardingStatus ===
    "action_required";

  const isRejected =
    onboardingStatus ===
    "rejected";

  /*
   * Brand-new final submission:
   * alreadySubmitted = false
   *
   * Correction/resubmission:
   * alreadySubmitted = true
   * onboardingStatus = action_required
   *
   * Both situations must allow final submission.
   */
  const canSubmit =
    !alreadySubmitted ||
    isActionRequired;

  const router =
    useRouter();

  /*
   * --------------------------------------------------
   * 2. DECLARATION STATE
   * --------------------------------------------------
   */
  const [
    accuracyConfirmed,
    setAccuracyConfirmed,
  ] =
    useState(false);

  const [
    informationCurrentConfirmed,
    setInformationCurrentConfirmed,
  ] =
    useState(false);

  const [
    riskAcknowledged,
    setRiskAcknowledged,
  ] =
    useState(false);

  const [
    electronicSignature,
    setElectronicSignature,
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
    useState<
      string | null
    >(null);

  /*
   * --------------------------------------------------
   * 3. COMPLETION
   * --------------------------------------------------
   */
  const allComplete =
    completedCount ===
    sections.length;

  /*
   * --------------------------------------------------
   * 4. FINAL SUBMISSION
   * --------------------------------------------------
   */
  async function submitOnboarding() {
    setError(null);

    if (!allComplete) {
      setError(
        "Complete every onboarding section before final submission.",
      );

      return;
    }

    if (!accuracyConfirmed) {
      setError(
        "Confirm that your submitted information is accurate.",
      );

      return;
    }

    if (
      !informationCurrentConfirmed
    ) {
      setError(
        "Confirm that your information is current and complete.",
      );

      return;
    }

    if (!riskAcknowledged) {
      setError(
        "Accept the final investment and compliance acknowledgement.",
      );

      return;
    }

    if (
      !electronicSignature.trim()
    ) {
      setError(
        "Enter your full legal name as your electronic signature.",
      );

      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/onboarding/review",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                accuracyConfirmed,

                informationCurrentConfirmed,

                riskAcknowledged,

                electronicSignature,
              }),
          },
        );

      const result =
        (await response.json()) as {
          success?: boolean;
          error?: string;
          next?: string;
        };

      if (!response.ok) {
        setError(
          result.error ??
            "Unable to submit onboarding.",
        );

        return;
      }

      router.push(
        result.next ??
          "/dashboard",
      );

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "Final onboarding submission error:",
        requestError,
      );

      setError(
        "Unable to submit onboarding. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * --------------------------------------------------
   * 5. RENDER
   * --------------------------------------------------
   */
  return (
    <div className="space-y-8">
      {/* ==========================================
          CURRENT COMPLIANCE STATUS
      ========================================== */}

      {alreadySubmitted ? (
        <>
          {/* APPROVED */}

          {isApproved ? (
            <section className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-7 sm:p-8">
              <CheckCircle2 className="size-6 text-emerald-700" />

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Approved
              </p>

              <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
                Your investor verification has been
                approved.
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
                Your onboarding information has been
                reviewed and approved by the Tevuah
                Reserve compliance team.
              </p>

              {submittedAt ? (
                <p className="mt-4 text-xs text-stone-500">
                  Originally submitted{" "}
                  {new Date(
                    submittedAt,
                  ).toLocaleString()}
                </p>
              ) : null}
            </section>
          ) : isUnderReview ? (
            /*
             * UNDER REVIEW
             */
            <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-7 sm:p-8">
              <CheckCircle2 className="size-6 text-amber-700" />

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                Submitted
              </p>

              <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
                Your onboarding package is under
                review.
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
                Your investor information has been
                submitted to the Tevuah Reserve
                compliance review queue.
              </p>

              {submittedAt ? (
                <p className="mt-4 text-xs text-stone-500">
                  Submitted{" "}
                  {new Date(
                    submittedAt,
                  ).toLocaleString()}
                </p>
              ) : null}
            </section>
          ) : isActionRequired ? (
            /*
             * ACTION REQUIRED
             */
            <section className="rounded-[1.75rem] border border-red-200 bg-red-50 p-7 sm:p-8">
              <AlertCircle className="size-6 text-red-700" />

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-red-700">
                Action required
              </p>

              <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
                Additional information is required.
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
                The compliance team requested updates
                to your onboarding information. Fix
                the incomplete or reopened sections
                below and submit the package again.
              </p>
            </section>
          ) : isRejected ? (
            /*
             * REJECTED
             */
            <section className="rounded-[1.75rem] border border-red-200 bg-red-50 p-7 sm:p-8">
              <AlertCircle className="size-6 text-red-700" />

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-red-700">
                Not approved
              </p>

              <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
                Your verification was not approved.
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
                Review any guidance provided by the
                Tevuah Reserve compliance team before
                taking further action.
              </p>
            </section>
          ) : null}
        </>
      ) : null}

      {/* ==========================================
          REVIEW HEADER
      ========================================== */}

      <section>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Review information
            </p>

            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Review every onboarding section.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Each section below is checked against
              the information and documents currently
              saved to your investor account.
            </p>
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-2xl font-semibold text-forest-950">
              {completedCount}/
              {sections.length}
            </p>

            <p className="mt-1 text-xs text-stone-500">
              sections completed
            </p>
          </div>
        </div>

        {/* Mobile completion count */}

        <div className="mt-5 rounded-xl border border-forest-900/10 bg-white p-4 sm:hidden">
          <p className="text-sm font-semibold text-forest-950">
            {completedCount}/
            {sections.length}
          </p>

          <p className="mt-1 text-xs text-stone-500">
            sections completed
          </p>
        </div>

        {/* ========================================
            INCOMPLETE WARNING
        ======================================== */}

        {completedCount <
        sections.length ? (
          <section className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-700" />

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-700">
                  Onboarding incomplete
                </p>

                <h3 className="font-display mt-2 text-2xl font-semibold text-forest-950">
                  {sections.length -
                    completedCount}{" "}
                  {sections.length -
                    completedCount ===
                  1
                    ? "section still needs attention."
                    : "sections still need attention."}
                </h3>

                <p className="mt-2 text-sm leading-7 text-stone-600">
                  The exact reason for each incomplete
                  section is shown below.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {incompleteSections.map(
                (section) => (
                  <div
                    key={
                      section.id
                    }
                    className="rounded-xl border border-red-200 bg-white p-4"
                  >
                    <p className="text-sm font-semibold text-forest-950">
                      {
                        section.title
                      }
                    </p>

                    {section.missingReasons
                      .length > 0 ? (
                      <ul className="mt-3 space-y-2">
                        {section.missingReasons.map(
                          (
                            reason,
                          ) => (
                            <li
                              key={
                                reason
                              }
                              className="flex items-start gap-2 text-sm leading-6 text-red-800"
                            >
                              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-red-600" />

                              <span>
                                {
                                  reason
                                }
                              </span>
                            </li>
                          ),
                        )}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-red-800">
                        All visible information appears
                        present, but this section has
                        not been marked completed.
                        Open the section and submit it
                        again.
                      </p>
                    )}

                    <Button
                      href={
                        section.href
                      }
                      variant="secondary"
                      className="mt-4"
                    >
                      Fix this section

                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                ),
              )}
            </div>
          </section>
        ) : (
          /*
           * ALL SIX COMPLETE
           */
          <div className="mt-6 flex items-start gap-3 rounded-[1.25rem] border border-emerald-200 bg-emerald-50 p-5">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" />

            <div>
              <p className="text-sm font-semibold text-emerald-900">
                All 6 onboarding sections are
                complete.
              </p>

              <p className="mt-1 text-xs leading-6 text-emerald-800">
                Review the information below before
                completing the final declarations.
              </p>
            </div>
          </div>
        )}

        {/* ========================================
            SECTION CARDS
        ======================================== */}

        <div className="mt-7 space-y-5">
          {sections.map(
            (section) => (
              <ReviewSectionCard
                key={
                  section.id
                }
                section={
                  section
                }
              />
            ),
          )}
        </div>
      </section>

      {/* ==========================================
          FINAL DECLARATIONS

          Show for:
          1. first submission
          2. action_required resubmission

          Hide for:
          approved / normal under-review / rejected
      ========================================== */}

      {canSubmit ? (
        <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest-950 text-gold-400">
              <ShieldCheck className="size-5" />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
                Final declarations
              </p>

              <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
                {isActionRequired
                  ? "Confirm your corrected submission."
                  : "Confirm before submission."}
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
                {isActionRequired
                  ? "After correcting the requested information, confirm the declarations below and resubmit your onboarding package to compliance."
                  : "Once submitted, your onboarding package will enter compliance review."}
              </p>
            </div>
          </div>

          {error ? (
            <div className="mt-7 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />

              {error}
            </div>
          ) : null}

          <div className="mt-7 space-y-4">
            <Declaration
              checked={
                accuracyConfirmed
              }
              onChange={
                setAccuracyConfirmed
              }
              title="Accuracy of information"
              description="I confirm that the information and documents I provided are accurate and complete to the best of my knowledge."
            />

            <Declaration
              checked={
                informationCurrentConfirmed
              }
              onChange={
                setInformationCurrentConfirmed
              }
              title="Information is current"
              description="I confirm that my personal, identity, address, financial and tax information is current as of this submission."
            />

            <Declaration
              checked={
                riskAcknowledged
              }
              onChange={
                setRiskAcknowledged
              }
              title="Investment and compliance acknowledgement"
              description="I understand that completing onboarding does not guarantee approval or access to any investment, and investment opportunities may involve loss, illiquidity and long holding periods."
            />
          </div>

          <div className="mt-7">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">
                Electronic signature
              </span>

              <input
                type="text"
                value={
                  electronicSignature
                }
                onChange={(
                  event,
                ) =>
                  setElectronicSignature(
                    event.target
                      .value,
                  )
                }
                placeholder={
                  investorName
                }
                className="focus-ring min-h-13 w-full rounded-xl border border-forest-900/10 bg-ivory-50 px-4 text-sm text-forest-950 outline-none"
              />

              <p className="mt-2 text-xs leading-6 text-stone-500">
                Type your full legal name.
              </p>
            </label>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-forest-900/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
            {!allComplete ? (
              <div>
                <p className="text-sm font-semibold text-red-700">
                  Complete all onboarding sections
                  before submitting.
                </p>

                <p className="mt-1 text-xs text-red-600">
                  Review the red warning above for the
                  exact missing information.
                </p>
              </div>
            ) : (
              <p className="text-sm text-stone-500">
                All required sections have been
                completed.
              </p>
            )}

            <button
              type="button"
              disabled={
                loading ||
                !allComplete
              }
              onClick={
                submitOnboarding
              }
              className="focus-ring flex min-h-13 items-center justify-center gap-2 rounded-full bg-forest-950 px-7 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />

                  {isActionRequired
                    ? "Resubmitting..."
                    : "Submitting..."}
                </>
              ) : (
                <>
                  <FileCheck2 className="size-4" />

                  {isActionRequired
                    ? "Resubmit onboarding"
                    : "Submit onboarding"}
                </>
              )}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}

/*
 * ==================================================
 * REVIEW SECTION CARD
 * ==================================================
 */
function ReviewSectionCard({
  section,
}: {
  section: ReviewSection;
}) {
  return (
    <article className="rounded-3xl border border-forest-900/10 bg-white p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
              section.completed
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {section.completed ? (
              <CheckCircle2 className="size-5" />
            ) : (
              <AlertCircle className="size-5" />
            )}
          </span>

          <div>
            <h3 className="text-sm font-semibold text-forest-950">
              {section.title}
            </h3>

            <p className="mt-1 text-xs leading-6 text-stone-500">
              {section.description}
            </p>

            <p
              className={`mt-3 text-xs font-semibold uppercase tracking-[0.12em] ${
                section.completed
                  ? "text-emerald-700"
                  : "text-red-700"
              }`}
            >
              {section.completed
                ? "Section complete"
                : "Section incomplete"}
            </p>

            {section.status ? (
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-gold-700">
                {section.status
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
                  )}
              </p>
            ) : null}
          </div>
        </div>

        <Link
          href={
            section.href
          }
          className="flex shrink-0 items-center gap-1 text-xs font-semibold text-forest-950"
        >
          Edit / review

          <ChevronRight className="size-4" />
        </Link>
      </div>

      {/* Missing reasons directly on card */}

      {!section.completed &&
      section.missingReasons.length >
        0 ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-red-700">
            Why this section is incomplete
          </p>

          <ul className="mt-3 space-y-2">
            {section.missingReasons.map(
              (
                reason,
              ) => (
                <li
                  key={
                    reason
                  }
                  className="flex items-start gap-2 text-sm leading-6 text-red-800"
                >
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-red-600" />

                  <span>
                    {reason}
                  </span>
                </li>
              ),
            )}
          </ul>
        </div>
      ) : null}

      {/* Stored section details */}

      {section.details.length >
      0 ? (
        <div className="mt-6 grid gap-4 border-t border-forest-900/10 pt-5 sm:grid-cols-2 lg:grid-cols-3">
          {section.details.map(
            (
              detail,
            ) => (
              <div
                key={
                  detail.label
                }
              >
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
                  {
                    detail.label
                  }
                </p>

                <p className="mt-1 wrap-break-word text-sm text-forest-950">
                  {detail.value ||
                    "—"}
                </p>
              </div>
            ),
          )}
        </div>
      ) : null}
    </article>
  );
}

/*
 * ==================================================
 * FINAL DECLARATION
 * ==================================================
 */
function Declaration({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;

  onChange: (
    value: boolean,
  ) => void;

  title: string;

  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-forest-900/10 bg-ivory-50 p-5">
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
        className="mt-1 size-4 shrink-0 accent-forest-950"
      />

      <span>
        <span className="block text-sm font-semibold text-forest-950">
          {title}
        </span>

        <span className="mt-1 block text-xs leading-6 text-stone-600">
          {description}
        </span>
      </span>
    </label>
  );
}