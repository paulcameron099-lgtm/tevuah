import {
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  buildInvestorDocumentPdf,
  formatDocumentDate,
  formatDocumentMoney,
  safePdfFileName,
} from "@/src/lib/pdf/investor-document-pdf";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    obligationId: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Unauthorized.",
        },
        {
          status:
            401,
        },
      );
    }

    const {
      obligationId,
    } = await context.params;

    if (!obligationId) {
      return NextResponse.json(
        {
          error:
            "Funding obligation ID is required.",
        },
        {
          status:
            400,
        },
      );
    }

    const admin =
      createAdminClient();

    /*
     * Load the canonical obligation first.
     *
     * IMPORTANT:
     * Although this query uses the privileged Admin client,
     * investor access is explicitly restricted by investor_id.
     */
    let query =
      admin
        .from(
          "joint_investment_funding_obligations",
        )
        .select(
          `
          id,
          joint_subscription_id,
          member_id,
          investor_id,
          opportunity_id,

          obligation_amount,
          funded_amount,
          currency,
          status,

          funded_at,
          effective_funded_at,
          historical_funded_at,
          created_at,

          investor:profiles!joint_investment_funding_obligations_investor_id_fkey (
            id,
            first_name,
            last_name
          ),

          member:joint_investment_members!joint_investment_funding_obligations_member_id_fkey (
            id,
            joint_subscription_id,
            investor_id,
            member_slot,
            ownership_bps,
            funding_obligation_bps,
            obligation_amount,
            member_status
          ),

          joint_subscription:joint_investment_subscriptions!joint_investment_funding_obligations_joint_subscription_id_fkey (
            id,
            opportunity_id,
            total_commitment_amount,
            currency,
            status
          ),

          opportunity:investment_opportunities!joint_investment_funding_obligations_opportunity_id_fkey (
            id,
            slug,
            title,
            asset_category,
            location
          )
          `,
        )
        .eq(
          "id",
          obligationId,
        )
        .eq(
          "status",
          "funded",
        );

    if (
      user.role ===
      "investor"
    ) {
      query =
        query.eq(
          "investor_id",
          user.id,
        );
    } else if (
      user.role !==
        "admin" &&
      user.role !==
        "super_admin"
    ) {
      return NextResponse.json(
        {
          error:
            "Forbidden.",
        },
        {
          status:
            403,
        },
      );
    }

    const {
      data:
        obligation,
      error:
        obligationError,
    } =
      await query.maybeSingle();

    if (
      obligationError ||
      !obligation
    ) {
      console.error(
        "Joint funding confirmation PDF lookup error:",
        obligationError,
      );

      /*
       * Return 404 for both:
       *
       * - missing obligation
       * - obligation belonging to another investor
       *
       * This avoids leaking another investor's financial
       * record existence.
       */
      return NextResponse.json(
        {
          error:
            "Joint funding confirmation not found.",
        },
        {
          status:
            404,
        },
      );
    }

    /*
     * A funding confirmation must never be generated from an
     * incomplete obligation.
     */
    if (
      obligation.funded_amount !==
        obligation.obligation_amount ||
      !obligation.funded_at
    ) {
      return NextResponse.json(
        {
          error:
            "Joint funding obligation is not completely funded.",
        },
        {
          status:
            409,
        },
      );
    }

    const investor =
      normalizeRelation(
        obligation.investor,
      );

    const member =
      normalizeRelation(
        obligation.member,
      );

    const jointSubscription =
      normalizeRelation(
        obligation.joint_subscription,
      );

    const opportunity =
      normalizeRelation(
        obligation.opportunity,
      );

    if (
      !investor ||
      !member ||
      !jointSubscription ||
      !opportunity
    ) {
      console.error(
        "Joint funding confirmation relationship lookup incomplete.",
        {
          obligationId:
            obligation.id,
        },
      );

      return NextResponse.json(
        {
          error:
            "Joint funding confirmation record is incomplete.",
        },
        {
          status:
            409,
        },
      );
    }

    /*
     * Defensive provenance validation.
     */
    if (
      investor.id !==
        obligation.investor_id ||
      member.id !==
        obligation.member_id ||
      member.investor_id !==
        obligation.investor_id ||
      member.joint_subscription_id !==
        obligation.joint_subscription_id ||
      member.obligation_amount !==
        obligation.obligation_amount ||
      jointSubscription.id !==
        obligation.joint_subscription_id ||
      jointSubscription.opportunity_id !==
        obligation.opportunity_id ||
      opportunity.id !==
        obligation.opportunity_id
    ) {
      console.error(
        "Joint funding confirmation relationship mismatch.",
        {
          obligationId:
            obligation.id,
        },
      );

      return NextResponse.json(
        {
          error:
            "Joint funding confirmation relationships are inconsistent.",
        },
        {
          status:
            409,
        },
      );
    }

    /*
     * Determine the funding source.
     *
     * External funding:
     *   verified Wire / Bitcoin row.
     *
     * Cash Account:
     *   posted investment debit linked directly to the
     *   funding obligation.
     */
    const {
      data:
        externalFunding,
      error:
        externalFundingError,
    } =
      await admin
        .from(
          "joint_investment_external_funding",
        )
        .select(
          `
          id,
          funding_obligation_id,
          member_id,
          investor_id,
          joint_subscription_id,

          payment_method,

          principal_amount_cents,
          currency,

          wire_charge_rate_bps,
          wire_charge_amount_cents,
          total_amount_due_cents,

          reported_wire_reference,
          reported_bitcoin_tx_hash,

          status,
          reported_at,
          verified_at
          `,
        )
        .eq(
          "funding_obligation_id",
          obligation.id,
        )
        .eq(
          "investor_id",
          obligation.investor_id,
        )
        .eq(
          "member_id",
          obligation.member_id,
        )
        .eq(
          "joint_subscription_id",
          obligation.joint_subscription_id,
        )
        .eq(
          "status",
          "verified",
        )
        .order(
          "verified_at",
          {
            ascending:
              false,
          },
        )
        .limit(
          1,
        )
        .maybeSingle();

    if (externalFundingError) {
      console.error(
        "Joint external funding lookup error:",
        externalFundingError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to determine joint investment funding source.",
        },
        {
          status:
            500,
        },
      );
    }

    let cashLedger:
      {
        id: string;
        joint_funding_obligation_id: string | null;
        investor_id: string;
        amount_cents: number;
        currency: string;
        reference: string | null;
        created_at: string;
      } |
      null =
        null;

    /*
     * There must not be both a verified external payment and a
     * posted Cash Account investment debit for the same
     * obligation.
     */
    const {
      data:
        cashLedgerResult,
      error:
        cashLedgerError,
    } =
      await admin
        .from(
          "investor_cash_ledger",
        )
        .select(
          `
          id,
          joint_funding_obligation_id,
          investor_id,
          amount_cents,
          currency,
          reference,
          created_at
          `,
        )
        .eq(
          "joint_funding_obligation_id",
          obligation.id,
        )
        .eq(
          "investor_id",
          obligation.investor_id,
        )
        .eq(
          "entry_type",
          "investment",
        )
        .eq(
          "direction",
          "debit",
        )
        .eq(
          "status",
          "posted",
        )
        .limit(
          1,
        )
        .maybeSingle();

    if (cashLedgerError) {
      console.error(
        "Joint Cash Account funding lookup error:",
        cashLedgerError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to determine joint investment funding source.",
        },
        {
          status:
            500,
        },
      );
    }

    cashLedger =
      cashLedgerResult;

    if (
      externalFunding &&
      cashLedger
    ) {
      console.error(
        "Joint funding obligation contains conflicting funding sources.",
        {
          obligationId:
            obligation.id,
        },
      );

      return NextResponse.json(
        {
          error:
            "Joint funding confirmation contains conflicting funding evidence.",
        },
        {
          status:
            409,
        },
      );
    }

    if (
      !externalFunding &&
      !cashLedger
    ) {
      console.error(
        "Joint funding obligation has no canonical funding evidence.",
        {
          obligationId:
            obligation.id,
        },
      );

      return NextResponse.json(
        {
          error:
            "Joint funding confirmation has no funding evidence.",
        },
        {
          status:
            409,
        },
      );
    }

    /*
     * Validate the funding evidence against the obligation.
     */
    if (externalFunding) {
      if (
        externalFunding.funding_obligation_id !==
          obligation.id ||
        externalFunding.investor_id !==
          obligation.investor_id ||
        externalFunding.member_id !==
          obligation.member_id ||
        externalFunding.joint_subscription_id !==
          obligation.joint_subscription_id ||
        externalFunding.principal_amount_cents !==
          obligation.obligation_amount ||
        externalFunding.currency !==
          obligation.currency
      ) {
        console.error(
          "Joint external funding provenance mismatch.",
          {
            obligationId:
              obligation.id,
          },
        );

        return NextResponse.json(
          {
            error:
              "Joint external funding evidence is inconsistent.",
          },
          {
            status:
              409,
          },
        );
      }
    }

    if (cashLedger) {
      if (
        cashLedger.joint_funding_obligation_id !==
          obligation.id ||
        cashLedger.investor_id !==
          obligation.investor_id ||
        cashLedger.amount_cents !==
          obligation.obligation_amount ||
        cashLedger.currency !==
          obligation.currency
      ) {
        console.error(
          "Joint Cash Account funding provenance mismatch.",
          {
            obligationId:
              obligation.id,
          },
        );

        return NextResponse.json(
          {
            error:
              "Joint Cash Account funding evidence is inconsistent.",
          },
          {
            status:
              409,
          },
        );
      }
    }

    const investorName =
      fullName(
        investor.first_name,
        investor.last_name,
      );

    const opportunityTitle =
      opportunity.title ??
      "Investment Opportunity";

    const fundingMethod =
      externalFunding
        ? externalFunding.payment_method ===
          "wire_transfer"
          ? "Wire Transfer"
          : externalFunding.payment_method ===
              "bitcoin"
            ? "Bitcoin"
            : humanize(
                externalFunding.payment_method,
              )
        : "Tevuah Cash Account";

    const fundingReference =
      externalFunding
        ? externalFunding.payment_method ===
          "wire_transfer"
          ? externalFunding.reported_wire_reference ??
            externalFunding.id
          : externalFunding.payment_method ===
              "bitcoin"
            ? externalFunding.reported_bitcoin_tx_hash ??
              externalFunding.id
            : externalFunding.id
        : cashLedger?.reference ??
          cashLedger?.id ??
          "Not specified";

    const fundingCompletedAt =
      obligation.effective_funded_at ??
      obligation.funded_at;

    const rows = [
      {
        label:
          "Opportunity",
        value:
          opportunityTitle,
      },
      {
        label:
          "Asset category",
        value:
          humanize(
            opportunity.asset_category,
          ),
      },
      {
        label:
          "Location",
        value:
          opportunity.location ??
          "Not specified",
      },
      {
        label:
          "Joint member",
        value:
          `Member ${member.member_slot}`,
      },
      {
        label:
          "Funding obligation",
        value:
          formatDocumentMoney(
            obligation.obligation_amount,
          ),
      },
      {
        label:
          "Funded principal",
        value:
          formatDocumentMoney(
            obligation.funded_amount,
          ),
      },
      {
        label:
          "Currency",
        value:
          obligation.currency,
      },
      {
        label:
          "Funding method",
        value:
          fundingMethod,
      },
      {
        label:
          "Funding reference",
        value:
          fundingReference,
      },
      {
        label:
          "Funding completed",
        value:
          formatDocumentDate(
            fundingCompletedAt,
          ),
      },
      {
        label:
          "Obligation status",
        value:
          humanize(
            obligation.status,
          ),
      },
      {
        label:
          "Joint investment status",
        value:
          humanize(
            jointSubscription.status,
          ),
      },
    ];

    /*
     * Wire charge is not investment principal, but displaying
     * it on the confirmation makes the payment record clear.
     */
    if (
      externalFunding?.payment_method ===
      "wire_transfer"
    ) {
      rows.push(
        {
          label:
            "Wire charge",
          value:
            formatDocumentMoney(
              externalFunding.wire_charge_amount_cents,
            ),
        },
        {
          label:
            "Total amount paid",
          value:
            formatDocumentMoney(
              externalFunding.total_amount_due_cents,
            ),
        },
      );
    }

    if (
      externalFunding?.payment_method ===
      "bitcoin"
    ) {
      rows.push({
        label:
          "Verified",
        value:
          formatDocumentDate(
            externalFunding.verified_at,
          ),
      });
    }

    const pdfBuffer =
      await buildInvestorDocumentPdf(
        {
          documentLabel:
            "Joint Funding Confirmation",

          title:
            `Joint Funding Confirmation - ${opportunityTitle}`,

          subtitle:
            "Confirmation of the investor's completed funding obligation for a joint investment through Tevuah Reserve.",

          investorName,

          reference:
            obligation.id,

          effectiveDate:
            formatDocumentDate(
              fundingCompletedAt,
            ),

          rows,

          notes: [
            "This document confirms that the investor's funding obligation identified above has been satisfied.",
            "The funded principal shown above represents the investor's contribution toward the joint investment.",
            "For Wire transfers, any separately stated Wire charge is not included in investment principal.",
            "This confirmation belongs only to the investor identified above and does not represent the other joint member's funding contribution.",
          ],
        },
      );

    const fileName =
      `${safePdfFileName(
        opportunityTitle,
      )}-joint-funding-confirmation.pdf`;

    return new Response(
      pdfBuffer,
      {
        status:
          200,

        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `attachment; filename="${fileName}"`,

          "Cache-Control":
            "private, no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Joint funding confirmation PDF error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to generate joint funding confirmation.",
      },
      {
        status:
          500,
      },
    );
  }
}

function normalizeRelation<T>(
  value:
    T |
    T[] |
    null |
    undefined,
) {
  if (
    Array.isArray(
      value,
    )
  ) {
    return value[0] ??
      null;
  }

  return value ??
    null;
}

function fullName(
  first:
    string |
    null |
    undefined,
  last:
    string |
    null |
    undefined,
) {
  return [
    first,
    last,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() ||
    "Investor";
}

function humanize(
  value:
    string |
    null |
    undefined,
) {
  if (!value) {
    return "Not specified";
  }

  return value
    .replaceAll(
      "_",
      " ",
    )
    .replace(
      /\b\w/g,
      (
        letter,
      ) =>
        letter.toUpperCase(),
    );
}