
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
    subscriptionId: string;
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
      subscriptionId,
    } = await context.params;

    const admin =
      createAdminClient();

    let query =
      admin
        .from(
          "investment_subscriptions",
        )
        .select(
          `
          id,
          investor_id,
          opportunity_id,

          commitment_amount,
          status,

          submitted_at,
          reviewed_at,
          created_at,

          investor:profiles!investment_subscriptions_investor_id_fkey (
            id,
            first_name,
            last_name
          ),

          opportunity:investment_opportunities!investment_subscriptions_opportunity_id_fkey (
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
          subscriptionId,
        );

    if (
      user.role ===
      "investor"
    ) {
      query =
        query
          .eq(
            "investor_id",
            user.id,
          )
          .not(
            "submitted_at",
            "is",
            null,
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
        subscription,
      error:
        subscriptionError,
    } =
      await query.maybeSingle();

    if (
      subscriptionError ||
      !subscription ||
      !subscription.submitted_at
    ) {
      console.error(
        "Subscription agreement PDF lookup error:",
        subscriptionError,
      );

      return NextResponse.json(
        {
          error:
            "Signed subscription agreement not found.",
        },
        {
          status:
            404,
        },
      );
    }

    const investor =
      normalizeRelation(
        subscription.investor,
      );

    const opportunity =
      normalizeRelation(
        subscription.opportunity,
      );

    const investorName =
      fullName(
        investor?.first_name,
        investor?.last_name,
      );

    const opportunityTitle =
      opportunity?.title ??
      "Investment Opportunity";

    const pdfBuffer =
      await buildInvestorDocumentPdf(
        {
          documentLabel:
            "Subscription Agreement",

          title:
            `Signed Subscription Agreement - ${opportunityTitle}`,

          subtitle:
            "Electronic subscription record for the investor commitment submitted through Tevuah Reserve.",

          investorName,

          reference:
            subscription.id,

          effectiveDate:
            formatDocumentDate(
              subscription.submitted_at,
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
                "Commitment amount",
              value:
                formatDocumentMoney(
                  subscription.commitment_amount,
                ),
            },
            {
              label:
                "Subscription status",
              value:
                humanize(
                  subscription.status,
                ),
            },
            {
              label:
                "Submitted",
              value:
                formatDocumentDate(
                  subscription.submitted_at,
                ),
            },
            {
              label:
                "Reviewed",
              value:
                formatDocumentDate(
                  subscription.reviewed_at,
                ),
            },
          ],

          notes: [
            "This document is generated from the subscription record stored by Tevuah Reserve.",
            "The document records the submitted investment commitment and is not a representation that funding has been received.",
            "Funding is recognized separately only after payment verification.",
          ],
        },
      );

    const fileName =
      `${safePdfFileName(
        opportunityTitle,
      )}-subscription-agreement.pdf`;

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
      "Subscription agreement PDF error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to generate subscription agreement.",
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