"use client";

import {
  AlertTriangle,
  CheckCircle2,
  History,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  statementId: string;
  status: string;
};

type Action = "publish" | "void" | "reinstate";

type ReviewResponse = {
  success?: boolean;
  error?: string;
  status?: string;
};

export function StatementReviewActions({
  statementId,
  status,
}: Props) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function performAction(action: Action) {
    setError(null);
    setSuccess(null);
    setLoadingAction(action);

    try {
      const response = await fetch("/api/admin/review-statement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statementId, action }),
      });

      const contentType = response.headers.get("content-type") ?? "";

      if (!contentType.includes("application/json")) {
        const raw = await response.text();
        console.error(`${action.toUpperCase()} statement returned non-JSON response.`, {
          status: response.status,
          statusText: response.statusText,
          rawResponse: raw.slice(0, 1000),
        });
        setError(`Statement review endpoint returned ${response.status} ${response.statusText}.`);
        return;
      }

      const result = (await response.json()) as ReviewResponse;

      if (!response.ok) {
        setError(result.error ?? `Unable to ${action} statement.`);
        return;
      }

      setSuccess(
        action === "publish"
          ? "Statement published successfully."
          : action === "void"
            ? "Statement has been voided."
            : "Statement reinstated successfully.",
      );

      router.refresh();
    } catch (requestError) {
      console.error("Statement review request failed:", requestError);
      setError("Unable to complete the statement review action.");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="space-y-4">
      {error ? <Message type="error" text={error} /> : null}
      {success ? <Message type="success" text={success} /> : null}

      {status === "draft" ? (
        <div className="space-y-3">
          <button
            type="button"
            disabled={loadingAction !== null}
            onClick={() => void performAction("publish")}
            className="focus-ring inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingAction === "publish" ? (
              <><Loader2 className="size-4 animate-spin" />Publishing...</>
            ) : (
              <><ShieldCheck className="size-4" />Publish Statement</>
            )}
          </button>

          <VoidButton
            loading={loadingAction === "void"}
            disabled={loadingAction !== null}
            onConfirm={() => void performAction("void")}
          />
        </div>
      ) : null}

      {status === "published" ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-700" />
              <div>
                <p className="text-sm font-semibold text-emerald-900">Published statement</p>
                <p className="mt-1 text-xs leading-6 text-emerald-700">
                  This statement is currently valid and available to the investor.
                </p>
              </div>
            </div>
          </div>

          <VoidButton
            loading={loadingAction === "void"}
            disabled={loadingAction !== null}
            onConfirm={() => void performAction("void")}
          />
        </div>
      ) : null}

      {status === "void" ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 size-4 shrink-0 text-red-700" />
              <div>
                <p className="text-sm font-semibold text-red-900">Statement voided</p>
                <p className="mt-1 text-xs leading-6 text-red-700">
                  It remains in the historical record but is not currently valid or visible to investors.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={loadingAction !== null}
            onClick={() => {
              const confirmed = window.confirm(
                "Reinstate this voided statement and make it valid for the investor again?",
              );
              if (confirmed) void performAction("reinstate");
            }}
            className="focus-ring inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingAction === "reinstate" ? (
              <><Loader2 className="size-4 animate-spin" />Reinstating...</>
            ) : (
              <><History className="size-4" />Reinstate Statement</>
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function VoidButton({
  loading,
  disabled,
  onConfirm,
}: {
  loading: boolean;
  disabled: boolean;
  onConfirm: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        const confirmed = window.confirm(
          "Void this statement? It will remain in the historical record but will stop being valid and visible to the investor.",
        );
        if (confirmed) onConfirm();
      }}
      className="focus-ring inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <><Loader2 className="size-4 animate-spin" />Voiding...</>
      ) : (
        <><XCircle className="size-4" />Void Statement</>
      )}
    </button>
  );
}

function Message({
  type,
  text,
}: {
  type: "error" | "success";
  text: string;
}) {
  const isError = type === "error";
  const Icon = isError ? AlertTriangle : CheckCircle2;

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${
      isError ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"
    }`}>
      <Icon className={`mt-0.5 size-4 shrink-0 ${
        isError ? "text-red-700" : "text-emerald-700"
      }`} />
      <p className={`text-sm leading-6 ${
        isError ? "text-red-700" : "text-emerald-700"
      }`}>
        {text}
      </p>
    </div>
  );
}
