import { NextResponse } from "next/server";

import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

import {
  sendApplicationMail,
} from "@/src/lib/email/application-mailer";

import {
  investorSubscriptionActionRequiredEmail,
  investorSubscriptionApprovedEmail,
  investorSubscriptionRejectedEmail,
} from "@/src/lib/email/investment-emails";

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
  action: ReviewAction;
  note?: string;
};

type ReservationReleaseResult = {
  reservation_id: string;
  reservation_type: string;
  parent_id: string;
  parent_status: string;
  reservation_status: string;
  released_at: string | null;
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
        user.role !== "admin" &&
        user.role !== "super_admin"
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
            paymentCreateError,
          );

          /*
           * Do not falsely say approval failed.
           *
           * Subscription approval already succeeded.
           * Log this so it can be repaired.
           */
        }
      }

      /*
       * Investor approval email.
       *
       * Approval remains valid even when SMTP fails.
       */

      let emailSent = false;

      let emailWarning:
        | string
        | undefined;

      if (investorEmail) {
        const email =
          investorSubscriptionApprovedEmail({
            investorName,

            opportunityTitle:
              opportunity.title,

            commitmentAmountCents:
              Number(
                subscription.commitment_amount,
              ),

            subscriptionId,

            origin:
              new URL(
                request.url,
              ).origin,
          });

        const delivery =
          await sendApplicationMail({
            to:
              investorEmail,

            ...email,
          });

        emailSent =
          delivery.sent;

        emailWarning =
          delivery.sent
            ? undefined
            : delivery.error;
      } else {
        emailWarning =
          "Investor email address is missing.";
      }

      return NextResponse.json({
        success: true,

        action:
          "approved",

        result:
          data,

        emailSent,
        emailWarning,
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
            investorSubscriptionActionRequiredEmail({
              investorName,

              opportunityTitle:
                opportunity.title,

              reason:
                note,

              subscriptionId,

              origin:
                new URL(
                  request.url,
                ).origin,
            });

          await sendApplicationMail({
            to:
              investorEmail,

            ...email,
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
     *
     * IMPORTANT:
     *
     * Rejection MUST go through
     * admin_release_investment_reservation().
     *
     * That RPC atomically:
     *
     * - verifies the authenticated admin
     * - verifies no funded/verified investment exists
     * - releases the active capacity reservation
     * - transitions the subscription to rejected
     *
     * We must NOT directly update the subscription
     * to rejected here.
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

      if (note.length < 5) {
        return NextResponse.json(
          {
            error:
              "Enter a clear rejection reason of at least 5 characters.",
          },
          {
            status: 400,
          },
        );
      }

      /*
       * IMPORTANT:
       *
       * Use the cookie-authenticated server client,
       * NOT createAdminClient(), because the lifecycle
       * RPC intentionally validates auth.uid().
       */

      const supabase =
        await createClient();

      const {
        data: releaseData,
        error: releaseError,
      } = await supabase.rpc(
        "admin_release_investment_reservation",
        {
          p_subscription_id:
            subscriptionId,

          p_joint_subscription_id:
            null,

          p_reason:
            note,

          p_final_status:
            "rejected",
        },
      );

      if (releaseError) {
        console.error(
          "Subscription rejection/release RPC error:",
          releaseError,
        );

        const normalized =
          releaseError.message.toLowerCase();

        const status =
          normalized.includes(
            "administrator access",
          )
            ? 403
            : normalized.includes(
                  "authentication required",
                )
              ? 401
              : normalized.includes(
                    "not found",
                  )
                ? 404
                : 409;

        return NextResponse.json(
          {
            error:
              releaseError.message ||
              "Unable to reject subscription.",
          },
          {
            status,
          },
        );
      }

      const releaseResult =
        (
          Array.isArray(releaseData)
            ? releaseData[0] ?? null
            : releaseData
        ) as
          | ReservationReleaseResult
          | null;

      /*
       * Defensive post-condition.
       *
       * A successful rejection must return:
       *
       * individual_subscription
       * rejected
       * released/cancelled reservation
       */

      if (
        !releaseResult ||
        releaseResult.parent_id !==
          subscriptionId ||
        releaseResult.parent_status !==
          "rejected" ||
        releaseResult.reservation_type !==
          "individual_subscription" ||
        ![
          "released",
          "cancelled",
        ].includes(
          releaseResult.reservation_status,
        )
      ) {
        console.error(
          "Unexpected subscription rejection RPC result:",
          releaseResult,
        );

        return NextResponse.json(
          {
            error:
              "Subscription rejection returned an unexpected lifecycle state.",
          },
          {
            status: 409,
          },
        );
      }

      /*
       * --------------------------------------------------
       * REJECTION AUDIT
       * --------------------------------------------------
       *
       * The financial/capacity transition has already
       * completed atomically in the RPC.
       *
       * Audit insertion is best-effort here so an audit
       * delivery issue cannot corrupt reservation state.
       */

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

            reservation_id:
              releaseResult.reservation_id,

            reservation_status:
              releaseResult.reservation_status,

            released_at:
              releaseResult.released_at,

            capacity_released:
              releaseResult.reservation_status ===
              "released",
          },
        });

      if (auditError) {
        console.error(
          "Subscription rejection audit error:",
          auditError,
        );
      }

      /*
       * --------------------------------------------------
       * REJECTION EMAIL
       * --------------------------------------------------
       *
       * Best-effort only.
       *
       * SMTP failure must never undo a valid database
       * lifecycle transition.
       */

      if (investorEmail) {
        try {
          const email =
            investorSubscriptionRejectedEmail({
              investorName,

              opportunityTitle:
                opportunity.title,

              reason:
                note,

              subscriptionId,

              origin:
                new URL(
                  request.url,
                ).origin,
            });

          await sendApplicationMail({
            to:
              investorEmail,

            ...email,
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

        reservationId:
          releaseResult.reservation_id,

        reservationStatus:
          releaseResult.reservation_status,

        capacityReleased:
          releaseResult.reservation_status ===
          "released",
      });
    }

    /*
     * --------------------------------------------------
     * 10. INVALID ACTION
     * --------------------------------------------------
     */

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
          error instanceof Error
            ? error.message
            : "Something went wrong while reviewing the subscription.",
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