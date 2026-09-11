import { NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type CreateInvestorPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  profession?: string;
  country?: string;
  city?: string;
  state?: string;
  postalCode?: string;
};

function clean(
  value: string | undefined,
) {
  const trimmed =
    value?.trim() ?? "";

  return trimmed || null;
}

function normalizeEmail(
  value: string | undefined,
) {
  return (
    value?.trim().toLowerCase() ??
    ""
  );
}

function isEmail(
  value: string,
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value,
  );
}

export async function POST(
  request: Request,
) {
  try {
    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    if (
      currentUser.role !== "admin" &&
      currentUser.role !== "super_admin"
    ) {
      return NextResponse.json(
        {
          error: "Admin access required.",
        },
        {
          status: 403,
        },
      );
    }

    const payload =
      (await request.json()) as CreateInvestorPayload;

    const firstName =
      clean(payload.firstName);

    const lastName =
      clean(payload.lastName);

    const email =
      normalizeEmail(payload.email);

    if (
      !firstName ||
      !lastName
    ) {
      return NextResponse.json(
        {
          error:
            "First name and last name are required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !email ||
      !isEmail(email)
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid investor email address.",
        },
        {
          status: 400,
        },
      );
    }

    const admin =
      createAdminClient();

    const origin =
      new URL(request.url).origin;

    /*
     * The Invite User email template supplied in the README sends
     * token_hash + type=invite to /auth/confirm.
     *
     * redirectTo is still supplied because Supabase exposes it to
     * the template as {{ .RedirectTo }} and validates it against
     * the project's allowed Redirect URLs.
     */
    const redirectTo =
      new URL(
        "/reset-password",
        origin,
      ).toString();

    const {
      data: inviteData,
      error: inviteError,
    } =
      await admin.auth.admin.inviteUserByEmail(
        email,
        {
          redirectTo,
          data: {
            first_name: firstName,
            last_name: lastName,
            role: "investor",
            invited_by: currentUser.id,
          },
        },
      );

    if (
      inviteError ||
      !inviteData.user
    ) {
      const message =
        inviteError?.message ??
        "Unable to create the investor invitation.";

      const duplicate =
        /already|registered|exists|duplicate/i.test(
          message,
        );

      return NextResponse.json(
        {
          error: duplicate
            ? "An Auth account already exists for this email address."
            : message,
        },
        {
          status: duplicate
            ? 409
            : 400,
        },
      );
    }

    const investorId =
      inviteData.user.id;

    /*
     * Email intentionally stays in Supabase Auth.
     * profiles has no email column in the Tevuah schema.
     */
    const {
      error: profileError,
    } =
      await admin
        .from("profiles")
        .upsert(
          {
            id: investorId,
            first_name: firstName,
            last_name: lastName,
            phone: clean(payload.phone),
            profession: clean(
              payload.profession,
            ),
            country: clean(
              payload.country,
            ),
            city: clean(payload.city),
            state: clean(payload.state),
            postal_code: clean(
              payload.postalCode,
            ),
            role: "investor",
          },
          {
            onConflict: "id",
          },
        );

    if (profileError) {
      /*
       * Compensating cleanup: don't leave an orphan Auth user
       * if application-profile creation fails.
       */
      const {
        error: cleanupError,
      } =
        await admin.auth.admin.deleteUser(
          investorId,
        );

      if (cleanupError) {
        console.error(
          "Investor Auth cleanup after profile failure:",
          cleanupError,
        );
      }

      console.error(
        "Investor profile creation error:",
        profileError,
      );

      return NextResponse.json(
        {
          error:
            profileError.message ||
            "Unable to create the investor profile.",
        },
        {
          status: 500,
        },
      );
    }

    const {
      error: auditError,
    } =
      await admin
        .from(
          "investor_access_invitation_events",
        )
        .insert({
          investor_id: investorId,
          admin_id: currentUser.id,
          event_type:
            "investor_invited",
          email,
          metadata: {
            activation_path:
              "/auth/confirm",
            post_activation_path:
              "/reset-password",
          },
        });

    if (auditError) {
      /*
       * The investor already exists successfully at this point.
       * Do not destroy the account because the auxiliary audit insert
       * failed; surface it in server logs for correction.
       */
      console.error(
        "Investor invitation audit error:",
        auditError,
      );
    }

    return NextResponse.json(
      {
        success: true,
        investorId,
        message:
          "Investor account created and activation invitation sent.",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Create investor error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to create the investor account.",
      },
      {
        status: 500,
      },
    );
  }
}
