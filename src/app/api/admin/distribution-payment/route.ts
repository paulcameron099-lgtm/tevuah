import {
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  sendApplicationMail,
} from "@/src/lib/email/application-mailer";

import {
  investorDistributionPaidEmail,
} from "@/src/lib/email/investment-emails";

import {
  createInvestorNotification,
} from "@/src/lib/notifications/create-investor-notification";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type Payload = {
  action?:
    | "start_processing"
    | "mark_paid";

  distributionId?: string;

  investorDistributionId?: string;

  paymentReference?: string;
};

export async function POST(
  request: Request,
) {
  try {
    /*
     * ==================================================
     * 1. ADMIN AUTH
     * ==================================================
     */
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
      user.role !== "admin" &&
      user.role !== "super_admin"
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

    /*
     * ==================================================
     * 2. REQUEST
     * ==================================================
     */
    const body =
      (await request.json()) as Payload;

    const admin =
      createAdminClient();

    /*
     * ==================================================
     * 3. START PROCESSING
     * ==================================================
     *
     * No investor email/notification is sent here.
     *
     * Publication/approval already communicates the
     * distribution to the investor.
     */
    if (
      body.action ===
      "start_processing"
    ) {
      const distributionId =
        body.distributionId?.trim();

      if (!distributionId) {
        return NextResponse.json(
          {
            error:
              "Distribution ID is required.",
          },
          {
            status: 400,
          },
        );
      }

      const {
        data,
        error,
      } = await admin.rpc(
        "start_distribution_processing",
        {
          p_distribution_id:
            distributionId,

          p_admin_id:
            user.id,
        },
      );

      if (error) {
        console.error(
          "start_distribution_processing RPC error:",
          error,
        );

        return NextResponse.json(
          {
            error:
              error.message ??
              "Unable to start distribution processing.",
          },
          {
            status: 409,
          },
        );
      }

      return NextResponse.json({
        success: true,

        action:
          "start_processing",

        result:
          data,
      });
    }

    /*
     * ==================================================
     * 4. MARK INDIVIDUAL INVESTOR DISTRIBUTION PAID
     * ==================================================
     */
    if (
      body.action ===
      "mark_paid"
    ) {
      const investorDistributionId =
        body.investorDistributionId?.trim();

      const paymentReference =
        body.paymentReference?.trim();

      if (
        !investorDistributionId
      ) {
        return NextResponse.json(
          {
            error:
              "Investor distribution ID is required.",
          },
          {
            status: 400,
          },
        );
      }

      if (!paymentReference) {
        return NextResponse.json(
          {
            error:
              "Payment reference is required.",
          },
          {
            status: 400,
          },
        );
      }

      /*
       * --------------------------------------------------
       * LOAD INDIVIDUAL INVESTOR ALLOCATION
       * --------------------------------------------------
       *
       * IMPORTANT:
       *
       * net_amount is the amount belonging to THIS
       * investor.
       *
       * Never use the parent distribution total when
       * communicating an individual investor payment.
       */
      const {
        data: allocation,
        error:
          allocationError,
      } = await admin
        .from(
          "investor_distributions",
        )
        .select(
          `
          id,
          distribution_id,
          investor_id,
          net_amount,
          status
          `,
        )
        .eq(
          "id",
          investorDistributionId,
        )
        .maybeSingle();

      if (
        allocationError ||
        !allocation
      ) {
        console.error(
          "Investor distribution allocation lookup error:",
          allocationError,
        );

        return NextResponse.json(
          {
            error:
              "Investor distribution allocation could not be found.",
          },
          {
            status: 404,
          },
        );
      }

      if (
        allocation.status ===
        "paid"
      ) {
        return NextResponse.json(
          {
            error:
              "This investor distribution has already been paid.",
          },
          {
            status: 409,
          },
        );
      }

      if (
        allocation.status !==
        "processing"
      ) {
        return NextResponse.json(
          {
            error:
              "This investor distribution is not currently processing.",
          },
          {
            status: 409,
          },
        );
      }

      /*
       * --------------------------------------------------
       * LOAD PARENT DISTRIBUTION
       * --------------------------------------------------
       */
      const {
        data: distribution,
        error:
          distributionError,
      } = await admin
        .from(
          "investment_distributions",
        )
        .select(
          `
          id,
          opportunity_id,
          title,
          distribution_type,
          currency
          `,
        )
        .eq(
          "id",
          allocation.distribution_id,
        )
        .maybeSingle();

      if (
        distributionError ||
        !distribution
      ) {
        console.error(
          "Distribution lookup error:",
          distributionError,
        );

        return NextResponse.json(
          {
            error:
              "Distribution could not be found.",
          },
          {
            status: 404,
          },
        );
      }

      /*
       * --------------------------------------------------
       * LOAD OPPORTUNITY
       * --------------------------------------------------
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
          title
          `,
        )
        .eq(
          "id",
          distribution.opportunity_id,
        )
        .maybeSingle();

      if (
        opportunityError ||
        !opportunity
      ) {
        console.error(
          "Distribution opportunity lookup error:",
          opportunityError,
        );

        return NextResponse.json(
          {
            error:
              "Distribution opportunity could not be found.",
          },
          {
            status: 404,
          },
        );
      }

      /*
       * ==================================================
       * 5. CANONICAL PAID TRANSACTION
       * ==================================================
       *
       * The database RPC must succeed BEFORE any
       * notification/email is sent.
       */
      const {
        data,
        error,
      } = await admin.rpc(
        "mark_investor_distribution_paid",
        {
          p_investor_distribution_id:
            investorDistributionId,

          p_admin_id:
            user.id,

          p_payment_reference:
            paymentReference,
        },
      );

      if (error) {
        console.error(
          "mark_investor_distribution_paid RPC error:",
          error,
        );

        return NextResponse.json(
          {
            error:
              error.message ??
              "Unable to mark investor distribution as paid.",
          },
          {
            status: 409,
          },
        );
      }

      /*
       * ==================================================
       * 6. PAID DASHBOARD NOTIFICATION
       * ==================================================
       */
      const amountCents =
        Number(
          allocation.net_amount,
        );

      const currency =
        distribution.currency ??
        "USD";

      const distributionPath =
        "/dashboard/distributions";

      const readableType =
        humanizeDistributionType(
          distribution.distribution_type,
        );

      const amountDisplay =
        formatMoney(
          amountCents,
          currency,
        );

      const notificationResult =
        await createInvestorNotification({
          investorId:
            allocation.investor_id,

          notificationType:
            "distribution",

          eventKey:
            `distribution-paid:${allocation.id}`,

          title:
            "Distribution payment completed",

          message:
            `${distribution.title} (${readableType}) for ${opportunity.title} has been paid. Amount: ${amountDisplay}. Payment reference: ${paymentReference}.`,

          actionLabel:
            "View distributions",

          actionPath:
            distributionPath,

          sourceType:
            "investor_distribution",

          sourceId:
            allocation.id,
        });

      /*
       * ==================================================
       * 7. PAID EMAIL
       * ==================================================
       *
       * Email is best-effort because the payment RPC
       * has already succeeded.
       */
      let emailSent =
        false;

      try {
        const [
          authResult,
          profileResult,
        ] = await Promise.all([
          admin.auth.admin.getUserById(
            allocation.investor_id,
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
              allocation.investor_id,
            )
            .maybeSingle(),
        ]);

        const investorEmail =
          authResult.data.user
            ?.email ??
          null;

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

        if (investorEmail) {
          const origin =
            new URL(
              request.url,
            ).origin;

          const email =
            investorDistributionPaidEmail({
              investorName,

              opportunityTitle:
                opportunity.title,

              distributionTitle:
                distribution.title,

              distributionType:
                distribution.distribution_type,

              amountCents,

              paymentReference,

              paidAt:
                formatDate(
                  new Date(),
                ),

              dashboardUrl:
                `${origin}${distributionPath}`,
            });

          emailSent =
            (
              await sendApplicationMail({
                to:
                  investorEmail,

                ...email,
              })
            ).sent;
        }
      } catch (emailError) {
        /*
         * Never report the distribution payment as
         * failed because email delivery failed.
         */
        console.error(
          "Distribution paid email error:",
          emailError,
        );
      }

      /*
       * ==================================================
       * 8. SUCCESS
       * ==================================================
       */
      return NextResponse.json({
        success: true,

        action:
          "mark_paid",

        result:
          data,

        notificationCreated:
          notificationResult.created,

        emailSent,
      });
    }

    /*
     * ==================================================
     * 9. INVALID ACTION
     * ==================================================
     */
    return NextResponse.json(
      {
        error:
          "Invalid distribution payment action.",
      },
      {
        status: 400,
      },
    );
  } catch (error) {
    console.error(
      "Distribution payment API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while processing the distribution.",
      },
      {
        status: 500,
      },
    );
  }
}

function humanizeDistributionType(
  value:
    | string
    | null
    | undefined,
) {
  if (!value) {
    return "Distribution";
  }

  return value
    .replaceAll(
      "_",
      " ",
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function formatMoney(
  cents: number,
  currency: string,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style:
        "currency",

      currency,

      minimumFractionDigits:
        2,

      maximumFractionDigits:
        2,
    },
  ).format(
    cents / 100,
  );
}

function formatDate(
  value: Date,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      year:
        "numeric",

      month:
        "long",

      day:
        "numeric",
    },
  ).format(
    value,
  );
}