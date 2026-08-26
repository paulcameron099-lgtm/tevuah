import {
  NextResponse,
} from "next/server";

import {
  checkAccountAccess,
} from "@/src/lib/auth/account-status";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    opportunityId: string;
  }>;
};

type SubscribePayload = {
  amount:
    | string
    | number;

  offeringAcknowledged:
    boolean;

  riskAccepted:
    boolean;

  signature: string;
};

/*
 * Convert a USD amount such as:
 *
 * 25000
 *
 * into:
 *
 * 2500000 cents
 *
 * We store money as integer cents
 * in the database.
 */
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
    /*
     * ==================================================
     * 1. AUTHENTICATE CURRENT USER
     * ==================================================
     */
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

    /*
     * ==================================================
     * 2. INVESTOR ROLE ONLY
     * ==================================================
     */
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

    /*
     * ==================================================
     * 3. ACCOUNT MUST BE ACTIVE
     * ==================================================
     */
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

    /*
     * ==================================================
     * 4. INVESTOR MUST BE VERIFIED
     * ==================================================
     */
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

    /*
     * ==================================================
     * 5. READ OPPORTUNITY ID
     * ==================================================
     */
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

    /*
     * ==================================================
     * 6. READ SUBMITTED FORM
     * ==================================================
     */
    const body =
      (await request.json()) as SubscribePayload;

    const investmentAmount =
      Number(
        body.amount,
      );

    const signature =
      body.signature
        ?.trim();

    /*
     * ==================================================
     * 7. VALIDATE INVESTMENT AMOUNT
     * ==================================================
     */
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

    /*
     * ==================================================
     * 8. VALIDATE ACKNOWLEDGEMENTS
     * ==================================================
     */
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

    /*
     * ==================================================
     * 9. VALIDATE ELECTRONIC SIGNATURE
     * ==================================================
     */
    if (!signature) {
      return NextResponse.json(
        {
          error:
            "Enter your full legal name as your electronic signature.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      signature.length <
      3
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
     * ==================================================
     * 10. CREATE SERVICE-ROLE CLIENT
     * ==================================================
     */
    const admin =
      createAdminClient();

    /*
     * ==================================================
     * 11. LOAD THE OPPORTUNITY
     * ==================================================
     *
     * IMPORTANT:
     *
     * We do NOT trust the amount/limits
     * sent from the browser.
     *
     * Everything is reloaded from the
     * database here.
     */
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
        total_funded
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

    /*
     * ==================================================
     * 12. OPPORTUNITY MUST STILL BE PUBLISHED
     * ==================================================
     */
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
     * ==================================================
     * 13. CONVERT DATABASE VALUES
     * ==================================================
     */
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

    const commitmentAmount =
      dollarsToCents(
        investmentAmount,
      );

    /*
     * ==================================================
     * 14. CALCULATE AVAILABLE ALLOCATION
     * ==================================================
     */
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

    /*
     * ==================================================
     * 15. MINIMUM INVESTMENT VALIDATION
     * ==================================================
     */
    if (
      commitmentAmount <
      minimumInvestment
    ) {
      return NextResponse.json(
        {
          error:
            `The minimum investment for this opportunity is ${formatMoney(
              minimumInvestment,
            )}.`,
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ==================================================
     * 16. MAXIMUM / REMAINING ALLOCATION VALIDATION
     * ==================================================
     */
    if (
      commitmentAmount >
      remainingAllocation
    ) {
      return NextResponse.json(
        {
          error:
            `Your investment cannot exceed the remaining allocation of ${formatMoney(
              remainingAllocation,
            )}.`,
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ==================================================
     * 17. CHECK EXISTING SUBSCRIPTION
     * ==================================================
     *
     * Your table currently has:
     *
     * unique (
     *   investor_id,
     *   opportunity_id
     * )
     *
     * so an investor can have only one
     * subscription record per opportunity.
     */
    const {
      data:
        existingSubscription,
      error:
        existingError,
    } = await admin
      .from(
        "investment_subscriptions",
      )
      .select(
        `
        id,
        status,
        commitment_amount
        `,
      )
      .eq(
        "investor_id",
        user.id,
      )
      .eq(
        "opportunity_id",
        opportunityId,
      )
      .maybeSingle();

    if (existingError) {
      console.error(
        "Existing subscription lookup error:",
        existingError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to check your existing investment subscription.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * Prevent duplicate final subscriptions.
     */
    if (
      existingSubscription &&
      [
        "submitted",
        "under_review",
        "approved",
      ].includes(
        existingSubscription.status,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "You already have an active subscription for this investment opportunity.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * ==================================================
     * 18. TIMESTAMPS
     * ==================================================
     */
    const now =
      new Date().toISOString();

    /*
     * ==================================================
     * 19. CREATE OR UPDATE SUBSCRIPTION
     * ==================================================
     *
     * If a previous draft, rejected,
     * action_required or cancelled record
     * exists, reuse it.
     *
     * Otherwise create a new record.
     */
    let subscriptionId:
      string;

    if (
      existingSubscription
    ) {
      const {
        data:
          updatedSubscription,
        error:
          updateError,
      } = await admin
        .from(
          "investment_subscriptions",
        )
        .update({
  commitment_amount:
    commitmentAmount,

  status:
    "submitted",

  offering_acknowledged:
    true,

  offering_acknowledged_at:
    now,

  risk_disclosure_accepted:
    true,

  risk_disclosure_accepted_at:
    now,

  electronic_signature:
    signature,

  signed_at:
    now,

  submitted_at:
    now,

  reviewed_at:
    null,

  reviewed_by:
    null,

  rejection_reason:
    null,

  admin_notes:
    null,

  updated_at:
    now,
})
        .eq(
          "id",
          existingSubscription.id,
        )
        .select(
          `
          id
          `,
        )
        .single();

      if (
        updateError ||
        !updatedSubscription
      ) {
        console.error(
          "Subscription update error:",
          updateError,
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

      subscriptionId =
        updatedSubscription.id;
    } else {
      const {
        data:
          newSubscription,
        error:
          insertError,
      } = await admin
        .from(
          "investment_subscriptions",
        )
        .insert({
          investor_id:
            user.id,

          opportunity_id:
            opportunityId,

          commitment_amount:
            commitmentAmount,

          status:
            "submitted",

          offering_acknowledged:
            true,

          offering_acknowledged_at:
            now,

          risk_disclosure_accepted:
            true,

          risk_disclosure_accepted_at:
            now,

          electronic_signature:
            signature,

          signed_at:
            now,

          submitted_at:
            now,
        })
        .select(
          `
          id
          `,
        )
        .single();

      if (
        insertError ||
        !newSubscription
      ) {
        console.error(
          "Subscription creation error:",
          insertError,
        );

        /*
         * Unique constraint conflict.
         */
        if (
          insertError?.code ===
          "23505"
        ) {
          return NextResponse.json(
            {
              error:
                "You already have a subscription for this opportunity.",
            },
            {
              status: 409,
            },
          );
        }

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

      subscriptionId =
        newSubscription.id;
    }

    /*
     * ==================================================
     * 20. WRITE AUDIT RECORD
     * ==================================================
     */
    const {
      error:
        auditError,
    } = await admin
      .from(
        "investment_subscription_audit",
      )
      .insert({
        subscription_id:
          subscriptionId,

        actor_id:
          user.id,

        action:
          existingSubscription
            ? "subscription_resubmitted"
            : "subscription_submitted",

        metadata: {
          opportunityId,

          /*
           * Commitment amount is business
           * transaction information and is
           * appropriate to record here.
           */
          commitmentAmount,

          currency:
            "USD",
        },
      });

    /*
     * Audit failure should be visible in
     * server logs, but we do not destroy
     * an otherwise valid subscription.
     */
    if (auditError) {
      console.error(
        "Subscription audit error:",
        auditError,
      );
    }

    /*
     * ==================================================
     * 21. IMPORTANT:
     * DO NOT UPDATE total_funded YET
     * ==================================================
     *
     * A submitted subscription is only a
     * requested commitment.
     *
     * It has NOT yet been approved by admin.
     *
     * Therefore we deliberately do NOT:
     *
     * investment_opportunities.total_funded += amount
     *
     * here.
     *
     * That will happen during the admin
     * approval workflow.
     */

    /*
     * ==================================================
     * 22. SUCCESS
     * ==================================================
     */
    return NextResponse.json({
      success: true,

      subscriptionId,

      next:
        "/dashboard/investments",
    });
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

/*
 * ==================================================
 * MONEY FORMATTER
 * ==================================================
 *
 * Receives cents.
 */
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