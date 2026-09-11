import type {
  Metadata,
} from "next";

import {
  cookies,
} from "next/headers";

import {
  redirect,
} from "next/navigation";

import {
  AuthShell,
} from "@/src/components/auth/auth-shell";

import {
  ResetPasswordForm,
} from "@/src/components/auth/reset-password-form";

import {
  AUTH_ACTIVATION_COOKIE,
  verifyAuthActivationToken,
} from "@/src/lib/auth/auth-activation";

import {
  createClient,
} from "@/src/lib/supabase/server";

export const metadata: Metadata = {
  title:
    "Password Setup",
  description:
    "Create or reset your Tevuah Reserve account password.",
};

export const dynamic =
  "force-dynamic";

export default async function ResetPasswordPage() {
  const cookieStore =
    await cookies();

  const activation =
    verifyAuthActivationToken(
      cookieStore
        .get(
          AUTH_ACTIVATION_COOKIE,
        )
        ?.value,
    );

  /*
   * SECURITY:
   *
   * Do not show the password form merely because
   * somebody is authenticated.
   *
   * A valid invite/recovery activation token is required.
   */
  if (!activation) {
    redirect(
      "/forgot-password?error=activation-required",
    );
  }

  const supabase =
    await createClient();

  const {
    data:
      userData,
    error:
      userError,
  } =
    await supabase.auth.getUser();

  /*
   * The authenticated Supabase user MUST be the exact
   * same user whose invite/recovery token created the
   * activation authorization.
   */
  if (
    userError ||
    !userData.user ||
    userData.user.id !==
      activation.userId
  ) {
    redirect(
      "/login?error=activation-identity-mismatch",
    );
  }

  const isInvite =
    activation.purpose ===
    "invite";

  return (
    <AuthShell
      title={
        isInvite
          ? "Create your password."
          : "Reset your password."
      }
      description={
        isInvite
          ? "Create a secure password to activate your Tevuah Reserve investor account."
          : "Choose a new password for your Tevuah Reserve investor account."
      }
    >
      <ResetPasswordForm
        mode={
          isInvite
            ? "create"
            : "reset"
        }
      />
    </AuthShell>
  );
}