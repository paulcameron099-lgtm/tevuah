"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  X,
} from "lucide-react";

import {
  Container,
} from "@/src/components/ui/container";

import type {
  TevuahEvent,
} from "@/src/data/event";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  country: string;
  intent: string;
  attendance: string;
  attendees: string;
  comments: string;
  futureEvents: string;
  privacyAccepted: boolean;
  website: string;
};

const initial: FormValues = {
  firstName: "",
  lastName: "",
  email: "",
  telephone: "",
  country: "",
  intent: "reserve",
  attendance: "alone",
  attendees: "1",
  comments: "",
  futureEvents: "no",
  privacyAccepted: false,
  website: "",
};

const countries = [
  "Argentina",
  "Australia",
  "Austria",
  "Belgium",
  "Brazil",
  "Canada",
  "China",
  "Denmark",
  "Egypt",
  "France",
  "Germany",
  "Ghana",
  "Greece",
  "India",
  "Ireland",
  "Israel",
  "Italy",
  "Japan",
  "Kenya",
  "Mexico",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Norway",
  "Portugal",
  "Saudi Arabia",
  "Singapore",
  "South Africa",
  "Spain",
  "Sweden",
  "Switzerland",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Other",
];

const inputClass =
  "focus-ring mt-2 min-h-12 w-full rounded-xl border border-forest-900/15 bg-white px-4 text-sm text-forest-950 outline-none focus:border-gold-600";

const labelClass =
  "block text-sm font-semibold text-forest-950";

const nextSteps = [
  {
    title: "Enquiry received",
    description:
      "Your submission is received by the Tevuah Reserve events team.",
  },
  {
    title: "Details reviewed",
    description:
      "Our team reviews your attendance request and any questions or participation requirements.",
  },
  {
    title: "Confirmation and next steps",
    description:
      "We contact you with the relevant event information and confirm whether a place is available.",
  },
  {
    title: "Event preparation",
    description:
      "Confirmed attendees receive the practical details needed to prepare for the event, including any relevant timing, venue and attendance instructions.",
  },
];

export function EventRegistrationForm({
  event,
}: {
  event: TevuahEvent;
}) {
  const [form, setForm] =
    useState<FormValues>(initial);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);
    

  function set<K extends keyof FormValues>(
    key: K,
    value: FormValues[K],
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }


