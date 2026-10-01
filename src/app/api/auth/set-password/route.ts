import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  AUTH_ACTIVATION_COOKIE,
  verifyAuthActivationToken,
} from "@/src/lib/auth/auth-activation";

import {
  createClient,
} from "@/src/lib/supabase/server";

type PasswordPayload = {
  password?: string;
  confirmPassword?: string;
};

function noStoreJson(
  body: Record<string, unknown>,
  status: number,
) {
  return NextResponse.json(
    body,
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(
  request: Request,
) {
  try {
    const cookieStore =
      await cookies();

    const activation =
      verifyAuthActivationToken(
        cookieStore.get(
          AUTH_ACTIVATION_COOKIE,
        )?.value,
      );

    /*
     * A normal authenticated session is not
     * sufficient to change a password through
     * this endpoint.
     *
     * The user must have arrived through a
     * verified invite or recovery activation.
     */
    if (!activation) {
      return noStoreJson(
        {
          error:
            "Your password activation session is missing or expired. Please use a fresh invitation or password-reset link.",
        },
        401,
      );
    }

    const payload =
      (await request.json()) as PasswordPayload;

    const password =
      payload.password ?? "";

    const confirmPassword =
      payload.confirmPassword ?? "";

    if (
      password.length < 8
    ) {
      return noStoreJson(
        {
          error:
            "Your new password must be at least 8 characters.",
        },
        400,
      );
    }

    if (
      password !==
      confirmPassword
    ) {
      return noStoreJson(
        {
          error:
            "The passwords you entered do not match.",
        },
        400,
      );
    }

    const supabase =
      await createClient();

    /*
     * Verify the Supabase session created by
     * /auth/confirm.
     */
    const {
      data: userData,
      error: userError,
    } =
      await supabase.auth.getUser();

    if (
      userError ||
      !userData.user
    ) {
      cookieStore.delete(
        AUTH_ACTIVATION_COOKIE,
      );

      return noStoreJson(
        {
          error:
            "Your authenticated activation session is no longer valid. Please use a fresh invitation or password-reset link.",
        },
        401,
      );
    }

    /*
     * Critical security binding:
     *
     * The authenticated Supabase user must be
     * the exact user represented by the signed
     * activation authorization.
     */
    if (
      userData.user.id !==
      activation.userId
    ) {
      console.error(
        "Blocked password update due to activation identity mismatch.",
        {
          activationUserId:
            activation.userId,
          authenticatedUserId:
            userData.user.id,
          purpose:
            activation.purpose,
        },
      );

      cookieStore.delete(
        AUTH_ACTIVATION_COOKIE,
      );

      await supabase.auth.signOut({
        scope: "local",
      });

      return noStoreJson(
        {
          error:
            "Account verification failed. No password was changed. Please open a fresh activation link.",
        },
        403,
      );
    }

    /*
     * Change the password for the verified
     * investor account.
     */
    const {
      data: updateData,
      error: updateError,
    } =
      await supabase.auth.updateUser({
        password,
      });

    if (
      updateError ||
      !updateData.user
    ) {
      console.error(
        "Password update error:",
        updateError,
      );

      return noStoreJson(
        {
          error:
            updateError?.message ??
            "Unable to update your password.",
        },
        400,
      );
    }

    /*
     * Defensive identity verification after
     * the password update.
     */
    if (
      updateData.user.id !==
      activation.userId
    ) {
      console.error(
        "Password update returned unexpected user identity.",
        {
          activationUserId:
            activation.userId,
          updatedUserId:
            updateData.user.id,
        },
      );

      cookieStore.delete(
        AUTH_ACTIVATION_COOKIE,
      );

      await supabase.auth.signOut({
        scope: "local",
      });

      return noStoreJson(
        {
          error:
            "Unable to verify the updated account.",
        },
        500,
      );
    }

    /*
     * Password setup/reset has now been consumed.
     *
     * Delete ONLY the one-time activation
     * authorization.
     *
     * IMPORTANT:
     * Do NOT sign out the Supabase session.
     * The investor should continue directly
     * into the authenticated dashboard.
     */
    cookieStore.delete(
      AUTH_ACTIVATION_COOKIE,
    );

    return noStoreJson(
      {
        success: true,
        email:
          updateData.user.email ??
          null,
        userId:
          updateData.user.id,
        purpose:
          activation.purpose,
      },
      200,
    );
  } catch (error) {
    console.error(
      "Set password error:",
      error,
    );

    return noStoreJson(
      {
        error:
          "Unable to update your password.",
      },
      500,
    );
  }
}