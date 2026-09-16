import {
  NextResponse,
  type NextRequest,
} from "next/server";

import {
  createClient,
} from "@/src/lib/supabase/server";

import {
  checkAccountAccess,
} from "@/src/lib/auth/account-status";


type CreateJointInvestmentPayload = {
  opportunityId?: string;
  secondInvestorId?: string;
  totalCommitmentAmount?: number;
};


function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}


export async function POST(
  request: NextRequest,
) {
  try {
    /*
     * 1. Authenticate using the normal
     * cookie-backed Supabase SSR client.
     *
     * This is important because the database RPC
     * binds p_initiator_id to auth.uid().
     */
    const supabase =
      await createClient();

    const {
      data: claimsData,
      error: claimsError,
    } =
      await supabase.auth.getClaims();

    const userId =
      claimsData?.claims?.sub;

      console.log(
  "Joint investment authenticated user:",
  userId,
);

    if (
      claimsError ||
      !userId
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }


    /*
     * 2. Reject suspended / disabled accounts.
     *
     * This follows the same account-access boundary
     * already used by your onboarding routes.
     */
    const accountAccess =
      await checkAccountAccess(
        userId,
      );

    if (!accountAccess.allowed) {
      return NextResponse.json(
        {
          error:
            accountAccess.reason,

          accountStatus:
            accountAccess.status,
        },
        {
          status: 403,
        },
      );
    }


    /*
     * 3. Parse request body.
     */
    let body:
      CreateJointInvestmentPayload;

    try {
      body =
        (await request.json()) as
          CreateJointInvestmentPayload;
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


    const opportunityId =
      body.opportunityId?.trim();

    const secondInvestorId =
      body.secondInvestorId?.trim();

    const totalCommitmentAmount =
      body.totalCommitmentAmount;


    /*
     * 4. Basic transport-level validation.
     *
     * Business invariants remain enforced
     * inside PostgreSQL.
     */
    if (
      !opportunityId ||
      !isUuid(opportunityId)
    ) {
      return NextResponse.json(
        {
          error:
            "A valid investment opportunity is required.",
        },
        {
          status: 400,
        },
      );
    }


    if (
      !secondInvestorId ||
      !isUuid(secondInvestorId)
    ) {
      return NextResponse.json(
        {
          error:
            "A valid second investor is required.",
        },
        {
          status: 400,
        },
      );
    }


    if (
      secondInvestorId === userId
    ) {
      return NextResponse.json(
        {
          error:
            "You cannot create a joint investment with yourself.",
        },
        {
          status: 400,
        },
      );
    }


    if (
      !Number.isSafeInteger(
        totalCommitmentAmount,
      ) ||
      totalCommitmentAmount! <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Total commitment amount must be a positive amount in cents.",
        },
        {
          status: 400,
        },
      );
    }


    /*
     * Joint ownership is currently fixed 50/50,
     * so the commitment must split exactly into
     * two whole-cent obligations.
     */
    if (
      totalCommitmentAmount! % 2 !== 0
    ) {
      return NextResponse.json(
        {
          error:
            "Joint investment commitment must be divisible equally between both investors.",
        },
        {
          status: 400,
        },
      );
    }


    /*
     * 5. Create through the authenticated RPC.
     *
     * DO NOT use createAdminClient() here.
     *
     * The database function independently verifies:
     *
     * p_initiator_id = auth.uid()
     *
     * along with investor roles, opportunity state,
     * minimum investment, available capacity,
     * even-cent splitting and the fixed 50/50 structure.
     */
    const {
      data,
      error,
    } =
      await supabase.rpc(
        "create_joint_investment_subscription",
        {
          p_initiator_id:
            userId,

          p_second_investor_id:
            secondInvestorId,

          p_opportunity_id:
            opportunityId,

          p_total_commitment_amount:
            totalCommitmentAmount!,
        },
      );


    if (error) {
      console.error(
        "Joint investment creation RPC error:",
        error,
      );

      /*
       * Don't expose raw PostgreSQL/Supabase
       * diagnostics to the browser.
       *
       * We'll improve error classification later,
       * after we verify the real RPC response shape.
       */
      return NextResponse.json(
        {
          error:
            "Unable to create the joint investment.",
        },
        {
          status: 400,
        },
      );
    }


    /*
     * 6. Normalize RPC response.
     *
     * PostgreSQL table-returning functions usually
     * arrive as an array. Handle either shape safely.
     */
    const result =
      Array.isArray(data)
        ? data[0]
        : data;


    if (!result) {
      console.error(
        "Joint investment RPC returned no result.",
      );

      return NextResponse.json(
        {
          error:
            "Joint investment was not created.",
        },
        {
          status: 500,
        },
      );
    }


    /*
     * 7. Return only the creation result.
     *
     * No invitation token exists at this stage.
     * Invitation issuance remains a separate
     * controlled operation.
     */
    return NextResponse.json(
      {
        success: true,
        jointInvestment:
          result,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Joint investment creation error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while creating the joint investment.",
      },
      {
        status: 500,
      },
    );
  }
}