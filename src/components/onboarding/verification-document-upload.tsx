"use client";

import {
  CheckCircle2,
  FileImage,
  Loader2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";

import { createClient } from "@/src/lib/supabase/client";

type VerificationDocumentUploadProps = {
  userId: string;

  title: string;
  description: string;

  folder:
    | "drivers-license"
    | "ssn";

  side:
    | "front"
    | "back";

  value: string | null;

  onUploaded: (
    path: string,
  ) => void;
};

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export function VerificationDocumentUpload({
  userId,
  title,
  description,
  folder,
  side,
  value,
  onUploaded,
}: VerificationDocumentUploadProps) {
  const supabase =
    createClient();

  const inputRef =
    useRef<HTMLInputElement>(null);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleFile(
    file: File,
  ) {
    setError(null);

    if (
      !allowedTypes.includes(
        file.type,
      )
    ) {
      setError(
        "Use JPG, PNG or WEBP.",
      );

      return;
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      setError(
        "File must be 5 MB or smaller.",
      );

      return;
    }

    setUploading(true);

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() ||
      "jpg";

    const path =
      `${userId}/${folder}/${side}.${extension}`;

    const {
      error: uploadError,
    } = await supabase.storage
      .from(
        "investor-verification",
      )
      .upload(
        path,
        file,
        {
          cacheControl: "3600",
          contentType:
            file.type,
          upsert: true,
        },
      );

    if (uploadError) {
      console.error(
        uploadError,
      );

      setError(
        uploadError.message,
      );

      setUploading(false);

      return;
    }

    onUploaded(path);
    setUploading(false);
  }

  return (
    <div className="rounded-[1.25rem] border border-forest-900/10 bg-ivory-50 p-5">
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-gold-600">
          <FileImage className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-forest-950">
            {title}
          </p>

          <p className="mt-1 text-xs leading-6 text-stone-500">
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
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file =
            event.target.files?.[0];

          if (file) {
            void handleFile(file);
          }
        }}
      />

      <button
        type="button"
        disabled={uploading}
        onClick={() =>
          inputRef.current?.click()
        }
        className="focus-ring mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-forest-900/10 bg-white px-4 text-sm font-semibold text-forest-950 transition hover:border-forest-900/20 disabled:opacity-50"
      >
        {uploading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Uploading...
          </>
        ) : value ? (
          <>
            <Upload className="size-4" />
            Replace image
          </>
        ) : (
          <>
            <Upload className="size-4" />
            Upload image
          </>
        )}
      </button>

      {value ? (
        <p className="mt-3 truncate text-xs text-emerald-700">
          Uploaded securely
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 text-xs leading-5 text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}