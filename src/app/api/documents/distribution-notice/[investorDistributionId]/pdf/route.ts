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
    investorDistributionId: string;
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
      investorDistributionId,
    } =
      await context.params;

    const admin =
      createAdminClient();

    let query =
      admin
        .from(
          "investor_distributions",
        )
        .select(
          `
          id,
          investor_id,
          distribution_id,
          position_id,

          gross_amount,
          withholding_amount,
          net_amount,

          currency,
          status,

          paid_at,
          payment_reference,

          created_at,

          investor:profiles!investor_distributions_investor_id_fkey (
            id,
            first_name,
            last_name
          ),

          distribution:investment_distributions!investor_distributions_distribution_id_fkey (
            id,
            title,
            distribution_type,
            record_date,
            payment_date,
            status,
            notes
          ),

          position:investment_positions!investor_distributions_position_id_fkey (
            id,
            opportunity_id,
            principal_amount,
            status,
            funded_at,

            opportunity:investment_opportunities!investment_positions_opportunity_id_fkey (
              id,
              slug,
              title,
              asset_category,
              location
            )
          )
          `,
        )
        .eq(
          "id",
          investorDistributionId,
        )
        .eq(
          "status",
          "paid",
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
        allocation,
      error:
        allocationError,
    } =
      await query.maybeSingle();

    if (
      allocationError ||
      !allocation
    ) {
      console.error(
        "Distribution notice PDF lookup error:",
        allocationError,
      );

      return NextResponse.json(
        {
          error:
            "Paid distribution notice not found.",
        },
        {
          status:
            404,
        },
      );
    }

    const investor =
      normalizeRelation(
        allocation.investor,
      );

    const distribution =
      normalizeRelation(
        allocation.distribution,
      );

    const position =
      normalizeRelation(
        allocation.position,
      );

    const opportunity =
      normalizeRelation(
        position?.opportunity,
      );

    const investorName =
      fullName(
        investor?.first_name,
        investor?.last_name,
      );

    const opportunityTitle =
      opportunity?.title ??
      "Investment Opportunity";

    const distributionTitle =
      distribution?.title ??
      "Investor Distribution";

    const currency =
      allocation.currency ??
      "USD";

    const pdfBuffer =
      await buildInvestorDocumentPdf(
        {
          documentLabel:
            "Distribution Notice",

          title:
            `Distribution Notice - ${distributionTitle}`,

          subtitle:
            `Completed investor cash distribution for ${opportunityTitle}.`,

          investorName,

          reference:
            allocation.payment_reference ??
            allocation.id,

          effectiveDate:
            formatDocumentDate(
              allocation.paid_at ??
              distribution?.payment_date,
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
                "Distribution",
              value:
                distributionTitle,
            },
            {
              label:
                "Distribution type",
              value:
                humanize(
                  distribution?.distribution_type,
                ),
            },
            {
              label:
                "Record date",
              value:
                formatDocumentDate(
                  distribution?.record_date,
                ),
            },
            {
              label:
                "Payment date",
              value:
                formatDocumentDate(
                  allocation.paid_at ??
                  distribution?.payment_date,
                ),
            },
            {
              label:
                "Gross amount",
              value:
                formatDocumentMoney(
                  allocation.gross_amount,
                  currency,
                ),
            },
            {
              label:
                "Withholding",
              value:
                formatDocumentMoney(
                  allocation.withholding_amount,
                  currency,
                ),
            },
            {
              label:
                "Net amount",
              value:
                formatDocumentMoney(
                  allocation.net_amount,
                  currency,
                ),
            },
            {
              label:
                "Payment reference",
              value:
                allocation.payment_reference ??
                "Not provided",
            },
            {
              label:
                "Status",
              value:
                humanize(
                  allocation.status,
                ),
            },
          ],

          notes: [
            "This notice represents an investor distribution allocation recorded as paid.",
            "Gross amount, withholding and net amount are reported from the finalized investor distribution record.",
            "Tax treatment may vary and should be determined using the applicable tax reporting documents and professional advice.",
          ],
        },
      );

    const fileName =
      `${safePdfFileName(
        opportunityTitle,
      )}-${safePdfFileName(
        distributionTitle,
      )}-distribution-notice.pdf`;

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
      "Distribution notice PDF error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to generate distribution notice.",
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