import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/src/components/auth/auth-shell";
import { ResetPasswordForm } from "@/src/components/auth/reset-password-form";
import { createClient } from "@/src/lib/supabase/server";

export const metadata: Metadata = {
  title: "Choose New Password",
  description:
    "Choose a new password for your Tevuah Reserve investor account.",
};

export default async function ResetPasswordPage() {
  const supabase = await createClient();

  const { data: claimsData } =
    await supabase.auth.getClaims();

  if (!claimsData?.claims?.sub) {
    redirect("/forgot-password");
  }

  return (
    <AuthShell
      title="Choose a new password."
      description="Create a new password for your Tevuah Reserve investor account."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}