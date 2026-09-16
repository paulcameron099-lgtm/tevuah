import {
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  getUnreadAdminNotificationCount,
} from "@/src/lib/notifications/get-unread-admin-notification-count";

export const dynamic =
  "force-dynamic";

export async function GET() {
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
      user.role !== "admin" &&
      user.role !==
        "super_admin"
    ) {
      return NextResponse.json(
        {
          error:
            "Administrator access required.",
        },
        {
          status: 403,
        },
      );
    }

    const count =
      await getUnreadAdminNotificationCount(
        user.id,
      );

    return NextResponse.json(
      {
        count,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Admin unread notification count API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load notification count.",
      },
      {
        status: 500,
      },
    );
  }
}