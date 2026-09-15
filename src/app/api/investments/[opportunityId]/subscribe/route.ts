import { NextResponse } from "next/server";

import { checkAccountAccess } from "@/src/lib/auth/account-status";
import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { getInvestmentNotificationRecipient } from "@/src/lib/email/funding-email-recipients";
import { sendApplicationMail } from "@/src/lib/email/application-mailer";
import { companySubscriptionSubmittedEmail } from "@/src/lib/email/investment-emails";
import { createAdminClient } from "@/src/lib/supabase/admin";

type RouteContext = {
  params: Promise<{ opportunityId: string }>;
};

type SubscribePayload = {
  amount: string | number;
  offeringAcknowledged: boolean;
  riskAccepted: boolean;
  signature: string;
};

function dollarsToCents(value: number) {
  return Math.round(value * 100);
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must sign in before submitting an investment subscription." },
        { status: 401 },
      );
    }

    if (user.role !== "investor") {
      return NextResponse.json(
        { error: "Only investor accounts can submit investment subscriptions." },
        { status: 403 },
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

    if (user.onboarding_status !== "approved") {
      return NextResponse.json(
        {
          error:
            "Your investor verification must be approved before you can submit an investment subscription.",
        },
        { status: 403 },
      );
    }

    const { opportunityId } = await params;

    if (!opportunityId) {
      return NextResponse.json(
        { error: "Investment opportunity ID is missing." },
        { status: 400 },
      );
    }

    const body = (await request.json()) as SubscribePayload;
    const investmentAmount = Number(body.amount);
    const signature = body.signature?.trim();

    if (!Number.isFinite(investmentAmount) || investmentAmount <= 0) {
      return NextResponse.json(
        { error: "Enter a valid investment amount." },
        { status: 400 },
      );
    }

    if (body.offeringAcknowledged !== true) {
      return NextResponse.json(
        { error: "You must acknowledge that you reviewed the offering documents." },
        { status: 400 },
      );
    }

    if (body.riskAccepted !== true) {
      return NextResponse.json(
        { error: "You must accept the investment risk disclosure before submitting." },
        { status: 400 },
      );
    }

    if (!signature || signature.length < 3) {
      return NextResponse.json(
        { error: "Enter a valid electronic signature." },
        { status: 400 },
      );
    }

    const admin = createAdminClient();

    const { data: opportunity, error: opportunityError } = await admin
      .from("investment_opportunities")
      .select(`
        id,
        title,
        status,
        funding_target,
        minimum_investment,
        total_funded
      `)
      .eq("id", opportunityId)
      .maybeSingle();

    if (opportunityError || !opportunity) {
      console.error("Subscription opportunity load error:", opportunityError);
      return NextResponse.json(
        { error: "Investment opportunity could not be found." },
        { status: 404 },
      );
    }

    if (opportunity.status !== "published") {
      return NextResponse.json(
        { error: "This investment opportunity is no longer open for subscriptions." },
        { status: 409 },
      );
    }

    const fundingTarget = Number(opportunity.funding_target);
    const minimumInvestment = Number(opportunity.minimum_investment);
    const totalFunded = Number(opportunity.total_funded);
    const commitmentAmount = dollarsToCents(investmentAmount);
    const remainingAllocation = fundingTarget - totalFunded;

    if (remainingAllocation <= 0) {
      return NextResponse.json(
        { error: "This investment opportunity is fully funded." },
        { status: 409 },
      );
    }

    if (commitmentAmount < minimumInvestment) {
      return NextResponse.json(
        {
          error: `The minimum investment for this opportunity is ${formatMoney(
            minimumInvestment,
          )}.`,
        },
        { status: 400 },
      );
    }

    if (commitmentAmount > remainingAllocation) {
      return NextResponse.json(
        {
          error: `Your investment cannot exceed the remaining allocation of ${formatMoney(
            remainingAllocation,
          )}.`,
        },
        { status: 400 },
      );
    }

    const { data: existingSubscription, error: existingError } = await admin
      .from("investment_subscriptions")
      .select("id, status, commitment_amount")
      .eq("investor_id", user.id)
      .eq("opportunity_id", opportunityId)
      .maybeSingle();

    if (existingError) {
      console.error("Existing subscription lookup error:", existingError);
      return NextResponse.json(
        { error: "Unable to check your existing investment subscription." },
        { status: 500 },
      );
    }

    if (
      existingSubscription &&
      ["submitted", "under_review", "approved"].includes(
        existingSubscription.status,
      )
    ) {
      return NextResponse.json(
        { error: "You already have an active subscription for this investment opportunity." },
        { status: 409 },
      );
    }

    const now = new Date().toISOString();
    let subscriptionId: string;

    if (existingSubscription) {
      const { data: updatedSubscription, error: updateError } = await admin
        .from("investment_subscriptions")
        .update({
          commitment_amount: commitmentAmount,
          status: "submitted",
          offering_acknowledged: true,
          offering_acknowledged_at: now,
          risk_disclosure_accepted: true,
          risk_disclosure_accepted_at: now,
          electronic_signature: signature,
          signed_at: now,
          submitted_at: now,
          reviewed_at: null,
          reviewed_by: null,
          rejection_reason: null,
          admin_notes: null,
          updated_at: now,
        })
        .eq("id", existingSubscription.id)
        .select("id")
        .single();

      if (updateError || !updatedSubscription) {
        console.error("Subscription update error:", updateError);
        return NextResponse.json(
          { error: "Unable to submit your investment subscription." },
          { status: 500 },
        );
      }

      subscriptionId = updatedSubscription.id;
    } else {
      const { data: newSubscription, error: insertError } = await admin
        .from("investment_subscriptions")
        .insert({
          investor_id: user.id,
          opportunity_id: opportunityId,
          commitment_amount: commitmentAmount,
          status: "submitted",
          offering_acknowledged: true,
          offering_acknowledged_at: now,
          risk_disclosure_accepted: true,
          risk_disclosure_accepted_at: now,
          electronic_signature: signature,
          signed_at: now,
          submitted_at: now,
        })
        .select("id")
        .single();

      if (insertError || !newSubscription) {
        console.error("Subscription creation error:", insertError);

        if (insertError?.code === "23505") {
          return NextResponse.json(
            { error: "You already have a subscription for this opportunity." },
            { status: 409 },
          );
        }

        return NextResponse.json(
          { error: "Unable to submit your investment subscription." },
          { status: 500 },
        );
      }

      subscriptionId = newSubscription.id;
    }

    const { error: auditError } = await admin
      .from("investment_subscription_audit")
      .insert({
        subscription_id: subscriptionId,
        actor_id: user.id,
        action: existingSubscription
          ? "subscription_resubmitted"
          : "subscription_submitted",
        metadata: {
          opportunityId,
          commitmentAmount,
          currency: "USD",
        },
      });

    if (auditError) {
      console.error("Subscription audit error:", auditError);
    }

    /*
     * Notify Tevuah Reserve only after the subscription is safely stored.
     * Email failure does not roll back a valid investor subscription.
     */
    let companyEmailSent = false;
    const companyRecipient = getInvestmentNotificationRecipient();

    if (companyRecipient) {
      const [authResult, profileResult] = await Promise.all([
        admin.auth.admin.getUserById(user.id),
        admin
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", user.id)
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

      const email = companySubscriptionSubmittedEmail({
        investorName,
        investorEmail,
        opportunityTitle: opportunity.title,
        commitmentAmountCents: commitmentAmount,
        subscriptionId,
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
      subscriptionId,
      companyEmailSent,
      next: "/dashboard/investments",
    });
  } catch (error) {
    console.error("Investment subscription API error:", error);
    return NextResponse.json(
      {
        error:
          "Something went wrong while submitting your investment subscription.",
      },
      { status: 500 },
    );
  }
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}