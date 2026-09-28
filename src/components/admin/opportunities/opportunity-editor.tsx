"use client";

import {
  AlertCircle,
  CheckCircle2,
  FileText,
  ImageIcon,
  Loader2,
  Save,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import { OpportunityLifecycleAction } from "@/src/components/admin/opportunities/opportunity-lifecycle-action";

type EstateOption = {
  id: string;
  name: string;
};

type OpportunityDocument = {
  id: string;

  label: string;

  documentType: string;

  fileName:
    | string
    | null;

  signedUrl:
    | string
    | null;
};

type OpportunityEditorProps = {
  opportunity: {
    id: string;

    title: string;

    slug: string;

    shortDescription:
      | string
      | null;

    fullDescription:
      | string
      | null;

    assetCategory: string;

    estateId:
      | string
      | null;

    location:
      | string
      | null;

    fundingTarget: number;

    minimumInvestment: number;

    expectedDurationMonths:
      | number
      | null;

    targetReturnMin:
      | number
      | null;

    targetReturnMax:
      | number
      | null;

    targetReturnNote:
      | string
      | null;

    coverImagePath:
      | string
      | null;

    coverImageUrl:
      | string
      | null;

    status: string;
  };

  estates:
    EstateOption[];

  documents:
    OpportunityDocument[];

  fundingInstructions: {
    id: string;
    paymentMethod: string;
    bankName: string | null;
    beneficiaryName: string | null;
    accountNumber: string | null;
    routingNumber: string | null;
    swiftCode: string | null;
    iban: string | null;
    bankAddress: string | null;
    paymentReferencePrefix: string | null;
    instructions: string | null;
    status: string;
  } | null;
};

export function OpportunityEditor({
  opportunity,
  estates,
  documents:
    initialDocuments,
  fundingInstructions,
}: OpportunityEditorProps) {
  const router =
    useRouter();

  /*
   * --------------------------------------------------
   * CORE FIELDS
   * --------------------------------------------------
   */
  const [
    title,
    setTitle,
  ] =
    useState(
      opportunity.title,
    );

  const [
    slug,
    setSlug,
  ] =
    useState(
      opportunity.slug,
    );

  const [
    shortDescription,
    setShortDescription,
  ] =
    useState(
      opportunity.shortDescription ??
        "",
    );

  const [
    fullDescription,
    setFullDescription,
  ] =
    useState(
      opportunity.fullDescription ??
        "",
    );

  const [
    assetCategory,
    setAssetCategory,
  ] =
    useState(
      opportunity.assetCategory,
    );

  const [
    estateId,
    setEstateId,
  ] =
    useState(
      opportunity.estateId ??
        "",
    );

  const [
    location,
    setLocation,
  ] =
    useState(
      opportunity.location ??
        "",
    );

  const [
    fundingTarget,
    setFundingTarget,
  ] =
    useState(
      String(
        opportunity.fundingTarget,
      ),
    );

  const [
    minimumInvestment,
    setMinimumInvestment,
  ] =
    useState(
      String(
        opportunity.minimumInvestment,
      ),
    );

  const [
    expectedDurationMonths,
    setExpectedDurationMonths,
  ] =
    useState(
      opportunity.expectedDurationMonths !=
        null
        ? String(
            opportunity.expectedDurationMonths,
          )
        : "",
    );

  const [
    targetReturnMin,
    setTargetReturnMin,
  ] =
    useState(
      opportunity.targetReturnMin !=
        null
        ? String(
            opportunity.targetReturnMin,
          )
        : "",
    );

  const [
    targetReturnMax,
    setTargetReturnMax,
  ] =
    useState(
      opportunity.targetReturnMax !=
        null
        ? String(
            opportunity.targetReturnMax,
          )
        : "",
    );

  const [
    targetReturnNote,
    setTargetReturnNote,
  ] =
    useState(
      opportunity.targetReturnNote ??
        "",
    );

  /*
   * --------------------------------------------------
   * DOCUMENT STATE
   * --------------------------------------------------
   */
  const [
    documents,
    setDocuments,
  ] =
    useState(
      initialDocuments,
    );

  const [
    documentLabel,
    setDocumentLabel,
  ] =
    useState("");

  const [
    documentType,
    setDocumentType,
  ] =
    useState(
      "offering_memorandum",
    );

  const [
    documentFile,
    setDocumentFile,
  ] =
    useState<File | null>(
      null,
    );

  /*
   * --------------------------------------------------
   * COVER
   * --------------------------------------------------
   */
  const [
    coverUrl,
    setCoverUrl,
  ] =
    useState<
      string | null
    >(
      opportunity.coverImageUrl,
    );

  const [
    coverFile,
    setCoverFile,
  ] =
    useState<File | null>(
      null,
    );

  /*
   * --------------------------------------------------
   * UI STATE
   * --------------------------------------------------
   */
  const [
    loadingAction,
    setLoadingAction,
  ] =
    useState<string | null>(
      null,
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const [
    success,
    setSuccess,
  ] =
    useState<
      string | null
    >(null);

  const [
    publicationErrors,
    setPublicationErrors,
  ] =
    useState<string[]>(
      [],
    );

  /*
   * --------------------------------------------------
   * SAVE CORE DETAILS
   * --------------------------------------------------
   */
  async function saveOpportunity() {
    setError(null);
    setSuccess(null);

    setLoadingAction(
      "save",
    );

    try {
      const response =
        await fetch(
          `/api/admin/opportunities/${opportunity.id}`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                title,

                slug,

                shortDescription,

                fullDescription,

                assetCategory,

                estateId:
                  estateId ||
                  null,

                location,

                fundingTarget:
                  Number(
                    fundingTarget,
                  ),

                minimumInvestment:
                  Number(
                    minimumInvestment,
                  ),

                expectedDurationMonths:
                  expectedDurationMonths
                    ? Number(
                        expectedDurationMonths,
                      )
                    : null,

                targetReturnMin:
                  targetReturnMin
                    ? Number(
                        targetReturnMin,
                      )
                    : null,

                targetReturnMax:
                  targetReturnMax
                    ? Number(
                        targetReturnMax,
                      )
                    : null,

                targetReturnNote,
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
            "Unable to save opportunity.",
        );

        return;
      }

      setSuccess(
        "Opportunity details saved.",
      );

      router.refresh();
    } catch {
      setError(
        "Unable to save opportunity.",
      );
    } finally {
      setLoadingAction(
        null,
      );
    }
  }

  /*
   * --------------------------------------------------
   * COVER UPLOAD
   * --------------------------------------------------
   */
  async function uploadCover() {
    if (!coverFile) {
      setError(
        "Select a cover image first.",
      );

      return;
    }

    setError(null);

    setLoadingAction(
      "cover",
    );

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        coverFile,
      );

      const response =
        await fetch(
          `/api/admin/opportunities/${opportunity.id}/cover`,
          {
            method:
              "POST",

            body:
              formData,
          },
        );

      const result =
        (await response.json()) as {
          error?: string;
        };

      if (!response.ok) {
        setError(
          result.error ??
            "Unable to upload cover image.",
        );

        return;
      }

      setCoverFile(
        null,
      );

      setSuccess(
        "Cover image uploaded.",
      );

      /*
       * Refresh server page to get
       * a new signed image URL.
       */
      router.refresh();

      /*
       * We clear the old local URL so the
       * refreshed server value becomes source.
       */
      setCoverUrl(
        null,
      );
    } finally {
      setLoadingAction(
        null,
      );
    }
  }

  /*
   * --------------------------------------------------
   * DOCUMENT UPLOAD
   * --------------------------------------------------
   */
  async function uploadDocument() {
    if (!documentFile) {
      setError(
        "Select a document first.",
      );

      return;
    }

    if (
      !documentLabel.trim()
    ) {
      setError(
        "Enter a document label.",
      );

      return;
    }

    setError(null);

    setLoadingAction(
      "document",
    );

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        documentFile,
      );

      formData.append(
        "label",
        documentLabel,
      );

      formData.append(
        "documentType",
        documentType,
      );

      const response =
        await fetch(
          `/api/admin/opportunities/${opportunity.id}/documents`,
          {
            method:
              "POST",

            body:
              formData,
          },
        );

      const result =
        (await response.json()) as {
          error?: string;

          document?: {
            id: string;

            label: string;

            document_type: string;

            file_name:
              | string
              | null;
          };
        };

      if (!response.ok) {
        setError(
          result.error ??
            "Unable to upload document.",
        );

        return;
      }

      if (
        result.document
      ) {
        setDocuments(
          (
            current,
          ) => [
            ...current,

            {
              id:
                result.document!
                  .id,

              label:
                result.document!
                  .label,

              documentType:
                result.document!
                  .document_type,

              fileName:
                result.document!
                  .file_name,

              signedUrl:
                null,
            },
          ],
        );
      }

      setDocumentFile(
        null,
      );

      setDocumentLabel(
        "",
      );

      setSuccess(
        "Investment document uploaded.",
      );

      router.refresh();
    } finally {
      setLoadingAction(
        null,
      );
    }
  }

  /*
   * --------------------------------------------------
   * DELETE DOCUMENT
   * --------------------------------------------------
   */
  async function deleteDocument(
    documentId: string,
  ) {
    setError(null);

    setLoadingAction(
      documentId,
    );

    try {
      const response =
        await fetch(
          `/api/admin/opportunities/${opportunity.id}/documents`,
          {
            method:
              "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                documentId,
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
            "Unable to delete document.",
        );

        return;
      }

      setDocuments(
        (
          current,
        ) =>
          current.filter(
            (
              document,
            ) =>
              document.id !==
              documentId,
          ),
      );

      setSuccess(
        "Document removed.",
      );

      router.refresh();
    } finally {
      setLoadingAction(
        null,
      );
    }
  }


  /*
   * --------------------------------------------------
   * STATUS ACTION
   * --------------------------------------------------
   */
  async function changeStatus(
    status:
      | "draft"
      | "published"
      | "closed",
  ) {
    setError(null);
    setSuccess(null);
    setPublicationErrors([]);

    setLoadingAction(
      status,
    );

    try {
      const response =
        await fetch(
          `/api/admin/opportunities/${opportunity.id}/status`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                status,
              }),
          },
        );

      const result =
        (await response.json()) as {
          error?: string;

          publicationErrors?:
            string[];
        };

      if (!response.ok) {
        setError(
          result.error ??
            "Unable to update status.",
        );

        if (
          result.publicationErrors
        ) {
          setPublicationErrors(
            result.publicationErrors,
          );
        }

        return;
      }

      setSuccess(
        status ===
          "published"
          ? "Opportunity published."
          : status ===
              "closed"
            ? "Opportunity closed."
            : "Opportunity moved to draft.",
      );

      router.refresh();
    } finally {
      setLoadingAction(
        null,
      );
    }
  }

  return (
    <div className="space-y-8">
      {/* ==========================================
          STATUS
      ========================================== */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Publication
        </p>

        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold text-forest-950">
              Opportunity status
            </h2>

            <p className="mt-2 text-sm text-stone-600">
              Current status:{" "}
              <strong>
                {humanize(
                  opportunity.status,
                )}
              </strong>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {opportunity.status ===
            "draft" ? (
              <button
                type="button"
                disabled={
                  loadingAction !==
                  null
                }
                onClick={() =>
                  changeStatus(
                    "published",
                  )
                }
                className="focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="size-4" />

                Publish
              </button>
            ) : null}

            {opportunity.status ===
            "published" ? (
              <>
                <button
                  type="button"
                  disabled={
                    loadingAction !==
                    null
                  }
                  onClick={() =>
                    changeStatus(
                      "draft",
                    )
                  }
                  className="focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-forest-900/10 bg-white px-5 text-sm font-semibold text-forest-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Unpublish
                </button>
              </>
            ) : null}

           {opportunity.status ===
          "closed" ? (
            <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
              <p className="text-sm font-semibold text-stone-700">
                Opportunity closed
              </p>

              <p className="mt-1 text-xs leading-5 text-stone-500">
                Closed opportunities are preserved as historical records and cannot be reopened.
              </p>
            </div>
          ) : null}
          </div>
        </div>

        {publicationErrors.length >
        0 ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-semibold text-red-800">
              This opportunity cannot be published yet:
            </p>

            <ul className="mt-3 space-y-2">
              {publicationErrors.map(
                (
                  reason,
                ) => (
                  <li
                    key={
                      reason
                    }
                    className="flex items-start gap-2 text-sm text-red-700"
                  >
                    <span className="mt-2 size-1.5 rounded-full bg-red-600" />

                    {reason}
                  </li>
                ),
              )}
            </ul>
          </div>
        ) : null}
      </section>

      {/* ==========================================
          DETAILS
      ========================================== */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Opportunity details
        </p>

        <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
          Core information
        </h2>

        <div className="mt-7 grid gap-6 sm:grid-cols-2">
          <Field label="Title">
            <input
              value={title}
              onChange={(
                event,
              ) =>
                setTitle(
                  event.target.value,
                )
              }
              className={inputClass}
            />
          </Field>

          <Field label="URL slug">
            <input
              value={slug}
              onChange={(
                event,
              ) =>
                setSlug(
                  event.target.value,
                )
              }
              className={inputClass}
            />
          </Field>

          <Field label="Asset category">
            <select
              value={
                assetCategory
              }
              onChange={(
                event,
              ) =>
                setAssetCategory(
                  event.target.value,
                )
              }
              className={inputClass}
            >
              <option value="vineyard">
                Vineyard
              </option>

              <option value="olive_estate">
                Olive Estate
              </option>

              <option value="agtech">
                AgTech
              </option>

              <option value="fine_wine">
                Fine Wine
              </option>

              <option value="mixed">
                Mixed
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </Field>

          <Field label="Estate / asset">
            <select
              value={estateId}
              onChange={(
                event,
              ) =>
                setEstateId(
                  event.target.value,
                )
              }
              className={inputClass}
            >
              <option value="">
                No estate assigned
              </option>

              {estates.map(
                (
                  estate,
                ) => (
                  <option
                    key={
                      estate.id
                    }
                    value={
                      estate.id
                    }
                  >
                    {
                      estate.name
                    }
                  </option>
                ),
              )}
            </select>
          </Field>

          <Field label="Location">
            <input
              value={location}
              onChange={(
                event,
              ) =>
                setLocation(
                  event.target.value,
                )
              }
              className={inputClass}
            />
          </Field>

          <Field label="Funding target (USD)">
            <input
              type="number"
              value={
                fundingTarget
              }
              onChange={(
                event,
              ) =>
                setFundingTarget(
                  event.target.value,
                )
              }
              className={inputClass}
            />
          </Field>

          <Field label="Minimum investment (USD)">
            <input
              type="number"
              value={
                minimumInvestment
              }
              onChange={(
                event,
              ) =>
                setMinimumInvestment(
                  event.target.value,
                )
              }
              className={inputClass}
            />
          </Field>

          <Field label="Expected duration (months)">
            <input
              type="number"
              value={
                expectedDurationMonths
              }
              onChange={(
                event,
              ) =>
                setExpectedDurationMonths(
                  event.target.value,
                )
              }
              className={inputClass}
            />
          </Field>

          <Field label="Target return minimum (%)">
            <input
              type="number"
              step="0.01"
              value={
                targetReturnMin
              }
              onChange={(
                event,
              ) =>
                setTargetReturnMin(
                  event.target.value,
                )
              }
              className={inputClass}
            />
          </Field>

          <Field label="Target return maximum (%)">
            <input
              type="number"
              step="0.01"
              value={
                targetReturnMax
              }
              onChange={(
                event,
              ) =>
                setTargetReturnMax(
                  event.target.value,
                )
              }
              className={inputClass}
            />
          </Field>
        </div>

        <Field
          label="Short description"
          className="mt-6"
        >
          <textarea
            value={
              shortDescription
            }
            onChange={(
              event,
            ) =>
              setShortDescription(
                event.target.value,
              )
            }
            rows={3}
            className={textareaClass}
          />
        </Field>

        <Field
          label="Full description"
          className="mt-6"
        >
          <textarea
            value={
              fullDescription
            }
            onChange={(
              event,
            ) =>
              setFullDescription(
                event.target.value,
              )
            }
            rows={8}
            className={textareaClass}
          />
        </Field>

        <Field
          label="Return presentation / disclosure"
          className="mt-6"
        >
          <textarea
            value={
              targetReturnNote
            }
            onChange={(
              event,
            ) =>
              setTargetReturnNote(
                event.target.value,
              )
            }
            rows={4}
            className={textareaClass}
          />
        </Field>

        <button
          type="button"
          disabled={
            loadingAction !==
            null
          }
          onClick={
            saveOpportunity
          }
          className="focus-ring mt-7 inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="size-4" />

          Save changes
        </button>
      </section>

    {/* ==========================================
    COVER IMAGE
========================================== */}

<section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
  <ImageIcon className="size-5 text-gold-600" />

  <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
    Cover image
  </h2>

  <p className="mt-3 text-sm leading-7 text-stone-600">
    Upload a JPG, PNG or WebP image for this investment
    opportunity. Maximum file size is 8 MB.
  </p>

  {coverUrl ? (
    <img
      src={coverUrl}
      alt={title}
      className="mt-6 h-64 w-full rounded-2xl object-cover"
    />
  ) : (
    <div className="mt-6 flex h-48 items-center justify-center rounded-2xl border border-dashed border-forest-900/20 bg-ivory-50 text-sm text-stone-400">
      No cover image uploaded
    </div>
  )}

  <div className="mt-6">
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
        Select cover image
      </span>

      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={(event) => {
          const selectedFile =
            event.target.files?.[0] ??
            null;

          console.log(
            "Selected cover file:",
            selectedFile,
          );

          setCoverFile(
            selectedFile,
          );

          setError(null);
          setSuccess(null);
        }}
        className="block w-full cursor-pointer rounded-xl border border-forest-900/10 bg-ivory-50 p-3 text-sm text-forest-950 file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-forest-950 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
      />
    </label>

    {coverFile ? (
      <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
          Selected image
        </p>

        <p className="mt-1 break-all text-sm font-semibold text-forest-950">
          {coverFile.name}
        </p>

        <p className="mt-1 text-xs text-stone-500">
          {formatFileSize(
            coverFile.size,
          )}
        </p>
      </div>
    ) : (
      <p className="mt-3 text-xs text-stone-500">
        No image selected yet.
      </p>
    )}

    <button
      type="button"
      disabled={
        loadingAction !== null
      }
      onClick={
        uploadCover
      }
      className="focus-ring mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loadingAction ===
      "cover" ? (
        <>
          <Loader2 className="size-4 animate-spin" />

          Uploading image...
        </>
      ) : (
        <>
          <ImageIcon className="size-4" />

          Upload cover image
        </>
      )}
    </button>
  </div>
</section>

      {/* ==========================================
          DOCUMENTS
      ========================================== */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <FileText className="size-5 text-gold-600" />

        <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
          Investment documents
        </h2>

        <p className="mt-3 text-sm leading-7 text-stone-600">
          These files are stored privately. Access is
          provided through temporary signed links.
        </p>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <Field label="Document label">
            <input
              value={
                documentLabel
              }
              onChange={(
                event,
              ) =>
                setDocumentLabel(
                  event.target.value,
                )
              }
              className={inputClass}
            />
          </Field>

          <Field label="Document type">
            <select
              value={
                documentType
              }
              onChange={(
                event,
              ) =>
                setDocumentType(
                  event.target.value,
                )
              }
              className={inputClass}
            >
              <option value="offering_memorandum">
                Offering Memorandum
              </option>

              <option value="financial_report">
                Financial Report
              </option>

              <option value="valuation">
                Valuation
              </option>

              <option value="estate_report">
                Estate Report
              </option>

              <option value="legal">
                Legal
              </option>

              <option value="subscription_document">
                Subscription Document
              </option>

              <option value="presentation">
                Presentation
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </Field>
        </div>

        <div className="mt-6">
  <label className="block">
    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
      Select actual document file
    </span>

    <input
      type="file"
      accept=".pdf,.docx,.xlsx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      onChange={(event) => {
        const selectedFile =
          event.target.files?.[0] ??
          null;

        console.log(
          "Selected document file:",
          selectedFile,
        );

        setDocumentFile(
          selectedFile,
        );

        setError(null);
        setSuccess(null);
      }}
      className="block w-full cursor-pointer rounded-xl border border-forest-900/10 bg-ivory-50 p-3 text-sm text-forest-950 file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-forest-950 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
    />
  </label>

    {documentFile ? (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
            Selected document
        </p>

        <p className="mt-1 break-all text-sm font-semibold text-forest-950">
            {documentFile.name}
        </p>

        <p className="mt-1 text-xs text-stone-500">
            {formatFileSize(
            documentFile.size,
            )}
        </p>
        </div>
    ) : (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-900">
            No document file selected.
        </p>

        <p className="mt-1 text-xs leading-6 text-amber-800">
            Selecting the document type above does not
            select a file. Click the file chooser and
            select a PDF, DOCX or XLSX from your computer.
        </p>
        </div>
    )}
    </div>

        <button
        type="button"
        disabled={
            loadingAction !== null
        }
        onClick={
            uploadDocument
        }
        className="focus-ring mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
        {loadingAction ===
        "document" ? (
            <>
            <Loader2 className="size-4 animate-spin" />

            Uploading document...
            </>
        ) : (
            <>
            <FileText className="size-4" />

            Upload document
            </>
        )}
        </button>

        <div className="mt-8 space-y-3">
          {documents.length ===
          0 ? (
            <p className="text-sm text-stone-500">
              No investment documents uploaded.
            </p>
          ) : (
            documents.map(
              (
                document,
              ) => (
                <div
                  key={
                    document.id
                  }
                  className="flex flex-col gap-4 rounded-xl border border-forest-900/10 bg-ivory-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-forest-950">
                      {
                        document.label
                      }
                    </p>

                    <p className="mt-1 text-xs text-stone-500">
                      {humanize(
                        document.documentType,
                      )}
                      {" · "}
                      {document.fileName ??
                        "Document"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {document.signedUrl ? (
                      <a
                        href={
                          document.signedUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-9 cursor-pointer items-center rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950"
                      >
                        View
                      </a>
                    ) : null}

                    <button
                      type="button"
                      disabled={
                        loadingAction !==
                        null
                      }
                      onClick={() =>
                        deleteDocument(
                          document.id,
                        )
                      }
                      className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full bg-red-50 px-4 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="size-3.5" />

                      Delete
                    </button>
                  </div>
                </div>
              ),
            )
          )}
        </div>
      </section>

      {/* ==========================================
          LIFECYCLE ADMINISTRATION
      ========================================== */}

      <OpportunityLifecycleAction
        opportunityId={
          opportunity.id
        }
        opportunityTitle={
          opportunity.title
        }
        status={
          opportunity.status
        }
      />

      {/* ==========================================
          FEEDBACK
      ========================================== */}

      {error ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />

          {error}
        </div>
      ) : null}

      {success ? (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />

          {success}
        </div>
      ) : null}

      {loadingAction ? (
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <Loader2 className="size-4 animate-spin" />

          Processing...
        </div>
      ) : null}
    </div>
  );
}

const inputClass =
  "focus-ring min-h-12 w-full rounded-xl border border-forest-900/10 bg-ivory-50 px-4 text-sm text-forest-950 outline-none";

const textareaClass =
  "focus-ring w-full rounded-xl border border-forest-900/10 bg-ivory-50 p-4 text-sm leading-7 text-forest-950 outline-none";

function Field({
  label,
  className = "",
  children,
}: {
  label: string;

  className?: string;

  children:
    React.ReactNode;
}) {
  return (
    <label
      className={`block ${className}`}
    >
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
        {label}
      </span>

      {children}
    </label>
  );
}

function FundingField({
  label,
  value,
  onChange,
}: {
  label: string;

  value: string;

  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <Field label={label}>
      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className={inputClass}
      />
    </Field>
  );
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
      (
        letter,
      ) =>
        letter.toUpperCase(),
    );
}

function formatFileSize(
  bytes: number,
) {
  if (
    bytes <
    1024
  ) {
    return `${bytes} bytes`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(
      1,
    )} KB`;
  }

  return `${(
    bytes /
    (
      1024 *
      1024
    )
  ).toFixed(
    1,
  )} MB`;
}