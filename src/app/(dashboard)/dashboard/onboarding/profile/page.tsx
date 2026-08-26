import { redirect } from "next/navigation";

import { ProfileForm } from "@/src/components/onboarding/profile-form";
import { createClient } from "@/src/lib/supabase/server";

export default async function OnboardingProfilePage() {
  const supabase =
    await createClient();

  const { data: claimsData } =
    await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;

  if (!userId) {
    redirect("/login");
  }

  const [
    profileResult,
    onboardingResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        `
        first_name,
        last_name,
        phone,
        date_of_birth,
        nationality,
        profession,
        country,
        city,
        state,
        postal_code
        `,
      )
      .eq(
        "id",
        userId,
      )
      .maybeSingle(),

    supabase
      .from(
        "investor_onboarding",
      )
      .select(
        `
        profile_completed
        `,
      )
      .eq(
        "user_id",
        userId,
      )
      .maybeSingle(),
  ]);

  const profile =
    profileResult.data;

  const onboarding =
    onboardingResult.data;

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Step 1
        </p>

        <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950 sm:text-4xl">
          Personal profile
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Confirm the personal details associated
          with your Tevuah Reserve investor account.
        </p>
      </div>

      <ProfileForm
        completed={
          onboarding?.profile_completed ??
          false
        }
        initialValues={{
          firstName:
            profile?.first_name ??
            null,

          lastName:
            profile?.last_name ??
            null,

          phone:
            profile?.phone ??
            null,

          dateOfBirth:
            profile?.date_of_birth ??
            null,

          nationality:
            profile?.nationality ??
            null,

          profession:
            profile?.profession ??
            null,

          country:
            profile?.country ??
            null,

          city:
            profile?.city ??
            null,

          state:
            profile?.state ??
            null,

          postalCode:
            profile?.postal_code ??
            null,
        }}
      />
    </div>
  );
}