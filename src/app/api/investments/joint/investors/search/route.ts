import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

export async function GET(
  request: NextRequest,
) {
  try {
    /* ========================================================
     * 1. AUTHENTICATION
     * ====================================================== */

    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Authentication required.",
        },
        {
          status: 401,
        },
      );
    }

    if (
      user.role !==
      "investor"
    ) {
      return NextResponse.json(
        {
          error:
            "Investor access required.",
        },
        {
          status: 403,
        },
      );
    }

    /* ========================================================
     * 2. SEARCH INPUT
     * ====================================================== */

    const query =
      request.nextUrl.searchParams
        .get("q")
        ?.trim()
        .toLowerCase() ?? "";

    /*
     * Require a meaningful email-shaped search value.
     *
     * This helps prevent the endpoint from becoming
     * an investor-directory enumeration tool.
     */
    if (
      query.length < 5 ||
      !query.includes("@")
    ) {
      return NextResponse.json({
        investors: [],
      });
    }

    /*
     * Maximum practical email-address length.
     */
    if (query.length > 254) {
      return NextResponse.json(
        {
          error:
            "Search value is too long.",
        },
        {
          status: 400,
        },
      );
    }

    /* ========================================================
     * 3. SERVER-ONLY AUTH LOOKUP
     *
     * IMPORTANT:
     *
     * Email does NOT exist on public.profiles.
     *
     * The canonical email address is stored by Supabase Auth
     * in auth.users.
     *
     * Therefore:
     *
     *   email -> Supabase Auth user
     *              ↓ id
     *          public.profiles
     *
     * We use the server-only Admin client so none of the Auth
     * directory is exposed directly to the browser.
     * ====================================================== */

    const admin =
      createAdminClient();

    const normalizedEmail =
      query.trim().toLowerCase();

    const {
      data: authUsersData,
      error: authUsersError,
    } =
      await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (authUsersError) {
      console.error(
        "Joint investor Auth lookup error:",
        authUsersError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to search for the investor.",
        },
        {
          status: 500,
        },
      );
    }

    /* ========================================================
     * 4. EXACT EMAIL MATCH
     *
     * Do NOT perform partial matching here.
     *
     * The investor must enter the exact email address of the
     * person they intend to invite.
     * ====================================================== */

    const authInvestor =
      authUsersData.users.find(
        (authUser) =>
          authUser.email
            ?.trim()
            .toLowerCase() ===
          normalizedEmail,
      );

    /*
     * Do not reveal whether some unrelated Auth account exists.
     *
     * Also prevent the current investor from selecting
     * themselves as the second joint investor.
     */
    if (
      !authInvestor ||
      authInvestor.id === user.id
    ) {
      return NextResponse.json({
        investors: [],
      });
    }

    /* ========================================================
     * 5. LOAD CANONICAL INVESTOR PROFILE
     *
     * profiles contains identity / investor state.
     * Auth contains the email.
     * ====================================================== */

    const {
      data: profile,
      error: profileError,
    } =
      await admin
        .from("profiles")
        .select(
          `
            id,
            first_name,
            last_name,
            role,
            account_status,
            onboarding_status
          `,
        )
        .eq(
          "id",
          authInvestor.id,
        )
        .eq(
          "role",
          "investor",
        )
        .maybeSingle();

    if (profileError) {
      console.error(
        "Joint investor profile lookup error:",
        profileError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to search for the investor.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * An Auth account without an investor profile is not
     * eligible for joint-investor selection.
     */
    if (!profile) {
      return NextResponse.json({
        investors: [],
      });
    }

    /* ========================================================
     * 6. ACCOUNT ELIGIBILITY
     * ====================================================== */

    if (
      profile.account_status ===
      "suspended"
    ) {
      return NextResponse.json({
        investors: [],
      });
    }

    /*
     * We deliberately keep onboarding_status loaded because
     * it belongs to the investor eligibility model.
     *
     * At this stage we are preserving the previous behavior:
     * the search route does not reject a profile solely because
     * of onboarding_status.
     *
     * Final joint-investment eligibility remains enforced by
     * the controlled database workflow.
     */

    /* ========================================================
     * 7. SAFE RESPONSE
     *
     * Return only what the joint-investor selector needs.
     *
     * Do NOT return:
     *
     * - phone
     * - residential address
     * - KYC documents
     * - identity numbers
     * - Auth metadata
     * - onboarding documents
     * - account metadata
     * ====================================================== */

    return NextResponse.json(
      {
        investors: [
          {
            id:
              profile.id,

            firstName:
              profile.first_name,

            lastName:
              profile.last_name,

            email:
              authInvestor.email ??
              normalizedEmail,
          },
        ],
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Joint investor search route error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to search for the investor.",
      },
      {
        status: 500,
      },
    );
  }
}