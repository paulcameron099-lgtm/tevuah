import {
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type Payload = {
  notificationId?: string;
  all?: boolean;
};

export async function PATCH(
  request: Request,
) {
  try {
    /*
     * --------------------------------------------------
     * 1. AUTHENTICATE
     * --------------------------------------------------
     */

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

    /*
     * --------------------------------------------------
     * 2. REQUEST BODY
     * --------------------------------------------------
     */

    const body =
      (await request.json()) as Payload;

    const admin =
      createAdminClient();

    /*
     * --------------------------------------------------
     * 3. CLEAR ALL
     * --------------------------------------------------
     *
     * This performs a soft dismissal.
     *
     * The database rows remain available for
     * administrative/audit purposes.
     * --------------------------------------------------
     */

    if (body.all) {
      const {
        data,
        error,
      } =
        await admin.rpc(
          "dismiss_all_investor_notifications",
        );

      if (error) {
        console.error(
          "Dismiss all investor notifications error:",
          error,
        );

        return NextResponse.json(
          {
            error:
              "Unable to clear notifications.",
          },
          {
            status: 500,
          },
        );
      }

      const result =
        Array.isArray(data)
          ? data[0] ?? null
          : data ?? null;

      return NextResponse.json({
        success: true,
        dismissedCount:
          Number(
            result?.dismissed_count ??
              0,
          ),
        dismissedAt:
          result?.dismissed_at ??
          null,
      });
    }

    /*
     * --------------------------------------------------
     * 4. CLEAR ONE
     * --------------------------------------------------
     */

    const notificationId =
      body.notificationId?.trim();

    if (!notificationId) {
      return NextResponse.json(
        {
          error:
            "Notification ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      data,
      error,
    } =
      await admin.rpc(
        "dismiss_investor_notification",
        {
          p_notification_id:
            notificationId,
        },
      );

    if (error) {
      console.error(
        "Dismiss investor notification error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to clear notification.",
        },
        {
          status: 500,
        },
      );
    }

    const result =
      Array.isArray(data)
        ? data[0] ?? null
        : data ?? null;

    /*
     * The RPC only succeeds for a notification belonging
     * to the authenticated investor.
     */

    if (!result) {
      return NextResponse.json(
        {
          error:
            "Notification not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      notificationId:
        result.notification_id ??
        notificationId,
      dismissedAt:
        result.dismissed_at ??
        null,
    });
  } catch (error) {
    console.error(
      "Notification dismiss API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to clear notification.",
      },
      {
        status: 500,
      },
    );
  }
}