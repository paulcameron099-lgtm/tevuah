"use client";

import {
  CheckCircle2,
  Loader2,
  MessageSquareWarning,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

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

const sectionOptions: {
  value: SectionName;
  label: string;
}[] = [
  {
    value:
      "profile",
    label:
      "Personal Profile",
  },

  {
    value:
      "identity",
    label:
      "Identity Verification",
  },

  {
    value:
      "address",
    label:
      "Address Verification",
  },

  {
    value:
      "eligibility",
    label:
      "Investor Eligibility",
  },

  {
    value:
      "suitability",
    label:
      "Suitability Assessment",
  },

  {
    value:
      "tax",
    label:
      "Tax & IRS Certification",
  },
];

export function ComplianceReviewActions({
  userId,
  investorName,
  currentStatus,
}: ComplianceReviewActionsProps) {
  const router =
    useRouter();

  const [
    loadingAction,
    setLoadingAction,
  ] =
    useState<
      | "approve"
      | "request"
      | "reject"
      | null
    >(null);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    selectedSections,
    setSelectedSections,
  ] =
    useState<SectionName[]>(
      [],
    );

  const [
    requestReason,
    setRequestReason,
  ] =
    useState("");

  const [
    rejectionReason,
    setRejectionReason,
  ] =
    useState("");

  function toggleSection(
    section: SectionName,
  ) {
    setSelectedSections(
      (current) =>
        current.includes(
          section,
        )
          ? current.filter(
              (item) =>
                item !==
                section,
            )
          : [
              ...current,
              section,
            ],
    );
  }

  async function approveInvestor() {
    setError(null);

    setLoadingAction(
      "approve",
    );

    try {
      const response =
        await fetch(
          `/api/admin/compliance/${userId}/approve`,
          {
            method:
              "POST",
          },
        );

      const result =
        (await response.json()) as {
          error?: string;
        };

      if (!response.ok) {
        setError(
          result.error ??
            "Unable to approve investor.",
        );

        return;
      }

      router.refresh();
    } finally {
      setLoadingAction(
        null,
      );
    }
  }

  async function requestInformation() {
    setError(null);

    if (
      selectedSections.length ===
      0
    ) {
      setError(
        "Select at least one onboarding section.",
      );

      return;
    }

    if (
      !requestReason.trim()
    ) {
      setError(
        "Enter the reason for requesting additional information.",
      );

      return;
    }

    setLoadingAction(
      "request",
    );

    try {
      const response =
        await fetch(
          `/api/admin/compliance/${userId}/request-information`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                sections:
                  selectedSections,

                reason:
                  requestReason,
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
            "Unable to request additional information.",
        );

        return;
      }

      setSelectedSections(
        [],
      );

      setRequestReason(
        "",
      );

      router.refresh();
    } finally {
      setLoadingAction(
        null,
      );
    }
  }

  async function rejectInvestor() {
    setError(null);

    if (
      !rejectionReason.trim()
    ) {
      setError(
        "Enter a rejection reason.",
      );

      return;
    }

    setLoadingAction(
      "reject",
    );

    try {
      const response =
        await fetch(
          `/api/admin/compliance/${userId}/reject`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                reason:
                  rejectionReason,
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
            "Unable to reject investor.",
        );

        return;
      }

      setRejectionReason(
        "",
      );

      router.refresh();
    } finally {
      setLoadingAction(
        null,
      );
    }
  }

  if (
    currentStatus ===
    "approved"
  ) {
    return (
      <section className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-7">
        <CheckCircle2 className="size-6 text-emerald-700" />

        <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
          Investor approved
        </h2>

        <p className="mt-3 text-sm text-stone-600">
          {investorName} has completed compliance approval.
        </p>
      </section>
    );
  }

  if (
    currentStatus ===
    "rejected"
  ) {
    return (
      <section className="rounded-[1.75rem] border border-red-200 bg-red-50 p-7">
        <XCircle className="size-6 text-red-700" />

        <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
          Investor rejected
        </h2>

        <p className="mt-3 text-sm text-stone-600">
          This compliance review has been closed as rejected.
        </p>
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

      <div className="mt-8 rounded-3xl border border-forest-900/10 bg-ivory-50 p-6">
        <div className="flex items-center gap-3">
          <MessageSquareWarning className="size-5 text-gold-600" />

          <h3 className="text-sm font-semibold text-forest-950">
            Request more information
          </h3>
        </div>

        <p className="mt-3 text-xs leading-6 text-stone-600">
          Select only the sections that the investor
          should be allowed to edit.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {sectionOptions.map(
            (section) => (
              <label
                key={
                  section.value
                }
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-forest-900/10 bg-white p-4"
              >
                <input
                  type="checkbox"
                  checked={
                    selectedSections.includes(
                      section.value,
                    )
                  }
                  onChange={() =>
                    toggleSection(
                      section.value,
                    )
                  }
                  className="size-4 accent-forest-950"
                />

                <span className="text-sm font-medium text-forest-950">
                  {
                    section.label
                  }
                </span>
              </label>
            ),
          )}
        </div>

        <textarea
          value={
            requestReason
          }
          onChange={(
            event,
          ) =>
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
            loadingAction !==
            null
          }
          onClick={
            requestInformation
          }
          className="focus-ring mt-4 flex min-h-11 items-center justify-center rounded-full border border-amber-300 bg-amber-50 px-5 text-sm font-semibold text-amber-800 disabled:opacity-50"
        >
          {loadingAction ===
          "request"
            ? "Sending request..."
            : "Request information"}
        </button>
      </div>

      <div className="mt-6 rounded-3xl border border-red-200 bg-red-50/40 p-6">
        <h3 className="text-sm font-semibold text-red-800">
          Reject verification
        </h3>

        <p className="mt-2 text-xs leading-6 text-stone-600">
          Rejecting the verification locks the onboarding
          package and records the compliance decision.
        </p>

        <textarea
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
          rows={4}
          placeholder="Enter the compliance reason for rejection..."
          className="focus-ring mt-5 w-full rounded-xl border border-red-200 bg-white p-4 text-sm text-forest-950 outline-none"
        />

        <button
          type="button"
          disabled={
            loadingAction !==
            null
          }
          onClick={
            rejectInvestor
          }
          className="focus-ring mt-4 flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:opacity-50"
        >
          <XCircle className="size-4" />

          {loadingAction ===
          "reject"
            ? "Rejecting..."
            : "Reject investor"}
        </button>
      </div>

      <div className="mt-6 border-t border-forest-900/10 pt-6">
        <button
          type="button"
          disabled={
            loadingAction !==
            null
          }
          onClick={
            approveInvestor
          }
          className="focus-ring flex min-h-13 items-center justify-center gap-2 rounded-full bg-emerald-700 px-7 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
        >
          <CheckCircle2 className="size-4" />

          {loadingAction ===
          "approve"
            ? "Approving investor..."
            : "Approve investor"}
        </button>
      </div>
    </section>
  );
}