
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  Loader2,
  Save,
  UserRoundPlus,
} from "lucide-react";

export default function AddStaffApplicantForm() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [positionTitle, setPositionTitle] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

 

async function handleSubmit(
  event: React.FormEvent<HTMLFormElement>,
) {
  event.preventDefault();

  if (saving) return;

  setError(null);

  // Normalize applicant information
  const first = firstName.trim();
  const last = lastName.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const position = positionTitle.trim();

  // Validate required fields
  if (!first || !last || !normalizedEmail || !position) {
    setError(
      "Please complete all required fields, including the position applied for.",
    );
    return;
  }

  // Validate field lengths
  if (
    first.length > 100 ||
    last.length > 100 ||
    normalizedEmail.length > 254 ||
    position.length > 150
  ) {
    setError(
      "One or more fields exceed the maximum allowed length.",
    );
    return;
  }

  // Validate email format
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedEmail)) {
    setError("Please enter a valid email address.");
    return;
  }

  setSaving(true);

  try {
    const response = await fetch("/api/admin/staff", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: first,
        lastName: last,
        email: normalizedEmail,
        positionTitle: position,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || "Unable to save applicant.",
      );
    }

    if (!result.applicant?.id) {
      throw new Error(
        "Applicant saved, but no record ID was returned.",
      );
    }

    // Navigate to the newly created applicant
    router.push(`/admin/staff/${result.applicant.id}`);
    router.refresh();
  } catch (caughtError) {
    setError(
      caughtError instanceof Error
        ? caughtError.message
        : "An unexpected error occurred.",
    );
  } finally {
    setSaving(false);
  }
}



  return (
    <div className="max-w-3xl">
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-forest-900/10 bg-white shadow-sm"
      >
        <div className="border-b border-forest-900/10 px-6 py-6 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-forest-950/5 text-forest-900">
              <UserRoundPlus className="size-5" />
            </span>

            <div>
              <h2 className="font-display text-xl font-semibold text-forest-950">
                Applicant Information
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                Enter the applicant's details below.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-6 py-7 sm:px-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-semibold text-forest-950"
              >
                First Name *
              </label>

              <input
                id="firstName"
                type="text"
                required
                maxLength={100}
                autoComplete="given-name"
                value={firstName}
                onChange={(event) =>
                  setFirstName(event.target.value)
                }
                placeholder="Enter first name"
                className="w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3 text-sm text-forest-950 outline-none transition focus:border-gold-700"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-sm font-semibold text-forest-950"
              >
                Last Name *
              </label>

              <input
                id="lastName"
                type="text"
                required
                maxLength={100}
                autoComplete="family-name"
                value={lastName}
                onChange={(event) =>
                  setLastName(event.target.value)
                }
                placeholder="Enter last name"
                className="w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3 text-sm text-forest-950 outline-none transition focus:border-gold-700"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-forest-950"
            >
              Email Address *
            </label>

            <input
              id="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="applicant@example.com"
              className="w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3 text-sm text-forest-950 outline-none transition focus:border-gold-700"
            />

            <p className="mt-2 text-xs text-stone-500">
              Recruitment emails will be sent to
              this address when you choose to send them.
            </p>
          </div>

          <div>
        <label
            htmlFor="positionTitle"
            className="mb-2 block text-sm font-semibold text-forest-950"
        >
            Position Applied For *
        </label>

        <input
            id="positionTitle"
            type="text"
            required
            maxLength={150}
            value={positionTitle}
            onChange={(event) =>
            setPositionTitle(event.target.value)
            }
            placeholder="e.g. Guest Experience Coordinator"
            className="w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3 text-sm text-forest-950 outline-none transition focus:border-gold-700"
        />

        <p className="mt-2 text-xs text-stone-500">
            Enter the position this applicant is applying for.
            This title will also appear in their recruitment emails.
        </p>
        </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-forest-900/10 px-6 py-5 sm:px-8">
          <Link
            href="/admin/staff"
            className="inline-flex items-center gap-2 rounded-xl border border-forest-900/15 px-5 py-3 text-sm font-semibold text-forest-900 hover:bg-ivory-100"
          >
            <ArrowLeft className="size-4" />
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-forest-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving Applicant...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save Applicant
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
