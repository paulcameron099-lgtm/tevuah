import {
  NextResponse,
} from "next/server";

import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

import {
  recordComplianceAudit,
} from "@/src/lib/compliance/audit";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

type Payload = {
  notes: string;
};

export async function POST(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  try {
    const supabase =
      await createClient();

    const {
      data: claimsData,
    } =
      await supabase.auth.getClaims();

    const adminUserId =
      claimsData?.claims?.sub;

    if (!adminUserId) {
      return NextResponse.json(
        {
          error:
            "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    const admin =
      createAdminClient();

    const {
      data: adminProfile,
    } = await admin
      .from("profiles")
      .select(
        "id, role",
      )
      .eq(
        "id",
        adminUserId,
      )
      .maybeSingle();

    if (
      !adminProfile ||
      (
        adminProfile.role !==
          "admin" &&
        adminProfile.role !==
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
      userId,
    } = await params;

    const body =
      (await request.json()) as Payload;

    const notes =
      body.notes
        ?.trim();

    if (!notes) {
      return NextResponse.json(
        {
          error:
            "Enter an admin note.",
        },
        {
          status: 400,
        },
      );
    }

    const now =
      new Date().toISOString();

    const {
      error,
    } = await admin
      .from(
        "compliance_reviews",
      )
      .update({
        admin_notes:
          notes,

        assigned_admin_id:
          adminUserId,

        updated_at:
          now,
      })
      .eq(
        "user_id",
        userId,
      );

    if (error) {
      console.error(
        "Admin note save error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to save admin note.",
        },
        {
          status: 500,
        },
      );
    }

    await recordComplianceAudit({
      actorUserId:
        adminUserId,

      investorUserId:
        userId,

      action:
        "admin_note_added",

      metadata: {
        noteLength:
          notes.length,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Admin notes API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while saving the admin note.",
      },
      {
        status: 500,
      },
    );
  }
}