import {
  revalidatePath,
} from "next/cache";

import {
  NextResponse,
  type NextRequest,
} from "next/server";

import {
  createClient,
} from "@/src/lib/supabase/server";

export async function POST(
  request: NextRequest,
) {
  const supabase =
    await createClient();

  const {
    data: claimsData,
  } =
    await supabase.auth.getClaims();

  if (claimsData?.claims) {
    const {
      error: signOutError,
    } =
      await supabase.auth.signOut();

    if (signOutError) {
      console.error(
        "Sign out error:",
        signOutError,
      );
    }
  }

  revalidatePath(
    "/",
    "layout",
  );

  const siteUrl =
    process.env
      .NEXT_PUBLIC_SITE_URL
      ?.replace(
        /\/$/,
        "",
      );

  if (!siteUrl) {
    console.error(
      "NEXT_PUBLIC_SITE_URL is not configured.",
    );

    return NextResponse.json(
      {
        error:
          "Unable to complete sign out.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  }

  return NextResponse.redirect(
    `${siteUrl}/login`,
    {
      status: 302,
      headers: {
        "Cache-Control":
          "no-store",
      },
    },
  );
}