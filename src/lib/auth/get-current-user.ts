import { createClient } from "@/src/lib/supabase/server";

export async function getCurrentUser() {
  const supabase =
    await createClient();

  const { data: claimsData } =
    await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;

  if (!userId) {
    return null;
  }

  const { data: profile } =
    await supabase
      .from("profiles")
      .select(
        `
        id,
        first_name,
        last_name,
        phone,
        country,
        city,
        state,
        postal_code,
        role,
        avatar_url,
        account_status,
        onboarding_status
        `,
      )
      .eq("id", userId)
      .single();

  if (!profile) {
    return null;
  }

  return profile;
}