import {
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type RequestBody = {
  investorId?: unknown;
  notificationId?: unknown;
  historicalCreatedAt?: unknown;
};

export const dynamic =
  "force-dynamic";

export async function POST(
  request: Request,
) {
  try {
    /*
     * --------------------------------------------------
     * 1. AUTHENTICATE ADMIN
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
        "admin" &&
      user.role !==
        "super_admin"
    ) {
      return NextResponse.json(
        {
          error:
            "Admin access required.",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 2. PARSE BODY
     * --------------------------------------------------
     */

    const body =
      (await request.json()) as RequestBody;

    const investorId =
      typeof body.investorId ===
      "string"
        ? body.investorId.trim()
        : "";

    const notificationId =
      typeof body.notificationId ===
      "string"
        ? body.notificationId.trim()
        : "";

    if (
      !isUuid(
        investorId,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "A valid investor ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !isUuid(
        notificationId,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "A valid notification ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * NULL means:
     * clear historical override and return to created_at.
     */

    let historicalCreatedAt:
      | string
      | null;

    if (
      body.historicalCreatedAt ===
        null ||
      body.historicalCreatedAt ===
        undefined ||
      body.historicalCreatedAt ===
        ""
    ) {
      historicalCreatedAt =
        null;
    } else if (
      typeof body.historicalCreatedAt ===
      "string"
    ) {
      const parsed =
        new Date(
          body.historicalCreatedAt,
        );

      if (
        Number.isNaN(
          parsed.getTime(),
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Historical notification date and time are invalid.",
          },
          {
            status: 400,
          },
        );
      }

      historicalCreatedAt =
        parsed.toISOString();
    } else {
      return NextResponse.json(
        {
          error:
            "Historical notification date and time are invalid.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 3. SERVICE CLIENT
     * --------------------------------------------------
     */

    const admin =
      createAdminClient();

    /*
     * --------------------------------------------------
     * 4. VERIFY NOTIFICATION OWNERSHIP
     *
     * Do not trust investorId from the browser.
     *
     * The notification being changed must actually
     * belong to the investor whose admin workspace
     * initiated the request.
     * --------------------------------------------------
     */

    const {
      data:
        notification,
      error:
        notificationError,
    } = await admin
      .from(
        "investor_notifications",
      )
      .select(
        `
        id,
        investor_id
        `,
      )
      .eq(
        "id",
        notificationId,
      )
      .maybeSingle();

    if (
      notificationError
    ) {
      console.error(
        "Historical notification ownership check error:",
        notificationError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to verify investor notification.",
        },
        {
          status: 500,
        },
      );
    }

    if (
      !notification
    ) {
      return NextResponse.json(
        {
          error:
            "Investor notification not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      notification.investor_id !==
      investorId
    ) {
      return NextResponse.json(
        {
          error:
            "Notification does not belong to this investor.",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 5. UPDATE THROUGH HARDENED SERVICE RPC
     *
     * The database independently verifies p_actor_id
     * belongs to an admin/super_admin.
     *
     * The trigger independently guarantees that only
     * historical_created_at may change inside this
     * privileged context.
     * --------------------------------------------------
     */

    const {
      data,
      error,
    } = await admin.rpc(
      "admin_set_investor_notification_historical_timestamp_service",
      {
        p_actor_id:
          user.id,

        p_notification_id:
          notificationId,

        p_historical_created_at:
          historicalCreatedAt,
      },
    );

    if (error) {
      console.error(
        "Historical notification timestamp RPC error:",
        error,
      );

      const message =
        error.message ||
        "Unable to update historical notification time.";

      const normalized =
        message.toLowerCase();

      const status =
        normalized.includes(
          "authorization",
        ) ||
        normalized.includes(
          "admin",
        )
          ? 403
          : normalized.includes(
                "not found",
              )
            ? 404
            : 400;

      return NextResponse.json(
        {
          error:
            message,
        },
        {
          status,
        },
      );
    }

    const result =
      Array.isArray(
        data,
      )
        ? data[0] ??
          null
        : data;

    /*
     * --------------------------------------------------
     * 6. RESPONSE
     * --------------------------------------------------
     */

    return NextResponse.json(
      {
        ok: true,
        result,
      },
      {
        status: 200,
      },
    );
  } catch (
    error
  ) {
    console.error(
      "Admin historical notification timestamp error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to update historical notification time.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * ==================================================
 * UUID VALIDATION
 * ==================================================
 */

function isUuid(
  value: string,
) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}