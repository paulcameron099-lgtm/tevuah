"use client";

import {
  CheckCircle2,
  CircleAlert,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

export function JointSubscriptionReviewActions({
  jointSubscriptionId,
  currentStatus,
  readyForApproval,
}: {
  jointSubscriptionId: string;
  currentStatus: string;
  readyForApproval: boolean;
}) {
  const router =
    useRouter();

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

  const alreadyApproved =
    currentStatus ===
      "approved" ||
    currentStatus ===
      "funding" ||
    currentStatus ===
      "funded";

  const canApprove =
    (
      currentStatus ===
        "submitted" ||
      currentStatus ===
        "under_review"
    ) &&
    readyForApproval;

  if (
    currentStatus ===
      "rejected" ||
    currentStatus ===
      "cancelled"
  ) {
    return (
      <aside className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6">
        <CircleAlert className="size-5 text-red-700" />

        <h2 className="font-display mt-4 text-2xl font-semibold text-red-950">
          Review closed
        </h2>

        <p className="mt-3 text-sm leading-7 text-red-800">
          This joint investment is{" "}
          {currentStatus ===
          "rejected"
            ? "rejected"
            : "cancelled"}
          . No approval action is
          available.
        </p>
      </aside>
    );
  }

  if (
    alreadyApproved
  ) {
    return (
      <aside className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6">
        <CheckCircle2 className="size-5 text-emerald-700" />

        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
          Administrative review
        </p>

        <h2 className="font-display mt-2 text-2xl font-semibold text-emerald-950">
          Joint investment approved
        </h2>

        <p className="mt-3 text-sm leading-7 text-emerald-800">
          Administrative approval is
          complete. Funding is managed
          separately through the joint
          funding workflow.
        </p>
      </aside>
    );
  }

  return (
    <aside className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6">
      <ShieldCheck className="size-5 text-gold-600" />

      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
        Administrative review
      </p>

      <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">
        Approval decision
      </h2>

      <p className="mt-3 text-sm leading-7 text-stone-600">
        Approval enables the joint
        investment funding stage.
        Funding itself is handled
        separately for each investor.
      </p>

      <div className="mt-6 space-y-3">
        <Requirement
          complete={
            readyForApproval
          }
          label={
            readyForApproval
              ? "Both investors and agreements are complete"
              : "Joint investment requirements are incomplete"
          }
        />

        <Requirement
          complete={
            currentStatus ===
              "submitted" ||
            currentStatus ===
              "under_review"
          }
          label="Submitted for administrative review"
        />
      </div>

      {error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
          {success}
        </div>
      ) : null}

      <button
        type="button"
        disabled={
          !canApprove ||
          loading
        }
        onClick={
          approveJointInvestment
        }
        className="focus-ring mt-6 inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Approving...
          </>
        ) : (
          <>
            <CheckCircle2 className="size-4" />
            Approve joint investment
          </>
        )}
      </button>

      {!readyForApproval ? (
        <p className="mt-4 text-xs leading-6 text-stone-500">
          Approval remains disabled
          until both members have
          accepted and both legal
          consents are complete.
        </p>
      ) : null}
    </aside>
  );

  async function approveJointInvestment() {
    if (
      !canApprove ||
      loading
    ) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          `/api/admin/investments/joint/${jointSubscriptionId}/approve`,
          {
            method: "POST",
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
            "Unable to approve joint investment.",
        );

        return;
      }

      setSuccess(
        "Joint investment approved successfully.",
      );

      router.refresh();
    } catch (
      approvalError
    ) {
      console.error(
        "Joint investment approval error:",
        approvalError,
      );

      setError(
        "Unable to approve joint investment.",
      );
    } finally {
      setLoading(false);
    }
  }
}

function Requirement({
  complete,
  label,
}: {
  complete: boolean;
  label: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-ivory-50 p-3">
      {complete ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />
      ) : (
        <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-700" />
      )}

      <p className="text-xs font-semibold leading-6 text-forest-950">
        {label}
      </p>
    </div>
  );
}