useEffect(() => {
  if (!success) return;

  function handleEscape(event: KeyboardEvent) {
    if (event.key === "Escape") {
      setSuccess(false);
    }
  }

  document.addEventListener("keydown", handleEscape);

  return () => {
    document.removeEventListener("keydown", handleEscape);
  };
}, [success]);


  async function submit(
    eventObject: FormEvent<HTMLFormElement>,
  ) {
    eventObject.preventDefault();

    if (submitting) return;

    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(
        "/api/events/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            eventSlug: event.slug,
          }),
        },
      );

      const result: {
        ok?: boolean;
        error?: string;
      } = await response.json();

      
        if (!response.ok || !result.ok) {
        throw new Error(
            result.error ||
            "Unable to submit your enquiry. Please try again.",
        );
        }

        // Clear all form fields after successful submission
        setForm({ ...initial });

        // Clear any previous error
        setError("");

        // Display success confirmation modal
        setSuccess(true);

    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to submit your enquiry. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="bg-ivory-100 pb-20 pt-32 lg:pt-38">
      <Container>
        <div className="mx-auto max-w-4xl">
          <Link
            href={`/events/${event.slug}`}
            className="focus-ring inline-flex items-center gap-2 text-sm font-semibold text-forest-950 hover:text-gold-700"
          >
            <ArrowLeft className="size-4" />
            Back to event
          </Link>

          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
            Event Registration
          </p>

          <h1 className="font-display mt-4 text-5xl font-medium tracking-[-0.04em] text-forest-950 sm:text-6xl">
            Register your interest
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-8 text-stone-600">
            Submit your details to register your
            interest in attending a Tevuah Reserve
            event. Our events team will review your
            enquiry and follow up with information
            about availability, participation
            requirements and next steps.
          </p>

          <form
            onSubmit={submit}
            className="mt-12 space-y-7"
          >
            {/* 01 — EVENT DETAILS */}

            <section className="rounded-3xl border border-forest-900/10 bg-white p-6 sm:p-9">
              <h2 className="font-display text-2xl font-medium text-forest-950">
                01 — Event details
              </h2>

              <dl className="mt-7 grid gap-6 sm:grid-cols-2">
                {[
                  ["Selected event", event.title],
                  ["Event date", event.date],
                  ["Location", event.location],
                  ["Event format", event.format],
                  ["Event category", event.category],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className={
                      label === "Selected event"
                        ? "sm:col-span-2"
                        : ""
                    }
                  >
                    <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                      {label}
                    </dt>

                    <dd className="mt-2 text-sm font-semibold text-forest-950">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* 02 — YOUR DETAILS */}

            <section className="rounded-3xl border border-forest-900/10 bg-white p-6 sm:p-9">
              <h2 className="font-display text-2xl font-medium text-forest-950">
                02 — Your details
              </h2>

              <p className="mt-3 text-sm text-stone-600">
                Please provide your contact information
                so our team can respond to your enquiry.
              </p>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <label className={labelClass}>
                  First name *

                  <input
                    required
                    autoComplete="given-name"
                    maxLength={80}
                    value={form.firstName}
                    onChange={(event) =>
                      set("firstName", event.target.value)
                    }
                    placeholder="Enter your first name"
                    className={inputClass}
                  />
                </label>

                <label className={labelClass}>
                  Last name *

                  <input
                    required
                    autoComplete="family-name"
                    maxLength={80}
                    value={form.lastName}
                    onChange={(event) =>
                      set("lastName", event.target.value)
                    }
                    placeholder="Enter your last name"
                    className={inputClass}
                  />
                </label>

                <label className={labelClass}>
                  Email address *

                  <input
                    required
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    value={form.email}
                    onChange={(event) =>
                      set("email", event.target.value)
                    }
                    placeholder="Enter your email address"
                    className={inputClass}
                  />
                </label>

                <label className={labelClass}>
                  Telephone number

                  <input
                    type="tel"
                    autoComplete="tel"
                    maxLength={40}
                    value={form.telephone}
                    onChange={(event) =>
                      set("telephone", event.target.value)
                    }
                    placeholder="Include country code"
                    className={inputClass}
                  />
                </label>

                <label
                  className={`${labelClass} sm:col-span-2`}
                >
                  Country of residence *

                  <select
                    required
                    autoComplete="country-name"
                    value={form.country}
                    onChange={(event) =>
                      set("country", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">
                      Select your country
                    </option>

                    {countries.map((country) => (
                      <option
                        key={country}
                        value={country}
                      >
                        {country}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            {/* 03 — PARTICIPATION */}

            <section className="rounded-3xl border border-forest-900/10 bg-white p-6 sm:p-9">
              <h2 className="font-display text-2xl font-medium text-forest-950">
                03 — Your participation
              </h2>

              <fieldset className="mt-7">
                <legend className={labelClass}>
                  How would you like to proceed? *
                </legend>

                <div className="mt-4 space-y-3">
                  {[
                    [
                      "reserve",
                      "Reserve a place — I would like to attend the event.",
                    ],
                    [
                      "information",
                      "Request event information — I would like more details before confirming.",
                    ],
                    [
                      "team",
                      "Speak with the events team — I have questions about the programme or participation.",
                    ],
                  ].map(([value, label]) => (
                    <label
                      key={value}
                      className="flex cursor-pointer items-start gap-3 rounded-xl border border-forest-900/10 p-4 text-sm text-stone-700"
                    >
                      <input
                        type="radio"
                        name="intent"
                        required
                        checked={form.intent === value}
                        onChange={() =>
                          set("intent", value)
                        }
                        className="mt-1 accent-emerald-900"
                      />

                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-7">
                <legend className={labelClass}>
                  Will you be attending alone or with a guest?
                </legend>

                <div className="mt-4 flex flex-wrap gap-5">
                  {[
                    ["alone", "Attending alone"],
                    ["guest", "Attending with a guest"],
                    ["undecided", "Not yet decided"],
                  ].map(([value, label]) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 text-sm text-stone-700"
                    >
                      <input
                        type="radio"
                        name="attendance"
                        checked={form.attendance === value}
                        onChange={() =>
                          setForm((previous) => ({
                            ...previous,
                            attendance: value,
                            attendees:
                              value === "alone"
                                ? "1"
                                : previous.attendees,
                          }))
                        }
                        className="accent-emerald-900"
                      />

                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label
                className={`${labelClass} mt-7 block max-w-xs`}
              >
                Number of attendees

                <select
                  value={form.attendees}
                  onChange={(event) =>
                    set("attendees", event.target.value)
                  }
                  disabled={form.attendance === "alone"}
                  className={`${inputClass} disabled:opacity-60`}
                >
                  {["1", "2", "3", "4", "5+"].map(
                    (value) => (
                      <option
                        key={value}
                        value={value}
                      >
                        {value}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <p className="mt-4 text-xs leading-6 text-stone-500">
                Guest attendance is subject to
                availability and confirmation.
              </p>
            </section>

            {/* 04 — ADDITIONAL INFORMATION */}

            <section className="rounded-3xl border border-forest-900/10 bg-white p-6 sm:p-9">
              <h2 className="font-display text-2xl font-medium text-forest-950">
                04 — Additional information
              </h2>

              <p className="mt-3 text-sm leading-7 text-stone-600">
                Tell us if there is anything our events
                team should know about your enquiry.
              </p>

              <label
                className={`${labelClass} mt-6 block`}
              >
                Questions or comments

                <textarea
                  rows={5}
                  maxLength={3000}
                  value={form.comments}
                  onChange={(event) =>
                    set("comments", event.target.value)
                  }
                  placeholder="Enter your message"
                  className={`${inputClass} py-3`}
                />
              </label>

              <p className="mt-3 text-xs leading-6 text-stone-500">
                You may use this section to ask about
                the programme, event schedule,
                attendance requirements,
                accessibility or other practical
                arrangements.
              </p>
            </section>

            {/* 05 — COMMUNICATION PREFERENCES */}

            <section className="rounded-3xl border border-forest-900/10 bg-white p-6 sm:p-9">
              <h2 className="font-display text-2xl font-medium text-forest-950">
                05 — Communication preferences
              </h2>

              <fieldset className="mt-6">
                <legend className={labelClass}>
                  Would you like to receive information
                  about future Tevuah Reserve events?
                </legend>

                <div className="mt-4 space-y-3">
                  {[
                    [
                      "yes",
                      "Yes, send me information about future events.",
                    ],
                    [
                      "no",
                      "No, contact me only about this enquiry.",
                    ],
                  ].map(([value, label]) => (
                    <label
                      key={value}
                      className="flex items-center gap-3 text-sm text-stone-700"
                    >
                      <input
                        type="radio"
                        name="futureEvents"
                        checked={
                          form.futureEvents === value
                        }
                        onChange={() =>
                          set("futureEvents", value)
                        }
                        className="accent-emerald-900"
                      />

                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </section>

            {/* 06 — PRIVACY AND SUBMISSION */}

           
        <section className="rounded-3xl border border-forest-900/10 bg-white p-6 sm:p-9">
        <h2 className="font-display text-2xl font-medium text-forest-950">
            06 — Privacy and submission
        </h2>

        <label className="mt-6 flex items-start gap-3 text-sm leading-7 text-stone-700">
            <input
            type="checkbox"
            required
            checked={form.privacyAccepted}
            onChange={(event) =>
                set(
                "privacyAccepted",
                event.target.checked,
                )
            }
            className="mt-1.5 accent-emerald-900"
            />

            <span>
            <strong className="text-forest-950">
                Privacy acknowledgement *
            </strong>

            <span className="block">
                I acknowledge that my information
                will be processed in accordance
                with the Tevuah Reserve Privacy
                Policy for the purpose of handling
                my event enquiry and communicating
                with me about the event.
            </span>
            </span>
        </label>

        {/* Privacy Policy and Submit Button */}

        <div className="mt-6 flex flex-wrap items-center gap-x-20 gap-y-5">
            <Link
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex min-h-12 items-center gap-2 text-sm font-semibold text-forest-950 underline underline-offset-4"
            >
            Read the Privacy Policy
            <ArrowUpRight className="size-4" />
            </Link>

            <button
            type="submit"
            disabled={submitting}
            className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-forest-950 px-7 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-wait disabled:opacity-60"
            >
            {submitting
                ? "Submitting enquiry…"
                : "Submit Registration Enquiry"}

            <ArrowUpRight className="size-4" />
            </button>
        </div>

        {error && (
            <p
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
            {error}
            </p>
        )}

        <p className="mt-5 text-xs leading-7 text-stone-500">
            By submitting this form, you are
            expressing interest in attending the
            selected event. Submission does not
            guarantee a place or confirm admission.
            Attendance remains subject to
            availability and confirmation by the
            Tevuah Reserve events team. Your
            enquiry will be reviewed, and you
            will be contacted via email.
        </p>
        </section>

          </form>
        </div>
      </Container>

      {/* SUCCESS MODAL */}

      
{/* ==========================================
    SUCCESS MODAL
========================================== */}

{success && (
  <div
    className="fixed inset-0 z-200 overflow-y-auto bg-forest-950/75 px-4 py-6 backdrop-blur-sm sm:py-10"
    role="presentation"
    onClick={() => setSuccess(false)}
  >
    <div className="flex min-h-full items-center justify-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-title"
        aria-describedby="success-description"
        onClick={(event) => event.stopPropagation()}
        className="relative my-auto w-full max-w-2xl rounded-3xl bg-white p-7 shadow-2xl sm:p-10"
      >
        {/* CLOSE ICON */}

        <button
          type="button"
          onClick={() => setSuccess(false)}
          aria-label="Close confirmation"
          className="focus-ring absolute right-5 top-5 rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-forest-950"
        >
          <X className="size-5" />
        </button>

        {/* SUCCESS INDICATOR */}

        <div className="flex size-14 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="size-8 text-emerald-700" />
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">
          Enquiry sent successfully
        </p>

        <h2
          id="success-title"
          className="font-display mt-3 text-3xl font-medium text-forest-950 sm:text-4xl"
        >
          What happens next?
        </h2>

        <p
          id="success-description"
          className="mt-4 text-sm leading-7 text-stone-600"
        >
          Thank you for your interest in a Tevuah
          Reserve event. Your registration enquiry
          has been submitted to our events team.
          Here is what you can expect next.
        </p>

        {/* NEXT STEPS */}

        <div className="mt-8 space-y-5 border-t border-forest-900/10 pt-7">
          {nextSteps.map((step, index) => (
            <div
              key={step.title}
              className="flex items-start gap-4"
            >
              <span className="font-display shrink-0 text-2xl text-gold-600">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div>
                <h3 className="text-sm font-semibold text-forest-950">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-7 text-stone-600">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ACTION BUTTONS */}

        <div className="mt-9 flex flex-wrap items-center gap-4 border-t border-forest-900/10 pt-7">
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full border border-forest-900/15 bg-white px-7 text-sm font-semibold text-forest-950 transition hover:bg-ivory-100"
          >
            Close
          </button>

          <Link
            href="/events"
            className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-forest-950 px-7 text-sm font-semibold text-white transition hover:bg-forest-800"
          >
            Return to events
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  </div>
)}

    </main>
  );
}