
  import { NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

type FundCashAccountBody = {
  investorId?: unknown;
  amount?: unknown;
  reference?: unknown;
  description?: unknown;
  idempotencyKey?: unknown;
};

function parseUsdToCents(
  value: string,
) {
  const normalized =
    value
      .trim()
      .replace(
        /,/g,
        "",
      );

  if (
    !/^\d+(?:\.\d{1,2})?$/.test(
      normalized,
    )
  ) {
    return null;
  }

  const [
    dollarPart,
    centPart = "",
  ] =
    normalized.split(
      ".",
    );

  const dollars =
    Number(
      dollarPart,
    );

  const cents =
    Number(
      centPart.padEnd(
        2,
        "0",
      ),
    );

  if (
    !Number.isSafeInteger(
      dollars,
    ) ||
    !Number.isSafeInteger(
      cents,
    )
  ) {
    return null;
  }

  const totalCents =
    dollars *
      100 +
    cents;

  if (
    !Number.isSafeInteger(
      totalCents,
    ) ||
    totalCents <=
      0
  ) {
    return null;
  }

  return totalCents;
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
      (await request.json()) as FundCashAccountBody;

    const investorId =
      typeof body.investorId ===
      "string"
        ? body.investorId.trim()
        : "";

    const amount =
      typeof body.amount ===
      "string"
        ? body.amount.trim()
        : "";

    const reference =
      typeof body.reference ===
      "string"
        ? body.reference.trim()
        : "";

    const description =
      typeof body.description ===
      "string"
        ? body.description.trim()
        : "";

    const idempotencyKey =
      typeof body.idempotencyKey ===
      "string"
        ? body.idempotencyKey.trim()
        : "";

    if (!investorId) {
      return NextResponse.json(
        {
          error:
            "Investor ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const amountCents =
      parseUsdToCents(
        amount,
      );

    if (
      amountCents ===
      null
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid funding amount with no more than two decimal places.",
        },
        {
          status: 400,
        },
      );
    }

    if (!reference) {
      return NextResponse.json(
        {
          error:
            "Funding reference is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!description) {
      return NextResponse.json(
        {
          error:
            "Funding description is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!idempotencyKey) {
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

    const admin =
      createAdminClient();

    const {
      data:
        investor,
      error:
        investorError,
    } =
      await admin
        .from(
          "profiles",
        )
        .select(
          "id, first_name, last_name, role",
        )
        .eq(
          "id",
          investorId,
        )
        .single();

    if (
      investorError ||
      !investor ||
      investor.role !==
        "investor"
    ) {
      return NextResponse.json(
        {
          error:
            "Investor profile not found.",
        },
        {
          status: 404,
        },
      );
    }

    const {
      data,
      error,
    } =
      await admin.rpc(
        "admin_credit_investor_cash_service",
        {
          p_actor_id:
            user.id,
          p_investor_id:
            investorId,
          p_amount_cents:
            amountCents,
          p_reference:
            reference,
          p_description:
            description,
          p_idempotency_key:
            idempotencyKey,
          p_currency:
            "USD",
          p_metadata: {
            source:
              "admin_cash_account_ui",
          },
        },
      );

    if (error) {
      console.error(
        "Admin cash funding RPC error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            error.message ||
            "Unable to fund investor cash account.",
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

    return NextResponse.json(
      {
        success: true,
        accountId:
          result?.account_id ??
          null,
        ledgerId:
          result?.ledger_id ??
          null,
        availableBalanceCents:
          result?.available_balance_cents ??
          null,
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
      "Admin fund cash account API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to fund investor cash account.",
      },
      {
        status: 500,
      },
    );
  }
}
