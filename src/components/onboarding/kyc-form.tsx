"use client";

import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import {
  useRouter,
} from "next/navigation";
import { useState } from "react";



import { VerificationDocumentUpload } from "@/src/components/onboarding/verification-document-upload";

type KycFormProps = {
  userId: string;

  initialValues?: {
    legalFirstName?: string;
    legalMiddleName?: string;
    legalLastName?: string;
    dateOfBirth?: string;
    nationality?: string;

    driversLicenseLastFour?: string | null;
    ssnLastFour?: string | null;

    driversLicenseFrontPath?: string | null;
    driversLicenseBackPath?: string | null;

    ssnFrontPath?: string | null;
    ssnBackPath?: string | null;

    status?: string | null;
    verificationStatus?: string | null;
  };
};

export function KycForm({
  userId,
  initialValues,
}: KycFormProps) {
  const router =
    useRouter();

  const [form, setForm] =
    useState({
      legalFirstName:
        initialValues?.legalFirstName ??
        "",

      legalMiddleName:
        initialValues?.legalMiddleName ??
        "",

      legalLastName:
        initialValues?.legalLastName ??
        "",

      dateOfBirth:
        initialValues?.dateOfBirth ??
        "",

      nationality:
        initialValues?.nationality ??
        "",

      driversLicenseNumber:
        "",

      ssn:
        "",
    });


const [
  driversLicenseFrontPath,
  setDriversLicenseFrontPath,
] = useState<string | null>(
  initialValues?.driversLicenseFrontPath ?? null,
);

const [
  driversLicenseBackPath,
  setDriversLicenseBackPath,
] = useState<string | null>(
  initialValues?.driversLicenseBackPath ?? null,
);

const [
  ssnFrontPath,
  setSsnFrontPath,
] = useState<string | null>(
  initialValues?.ssnFrontPath ?? null,
);

const [
  ssnBackPath,
  setSsnBackPath,
] = useState<string | null>(
  initialValues?.ssnBackPath ?? null,
);

const currentStatus =
  initialValues?.verificationStatus ??
  initialValues?.status ??
  "not_started";

const isUnderReview =
  currentStatus === "under_review";

const isVerified =
  currentStatus === "verified";

const isRejected =
  currentStatus === "rejected";

const allDocumentsUploaded =
  Boolean(driversLicenseFrontPath) &&
  Boolean(driversLicenseBackPath) &&
  Boolean(ssnFrontPath) &&
  Boolean(ssnBackPath);

  const [showSsn, setShowSsn] =
    useState(false);

  const [
    showDriversLicense,
    setShowDriversLicense,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  function updateField(
    field: keyof typeof form,
    value: string,
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    const normalizedSsn =
      form.ssn.replace(
        /\D/g,
        "",
      );

    if (
      normalizedSsn.length !== 9
    ) {
      setError(
        "Enter a valid 9-digit Social Security number.",
      );

      return;
    }

    if (
      !driversLicenseFrontPath ||
      !driversLicenseBackPath ||
      !ssnFrontPath ||
      !ssnBackPath
    ) {
      setError(
        "Upload all four required verification images.",
      );

      return;
    }

    setLoading(true);

    const response =
      await fetch(
        "/api/onboarding/kyc",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              ...form,

              ssn:
                normalizedSsn,

              driversLicenseFrontPath,
              driversLicenseBackPath,

              ssnFrontPath,
              ssnBackPath,
            }),
        },
      );

    const result =
      (await response.json()) as {
        success?: boolean;
        error?: string;
      };

    if (!response.ok) {
      setError(
        result.error ??
          "Unable to submit verification.",
      );

      setLoading(false);

      return;
    }

    router.push(
      "/dashboard/onboarding/address",
    );

    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700">
          {error}
        </div>
      ) : null}

      {isUnderReview ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <ShieldCheck className="size-5" />
            </span>

            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                Verification status
                </p>

                <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">
                Identity verification is under review.
                </h2>

               <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
                Your identity information and supporting documents have been submitted successfully.
                If you need to make a correction while the submission is under review,
                enter the updated identity numbers, replace any necessary documents,
                then select Update verification & continue.
              </p>
            </div>
            </div>
        </div>
        ) : null}

        {isVerified ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
            <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="size-5" />
            </span>

            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                Verification status
                </p>

                <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">
                Identity verified.
                </h2>

                <p className="mt-3 text-sm leading-7 text-stone-600">
                Your identity verification has been approved.
                </p>
            </div>
            </div>
        </div>
        ) : null}

        {isRejected ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-700">
            Verification status
            </p>

            <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">
            Additional action is required.
            </h2>
        </div>
        ) : null}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Legal identity
        </p>

        <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
          Identity information
        </h2>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <Field
            label="Legal first name"
            value={
              form.legalFirstName
            }
            required
            onChange={(value) =>
              updateField(
                "legalFirstName",
                value,
              )
            }
          />

          <Field
            label="Legal middle name"
            value={
              form.legalMiddleName
            }
            onChange={(value) =>
              updateField(
                "legalMiddleName",
                value,
              )
            }
          />

          <Field
            label="Legal last name"
            value={
              form.legalLastName
            }
            required
            onChange={(value) =>
              updateField(
                "legalLastName",
                value,
              )
            }
          />

          <Field
            label="Date of birth"
            type="date"
            value={
              form.dateOfBirth
            }
            required
            onChange={(value) =>
              updateField(
                "dateOfBirth",
                value,
              )
            }
          />

          <Field
            label="Nationality"
            value={
              form.nationality
            }
            required
            onChange={(value) =>
              updateField(
                "nationality",
                value,
              )
            }
          />
        </div>
      </section>

      {allDocumentsUploaded ? (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
        Documents received
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {[
            "License front uploaded",
            "License back uploaded",
            "SSN front uploaded",
            "SSN back uploaded",
        ].map((item) => (
            <div
            key={item}
            className="flex items-center gap-3 text-sm font-medium text-forest-950"
            >
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />

            {item}
            </div>
        ))}
        </div>
    </div>
    ) : null}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest-950 text-gold-400">
            <ShieldCheck className="size-5" />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Government identification
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              Driver&apos;s license
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Enter the license number exactly as
              shown on the document and upload clear
              images of both sides.
            </p>
          </div>
        </div>

        <div className="mt-7">
          <SensitiveField
            label="Driver's license number"
            value={
              form.driversLicenseNumber
            }
            visible={
              showDriversLicense
            }
            onToggle={() =>
              setShowDriversLicense(
                (current) =>
                  !current,
              )
            }
            onChange={(value) =>
              updateField(
                "driversLicenseNumber",
                value,
              )
            }
          />
          {initialValues?.driversLicenseLastFour ? (
        <div className="mt-3 flex items-center gap-2 text-xs text-stone-500">
            <LockKeyhole className="size-3.5 text-gold-600" />

            <span>
            Driver&apos;s license currently on file ending in{" "}
            <strong className="font-semibold text-forest-950">
                {initialValues.driversLicenseLastFour}
            </strong>
            </span>
        </div>
        ) : null}
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <VerificationDocumentUpload
            userId={userId}
            folder="drivers-license"
            side="front"
            title="License front"
            description="Upload a clear image of the front."
            value={
              driversLicenseFrontPath
            }
            onUploaded={
              setDriversLicenseFrontPath
            }
          />

          <VerificationDocumentUpload
            userId={userId}
            folder="drivers-license"
            side="back"
            title="License back"
            description="Upload a clear image of the back."
            value={
              driversLicenseBackPath
            }
            onUploaded={
              setDriversLicenseBackPath
            }
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest-950 text-gold-400">
            <LockKeyhole className="size-5" />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Social Security
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              SSN verification
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              The full number is submitted through
              the secure server-side verification
              route. Only the final four digits are
              retained in the normal KYC record.
            </p>
          </div>
        </div>

        <div className="mt-7">
          <SensitiveField
            label="Social Security number"
            value={form.ssn}
            visible={showSsn}
            inputMode="numeric"
            onToggle={() =>
              setShowSsn(
                (current) =>
                  !current,
              )
            }
            onChange={(value) =>
              updateField(
                "ssn",
                value,
              )
            }
          />
          {initialValues?.ssnLastFour ? (
        <div className="mt-3 flex items-center gap-2 text-xs text-stone-500">
            <LockKeyhole className="size-3.5 text-gold-600" />

            <span>
            SSN currently on file ending in{" "}
            <strong className="font-semibold text-forest-950">
                {initialValues.ssnLastFour}
            </strong>
            </span>
        </div>
        ) : null}
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <VerificationDocumentUpload
            userId={userId}
            folder="ssn"
            side="front"
            title="SSN document front"
            description="Upload the requested front image."
            value={ssnFrontPath}
            onUploaded={
              setSsnFrontPath
            }
          />

          <VerificationDocumentUpload
            userId={userId}
            folder="ssn"
            side="back"
            title="SSN document back"
            description="Upload the requested back image."
            value={ssnBackPath}
            onUploaded={
              setSsnBackPath
            }
          />
        </div>

        <div className="mt-6 rounded-xl border border-gold-500/25 bg-gold-500/5 p-5">
          <p className="text-xs leading-6 text-stone-600">
            These files are stored in the private
            investor-verification bucket. They are
            not public assets and should later be
            reviewed through short-lived signed URLs.
          </p>
        </div>
      </section>

