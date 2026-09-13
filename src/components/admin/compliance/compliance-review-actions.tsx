"use client";

import {
  CheckCircle2,
  Loader2,
  MessageSquareWarning,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ComplianceReviewActionsProps = {
  userId: string;
  investorName: string;
  currentStatus: string;
};

type SectionName =
  | "profile"
  | "identity"
  | "address"
  | "eligibility"
  | "suitability"
  | "tax";

type LoadingAction =
  | "approve"
  | "request"
  | "reject"
  | "reopen"
  | null;

const sectionOptions: {
  value: SectionName;
  label: string;
}[] = [
  {
    value: "profile",
    label: "Personal Profile",
  },
  {
    value: "identity",
    label: "Identity Verification",
  },
  {
    value: "address",
    label: "Address Verification",
  },
  {
    value: "eligibility",
    label: "Investor Eligibility",
  },
  {
    value: "suitability",
    label: "Suitability Assessment",
  },
  {
    value: "tax",
    label: "Tax & IRS Certification",
  },
];

function SectionSelector({
  selectedSections,
  toggleSection,
}: {
  selectedSections: SectionName[];
  toggleSection: (section: SectionName) => void;
}) {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {sectionOptions.map((section) => (
        <label
          key={section.value}
          className="flex cursor-pointer items-center gap-3 rounded-xl border border-forest-900/10 bg-white p-4"
        >
          <input
            type="checkbox"
            checked={selectedSections.includes(section.value)}
            onChange={() => toggleSection(section.value)}
            className="size-4 cursor-pointer accent-forest-950"
          />

          <span className="text-sm font-medium text-forest-950">
            {section.label}
          </span>
        </label>
      ))}
    </div>
  );
}

