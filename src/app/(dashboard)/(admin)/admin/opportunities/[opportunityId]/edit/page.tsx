import {
  ArrowLeft,
} from "lucide-react";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import { OpportunityEditor } from "@/src/components/admin/opportunities/opportunity-editor";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

type PageProps = {
  params: Promise<{
    opportunityId: string;
  }>;
};

export default async function EditOpportunityPage({
  params,
}: PageProps) {
  /*
   * --------------------------------------------------
   * 1. ADMIN ACCESS
   * --------------------------------------------------
   */
  await requireAdmin();

  const {
    opportunityId,
  } = await params;

  const admin =
    createAdminClient();

  /*
   * --------------------------------------------------
   * 2. LOAD OPPORTUNITY + ESTATES + DOCUMENTS
   * --------------------------------------------------
   */
const [
  opportunityResult,
  estatesResult,
  documentsResult,
  fundingInstructionsResult,
] = await Promise.all([
    admin
      .from(
        "investment_opportunities",
      )
      .select(
        `
        id,
        title,
        slug,

        short_description,
        full_description,

        asset_category,
        estate_id,
        location,

        funding_target,
        minimum_investment,

        expected_duration_months,

        target_return_min,
        target_return_max,
        target_return_note,

        cover_image_path,

        status,

        published_at,
        closed_at,

        created_at,
        updated_at
        `,
      )
      .eq(
        "id",
        opportunityId,
      )
      .maybeSingle(),

    admin
      .from(
        "investment_estates",
      )
      .select(
        `
        id,
        name
        `,
      )
      .eq(
        "status",
        "active",
      )
      .order(
        "name",
      ),

    admin
      .from(
        "investment_opportunity_documents",
      )
      .select(
        `
        id,
        label,
        document_type,
        storage_path,
        file_name,
        mime_type,
        created_at
        `,
      )
      .eq(
        "opportunity_id",
        opportunityId,
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        },
      ),
      admin
  .from(
    "investment_funding_instructions",
  )
  .select(
    `
    id,
    opportunity_id,
    payment_method,

    bank_name,
    beneficiary_name,

    account_number,
    routing_number,
    swift_code,
    iban,

    bank_address,

    payment_reference_prefix,

    instructions,

    status,

    created_at,
    updated_at
    `,
  )
  .eq(
    "opportunity_id",
    opportunityId,
  )
  .maybeSingle(),

  ]);

  /*
   * --------------------------------------------------
   * 3. OPPORTUNITY MUST EXIST
   * --------------------------------------------------
   */
  if (
    opportunityResult.error ||
    !opportunityResult.data
  ) {
    console.error(
      "Edit opportunity load error:",
      opportunityResult.error,
    );

    notFound();
  }

  const opportunity =
    opportunityResult.data;

  /*
   * Estate/document errors should not
   * incorrectly turn the whole page into
   * a 404, but log them for development.
   */
  if (estatesResult.error) {
    console.error(
      "Opportunity estate options load error:",
      estatesResult.error,
    );
  }

  if (documentsResult.error) {
    console.error(
      "Opportunity documents load error:",
      documentsResult.error,
    );
  }

  if (
  fundingInstructionsResult.error
) {
  console.error(
    "Funding instructions load error:",
    fundingInstructionsResult.error,
  );
}

  /*
   * --------------------------------------------------
   * 4. CREATE TEMPORARY COVER IMAGE URL
   * --------------------------------------------------
   */
  let coverImageUrl:
    | string
    | null =
    null;

  if (
    opportunity.cover_image_path
  ) {
    const {
      data: signedCover,
      error: signedCoverError,
    } = await admin.storage
      .from(
        "investment-media",
      )
      .createSignedUrl(
        opportunity.cover_image_path,
        60 * 30,
      );

    if (signedCoverError) {
      console.error(
        "Cover image signed URL error:",
        signedCoverError,
      );
    }

    coverImageUrl =
      signedCover?.signedUrl ??
      null;
  }

  /*
   * --------------------------------------------------
   * 5. CREATE TEMPORARY DOCUMENT URLs
   * --------------------------------------------------
   */
  const documentRecords =
    await Promise.all(
      (
        documentsResult.data ??
        []
      ).map(
        async (
          document,
        ) => {
          const {
            data:
              signedDocument,
            error:
              signedDocumentError,
          } = await admin.storage
            .from(
              "investment-documents",
            )
            .createSignedUrl(
              document.storage_path,
              60 * 10,
            );

          if (
            signedDocumentError
          ) {
            console.error(
              `Document signed URL error for ${document.id}:`,
              signedDocumentError,
            );
          }

          return {
            id:
              document.id,

            label:
              document.label,

            documentType:
              document.document_type,

            fileName:
              document.file_name,

            signedUrl:
              signedDocument?.signedUrl ??
              null,
          };
        },
      ),
    );

  /*
   * --------------------------------------------------
   * 6. MONEY IS STORED AS CENTS
   * --------------------------------------------------
   */
  const fundingTarget =
    Number(
      opportunity.funding_target,
    ) / 100;

  const minimumInvestment =
    Number(
      opportunity.minimum_investment,
    ) / 100;

  /*
   * --------------------------------------------------
   * 7. RENDER PAGE
   * --------------------------------------------------
   */
  return (
    <div className="space-y-8">
      <Link
        href="/admin/opportunities"
        className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-forest-950"
      >
        <ArrowLeft className="size-4" />

        Back to opportunities
      </Link>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Investment administration
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          Edit Opportunity
        </h1>

        <p className="mt-3 text-sm text-stone-600">
          {opportunity.title}
        </p>
      </div>

      <OpportunityEditor
        estates={
          estatesResult.data ??
          []
        }
        documents={
          documentRecords
        }
        opportunity={{
          id:
            opportunity.id,

          title:
            opportunity.title,

          slug:
            opportunity.slug,

          shortDescription:
            opportunity.short_description,

          fullDescription:
            opportunity.full_description,

          assetCategory:
            opportunity.asset_category,

          estateId:
            opportunity.estate_id,

          location:
            opportunity.location,

          fundingTarget,

          minimumInvestment,

          expectedDurationMonths:
            opportunity.expected_duration_months,

          targetReturnMin:
            opportunity.target_return_min !=
              null
              ? Number(
                  opportunity.target_return_min,
                )
              : null,

          targetReturnMax:
            opportunity.target_return_max !=
              null
              ? Number(
                  opportunity.target_return_max,
                )
              : null,

          targetReturnNote:
            opportunity.target_return_note,

          coverImagePath:
            opportunity.cover_image_path,

          coverImageUrl,

          status:
            opportunity.status,
        }}

        fundingInstructions={
    fundingInstructionsResult.data
    ? {
        id:
          fundingInstructionsResult.data.id,

        paymentMethod:
          fundingInstructionsResult.data.payment_method,

        bankName:
          fundingInstructionsResult.data.bank_name,

        beneficiaryName:
          fundingInstructionsResult.data.beneficiary_name,

        accountNumber:
          fundingInstructionsResult.data.account_number,

        routingNumber:
          fundingInstructionsResult.data.routing_number,

        swiftCode:
          fundingInstructionsResult.data.swift_code,

        iban:
          fundingInstructionsResult.data.iban,

        bankAddress:
          fundingInstructionsResult.data.bank_address,

        paymentReferencePrefix:
          fundingInstructionsResult.data.payment_reference_prefix,

        instructions:
          fundingInstructionsResult.data.instructions,

        status:
          fundingInstructionsResult.data.status,
      }
    : null
}
        
      />
    </div>
  );
}