<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
  {isVerified ? (
    <button
      type="button"
      onClick={() =>
        router.push(
          "/dashboard/onboarding/address",
        )
      }
      className="focus-ring flex min-h-13 items-center justify-center rounded-full bg-forest-950 px-7 text-sm font-semibold text-white transition hover:bg-forest-800"
    >
      Continue to address verification
    </button>
  ) : (
    <button
      type="submit"
      disabled={loading}
      className="focus-ring flex min-h-13 items-center justify-center gap-2 rounded-full bg-forest-950 px-7 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />

          {isUnderReview
            ? "Updating verification..."
            : "Submitting verification..."}
        </>
      ) : isUnderReview ? (
        "Update verification & continue"
      ) : (
        "Submit for verification"
      )}
    </button>
  )}
</div>
    </form>
  );
}

type FieldProps = {
  label: string;
  value: string;
  type?: string;
  required?: boolean;
  onChange: (
    value: string,
  ) => void;
};

function Field({
  label,
  value,
  type = "text",
  required = false,
  onChange,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">
        {label}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="focus-ring min-h-13 w-full rounded-xl border border-forest-900/10 bg-ivory-50 px-4 text-sm text-forest-950 outline-none"
      />
    </label>
  );
}

type SensitiveFieldProps = {
  label: string;
  value: string;
  visible: boolean;
  inputMode?:
    | "text"
    | "numeric";
  onChange: (
    value: string,
  ) => void;
  onToggle: () => void;
};

function SensitiveField({
  label,
  value,
  visible,
  inputMode = "text",
  onChange,
  onToggle,
}: SensitiveFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">
        {label}
      </span>

      <div className="relative">
        <input
          type={
            visible
              ? "text"
              : "password"
          }
          required
          inputMode={
            inputMode
          }
          autoComplete="off"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          className="focus-ring min-h-13 w-full rounded-xl border border-forest-900/10 bg-ivory-50 px-4 pr-12 text-sm text-forest-950 outline-none"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-stone-500 transition hover:bg-white"
          aria-label={
            visible
              ? `Hide ${label}`
              : `Show ${label}`
          }
        >
          {visible ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      </div>
    </label>
  );
}