export function ComplianceReviewActions({
  userId,
  investorName,
  currentStatus,
}: ComplianceReviewActionsProps) {
  const router = useRouter();

  const [loadingAction, setLoadingAction] =
    useState<LoadingAction>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const [selectedSections, setSelectedSections] =
    useState<SectionName[]>([]);

  const [requestReason, setRequestReason] =
    useState("");

  const [rejectionReason, setRejectionReason] =
    useState("");

  const [reopenSections, setReopenSections] =
    useState<SectionName[]>([]);

  const [reopenReason, setReopenReason] =
    useState("");

  function toggleSection(
    section: SectionName,
  ) {
    setSelectedSections((current) =>
      current.includes(section)
        ? current.filter(
            (item) => item !== section,
          )
        : [...current, section],
    );
  }

  function toggleReopenSection(
    section: SectionName,
  ) {
    setReopenSections((current) =>
      current.includes(section)
        ? current.filter(
            (item) => item !== section,
          )
        : [...current, section],
    );
  }

  async function readResult(
    response: Response,
  ) {
    return (await response.json()) as {
      success?: boolean;
      error?: string;
    };
  }

  async function approveInvestor() {
    setError(null);
    setSuccess(null);
    setLoadingAction("approve");

    try {
      const response = await fetch(
        `/api/admin/compliance/${userId}/approve`,
        {
          method: "POST",
        },
      );

      const result =
        await readResult(response);

      if (
        !response.ok ||
        !result.success
      ) {
        setError(
          result.error ??
            "Unable to approve investor.",
        );
        return;
      }

      setSuccess(
        "Investor approved successfully. The compliance decision has been recorded.",
      );

      router.refresh();
    } catch (requestError) {
      console.error(
        "Approve investor request error:",
        requestError,
      );

      setError(
        "Unable to approve investor. Please try again.",
      );
    } finally {
      setLoadingAction(null);
    }
  }

  async function requestInformation() {
    setError(null);
    setSuccess(null);

    if (selectedSections.length === 0) {
      setError(
        "Select at least one onboarding section.",
      );
      return;
    }

    if (!requestReason.trim()) {
      setError(
        "Enter the reason for requesting additional information.",
      );
      return;
    }

    setLoadingAction("request");

    try {
      const response = await fetch(
        `/api/admin/compliance/${userId}/request-information`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            sections:
              selectedSections,
            reason:
              requestReason,
          }),
        },
      );

      const result =
        await readResult(response);

      if (
        !response.ok ||
        !result.success
      ) {
        setError(
          result.error ??
            "Unable to request additional information.",
        );
        return;
      }

      setSuccess(
        "Additional information requested successfully. The selected onboarding sections are now available for correction.",
      );

      setSelectedSections([]);
      setRequestReason("");

      router.refresh();
    } catch (requestError) {
      console.error(
        "Request information error:",
        requestError,
      );

      setError(
        "Unable to request additional information. Please try again.",
      );
    } finally {
      setLoadingAction(null);
    }
  }

  async function rejectInvestor() {
    setError(null);
    setSuccess(null);

    if (!rejectionReason.trim()) {
      setError(
        "Enter a rejection reason.",
      );
      return;
    }

    setLoadingAction("reject");

    try {
      const response = await fetch(
        `/api/admin/compliance/${userId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            reason:
              rejectionReason,
          }),
        },
      );

      const result =
        await readResult(response);

      if (
        !response.ok ||
        !result.success
      ) {
        setError(
          result.error ??
            "Unable to reject investor.",
        );
        return;
      }

      setSuccess(
        "Investor rejected successfully. The rejection reason has been recorded and the onboarding package remains locked.",
      );

      setRejectionReason("");

      router.refresh();
    } catch (requestError) {
      console.error(
        "Reject investor request error:",
        requestError,
      );

      setError(
        "Unable to reject investor. Please try again.",
      );
    } finally {
      setLoadingAction(null);
    }
  }

  async function reopenOnboarding() {
    setError(null);
    setSuccess(null);

    if (reopenSections.length === 0) {
      setError(
        "Select at least one onboarding section to reopen.",
      );
      return;
    }

    if (!reopenReason.trim()) {
      setError(
        "Enter the reason for reopening onboarding.",
      );
      return;
    }

    setLoadingAction("reopen");

    try {
      const response = await fetch(
        `/api/admin/compliance/${userId}/reopen`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            sections:
              reopenSections,
            reason:
              reopenReason,
          }),
        },
      );

      const result =
        await readResult(response);

      if (
        !response.ok ||
        !result.success
      ) {
        setError(
          result.error ??
            "Unable to reopen onboarding.",
        );
        return;
      }

      setSuccess(
        "Onboarding reopened successfully. Only the selected sections are available for correction.",
      );

      setReopenSections([]);
      setReopenReason("");

      router.refresh();
    } catch (requestError) {
      console.error(
        "Reopen onboarding request error:",
        requestError,
      );

      setError(
        "Unable to reopen onboarding. Please try again.",
      );
    } finally {
      setLoadingAction(null);
    }
  }

  if (currentStatus === "approved") {
    return (
      <section className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-7">
        <CheckCircle2 className="size-6 text-emerald-700" />

        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
          Decision recorded
        </p>

        <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
          Investor approved
        </h2>

        <p className="mt-3 text-sm leading-7 text-stone-600">
          {investorName} has completed compliance approval.
          The approved status is now active on the investor account.
        </p>
      </section>
    );
  }

  if (currentStatus === "rejected") {
    return (
      <section className="rounded-[1.75rem] border border-red-200 bg-red-50 p-7">
        <XCircle className="size-6 text-red-700" />

        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-red-700">
          Decision recorded
        </p>

        <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
          Investor rejected
        </h2>

        <p className="mt-3 text-sm leading-7 text-stone-600">
          This compliance review is closed as rejected.
          The onboarding package remains locked unless an administrator explicitly reopens selected sections.
        </p>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-white p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            {success}
          </div>
        ) : null}

        <div className="mt-7 rounded-3xl border border-red-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <RotateCcw className="size-5 text-gold-600" />

            <h3 className="text-sm font-semibold text-forest-950">
              Reopen onboarding
            </h3>
          </div>

          <p className="mt-3 text-xs leading-6 text-stone-600">
            Use this only when Tevuah Reserve is allowing the investor to correct and resubmit after a rejection.
            Select exactly which sections the investor may edit and enter the reason for reopening the review.
          </p>

          <SectionSelector
            selectedSections={
              reopenSections
            }
            toggleSection={
              toggleReopenSection
            }
          />

          <textarea
            value={
              reopenReason
            }
            onChange={(event) =>
              setReopenReason(
                event.target.value,
              )
            }
            rows={4}
            placeholder="Explain why onboarding is being reopened and what the investor must correct..."
            className="focus-ring mt-5 w-full rounded-xl border border-red-200 bg-white p-4 text-sm text-forest-950 outline-none"
          />

          <button
            type="button"
            disabled={
              loadingAction !== null
            }
            onClick={
              reopenOnboarding
            }
            className="focus-ring mt-4 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingAction ===
            "reopen" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Reopening...
              </>
            ) : (
              <>
                <RotateCcw className="size-4" />
                Reopen selected sections
              </>
            )}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest-950 text-gold-400">
          <ShieldCheck className="size-5" />
        </span>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
            Compliance decision
          </p>

          <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
            Complete investor review
          </h2>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          {success}
        </div>
      ) : null}

      {currentStatus ===
      "action_required" ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Additional information is currently outstanding.
          You can revise the request below if a different section also needs correction.
        </div>
      ) : null}

      <div className="mt-8 rounded-3xl border border-forest-900/10 bg-ivory-50 p-6">
        <div className="flex items-center gap-3">
          <MessageSquareWarning className="size-5 text-gold-600" />

          <h3 className="text-sm font-semibold text-forest-950">
            Request more information
          </h3>
        </div>

        <p className="mt-3 text-xs leading-6 text-stone-600">
          Select only the sections that the investor should be allowed to edit.
          All other submitted onboarding sections remain locked.
        </p>

        <SectionSelector
          selectedSections={
            selectedSections
          }
          toggleSection={
            toggleSection
          }
        />

        <textarea
          value={
            requestReason
          }
          onChange={(event) =>
            setRequestReason(
              event.target.value,
            )
          }
          rows={4}
          placeholder="Explain exactly what information or document needs to be corrected..."
          className="focus-ring mt-5 w-full rounded-xl border border-forest-900/10 bg-white p-4 text-sm text-forest-950 outline-none"
        />

        <button
          type="button"
          disabled={
            loadingAction !== null
          }
          onClick={
            requestInformation
          }
          className="focus-ring mt-4 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingAction ===
          "request" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving request...
            </>
          ) : (
            "Request information"
          )}
        </button>
      </div>

      <div className="mt-6 rounded-3xl border border-red-200 bg-red-50/40 p-6">
        <h3 className="text-sm font-semibold text-red-800">
          Reject verification
        </h3>

        <p className="mt-2 text-xs leading-6 text-stone-600">
          Rejecting verification records the compliance reason,
          clears any edit exceptions and keeps the onboarding package locked.
        </p>

        <textarea
          value={
            rejectionReason
          }
          onChange={(event) =>
            setRejectionReason(
              event.target.value,
            )
          }
          rows={4}
          placeholder="Enter the compliance reason for rejection..."
          className="focus-ring mt-5 w-full rounded-xl border border-red-200 bg-white p-4 text-sm text-forest-950 outline-none"
        />

        <button
          type="button"
          disabled={
            loadingAction !== null
          }
          onClick={
            rejectInvestor
          }
          className="focus-ring mt-4 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingAction ===
          "reject" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Rejecting...
            </>
          ) : (
            <>
              <XCircle className="size-4" />
              Reject investor
            </>
          )}
        </button>
      </div>

      <div className="mt-6 border-t border-forest-900/10 pt-6">
        <button
          type="button"
          disabled={
            loadingAction !== null
          }
          onClick={
            approveInvestor
          }
          className="focus-ring flex min-h-13 cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-700 px-7 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingAction ===
          "approve" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Approving investor...
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" />
              Approve investor
            </>
          )}
        </button>
      </div>
    </section>
  );
}