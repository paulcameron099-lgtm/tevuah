import type { Metadata } from "next";

import { AuthShell } from "@/src/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/src/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description:
    "Reset the password for your Tevuah Reserve investor account.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password."
      description="Enter the email associated with your Tevuah Reserve account and we’ll send you instructions to choose a new password."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}