import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { createClient } from "@/src/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const next =
    url.searchParams.get("next") ??
    "/dashboard";

  if (!code) {
    const errorUrl = request.nextUrl.clone();

    errorUrl.pathname = "/login";
    errorUrl.search = "";
    errorUrl.searchParams.set(
      "error",
      "missing_auth_code",
    );

    return NextResponse.redirect(errorUrl);
  }

  const supabase = await createClient();

  const { error } =
    await supabase.auth.exchangeCodeForSession(
      code,
    );

  if (error) {
    console.error(
      "Supabase auth callback error:",
      error,
    );

    const errorUrl = request.nextUrl.clone();

    errorUrl.pathname = "/login";
    errorUrl.search = "";
    errorUrl.searchParams.set(
      "error",
      "auth_callback_failed",
    );

    return NextResponse.redirect(errorUrl);
  }

  const redirectUrl =
    request.nextUrl.clone();

  redirectUrl.pathname =
    next.startsWith("/") &&
    !next.startsWith("//")
      ? next
      : "/dashboard";

  redirectUrl.search = "";

  return NextResponse.redirect(
    redirectUrl,
  );
}