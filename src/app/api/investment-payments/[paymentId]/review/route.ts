import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { getPaymentNotificationRecipient } from "@/src/lib/email/funding-email-recipients";
import { sendApplicationMail } from "@/src/lib/email/application-mailer";
import {
  companyInvestmentPaymentVerifiedEmail,
  investorInvestmentPaymentRejectedEmail,
  investorInvestmentPaymentVerifiedEmail,
} from "@/src/lib/email/investment-emails";
import { createAdminClient } from "@/src/lib/supabase/admin";

type RouteContext = {
  params: Promise<{ paymentId: string }>;
};

type Body = {
  action?: "verify" | "reject";
  verifiedAmount?: number | string;
  note?: string;
};

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const adminUser = await requireAdmin();
    const adminActorId = adminUser.userId;

    const { paymentId } = await params;
    const body = (await request.json()) as Body;

    if (body.action !== "verify" && body.action !== "reject") {
      return NextResponse.json(
        { error: "Invalid payment review action." },
        { status: 400 },
      );
    }

    const admin = createAdminClient();

    const { data: payment, error: paymentError } = await admin
      .from("investment_payments")
      .select(`
        id,
        investor_id,
        subscription_id,
        opportunity_id,
        expected_amount,
        reported_amount,
        verified_amount,
        currency,
        payment_method,
        status
      `)
      .eq("id", paymentId)
      .maybeSingle();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: "Investment payment could not be found." },
        { status: 404 },
      );
    }

    if (payment.status === "verified") {
      return NextResponse.json(
        { error: "This investment payment has already been verified." },
        { status: 409 },
      );
    }

    if (!payment.subscription_id || !payment.opportunity_id) {
      return NextResponse.json(
        { error: "This payment is missing its subscription or opportunity." },
        { status: 409 },
      );
    }

    const [
      subscriptionResult,
      opportunityResult,
      authResult,
      profileResult,
      reportResult,
    ] = await Promise.all([
      admin
        .from("investment_subscriptions")
        .select("id, status, commitment_amount")
        .eq("id", payment.subscription_id)
        .maybeSingle(),
      admin
        .from("investment_opportunities")
        .select("id, title, funding_target, total_funded")
        .eq("id", payment.opportunity_id)
        .maybeSingle(),
      admin.auth.admin.getUserById(payment.investor_id),
      admin
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", payment.investor_id)
        .maybeSingle(),
      admin
        .from("investment_payment_reports")
        .select("*")
        .eq("payment_id", payment.id)
        .maybeSingle(),
    ]);

    const subscription = subscriptionResult.data;
    const opportunity = opportunityResult.data;

    if (!subscription || !opportunity) {
      return NextResponse.json(
        {
          error:
            "This payment is missing its subscription or investment opportunity.",
        },
        { status: 409 },
      );
    }

    const investorEmail = authResult.data.user?.email;
    const investorName =
      [
        profileResult.data?.first_name,
        profileResult.data?.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() || "Investor";

    const origin = new URL(request.url).origin;

    if (body.action === "reject") {
      const reason = body.note?.trim();

      if (!reason) {
        return NextResponse.json(
          { error: "Enter a reason for rejecting the reported payment." },
          { status: 400 },
        );
      }

      if (
        !["payment_reported", "pending_verification"].includes(
          String(payment.status),
        )
      ) {
        return NextResponse.json(
          { error: "Only a reported payment can be rejected." },
          { status: 409 },
        );
      }

      const { error: rejectError } = await admin
        .from("investment_payments")
        .update({
          status: "rejected",
          rejection_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      if (rejectError) {
        console.error("Investment payment rejection error:", rejectError);
        return NextResponse.json(
          { error: "Unable to reject this investment payment." },
          { status: 500 },
        );
      }

      if (reportResult.data) {
        const { error: reportReviewError } = await admin
          .from("investment_payment_reports")
          .update({
            reviewed_at: new Date().toISOString(),
            reviewed_by: adminActorId,
            rejection_reason: reason,
            updated_at: new Date().toISOString(),
          })
          .eq("payment_id", payment.id);

        if (reportReviewError) {
          console.error("Payment report rejection metadata error:", reportReviewError);
        }
      }

      let investorEmailSent = false;

      if (investorEmail) {
        const email = investorInvestmentPaymentRejectedEmail({
          investorName,
          opportunityTitle: opportunity.title,
          amountCents: Number(payment.expected_amount),
          reason,
          subscriptionId: payment.subscription_id,
          origin,
        });

        investorEmailSent = (
          await sendApplicationMail({
            to: investorEmail,
            ...email,
          })
        ).sent;
      }

      return NextResponse.json({
        success: true,
        status: "rejected",
        investorEmailSent,
      });
    }

    if (
      !["payment_reported", "pending_verification"].includes(
        String(payment.status),
      )
    ) {
      return NextResponse.json(
        { error: "Only a reported payment can be verified." },
        { status: 409 },
      );
    }

    if (subscription.status !== "approved") {
      return NextResponse.json(
        {
          error:
            "The investment subscription must be approved before payment can be verified.",
        },
        { status: 409 },
      );
    }

    const expectedAmount = Number(payment.expected_amount);
    const commitmentAmount = Number(subscription.commitment_amount);

    const verifiedAmount =
      body.verifiedAmount === undefined ||
      body.verifiedAmount === null ||
      body.verifiedAmount === ""
        ? expectedAmount
        : Number(body.verifiedAmount);

    if (!Number.isSafeInteger(verifiedAmount) || verifiedAmount <= 0) {
      return NextResponse.json(
        { error: "Enter a valid verified amount in cents." },
        { status: 400 },
      );
    }

    if (
      verifiedAmount !== expectedAmount ||
      verifiedAmount !== commitmentAmount
    ) {
      return NextResponse.json(
        {
          error:
            "The verified amount must exactly match the approved investment commitment.",
        },
        { status: 409 },
      );
    }

    const remainingAllocation =
      Number(opportunity.funding_target) -
      Number(opportunity.total_funded);

    if (verifiedAmount > remainingAllocation) {
      return NextResponse.json(
        { error: "This payment exceeds the remaining opportunity allocation." },
        { status: 409 },
      );
    }

    const report = reportResult.data;

    if (
      payment.payment_method === "wire_transfer" &&
      !report?.wire_reference &&
      !report?.proof_storage_path
    ) {
      return NextResponse.json(
        {
          error:
            "Wire payment verification requires a wire reference or payment proof.",
        },
        { status: 409 },
      );
    }

    if (
      payment.payment_method === "bitcoin" &&
      !report?.bitcoin_transaction_hash
    ) {
      return NextResponse.json(
        {
          error:
            "Bitcoin payment verification requires the investor transaction hash.",
        },
        { status: 409 },
      );
    }

    const { data: verificationResult, error: verificationError } =
      await admin.rpc("verify_investment_payment", {
        p_payment_id: payment.id,
        p_admin_id: adminActorId,
        p_verified_amount: verifiedAmount,
      });

    if (verificationError) {
      console.error("Investment payment verification RPC error:", verificationError);
      return NextResponse.json(
        {
          error:
            verificationError.message ||
            "Unable to verify this investment payment.",
        },
        { status: 409 },
      );
    }

    if (report) {
      const { error: reportReviewError } = await admin
        .from("investment_payment_reports")
        .update({
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminActorId,
          rejection_reason: null,
          updated_at: new Date().toISOString(),
        })
        .eq("payment_id", payment.id);

      if (reportReviewError) {
        console.error("Payment report review metadata error:", reportReviewError);
      }
    }

    let investorEmailSent = false;

    if (investorEmail) {
      const email = investorInvestmentPaymentVerifiedEmail({
        investorName,
        opportunityTitle: opportunity.title,
        amountCents: verifiedAmount,
        paymentMethod: payment.payment_method,
        subscriptionId: payment.subscription_id,
        paymentId: payment.id,
        origin,
      });

      investorEmailSent = (
        await sendApplicationMail({
          to: investorEmail,
          ...email,
        })
      ).sent;
    }

    const companyRecipient = getPaymentNotificationRecipient();
    let companyEmailSent = false;

    if (companyRecipient) {
      const email = companyInvestmentPaymentVerifiedEmail({
        investorName,
        investorEmail: investorEmail ?? "Email unavailable",
        opportunityTitle: opportunity.title,
        amountCents: verifiedAmount,
        paymentMethod: payment.payment_method,
        paymentId: payment.id,
        origin,
      });

      companyEmailSent = (
        await sendApplicationMail({
          to: companyRecipient,
          ...email,
        })
      ).sent;
    }

    return NextResponse.json({
      success: true,
      status: "verified",
      result: verificationResult,
      emailDelivery: {
        investor: investorEmailSent,
        company: companyEmailSent,
      },
    });
  } catch (error) {
    console.error("Investment payment review API error:", error);
    return NextResponse.json(
      { error: "Unable to review this investment payment." },
      { status: 500 },
    );
  }
}
