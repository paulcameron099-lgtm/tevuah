import {
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type ProfilePayload = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profession?: string;
  country?: string;
  city?: string;
  state?: string;
  postalCode?: string;
};

export async function PATCH(
  request: Request,
) {
  try {
    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Unauthorized.",
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
            "Forbidden.",
        },
        {
          status: 403,
        },
      );
    }

    const body =
      (await request.json()) as ProfilePayload;

    const firstName =
      clean(body.firstName);
    const lastName =
      clean(body.lastName);
    const phone =
      clean(body.phone);
    const profession =
      clean(body.profession);
    const country =
      clean(body.country);
    const city =
      clean(body.city);
    const state =
      clean(body.state);
    const postalCode =
      clean(body.postalCode);

    if (
      !firstName ||
      !lastName
    ) {
      return NextResponse.json(
        {
          error:
            "First and last name are required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      phone &&
      phone.length > 30
    ) {
      return NextResponse.json(
        {
          error:
            "Phone number is too long.",
        },
        {
          status: 400,
        },
      );
    }

    const admin =
      createAdminClient();

    const {
      error,
    } = await admin
      .from("profiles")
      .update({
        first_name:
          firstName,
        last_name:
          lastName,
        phone:
          phone || null,
        profession:
          profession || null,
        country:
          country || null,
        city:
          city || null,
        state:
          state || null,
        postal_code:
          postalCode || null,
      })
      .eq(
        "id",
        user.id,
      );

    if (error) {
      console.error(
        "Investor account profile update error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to update account profile.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Investor account profile API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to update account profile.",
      },
      {
        status: 500,
      },
    );
  }
}

function clean(
  value:
    string |
    undefined,
) {
  return value
    ?.trim()
    .slice(
      0,
      255,
    ) ?? "";
}