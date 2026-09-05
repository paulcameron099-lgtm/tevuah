import { NextResponse } from "next/server";

import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

type Payload = {
  notificationId?: string;
  all?: boolean;
};

export async function PATCH(
  request: Request,
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    if (user.role !== "investor") {
      return NextResponse.json(
        {
          error: "Forbidden.",
        },
        {
          status: 403,
        },
      );
    }

    const body =
      (await request.json()) as Payload;

    const admin =
      createAdminClient();

    const now =
      new Date().toISOString();

    if (body.all) {
      const { error } = await admin
        .from("investor_notifications")
        .update({
          is_read: true,
          read_at: now,
        })
        .eq("investor_id", user.id)
        .eq("is_read", false);

      if (error) {
        console.error(
          "Mark all notifications read error:",
          error,
        );

        return NextResponse.json(
          {
            error:
              "Unable to update notifications.",
          },
          {
            status: 500,
          },
        );
      }

      return NextResponse.json({
        success: true,
      });
    }

    if (!body.notificationId) {
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

    const { error } = await admin
      .from("investor_notifications")
      .update({
        is_read: true,
        read_at: now,
      })
      .eq(
        "id",
        body.notificationId,
      )
      .eq(
        "investor_id",
        user.id,
      );

    if (error) {
      console.error(
        "Mark notification read error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to update notification.",
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
      "Notification read API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to update notifications.",
      },
      {
        status: 500,
      },
    );
  }
}
