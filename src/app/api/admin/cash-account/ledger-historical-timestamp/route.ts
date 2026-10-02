import {
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

type HistoricalTimestampBody = {
  ledgerId?: unknown;
  historicalCreatedAt?: unknown;
};

function isValidUuid(
  value: string,
) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function parseHistoricalTimestamp(
  value: unknown,
):
  | {
      valid: true;
      value:
        | string
        | null;
    }
  | {
      valid: false;
      value: null;
    } {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return {
      valid: true,
      value: null,
    };
  }

  if (
    typeof value !==
    "string"
  ) {
    return {
      valid: false,
      value: null,
    };
  }

  const normalized =
    value.trim();

  if (!normalized) {
    return {
      valid: true,
      value: null,
    };
  }

  const timestamp =
    new Date(
      normalized,
    );

  if (
    Number.isNaN(
      timestamp.getTime(),
    )
  ) {
    return {
      valid: false,
      value: null,
    };
  }

  return {
    valid: true,
    value:
      timestamp.toISOString(),
  };
}

export async function POST(
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
        "admin" &&
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
      (await request.json()) as HistoricalTimestampBody;

    const ledgerId =
      typeof body.ledgerId ===
      "string"
        ? body.ledgerId.trim()
        : "";

    if (
      !ledgerId ||
      !isValidUuid(
        ledgerId,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "A valid ledger ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const parsedTimestamp =
      parseHistoricalTimestamp(
        body.historicalCreatedAt,
      );

    if (
      !parsedTimestamp.valid
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid historical date and time.",
        },
        {
          status: 400,
        },
      );
    }

    const admin =
      createAdminClient();

    /*
     * Do not update investor_cash_ledger directly here.
     *
     * The service RPC:
     * - verifies p_actor_id is an administrator,
     * - opens the narrow historical-edit context,
     * - updates only historical_created_at,
     * - preserves created_at,
     * - synchronizes the linked investor activity timestamp
     *   through the database trigger,
     * - closes the internal context.
     */
    const {
      data,
      error,
    } =
      await admin.rpc(
        "admin_set_cash_ledger_historical_timestamp_service",
        {
          p_actor_id:
            user.id,
          p_ledger_id:
            ledgerId,
          p_historical_created_at:
            parsedTimestamp.value,
        },
      );

    if (error) {
      console.error(
        "Admin cash ledger historical timestamp RPC error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            error.message ||
            "Unable to update historical transaction time.",
        },
        {
          status: 400,
        },
      );
    }

    const result =
      Array.isArray(
        data,
      )
        ? data[0]
        : data;

    if (!result) {
      return NextResponse.json(
        {
          error:
            "Historical transaction time was not updated.",
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,

        ledgerId:
          result.ledger_id,

        investorId:
          result.investor_id,

        actualCreatedAt:
          result.actual_created_at,

        historicalCreatedAt:
          result.historical_created_at,

        investorEffectiveAt:
          result.investor_effective_at,
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
      "Admin cash ledger historical timestamp API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to update historical transaction time.",
      },
      {
        status: 500,
      },
    );
  }
}