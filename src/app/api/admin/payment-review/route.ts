import {
  NextResponse,
} from "next/server";

import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

import {
  investmentActivatedEmail,
} from "@/src/lib/email/templates";

import {
  sendMail,
} from "@/src/lib/email/mailer";

type ReviewPayload = {
  paymentId?: string;

  action?:
    | "verify"
    | "reject";

  verifiedAmount?: number;

  note?: string;
};

export async function POST(
  request: Request,
) {
  try {
    /*
     * ==================================================
     * 1. AUTHENTICATE ADMIN
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
     * 2. READ REQUEST
     * ==================================================
     */
    const body =
      (await request.json()) as ReviewPayload;

    const paymentId =
      body.paymentId?.trim();

    if (!paymentId) {
      return NextResponse.json(
        {
          error:
            "Payment ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      body.action !== "verify" &&
      body.action !== "reject"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid payment review action.",
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
     * 3. LOAD PAYMENT
     * ==================================================
     */
    const {
      data: payment,
      error: paymentError,
    } = await admin
      .from(
        "investment_payments",
      )
.select(
  `
  id,

  subscription_id,
  investor_id,
  opportunity_id,

  expected_amount,
  reported_amount,
  verified_amount,

  investor_reference,
  payment_reference,

  payment_method,

  status
  `,
)
      .eq(
        "id",
        paymentId,
      )
      .maybeSingle();

    if (
      paymentError ||
      !payment
    ) {
      console.error(
        "Payment review load error:",
        paymentError,
      );

      return NextResponse.json(
        {
          error:
            "Payment could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    /*
 * ==================================================
 * LOAD INVESTOR PAYMENT REPORT
 * ==================================================
 *
 * External payment evidence lives here.
 *
 * Wire:
 *   wire_reference is required
 *   uploaded proof is optional
 *
 * Bitcoin:
 *   bitcoin_transaction_hash is required
 *   uploaded proof is optional
 */
const {
  data: paymentReport,
  error: paymentReportError,
} = await admin
  .from("investment_payment_reports")
  .select(
    `
    id,
    payment_id,
    payment_method,
    wire_reference,
    bitcoin_transaction_hash,
    proof_bucket,
    proof_storage_path,
    investor_note,
    reported_at
    `,
  )
  .eq(
    "payment_id",
    payment.id,
  )
  .maybeSingle();

if (paymentReportError) {
  console.error(
    "Payment report lookup error:",
    paymentReportError,
  );

  return NextResponse.json(
    {
      error:
        "Unable to load the investor payment report.",
    },
    {
      status: 500,
    },
  );
}

    /*
 * ==================================================
 * LOAD INVESTOR FOR EMAIL
 * ==================================================
 */
const {
  data: investor,
  error: investorError,
} = await admin
  .from(
    "profiles",
  )
  .select(
    `
    id,
    first_name,
    last_name
    `,
  )
  .eq(
    "id",
    payment.investor_id,
  )
  .maybeSingle();

if (
  investorError ||
  !investor
) {
  console.error(
    "Payment investor profile lookup error:",
    investorError,
  );
}

const investorName =
  investor
    ? [
        investor.first_name,
        investor.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      "Investor"
    : "Investor";

/*
 * profiles does not contain the Auth email,
 * so retrieve it from Supabase Auth.
 */
const {
  data: authInvestorData,
  error: authInvestorError,
} =
  await admin.auth.admin.getUserById(
    payment.investor_id,
  );

if (authInvestorError) {
  console.error(
    "Payment investor Auth lookup error:",
    authInvestorError,
  );
}

const investorEmail =
  authInvestorData.user
    ?.email ??
  null;

/*
 * ==================================================
 * LOAD OPPORTUNITY FOR EMAIL
 * ==================================================
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
    payment.opportunity_id,
  )
  .maybeSingle();

if (
  opportunityError ||
  !opportunity
) {
  console.error(
    "Payment opportunity lookup error:",
    opportunityError,
  );
}

    /*
     * ==================================================
     * 4. PREVENT DOUBLE VERIFICATION
     * ==================================================
     */
    if (
      payment.status ===
      "verified"
    ) {
      return NextResponse.json(
        {
          error:
            "This payment has already been verified.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * ==================================================
     * 5. VERIFY PAYMENT
     * ==================================================
     */
    if (
      body.action ===
      "verify"
    ) {
      /*
       * Only payment submissions currently
       * awaiting review can be verified.
       */
      if (
        payment.status !==
          "pending_verification" &&
        payment.status !==
          "payment_reported"
      ) {
        return NextResponse.json(
          {
            error:
              "This payment is not currently awaiting verification.",
          },
          {
            status: 409,
          },
        );
      }

      /*
 * ==================================================
 * PAYMENT EVIDENCE VALIDATION
 * ==================================================
 *
 * Receipt/proof upload is OPTIONAL.
 *
 * Wire Transfer:
 *   wire reference is required.
 *
 * Bitcoin:
 *   transaction hash is required.
 */

if (!paymentReport) {
  return NextResponse.json(
    {
      error:
        "The investor payment report could not be found.",
    },
    {
      status: 400,
    },
  );
}

if (
  payment.payment_method === "wire_transfer" &&
  !paymentReport.wire_reference?.trim()
) {
  return NextResponse.json(
    {
      error:
        "A wire transfer reference is required before verification.",
    },
    {
      status: 400,
    },
  );
}

if (
  payment.payment_method === "bitcoin" &&
  !paymentReport.bitcoin_transaction_hash?.trim()
) {
  return NextResponse.json(
    {
      error:
        "A Bitcoin transaction hash is required before verification.",
    },
    {
      status: 400,
    },
  );
}

if (
  payment.payment_method !== "wire_transfer" &&
  payment.payment_method !== "bitcoin"
) {
  return NextResponse.json(
    {
      error:
        "This external payment method cannot be verified here.",
    },
    {
      status: 400,
    },
  );
}
      /*
       * Investor must have reported an amount.
       */
      if (
        payment.reported_amount ==
        null
      ) {
        return NextResponse.json(
          {
            error:
              "The investor has not reported a payment amount.",
          },
          {
            status: 400,
          },
        );
      }

      const verifiedAmount =
        body.verifiedAmount !=
        null
          ? Number(
              body.verifiedAmount,
            )
          : Number(
              payment.reported_amount,
            );

      if (
        !Number.isFinite(
          verifiedAmount,
        ) ||
        verifiedAmount <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "Enter a valid verified payment amount.",
          },
          {
            status: 400,
          },
        );
      }

      /*
       * First version requires exact
       * commitment funding.
       */
      if (
        verifiedAmount !==
        Number(
          payment.expected_amount,
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Verified amount must equal the approved commitment amount.",
          },
          {
            status: 400,
          },
        );
      }

      /*
       * ==================================================
       * ATOMIC DATABASE VERIFICATION
       * ==================================================
       *
       * This RPC:
       *
       * payment → verified
       * investment position → created
       * total_funded → increased
       * investor_count → increased
       * audit → created
       */
      const {
        data: verificationResult,
        error: verificationError,
      } = await admin.rpc(
        "verify_investment_payment",
        {
          p_payment_id:
            payment.id,

          p_admin_id:
            user.id,

          p_verified_amount:
            verifiedAmount,
        },
      );

      if (
        verificationError
      ) {
        console.error(
          "verify_investment_payment RPC error:",
          verificationError,
        );

        return NextResponse.json(
          {
            error:
              verificationError.message ||
              "Unable to verify payment.",
          },
          {
            status: 409,
          },
        );
      }

      /*
 * ==================================================
 * INVESTMENT ACTIVATION EMAIL
 * ==================================================
 *
 * IMPORTANT:
 *
 * Payment verification has already succeeded.
 *
 * Therefore email is best-effort.
 * Email failure must NEVER undo or report
 * payment verification as failed.
 */
if (
  investorEmail &&
  opportunity
) {
  try {
    const now =
      new Date();

    const email =
      investmentActivatedEmail({
        investorName,

        opportunityTitle:
          opportunity.title,

        principalDisplay:
          formatMoney(
            verifiedAmount,
          ),

        fundedDateDisplay:
          formatDateTime(
            now,
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
      "Investment activation email error:",
      emailError,
    );
  }
}


      return NextResponse.json({
        success: true,

        action:
          "verified",

        result:
          verificationResult,
      });
    }

    /*
     * ==================================================
     * 6. REJECT PAYMENT
     * ==================================================
     */
    if (
      body.action ===
      "reject"
    ) {
      /*
       * Only a payment awaiting review
       * can be rejected.
       */
      if (
        payment.status !==
          "pending_verification" &&
        payment.status !==
          "payment_reported"
      ) {
        return NextResponse.json(
          {
            error:
              "This payment is not currently awaiting verification.",
          },
          {
            status: 409,
          },
        );
      }

      const note =
        body.note
          ?.trim() ??
        "";

      if (!note) {
        return NextResponse.json(
          {
            error:
              "Enter a reason for rejecting this payment submission.",
          },
          {
            status: 400,
          },
        );
      }

      const now =
        new Date().toISOString();

      /*
       * --------------------------------------------------
       * UPDATE PAYMENT
       * --------------------------------------------------
       */
      const {
        data: rejectedPayment,
        error: rejectionError,
      } = await admin
        .from(
          "investment_payments",
        )
        .update({
          status:
            "rejected",

          rejection_reason:
            note,

          admin_notes:
            note,

          verified_amount:
            null,

          verified_at:
            null,

          verified_by:
            null,

          updated_at:
            now,
        })
        .eq(
          "id",
          payment.id,
        )
        .select(
          `
          id,
          status,
          rejection_reason,
          updated_at
          `,
        )
        .single();

      if (
        rejectionError ||
        !rejectedPayment
      ) {
        console.error(
          "Payment rejection database error:",
          rejectionError,
        );

        return NextResponse.json(
          {
            error:
              "Unable to reject payment.",
        },
        {
          status: 500,
        },
      );
      }

      /*
       * --------------------------------------------------
       * AUDIT
       * --------------------------------------------------
       */
      const {
        error: auditError,
      } = await admin
        .from(
          "investment_payment_audit",
        )
        .insert({
          payment_id:
            payment.id,

          actor_id:
            user.id,

          action:
            "payment_rejected",

          metadata: {
            reason:
              note,

            subscriptionId:
              payment.subscription_id,

            opportunityId:
              payment.opportunity_id,

            investorReference:
              payment.investor_reference,

            paymentReference:
              payment.payment_reference,
          },

          created_at:
            now,
        });

      if (auditError) {
        console.error(
          "Payment rejection audit error:",
          auditError,
        );
      }

      return NextResponse.json({
        success: true,

        action:
          "rejected",

        payment:
          rejectedPayment,
      });
    }

    return NextResponse.json(
      {
        error:
          "Invalid payment review action.",
      },
      {
        status: 400,
      },
    );
  } catch (error) {
    console.error(
      "Admin payment review API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while reviewing the payment.",
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

function formatDateTime(
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

      hour:
        "numeric",

      minute:
        "2-digit",

      timeZone:
        "UTC",
    },
  ).format(
    value,
  );
}