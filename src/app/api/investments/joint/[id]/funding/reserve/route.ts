import { NextResponse } from "next/server";

import { createClient } from "@/src/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type ReservationResult = {
  reservation_id: string;
  joint_subscription_id: string;
  opportunity_id: string;
  reserved_amount_cents: number | string;
  reservation_status: string;
  reserved_at: string;
};

export async function POST(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Joint subscription ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * IMPORTANT:
     * Use the authenticated SSR client.
     *
     * reserve_joint_investment_capacity()
     * relies on auth.uid().
     */
    const supabase = await createClient();

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
        },
      );
    }

    const {
      data,
      error,
    } = await supabase.rpc(
      "reserve_joint_investment_capacity",
      {
        p_joint_subscription_id: id,
      },
    );

    if (error) {
      console.error(
        "Joint capacity reservation RPC error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            error.message ||
            "Unable to reserve investment capacity.",
        },
        {
          status: 409,
        },
      );
    }

    const result =
      (
        Array.isArray(data)
          ? data[0]
          : data
      ) as ReservationResult | null;

    if (!result) {
      return NextResponse.json(
        {
          error:
            "Capacity reservation was not returned.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,

        reservation: {
          id:
            result.reservation_id,

          jointSubscriptionId:
            result.joint_subscription_id,

          opportunityId:
            result.opportunity_id,

          amountCents:
            Number(
              result.reserved_amount_cents,
            ),

          status:
            result.reservation_status,

          reservedAt:
            result.reserved_at,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Joint capacity reservation API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to reserve investment capacity.",
      },
      {
        status: 500,
      },
    );
  }
}