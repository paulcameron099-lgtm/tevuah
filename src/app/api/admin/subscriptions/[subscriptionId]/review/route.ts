import {
  NextResponse,
} from "next/server";

import {
  subscriptionApprovedEmail,
  subscriptionInformationRequestedEmail,
  subscriptionRejectedEmail,
} from "@/src/lib/email/templates";

import {
  sendMail,
} from "@/src/lib/email/mailer";

import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    subscriptionId: string;
  }>;
};

type ReviewAction =
  | "approve"
  | "request_information"
  | "reject";

type ReviewPayload = {
  action:
    ReviewAction;

  note?: string;
};

export async function POST(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  try {
    /*
     * --------------------------------------------------
     * 1. ADMIN AUTH
     * --------------------------------------------------
     */
    const user =
      await getCurrentUser();

    if (
      !user ||
      (
        user.role !==
          "admin" &&
        user.role !==
          "super_admin"
      )
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

    const {
      subscriptionId,
    } = await params;

    const body =
      (await request.json()) as ReviewPayload;

    const note =
      body.note
        ?.trim() ??
      "";

    const admin =
      createAdminClient();

    /*
     * --------------------------------------------------
     * 2. LOAD SUBSCRIPTION
     * --------------------------------------------------
     */
    const {
      data: subscription,
      error: subscriptionError,
    } = await admin
      .from(
        "investment_subscriptions",
      )
      .select(
        `
        id,
        investor_id,
        opportunity_id,
        commitment_amount,
        status
        `,
      )
      .eq(
        "id",
        subscriptionId,
      )
      .maybeSingle();

    if (
      subscriptionError ||
      !subscription
    ) {
      return NextResponse.json(
        {
          error:
            "Subscription could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 3. LOAD INVESTOR
     * --------------------------------------------------
     */
    const {
      data: investor,
      error: investorError,
    } = await admin
      .from("profiles")
      .select(
        `
        id,
        first_name,
        last_name
        `,
      )
      .eq(
        "id",
        subscription.investor_id,
      )
      .maybeSingle();

    if (
      investorError ||
      !investor
    ) {
      return NextResponse.json(
        {
          error:
            "Investor could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    const investorName =
      [
        investor.first_name,
        investor.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      "Investor";

    /*
     * --------------------------------------------------
     * 4. LOAD INVESTOR AUTH EMAIL
     * --------------------------------------------------
     */
    const {
      data: authInvestorData,
      error: authInvestorError,
    } =
      await admin.auth.admin.getUserById(
        subscription.investor_id,
      );

    if (authInvestorError) {
      console.error(
        "Subscription investor email lookup error:",
        authInvestorError,
      );
    }

    const investorEmail =
      authInvestorData.user
        ?.email ??
      null;

    /*
     * --------------------------------------------------
     * 5. LOAD OPPORTUNITY
     * --------------------------------------------------
     */
    const {
      data: opportunity,
      error: opportunityError,
    } = await admin
      .from(
        "investment_opportunities",
      )
      .select(
        `
        id,
        title
        `,
      )
      .eq(
        "id",
        subscription.opportunity_id,
      )
      .maybeSingle();

    if (
      opportunityError ||
      !opportunity
    ) {
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
     * --------------------------------------------------
     * 6. PREVENT RE-APPROVAL
     * --------------------------------------------------
     */
    if (
      subscription.status ===
      "approved"
    ) {
      return NextResponse.json(
        {
          error:
            "This subscription has already been approved.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 7. APPROVE
     * --------------------------------------------------
     */
    if (
      body.action ===
      "approve"
    ) {
      /*
       * IMPORTANT:
       *
       * The SQL RPC itself only permits:
       *
       * submitted
       * under_review
       *
       * Therefore action_required cannot
       * accidentally be approved.
       */
      const {
        data,
        error: approvalError,
      } = await admin.rpc(
        "approve_investment_subscription",
        {
          p_subscription_id:
            subscriptionId,

          p_admin_id:
            user.id,
        },
      );

      if (approvalError) {
        console.error(
          "Subscription approval RPC error:",
          approvalError,
        );

        return NextResponse.json(
          {
            error:
              approvalError.message ||
              "Unable to approve subscription.",
          },
          {
            status: 409,
          },
        );
      }

      /*
 * --------------------------------------------------
 * CREATE FUNDING RECORD
 * --------------------------------------------------
 *
 * Approval means the investor is now
 * permitted to fund the commitment.
 */
const {
  data: existingPayment,
  error: existingPaymentError,
} = await admin
  .from(
    "investment_payments",
  )
  .select(
    `
    id,
    status
    `,
  )
  .eq(
    "subscription_id",
    subscriptionId,
  )
  .maybeSingle();

if (existingPaymentError) {
  console.error(
    "Existing funding payment lookup error:",
    existingPaymentError,
  );
}

if (!existingPayment) {
  const {
    error: paymentCreateError,
  } = await admin
    .from(
      "investment_payments",
    )
    .insert({
      subscription_id:
        subscription.id,

      investor_id:
        subscription.investor_id,

      opportunity_id:
        subscription.opportunity_id,

      expected_amount:
        subscription.commitment_amount,

      currency:
        "USD",

      payment_method:
        "bank_transfer",

      status:
        "awaiting_payment",
    });

if (paymentCreateError) {
  console.error(
    "Funding payment creation error:",
    {
      message:
        paymentCreateError.message,

      details:
        paymentCreateError.details,

      hint:
        paymentCreateError.hint,

      code:
        paymentCreateError.code,
    },
  );
}
}

      /*
       * Best-effort email.
       */
      if (investorEmail) {
        try {
          const email =
            subscriptionApprovedEmail({
              investorName,

              opportunityTitle:
                opportunity.title,

              commitmentDisplay:
                formatMoney(
                  Number(
                    subscription.commitment_amount,
                  ),
                ),
            });

          await sendMail({
            to:
              investorEmail,

            subject:
              email.subject,

            text:
              email.text,

            html:
              email.html,
          });
        } catch (
          emailError
        ) {
          console.error(
            "Approved subscription email error:",
            emailError,
          );
        }
      }

      return NextResponse.json({
        success: true,

        action:
          "approved",

        result:
          data,
      });
    }

    /*
     * --------------------------------------------------
     * 8. REQUEST INFORMATION
     * --------------------------------------------------
     */
    if (
      body.action ===
      "request_information"
    ) {
      if (!note) {
        return NextResponse.json(
          {
            error:
              "Enter the information the investor needs to provide.",
          },
          {
            status: 400,
          },
        );
      }

      /*
       * Do not request information from
       * a final rejected/approved record.
       */
      if (
        subscription.status ===
        "rejected"
      ) {
        return NextResponse.json(
          {
            error:
              "A rejected subscription cannot be reopened through this action.",
          },
          {
            status: 409,
          },
        );
      }

      const now =
        new Date().toISOString();

      const {
        error: updateError,
      } = await admin
        .from(
          "investment_subscriptions",
        )
        .update({
          status:
            "action_required",

          admin_notes:
            note,

          rejection_reason:
            null,

          reviewed_at:
            now,

          reviewed_by:
            user.id,

          updated_at:
            now,
        })
        .eq(
          "id",
          subscriptionId,
        );

      if (updateError) {
        console.error(
          "Subscription information request update error:",
          updateError,
        );

        return NextResponse.json(
          {
            error:
              "Unable to request additional information.",
          },
          {
            status: 500,
          },
        );
      }

      const {
        error: auditError,
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
            "subscription_information_requested",

          metadata: {
            note,
          },
        });

      if (auditError) {
        console.error(
          "Subscription information request audit error:",
          auditError,
        );
      }

      /*
       * Best-effort notification email.
       */
      if (investorEmail) {
        try {
          const email =
            subscriptionInformationRequestedEmail({
              investorName,

              opportunityTitle:
                opportunity.title,

              requestMessage:
                note,
            });

          await sendMail({
            to:
              investorEmail,

            subject:
              email.subject,

            text:
              email.text,

            html:
              email.html,
          });
        } catch (
          emailError
        ) {
          console.error(
            "Subscription information request email error:",
            emailError,
          );
        }
      }

      return NextResponse.json({
        success: true,

        action:
          "action_required",
      });
    }

    /*
     * --------------------------------------------------
     * 9. REJECT
     * --------------------------------------------------
     */
    if (
      body.action ===
      "reject"
    ) {
      if (!note) {
        return NextResponse.json(
          {
            error:
              "Enter a reason for rejecting the subscription.",
          },
          {
            status: 400,
          },
        );
      }

      const now =
        new Date().toISOString();

      const {
        error: updateError,
      } = await admin
        .from(
          "investment_subscriptions",
        )
        .update({
          status:
            "rejected",

          rejection_reason:
            note,

          admin_notes:
            null,

          reviewed_at:
            now,

          reviewed_by:
            user.id,

          updated_at:
            now,
        })
        .eq(
          "id",
          subscriptionId,
        );

      if (updateError) {
        console.error(
          "Subscription rejection update error:",
          updateError,
        );

        return NextResponse.json(
          {
            error:
              "Unable to reject subscription.",
          },
          {
            status: 500,
          },
        );
      }

      const {
        error: auditError,
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
            "subscription_rejected",

          metadata: {
            reason:
              note,
          },
        });

      if (auditError) {
        console.error(
          "Subscription rejection audit error:",
          auditError,
        );
      }

      if (investorEmail) {
        try {
          const email =
            subscriptionRejectedEmail({
              investorName,

              opportunityTitle:
                opportunity.title,

              reason:
                note,
            });

          await sendMail({
            to:
              investorEmail,

            subject:
              email.subject,

            text:
              email.text,

            html:
              email.html,
          });
        } catch (
          emailError
        ) {
          console.error(
            "Subscription rejection email error:",
            emailError,
          );
        }
      }

      return NextResponse.json({
        success: true,

        action:
          "rejected",
      });
    }

    return NextResponse.json(
      {
        error:
          "Invalid subscription review action.",
      },
      {
        status: 400,
      },
    );
  } catch (error) {
    console.error(
      "Subscription review API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while reviewing the subscription.",
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