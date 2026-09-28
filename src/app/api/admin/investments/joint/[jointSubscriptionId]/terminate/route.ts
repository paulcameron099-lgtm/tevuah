import {
  NextResponse,
  type NextRequest,
} from "next/server";

import {
  createClient,
} from "@/src/lib/supabase/server";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

type RouteContext = {
  params: Promise<{
    jointSubscriptionId: string;
  }>;
};

type TerminationAction =
  | "reject"
  | "cancel";

type Body = {
  action?: TerminationAction;
  reason?: string;
};

type ReservationReleaseResult = {
  reservation_id: string;
  reservation_type: string;
  parent_id: string;
  parent_status: string;
  reservation_status: string;
  released_at: string | null;
};

function isUuid(
  value: string,
) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    /*
     * ==========================================================
     * 1. ROUTE PARAMETER
     * ==========================================================
     */

    const {
      jointSubscriptionId,
    } =
      await context.params;

    if (
      !jointSubscriptionId ||
      !isUuid(
        jointSubscriptionId,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "A valid joint investment subscription ID is required.",
        },
        {
          status: 400,
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        },
      );
    }

    /*
     * ==========================================================
     * 2. REQUEST BODY
     * ==========================================================
     */

    const body =
      (await request
        .json()
        .catch(
          () => ({}),
        )) as Body;

    const action =
      body.action;

    const reason =
      body.reason
        ?.trim() ??
      "";

    if (
      action !== "reject" &&
      action !== "cancel"
    ) {
      return NextResponse.json(
        {
          error:
            "Action must be either reject or cancel.",
        },
        {
          status: 400,
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        },
      );
    }

    if (
      reason.length < 5
    ) {
      return NextResponse.json(
        {
          error:
            "A clear reason of at least 5 characters is required.",
        },
        {
          status: 400,
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        },
      );
    }

    const finalStatus =
      action === "reject"
        ? "rejected"
        : "cancelled";

    /*
     * ==========================================================
     * 3. AUTHENTICATE ADMIN
     * ==========================================================
     *
     * IMPORTANT:
     *
     * Keep this authenticated SSR client.
     *
     * admin_release_investment_reservation()
     * depends on auth.uid() and independently verifies
     * administrator access.
     *
     * Do NOT call the lifecycle RPC through the
     * service-role client.
     */

    const supabase =
      await createClient();

    const {
      data: claimsData,
      error: claimsError,
    } =
      await supabase.auth.getClaims();

    const userId =
      claimsData
        ?.claims
        ?.sub;

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
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        },
      );
    }

    /*
     * ==========================================================
     * 4. ADMIN ROLE CHECK
     * ==========================================================
     */

    const {
      data: adminProfile,
      error: adminProfileError,
    } =
      await supabase
        .from(
          "profiles",
        )
        .select(
          `
            id,
            role
          `,
        )
        .eq(
          "id",
          userId,
        )
        .maybeSingle();

    if (
      adminProfileError ||
      !adminProfile
    ) {
      console.error(
        "Joint termination admin profile lookup error:",
        adminProfileError,
      );

      return NextResponse.json(
        {
          error:
            "Administrator profile could not be verified.",
        },
        {
          status: 403,
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        },
      );
    }

    if (
      adminProfile.role !==
        "admin" &&
      adminProfile.role !==
        "super_admin"
    ) {
      return NextResponse.json(
        {
          error:
            "Administrator access required.",
        },
        {
          status: 403,
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        },
      );
    }

    /*
     * ==========================================================
     * 5. LOAD JOINT SUBSCRIPTION
     * ==========================================================
     *
     * This read is for:
     *
     * - friendly 404 handling
     * - defensive post-condition checks
     * - response metadata
     *
     * The RPC remains authoritative.
     */

    const admin =
      createAdminClient();

    const {
      data: joint,
      error: jointError,
    } =
      await admin
        .from(
          "joint_investment_subscriptions",
        )
        .select(
          `
            id,
            opportunity_id,
            total_commitment_amount,
            currency,
            status
          `,
        )
        .eq(
          "id",
          jointSubscriptionId,
        )
        .maybeSingle();

    if (
      jointError ||
      !joint
    ) {
      if (jointError) {
        console.error(
          "Joint termination subscription lookup error:",
          jointError,
        );
      }

      return NextResponse.json(
        {
          error:
            "Joint investment subscription could not be found.",
        },
        {
          status: 404,
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        },
      );
    }

    /*
     * ==========================================================
     * 6. FAST TERMINAL-STATE PROTECTION
     * ==========================================================
     *
     * The RPC still performs the authoritative financial
     * protection checks.
     */

    if (
      joint.status ===
      "funded"
    ) {
      return NextResponse.json(
        {
          error:
            "A funded joint investment cannot be rejected or cancelled through the pre-funding termination workflow.",
        },
        {
          status: 409,
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        },
      );
    }

    /*
     * ==========================================================
     * 7. ATOMIC TERMINATION + CAPACITY RELEASE
     * ==========================================================
     *
     * The RPC is authoritative.
     *
     * For a joint investment it protects against:
     *
     * - funded obligations
     * - verified external funding
     * - posted Cash Account funding
     * - existing investment positions
     * - consumed reservations
     *
     * If termination is safe, it:
     *
     * - cancels unfinished funding obligations
     * - cancels unfinished external funding attempts
     * - releases the active capacity reservation
     * - transitions the joint parent to rejected/cancelled
     *
     * All of those database changes occur atomically.
     */

    const {
      data: releaseData,
      error: releaseError,
    } =
      await supabase.rpc(
        "admin_release_investment_reservation",
        {
          p_subscription_id:
            null,

          p_joint_subscription_id:
            jointSubscriptionId,

          p_reason:
            reason,

          p_final_status:
            finalStatus,
        },
      );

    if (releaseError) {
      console.error(
        "Joint investment termination/release RPC error:",
        {
          jointSubscriptionId,
          action,
          adminId:
            userId,
          error:
            releaseError,
        },
      );

      const message =
        releaseError.message ||
        `Unable to ${action} joint investment.`;

      const normalized =
        message.toLowerCase();

      const status =
        normalized.includes(
          "authentication required",
        )
          ? 401
          : normalized.includes(
                "administrator access",
              ) ||
              normalized.includes(
                "admin access",
              )
            ? 403
            : normalized.includes(
                  "not found",
                )
              ? 404
              : 409;

      return NextResponse.json(
        {
          error:
            message,
        },
        {
          status,
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        },
      );
    }

    const releaseResult =
      (
        Array.isArray(
          releaseData,
        )
          ? releaseData[0] ??
            null
          : releaseData
      ) as
        | ReservationReleaseResult
        | null;

    /*
     * ==========================================================
     * 8. DEFENSIVE POST-CONDITION
     * ==========================================================
     */

    if (!releaseResult) {
      console.error(
        "Joint termination RPC returned no result:",
        {
          jointSubscriptionId,
          action,
        },
      );

      return NextResponse.json(
        {
          error:
            "Joint investment termination completed without a result.",
        },
        {
          status: 500,
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        },
      );
    }

    if (
      releaseResult.parent_id !==
        jointSubscriptionId ||
      releaseResult.reservation_type !==
        "joint_subscription" ||
      releaseResult.parent_status !==
        finalStatus ||
      ![
        "released",
        "cancelled",
      ].includes(
        releaseResult.reservation_status,
      )
    ) {
      console.error(
        "Unexpected joint termination lifecycle result:",
        {
          jointSubscriptionId,
          expectedStatus:
            finalStatus,
          result:
            releaseResult,
        },
      );

      return NextResponse.json(
        {
          error:
            "Joint investment termination returned an unexpected lifecycle state.",
        },
        {
          status: 409,
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        },
      );
    }

    /*
     * ==========================================================
     * 9. AUDIT
     * ==========================================================
     *
     * The critical financial/capacity transition has already
     * completed atomically inside the RPC.
     *
     * This route-side audit is therefore best-effort and must
     * never cause the lifecycle operation to be repeated.
     *
     * IMPORTANT:
     * We intentionally do not guess a joint-specific audit table
     * here. The lifecycle result remains authoritative.
     */

    console.info(
      "Joint investment terminated:",
      {
        jointSubscriptionId,

        action,

        finalStatus,

        adminId:
          userId,

        reason,

        reservationId:
          releaseResult.reservation_id,

        reservationStatus:
          releaseResult.reservation_status,

        releasedAt:
          releaseResult.released_at,
      },
    );

    /*
     * ==========================================================
     * 10. SUCCESS
     * ==========================================================
     */

    return NextResponse.json(
      {
        success: true,

        action,

        jointInvestment: {
          id:
            jointSubscriptionId,

          previousStatus:
            joint.status,

          status:
            releaseResult.parent_status,

          opportunityId:
            joint.opportunity_id,

          totalCommitmentAmount:
            joint.total_commitment_amount,

          currency:
            joint.currency,
        },

        reservation: {
          id:
            releaseResult.reservation_id,

          type:
            releaseResult.reservation_type,

          status:
            releaseResult.reservation_status,

          releasedAt:
            releaseResult.released_at,
        },

        capacityReleased:
          releaseResult.reservation_status ===
          "released",

        accountingExecuted:
          false,

        message:
          action ===
          "reject"
            ? "Joint investment rejected and reserved capacity released."
            : "Joint investment cancelled and reserved capacity released.",
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
      "Joint investment termination API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to terminate joint investment.",
      },
      {
        status: 500,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  }
}