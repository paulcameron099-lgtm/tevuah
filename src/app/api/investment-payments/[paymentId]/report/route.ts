import { NextResponse } from "next/server";

import { checkAccountAccess } from "@/src/lib/auth/account-status";
import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { getPaymentNotificationRecipient } from "@/src/lib/email/funding-email-recipients";
import { sendApplicationMail } from "@/src/lib/email/application-mailer";
import { companyInvestmentPaymentReportedEmail } from "@/src/lib/email/investment-emails";
import { createAdminClient } from "@/src/lib/supabase/admin";

type RouteContext = {
  params: Promise<{ paymentId: string }>;
};

type Body = {
  wireReference?: string;
  bitcoinTransactionHash?: string;
  proofBucket?: string;
  proofStoragePath?: string;
  note?: string;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "investor") {
      return NextResponse.json(
        { error: "Investor access required." },
        { status: 401 },
      );
    }

    const accountAccess = await checkAccountAccess(user.id);

    if (!accountAccess.allowed) {
      return NextResponse.json(
        {
          error: accountAccess.reason,
          accountStatus: accountAccess.status,
        },
        { status: 403 },
      );
    }

    const { paymentId } = await params;
    const admin = createAdminClient();

    const { data: payment, error: paymentError } = await admin
      .from("investment_payments")
      .select(`
        id,
        investor_id,
        subscription_id,
        opportunity_id,
        expected_amount,
        currency,
        payment_method,
        status
      `)
      .eq("id", paymentId)
      .eq("investor_id", user.id)
      .maybeSingle();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: "Investment payment could not be found." },
        { status: 404 },
      );
    }

    if (!["awaiting_payment", "rejected"].includes(String(payment.status))) {
      return NextResponse.json(
        {
          error:
            "This investment payment cannot be reported from its current status.",
        },
        { status: 409 },
      );
    }

    if (
      payment.payment_method !== "wire_transfer" &&
      payment.payment_method !== "bitcoin"
    ) {
      return NextResponse.json(
        {
          error:
            "This payment is not configured for Wire Transfer or Bitcoin.",
        },
        { status: 409 },
      );
    }

    const body = (await request.json()) as Body;
    const wireReference = clean(body.wireReference);
    const bitcoinTransactionHash = clean(body.bitcoinTransactionHash);
    const proofBucket = clean(body.proofBucket);
    const proofStoragePath = clean(body.proofStoragePath);
    const note = clean(body.note);
    
// Wire Transfer requires a transfer/reference number.
// Receipt/proof is optional.
if (
  payment.payment_method === "wire_transfer" &&
  !wireReference
) {
  return NextResponse.json(
    {
      error: "Enter the wire transfer reference.",
    },
    { status: 400 },
  );
}

// Bitcoin requires the blockchain transaction hash.
// A separate screenshot/receipt is not required.
if (
  payment.payment_method === "bitcoin" &&
  !bitcoinTransactionHash
) {
  return NextResponse.json(
    {
      error: "Enter the Bitcoin transaction hash.",
    },
    { status: 400 },
  );
}

const now = new Date().toISOString();

const { data: reportRow, error: reportError } = await admin
  .from("investment_payment_reports")
  .upsert(
    {
      payment_id: payment.id,
      investor_id: payment.investor_id,
      payment_method: payment.payment_method,

      wire_reference:
        payment.payment_method === "wire_transfer"
          ? wireReference
          : null,

      bitcoin_transaction_hash:
        payment.payment_method === "bitcoin"
          ? bitcoinTransactionHash
          : null,

      // OPTIONAL payment receipt/proof.
      // These remain null when the investor does not upload proof.
      proof_bucket: proofBucket || null,
      proof_storage_path: proofStoragePath || null,

      investor_note: note || null,
      reported_at: now,
      updated_at: now,
    },
    {
      onConflict: "payment_id",
    },
  )
  .select("*")
  .single();

    if (reportError || !reportRow) {
      console.error("Investment payment report save error:", reportError);
      return NextResponse.json(
        { error: "Unable to save the investment payment report." },
        { status: 500 },
      );
    }

    const { error: paymentUpdateError } = await admin
      .from("investment_payments")
      .update({
        reported_amount: Number(payment.expected_amount),
        investor_reported_at: now,
        status: "payment_reported",
        rejection_reason: null,
        updated_at: now,
      })
      .eq("id", payment.id);

    if (paymentUpdateError) {
      console.error("Investment payment status update error:", paymentUpdateError);
      return NextResponse.json(
        {
          error:
            "The report was saved, but the payment status could not be updated. Please contact Tevuah Reserve.",
        },
        { status: 500 },
      );
    }

    const [authResult, profileResult, opportunityResult] = await Promise.all([
      admin.auth.admin.getUserById(user.id),
      admin
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .maybeSingle(),
      admin
        .from("investment_opportunities")
        .select("title")
        .eq("id", payment.opportunity_id)
        .maybeSingle(),
    ]);

    const investorEmail =
      authResult.data.user?.email ?? "Email unavailable";

    const investorName =
      [
        profileResult.data?.first_name,
        profileResult.data?.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() || "Investor";

    const companyRecipient = getPaymentNotificationRecipient();
    let companyEmailSent = false;

    if (companyRecipient) {
      const email = companyInvestmentPaymentReportedEmail({
        investorName,
        investorEmail,
        opportunityTitle:
          opportunityResult.data?.title ?? "Investment Opportunity",
        amountCents: Number(payment.expected_amount),
        paymentMethod: payment.payment_method,
        paymentId: payment.id,
        origin: new URL(request.url).origin,
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
      status: "payment_reported",
      report: reportRow,
      companyEmailSent,
    });
  } catch (error) {
    console.error("Investment payment report API error:", error);
    return NextResponse.json(
      { error: "Unable to report this investment payment." },
      { status: 500 },
    );
  }
}
