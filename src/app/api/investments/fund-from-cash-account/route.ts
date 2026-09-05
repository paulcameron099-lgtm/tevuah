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

type FundSubscriptionBody = {
  subscriptionId?: unknown;
  idempotencyKey?: unknown;
};

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
      "investor"
    ) {
      return NextResponse.json(
        {
          error:
            "Investor access required.",
        },
        {
          status: 403,
        },
      );
    }

    const body =
      (await request.json()) as FundSubscriptionBody;

    const subscriptionId =
      typeof body.subscriptionId ===
      "string"
        ? body.subscriptionId.trim()
        : "";

    const idempotencyKey =
      typeof body.idempotencyKey ===
      "string"
        ? body.idempotencyKey.trim()
        : "";

    if (!subscriptionId) {
      return NextResponse.json(
        {
          error:
            "Subscription ID is required.",
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

    /*
     * IMPORTANT:
     *
     * Use a REAL existing Tevuah admin/super_admin profile ID.
     *
     * Do not use the investor ID.
     * Do not expose this value to the browser.
     */
    const systemActorId =
      process.env
        .TEVUAH_SYSTEM_ACTOR_ID
        ?.trim();

    if (!systemActorId) {
      console.error(
        "TEVUAH_SYSTEM_ACTOR_ID is not configured.",
      );

      return NextResponse.json(
        {
          error:
            "Automatic investment verification is not configured.",
        },
        {
          status: 500,
        },
      );
    }

    const admin =
      createAdminClient();

    /*
     * Server-side ownership/status validation.
     * The SQL RPC validates everything again while holding locks.
     */
    const {
      data:
        subscription,
      error:
        subscriptionError,
    } =
      await admin
        .from(
          "investment_subscriptions",
        )
        .select(
          `
          id,
          investor_id,
          commitment_amount,
          status
          `,
        )
        .eq(
          "id",
          subscriptionId,
        )
        .eq(
          "investor_id",
          user.id,
        )
        .maybeSingle();

    if (
      subscriptionError ||
      !subscription
    ) {
      return NextResponse.json(
        {
          error:
            "Subscription not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      subscription.status !==
      "approved"
    ) {
      return NextResponse.json(
        {
          error:
            "This subscription must be approved before funding.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      data,
      error,
    } =
      await admin.rpc(
        "invest_from_cash_account_service",
        {
          p_investor_id:
            user.id,
          p_subscription_id:
            subscriptionId,
          p_idempotency_key:
            idempotencyKey,
          p_system_actor_id:
            systemActorId,
        },
      );

    if (error) {
      console.error(
        "Tevuah Cash auto-verification RPC error:",
        error,
      );

      const message =
        error.message ||
        "Unable to fund this investment from your Tevuah Cash Account.";

      const conflict =
        message
          .toLowerCase()
          .includes(
            "already",
          );

      return NextResponse.json(
        {
          error:
            message,
        },
        {
          status:
            conflict
              ? 409
              : 400,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,

        paymentId:
          data?.paymentId ??
          null,

        positionId:
          data?.positionId ??
          null,

        ledgerId:
          data?.ledgerId ??
          null,

        amountCents:
          data?.amountCents ??
          null,

        remainingBalanceCents:
          data?.remainingBalanceCents ??
          null,

        alreadyProcessed:
          data?.alreadyProcessed ??
          false,

        verified: true,
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
      "Tevuah Cash investment API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to complete Tevuah Cash investment funding.",
      },
      {
        status: 500,
      },
    );
  }
}
