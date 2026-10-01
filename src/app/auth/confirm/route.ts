import type {
  EmailOtpType,
} from "@supabase/supabase-js";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  AUTH_ACTIVATION_COOKIE,
  authActivationCookieOptions,
  createAuthActivationToken,
  type AuthActivationPurpose,
} from "@/src/lib/auth/auth-activation";

import {
  createClient,
} from "@/src/lib/supabase/server";

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
  const redirectTo =
    new URL(
      "/login",
      getSiteUrl(),
    );

  redirectTo.searchParams.set(
    "error",
    code,
  );

  const response =
    NextResponse.redirect(
      redirectTo,
    );

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
  const rawTokenHash =
    request.nextUrl.searchParams.get(
      "token_hash",
    );

  const rawType =
    request.nextUrl.searchParams.get(
      "type",
    );

  /*
   * Trim accidental whitespace.
   *
   * Do NOT alter the token itself beyond
   * surrounding whitespace.
   */
  const tokenHash =
    rawTokenHash?.trim() ??
    null;

  const type =
    rawType?.trim() ??
    null;

  console.log(
    "Auth activation request:",
    {
      hasTokenHash:
        Boolean(tokenHash),

      tokenLength:
        tokenHash?.length ??
        0,

      type,

      host:
        request.headers.get(
          "host",
        ),

      forwardedHost:
        request.headers.get(
          "x-forwarded-host",
        ),

      forwardedProto:
        request.headers.get(
          "x-forwarded-proto",
        ),
    },
  );

  if (
    !tokenHash ||
    !isSupportedType(type)
  ) {
    console.error(
      "Invalid auth activation link.",
      {
        hasTokenHash:
          Boolean(tokenHash),

        type,
      },
    );

    return loginErrorRedirect(
      "invalid-activation-link",
    );
  }

  const supabase =
    await createClient();

  /*
   * Prevent an existing admin/investor
   * browser session from contaminating
   * this activation flow.
   */
  const {
    error: signOutError,
  } =
    await supabase.auth.signOut({
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

  /*
   * Exchange the Supabase email TokenHash
   * for an authenticated Supabase session.
   */
  const {
    data:
      verificationData,
    error:
      verificationError,
  } =
    await supabase.auth.verifyOtp({
      token_hash:
        tokenHash,

      type:
        type as EmailOtpType,
    });

  if (
    verificationError
  ) {
    console.error(
      "Auth activation verification error:",
      {
        purpose:
          type,

        message:
          verificationError.message,

        status:
          verificationError.status,

        code:
          verificationError.code,
      },
    );

    return loginErrorRedirect(
      type === "recovery"
        ? "recovery-link-invalid-or-expired"
        : "invitation-expired-or-invalid",
    );
  }

  const verifiedUser =
    verificationData.user;

  const verifiedSession =
    verificationData.session;

  if (
    !verifiedUser ||
    !verifiedSession
  ) {
    console.error(
      "Auth activation returned no user/session.",
      {
        purpose:
          type,

        hasUser:
          Boolean(
            verifiedUser,
          ),

        hasSession:
          Boolean(
            verifiedSession,
          ),
      },
    );

    return loginErrorRedirect(
      "activation-session-missing",
    );
  }

  /*
   * Confirm that the cookie-backed Supabase
   * client now resolves to the same user.
   */
  const {
    data:
      authenticatedData,
    error:
      authenticatedError,
  } =
    await supabase.auth.getUser();

  if (
    authenticatedError ||
    !authenticatedData.user
  ) {
    console.error(
      "Authenticated activation session could not be read.",
      {
        purpose:
          type,

        error:
          authenticatedError,
      },
    );

    await supabase.auth.signOut({
      scope: "local",
    });

    return loginErrorRedirect(
      "activation-session-missing",
    );
  }

  if (
    authenticatedData.user.id !==
    verifiedUser.id
  ) {
    console.error(
      "Auth activation identity mismatch.",
      {
        purpose:
          type,

        verifiedUserId:
          verifiedUser.id,

        authenticatedUserId:
          authenticatedData.user.id,
      },
    );

    await supabase.auth.signOut({
      scope: "local",
    });

    return loginErrorRedirect(
      "activation-identity-mismatch",
    );
  }

  /*
   * Create our own short-lived authorization
   * proving that this exact user entered through
   * a verified invite/recovery link.
   */
  const activationToken =
    createAuthActivationToken(
      verifiedUser.id,
      type,
    );

  const redirectTo =
    new URL(
      "/reset-password",
      getSiteUrl(),
    );

  const response =
    NextResponse.redirect(
      redirectTo,
    );

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