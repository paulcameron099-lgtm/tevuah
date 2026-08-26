"use client";

import {
  CheckCircle2,
  Loader2,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ProofOfAddressUpload } from "@/src/components/onboarding/proof-of-address-upload";

type AddressVerificationFormProps = {
  userId: string;

  initialValues?: {
    addressLine1?: string;
    addressLine2?: string;

    city?: string;
    stateRegion?: string;
    postalCode?: string;
    country?: string;

    proofDocumentType?: string | null;
    proofDocumentPath?: string | null;

    status?: string | null;
  };
};

export function AddressVerificationForm({
  userId,
  initialValues,
}: AddressVerificationFormProps) {
  const router = useRouter();

  const [form, setForm] =
    useState({
      addressLine1:
        initialValues?.addressLine1 ??
        "",

      addressLine2:
        initialValues?.addressLine2 ??
        "",

      city:
        initialValues?.city ??
        "",

      stateRegion:
        initialValues?.stateRegion ??
        "",

      postalCode:
        initialValues?.postalCode ??
        "",

      country:
        initialValues?.country ??
        "",

      proofDocumentType:
        initialValues?.proofDocumentType ??
        "",
    });

  const [
    proofDocumentPath,
    setProofDocumentPath,
  ] = useState<string | null>(
    initialValues?.proofDocumentPath ??
      null,
  );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const currentStatus =
    initialValues?.status ??
    "not_started";

  const isUnderReview =
    currentStatus ===
    "under_review";

  const isVerified =
    currentStatus ===
    "verified";

  const isRejected =
    currentStatus ===
    "rejected" ||
    currentStatus ===
    "action_required";

  function updateField(
    field: keyof typeof form,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

async function handleSubmit(
  event: React.FormEvent<HTMLFormElement>,
) {
  event.preventDefault();

  setError(null);

  if (!proofDocumentPath) {
    setError(
      "Upload a proof-of-address document.",
    );

    return;
  }

  if (!form.proofDocumentType) {
    setError(
      "Select the type of proof-of-address document.",
    );

    return;
  }

  setLoading(true);

  const response =
    await fetch(
      "/api/onboarding/address",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          ...form,
          proofDocumentPath,
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
        "Unable to submit address verification.",
    );

    setLoading(false);

    return;
  }

  router.push(
    "/dashboard/onboarding/eligibility",
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
            <ShieldCheck className="mt-1 size-5 shrink-0 text-amber-700" />

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                Address verification
              </p>

              <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">
                Address verification is under review.
              </h2>

              <p className="mt-3 text-sm leading-7 text-stone-600">
                Your residential address and supporting
                document were submitted successfully.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {isVerified ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="mt-1 size-5 shrink-0 text-emerald-700" />

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                Address verification
              </p>

              <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">
                Address verified.
              </h2>
            </div>
          </div>
        </div>
      ) : null}

      {isRejected ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-700">
            Action required
          </p>

          <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">
            Your address verification needs attention.
          </h2>
        </div>
      ) : null}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest-950 text-gold-400">
            <MapPin className="size-5" />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Residential address
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              Where do you currently live?
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Enter your current residential address exactly
              as it appears on your supporting document.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field
              label="Address line 1"
              value={form.addressLine1}
              required
              onChange={(value) =>
                updateField(
                  "addressLine1",
                  value,
                )
              }
            />
          </div>

          <div className="sm:col-span-2">
            <Field
              label="Address line 2"
              value={form.addressLine2}
              onChange={(value) =>
                updateField(
                  "addressLine2",
                  value,
                )
              }
            />
          </div>

          <Field
            label="City"
            value={form.city}
            required
            onChange={(value) =>
              updateField(
                "city",
                value,
              )
            }
          />

          <Field
            label="State / Province / Region"
            value={form.stateRegion}
            onChange={(value) =>
              updateField(
                "stateRegion",
                value,
              )
            }
          />

          <Field
            label="Postal code"
            value={form.postalCode}
            required
            onChange={(value) =>
              updateField(
                "postalCode",
                value,
              )
            }
          />

          <Field
            label="Country"
            value={form.country}
            required
            onChange={(value) =>
              updateField(
                "country",
                value,
              )
            }
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Supporting document
        </p>

        <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
          Proof of address
        </h2>

        <div className="mt-7">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">
              Document type
            </span>

            <select
              required
              value={
                form.proofDocumentType
              }
              onChange={(event) =>
                updateField(
                  "proofDocumentType",
                  event.target.value,
                )
              }
              className="focus-ring min-h-13 w-full rounded-xl border border-forest-900/10 bg-ivory-50 px-4 text-sm text-forest-950 outline-none"
            >
              <option value="">
                Select document type
              </option>

              <option value="utility_bill">
                Utility bill
              </option>

              <option value="bank_statement">
                Bank statement
              </option>

              <option value="government_letter">
                Government letter
              </option>

              <option value="lease_agreement">
                Lease agreement
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </label>
        </div>

        <div className="mt-6">
          <ProofOfAddressUpload
            userId={userId}
            value={proofDocumentPath}
            onUploaded={
              setProofDocumentPath
            }
          />
        </div>
      </section>

      <div className="flex justify-end">
        {isUnderReview ||
        isVerified ? (
          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/onboarding/eligibility",
              )
            }
            className="focus-ring min-h-13 rounded-full bg-forest-950 px-7 text-sm font-semibold text-white transition hover:bg-forest-800"
          >
            Continue to investor eligibility
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="focus-ring flex min-h-13 items-center justify-center gap-2 rounded-full bg-forest-950 px-7 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Submitting address...
              </>
            ) : (
              "Submit address verification"
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
  required?: boolean;
  onChange: (value: string) => void;
};

function Field({
  label,
  value,
  required = false,
  onChange,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">
        {label}
      </span>

      <input
        type="text"
        required={required}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="focus-ring min-h-13 w-full rounded-xl border border-forest-900/10 bg-ivory-50 px-4 text-sm text-forest-950 outline-none"
      />
    </label>
  );
}