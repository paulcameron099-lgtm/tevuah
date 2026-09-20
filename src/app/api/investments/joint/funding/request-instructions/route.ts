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
  getPaymentNotificationRecipient,
} from "@/src/lib/email/funding-email-recipients";

import {
  sendApplicationMail,
} from "@/src/lib/email/application-mailer";

import {
  companyJointPaymentInstructionsRequestedEmail,
} from "@/src/lib/email/investment-emails";

import {
  createClient,
} from "@/src/lib/supabase/server";


type Body = {
  fundingObligationId?: string;

  paymentMethod?:
    | "wire_transfer"
    | "bitcoin";
};


type RequestResult = {
  external_funding_id: string;
  joint_subscription_id: string;
  funding_obligation_id: string;

  payment_method:
    | "wire_transfer"
    | "bitcoin";

  principal_amount_cents:
    number | string;

  wire_charge_amount_cents:
    number | string;

  total_amount_due_cents:
    number | string;

  funding_status: string;

  requested_at: string;
};


function clean(
  value: unknown,
) {
  return typeof value === "string"
    ? value.trim()
    : "";
}


export async function POST(
  request: Request,
) {
  try {
    /*
     * --------------------------------------------------
     * 1. AUTHENTICATE INVESTOR
     * --------------------------------------------------
     */

    const user =
      await getCurrentUser();

    if (
      !user ||
      user.role !== "investor"
    ) {
      return NextResponse.json(
        {
          error:
            "Investor access required.",
        },
        {
          status: 401,
        },
      );
    }


    /*
     * --------------------------------------------------
     * 2. ACCOUNT ACCESS
     * --------------------------------------------------
     */

    const accountAccess =
      await checkAccountAccess(
        user.id,
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
     * --------------------------------------------------
     * 3. REQUEST BODY
     * --------------------------------------------------
     */

    const body =
      (await request.json()) as Body;

    const fundingObligationId =
      clean(
        body.fundingObligationId,
      );

    const paymentMethod =
      clean(
        body.paymentMethod,
      );


    if (!fundingObligationId) {
      return NextResponse.json(
        {
          error:
            "Funding obligation ID is required.",
        },
        {
          status: 400,
        },
      );
    }


    if (
      paymentMethod !==
        "wire_transfer" &&
      paymentMethod !==
        "bitcoin"
    ) {
      return NextResponse.json(
        {
          error:
            "Choose Wire Transfer or Bitcoin.",
        },
        {
          status: 400,
        },
      );
    }


    /*
     * --------------------------------------------------
     * 4. AUTHENTICATED SUPABASE CLIENT
     *
     * IMPORTANT:
     * Do NOT use createAdminClient here.
     *
     * The RPC binds the obligation to auth.uid().
     * --------------------------------------------------
     */

    const supabase =
      await createClient();


    /*
     * --------------------------------------------------
     * 5. CREATE FUNDING REQUEST
     *
     * Atomic DB work:
     *
     * external request
     * obligation -> funding_pending
     * joint -> funding
     * admin dashboard notification
     * --------------------------------------------------
     */

    const {
      data,
      error,
    } = await supabase.rpc(
      "request_joint_investment_payment_instructions",
      {
        p_funding_obligation_id:
          fundingObligationId,

        p_payment_method:
          paymentMethod,
      },
    );


    if (error) {
      console.error(
        "Joint payment instructions request RPC error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            error.message ||
            "Unable to request payment instructions.",
        },
        {
          status: 409,
        },
      );
    }


    const result =
      (
        Array.isArray(data)
          ? data[0]
          : data
      ) as RequestResult | null;


    if (!result) {
      return NextResponse.json(
        {
          error:
            "The funding request was created but no result was returned.",
        },
        {
          status: 500,
        },
      );
    }


    /*
     * --------------------------------------------------
     * 6. LOAD EMAIL DISPLAY INFORMATION
     *
     * This happens AFTER the financial DB transaction.
     *
     * Email failure must never invalidate the request.
     * --------------------------------------------------
     */

    const [
      profileResult,
      opportunityResult,
    ] =
      await Promise.all([
        supabase
          .from("profiles")
          .select(
            "first_name, last_name",
          )
          .eq(
            "id",
            user.id,
          )
          .maybeSingle(),

        supabase
          .from(
            "joint_investment_funding_obligations",
          )
          .select(`
            opportunity_id,
            investment_opportunities (
              title
            )
          `)
          .eq(
            "id",
            fundingObligationId,
          )
          .maybeSingle(),
      ]);


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


    /*
     * getCurrentUser() may or may not expose email
     * depending on your helper shape.
     *
     * Resolve it from authenticated Supabase auth.
     */

    const {
      data: authData,
    } =
      await supabase.auth.getUser();


    const investorEmail =
      authData.user?.email ??
      "Email unavailable";


    const opportunityRelation =
      opportunityResult.data
        ?.investment_opportunities;


    const opportunityTitle =
      Array.isArray(
        opportunityRelation,
      )
        ? opportunityRelation[0]
            ?.title
        : (
            opportunityRelation as
              | {
                  title?: string;
                }
              | null
              | undefined
          )?.title;


    /*
     * --------------------------------------------------
     * 7. COMPANY EMAIL
     * --------------------------------------------------
     */

    const companyRecipient =
      getPaymentNotificationRecipient();

    let companyEmailSent =
      false;


    if (companyRecipient) {
      const email =
        companyJointPaymentInstructionsRequestedEmail(
          {
            investorName,

            investorEmail,

            opportunityTitle:
              opportunityTitle ??
              "Investment Opportunity",

            paymentMethod:
              result.payment_method,

            principalAmountCents:
              Number(
                result.principal_amount_cents,
              ),

            wireChargeAmountCents:
              Number(
                result.wire_charge_amount_cents,
              ),

            totalAmountDueCents:
              Number(
                result.total_amount_due_cents,
              ),

            jointSubscriptionId:
              result.joint_subscription_id,

            externalFundingId:
              result.external_funding_id,

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


    /*
     * --------------------------------------------------
     * 8. SUCCESS
     * --------------------------------------------------
     */

    return NextResponse.json(
      {
        success: true,

        fundingRequest: {
          id:
            result.external_funding_id,

          jointSubscriptionId:
            result.joint_subscription_id,

          fundingObligationId:
            result.funding_obligation_id,

          paymentMethod:
            result.payment_method,

          principalAmountCents:
            Number(
              result.principal_amount_cents,
            ),

          wireChargeAmountCents:
            Number(
              result.wire_charge_amount_cents,
            ),

          totalAmountDueCents:
            Number(
              result.total_amount_due_cents,
            ),

          status:
            result.funding_status,

          requestedAt:
            result.requested_at,
        },

        companyEmailSent,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Joint payment instructions request API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to request payment instructions.",
      },
      {
        status: 500,
      },
    );
  }
}