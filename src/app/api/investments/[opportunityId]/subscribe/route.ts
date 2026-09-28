import { NextResponse } from "next/server";

import { checkAccountAccess } from "@/src/lib/auth/account-status";
import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { getInvestmentNotificationRecipient } from "@/src/lib/email/funding-email-recipients";
import { sendApplicationMail } from "@/src/lib/email/application-mailer";
import { companySubscriptionSubmittedEmail } from "@/src/lib/email/investment-emails";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    opportunityId: string;
  }>;
};

type SubscribePayload = {
  amount: string | number;
  offeringAcknowledged: boolean;
  riskAccepted: boolean;
  signature: string;
};

type SubscriptionRpcResult = {
  subscription_id: string;
  reservation_id: string;
  opportunity_id: string;
  commitment_amount: number;
  reserved_amount_cents: number;
  subscription_status: string;
  reservation_status: string;
};

function dollarsToCents(
  value: number,
) {
  return Math.round(
    value * 100,
  );
}

export async function POST(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  try {
    /* ========================================================
     * 1. AUTHENTICATED INVESTOR
     * ======================================================== */

    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "You must sign in before submitting an investment subscription.",
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
            "Only investor accounts can submit investment subscriptions.",
        },
        {
          status: 403,
        },
      );
    }

    /* ========================================================
     * 2. ACCOUNT ACCESS
     * ======================================================== */

    const accountAccess =
      await checkAccountAccess(
        user.id,
      );

    if (
      !accountAccess.allowed
    ) {
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

    /* ========================================================
     * 3. INVESTOR ONBOARDING
     * ======================================================== */

    if (
      user.onboarding_status !==
      "approved"
    ) {
      return NextResponse.json(
        {
          error:
            "Your investor verification must be approved before you can submit an investment subscription.",
        },
        {
          status: 403,
        },
      );
    }

    /* ========================================================
     * 4. REQUEST
     * ======================================================== */

    const {
      opportunityId,
    } = await params;

    if (!opportunityId) {
      return NextResponse.json(
        {
          error:
            "Investment opportunity ID is missing.",
        },
        {
          status: 400,
        },
      );
    }

    const body =
      (await request.json()) as SubscribePayload;

    const investmentAmount =
      Number(
        body.amount,
      );

    const signature =
      body.signature?.trim();

    if (
      !Number.isFinite(
        investmentAmount,
      ) ||
      investmentAmount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid investment amount.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      body.offeringAcknowledged !==
      true
    ) {
      return NextResponse.json(
        {
          error:
            "You must acknowledge that you reviewed the offering documents.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      body.riskAccepted !==
      true
    ) {
      return NextResponse.json(
        {
          error:
            "You must accept the investment risk disclosure before submitting.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !signature ||
      signature.length < 3
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid electronic signature.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Convert the dollar amount received from the UI
     * into the canonical integer-cent amount used by
     * the database.
     */
    const commitmentAmount =
      dollarsToCents(
        investmentAmount,
      );

    if (
      !Number.isSafeInteger(
        commitmentAmount,
      ) ||
      commitmentAmount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid investment amount.",
        },
        {
          status: 400,
        },
      );
    }

    const admin =
      createAdminClient();

    /* ========================================================
     * 5. OPPORTUNITY PRE-CHECK
     *
     * These checks provide clear API errors and avoid sending
     * obviously invalid requests into the RPC.
     *
     * They are NOT the final concurrency/security boundary.
     * The RPC locks and validates the opportunity again.
     * ======================================================== */

    const {
      data: opportunity,
      error:
        opportunityError,
    } = await admin
      .from(
        "investment_opportunities",
      )
      .select(
        `
        id,
        title,
        status,
        funding_target,
        minimum_investment,
        total_funded,
        funding_closed_at
        `,
      )
      .eq(
        "id",
        opportunityId,
      )
      .maybeSingle();

    if (
      opportunityError ||
      !opportunity
    ) {
      console.error(
        "Subscription opportunity load error:",
        opportunityError,
      );

      return NextResponse.json(
        {
          error:
            "Investment opportunity could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      opportunity.status !==
      "published"
    ) {
      return NextResponse.json(
        {
          error:
            "This investment opportunity is no longer open for subscriptions.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * funding_closed_at is persistent.
     *
     * Once the opportunity has reached its funding target,
     * a later redemption/reduction in total_funded must not
     * automatically reopen it.
     */
    if (
      opportunity.funding_closed_at
    ) {
      return NextResponse.json(
        {
          error:
            "This investment opportunity is fully funded and closed to new investments.",
        },
        {
          status: 409,
        },
      );
    }

    /* ========================================================
     * 6. FRIENDLY COMMITMENT PRE-CHECK
     *
     * This is intentionally only a preliminary check.
     *
     * Active reservations may change immediately after this
     * query. The RPC below performs the authoritative capacity
     * calculation while holding the opportunity row lock.
     * ======================================================== */

    const fundingTarget =
      Number(
        opportunity.funding_target,
      );

    const minimumInvestment =
      Number(
        opportunity.minimum_investment,
      );

    const totalFunded =
      Number(
        opportunity.total_funded,
      );

    const remainingAllocation =
      fundingTarget -
      totalFunded;

    if (
      remainingAllocation <=
      0
    ) {
      return NextResponse.json(
        {
          error:
            "This investment opportunity is fully funded.",
        },
        {
          status: 409,
        },
      );
    }

    if (
      commitmentAmount <
      minimumInvestment
    ) {
      return NextResponse.json(
        {
          error: `The minimum investment for this opportunity is ${formatMoney(
            minimumInvestment,
          )}.`,
        },
        {
          status: 400,
        },
      );
    }

    if (
      commitmentAmount >
      remainingAllocation
    ) {
      return NextResponse.json(
        {
          error: `Your investment cannot exceed the remaining allocation of ${formatMoney(
            remainingAllocation,
          )}.`,
        },
        {
          status: 400,
        },
      );
    }

    /* ========================================================
     * 7. ATOMIC SUBSCRIPTION + CAPACITY RESERVATION
     *
     * IMPORTANT:
     *
     * Use the cookie-authenticated Supabase server client.
     *
     * The RPC uses auth.uid() to identify the investor.
     * Therefore this must NOT use createAdminClient().
     *
     * Inside one database transaction the RPC:
     *
     *   - verifies the investor
     *   - locks the opportunity
     *   - verifies published status
     *   - verifies funding_closed_at IS NULL
     *   - validates the minimum investment
     *   - counts ALL active individual + joint reservations
     *   - calculates authoritative remaining capacity
     *   - creates a new individual subscription
     *   - creates its capacity reservation
     *   - creates the subscription audit record
     *
     * Any failure rolls the whole transaction back.
     * ======================================================== */

    const supabase =
      await createClient();

    const {
      data: rpcData,
      error: rpcError,
    } = await supabase.rpc(
      "create_individual_investment_subscription",
      {
        p_opportunity_id:
          opportunityId,

        p_commitment_amount:
          commitmentAmount,

        p_offering_acknowledged:
          true,

        p_risk_accepted:
          true,

        p_signature:
          signature,
      },
    );

    if (rpcError) {
      console.error(
        "Atomic subscription creation error:",
        rpcError,
      );

      /*
       * Capacity/lifecycle failures are conflicts with the
       * current authoritative opportunity state.
       *
       * We intentionally do not fall back to a direct INSERT.
       */
      return NextResponse.json(
        {
          error:
            rpcError.message ||
            "Unable to submit your investment subscription.",
        },
        {
          status: 409,
        },
      );
    }

    const rpcRows =
      (rpcData ??
        []) as SubscriptionRpcResult[];

    const newSubscription =
      rpcRows[0];

    if (
      !newSubscription ||
      !newSubscription.subscription_id ||
      !newSubscription.reservation_id
    ) {
      console.error(
        "Atomic subscription RPC returned no subscription/reservation:",
        rpcData,
      );

      return NextResponse.json(
        {
          error:
            "Unable to submit your investment subscription.",
        },
        {
          status: 500,
        },
      );
    }

    const subscriptionId =
      newSubscription.subscription_id;

    /*
     * Defensive invariant.
     *
     * A successful individual subscription must have an active
     * reservation for exactly the submitted commitment.
     */
    if (
      newSubscription.opportunity_id !==
        opportunityId ||
      Number(
        newSubscription.commitment_amount,
      ) !== commitmentAmount ||
      Number(
        newSubscription.reserved_amount_cents,
      ) !== commitmentAmount ||
      newSubscription.reservation_status !==
        "active"
    ) {
      console.error(
        "Atomic subscription RPC invariant failure:",
        newSubscription,
      );

      /*
       * Do not attempt another subscription here.
       *
       * The database transaction already completed, so retrying
       * could create a second intentional subscription.
       */
      return NextResponse.json(
        {
          error:
            "The investment subscription was created, but its confirmation could not be verified. Please review your investments before trying again.",
        },
        {
          status: 500,
        },
      );
    }

    /* ========================================================
     * 8. COMPANY NOTIFICATION
     *
     * Email happens AFTER the canonical database transaction.
     *
     * Email failure must never roll back or retry a valid
     * subscription.
     * ======================================================== */

    let companyEmailSent =
      false;

    const companyRecipient =
      getInvestmentNotificationRecipient();

    if (companyRecipient) {
      const [
        authResult,
        profileResult,
      ] =
        await Promise.all([
          admin.auth.admin.getUserById(
            user.id,
          ),

          admin
            .from(
              "profiles",
            )
            .select(
              "first_name, last_name",
            )
            .eq(
              "id",
              user.id,
            )
            .maybeSingle(),
        ]);

      const investorEmail =
        authResult.data.user
          ?.email ??
        "Email unavailable";

      const investorName =
        [
          profileResult.data
            ?.first_name,

          profileResult.data
            ?.last_name,
        ]
          .filter(Boolean)
          .join(" ")
          .trim() ||
        "Investor";

      const email =
        companySubscriptionSubmittedEmail(
          {
            investorName,
            investorEmail,

            opportunityTitle:
              opportunity.title,

            commitmentAmountCents:
              commitmentAmount,

            subscriptionId,

            origin:
              new URL(
                request.url,
              ).origin,
          },
        );

      companyEmailSent =
        (
          await sendApplicationMail(
            {
              to:
                companyRecipient,

              ...email,
            },
          )
        ).sent;
    }

    /* ========================================================
     * 9. RESPONSE
     * ======================================================== */

    return NextResponse.json(
      {
        success:
          true,

        subscriptionId,

        reservationId:
          newSubscription.reservation_id,

        companyEmailSent,

        next:
          "/dashboard/investments",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Investment subscription API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while submitting your investment subscription.",
      },
      {
        status: 500,
      },
    );
  }
}

function formatMoney(
  cents: number,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style:
        "currency",

      currency:
        "USD",

      maximumFractionDigits:
        0,
    },
  ).format(
    cents / 100,
  );
}