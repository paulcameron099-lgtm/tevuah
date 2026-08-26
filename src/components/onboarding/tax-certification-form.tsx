"use client";

import {
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Globe2,
  Landmark,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import { TaxDocumentUpload } from "@/src/components/onboarding/tax-document-upload";

type InitialValues = {
  isUsPerson?: boolean | null;

  taxpayerName?: string | null;

  taxResidencyCountry?: string | null;

  countryOfCitizenship?: string | null;

  dateOfBirth?: string | null;

  taxClassification?: string | null;

  tinType?: string | null;

  tinLastFour?: string | null;

  foreignTinLastFour?: string | null;

  foreignTaxIdNotRequired?: boolean;

  permanentAddressLine1?: string | null;
  permanentAddressLine2?: string | null;

  permanentCity?: string | null;
  permanentStateRegion?: string | null;
  permanentPostalCode?: string | null;
  permanentCountry?: string | null;

  treatyClaimed?: boolean;

  treatyCountry?: string | null;
  treatyArticle?: string | null;
  treatyRate?: string | null;
  treatyIncomeType?: string | null;

  exemptPayeeCode?: string | null;
  fatcaExemptionCode?: string | null;

  w9DocumentPath?: string | null;
  w9SupportingDocumentPath?: string | null;

  w8benDocumentPath?: string | null;
  w8benSupportingDocumentPath?: string | null;

  certificationName?: string | null;

  status?: string | null;
};

type TaxCertificationFormProps = {
  userId: string;

  initialValues?: InitialValues;
};

type FormState = {
  isUsPerson: boolean;

  taxpayerName: string;

  taxResidencyCountry: string;

  countryOfCitizenship: string;

  dateOfBirth: string;

  taxClassification: string;

  tinType: string;

  tin: string;

  foreignTin: string;

  foreignTaxIdNotRequired: boolean;

  permanentAddressLine1: string;
  permanentAddressLine2: string;

  permanentCity: string;
  permanentStateRegion: string;
  permanentPostalCode: string;
  permanentCountry: string;

  treatyClaimed: boolean;

  treatyCountry: string;
  treatyArticle: string;
  treatyRate: string;
  treatyIncomeType: string;

  exemptPayeeCode: string;
  fatcaExemptionCode: string;

  certificationAccepted: boolean;

  certificationName: string;
};

export function TaxCertificationForm({
  userId,
  initialValues,
}: TaxCertificationFormProps) {
  const router =
    useRouter();

  /*
   * Explicitly track whether the investor
   * selected U.S. or non-U.S.
   */
  const [
    taxStatusSelected,
    setTaxStatusSelected,
  ] = useState(
    initialValues?.isUsPerson ===
      true ||
      initialValues?.isUsPerson ===
        false,
  );

  const [form, setForm] =
    useState<FormState>({
      isUsPerson:
        initialValues?.isUsPerson ??
        true,

      taxpayerName:
        initialValues?.taxpayerName ??
        "",

      taxResidencyCountry:
        initialValues?.taxResidencyCountry ??
        "",

      countryOfCitizenship:
        initialValues?.countryOfCitizenship ??
        "",

      dateOfBirth:
        initialValues?.dateOfBirth ??
        "",

      taxClassification:
        initialValues?.taxClassification ??
        "individual",

      tinType:
        initialValues?.tinType ??
        "SSN",

      /*
       * Never reload full TIN.
       */
      tin: "",

      foreignTin: "",

      foreignTaxIdNotRequired:
        initialValues?.foreignTaxIdNotRequired ??
        false,

      permanentAddressLine1:
        initialValues?.permanentAddressLine1 ??
        "",

      permanentAddressLine2:
        initialValues?.permanentAddressLine2 ??
        "",

      permanentCity:
        initialValues?.permanentCity ??
        "",

      permanentStateRegion:
        initialValues?.permanentStateRegion ??
        "",

      permanentPostalCode:
        initialValues?.permanentPostalCode ??
        "",

      permanentCountry:
        initialValues?.permanentCountry ??
        "",

      treatyClaimed:
        initialValues?.treatyClaimed ??
        false,

      treatyCountry:
        initialValues?.treatyCountry ??
        "",

      treatyArticle:
        initialValues?.treatyArticle ??
        "",

      treatyRate:
        initialValues?.treatyRate ??
        "",

      treatyIncomeType:
        initialValues?.treatyIncomeType ??
        "",

      exemptPayeeCode:
        initialValues?.exemptPayeeCode ??
        "",

      fatcaExemptionCode:
        initialValues?.fatcaExemptionCode ??
        "",

      certificationAccepted:
        false,

      certificationName:
        "",
    });

  /*
   * Persistent Storage paths.
   */
  const [
    w9DocumentPath,
    setW9DocumentPath,
  ] = useState<string | null>(
    initialValues?.w9DocumentPath ??
      null,
  );

  const [
    w9SupportingDocumentPath,
    setW9SupportingDocumentPath,
  ] = useState<string | null>(
    initialValues?.w9SupportingDocumentPath ??
      null,
  );

  const [
    w8benDocumentPath,
    setW8benDocumentPath,
  ] = useState<string | null>(
    initialValues?.w8benDocumentPath ??
      null,
  );

  const [
    w8benSupportingDocumentPath,
    setW8benSupportingDocumentPath,
  ] = useState<string | null>(
    initialValues?.w8benSupportingDocumentPath ??
      null,
  );

  const [showTin, setShowTin] =
    useState(false);

  const [
    showForeignTin,
    setShowForeignTin,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  const currentStatus =
    initialValues?.status ??
    "not_started";

  const alreadySubmitted =
    currentStatus ===
      "under_review" ||
    currentStatus ===
      "verified";

  function updateField(
    field: keyof FormState,
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [field]:
        value,
    }));
  }

  function chooseUsStatus(
    value: boolean,
  ) {
    setTaxStatusSelected(
      true,
    );

    setForm((current) => ({
      ...current,

      isUsPerson:
        value,

      tin:
        "",

      foreignTin:
        "",

      tinType:
        value
          ? "SSN"
          : "ITIN",

      certificationAccepted:
        false,

      certificationName:
        "",
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    if (!taxStatusSelected) {
      setError(
        "Select whether you are a U.S. person for tax purposes.",
      );

      return;
    }

    /*
     * Do this BEFORE calling API.
     */
    if (
      form.isUsPerson &&
      !w9DocumentPath
    ) {
      setError(
        "Upload the completed W-9 document.",
      );

      return;
    }

    if (
      !form.isUsPerson &&
      !w8benDocumentPath
    ) {
      setError(
        "Upload the completed W-8BEN document.",
      );

      return;
    }

    setLoading(true);

    try {
      /*
       * IMPORTANT:
       *
       * The four paths are explicitly
       * included in the request body.
       */
      const payload = {
        ...form,

        w9DocumentPath,

        w9SupportingDocumentPath,

        w8benDocumentPath,

        w8benSupportingDocumentPath,
      };

      const response =
        await fetch(
          "/api/onboarding/tax",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload,
              ),
          },
        );

      const result =
        (await response.json()) as {
          success?: boolean;
          error?: string;
          next?: string;
          documentPath?: string;
        };

      if (!response.ok) {
        setError(
          result.error ??
            "Unable to submit tax certification.",
        );

        return;
      }

      /*
       * Extra frontend verification.
       */
      if (
        form.isUsPerson &&
        !result.documentPath
      ) {
        setError(
          "Tax submission completed without a saved W-9 path. Please contact support.",
        );

        return;
      }

      router.push(
        result.next ??
          "/dashboard/onboarding/review",
      );

      router.refresh();
    } catch (submitError) {
      console.error(
        "Tax form submission error:",
        submitError,
      );

      setError(
        "Unable to submit tax certification.",
      );
    } finally {
      setLoading(false);
    }
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

      {alreadySubmitted ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <CheckCircle2 className="size-5 text-amber-700" />

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
            Tax status
          </p>

          <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">
            Tax certification is under review.
          </h2>
        </div>
      ) : null}

      {/* TAX STATUS */}
      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Tax status
        </p>

        <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
          Are you a U.S. person for federal tax purposes?
        </h2>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <button
            type="button"
            onClick={() =>
              chooseUsStatus(
                true,
              )
            }
            className={`rounded-3xl border p-6 text-left transition ${
              taxStatusSelected &&
              form.isUsPerson
                ? "border-forest-950 bg-forest-950 text-white"
                : "border-forest-900/10 bg-ivory-50 text-forest-950"
            }`}
          >
            <Landmark className="size-5 text-gold-500" />

            <p className="font-display mt-5 text-2xl font-semibold">
              Yes — U.S. Person
            </p>

            <p className="mt-3 text-sm leading-7 opacity-60">
              Continue with the W-9 certification path.
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              chooseUsStatus(
                false,
              )
            }
            className={`rounded-3xl border p-6 text-left transition ${
              taxStatusSelected &&
              !form.isUsPerson
                ? "border-forest-950 bg-forest-950 text-white"
                : "border-forest-900/10 bg-ivory-50 text-forest-950"
            }`}
          >
            <Globe2 className="size-5 text-gold-500" />

            <p className="font-display mt-5 text-2xl font-semibold">
              No — Non-U.S. Individual
            </p>

            <p className="mt-3 text-sm leading-7 opacity-60">
              Continue with the W-8BEN certification path.
            </p>
          </button>
        </div>
      </section>

      {taxStatusSelected ? (
        <>
          {/* COMMON TAXPAYER INFO */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <FileText className="size-5 text-gold-600" />

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              {form.isUsPerson
                ? "Form W-9"
                : "Form W-8BEN"}
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              Taxpayer information
            </h2>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <Field
                label="Legal taxpayer name"
                value={
                  form.taxpayerName
                }
                required
                onChange={(value) =>
                  updateField(
                    "taxpayerName",
                    value,
                  )
                }
              />

              <Field
                label="Country of tax residence"
                value={
                  form.taxResidencyCountry
                }
                required
                onChange={(value) =>
                  updateField(
                    "taxResidencyCountry",
                    value,
                  )
                }
              />

              {!form.isUsPerson ? (
                <>
                  <Field
                    label="Country of citizenship"
                    value={
                      form.countryOfCitizenship
                    }
                    required
                    onChange={(value) =>
                      updateField(
                        "countryOfCitizenship",
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
                </>
              ) : null}
            </div>
          </section>

          {form.isUsPerson ? (
            <>
              {/* W9 */}

              <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
                <LockKeyhole className="size-5 text-gold-600" />

                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
                  W-9
                </p>

                <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
                  U.S. taxpayer identification
                </h2>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <SelectField
                    label="TIN type"
                    value={
                      form.tinType
                    }
                    options={[
                      {
                        value:
                          "SSN",

                        label:
                          "Social Security Number (SSN)",
                      },

                      {
                        value:
                          "ITIN",

                        label:
                          "Individual Taxpayer Identification Number (ITIN)",
                      },

                      {
                        value:
                          "EIN",

                        label:
                          "Employer Identification Number (EIN)",
                      },
                    ]}
                    onChange={(value) =>
                      updateField(
                        "tinType",
                        value,
                      )
                    }
                  />

                  <SensitiveField
                    label="Full TIN"
                    value={
                      form.tin
                    }
                    visible={
                      showTin
                    }
                    onToggle={() =>
                      setShowTin(
                        (current) =>
                          !current,
                      )
                    }
                    onChange={(value) =>
                      updateField(
                        "tin",
                        value,
                      )
                    }
                  />

                  <Field
                    label="Federal tax classification"
                    value={
                      form.taxClassification
                    }
                    onChange={(value) =>
                      updateField(
                        "taxClassification",
                        value,
                      )
                    }
                  />

                  <Field
                    label="Exempt payee code (if applicable)"
                    value={
                      form.exemptPayeeCode
                    }
                    onChange={(value) =>
                      updateField(
                        "exemptPayeeCode",
                        value,
                      )
                    }
                  />

                  <Field
                    label="FATCA exemption code (if applicable)"
                    value={
                      form.fatcaExemptionCode
                    }
                    onChange={(value) =>
                      updateField(
                        "fatcaExemptionCode",
                        value,
                      )
                    }
                  />
                </div>

                {initialValues?.tinLastFour ? (
                  <p className="mt-5 text-xs text-stone-500">
                    TIN currently on file ending in{" "}
                    <strong className="text-forest-950">
                      {
                        initialValues.tinLastFour
                      }
                    </strong>
                  </p>
                ) : null}
              </section>

              {/* W9 DOCUMENTS */}

              <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
                  W-9 documentation
                </p>

                <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
                  Upload your completed W-9.
                </h2>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
                  Upload the completed tax document associated with this certification.
                </p>

                <div className="mt-7 grid gap-5 md:grid-cols-2">
                  <TaxDocumentUpload
                    userId={
                      userId
                    }
                    documentKey="w9-document"
                    title="Completed W-9"
                    description="Required W-9 document."
                    required
                    value={
                      w9DocumentPath
                    }
                    onUploaded={
                      setW9DocumentPath
                    }
                  />

                  <TaxDocumentUpload
                    userId={
                      userId
                    }
                    documentKey="w9-supporting-document"
                    title="Supporting tax document"
                    description="Optional supporting tax evidence."
                    value={
                      w9SupportingDocumentPath
                    }
                    onUploaded={
                      setW9SupportingDocumentPath
                    }
                  />
                </div>
              </section>
            </>
          ) : (
            <>
              {/* W8 PERMANENT ADDRESS */}

              <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
                  Permanent residence
                </p>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field
                      label="Permanent address line 1"
                      value={
                        form.permanentAddressLine1
                      }
                      required
                      onChange={(value) =>
                        updateField(
                          "permanentAddressLine1",
                          value,
                        )
                      }
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Field
                      label="Address line 2"
                      value={
                        form.permanentAddressLine2
                      }
                      onChange={(value) =>
                        updateField(
                          "permanentAddressLine2",
                          value,
                        )
                      }
                    />
                  </div>

                  <Field
                    label="City"
                    value={
                      form.permanentCity
                    }
                    required
                    onChange={(value) =>
                      updateField(
                        "permanentCity",
                        value,
                      )
                    }
                  />

                  <Field
                    label="State / region"
                    value={
                      form.permanentStateRegion
                    }
                    onChange={(value) =>
                      updateField(
                        "permanentStateRegion",
                        value,
                      )
                    }
                  />

                  <Field
                    label="Postal code"
                    value={
                      form.permanentPostalCode
                    }
                    onChange={(value) =>
                      updateField(
                        "permanentPostalCode",
                        value,
                      )
                    }
                  />

                  <Field
                    label="Country"
                    value={
                      form.permanentCountry
                    }
                    required
                    onChange={(value) =>
                      updateField(
                        "permanentCountry",
                        value,
                      )
                    }
                  />
                </div>
              </section>

              {/* W8 TIN */}

              <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
                <LockKeyhole className="size-5 text-gold-600" />

                <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
                  Taxpayer identification
                </h2>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <SensitiveField
                    label="Foreign TIN"
                    value={
                      form.foreignTin
                    }
                    visible={
                      showForeignTin
                    }
                    onToggle={() =>
                      setShowForeignTin(
                        (current) =>
                          !current,
                      )
                    }
                    onChange={(value) =>
                      updateField(
                        "foreignTin",
                        value,
                      )
                    }
                  />

                  <SensitiveField
                    label="U.S. TIN / ITIN, if applicable"
                    value={
                      form.tin
                    }
                    visible={
                      showTin
                    }
                    onToggle={() =>
                      setShowTin(
                        (current) =>
                          !current,
                      )
                    }
                    onChange={(value) =>
                      updateField(
                        "tin",
                        value,
                      )
                    }
                  />
                </div>

                <label className="mt-6 flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={
                      form.foreignTaxIdNotRequired
                    }
                    onChange={(event) =>
                      updateField(
                        "foreignTaxIdNotRequired",
                        event.target.checked,
                      )
                    }
                    className="mt-1 size-4 accent-forest-950"
                  />

                  <span className="text-sm leading-7 text-stone-700">
                    A foreign TIN is not legally required in my circumstances.
                  </span>
                </label>
              </section>

              {/* TREATY */}

              <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
                  Treaty benefits
                </p>

                <label className="mt-5 flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={
                      form.treatyClaimed
                    }
                    onChange={(event) =>
                      updateField(
                        "treatyClaimed",
                        event.target.checked,
                      )
                    }
                    className="mt-1 size-4 accent-forest-950"
                  />

                  <span className="text-sm leading-7 text-stone-700">
                    I am claiming benefits under an applicable U.S. income tax treaty.
                  </span>
                </label>

                {form.treatyClaimed ? (
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Treaty country"
                      value={
                        form.treatyCountry
                      }
                      onChange={(value) =>
                        updateField(
                          "treatyCountry",
                          value,
                        )
                      }
                    />

                    <Field
                      label="Treaty article"
                      value={
                        form.treatyArticle
                      }
                      onChange={(value) =>
                        updateField(
                          "treatyArticle",
                          value,
                        )
                      }
                    />

                    <Field
                      label="Rate claimed"
                      value={
                        form.treatyRate
                      }
                      onChange={(value) =>
                        updateField(
                          "treatyRate",
                          value,
                        )
                      }
                    />

                    <Field
                      label="Income type"
                      value={
                        form.treatyIncomeType
                      }
                      onChange={(value) =>
                        updateField(
                          "treatyIncomeType",
                          value,
                        )
                      }
                    />
                  </div>
                ) : null}
              </section>

              {/* W8 DOCUMENTS */}

              <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
                  W-8BEN documentation
                </p>

                <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
                  Upload your completed W-8BEN.
                </h2>

                <div className="mt-7 grid gap-5 md:grid-cols-2">
                  <TaxDocumentUpload
                    userId={
                      userId
                    }
                    documentKey="w8ben-document"
                    title="Completed W-8BEN"
                    description="Required W-8BEN document."
                    required
                    value={
                      w8benDocumentPath
                    }
                    onUploaded={
                      setW8benDocumentPath
                    }
                  />

                  <TaxDocumentUpload
                    userId={
                      userId
                    }
                    documentKey="w8ben-supporting-document"
                    title="Supporting tax document"
                    description="Optional supporting tax evidence."
                    value={
                      w8benSupportingDocumentPath
                    }
                    onUploaded={
                      setW8benSupportingDocumentPath
                    }
                  />
                </div>
              </section>
            </>
          )}

          {/* CERTIFICATION */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <ShieldCheck className="size-5 text-gold-600" />

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Electronic certification
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              Certify your tax information.
            </h2>

            <label className="mt-7 flex cursor-pointer items-start gap-4 rounded-xl border border-forest-900/10 bg-ivory-50 p-5">
              <input
                type="checkbox"
                checked={
                  form.certificationAccepted
                }
                onChange={(event) =>
                  updateField(
                    "certificationAccepted",
                    event.target.checked,
                  )
                }
                className="mt-1 size-4 accent-forest-950"
              />

              <span className="text-sm leading-7 text-stone-700">
                I certify that the tax information supplied is complete and accurate to the best of my knowledge.
              </span>
            </label>

            <div className="mt-6">
              <Field
                label="Electronic certification — full legal name"
                value={
                  form.certificationName
                }
                required
                onChange={(value) =>
                  updateField(
                    "certificationName",
                    value,
                  )
                }
              />
            </div>
          </section>

          {/* SUBMIT */}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                loading
              }
              className="focus-ring flex min-h-13 items-center justify-center gap-2 rounded-full bg-forest-950 px-7 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />

                  Submitting tax certification...
                </>
              ) : (
                "Save tax certification & continue"
              )}
            </button>
          </div>
        </>
      ) : null}
    </form>
  );
}

