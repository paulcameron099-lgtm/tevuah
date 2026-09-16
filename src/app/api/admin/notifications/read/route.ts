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

    const body =
      (await request.json()) as Payload;

    const admin =
      createAdminClient();

    /*
     * ==================================================
     * MARK ALL READ
     * ==================================================
     */
    if (body.all) {
      /*
       * Load every company notification ID.
       */
      const {
        data: notifications,
        error:
          notificationsError,
      } = await admin
        .from(
          "admin_notifications",
        )
        .select("id");

      if (notificationsError) {
        console.error(
          "Admin notifications lookup error:",
          notificationsError,
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

      const rows =
        (
          notifications ??
          []
        ).map(
          (notification) => ({
            notification_id:
              notification.id,

            admin_id:
              user.id,

            read_at:
              new Date()
                .toISOString(),
          }),
        );

      if (
        rows.length >
        0
      ) {
        const {
          error,
        } = await admin
          .from(
            "admin_notification_reads",
          )
          .upsert(
            rows,
            {
              onConflict:
                "notification_id,admin_id",

              ignoreDuplicates:
                false,
            },
          );

        if (error) {
          console.error(
            "Mark all admin notifications read error:",
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

      return NextResponse.json({
        success: true,
      });
    }

    /*
     * ==================================================
     * MARK ONE READ
     * ==================================================
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

    /*
     * Make sure the notification actually exists.
     */
    const {
      data: notification,
      error:
        notificationError,
    } = await admin
      .from(
        "admin_notifications",
      )
      .select("id")
      .eq(
        "id",
        notificationId,
      )
      .maybeSingle();

    if (
      notificationError ||
      !notification
    ) {
      return NextResponse.json(
        {
          error:
            "Notification could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    const {
      error,
    } = await admin
      .from(
        "admin_notification_reads",
      )
      .upsert(
        {
          notification_id:
            notificationId,

          admin_id:
            user.id,

          read_at:
            new Date()
              .toISOString(),
        },
        {
          onConflict:
            "notification_id,admin_id",
        },
      );

    if (error) {
      console.error(
        "Mark admin notification read error:",
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
      "Admin notification read API error:",
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