import {
  createServerClient,
} from "@supabase/ssr";

import {
  NextResponse,
  type NextRequest,
} from "next/server";

export async function updateSession(
  request: NextRequest,
) {
  let response =
    NextResponse.next({
      request,
    });

  const supabase =
    createServerClient(
      process.env
        .NEXT_PUBLIC_SUPABASE_URL!,
      process.env
        .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },

          setAll(cookiesToSet) {
            cookiesToSet.forEach(
              ({ name, value }) =>
                request.cookies.set(
                  name,
                  value,
                ),
            );

            response =
              NextResponse.next({
                request,
              });

            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }) =>
                response.cookies.set(
                  name,
                  value,
                  options,
                ),
            );
          },
        },
      },
    );

  const { data: claimsData } =
    await supabase.auth.getClaims();

  const claims =
    claimsData?.claims ?? null;

  const pathname =
    request.nextUrl.pathname;

  const isProtectedRoute =
    pathname.startsWith(
      "/dashboard",
    );

  const isPublicAuthRoute =
  pathname === "/login" ||
  pathname === "/register" ||
  pathname === "/forgot-password";

    const isResetPasswordRoute =
    pathname === "/reset-password";

  if (
    isProtectedRoute &&
    !claims
  ) {
    const url =
      request.nextUrl.clone();

    url.pathname = "/login";
    url.searchParams.set(
      "next",
      pathname,
    );

    return NextResponse.redirect(url);
  }

  if (
  isPublicAuthRoute &&
  claims
) {
  const url =
    request.nextUrl.clone();

  url.pathname = "/dashboard";
  url.search = "";

  return NextResponse.redirect(url);
}

/*
 * Do not automatically redirect an authenticated
 * recovery session away from /reset-password.
 */
if (isResetPasswordRoute) {
  return response;
}

  return response;
}