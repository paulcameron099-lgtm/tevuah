"use client";

import {
  Loader2,
  NotebookPen,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

type AdminNotesProps = {
  userId: string;

  initialNotes:
    | string
    | null;
};

export function AdminNotes({
  userId,
  initialNotes,
}: AdminNotesProps) {
  const router =
    useRouter();

  const [
    notes,
    setNotes,
  ] = useState(
    initialNotes ?? "",
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    saved,
    setSaved,
  ] = useState(false);

  async function saveNotes() {
    setError(null);
    setSaved(false);

    if (!notes.trim()) {
      setError(
        "Enter an admin note.",
      );

      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          `/api/admin/compliance/${userId}/notes`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                notes,
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
            "Unable to save admin note.",
        );

        return;
      }

      setSaved(true);

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "Admin note request error:",
        requestError,
      );

      setError(
        "Unable to save admin note.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
      <div className="flex items-center gap-4">
        <span className="flex size-11 items-center justify-center rounded-full bg-forest-950 text-gold-400">
          <NotebookPen className="size-5" />
        </span>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
            Internal compliance
          </p>

          <h2 className="font-display mt-2 text-3xl font-semibold text-forest-950">
            Admin notes
          </h2>
        </div>
      </div>

      <p className="mt-5 text-sm leading-7 text-stone-600">
        These notes are internal and are not
        shown to the investor.
      </p>

      <textarea
        value={notes}
        onChange={(
          event,
        ) => {
          setNotes(
            event.target.value,
          );

          setSaved(false);
        }}
        rows={6}
        placeholder="Add internal compliance observations..."
        className="focus-ring mt-6 w-full rounded-xl border border-forest-900/10 bg-ivory-50 p-4 text-sm leading-7 text-forest-950 outline-none"
      />

      {error ? (
        <p className="mt-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {saved ? (
        <p className="mt-3 text-sm font-semibold text-emerald-700">
          Admin note saved.
        </p>
      ) : null}

      <button
        type="button"
        disabled={loading}
        onClick={saveNotes}
        className="focus-ring mt-5 flex min-h-11 items-center justify-center gap-2 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />

            Saving...
          </>
        ) : (
          "Save admin note"
        )}
      </button>
    </section>
  );
}