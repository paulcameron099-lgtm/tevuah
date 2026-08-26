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

const ALLOWED_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

const MAX_FILE_SIZE =
  8 * 1024 * 1024;

function extensionFor(
  mimeType: string,
) {
  switch (mimeType) {
    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    default:
      return "jpg";
  }
}

export async function POST(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  try {
    const user =
      await getCurrentUser();

    if (
      !user ||
      (
        user.role !==
          "admin" &&
        user.role !==
          "super_admin"
      )
    ) {
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

    const {
      data: opportunity,
      error: opportunityError,
    } = await admin
      .from(
        "investment_opportunities",
      )
      .select(
        `
        id,
        cover_image_path
        `,
      )
      .eq(
        "id",
        opportunityId,
      )
      .maybeSingle();

    if (
      opportunityError ||
      !opportunity
    ) {
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

    if (
      !(file instanceof File)
    ) {
      return NextResponse.json(
        {
          error:
            "Select a cover image.",
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
            "Cover image must be JPG, PNG or WebP.",
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
            "Cover image must be 8 MB or smaller.",
        },
        {
          status: 400,
        },
      );
    }

    const extension =
      extensionFor(
        file.type,
      );

    const storagePath =
      `${opportunityId}/cover-${randomUUID()}.${extension}`;

    const bytes =
      Buffer.from(
        await file.arrayBuffer(),
      );

    const {
      error: uploadError,
    } = await admin.storage
      .from(
        "investment-media",
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
        "Opportunity cover upload error:",
        uploadError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to upload cover image.",
        },
        {
          status: 500,
        },
      );
    }

    const oldCoverPath =
      opportunity.cover_image_path;

    const {
      error: updateError,
    } = await admin
      .from(
        "investment_opportunities",
      )
      .update({
        cover_image_path:
          storagePath,

        updated_by:
          user.id,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        opportunityId,
      );

    if (updateError) {
      await admin.storage
        .from(
          "investment-media",
        )
        .remove([
          storagePath,
        ]);

      return NextResponse.json(
        {
          error:
            "Unable to save cover image.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * Remove previous image only after
     * the database points to the new one.
     */
    if (oldCoverPath) {
      await admin.storage
        .from(
          "investment-media",
        )
        .remove([
          oldCoverPath,
        ]);
    }

    return NextResponse.json({
      success: true,

      coverImagePath:
        storagePath,
    });
  } catch (error) {
    console.error(
      "Opportunity cover API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while uploading the cover image.",
      },
      {
        status: 500,
      },
    );
  }
}