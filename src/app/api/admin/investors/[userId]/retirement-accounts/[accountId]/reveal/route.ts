
  import { NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  decryptSensitiveValue,
} from "@/src/lib/retirement/retirement-encryption";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    userId: string;
    accountId: string;
  }>;
};

type RevealPayload = {
  field?: string;
  reason?: string;
};

const FIELD_MAP = {
  account_number: {
    column:
      "account_number_encrypted",
    label:
      "Account number",
  },

  participant_id: {
    column:
      "participant_id_encrypted",
    label:
      "Participant ID",
  },

  custodian_account_identifier: {
    column:
      "custodian_account_identifier_encrypted",
    label:
      "Custodian account identifier",
  },

  rollover_identifier: {
    column:
      "rollover_identifier_encrypted",
    label:
      "Rollover identifier",
  },
} as const;

type RevealField =
  keyof typeof FIELD_MAP;

function isRevealField(
  value:
    string | undefined,
): value is RevealField {
  return Boolean(
    value &&
      value in
        FIELD_MAP,
  );
}

function requestIp(
  request: Request,
) {
  const forwarded =
    request.headers.get(
      "x-forwarded-for",
    );

  if (forwarded) {
    return (
      forwarded
        .split(",")[0]
        ?.trim() ||
      null
    );
  }

  return (
    request.headers.get(
      "x-real-ip",
    ) ||
    null
  );
}

export async function POST(
  request: Request,
  context: RouteContext,
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
          status:
            401,
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
          status:
            403,
        },
      );
    }

    const {
      userId,
      accountId,
    } =
      await context.params;

    const payload =
      (await request.json()) as RevealPayload;

    const field =
      payload.field;

    const reason =
      payload.reason?.trim() ??
      "";

    if (
      !isRevealField(
        field,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Select a valid protected field.",
        },
        {
          status:
            400,
        },
      );
    }

    if (
      reason.length <
      5
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a meaningful access reason of at least 5 characters.",
        },
        {
          status:
            400,
        },
      );
    }

    const fieldConfig =
      FIELD_MAP[field];

    const admin =
      createAdminClient();

    const {
      data:
        account,
      error:
        accountError,
    } =
      await admin
        .from(
          "investor_retirement_accounts",
        )
        .select(
          `
          id,
          investor_id,
          account_number_encrypted,
          participant_id_encrypted,
          custodian_account_identifier_encrypted,
          rollover_identifier_encrypted
          `,
        )
        .eq(
          "id",
          accountId,
        )
        .eq(
          "investor_id",
          userId,
        )
        .maybeSingle();

    if (
      accountError ||
      !account
    ) {
      return NextResponse.json(
        {
          error:
            "Retirement account not found.",
        },
        {
          status:
            404,
        },
      );
    }

    const encryptedValue =
      account[
        fieldConfig.column
      ];

    if (
      !encryptedValue ||
      typeof encryptedValue !==
        "string"
    ) {
      return NextResponse.json(
        {
          error:
            `${fieldConfig.label} is not stored for this account.`,
        },
        {
          status:
            404,
        },
      );
    }

    /*
     * Decrypt in server memory only.
     * Nothing is logged yet, and plaintext is never sent to console.
     */
    const plaintext =
      decryptSensitiveValue(
        encryptedValue,
      );

    /*
     * Access must be durably logged BEFORE plaintext is returned.
     * If audit insertion fails, reveal fails closed.
     */
    const {
      error:
        auditError,
    } =
      await admin.rpc(
        "log_sensitive_retirement_field_access_service",
        {
          p_admin_id:
            user.id,

          p_account_id:
            accountId,

          p_field_name:
            field,

          p_reason:
            reason,

          p_ip_address:
            requestIp(
              request,
            ),

          p_user_agent:
            request.headers.get(
              "user-agent",
            ),
        },
      );

    if (
      auditError
    ) {
      console.error(
        "Sensitive retirement access audit error:",
        auditError,
      );

      return NextResponse.json(
        {
          error:
            "Protected information could not be revealed because the access audit could not be recorded.",
        },
        {
          status:
            500,
        },
      );
    }

    return NextResponse.json(
      {
        success:
          true,

        field,
        label:
          fieldConfig.label,

        value:
          plaintext,
      },
      {
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Sensitive retirement reveal error:",
      error instanceof Error
        ? error.message
        : "Unknown reveal error",
    );

    return NextResponse.json(
      {
        error:
          "Unable to reveal protected information.",
      },
      {
        status:
          500,
      },
    );
  }
}