"use client";

import {
  type FormEvent,
  useState,
} from "react";

import {
  Eye,
  EyeOff,
  Loader2,
  Save,
  ShieldCheck,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

type ReviewControlsProps = {
  investorId: string;
  accountId: string;
  initialVerificationStatus: string;
  initialFundingEligibilityStatus: string;
  initialRejectionReason: string | null;
  initialAdminNotes: string | null;
  availableProtectedFields: {
    account_number: boolean;
    participant_id: boolean;
    custodian_account_identifier: boolean;
    rollover_identifier: boolean;
  };
};

type RevealField =
  | "account_number"
  | "participant_id"
  | "custodian_account_identifier"
  | "rollover_identifier";

type RevealedValue = {
  field: RevealField;
  label: string;
  value: string;
};

const PROTECTED_FIELDS: {
  field: RevealField;
  label: string;
}[] = [
  {
    field:
      "account_number",
    label:
      "Account number",
  },
  {
    field:
      "participant_id",
    label:
      "Participant ID",
  },
  {
    field:
      "custodian_account_identifier",
    label:
      "Custodian identifier",
  },
  {
    field:
      "rollover_identifier",
    label:
      "Rollover identifier",
  },
];

export function AdminRetirementAccountControls({
  investorId,
  accountId,
  initialVerificationStatus,
  initialFundingEligibilityStatus,
  initialRejectionReason,
  initialAdminNotes,
  availableProtectedFields,
}: ReviewControlsProps) {
  const router =
    useRouter();

  const [
    verificationStatus,
    setVerificationStatus,
  ] =
    useState(
      initialVerificationStatus,
    );

  const [
    fundingEligibilityStatus,
    setFundingEligibilityStatus,
  ] =
    useState(
      initialFundingEligibilityStatus,
    );

  const [
    rejectionReason,
    setRejectionReason,
  ] =
    useState(
      initialRejectionReason ??
        "",
    );

  const [
    adminNotes,
    setAdminNotes,
  ] =
    useState(
      initialAdminNotes ??
        "",
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    saveMessage,
    setSaveMessage,
  ] =
    useState("");

  const [
    saveError,
    setSaveError,
  ] =
    useState("");

  const [
    revealField,
    setRevealField,
  ] =
    useState<RevealField>(
      "account_number",
    );

  const [
    revealReason,
    setRevealReason,
  ] =
    useState("");

  const [
    revealing,
    setRevealing,
  ] =
    useState(false);

  const [
    revealError,
    setRevealError,
  ] =
    useState("");

  const [
    revealed,
    setRevealed,
  ] =
    useState<RevealedValue | null>(
      null,
    );

  async function handleReview(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setSaving(
      true,
    );
    setSaveError(
      "",
    );
    setSaveMessage(
      "",
    );

    try {
      const response =
        await fetch(
          `/api/admin/investors/${investorId}/retirement-accounts/${accountId}/review`,
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
                  verificationStatus,
                  fundingEligibilityStatus,
                  rejectionReason:
                    verificationStatus ===
                    "rejected"
                      ? rejectionReason
                      : null,
                  adminNotes,
                },
              ),
          },
        );

      const result =
        (await response.json()) as {
          success?: boolean;
          error?: string;
        };

      if (
        !response.ok ||
        !result.success
      ) {
        setSaveError(
          result.error ||
            "Unable to save review.",
        );
        return;
      }

      setSaveMessage(
        "Retirement account review saved.",
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Retirement review request error:",
        error,
      );

      setSaveError(
        "Unable to save retirement account review.",
      );
    } finally {
      setSaving(
        false,
      );
    }
  }

  async function handleReveal(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      revealing
    ) {
      return;
    }

    setRevealing(
      true,
    );
    setRevealError(
      "",
    );
    setRevealed(
      null,
    );

    try {
      const response =
        await fetch(
          `/api/admin/investors/${investorId}/retirement-accounts/${accountId}/reveal`,
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
                  field:
                    revealField,
                  reason:
                    revealReason,
                },
              ),
          },
        );

      const result =
        (await response.json()) as {
          success?: boolean;
          error?: string;
          field?: RevealField;
          label?: string;
          value?: string;
        };

      if (
        !response.ok ||
        !result.success ||
        !result.field ||
        !result.label ||
        !result.value
      ) {
        setRevealError(
          result.error ||
            "Unable to reveal protected field.",
        );
        return;
      }

      setRevealed(
        {
          field:
            result.field,
          label:
            result.label,
          value:
            result.value,
        },
      );

      setRevealReason(
        "",
      );
    } catch (error) {
      console.error(
        "Protected field reveal request error:",
        error,
      );

      setRevealError(
        "Unable to reveal protected information.",
      );
    } finally {
      setRevealing(
        false,
      );
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <form
        onSubmit={
          handleReview
        }
        className="rounded-2xl border border-forest-900/10 bg-white p-5"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
          Admin review
        </p>

        <h3 className="font-display mt-2 text-2xl font-semibold text-forest-950">
          Verification & funding
        </h3>

        <div className="mt-5 grid gap-4">
          <label>
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Verification status
            </span>

            <select
              value={
                verificationStatus
              }
              onChange={(
                event,
              ) =>
                setVerificationStatus(
                  event.target.value,
                )
              }
              className="focus-ring mt-2 min-h-11 w-full cursor-pointer rounded-xl border border-forest-900/10 bg-white px-3 text-sm text-forest-950"
            >
              <option value="unverified">
                Unverified
              </option>

              <option value="pending_review">
                Pending review
              </option>

              <option value="verified">
                Verified
              </option>

              <option value="action_required">
                Action required
              </option>

              <option value="rejected">
                Rejected
              </option>
            </select>
          </label>

          <label>
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Funding eligibility
            </span>

            <select
              value={
                fundingEligibilityStatus
              }
              onChange={(
                event,
              ) =>
                setFundingEligibilityStatus(
                  event.target.value,
                )
              }
              className="focus-ring mt-2 min-h-11 w-full cursor-pointer rounded-xl border border-forest-900/10 bg-white px-3 text-sm text-forest-950"
            >
              <option value="not_eligible">
                Not eligible
              </option>

              <option value="under_review">
                Under review
              </option>

              <option value="eligible">
                Eligible
              </option>

              <option value="suspended">
                Suspended
              </option>
            </select>
          </label>

          {verificationStatus ===
          "rejected" ? (
            <label>
              <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
                Rejection reason
              </span>

              <textarea
                required
                value={
                  rejectionReason
                }
                onChange={(
                  event,
                ) =>
                  setRejectionReason(
                    event.target.value,
                  )
                }
                rows={3}
                className="focus-ring mt-2 w-full rounded-xl border border-forest-900/10 px-3 py-3 text-sm text-forest-950"
              />
            </label>
          ) : null}

          <label>
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Internal admin notes
            </span>

            <textarea
              value={
                adminNotes
              }
              onChange={(
                event,
              ) =>
                setAdminNotes(
                  event.target.value,
                )
              }
              rows={4}
              placeholder="Internal review notes"
              className="focus-ring mt-2 w-full rounded-xl border border-forest-900/10 px-3 py-3 text-sm text-forest-950"
            />
          </label>
        </div>

        {saveError ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {saveError}
          </p>
        ) : null}

        {saveMessage ? (
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {saveMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={
            saving
          }
          className="focus-ring mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}

          {saving
            ? "Saving..."
            : "Save review"}
        </button>
      </form>

      <form
        onSubmit={
          handleReveal
        }
        className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5"
      >
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-amber-800" />

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">
              Protected information
            </p>

            <h3 className="font-display mt-2 text-2xl font-semibold text-forest-950">
              Audited identifier reveal
            </h3>

            <p className="mt-2 text-xs leading-6 text-stone-600">
              Every successful reveal requires a reason and creates an immutable sensitive-data access log. Provider access tokens cannot be revealed here.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          <label>
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Protected field
            </span>

            <select
              value={
                revealField
              }
              onChange={(
                event,
              ) => {
                setRevealField(
                  event.target.value as RevealField,
                );
                setRevealed(
                  null,
                );
              }}
              className="focus-ring mt-2 min-h-11 w-full cursor-pointer rounded-xl border border-amber-200 bg-white px-3 text-sm text-forest-950"
            >
              {PROTECTED_FIELDS.map(
                (
                  item,
                ) => (
                  <option
                    key={
                      item.field
                    }
                    value={
                      item.field
                    }
                    disabled={
                      !availableProtectedFields[
                        item.field
                      ]
                    }
                  >
                    {item.label}

                    {!availableProtectedFields[
                      item.field
                    ]
                      ? " — not stored"
                      : ""}
                  </option>
                ),
              )}
            </select>
          </label>

          <label>
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Access reason
            </span>

            <textarea
              required
              minLength={5}
              value={
                revealReason
              }
              onChange={(
                event,
              ) =>
                setRevealReason(
                  event.target.value,
                )
              }
              rows={3}
              placeholder="Explain why you need to view this identifier"
              className="focus-ring mt-2 w-full rounded-xl border border-amber-200 bg-white px-3 py-3 text-sm text-forest-950"
            />
          </label>
        </div>

        {revealError ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {revealError}
          </p>
        ) : null}

        {revealed ? (
          <div className="mt-4 rounded-xl border border-amber-300 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">
                  {revealed.label}
                </p>

                <p className="mt-2 break-all font-mono text-sm font-semibold text-forest-950">
                  {revealed.value}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  () =>
                    setRevealed(
                      null,
                    )
                }
                className="focus-ring inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-forest-900/10 bg-white text-stone-500"
                aria-label="Hide revealed value"
              >
                <EyeOff className="size-4" />
              </button>
            </div>

            <p className="mt-3 text-xs leading-5 text-amber-800">
              Hide this value when you are finished. Do not copy it into notes, email, chat or logs.
            </p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={
            revealing ||
            !availableProtectedFields[
              revealField
            ]
          }
          className="focus-ring mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-amber-900 px-5 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {revealing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Eye className="size-4" />
          )}

          {revealing
            ? "Recording & revealing..."
            : "Reveal protected field"}
        </button>
      </form>
    </div>
  );
}
