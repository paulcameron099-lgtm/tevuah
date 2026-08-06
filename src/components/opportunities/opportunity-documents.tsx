import {
  Download,
  FileText,
  LockKeyhole,  
} from "lucide-react";

import type { OpportunityDocument } from "@/src/types/opportunity-detail";

type OpportunityDocumentsProps = {
  documents: OpportunityDocument[];
};

export function OpportunityDocuments({
  documents,
}: OpportunityDocumentsProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-forest-900/10 bg-white">
      {documents.map((document, index) => (
        <article
          key={document.id}
          className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
          style={{
            borderTop:
              index === 0
                ? undefined
                : "1px solid rgba(25, 32, 28, 0.1)",
          }}
        >
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest-950 text-gold-400">
              <FileText className="size-5" />
            </span>

            <div>
              <p className="text-sm font-semibold text-forest-950">
                {document.title}
              </p>

              <p className="mt-1 text-xs text-stone-500">
                {document.category} · {document.format} · {document.size}
              </p>
            </div>
          </div>

          {document.status === "Available" ? (
            <button
              type="button"
              className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-forest-900/15 px-4 text-xs font-semibold text-forest-950"
            >
              <Download className="size-4" />
              Download
            </button>
          ) : (
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-forest-900/5 px-4 py-2 text-xs font-semibold text-stone-600">
              <LockKeyhole className="size-3.5" />
              {document.status}
            </span>
          )}
        </article>
      ))}
    </div>
  );
}