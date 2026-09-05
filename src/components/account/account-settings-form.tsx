"use client";

import {
  CheckCircle2,
  Loader2,
  Save,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

type ProfileValues = {
  firstName: string;
  lastName: string;
  phone: string;
  profession: string;
  country: string;
  city: string;
  state: string;
  postalCode: string;
};

type Preferences = {
  investmentUpdates: boolean;
  paymentUpdates: boolean;
  distributionUpdates: boolean;
  statementUpdates: boolean;
  complianceUpdates: boolean;
  marketingUpdates: boolean;
};

type Props = {
  profile: ProfileValues;
  preferences: Preferences;
};

export function AccountSettingsForm({
  profile,
  preferences,
}: Props) {
  const router =
    useRouter();

  const [
    form,
    setForm,
  ] =
    useState(
      profile,
    );

  const [
    prefs,
    setPrefs,
  ] =
    useState(
      preferences,
    );

  const [
    profileLoading,
    setProfileLoading,
  ] =
    useState(false);

  const [
    preferencesLoading,
    setPreferencesLoading,
  ] =
    useState(false);

  const [
    profileMessage,
    setProfileMessage,
  ] =
    useState<
      string | null
    >(null);

  const [
    preferencesMessage,
    setPreferencesMessage,
  ] =
    useState<
      string | null
    >(null);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  function updateField(
    field:
      keyof ProfileValues,
    value: string,
  ) {
    setForm(
      (
        current,
      ) => ({
        ...current,
        [field]:
          value,
      }),
    );

    setProfileMessage(
      null,
    );
    setError(null);
  }

  async function saveProfile() {
    setError(null);
    setProfileMessage(
      null,
    );
    setProfileLoading(
      true,
    );

    try {
      const response =
        await fetch(
          "/api/account/profile",
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                form,
              ),
          },
        );

      const result =
        (await response.json()) as {
          error?: string;
        };

      if (!response.ok) {
        setError(
          result.error ??
            "Unable to save profile.",
        );

        return;
      }

      setProfileMessage(
        "Profile updated successfully.",
      );

      router.refresh();
    } catch {
      setError(
        "Unable to save profile.",
      );
    } finally {
      setProfileLoading(
        false,
      );
    }
  }

  async function savePreferences() {
    setError(null);
    setPreferencesMessage(
      null,
    );
    setPreferencesLoading(
      true,
    );

    try {
      const response =
        await fetch(
          "/api/account/preferences",
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                prefs,
              ),
          },
        );

      const result =
        (await response.json()) as {
          error?: string;
        };

      if (!response.ok) {
        setError(
          result.error ??
            "Unable to save notification preferences.",
        );

        return;
      }

      setPreferencesMessage(
        "Notification preferences updated.",
      );

      router.refresh();
    } catch {
      setError(
        "Unable to save notification preferences.",
      );
    } finally {
      setPreferencesLoading(
        false,
      );
    }
  }

  return (
    <div className="space-y-8">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Profile & contact
        </p>

        <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
          Personal information
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-500">
          Update your non-sensitive profile and contact information. Legal identity,
          tax identity and verification records are managed through the compliance
          process and cannot be changed here.
        </p>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <Field
            label="First name"
            value={form.firstName}
            onChange={(value) =>
              updateField(
                "firstName",
                value,
              )
            }
          />

          <Field
            label="Last name"
            value={form.lastName}
            onChange={(value) =>
              updateField(
                "lastName",
                value,
              )
            }
          />

          <Field
            label="Phone"
            value={form.phone}
            onChange={(value) =>
              updateField(
                "phone",
                value,
              )
            }
          />

          <Field
            label="Profession"
            value={form.profession}
            onChange={(value) =>
              updateField(
                "profession",
                value,
              )
            }
          />

          <Field
            label="Country"
            value={form.country}
            onChange={(value) =>
              updateField(
                "country",
                value,
              )
            }
          />

          <Field
            label="City"
            value={form.city}
            onChange={(value) =>
              updateField(
                "city",
                value,
              )
            }
          />

          <Field
            label="State / region"
            value={form.state}
            onChange={(value) =>
              updateField(
                "state",
                value,
              )
            }
          />

          <Field
            label="Postal code"
            value={form.postalCode}
            onChange={(value) =>
              updateField(
                "postalCode",
                value,
              )
            }
          />
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <button
            type="button"
            disabled={
              profileLoading
            }
            onClick={
              saveProfile
            }
            className="focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {profileLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}

            Save profile
          </button>

          {profileMessage ? (
            <p className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="size-4" />
              {profileMessage}
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Communication
        </p>

        <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
          Notification preferences
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-500">
          Choose the types of account communications you want to receive. Critical
          security communications may still be sent when required.
        </p>

        <div className="mt-7 divide-y divide-forest-900/10 rounded-2xl border border-forest-900/10">
          <PreferenceRow
            title="Investment updates"
            description="Subscription decisions and investment lifecycle updates."
            checked={prefs.investmentUpdates}
            onChange={(checked) =>
              setPrefs((current) => ({
                ...current,
                investmentUpdates:
                  checked,
              }))
            }
          />

          <PreferenceRow
            title="Payment updates"
            description="Funding instructions, payment verification and funding status."
            checked={prefs.paymentUpdates}
            onChange={(checked) =>
              setPrefs((current) => ({
                ...current,
                paymentUpdates:
                  checked,
              }))
            }
          />

          <PreferenceRow
            title="Distribution updates"
            description="Distribution processing and paid distribution notices."
            checked={prefs.distributionUpdates}
            onChange={(checked) =>
              setPrefs((current) => ({
                ...current,
                distributionUpdates:
                  checked,
              }))
            }
          />

          <PreferenceRow
            title="Statement updates"
            description="New, restored or withdrawn investor statements."
            checked={prefs.statementUpdates}
            onChange={(checked) =>
              setPrefs((current) => ({
                ...current,
                statementUpdates:
                  checked,
              }))
            }
          />

          <PreferenceRow
            title="Compliance updates"
            description="Verification decisions and requests for additional information."
            checked={prefs.complianceUpdates}
            onChange={(checked) =>
              setPrefs((current) => ({
                ...current,
                complianceUpdates:
                  checked,
              }))
            }
          />

          <PreferenceRow
            title="Platform & marketing updates"
            description="Optional Tevuah Reserve product and investment opportunity announcements."
            checked={prefs.marketingUpdates}
            onChange={(checked) =>
              setPrefs((current) => ({
                ...current,
                marketingUpdates:
                  checked,
              }))
            }
          />
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <button
            type="button"
            disabled={
              preferencesLoading
            }
            onClick={
              savePreferences
            }
            className="focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {preferencesLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}

            Save preferences
          </button>

          {preferencesMessage ? (
            <p className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="size-4" />
              {preferencesMessage}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange:
    (
      value: string,
    ) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
        {label}
      </span>

      <input
        type="text"
        value={value}
        onChange={(
          event,
        ) =>
          onChange(
            event.target
              .value,
          )
        }
        className="focus-ring min-h-12 w-full rounded-xl border border-forest-900/10 bg-ivory-50 px-4 text-sm text-forest-950 outline-none"
      />
    </label>
  );
}

function PreferenceRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange:
    (
      value: boolean,
    ) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-5 p-5">
      <span>
        <span className="block text-sm font-semibold text-forest-950">
          {title}
        </span>

        <span className="mt-1 block text-xs leading-5 text-stone-500">
          {description}
        </span>
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(
          event,
        ) =>
          onChange(
            event.target
              .checked,
          )
        }
        className="size-5 cursor-pointer accent-forest-950"
      />
    </label>
  );
}