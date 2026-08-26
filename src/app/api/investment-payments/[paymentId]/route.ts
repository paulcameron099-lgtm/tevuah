import {
  randomUUID,
} from "crypto";

import {
  NextResponse,
} from "next/server";

import { checkAccountAccess } from "@/src/lib/auth/account-status";
import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    paymentId: string;
  }>;
};

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_TYPES =
  new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

function dollarsToCents(
  value: number,
) {
  return Math.round(
    value * 100,
  );
}

function safeFileName(
  value: string,
) {
  return value
    .trim()
    .replace(
      /[^a-zA-Z0-9._-]+/g,
      "-",
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
     * --------------------------------------------------
     * 1. AUTHENTICATE INVESTOR
     * --------------------------------------------------
     */
    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "You must sign in before submitting payment information.",
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
            "Only investor accounts can submit payment information.",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 2. ACCOUNT ACCESS
     * --------------------------------------------------
     */
    const access =
      await checkAccountAccess(
        user.id,
      );

    if (!access.allowed) {
      return NextResponse.json(
        {
          error:
            access.reason,
        },
        {
          status: 403,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 3. PAYMENT ID
     * --------------------------------------------------
     */
    const {
      paymentId,
    } = await params;

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

    const admin =
      createAdminClient();

    /*
     * --------------------------------------------------
     * 4. LOAD PAYMENT
     *
     * It MUST belong to this investor.
     * --------------------------------------------------
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

        investor_reference,
        payment_reference,

        proof_storage_path,

        status
        `,
      )
      .eq(
        "id",
        paymentId,
      )
      .eq(
        "investor_id",
        user.id,
      )
      .maybeSingle();

    if (
      paymentError ||
      !payment
    ) {
      console.error(
        "Investor payment load error:",
        paymentError,
      );

      return NextResponse.json(
        {
          error:
            "Payment record could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 5. ALLOWED PAYMENT STATES
     * --------------------------------------------------
     *
     * First submission:
     *
     * awaiting_payment
     *
     * Resubmission after admin rejects:
     *
     * rejected
     */
    if (
      payment.status !==
        "awaiting_payment" &&
      payment.status !==
        "rejected"
    ) {
      return NextResponse.json(
        {
          error:
            "This payment cannot currently be submitted.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 6. SUBSCRIPTION MUST STILL BE APPROVED
     * --------------------------------------------------
     */
    const {
      data: subscription,
      error:
        subscriptionError,
    } = await admin
      .from(
        "investment_subscriptions",
      )
      .select(
        `
        id,
        investor_id,
        commitment_amount,
        status
        `,
      )
      .eq(
        "id",
        payment.subscription_id,
      )
      .eq(
        "investor_id",
        user.id,
      )
      .maybeSingle();

    if (
      subscriptionError ||
      !subscription
    ) {
      return NextResponse.json(
        {
          error:
            "Investment subscription could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      subscription.status !==
      "approved"
    ) {
      return NextResponse.json(
        {
          error:
            "Your investment subscription is not currently approved for funding.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 7. READ FORM DATA
     * --------------------------------------------------
     */
    const formData =
      await request.formData();

    const reportedAmount =
      Number(
        formData.get(
          "reportedAmount",
        ),
      );

    const investorReference =
      String(
        formData.get(
          "investorReference",
        ) ?? "",
      ).trim();

    const submittedPaymentReference =
      String(
        formData.get(
          "paymentReference",
        ) ?? "",
      ).trim();

    const proof =
      formData.get(
        "proof",
      );

    /*
     * --------------------------------------------------
     * 8. VALIDATE AMOUNT
     * --------------------------------------------------
     */
    if (
      !Number.isFinite(
        reportedAmount,
      ) ||
      reportedAmount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid payment amount.",
        },
        {
          status: 400,
        },
      );
    }

    const reportedAmountCents =
      dollarsToCents(
        reportedAmount,
      );

    if (
      reportedAmountCents !==
      Number(
        payment.expected_amount,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "The payment amount must exactly equal your approved commitment.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 9. INVESTOR BANK REFERENCE
     * --------------------------------------------------
     */
    if (
      investorReference.length <
      3
    ) {
      return NextResponse.json(
        {
          error:
            "Enter your bank transfer or transaction reference.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 10. VERIFY TEVUAH PAYMENT REFERENCE
     * --------------------------------------------------
     */
    if (
      !payment.payment_reference ||
      submittedPaymentReference !==
        payment.payment_reference
    ) {
      return NextResponse.json(
        {
          error:
            "The payment reference does not match this investment funding record.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 11. VALIDATE PROOF
     * --------------------------------------------------
     */
    if (
      !(proof instanceof File)
    ) {
      return NextResponse.json(
        {
          error:
            "Upload your proof of payment.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !ALLOWED_TYPES.has(
        proof.type,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Proof must be a PDF, JPG, PNG or WebP file.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      proof.size >
      MAX_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          error:
            "Proof of payment must be 10 MB or smaller.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 12. UPLOAD NEW PRIVATE PROOF
     * --------------------------------------------------
     */
    const previousProofPath =
      payment.proof_storage_path;

    const fileName =
      safeFileName(
        proof.name,
      );

    const newStoragePath =
      `${user.id}/${payment.id}/${randomUUID()}-${fileName}`;

    const bytes =
      Buffer.from(
        await proof.arrayBuffer(),
      );

    const {
      error: uploadError,
    } = await admin.storage
      .from(
        "investment-payment-proofs",
      )
      .upload(
        newStoragePath,
        bytes,
        {
          contentType:
            proof.type,

          upsert:
            false,
        },
      );

    if (uploadError) {
      console.error(
        "Payment proof upload error:",
        uploadError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to upload proof of payment.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 13. UPDATE PAYMENT
     * --------------------------------------------------
     *
     * Critical transition:
     *
     * rejected
     *      ↓
     * pending_verification
     */
    const now =
      new Date().toISOString();

    const {
      data: updatedPayment,
      error: updateError,
    } = await admin
      .from(
        "investment_payments",
      )
      .update({
        reported_amount:
          reportedAmountCents,

        investor_reference:
          investorReference,

        proof_storage_path:
          newStoragePath,

        status:
          "pending_verification",

        investor_reported_at:
          now,

        /*
         * Clear previous admin rejection.
         */
        rejection_reason:
          null,

        admin_notes:
          null,

        /*
         * Payment still has NOT been verified.
         */
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
        reported_amount,
        investor_reference,
        proof_storage_path,
        investor_reported_at
        `,
      )
      .single();

    if (
      updateError ||
      !updatedPayment
    ) {
      console.error(
        "Payment submission update error:",
        updateError,
      );

      /*
       * Roll back new file if database update
       * fails.
       */
      await admin.storage
        .from(
          "investment-payment-proofs",
        )
        .remove([
          newStoragePath,
        ]);

      return NextResponse.json(
        {
          error:
            "Unable to submit your payment information.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 14. DELETE PREVIOUS REJECTED PROOF
     * --------------------------------------------------
     *
     * Only after new proof + database update
     * both succeeded.
     */
    if (
      previousProofPath &&
      previousProofPath !==
        newStoragePath
    ) {
      const {
        error:
          previousDeleteError,
      } = await admin.storage
        .from(
          "investment-payment-proofs",
        )
        .remove([
          previousProofPath,
        ]);

      if (
        previousDeleteError
      ) {
        console.error(
          "Old payment proof cleanup error:",
          previousDeleteError,
        );
      }
    }

    /*
     * --------------------------------------------------
     * 15. AUDIT
     * --------------------------------------------------
     */
    const action =
      payment.status ===
      "rejected"
        ? "payment_resubmitted"
        : "payment_reported";

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

        action,

        metadata: {
          reportedAmount:
            reportedAmountCents,

          investorReference,

          paymentReference:
            payment.payment_reference,

          subscriptionId:
            payment.subscription_id,

          opportunityId:
            payment.opportunity_id,
        },

        created_at:
          now,
      });

    if (auditError) {
      console.error(
        "Payment audit error:",
        auditError,
      );
    }

    /*
     * --------------------------------------------------
     * 16. SUCCESS
     * --------------------------------------------------
     */
    return NextResponse.json({
      success: true,

      paymentId:
        payment.id,

      status:
        "pending_verification",

      resubmitted:
        payment.status ===
        "rejected",
    });
  } catch (error) {
    console.error(
      "Investor payment submission API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while submitting your payment.",
      },
      {
        status: 500,
      },
    );
  }
}