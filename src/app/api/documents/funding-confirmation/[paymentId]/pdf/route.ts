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
    paymentId: string;
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
          error: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    const {
      paymentId,
    } = await context.params;

    const admin =
      createAdminClient();

    let query =
      admin
        .from(
          "investment_payments",
        )
        .select(
          `
          id,
          investor_id,
          opportunity_id,
          subscription_id,

          expected_amount,
          reported_amount,
          verified_amount,

          status,

          investor_reported_at,
          verified_at,
          created_at,

          investor:profiles!investment_payments_investor_id_fkey (
            id,
            first_name,
            last_name
          ),

          opportunity:investment_opportunities!investment_payments_opportunity_id_fkey (
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
          paymentId,
        )
        .eq(
          "status",
          "verified",
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
      user.role !== "admin" &&
      user.role !== "super_admin"
    ) {
      return NextResponse.json(
        {
          error: "Forbidden.",
        },
        {
          status: 403,
        },
      );
    }

    const {
      data: payment,
      error: paymentError,
    } =
      await query.maybeSingle();

    if (
      paymentError ||
      !payment
    ) {
      console.error(
        "Funding confirmation PDF lookup error:",
        paymentError,
      );

      return NextResponse.json(
        {
          error:
            "Verified funding confirmation not found.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * --------------------------------------------------------
     * Actual funded position
     * --------------------------------------------------------
     *
     * funded_at remains the real operational/audit timestamp.
     * It is never rewritten for historical presentation.
     * --------------------------------------------------------
     */

    const {
      data: position,
      error: positionError,
    } =
      await admin
        .from(
          "investment_positions",
        )
        .select(
          `
          id,
          principal_amount,
          currency,
          status,
          funded_at
          `,
        )
        .eq(
          "payment_id",
          payment.id,
        )
        .eq(
          "investor_id",
          payment.investor_id,
        )
        .maybeSingle();

    if (
      positionError
    ) {
      console.error(
        "Funding confirmation position lookup error:",
        positionError,
      );
    }

    /*
     * --------------------------------------------------------
     * Investor-facing historical document timestamp
     * --------------------------------------------------------
     *
     * This is populated by the Funding Verified notification:
     *
     * payment:<payment-id>:verified
     *
     * We read the historical timestamp from the exact
     * Funding Confirmation document belonging to this payment.
     *
     * We DO NOT modify:
     *
     *   payment.verified_at
     *   payment.created_at
     *   position.funded_at
     *   document.published_at
     *   document.created_at
     * --------------------------------------------------------
     */

    const {
      data: documentRecord,
      error: documentError,
    } =
      await admin
        .from(
          "investor_documents",
        )
        .select(
          `
          id,
          historical_published_at,
          published_at,
          effective_date
          `,
        )
        .eq(
          "investor_id",
          payment.investor_id,
        )
        .eq(
          "document_type",
          "funding_confirmation",
        )
        .eq(
          "source_type",
          "investment_payment",
        )
        .eq(
          "source_id",
          payment.id,
        )
        .maybeSingle();

    if (
      documentError
    ) {
      console.error(
        "Funding confirmation historical date lookup error:",
        documentError,
      );
    }

    const investor =
      normalizeRelation(
        payment.investor,
      );

    const opportunity =
      normalizeRelation(
        payment.opportunity,
      );

    const investorName =
      fullName(
        investor?.first_name,
        investor?.last_name,
      );

    const opportunityTitle =
      opportunity?.title ??
      "Investment Opportunity";

    const currency =
      position?.currency ??
      "USD";

    /*
     * --------------------------------------------------------
     * Effective investor-facing chronology
     * --------------------------------------------------------
     *
     * Historical timestamp exists:
     *
     *   Effective Date = historical timestamp
     *   Verified Date  = historical timestamp
     *   Funded Date    = historical timestamp
     *
     * No historical timestamp:
     *
     *   Effective Date = actual verified_at
     *   Verified Date  = actual verified_at
     *   Funded Date    = actual funded_at, falling back to
     *                    actual verified_at
     * --------------------------------------------------------
     */

    const historicalDate =
      documentRecord
        ?.historical_published_at ??
      null;

    const displayedEffectiveDate =
      historicalDate ??
      payment.verified_at;

    const displayedVerifiedDate =
      historicalDate ??
      payment.verified_at;

    const displayedFundedDate =
      historicalDate ??
      position?.funded_at ??
      payment.verified_at;

    const pdfBuffer =
      await buildInvestorDocumentPdf(
        {
          documentLabel:
            "Funding Confirmation",

          title:
            `Funding Confirmation - ${opportunityTitle}`,

          subtitle:
            "Confirmation of investment capital verified by Tevuah Reserve.",

          investorName,

          reference:
            payment.id,

          effectiveDate:
            formatDocumentDate(
              displayedEffectiveDate,
            ),

          rows: [
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
                  opportunity?.asset_category,
                ),
            },
            {
              label:
                "Location",
              value:
                opportunity?.location ??
                "Not specified",
            },
            {
              label:
                "Expected amount",
              value:
                formatDocumentMoney(
                  payment.expected_amount,
                  currency,
                ),
            },
            {
              label:
                "Reported amount",
              value:
                formatDocumentMoney(
                  payment.reported_amount,
                  currency,
                ),
            },
            {
              label:
                "Verified amount",
              value:
                formatDocumentMoney(
                  payment.verified_amount,
                  currency,
                ),
            },
            {
              label:
                "Payment status",
              value:
                humanize(
                  payment.status,
                ),
            },
            {
              label:
                "Verified date",
              value:
                formatDocumentDate(
                  displayedVerifiedDate,
                ),
            },
            {
              label:
                "Position ID",
              value:
                position?.id ??
                "Not available",
            },
            {
              label:
                "Position status",
              value:
                humanize(
                  position?.status,
                ),
            },
            {
              label:
                "Funded date",
              value:
                formatDocumentDate(
                  displayedFundedDate,
                ),
            },
          ],

          notes: [
            "This confirmation is issued only for a payment recorded as verified.",
            "The verified amount represents the capital recognized by Tevuah Reserve for this investment funding event.",
            "Investment valuation and subsequent performance are reported separately.",
          ],
        },
      );

    const fileName =
      `${safePdfFileName(
        opportunityTitle,
      )}-funding-confirmation.pdf`;

    return new Response(
      pdfBuffer,
      {
        status: 200,

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
  } catch (
    error
  ) {
    console.error(
      "Funding confirmation PDF error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to generate funding confirmation.",
      },
      {
        status: 500,
      },
    );
  }
}

function normalizeRelation<T>(
  value:
    | T
    | T[]
    | null
    | undefined,
) {
  if (
    Array.isArray(
      value,
    )
  ) {
    return (
      value[0] ??
      null
    );
  }

  return (
    value ??
    null
  );
}

function fullName(
  first:
    | string
    | null
    | undefined,
  last:
    | string
    | null
    | undefined,
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
    | string
    | null
    | undefined,
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