type FieldProps = {
  label: string;
  value: string;
  required?: boolean;
  type?: string;

  onChange: (
    value: string,
  ) => void;
};

function Field({
  label,
  value,
  required = false,
  type = "text",
  onChange,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">
        {label}
      </span>

      <input
        type={type}
        required={required}
        value={value}
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

  onToggle: () => void;

  onChange: (
    value: string,
  ) => void;
};

function SensitiveField({
  label,
  value,
  visible,
  onToggle,
  onChange,
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
          value={value}
          autoComplete="off"
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          className="focus-ring min-h-13 w-full rounded-xl border border-forest-900/10 bg-ivory-50 px-4 pr-12 text-sm text-forest-950 outline-none"
        />

        <button
          type="button"
          onClick={
            onToggle
          }
          aria-label={
            visible
              ? `Hide ${label}`
              : `Show ${label}`
          }
          className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-stone-500 hover:bg-white"
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

type SelectFieldProps = {
  label: string;
  value: string;

  options: {
    value: string;
    label: string;
  }[];

  onChange: (
    value: string,
  ) => void;
};

function SelectField({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="focus-ring min-h-13 w-full rounded-xl border border-forest-900/10 bg-ivory-50 px-4 text-sm text-forest-950 outline-none"
      >
        {options.map(
          (option) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {option.label}
            </option>
          ),
        )}
      </select>
    </label>
  );
}