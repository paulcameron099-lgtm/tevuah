import {
  cookies,
} from "next/headers";

import {
  NextResponse,
} from "next/server";

import {
  AUTH_ACTIVATION_COOKIE,
  authActivationCookieOptions,
  createAuthActivationToken,
} from "@/src/lib/auth/auth-activation";

import {
  createClient,
} from "@/src/lib/supabase/server";

type VerifyRecoveryPayload = {
  email?: string;
  token?: string;
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
        "Cache-Control":
          "no-store",
      },
    },
  );
}

function getRequestOrigin(
  request: Request,
) {
  const origin =
    request.headers.get(
      "origin",
    );

  return origin?.replace(
    /\/$/,
    "",
  );
}

function getSiteUrl() {
  return (
    process.env
      .NEXT_PUBLIC_SITE_URL
      ?.replace(
        /\/$/,
        "",
      ) ?? null
  );
}

export async function POST(
  request: Request,
) {
  try {
    /*
     * CSRF / cross-origin protection.
     *
     * This endpoint should only be called
     * from the Tevuah Reserve application.
     */
    const requestOrigin =
      getRequestOrigin(
        request,
      );

    const siteUrl =
      getSiteUrl();

    if (
      !siteUrl ||
      !requestOrigin ||
      requestOrigin !== siteUrl
    ) {
      console.error(
        "Blocked recovery verification request due to origin mismatch.",
        {
          requestOrigin:
            requestOrigin ??
            null,

          configuredSiteUrl:
            siteUrl,
        },
      );

      return noStoreJson(
        {
          error:
            "Unable to verify the recovery request.",
        },
        403,
      );
    }

    const payload =
      (await request.json()) as VerifyRecoveryPayload;

    const email =
      payload.email
        ?.trim()
        .toLowerCase() ??
      "";

    const token =
      payload.token
        ?.replace(
          /\s+/g,
          "",
        )
        .trim() ??
      "";

    if (!email) {
      return noStoreJson(
        {
          error:
            "Enter the email address used for your password recovery request.",
        },
        400,
      );
    }

    if (!token) {
      return noStoreJson(
        {
          error:
            "Enter the verification code from your recovery email.",
        },
        400,
      );
    }

    /*
     * Clear any existing local Supabase
     * authentication session first.
     *
     * This prevents another signed-in user
     * from contaminating the recovery flow.
     */
    const supabase =
      await createClient();

    const {
      error:
        signOutError,
    } =
      await supabase.auth.signOut({
        scope: "local",
      });

    if (signOutError) {
      console.error(
        "Pre-recovery verification sign-out error:",
        signOutError,
      );

      return noStoreJson(
        {
          error:
            "Unable to prepare the secure recovery session. Please try again.",
        },
        500,
      );
    }

    /*
     * This is where the recovery OTP is
     * actually consumed.
     *
     * Email scanners never reach this point
     * because there is no OTP in a clickable
     * email URL anymore.
     */
    const {
      data:
        verificationData,

      error:
        verificationError,
    } =
      await supabase.auth.verifyOtp({
        email,
        token,
        type: "recovery",
      });

    if (verificationError) {
      console.error(
        "Recovery OTP verification error:",
        {
          message:
            verificationError.message,

          status:
            verificationError.status,

          code:
            verificationError.code,
        },
      );

      return noStoreJson(
        {
          error:
            "The verification code is invalid or has expired. Request a new code and try again.",
        },
        400,
      );
    }

    const verifiedUser =
      verificationData.user;

    const verifiedSession =
      verificationData.session;

    if (
      !verifiedUser ||
      !verifiedSession
    ) {
      console.error(
        "Recovery OTP verification returned no authenticated user/session.",
        {
          hasUser:
            Boolean(
              verifiedUser,
            ),

          hasSession:
            Boolean(
              verifiedSession,
            ),
        },
      );

      await supabase.auth.signOut({
        scope: "local",
      });

      return noStoreJson(
        {
          error:
            "Unable to establish the secure recovery session. Please request a new code.",
        },
        401,
      );
    }

    /*
     * Defensive identity verification.
     *
     * verifyOtp() should have established
     * the authenticated recovery session.
     */
    const {
      data:
        authenticatedData,

      error:
        authenticatedError,
    } =
      await supabase.auth.getUser();

    if (
      authenticatedError ||
      !authenticatedData.user
    ) {
      console.error(
        "Unable to read authenticated recovery user:",
        authenticatedError,
      );

      await supabase.auth.signOut({
        scope: "local",
      });

      return noStoreJson(
        {
          error:
            "Unable to verify the recovery session. Please request a new code.",
        },
        401,
      );
    }

    if (
      authenticatedData.user.id !==
      verifiedUser.id
    ) {
      console.error(
        "Recovery verification identity mismatch.",
        {
          verifiedUserId:
            verifiedUser.id,

          authenticatedUserId:
            authenticatedData.user.id,
        },
      );

      await supabase.auth.signOut({
        scope: "local",
      });

      return noStoreJson(
        {
          error:
            "Unable to verify the recovery account.",
        },
        403,
      );
    }

    /*
     * Create the short-lived Tevuah
     * authorization required by the existing
     * /reset-password page.
     */
    const activationToken =
      createAuthActivationToken(
        verifiedUser.id,
        "recovery",
      );

    const cookieStore =
      await cookies();

    cookieStore.set(
      AUTH_ACTIVATION_COOKIE,
      activationToken,
      authActivationCookieOptions,
    );

    return noStoreJson(
      {
        success: true,
        purpose:
          "recovery",
      },
      200,
    );
  } catch (error) {
    console.error(
      "Recovery verification route error:",
      error,
    );

    return noStoreJson(
      {
        error:
          "Unable to verify the recovery request. Please try again.",
      },
      500,
    );
  }
}