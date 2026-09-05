import {
  ArrowRight,
  CheckCircle2,
  FileText,
  FolderOpen,
  KeyRound,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import Link from "next/link";
import {
  redirect,
} from "next/navigation";

import {
  AccountSettingsForm,
} from "@/src/components/account/account-settings-form";

import {
  checkAccountAccess,
} from "@/src/lib/auth/account-status";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

export default async function InvestorAccountPage() {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (
    user.role !==
    "investor"
  ) {
    redirect("/dashboard");
  }

  const accountAccess =
    await checkAccountAccess(
      user.id,
    );

  const admin =
    createAdminClient();

  const [
    profileResult,
    kycResult,
    onboardingResult,
    preferencesResult,
    authResult,
  ] =
    await Promise.all([
      admin
        .from("profiles")
        .select(
          `
          id,
          first_name,
          last_name,
          phone,
          profession,
          country,
          city,
          state,
          postal_code,
          onboarding_status,
          account_status,
          created_at
          `,
        )
        .eq(
          "id",
          user.id,
        )
        .maybeSingle(),

      admin
        .from("investor_kyc")
        .select(
          `
          legal_first_name,
          legal_middle_name,
          legal_last_name,
          nationality,
          status,
          verification_status
          `,
        )
        .eq(
          "user_id",
          user.id,
        )
        .maybeSingle(),

      admin
        .from(
          "investor_onboarding",
        )
        .select(
          `
          profile_completed,
          identity_completed,
          address_completed,
          eligibility_completed,
          suitability_completed,
          tax_completed,
          submitted_at
          `,
        )
        .eq(
          "user_id",
          user.id,
        )
        .maybeSingle(),

      admin
        .from(
          "investor_notification_preferences",
        )
        .select(
          `
          investment_updates,
          payment_updates,
          distribution_updates,
          statement_updates,
          compliance_updates,
          marketing_updates
          `,
        )
        .eq(
          "investor_id",
          user.id,
        )
        .maybeSingle(),

      admin.auth.admin.getUserById(
        user.id,
      ),
    ]);

  if (
    profileResult.error ||
    !profileResult.data
  ) {
    console.error(
      "Investor account profile load error:",
      profileResult.error,
    );

    throw new Error(
      "Unable to load investor account.",
    );
  }

  if (
    kycResult.error
  ) {
    console.error(
      "Investor account KYC load error:",
      kycResult.error,
    );
  }

  if (
    onboardingResult.error
  ) {
    console.error(
      "Investor account onboarding load error:",
      onboardingResult.error,
    );
  }

  if (
    preferencesResult.error
  ) {
    console.error(
      "Investor account preferences load error:",
      preferencesResult.error,
    );
  }

  const profile =
    profileResult.data;

  const kyc =
    kycResult.data;

  const onboarding =
    onboardingResult.data;

  const preferences =
    preferencesResult.data;

  const email =
    authResult.data.user
      ?.email ??
    "Not available";

  const investorName =
    [
      profile.first_name,
      profile.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "Investor";

  const legalName =
    [
      kyc?.legal_first_name,
      kyc?.legal_middle_name,
      kyc?.legal_last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "Not available";

  const completedSections =
    onboarding
      ? [
          onboarding.profile_completed,
          onboarding.identity_completed,
          onboarding.address_completed,
          onboarding.eligibility_completed,
          onboarding.suitability_completed,
          onboarding.tax_completed,
        ].filter(Boolean)
          .length
      : 0;

  const verificationStatus =
    kyc?.verification_status ??
    kyc?.status ??
    profile.onboarding_status ??
    "not_started";

  const accountStatus =
    profile.account_status ??
    (
      accountAccess.allowed
        ? "active"
        : "restricted"
    );

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] bg-forest-950 p-7 text-white sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
          Investor account
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
          Account & Settings
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
          Manage your profile, communication preferences, security access and investor reporting links.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <StatusPill
            icon={
              CheckCircle2
            }
            label={`Account: ${humanize(
              accountStatus,
            )}`}
          />

          <StatusPill
            icon={
              ShieldCheck
            }
            label={`Verification: ${humanize(
              verificationStatus,
            )}`}
          />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={
            UserRound
          }
          label="Investor"
          value={
            investorName
          }
        />

        <SummaryCard
          icon={
            Mail
          }
          label="Login email"
          value={
            email
          }
        />

        <SummaryCard
          icon={
            ShieldCheck
          }
          label="Verification"
          value={humanize(
            verificationStatus,
          )}
        />

        <SummaryCard
          icon={
            CheckCircle2
          }
          label="Onboarding"
          value={`${completedSections}/6 complete`}
        />
      </div>

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Verification status
        </p>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h2 className="font-display text-3xl font-semibold text-forest-950">
              Compliance identity
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-500">
              Legal identity and verification records are read-only here. Any required changes must go through the investor verification workflow.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <MiniData
                label="Legal name"
                value={
                  legalName
                }
              />

              <MiniData
                label="Nationality"
                value={
                  kyc?.nationality ??
                  "Not available"
                }
              />

              <MiniData
                label="Status"
                value={humanize(
                  verificationStatus,
                )}
              />
            </div>
          </div>

          <Link
            href="/dashboard/onboarding/review"
            className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-forest-900/10 bg-white px-5 text-sm font-semibold text-forest-950 transition hover:bg-ivory-50"
          >
            View verification

            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <AccountSettingsForm
        profile={{
          firstName:
            profile.first_name ??
            "",
          lastName:
            profile.last_name ??
            "",
          phone:
            profile.phone ??
            "",
          profession:
            profile.profession ??
            "",
          country:
            profile.country ??
            "",
          city:
            profile.city ??
            "",
          state:
            profile.state ??
            "",
          postalCode:
            profile.postal_code ??
            "",
        }}
        preferences={{
          investmentUpdates:
            preferences?.investment_updates ??
            true,
          paymentUpdates:
            preferences?.payment_updates ??
            true,
          distributionUpdates:
            preferences?.distribution_updates ??
            true,
          statementUpdates:
            preferences?.statement_updates ??
            true,
          complianceUpdates:
            preferences?.compliance_updates ??
            true,
          marketingUpdates:
            preferences?.marketing_updates ??
            false,
        }}
      />

      <div className="grid gap-8 xl:grid-cols-2">
        <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
          <KeyRound className="size-6 text-gold-600" />

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
            Security
          </p>

          <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
            Password & sign-in
          </h2>

          <p className="mt-3 text-sm leading-7 text-stone-500">
            Your login email is managed by Supabase Auth. Use the secure password-reset flow to change your password.
          </p>

          <div className="mt-6 rounded-2xl bg-ivory-50 p-5">
            <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-stone-400">
              Login email
            </p>

            <p className="mt-2 break-all text-sm font-semibold text-forest-950">
              {email}
            </p>
          </div>

          <Link
            href="/forgot-password"
            className="focus-ring mt-6 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800"
          >
            Change password

            <ArrowRight className="size-4" />
          </Link>
        </section>

        <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
          <FolderOpen className="size-6 text-gold-600" />

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
            Records & reporting
          </p>

          <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
            Investor documents
          </h2>

          <p className="mt-3 text-sm leading-7 text-stone-500">
            Access statements, subscription agreements, funding confirmations and distribution notices from your secure reporting library.
          </p>

          <div className="mt-6 space-y-3">
            <QuickLink
              icon={
                FolderOpen
              }
              href="/dashboard/documents"
              title="Documents Center"
              description="All investor records in one library."
            />

            <QuickLink
              icon={
                FileText
              }
              href="/dashboard/statements"
              title="Statements"
              description="Published portfolio statements and PDFs."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function StatusPill({
  icon:
    Icon,
  label,
}: {
  icon:
    typeof CheckCircle2;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white">
      <Icon className="size-3.5 text-gold-400" />

      {label}
    </span>
  );
}

function SummaryCard({
  icon:
    Icon,
  label,
  value,
}: {
  icon:
    typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-forest-900/10 bg-white p-5">
      <div className="flex size-10 items-center justify-center rounded-full bg-ivory-50">
        <Icon className="size-4 text-gold-600" />
      </div>

      <p className="mt-5 text-[0.62rem] font-semibold uppercase tracking-widest text-stone-400">
        {label}
      </p>

      <p className="mt-2 wrap-break-word text-sm font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

function MiniData({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-stone-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

function QuickLink({
  icon:
    Icon,
  href,
  title,
  description,
}: {
  icon:
    typeof FolderOpen;
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="focus-ring flex cursor-pointer items-center gap-4 rounded-2xl border border-forest-900/10 p-4 transition hover:bg-ivory-50"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ivory-50">
        <Icon className="size-4 text-gold-600" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-forest-950">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-stone-500">
          {description}
        </p>
      </div>

      <ArrowRight className="size-4 shrink-0 text-stone-400" />
    </Link>
  );
}

function humanize(
  value:
    string |
    null |
    undefined,
) {
  if (!value) {
    return "Not available";
  }

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