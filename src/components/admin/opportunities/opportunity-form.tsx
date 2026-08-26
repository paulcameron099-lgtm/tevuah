"use client";

import {
  Loader2,
  Save,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

type EstateOption = {
  id: string;
  name: string;
};

type OpportunityFormProps = {
  estates:
    EstateOption[];
};

export function OpportunityForm({
  estates,
}: OpportunityFormProps) {
  const router =
    useRouter();

  const [
    title,
    setTitle,
  ] =
    useState("");

  const [
    slug,
    setSlug,
  ] =
    useState("");

  const [
    shortDescription,
    setShortDescription,
  ] =
    useState("");

  const [
    fullDescription,
    setFullDescription,
  ] =
    useState("");

  const [
    assetCategory,
    setAssetCategory,
  ] =
    useState(
      "vineyard",
    );

  const [
    estateId,
    setEstateId,
  ] =
    useState("");

  const [
    location,
    setLocation,
  ] =
    useState("");

  const [
    fundingTarget,
    setFundingTarget,
  ] =
    useState("");

  const [
    minimumInvestment,
    setMinimumInvestment,
  ] =
    useState("");

  const [
    expectedDurationMonths,
    setExpectedDurationMonths,
  ] =
    useState("");

  const [
    targetReturnMin,
    setTargetReturnMin,
  ] =
    useState("");

  const [
    targetReturnMax,
    setTargetReturnMax,
  ] =
    useState("");

  const [
    targetReturnNote,
    setTargetReturnNote,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  function updateTitle(
    value: string,
  ) {
    setTitle(value);

    /*
     * Automatically generate a slug.
     */
    setSlug(
      value
        .toLowerCase()
        .trim()
        .replace(
          /[^a-z0-9]+/g,
          "-",
        )
        .replace(
          /^-+|-+$/g,
          "",
        ),
    );
  }

  async function submit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/admin/opportunities",
          {
            method:
              "POST",

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
          success?: boolean;

          error?: string;

          opportunity?: {
            id: string;
          };
        };

      if (!response.ok) {
        setError(
          result.error ??
            "Unable to create opportunity.",
        );

        return;
      }

      if (
        !result.opportunity
          ?.id
      ) {
        setError(
          "Opportunity was created but no opportunity ID was returned.",
        );

        return;
      }

      router.push(
        `/admin/opportunities/${result.opportunity.id}/edit`,
      );

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "Create opportunity request error:",
        requestError,
      );

      setError(
        "Unable to create investment opportunity.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-8"
    >
      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Opportunity identity
        </p>

        <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
          Core investment details
        </h2>

        <div className="mt-7 grid gap-6 sm:grid-cols-2">
          <Field
            label="Opportunity title"
            required
          >
            <input
              value={
                title
              }
              onChange={(
                event,
              ) =>
                updateTitle(
                  event.target
                    .value,
                )
              }
              required
              className={inputClass}
            />
          </Field>

          <Field
            label="URL slug"
            required
          >
            <input
              value={
                slug
              }
              onChange={(
                event,
              ) =>
                setSlug(
                  event.target
                    .value,
                )
              }
              required
              className={inputClass}
            />
          </Field>

          <Field
            label="Asset category"
            required
          >
            <select
              value={
                assetCategory
              }
              onChange={(
                event,
              ) =>
                setAssetCategory(
                  event.target
                    .value,
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
              value={
                estateId
              }
              onChange={(
                event,
              ) =>
                setEstateId(
                  event.target
                    .value,
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
              value={
                location
              }
              onChange={(
                event,
              ) =>
                setLocation(
                  event.target
                    .value,
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
                event.target
                  .value,
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
                event.target
                  .value,
              )
            }
            rows={8}
            className={textareaClass}
          />
        </Field>
      </section>

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Investment economics
        </p>

        <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
          Funding & return presentation
        </h2>

        <div className="mt-7 grid gap-6 sm:grid-cols-2">
          <Field
            label="Funding target (USD)"
            required
          >
            <input
              type="number"
              min="1"
              step="0.01"
              value={
                fundingTarget
              }
              onChange={(
                event,
              ) =>
                setFundingTarget(
                  event.target
                    .value,
                )
              }
              required
              className={inputClass}
            />
          </Field>

          <Field
            label="Minimum investment (USD)"
            required
          >
            <input
              type="number"
              min="1"
              step="0.01"
              value={
                minimumInvestment
              }
              onChange={(
                event,
              ) =>
                setMinimumInvestment(
                  event.target
                    .value,
                )
              }
              required
              className={inputClass}
            />
          </Field>

          <Field label="Expected duration (months)">
            <input
              type="number"
              min="1"
              value={
                expectedDurationMonths
              }
              onChange={(
                event,
              ) =>
                setExpectedDurationMonths(
                  event.target
                    .value,
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
                  event.target
                    .value,
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
                  event.target
                    .value,
                )
              }
              className={inputClass}
            />
          </Field>
        </div>

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
                event.target
                  .value,
              )
            }
            rows={4}
            placeholder="Describe how expected returns should be presented. Avoid presenting targets as guaranteed returns."
            className={textareaClass}
          />
        </Field>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={
            loading
          }
          className="focus-ring inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-7 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />

              Creating...
            </>
          ) : (
            <>
              <Save className="size-4" />

              Create draft opportunity
            </>
          )}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "focus-ring min-h-12 w-full rounded-xl border border-forest-900/10 bg-ivory-50 px-4 text-sm text-forest-950 outline-none";

const textareaClass =
  "focus-ring w-full rounded-xl border border-forest-900/10 bg-ivory-50 p-4 text-sm leading-7 text-forest-950 outline-none";

function Field({
  label,
  required = false,
  className = "",
  children,
}: {
  label: string;

  required?: boolean;

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

        {required ? (
          <span className="ml-1 text-red-600">
            *
          </span>
        ) : null}
      </span>

      {children}
    </label>
  );
}