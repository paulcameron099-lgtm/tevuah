import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@/src/lib/supabase/server";

export const dynamic =
  "force-dynamic";

type RequestBody = {
  fundingObligationId?: unknown;
  idempotencyKey?: unknown;
};

type JointCashFundingResult = {
  joint_subscription_id: string;
  funding_obligation_id: string;
  investor_id: string;
  cash_account_id: string;
  cash_ledger_id: string;
  funded_principal_amount_cents: number;
  available_balance_cents: number;
  obligation_status: string;
  joint_status: string;
  funded_at: string;
};

function isUuid(
  value: string,
) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function getRpcStatus(
  message: string,
) {
  const normalized =
    message.toLowerCase();

  if (
    normalized.includes(
      "authentication required",
    )
  ) {
    return 401;
  }

  if (
    normalized.includes(
      "not authorized",
    )
  ) {
    return 403;
  }

  if (
    normalized.includes(
      "not found",
    )
  ) {
    return 404;
  }

  if (
    normalized.includes(
      "insufficient",
    ) ||
    normalized.includes(
      "already",
    ) ||
    normalized.includes(
      "not awaiting funding",
    ) ||
    normalized.includes(
      "not available for funding",
    ) ||
    normalized.includes(
      "active or verified external funding",
    ) ||
    normalized.includes(
      "must be accepted",
    ) ||
    normalized.includes(
      "does not match",
    ) ||
    normalized.includes(
      "invalid",
    )
  ) {
    return 409;
  }

  return 400;
}

export async function POST(
  request: NextRequest,
) {
  try {
    const supabase =
      await createClient();

    /*
     * Authenticate before parsing/mutating anything.
     *
     * The same authenticated SSR client is deliberately used for
     * the RPC below because the database function binds the funding
     * operation to auth.uid().
     */
    const {
      data: {
        user,
      },
      error:
        userError,
    } =
      await supabase.auth.getUser();

    if (
      userError ||
      !user
    ) {
      return NextResponse.json(
        {
          error:
            "Authentication required.",
        },
        {
          status: 401,
        },
      );
    }

    let body:
      RequestBody;

    try {
      body =
        (await request.json()) as RequestBody;
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid request body.",
        },
        {
          status: 400,
        },
      );
    }

    const fundingObligationId =
      typeof body.fundingObligationId ===
      "string"
        ? body.fundingObligationId.trim()
        : "";

    const idempotencyKey =
      typeof body.idempotencyKey ===
      "string"
        ? body.idempotencyKey.trim()
        : "";

    if (
      !fundingObligationId
    ) {
      return NextResponse.json(
        {
          error:
            "Funding obligation ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !isUuid(
        fundingObligationId,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Funding obligation ID is invalid.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !idempotencyKey
    ) {
      return NextResponse.json(
        {
          error:
            "Idempotency key is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      idempotencyKey.length >
      255
    ) {
      return NextResponse.json(
        {
          error:
            "Idempotency key is too long.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * IMPORTANT:
     *
     * Do not use createAdminClient() here.
     * Do not debit the Cash Account here.
     * Do not update the funding obligation here.
     *
     * The SECURITY DEFINER RPC is the single atomic writer and uses
     * auth.uid() to ensure an investor can fund only their own
     * canonical joint obligation.
     */
    const {
      data,
      error,
    } =
      await supabase.rpc(
        "fund_joint_investment_from_cash_account",
        {
          p_funding_obligation_id:
            fundingObligationId,
          p_idempotency_key:
            idempotencyKey,
        },
      );

    if (error) {
      console.error(
        "Joint Cash Account funding RPC error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            error.message ||
            "Unable to fund joint investment from Tevuah Cash Account.",
        },
        {
          status:
            getRpcStatus(
              error.message ??
                "",
            ),
        },
      );
    }

    const result =
      Array.isArray(data)
        ? (data[0] as
            | JointCashFundingResult
            | undefined)
        : (data as
            | JointCashFundingResult
            | null);

    if (!result) {
      console.error(
        "Joint Cash Account funding RPC returned no result.",
        {
          fundingObligationId,
          investorId:
            user.id,
        },
      );

      return NextResponse.json(
        {
          error:
            "Funding completed without a canonical result.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * No financial state is calculated here.
     * These values are returned directly from the canonical RPC.
     */
    return NextResponse.json(
      {
        success: true,
        funding: {
          jointSubscriptionId:
            result.joint_subscription_id,
          fundingObligationId:
            result.funding_obligation_id,
          investorId:
            result.investor_id,
          cashAccountId:
            result.cash_account_id,
          cashLedgerId:
            result.cash_ledger_id,
          fundedPrincipalAmountCents:
            Number(
              result.funded_principal_amount_cents,
            ),
          availableBalanceCents:
            Number(
              result.available_balance_cents,
            ),
          obligationStatus:
            result.obligation_status,
          jointStatus:
            result.joint_status,
          fundedAt:
            result.funded_at,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Joint Cash Account funding API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to fund joint investment from Tevuah Cash Account.",
      },
      {
        status: 500,
      },
    );
  }
}
