
  import {NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  encryptSensitiveValue,
} from "@/src/lib/retirement/retirement-encryption";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type RetirementAccountPayload = {
  accountType?: string;
  institutionName?: string;
  planProvider?: string;
  planSponsor?: string;
  accountHolderName?: string;
  accountNumber?: string;
  participantId?: string;
  approximateBalanceDollars?: number | string | null;
  employmentStatus?: string;
  rolloverEligibility?: string;
};

const ACCOUNT_TYPES =
  new Set([
    "401k",
    "403b",
    "457b",
    "traditional_ira",
    "roth_ira",
    "sep_ira",
    "simple_ira",
    "rollover_ira",
    "pension",
    "other",
  ]);

const EMPLOYMENT_STATUSES =
  new Set([
    "currently_employed",
    "former_employee",
    "retired",
    "self_employed",
    "not_applicable",
    "unknown",
  ]);

const ROLLOVER_STATUSES =
  new Set([
    "eligible",
    "not_eligible",
    "unknown",
    "requires_review",
  ]);

function clean(
  value:
    | string
    | undefined,
) {
  const normalized =
    value?.trim() ?? "";

  return normalized ||
    null;
}

function lastFour(
  value:
    | string
    | null
    | undefined,
) {
  const normalized =
    value
      ?.replace(
        /\s+/g,
        "",
      )
      .trim() ?? "";

  if (!normalized) {
    return null;
  }

  return normalized.slice(
    -4,
  );
}

function dollarsToCents(
  value:
    | number
    | string
    | null
    | undefined,
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const dollars =
    typeof value ===
    "number"
      ? value
      : Number(value);

  if (
    !Number.isFinite(
      dollars,
    ) ||
    dollars < 0
  ) {
    throw new Error(
      "Approximate balance must be a non-negative number.",
    );
  }

  const cents =
    Math.round(
      dollars * 100,
    );

  if (
    !Number.isSafeInteger(
      cents,
    )
  ) {
    throw new Error(
      "Approximate balance is too large.",
    );
  }

  return cents;
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
          status:
            401,
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
            "Investor access required.",
        },
        {
          status:
            403,
        },
      );
    }

    const payload =
      (await request.json()) as RetirementAccountPayload;

    const accountType =
      clean(
        payload.accountType,
      );

    const institutionName =
      clean(
        payload.institutionName,
      );

    const accountHolderName =
      clean(
        payload.accountHolderName,
      );

    const employmentStatus =
      clean(
        payload.employmentStatus,
      ) ??
      "unknown";

    const rolloverEligibility =
      clean(
        payload.rolloverEligibility,
      ) ??
      "unknown";

    if (
      !accountType ||
      !ACCOUNT_TYPES.has(
        accountType,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Select a valid retirement account type.",
        },
        {
          status:
            400,
        },
      );
    }

    if (
      !institutionName
    ) {
      return NextResponse.json(
        {
          error:
            "Institution or plan provider is required.",
        },
        {
          status:
            400,
        },
      );
    }

    if (
      !accountHolderName
    ) {
      return NextResponse.json(
        {
          error:
            "Account holder name is required.",
        },
        {
          status:
            400,
        },
      );
    }

    if (
      !EMPLOYMENT_STATUSES.has(
        employmentStatus,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Select a valid employment status.",
        },
        {
          status:
            400,
        },
      );
    }

    if (
      !ROLLOVER_STATUSES.has(
        rolloverEligibility,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Select a valid rollover eligibility value.",
        },
        {
          status:
            400,
        },
      );
    }

    const accountNumber =
      clean(
        payload.accountNumber,
      );

    const participantId =
      clean(
        payload.participantId,
      );

    const approximateBalanceCents =
      dollarsToCents(
        payload.approximateBalanceDollars,
      );

    const admin =
      createAdminClient();

    const {
      data:
        accountId,
      error:
        rpcError,
    } =
      await admin.rpc(
        "upsert_investor_retirement_account_service",
        {
          p_actor_id:
            user.id,

          p_investor_id:
            user.id,

          p_account_id:
            null,

          p_account_type:
            accountType,

          p_institution_name:
            institutionName,

          p_plan_provider:
            clean(
              payload.planProvider,
            ),

          p_plan_sponsor:
            clean(
              payload.planSponsor,
            ),

          p_account_holder_name:
            accountHolderName,

          p_account_last_four:
            lastFour(
              accountNumber,
            ),

          p_account_number_encrypted:
            accountNumber
              ? encryptSensitiveValue(
                  accountNumber,
                )
              : null,

          p_participant_id_encrypted:
            participantId
              ? encryptSensitiveValue(
                  participantId,
                )
              : null,

          p_custodian_account_identifier_encrypted:
            null,

          p_rollover_identifier_encrypted:
            null,

          p_approximate_balance_cents:
            approximateBalanceCents,

          p_current_balance_cents:
            null,

          p_currency:
            "USD",

          p_employment_status:
            employmentStatus,

          p_rollover_eligibility:
            rolloverEligibility,

          p_connection_method:
            "manual",

          p_provider_name:
            null,

          p_provider_item_id:
            null,

          p_provider_account_id:
            null,

          p_provider_access_token_encrypted:
            null,
        },
      );

    if (
      rpcError
    ) {
      console.error(
        "Retirement account create RPC error:",
        rpcError,
      );

      return NextResponse.json(
        {
          error:
            rpcError.message ||
            "Unable to add retirement account.",
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

        accountId:
          typeof accountId ===
          "string"
            ? accountId
            : null,
      },
      {
        status:
          201,
      },
    );
  } catch (error) {
    console.error(
      "Retirement account create error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unable to add retirement account.";

    return NextResponse.json(
      {
        error:
          message,
      },
      {
        status:
          500,
      },
    );
  }
}
