import {
  NextResponse,
  type NextRequest,
} from "next/server";

import {
  createClient,
} from "@/src/lib/supabase/server";


export const dynamic =
  "force-dynamic";


type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};


const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  const {
    id,
  } =
    await context.params;


  if (
    !id ||
    !UUID_PATTERN.test(id)
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid joint investment ID.",
      },
      {
        status: 400,
      },
    );
  }


  const supabase =
    await createClient();


  /*
   * ==========================================================
   * AUTHENTICATED USER
   * ==========================================================
   */

  const {
    data: claimsData,
    error: claimsError,
  } =
    await supabase.auth.getClaims();


  const userId =
    claimsData?.claims?.sub;


  if (
    claimsError ||
    !userId
  ) {
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


  /*
   * ==========================================================
   * TEST 1 — DETAIL ACCESS
   * ==========================================================
   */

  const {
    data: detailData,
    error: detailError,
  } =
    await supabase.rpc(
      "get_joint_investment_status",
      {
        p_joint_subscription_id:
          id,
      },
    );


  /*
   * ==========================================================
   * TEST 2 — LIST ACCESS
   * ==========================================================
   */

  const {
    data: listData,
    error: listError,
  } =
    await supabase.rpc(
      "list_my_joint_investments",
    );


  const detailRows =
    Array.isArray(detailData)
      ? detailData
      : detailData
        ? [detailData]
        : [];


  const listRows =
    Array.isArray(listData)
      ? listData
      : [];


  const listedTarget =
    listRows.some(
      (row) =>
        row.joint_subscription_id ===
        id,
    );


  /*
   * Do not return the actual investment records.
   *
   * This endpoint only tells us whether the authenticated
   * authorization boundaries allowed access.
   */

  return NextResponse.json(
    {
      success: true,

      authenticatedUserId:
        userId,

      targetJointSubscriptionId:
        id,

      detail: {
        rpcError:
          detailError?.message ??
          null,

        rowCount:
          detailRows.length,

        canReadTarget:
          detailRows.length >
          0,
      },

      listing: {
        rpcError:
          listError?.message ??
          null,

        totalVisibleJointInvestments:
          listRows.length,

        targetAppearsInList:
          listedTarget,
      },
    },
    {
      headers: {
        "Cache-Control":
          "no-store, max-age=0",
      },
    },
  );
}