import {
  redirect,
} from "next/navigation";

import {
  RetirementPlaidOAuthResume,
} from "@/src/components/retirement/retirement-plaid-oauth-resume";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

export default async function RetirementPlaidOAuthPage() {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect(
      "/login",
    );
  }

  if (
    user.role !==
    "investor"
  ) {
    redirect(
      "/dashboard",
    );
  }

  return (
    <RetirementPlaidOAuthResume />
  );
}