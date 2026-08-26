"use client";

import {
  CheckCircle2,
  FileText,
  Loader2,
  Upload,
} from "lucide-react";

import {
  useRef,
  useState,
} from "react";

import { createClient } from "@/src/lib/supabase/client";

type TaxDocumentKey =
  | "w9-document"
  | "w9-supporting-document"
  | "w8ben-document"
  | "w8ben-supporting-document";

type TaxDocumentUploadProps = {
  userId: string;

  title: string;
  description: string;

  documentKey: TaxDocumentKey;

  value: string | null;

  required?: boolean;

  onUploaded: (
    path: string,
  ) => void;
};

const MAX_FILE_SIZE =
  8 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export function TaxDocumentUpload({
  userId,
  title,
  description,
  documentKey,
  value,
  required = false,
  onUploaded,
}: TaxDocumentUploadProps) {
  const supabase =
    createClient();

  const inputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  async function handleFile(
    file: File,
  ) {
    setError(null);

    if (
      !ALLOWED_TYPES.includes(
        file.type,
      )
    ) {
      setError(
        "Use PDF, JPG, PNG or WEBP.",
      );

      return;
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      setError(
        "File must be 8 MB or smaller.",
      );

      return;
    }

    setUploading(true);

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() ||
      "pdf";

    const path =
      `${userId}/tax/${documentKey}.${extension}`;

    const {
      data,
      error: uploadError,
    } = await supabase.storage
      .from(
        "investor-verification",
      )
      .upload(
        path,
        file,
        {
          upsert: true,

          contentType:
            file.type,

          cacheControl:
            "3600",
        },
      );

    if (uploadError) {
      console.error(
        "Tax document upload error:",
        uploadError,
      );

      setError(
        uploadError.message,
      );

      setUploading(false);

      return;
    }

    /*
     * IMPORTANT:
     *
     * We use the path returned by
     * Supabase.
     */
    const uploadedPath =
      data.path;

    onUploaded(
      uploadedPath,
    );

    setUploading(false);
  }

  return (
    <div className="rounded-[1.25rem] border border-forest-900/10 bg-ivory-50 p-5">
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-gold-600">
          <FileText className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-forest-950">
              {title}
            </p>

            {required ? (
              <span className="rounded-full bg-red-50 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-widest text-red-700">
                Required
              </span>
            ) : (
              <span className="rounded-full bg-white px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-widest text-stone-500">
                Optional
              </span>
            )}
          </div>

          <p className="mt-2 text-xs leading-6 text-stone-500">
            {description}
          </p>
        </div>

        {value ? (
          <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file =
            event.target.files?.[0];

          if (file) {
            void handleFile(
              file,
            );
          }

          event.currentTarget.value =
            "";
        }}
      />

      <button
        type="button"
        disabled={uploading}
        onClick={() =>
          inputRef.current?.click()
        }
        className="focus-ring mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-forest-900/10 bg-white px-4 text-sm font-semibold text-forest-950 transition hover:border-forest-900/25 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Uploading...
          </>
        ) : value ? (
          <>
            <Upload className="size-4" />
            Replace document
          </>
        ) : (
          <>
            <Upload className="size-4" />
            Upload document
          </>
        )}
      </button>

      {value ? (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
          <p className="text-xs font-semibold text-emerald-700">
            ✓ Uploaded securely
          </p>

          <p className="mt-1 truncate text-[0.65rem] text-emerald-700/70">
            {value}
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="mt-3 text-xs leading-5 text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}