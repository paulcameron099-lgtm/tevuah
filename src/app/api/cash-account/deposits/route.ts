import {
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";
import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type CreateBody = {
  amountCents?: unknown;
  paymentMethod?: unknown;
};

export async function GET() {
  try {
    const user =
      await getCurrentUser();

    if (
      !user ||
      user.role !==
        "investor"
    ) {
      return NextResponse.json(
        {
          error:
            "Investor access required.",
        },
        {
          status: 401,
        },
      );
    }

    const admin =
      createAdminClient();

    const {
      data,
      error,
    } = await admin
      .from(
        "cash_account_deposit_requests",
      )
      .select("*")
      .eq(
        "investor_id",
        user.id,
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      )
      .limit(25);

    if (error) {
      console.error(
        "Cash deposit request load error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to load Cash Account deposit requests.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      deposits:
        data ?? [],
    });
  } catch (error) {
    console.error(
      "Cash deposit GET error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load Cash Account deposits.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(
  request: Request,
) {
  try {
    const user =
      await getCurrentUser();

    if (
      !user ||
      user.role !==
        "investor"
    ) {
      return NextResponse.json(
        {
          error:
            "Investor access required.",
        },
        {
          status: 401,
        },
      );
    }

    const body =
      (await request.json()) as CreateBody;

    const amountCents =
      Number(
        body.amountCents,
      );

    const paymentMethod =
      body.paymentMethod ===
        "bitcoin"
        ? "bitcoin"
        : body.paymentMethod ===
            "wire_transfer"
          ? "wire_transfer"
          : "";

    if (
      !Number.isSafeInteger(
        amountCents,
      ) ||
      amountCents <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid Cash Account funding amount.",
        },
        {
          status: 400,
        },
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        {
          error:
            "Select Wire Transfer or Bitcoin.",
        },
        {
          status: 400,
        },
      );
    }

    const admin =
      createAdminClient();

    const {
      error: ensureError,
    } = await admin.rpc(
      "ensure_investor_cash_account",
      {
        p_investor_id:
          user.id,
        p_currency:
          "USD",
      },
    );

    if (ensureError) {
      console.error(
        "Ensure Cash Account error:",
        ensureError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to prepare your Cash Account.",
        },
        {
          status: 500,
        },
      );
    }

    const {
      data: account,
      error: accountError,
    } = await admin
      .from(
        "investor_cash_accounts",
      )
      .select(
        "id, status",
      )
      .eq(
        "investor_id",
        user.id,
      )
      .eq(
        "currency",
        "USD",
      )
      .single();

    if (
      accountError ||
      !account
    ) {
      return NextResponse.json(
        {
          error:
            "Cash Account could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      account.status !==
      "active"
    ) {
      return NextResponse.json(
        {
          error:
            "Cash Account is not active.",
        },
        {
          status: 409,
        },
      );
    }

    const {
      data: deposit,
      error: depositError,
    } = await admin
      .from(
        "cash_account_deposit_requests",
      )
      .insert({
        investor_id:
          user.id,

        account_id:
          account.id,

        amount_cents:
          amountCents,

        currency:
          "USD",

        payment_method:
          paymentMethod,

        status:
          "awaiting_instructions",
      })
      .select("*")
      .single();

    if (
      depositError
    ) {
      console.error(
        "Cash deposit request insert error:",
        depositError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to create your Cash Account funding request.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,
      deposit,
    });
  } catch (error) {
    console.error(
      "Cash deposit POST error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to create your Cash Account funding request.",
      },
      {
        status: 500,
      },
    );
  }
}
