import { NextResponse } from "next/server";

import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";

// Adjust these import paths/names only if your existing mail helpers
// use different locations.
import {
  getPaymentNotificationRecipient,
} from "@/src/lib/email/funding-email-recipients";

import {
  sendApplicationMail,
} from "@/src/lib/email/application-mailer";

import {
  companyJointPaymentReportedEmail,
} from "@/src/lib/email/investment-emails";

type RequestBody = {
  externalFundingId?: string;
  wireReference?: string | null;
  bitcoinTxHash?: string | null;
  paymentProofStoragePath?: string | null;
  investorReportNote?: string | null;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    const externalFundingId =
      body.externalFundingId?.trim();

    if (!externalFundingId) {
      return NextResponse.json(
        {
          error: "External funding ID is required.",
        },
        { status: 400 },
      );
    }

    /*
     * CRITICAL:
     * The reporting RPC uses auth.uid().
     * Therefore it MUST run through the authenticated SSR client.
     */
    const supabase = await createClient();

    const {
      data: claimsData,
      error: claimsError,
    } = await supabase.auth.getClaims();

    const investorId =
      claimsData?.claims?.sub;

    if (claimsError || !investorId) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 },
      );
    }

    const {
      data,
      error,
    } = await supabase.rpc(
      "report_joint_investment_external_payment",
      {
        p_external_funding_id:
          externalFundingId,

        p_wire_reference:
          body.wireReference?.trim() || null,

        p_bitcoin_tx_hash:
          body.bitcoinTxHash?.trim() || null,

        p_payment_proof_storage_path:
          body.paymentProofStoragePath?.trim() || null,

        p_investor_report_note:
          body.investorReportNote?.trim() || null,
      },
    );

    if (error) {
      console.error(
        "Joint payment reporting RPC error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            error.message ||
            "Unable to report joint investment payment.",
        },
        { status: 409 },
      );
    }

    const result =
      Array.isArray(data)
        ? data[0]
        : data;

    if (!result) {
      return NextResponse.json(
        {
          error:
            "Payment report result was not returned.",
        },
        { status: 500 },
      );
    }

    /*
     * Everything below happens AFTER the financial transaction
     * committed.
     *
     * Service-role reads are only for enrichment/email.
     */
    let companyEmailSent = false;

    try {
      const admin = createAdminClient();

      const {
        data: funding,
      } = await admin
        .from("joint_investment_external_funding")
        .select(`
          id,
          joint_subscription_id,
          investor_id,
          opportunity_id,
          payment_method,
          principal_amount_cents,
          wire_charge_amount_cents,
          total_amount_due_cents,
          payment_reference,
          reported_wire_reference,
          reported_bitcoin_tx_hash,
          investor_report_note
        `)
        .eq("id", externalFundingId)
        .single();

      if (funding) {
        const [
          profileResult,
          opportunityResult,
          userResult,
        ] = await Promise.all([
          admin
            .from("profiles")
            .select("first_name,last_name")
            .eq("id", funding.investor_id)
            .single(),

          admin
            .from("investment_opportunities")
            .select("title")
            .eq("id", funding.opportunity_id)
            .single(),

          admin.auth.admin.getUserById(
            funding.investor_id,
          ),
        ]);

        const profile =
          profileResult.data;

        const opportunity =
          opportunityResult.data;

        const investorEmail =
          userResult.data.user?.email;

        const investorName =
          [
            profile?.first_name,
            profile?.last_name,
          ]
            .filter(Boolean)
            .join(" ")
            .trim() || "Investor";

        if (investorEmail && opportunity) {
          const recipient =
            getPaymentNotificationRecipient();

          if (recipient) {
            const email =
              companyJointPaymentReportedEmail({
                investorName,
                investorEmail,
                opportunityTitle:
                  opportunity.title,

                paymentMethod:
                  funding.payment_method as
                    | "wire_transfer"
                    | "bitcoin",

                principalAmountCents:
                  Number(
                    funding.principal_amount_cents,
                  ),

                wireChargeAmountCents:
                  Number(
                    funding.wire_charge_amount_cents,
                  ),

                totalAmountDueCents:
                  Number(
                    funding.total_amount_due_cents,
                  ),

                paymentReference:
                  funding.payment_reference,

                reportedWireReference:
                  funding.reported_wire_reference,

                reportedBitcoinTxHash:
                  funding.reported_bitcoin_tx_hash,

                investorReportNote:
                  funding.investor_report_note,

                jointSubscriptionId:
                  funding.joint_subscription_id,

                externalFundingId:
                  funding.id,

                origin:
                  new URL(request.url).origin,
              });

            await sendApplicationMail({
              to: recipient,
              subject: email.subject,
              text: email.text,
              html: email.html,
            });

            companyEmailSent = true;
          }
        }
      }
    } catch (emailError) {
      /*
       * SMTP/email failure must NEVER roll back or misrepresent
       * the already-committed payment report.
       */
      console.error(
        "Joint payment reported company email failed:",
        emailError,
      );
    }

    return NextResponse.json(
      {
        success: true,

        fundingReport: {
          externalFundingId:
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

          totalAmountDueCents:
            Number(
              result.total_amount_due_cents,
            ),

          status:
            result.funding_status,

          reportedAt:
            result.reported_at,
        },

        companyEmailSent,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "Joint payment report API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to report joint investment payment.",
      },
      { status: 500 },
    );
  }
}