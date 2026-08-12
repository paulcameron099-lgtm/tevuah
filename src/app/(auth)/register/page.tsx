import type { Metadata } from "next";

import { AuthShell } from "@/src/components/auth/auth-shell";
import { RegisterForm } from "@/src/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Investor Account",
  description:
    "Create your Tevuah Reserve investor account.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your investor account."
      description="Create an account to explore investment opportunities, manage your portfolio and continue through the Tevuah Reserve investor journey."
    >
      <RegisterForm />
    </AuthShell>
  );
}