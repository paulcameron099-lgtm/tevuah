import {
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  getUnreadNotificationCount,
} from "@/src/lib/notifications/get-unread-notification-count";

export const dynamic = "force-dynamic";

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
      user.role !==
      "investor"
    ) {
      return NextResponse.json(
        {
          count: 0,
        },
      );
    }

    const count =
      await getUnreadNotificationCount(
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
      "Unread notification count API error:",
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