import {
  type EmailOtpType,
} from "@supabase/supabase-js";

import {
  NextResponse,
  type NextRequest,
} from "next/server";

import { createClient } from "@/src/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } =
    new URL(request.url);

  const tokenHash =
    searchParams.get("token_hash");

  const type =
    searchParams.get("type") as
      | EmailOtpType
      | null;

  const next =
    searchParams.get("next") ??
    "/dashboard";

  if (tokenHash && type) {
    const supabase =
      await createClient();

    const { error } =
      await supabase.auth.verifyOtp({
        type,
        token_hash: tokenHash,
      });

    if (!error) {
      const redirectUrl =
        request.nextUrl.clone();

      redirectUrl.pathname = next;
      redirectUrl.search = "";

      return NextResponse.redirect(
        redirectUrl,
      );
    }
  }

  const redirectUrl =
    request.nextUrl.clone();

  redirectUrl.pathname = "/login";
  redirectUrl.search = "";

  redirectUrl.searchParams.set(
    "error",
    "email_confirmation_failed",
  );

  return NextResponse.redirect(
    redirectUrl,
  );
}