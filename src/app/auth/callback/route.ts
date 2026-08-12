import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { createClient } from "@/src/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");

  const next =
    requestUrl.searchParams.get("next") ??
    "/dashboard";

  if (code) {
    const supabase = await createClient();

    const { error } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const redirectUrl = request.nextUrl.clone();

      redirectUrl.pathname = next;
      redirectUrl.search = "";

      return NextResponse.redirect(redirectUrl);
    }
  }

  const errorUrl = request.nextUrl.clone();

  errorUrl.pathname = "/login";
  errorUrl.search = "";

  errorUrl.searchParams.set(
    "error",
    "verification_failed",
  );

  return NextResponse.redirect(errorUrl);
}