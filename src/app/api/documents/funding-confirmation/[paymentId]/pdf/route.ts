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

    if (
      !user
    ) {
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
        payment,
      error:
        paymentError,
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
          status:
            404,
        },
      );
    }

    const {
      data:
        position,
      error:
        positionError,
    } = await admin
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
              payment.verified_at,
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
                  payment.verified_at,
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
                  position?.funded_at ??
                  payment.verified_at,
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
        status:
          500,
      },
    );
  }
}

function normalizeRelation<
  T,
>(
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
  if (
    !value
  ) {
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