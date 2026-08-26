import {
  randomUUID,
} from "crypto";

import {
  NextResponse,
} from "next/server";

import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    opportunityId: string;
  }>;
};

const ALLOWED_TYPES = new Set([
  "application/pdf",

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

const ALLOWED_DOCUMENT_TYPES =
  new Set([
    "offering_memorandum",
    "financial_report",
    "valuation",
    "estate_report",
    "legal",
    "subscription_document",
    "presentation",
    "other",
  ]);

const MAX_FILE_SIZE =
  20 * 1024 * 1024;

function safeFileName(
  value: string,
) {
  return value
    .trim()
    .replace(
      /[^a-zA-Z0-9._-]+/g,
      "-",
    );
}

async function requireAdminUser() {
  const user =
    await getCurrentUser();

  if (!user) {
    return null;
  }

  if (
    user.role !== "admin" &&
    user.role !==
      "super_admin"
  ) {
    return null;
  }

  return user;
}

export async function POST(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  try {
    const user =
      await requireAdminUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Administrator access required.",
        },
        {
          status: 403,
        },
      );
    }

    const {
      opportunityId,
    } = await params;

    const admin =
      createAdminClient();

    /*
     * Verify opportunity.
     */
    const {
      data: opportunity,
    } = await admin
      .from(
        "investment_opportunities",
      )
      .select(
        "id",
      )
      .eq(
        "id",
        opportunityId,
      )
      .maybeSingle();

    if (!opportunity) {
      return NextResponse.json(
        {
          error:
            "Investment opportunity could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    const formData =
      await request.formData();

    const file =
      formData.get(
        "file",
      );

    const label =
      String(
        formData.get(
          "label",
        ) ?? "",
      ).trim();

    const documentType =
      String(
        formData.get(
          "documentType",
        ) ?? "",
      ).trim();

    if (
      !(file instanceof File)
    ) {
      return NextResponse.json(
        {
          error:
            "Select a document to upload.",
        },
        {
          status: 400,
        },
      );
    }

    if (!label) {
      return NextResponse.json(
        {
          error:
            "Document label is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !ALLOWED_DOCUMENT_TYPES.has(
        documentType,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Select a valid document type.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !ALLOWED_TYPES.has(
        file.type,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Only PDF, DOCX and XLSX files are allowed.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          error:
            "Document must be 20 MB or smaller.",
        },
        {
          status: 400,
        },
      );
    }

    const sanitized =
      safeFileName(
        file.name,
      );

    const storagePath =
      `${opportunityId}/${documentType}/${randomUUID()}-${sanitized}`;

    const bytes =
      Buffer.from(
        await file.arrayBuffer(),
      );

    /*
     * Upload to private bucket.
     */
    const {
      error: uploadError,
    } = await admin.storage
      .from(
        "investment-documents",
      )
      .upload(
        storagePath,
        bytes,
        {
          contentType:
            file.type,

          upsert:
            false,
        },
      );

    if (uploadError) {
      console.error(
        "Opportunity document upload error:",
        uploadError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to upload investment document.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * Persist metadata.
     */
    const {
      data: document,
      error: databaseError,
    } = await admin
      .from(
        "investment_opportunity_documents",
      )
      .insert({
        opportunity_id:
          opportunityId,

        label,

        document_type:
          documentType,

        storage_path:
          storagePath,

        file_name:
          file.name,

        mime_type:
          file.type,

        created_by:
          user.id,
      })
      .select(
        `
        id,
        label,
        document_type,
        file_name,
        mime_type,
        created_at
        `,
      )
      .single();

    if (databaseError) {
      console.error(
        "Opportunity document metadata error:",
        databaseError,
      );

      /*
       * Remove uploaded file if metadata
       * could not be saved.
       */
      await admin.storage
        .from(
          "investment-documents",
        )
        .remove([
          storagePath,
        ]);

      return NextResponse.json(
        {
          error:
            "Unable to save investment document.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,

      document,
    });
  } catch (error) {
    console.error(
      "Opportunity document API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while uploading the document.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  try {
    const user =
      await requireAdminUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Administrator access required.",
        },
        {
          status: 403,
        },
      );
    }

    const {
      opportunityId,
    } = await params;

    const body =
      (await request.json()) as {
        documentId?: string;
      };

    if (!body.documentId) {
      return NextResponse.json(
        {
          error:
            "Document ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const admin =
      createAdminClient();

    const {
      data: document,
      error: documentError,
    } = await admin
      .from(
        "investment_opportunity_documents",
      )
      .select(
        `
        id,
        storage_path
        `,
      )
      .eq(
        "id",
        body.documentId,
      )
      .eq(
        "opportunity_id",
        opportunityId,
      )
      .maybeSingle();

    if (
      documentError ||
      !document
    ) {
      return NextResponse.json(
        {
          error:
            "Document could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    const {
      error: storageError,
    } = await admin.storage
      .from(
        "investment-documents",
      )
      .remove([
        document.storage_path,
      ]);

    if (storageError) {
      console.error(
        "Opportunity document delete error:",
        storageError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to remove document from storage.",
        },
        {
          status: 500,
        },
      );
    }

    const {
      error: databaseError,
    } = await admin
      .from(
        "investment_opportunity_documents",
      )
      .delete()
      .eq(
        "id",
        body.documentId,
      );

    if (databaseError) {
      console.error(
        "Opportunity document row delete error:",
        databaseError,
      );

      return NextResponse.json(
        {
          error:
            "Document file was removed, but its database record could not be deleted.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Delete opportunity document error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while deleting the document.",
      },
      {
        status: 500,
      },
    );
  }
}