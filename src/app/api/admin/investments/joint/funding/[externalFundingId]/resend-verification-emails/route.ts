import {
  NextResponse,
} from "next/server";

import {
  requireAdmin,
} from "@/src/lib/auth/require-admin";

import {
  sendApplicationMail,
} from "@/src/lib/email/application-mailer";

import {
  investorJointMemberPaymentVerifiedEmail,
  investorJointPaymentVerifiedEmail,
} from "@/src/lib/email/investment-emails";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";


export const dynamic = "force-dynamic";


type RouteContext = {
  params: Promise<{
    externalFundingId: string;
  }>;
};


const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


export async function POST(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  try {
    await requireAdmin();

    const {
      externalFundingId,
    } = await params;


    if (
      !externalFundingId ||
      !UUID_PATTERN.test(
        externalFundingId,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Valid external funding ID is required.",
        },
        {
          status: 400,
        },
      );
    }


    /*
     * --------------------------------------------------
     * READ ONLY.
     *
     * This endpoint NEVER calls the verification RPC.
     * It can only send email for an ALREADY VERIFIED
     * canonical funding record.
     * --------------------------------------------------
     */

    const admin =
      createAdminClient();


    const {
      data: funding,
      error: fundingError,
    } =
      await admin
        .from(
          "joint_investment_external_funding",
        )
        .select(`
          id,
          joint_subscription_id,
          investor_id,
          opportunity_id,
          payment_method,
          principal_amount_cents,
          verified_principal_amount_cents,
          status,
          verified_at
        `)
        .eq(
          "id",
          externalFundingId,
        )
        .maybeSingle();


    if (
      fundingError ||
      !funding
    ) {
      return NextResponse.json(
        {
          error:
            fundingError?.message ||
            "Funding record not found.",
        },
        {
          status: 404,
        },
      );
    }


    /*
     * --------------------------------------------------
     * STRICT VERIFIED-STATE GATE
     * --------------------------------------------------
     */

    if (
      funding.status !== "verified" ||
      !funding.verified_at
    ) {
      return NextResponse.json(
        {
          error:
            "Verification emails can only be sent for a verified payment.",
        },
        {
          status: 409,
        },
      );
    }


    if (
      Number(
        funding
          .verified_principal_amount_cents,
      ) !==
      Number(
        funding.principal_amount_cents,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Verified principal does not match canonical payment principal.",
        },
        {
          status: 409,
        },
      );
    }


    /*
     * --------------------------------------------------
     * LOAD MEMBERS
     * --------------------------------------------------
     */

    const {
      data: members,
      error: membersError,
    } =
      await admin
        .from(
          "joint_investment_members",
        )
        .select(`
          investor_id,
          member_slot
        `)
        .eq(
          "joint_subscription_id",
          funding.joint_subscription_id,
        )
        .order(
          "member_slot",
          {
            ascending: true,
          },
        );


    if (
      membersError ||
      !members
    ) {
      return NextResponse.json(
        {
          error:
            membersError?.message ||
            "Joint members unavailable.",
        },
        {
          status: 500,
        },
      );
    }


    const otherMember =
      members.find(
        (member) =>
          member.investor_id !==
          funding.investor_id,
      );


    /*
     * --------------------------------------------------
     * LOAD AUTH EMAILS / PROFILES / OPPORTUNITY
     * --------------------------------------------------
     */

    const [
      fundedAuthResult,
      otherAuthResult,
      fundedProfileResult,
      otherProfileResult,
      opportunityResult,
    ] =
      await Promise.all([
        admin.auth.admin.getUserById(
          funding.investor_id,
        ),

        otherMember
          ? admin.auth.admin.getUserById(
              otherMember.investor_id,
            )
          : Promise.resolve(null),

        admin
          .from("profiles")
          .select(
            "first_name, last_name",
          )
          .eq(
            "id",
            funding.investor_id,
          )
          .maybeSingle(),

        otherMember
          ? admin
              .from("profiles")
              .select(
                "first_name, last_name",
              )
              .eq(
                "id",
                otherMember.investor_id,
              )
              .maybeSingle()
          : Promise.resolve(null),

        admin
          .from(
            "investment_opportunities",
          )
          .select("title")
          .eq(
            "id",
            funding.opportunity_id,
          )
          .maybeSingle(),
      ]);


    const fundedInvestorEmail =
      fundedAuthResult?.data
        ?.user?.email ?? null;


    const otherInvestorEmail =
      otherAuthResult?.data
        ?.user?.email ?? null;


    const fundedInvestorName =
      [
        fundedProfileResult
          ?.data?.first_name,

        fundedProfileResult
          ?.data?.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      "Investor";


    const otherInvestorName =
      [
        otherProfileResult
          ?.data?.first_name,

        otherProfileResult
          ?.data?.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      "Investor";


    const opportunityTitle =
      opportunityResult.data
        ?.title ||
      "Investment Opportunity";


    const origin =
      new URL(
        request.url,
      ).origin;


    /*
     * --------------------------------------------------
     * SEND BOTH EMAILS
     * --------------------------------------------------
     */

    let investorEmailSent =
      false;

    let otherMemberEmailSent =
      false;


    if (fundedInvestorEmail) {
      const email =
        investorJointPaymentVerifiedEmail(
          {
            investorName:
              fundedInvestorName,

            opportunityTitle,

            principalAmountCents:
              Number(
                funding
                  .verified_principal_amount_cents,
              ),

            paymentMethod:
              funding.payment_method as
                | "wire_transfer"
                | "bitcoin",

            jointSubscriptionId:
              funding.joint_subscription_id,

            origin,
          },
        );


      investorEmailSent =
        (
          await sendApplicationMail(
            {
              to:
                fundedInvestorEmail,

              ...email,
            },
          )
        ).sent;
    }


    if (
      otherMember &&
      otherInvestorEmail
    ) {
      const email =
        investorJointMemberPaymentVerifiedEmail(
          {
            investorName:
              otherInvestorName,

            fundedMemberName:
              fundedInvestorName,

            opportunityTitle,

            jointSubscriptionId:
              funding.joint_subscription_id,

            origin,
          },
        );


      otherMemberEmailSent =
        (
          await sendApplicationMail(
            {
              to:
                otherInvestorEmail,

              ...email,
            },
          )
        ).sent;
    }


  return NextResponse.json(
  {
    success: true,

    externalFundingId:
      funding.id,

    paymentStatus:
      funding.status,

    verifiedAt:
      funding.verified_at,

    investorEmailSent,
    otherMemberEmailSent,

    // TEMPORARY DEBUG ONLY
    debugRecipients: {
      fundedInvestorEmail,
      otherInvestorEmail,
    },
  },
  {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  },
);
  } catch (error) {
    console.error(
      "Joint verification email recovery error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send verification emails.",
      },
      {
        status: 500,
      },
    );
  }
}