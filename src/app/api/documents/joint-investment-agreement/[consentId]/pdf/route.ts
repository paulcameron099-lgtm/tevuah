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
    consentId: string;
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
      consentId,
    } = await context.params;

    if (
      !consentId
    ) {
      return NextResponse.json(
        {
          error:
            "Consent ID is required.",
        },
        {
          status:
            400,
        },
      );
    }

    const admin =
      createAdminClient();

    let query =
      admin
        .from(
          "joint_investment_member_consents",
        )
        .select(
          `
          id,
          joint_subscription_id,
          member_id,
          investor_id,

          consent_status,

          agreement_version,
          disclosure_version,

          agreement_document_ref,
          disclosure_document_ref,

          signature_name,
          signature_method,

          signed_at,
          accepted_at,
          created_at,

          investor:profiles!joint_investment_member_consents_investor_id_fkey (
            id,
            first_name,
            last_name
          ),

          member:joint_investment_members!joint_investment_member_consents_member_id_fkey (
            id,
            joint_subscription_id,
            investor_id,
            member_slot,
            ownership_bps,
            funding_obligation_bps,
            obligation_amount,
            member_status
          ),

          joint_subscription:joint_investment_subscriptions!joint_investment_member_consents_joint_subscription_id_fkey (
            id,
            opportunity_id,
            total_commitment_amount,
            currency,
            status,

            opportunity:investment_opportunities!joint_investment_subscriptions_opportunity_id_fkey (
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
          consentId,
        )
        .eq(
          "consent_status",
          "accepted",
        );

    /*
     * Critical ownership boundary.
     *
     * An investor may retrieve only their own accepted
     * joint-member consent.
     *
     * Admin and super_admin may retrieve any accepted
     * consent for administrative purposes.
     */
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
        consent,
      error:
        consentError,
    } =
      await query.maybeSingle();

    if (
      consentError ||
      !consent
    ) {
      console.error(
        "Joint investment agreement PDF lookup error:",
        consentError,
      );

      /*
       * Do not reveal whether another investor's
       * consent exists.
       */
      return NextResponse.json(
        {
          error:
            "Signed joint investment agreement not found.",
        },
        {
          status:
            404,
        },
      );
    }

    const investor =
      normalizeRelation(
        consent.investor,
      );

    const member =
      normalizeRelation(
        consent.member,
      );

    const jointSubscription =
      normalizeRelation(
        consent.joint_subscription,
      );

    const opportunity =
      normalizeRelation(
        jointSubscription?.opportunity,
      );

    if (
      !investor ||
      !member ||
      !jointSubscription ||
      !opportunity
    ) {
      console.error(
        "Joint investment agreement relationship lookup incomplete.",
        {
          consentId:
            consent.id,
        },
      );

      return NextResponse.json(
        {
          error:
            "Joint investment agreement record is incomplete.",
        },
        {
          status:
            409,
        },
      );
    }

    /*
     * Defensive relationship validation.
     *
     * We do not rely only on PostgREST joins.
     * Every loaded relationship must agree with the
     * canonical consent record.
     */
    if (
      investor.id !==
        consent.investor_id ||
      member.id !==
        consent.member_id ||
      member.investor_id !==
        consent.investor_id ||
      member.joint_subscription_id !==
        consent.joint_subscription_id ||
      jointSubscription.id !==
        consent.joint_subscription_id
    ) {
      console.error(
        "Joint investment agreement relationship mismatch.",
        {
          consentId:
            consent.id,
        },
      );

      return NextResponse.json(
        {
          error:
            "Joint investment agreement relationships are inconsistent.",
        },
        {
          status:
            409,
        },
      );
    }

    const investorName =
      fullName(
        investor.first_name,
        investor.last_name,
      );

    const opportunityTitle =
      opportunity.title ??
      "Investment Opportunity";

    const ownershipPercent =
      formatBasisPoints(
        member.ownership_bps,
      );

    const fundingObligationPercent =
      formatBasisPoints(
        member.funding_obligation_bps,
      );

    const pdfBuffer =
      await buildInvestorDocumentPdf(
        {
          documentLabel:
            "Joint Investment Agreement",

          title:
            `Signed Joint Investment Agreement - ${opportunityTitle}`,

          subtitle:
            "Electronic joint investment agreement and independent member consent record maintained by Tevuah Reserve.",

          investorName,

          reference:
            consent.id,

          effectiveDate:
            formatDocumentDate(
              consent.accepted_at ??
                consent.signed_at,
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
                "Ownership share",
              value:
                ownershipPercent,
            },
            {
              label:
                "Funding obligation share",
              value:
                fundingObligationPercent,
            },
            {
              label:
                "Member funding obligation",
              value:
                formatDocumentMoney(
                  member.obligation_amount,
                ),
            },
            {
              label:
                "Total joint commitment",
              value:
                formatDocumentMoney(
                  jointSubscription.total_commitment_amount,
                ),
            },
            {
              label:
                "Currency",
              value:
                jointSubscription.currency ??
                "USD",
            },
            {
              label:
                "Joint investment status",
              value:
                humanize(
                  jointSubscription.status,
                ),
            },
            {
              label:
                "Member status",
              value:
                humanize(
                  member.member_status,
                ),
            },
            {
              label:
                "Consent status",
              value:
                humanize(
                  consent.consent_status,
                ),
            },
            {
              label:
                "Agreement version",
              value:
                consent.agreement_version ??
                "Not specified",
            },
            {
              label:
                "Disclosure version",
              value:
                consent.disclosure_version ??
                "Not specified",
            },
            {
              label:
                "Signature name",
              value:
                consent.signature_name ??
                investorName,
            },
            {
              label:
                "Signature method",
              value:
                humanize(
                  consent.signature_method,
                ),
            },
            {
              label:
                "Signed",
              value:
                formatDocumentDate(
                  consent.signed_at,
                ),
            },
            {
              label:
                "Accepted",
              value:
                formatDocumentDate(
                  consent.accepted_at,
                ),
            },
            {
              label:
                "Agreement reference",
              value:
                consent.agreement_document_ref ??
                "Not specified",
            },
            {
              label:
                "Disclosure reference",
              value:
                consent.disclosure_document_ref ??
                "Not specified",
            },
          ],

          notes: [
            "This document is generated from the investor's accepted joint investment member consent record stored by Tevuah Reserve.",
            "Each member of a joint investment accepts and signs independently. This document belongs only to the investor identified above.",
            "The agreement records participation and consent. It is not evidence that the member's funding obligation has been satisfied.",
            "Funding is recognized separately only after the applicable joint-member funding obligation has been completed and verified.",
          ],
        },
      );

    const fileName =
      `${safePdfFileName(
        opportunityTitle,
      )}-joint-investment-agreement.pdf`;

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
      "Joint investment agreement PDF error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to generate joint investment agreement.",
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

function formatBasisPoints(
  value:
    number |
    null |
    undefined,
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "Not specified";
  }

  return `${(
    value / 100
  ).toFixed(
    2,
  )}%`;
}