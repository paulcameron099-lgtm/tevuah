import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/src/lib/supabase/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    if (!UUID_PATTERN.test(id)) {
      return NextResponse.json(
        {
          error: "Invalid joint investment ID.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase = await createClient();

    // --------------------------------------------------------
    // 1. Require a real authenticated Supabase session
    // --------------------------------------------------------

    const {
      data: claimsData,
      error: claimsError,
    } = await supabase.auth.getClaims();

    if (
      claimsError ||
      !claimsData?.claims?.sub
    ) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        {
          status: 401,
        }
      );
    }

    // --------------------------------------------------------
    // 2. Initialize obligations through the auth-bound RPC
    //
    // Do NOT use the admin client here.
    // The RPC intentionally checks auth.uid().
    // --------------------------------------------------------

    const {
      data,
      error,
    } = await supabase.rpc(
      "initialize_joint_investment_funding_obligations",
      {
        p_joint_subscription_id: id,
      }
    );

    if (error) {
      console.error(
        "Joint funding obligation initialization failed:",
        {
          jointSubscriptionId: id,
          code: error.code,
          message: error.message,
        }
      );

      const message =
        error.message ===
        "You are not a member of this joint investment."
          ? "Joint investment unavailable."
          : error.message;

      return NextResponse.json(
        {
          error:
            message ||
            "Unable to initialize joint funding.",
        },
        {
          status: 400,
        }
      );
    }

    const obligations = (data ?? []).map(
      (row: {
        obligation_id: string;
        member_id: string;
        investor_id: string;
        obligation_amount: number | string;
        funded_amount: number | string;
        currency: string;
        obligation_status: string;
      }) => ({
        obligationId: row.obligation_id,
        memberId: row.member_id,
        investorId: row.investor_id,
        obligationAmount: Number(
          row.obligation_amount
        ),
        fundedAmount: Number(
          row.funded_amount
        ),
        currency: row.currency,
        status: row.obligation_status,
      })
    );

    return NextResponse.json(
      {
        jointSubscriptionId: id,
        obligations,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Unexpected joint funding initialization error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to initialize joint funding.",
      },
      {
        status: 500,
      }
    );
  }
}