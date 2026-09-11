import type { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_ACTIVATION_COOKIE,
  authActivationCookieOptions,
  createAuthActivationToken,
  type AuthActivationPurpose,
} from "@/src/lib/auth/auth-activation";
import { createClient } from "@/src/lib/supabase/server";

function isSupportedType(type: string | null): type is AuthActivationPurpose {
  return type === "invite" || type === "recovery";
}

function loginErrorRedirect(request: NextRequest, code: string) {
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = "/login";
  redirectTo.search = "";
  redirectTo.searchParams.set("error", code);
  const response = NextResponse.redirect(redirectTo);
  response.cookies.delete(AUTH_ACTIVATION_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");

  if (!tokenHash || !isSupportedType(type)) {
    return loginErrorRedirect(request, "invalid-activation-link");
  }

  const supabase = await createClient();

  // Never inherit an already-authenticated admin/investor identity.
  const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
  if (signOutError) {
    console.error("Pre-activation local sign-out error:", signOutError);
    return loginErrorRedirect(request, "activation-session-reset-failed");
  }

  const { data: verificationData, error: verificationError } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as EmailOtpType,
  });

  const verifiedUser = verificationData.user;
  if (verificationError || !verifiedUser) {
    console.error("Auth activation verification error:", verificationError);
    return loginErrorRedirect(request, "invitation-expired-or-invalid");
  }

  const { data: authenticatedData, error: authenticatedError } = await supabase.auth.getUser();
  if (
    authenticatedError ||
    !authenticatedData.user ||
    authenticatedData.user.id !== verifiedUser.id
  ) {
    console.error("Auth activation identity mismatch.", {
      verifiedUserId: verifiedUser.id,
      authenticatedUserId: authenticatedData.user?.id ?? null,
    });
    await supabase.auth.signOut({ scope: "local" });
    return loginErrorRedirect(request, "activation-identity-mismatch");
  }

  const activationToken = createAuthActivationToken(verifiedUser.id, type);
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = "/reset-password";
  redirectTo.search = "";

  const response = NextResponse.redirect(redirectTo);
  response.cookies.set(AUTH_ACTIVATION_COOKIE, activationToken, authActivationCookieOptions);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
