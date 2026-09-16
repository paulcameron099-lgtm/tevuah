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
  investorDistributionPublishedEmail,
} from "@/src/lib/email/investment-emails";

import {
  createInvestorNotification,
} from "@/src/lib/notifications/create-investor-notification";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type Payload = {
  distributionId?: string;
};

type AllocationCommunicationResult = {
  allocationId: string;

  investorId: string;

  notificationCreated:
    boolean;

  emailSent:
    boolean;
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
     * 2. REQUEST BODY
     * ==================================================
     */
    const body =
      (await request.json()) as Payload;

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

    const admin =
      createAdminClient();

    /*
     * ==================================================
     * 3. LOAD DISTRIBUTION
     * ==================================================
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
        record_date,
        payment_date,
        total_distribution_amount,
        currency,
        status
        `,
      )
      .eq(
        "id",
        distributionId,
      )
      .maybeSingle();

    if (
      distributionError ||
      !distribution
    ) {
      console.error(
        "Approve distribution lookup error:",
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
     * ==================================================
     * 4. STATUS CHECK
     * ==================================================
     */
    if (
      distribution.status ===
      "approved"
    ) {
      return NextResponse.json(
        {
          error:
            "This distribution has already been approved.",
        },
        {
          status: 409,
        },
      );
    }

    if (
      distribution.status !==
      "draft"
    ) {
      return NextResponse.json(
        {
          error:
            "Only draft distributions can be approved.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * ==================================================
     * 5. BASIC AMOUNT CHECK
     * ==================================================
     */
    if (
      Number(
        distribution.total_distribution_amount,
      ) <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Distribution amount must be greater than zero.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ==================================================
     * 6. LOAD OPPORTUNITY
     * ==================================================
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
            "Investment opportunity could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * ==================================================
     * 7. ATOMIC APPROVAL / PUBLICATION
     * ==================================================
     *
     * RPC handles:
     *
     * - position eligibility
     * - proportional allocation
     * - rounding remainder
     * - investor_distribution inserts
     * - parent distribution approval
     *
     * No investor communication occurs until this RPC
     * succeeds.
     */
    const {
      data: approvalResult,
      error:
        approvalError,
    } = await admin.rpc(
      "approve_investment_distribution",
      {
        p_distribution_id:
          distribution.id,

        p_admin_id:
          user.id,
      },
    );

    if (approvalError) {
      console.error(
        "approve_investment_distribution RPC error:",
        approvalError,
      );

      return NextResponse.json(
        {
          error:
            approvalError.message ??
            "Unable to approve distribution.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * ==================================================
     * 8. LOAD INDIVIDUAL INVESTOR ALLOCATIONS
     * ==================================================
     *
     * IMPORTANT:
     *
     * net_amount is the investor-facing amount.
     *
     * total_distribution_amount belongs to the whole
     * distribution and must NOT be shown as an
     * individual investor's amount.
     */
    const {
      data: allocationSummary,
      error:
        allocationError,
    } = await admin
      .from(
        "investor_distributions",
      )
      .select(
        `
        id,
        investor_id,
        gross_amount,
        withholding_amount,
        net_amount,
        status
        `,
      )
      .eq(
        "distribution_id",
        distribution.id,
      );

    if (allocationError) {
      /*
       * Approval has already succeeded.
       *
       * Do not claim approval failed just because the
       * post-approval communication lookup failed.
       */
      console.error(
        "Approved distribution allocation lookup error:",
        allocationError,
      );

      return NextResponse.json({
        success: true,

        distributionId:
          distribution.id,

        investorCount:
          0,

        totalAllocated:
          0,

        result:
          approvalResult,

        communicationsProcessed:
          false,

        communicationError:
          "Distribution was approved, but investor communications could not be prepared.",
      });
    }

    const allocations =
      allocationSummary ??
      [];

    const totalAllocated =
      allocations.reduce(
        (
          total,
          allocation,
        ) =>
          total +
          Number(
            allocation.gross_amount,
          ),
        0,
      );

    /*
     * ==================================================
     * 9. INVESTOR COMMUNICATIONS
     * ==================================================
     */
    const distributionPath =
      "/dashboard/distributions";

    const origin =
      new URL(
        request.url,
      ).origin;

    const readableType =
      humanizeDistributionType(
        distribution.distribution_type,
      );

    const currency =
      distribution.currency ??
      "USD";

    const communicationResults:
      AllocationCommunicationResult[] =
        [];

    /*
     * Process each investor allocation independently.
     *
     * One investor's bad/missing email must not stop
     * another investor from receiving their notification.
     */
    for (
      const allocation
      of allocations
    ) {
      const amountCents =
        Number(
          allocation.net_amount,
        );

      const amountDisplay =
        formatMoney(
          amountCents,
          currency,
        );

      /*
       * ----------------------------------------------
       * DASHBOARD NOTIFICATION
       * ----------------------------------------------
       */
      const notificationResult =
        await createInvestorNotification({
          investorId:
            allocation.investor_id,

          notificationType:
            "distribution",

          eventKey:
            `distribution-published:${allocation.id}`,

          title:
            "New distribution published",

          message:
            `${distribution.title} (${readableType}) has been published for ${opportunity.title}. Your distribution amount is ${amountDisplay}.`,

          actionLabel:
            "View distribution",

          actionPath:
            distributionPath,

          sourceType:
            "investor_distribution",

          sourceId:
            allocation.id,
        });

      /*
       * ----------------------------------------------
       * EMAIL
       * ----------------------------------------------
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
          const email =
            investorDistributionPublishedEmail({
              investorName,

              opportunityTitle:
                opportunity.title,

              distributionTitle:
                distribution.title,

              distributionType:
                distribution.distribution_type,

              amountCents,

              paymentDate:
                distribution.payment_date,

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
         * Approval/publication already succeeded.
         *
         * Email failure must not undo or falsely report
         * the distribution approval as failed.
         */
        console.error(
          `Distribution publication email error for allocation ${allocation.id}:`,
          emailError,
        );
      }

      communicationResults.push({
        allocationId:
          allocation.id,

        investorId:
          allocation.investor_id,

        notificationCreated:
          notificationResult.created,

        emailSent,
      });
    }

    /*
     * ==================================================
     * 10. COMMUNICATION SUMMARY
     * ==================================================
     */
    const notificationsCreated =
      communicationResults.filter(
        (result) =>
          result.notificationCreated,
      ).length;

    const emailsSent =
      communicationResults.filter(
        (result) =>
          result.emailSent,
      ).length;

    /*
     * ==================================================
     * 11. SUCCESS
     * ==================================================
     */
    return NextResponse.json({
      success: true,

      distributionId:
        distribution.id,

      investorCount:
        allocations.length,

      totalAllocated,

      notificationsCreated,

      emailsSent,

      communicationsProcessed:
        true,

      result:
        approvalResult,
    });
  } catch (error) {
    console.error(
      "Approve distribution API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while approving the distribution.",
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