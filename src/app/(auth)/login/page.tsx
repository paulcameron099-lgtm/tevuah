import type { Metadata } from "next";

import { AuthShell } from "@/src/components/auth/auth-shell";
import { LoginForm } from "@/src/components/auth/login-form";

export const metadata: Metadata = {
  title: "Investor Login",
  description:
    "Sign in to your Tevuah Reserve investor account.",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back."
      description="Sign in to access your Tevuah Reserve investor account, portfolio and investment activity."
    >
      <LoginForm />
    </AuthShell>
  );
}