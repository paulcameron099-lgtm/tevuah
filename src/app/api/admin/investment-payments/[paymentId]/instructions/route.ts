import { NextResponse } from "next/server";

import { requireAdmin } from "@/src/lib/auth/require-admin";
import { sendApplicationMail } from "@/src/lib/email/application-mailer";
import { investorFundingInstructionsEmail } from "@/src/lib/email/investment-funding-instructions-email";
import { createAdminClient } from "@/src/lib/supabase/admin";

type RouteContext = {
  params: Promise<{ paymentId: string }>;
};

type Body = {
  paymentMethod?: "wire_transfer" | "bitcoin";
  bankName?: string;
  beneficiaryName?: string;
  accountNumber?: string;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
  bankAddress?: string;
  paymentReference?: string;
  bitcoinAmount?: string;
  bitcoinAddress?: string;
  bitcoinPaymentUrl?: string;
  bitcoinNetwork?: string;
  instructions?: string;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const adminUser = await requireAdmin();
    const adminActorId = adminUser.userId;

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
        status,
        opportunity:investment_opportunities!investment_payments_opportunity_id_fkey (
          title
        )
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
        { error: "Funding instructions cannot be changed after the payment is verified." },
        { status: 409 },
      );
    }

    if (!payment.subscription_id || !payment.opportunity_id) {
      return NextResponse.json(
        { error: "This payment is missing its subscription or opportunity relationship." },
        { status: 409 },
      );
    }

    const body = (await request.json()) as Body;
    const paymentMethod = body.paymentMethod;

    if (paymentMethod !== "wire_transfer" && paymentMethod !== "bitcoin") {
      return NextResponse.json(
        { error: "Select Wire Transfer or Bitcoin." },
        { status: 400 },
      );
    }

    const payload = {
      payment_id: payment.id,
      investor_id: payment.investor_id,
      subscription_id: payment.subscription_id,
      opportunity_id: payment.opportunity_id,
      payment_method: paymentMethod,
      amount_cents: Number(payment.expected_amount),
      currency: payment.currency ?? "USD",

      bank_name:
        paymentMethod === "wire_transfer" ? clean(body.bankName) || null : null,
      beneficiary_name:
        paymentMethod === "wire_transfer" ? clean(body.beneficiaryName) || null : null,
      account_number:
        paymentMethod === "wire_transfer" ? clean(body.accountNumber) || null : null,
      routing_number:
        paymentMethod === "wire_transfer" ? clean(body.routingNumber) || null : null,
      swift_code:
        paymentMethod === "wire_transfer" ? clean(body.swiftCode) || null : null,
      iban:
        paymentMethod === "wire_transfer" ? clean(body.iban) || null : null,
      bank_address:
        paymentMethod === "wire_transfer" ? clean(body.bankAddress) || null : null,
      payment_reference:
        paymentMethod === "wire_transfer" ? clean(body.paymentReference) || null : null,

      bitcoin_amount:
        paymentMethod === "bitcoin" ? clean(body.bitcoinAmount) || null : null,
      bitcoin_address:
        paymentMethod === "bitcoin" ? clean(body.bitcoinAddress) || null : null,
      bitcoin_payment_url:
        paymentMethod === "bitcoin" ? clean(body.bitcoinPaymentUrl) || null : null,
      bitcoin_network:
        paymentMethod === "bitcoin" ? clean(body.bitcoinNetwork) || "Bitcoin" : null,

      instructions: clean(body.instructions) || null,
      status: "active",
      created_by: adminActorId,
      updated_by: adminActorId,
      updated_at: new Date().toISOString(),
    };

    if (
      paymentMethod === "wire_transfer" &&
      (!payload.bank_name ||
        !payload.beneficiary_name ||
        (!payload.account_number && !payload.iban))
    ) {
      return NextResponse.json(
        {
          error:
            "Wire instructions require bank name, beneficiary name, and an account number or IBAN.",
        },
        { status: 400 },
      );
    }

    if (paymentMethod === "bitcoin") {
      const bitcoinAmount = Number(payload.bitcoin_amount);

      if (
        !Number.isFinite(bitcoinAmount) ||
        bitcoinAmount <= 0 ||
        !payload.bitcoin_address
      ) {
        return NextResponse.json(
          {
            error:
              "Bitcoin instructions require a valid BTC amount and receiving address.",
          },
          { status: 400 },
        );
      }
    }

    const { data: instruction, error: instructionError } = await admin
      .from("investment_payment_instructions")
      .upsert(payload, { onConflict: "payment_id" })
      .select("*")
      .single();

    if (instructionError) {
      console.error("Investment payment instruction save error:", instructionError);
      return NextResponse.json(
        { error: "Unable to save funding instructions." },
        { status: 500 },
      );
    }

    const { error: paymentMethodError } = await admin
      .from("investment_payments")
      .update({
        payment_method: paymentMethod,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (paymentMethodError) {
      console.error("Investment payment method update error:", paymentMethodError);
      return NextResponse.json(
        {
          error:
            "Funding instructions were saved, but the payment method could not be updated.",
        },
        { status: 500 },
      );
    }

    let emailSent = false;

    const [
      authInvestorResult,
      profileResult,
    ] = await Promise.all([
      admin.auth.admin.getUserById(
        payment.investor_id,
      ),
      admin
        .from("profiles")
        .select(
          "first_name, last_name",
        )
        .eq(
          "id",
          payment.investor_id,
        )
        .maybeSingle(),
    ]);

    const investorEmail =
      authInvestorResult.data.user
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

    const opportunityRelation =
      payment.opportunity;
    const opportunity =
      Array.isArray(
        opportunityRelation,
      )
        ? opportunityRelation[0] ??
          null
        : opportunityRelation;

    if (
      investorEmail &&
      opportunity?.title
    ) {
      const fundingUrl =
        `${new URL(request.url).origin}/dashboard/investments/${payment.subscription_id}/funding`;

      const email =
        investorFundingInstructionsEmail({
          investorName,
          opportunityTitle:
            opportunity.title,
          commitmentAmountCents:
            Number(
              payment.expected_amount,
            ),
          currency:
            payment.currency ??
            "USD",
          paymentMethod,
          bankName:
            payload.bank_name,
          beneficiaryName:
            payload.beneficiary_name,
          accountNumber:
            payload.account_number,
          routingNumber:
            payload.routing_number,
          swiftCode:
            payload.swift_code,
          iban:
            payload.iban,
          bankAddress:
            payload.bank_address,
          paymentReference:
            payload.payment_reference,
          bitcoinAmount:
            payload.bitcoin_amount,
          bitcoinAddress:
            payload.bitcoin_address,
          bitcoinPaymentUrl:
            payload.bitcoin_payment_url,
          bitcoinNetwork:
            payload.bitcoin_network,
          instructions:
            payload.instructions,
          fundingUrl,
        });

      emailSent = (
        await sendApplicationMail({
          to: investorEmail,
          ...email,
        })
      ).sent;
    }

    return NextResponse.json({
      success: true,
      instruction,
      emailSent,
    });
  } catch (error) {
    console.error("Investment funding instruction API error:", error);
    return NextResponse.json(
      { error: "Unable to save funding instructions." },
      { status: 500 },
    );
  }
}
