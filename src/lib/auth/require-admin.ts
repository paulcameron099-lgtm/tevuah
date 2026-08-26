import { redirect } from "next/navigation";

import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

export async function requireAdmin() {
  /*
   * 1. Use the normal SSR client to determine
   * who is currently signed in.
   */
  const supabase =
    await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } =
    await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;

  /*
   * No valid authenticated session.
   */
  if (
    claimsError ||
    !userId
  ) {
    redirect("/login");
  }

  /*
   * 2. Use the server-only admin client
   * to read the authenticated user's
   * profile.
   *
   * This avoids profiles RLS preventing
   * the admin-role lookup.
   */
  const admin =
    createAdminClient();

  const {
    data: profile,
    error: profileError,
  } = await admin
    .from("profiles")
    .select(
      `
      id,
      first_name,
      last_name,
      role,
      avatar_url
      `,
    )
    .eq(
      "id",
      userId,
    )
    .maybeSingle();

  if (
    profileError ||
    !profile
  ) {
    console.error(
      "Admin profile lookup error:",
      profileError,
    );

    redirect("/dashboard");
  }

  /*
   * 3. Only admins and super-admins
   * can enter the admin area.
   */
  if (
    profile.role !==
      "admin" &&
    profile.role !==
      "super_admin"
  ) {
    console.error(
      "Admin access denied. Current role:",
      profile.role,
    );

    redirect("/dashboard");
  }

  /*
   * 4. Authorized.
   */
  return {
    userId,

    profile,
  };
}