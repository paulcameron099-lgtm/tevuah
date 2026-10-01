import type { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import {
  AUTH_ACTIVATION_COOKIE,
  authActivationCookieOptions,
  createAuthActivationToken,
  type AuthActivationPurpose,
} from "@/src/lib/auth/auth-activation";

import { createClient } from "@/src/lib/supabase/server";

function isSupportedType(
  type: string | null,
): type is AuthActivationPurpose {
  return (
    type === "invite" ||
    type === "recovery"
  );
}

function getSiteUrl() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(
      /\/$/,
      "",
    );

  if (!siteUrl) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL is not configured.",
    );
  }

  return siteUrl;
}

function loginErrorRedirect(
  code: string,
) {
  const redirectTo = new URL(
    "/login",
    getSiteUrl(),
  );

  redirectTo.searchParams.set(
    "error",
    code,
  );

  const response =
    NextResponse.redirect(redirectTo);

  response.cookies.delete(
    AUTH_ACTIVATION_COOKIE,
  );

  response.headers.set(
    "Cache-Control",
    "no-store",
  );

  return response;
}

export async function GET(
  request: NextRequest,
) {
  const tokenHash =
    request.nextUrl.searchParams.get(
      "token_hash",
    );

  const type =
    request.nextUrl.searchParams.get(
      "type",
    );

  if (
    !tokenHash ||
    !isSupportedType(type)
  ) {
    return loginErrorRedirect(
      "invalid-activation-link",
    );
  }

  const supabase =
    await createClient();

  /*
   * Never inherit an already-authenticated
   * admin/investor identity.
   */
  const {
    error: signOutError,
  } = await supabase.auth.signOut({
    scope: "local",
  });

  if (signOutError) {
    console.error(
      "Pre-activation local sign-out error:",
      signOutError,
    );

    return loginErrorRedirect(
      "activation-session-reset-failed",
    );
  }

  const {
    data: verificationData,
    error: verificationError,
  } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as EmailOtpType,
  });

  const verifiedUser =
    verificationData.user;

  if (
    verificationError ||
    !verifiedUser
  ) {
    console.error(
      "Auth activation verification error:",
      verificationError,
    );

    return loginErrorRedirect(
      "invitation-expired-or-invalid",
    );
  }

  const {
    data: authenticatedData,
    error: authenticatedError,
  } = await supabase.auth.getUser();

  if (
    authenticatedError ||
    !authenticatedData.user ||
    authenticatedData.user.id !==
      verifiedUser.id
  ) {
    console.error(
      "Auth activation identity mismatch.",
      {
        verifiedUserId:
          verifiedUser.id,
        authenticatedUserId:
          authenticatedData.user?.id ??
          null,
      },
    );

    await supabase.auth.signOut({
      scope: "local",
    });

    return loginErrorRedirect(
      "activation-identity-mismatch",
    );
  }

  const activationToken =
    createAuthActivationToken(
      verifiedUser.id,
      type,
    );

  /*
   * IMPORTANT:
   * Do not use request.nextUrl.clone()
   * here. Behind the production reverse
   * proxy it can expose localhost:3000.
   *
   * Always redirect using the canonical
   * public application URL.
   */
  const redirectTo = new URL(
    "/reset-password",
    getSiteUrl(),
  );

  const response =
    NextResponse.redirect(redirectTo);

  response.cookies.set(
    AUTH_ACTIVATION_COOKIE,
    activationToken,
    authActivationCookieOptions,
  );

  response.headers.set(
    "Cache-Control",
    "no-store",
  );

  return response;
}