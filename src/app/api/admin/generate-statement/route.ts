import {
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type Payload = {
  investorId?: string;

  statementType?: string;

  periodStart?: string;

  periodEnd?: string;

  reconstructedFromLegacy?: boolean;

  historicalGeneratedAt?:
    | string
    | null;

  historicalPublishedAt?:
    | string
    | null;

  reconstructionNote?:
    | string
    | null;

  notes?:
    | string
    | null;
};

const ALLOWED_STATEMENT_TYPES =
  new Set([
    "monthly",
    "quarterly",
    "annual",
    "periodic",
    "final",
  ]);

export async function POST(
  request: Request,
) {
  try {
    /*
     * ==================================================
     * 1. AUTH
     * ==================================================
     */
    const user =
      await getCurrentUser();

    if (!user) {
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

    if (
      user.role !== "admin" &&
      user.role !== "super_admin"
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

    /*
     * ==================================================
     * 2. BODY
     * ==================================================
     */
    const body =
      (await request.json()) as Payload;

    const investorId =
      body.investorId?.trim();

    const statementType =
      body.statementType?.trim() ??
      "periodic";

    const periodStart =
      body.periodStart?.trim();

    const periodEnd =
      body.periodEnd?.trim();

    if (!investorId) {
      return NextResponse.json(
        {
          error:
            "Investor is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !ALLOWED_STATEMENT_TYPES.has(
        statementType,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid statement type.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !periodStart ||
      !/^\d{4}-\d{2}-\d{2}$/.test(
        periodStart,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Valid period start is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !periodEnd ||
      !/^\d{4}-\d{2}-\d{2}$/.test(
        periodEnd,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Valid period end is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      periodEnd <
      periodStart
    ) {
      return NextResponse.json(
        {
          error:
            "Period end cannot be before period start.",
        },
        {
          status: 400,
        },
      );
    }

    const reconstructed =
      Boolean(
        body.reconstructedFromLegacy,
      );

    if (
      reconstructed &&
      !body.reconstructionNote
        ?.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Reconstruction reason is required for a legacy statement.",
        },
        {
          status: 400,
        },
      );
    }

    const admin =
      createAdminClient();

    /*
     * ==================================================
     * 3. VERIFY INVESTOR
     * ==================================================
     */
    const {
      data: investor,
      error: investorError,
    } = await admin
      .from(
        "profiles",
      )
      .select(
        `
        id,
        role
        `,
      )
      .eq(
        "id",
        investorId,
      )
      .maybeSingle();

    if (
      investorError ||
      !investor
    ) {
      return NextResponse.json(
        {
          error:
            "Investor could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      investor.role !==
      "investor"
    ) {
      return NextResponse.json(
        {
          error:
            "Selected user is not an investor.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ==================================================
     * 4. GENERATE ATOMIC SNAPSHOT
     * ==================================================
     */
    const {
      data: result,
      error: generationError,
    } = await admin.rpc(
      "generate_investor_statement",
      {
        p_investor_id:
          investorId,

        p_period_start:
          periodStart,

        p_period_end:
          periodEnd,

        p_statement_type:
          statementType,

        p_admin_id:
          user.id,

        p_historical_generated_at:
          reconstructed
            ? body.historicalGeneratedAt ??
              null
            : null,

        p_historical_published_at:
          reconstructed
            ? body.historicalPublishedAt ??
              null
            : null,

        p_reconstructed_from_legacy:
          reconstructed,

        p_reconstruction_note:
          reconstructed
            ? body.reconstructionNote
                ?.trim() ??
              null
            : null,

        p_notes:
          body.notes?.trim() ??
          null,
      },
    );

    if (generationError) {
      console.error(
        "generate_investor_statement RPC error:",
        generationError,
      );

      return NextResponse.json(
        {
          error:
            generationError.message ??
            "Unable to generate investor statement.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * Supabase RPC usually returns JSON object here.
     */
    const statementId =
      result &&
      typeof result ===
        "object" &&
      !Array.isArray(
        result,
      ) &&
      "statementId" in
        result
        ? String(
            result.statementId,
          )
        : null;

    if (!statementId) {
      console.error(
        "Statement RPC did not return statementId:",
        result,
      );

      return NextResponse.json(
        {
          error:
            "Statement was generated but its ID was not returned.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * ==================================================
     * 5. SUCCESS
     * ==================================================
     */
    return NextResponse.json({
      success: true,

      statementId,

      result,
    });
  } catch (error) {
    console.error(
      "Generate statement API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while generating the statement.",
      },
      {
        status: 500,
      },
    );
  }
}