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

type UpdateOpportunityPayload = {
  title: string;

  slug: string;

  shortDescription?: string;

  fullDescription?: string;

  assetCategory: string;

  estateId?: string | null;

  location?: string;

  fundingTarget: number;

  minimumInvestment: number;

  expectedDurationMonths?: number | null;

  targetReturnMin?: number | null;

  targetReturnMax?: number | null;

  targetReturnNote?: string;
};

const ALLOWED_CATEGORIES = [
  "vineyard",
  "olive_estate",
  "agtech",
  "fine_wine",
  "mixed",
  "other",
] as const;

function dollarsToCents(
  value: number,
) {
  return Math.round(
    value * 100,
  );
}

function normalizeSlug(
  value: string,
) {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    );
}

export async function PATCH(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  try {
    /*
     * --------------------------------------------------
     * 1. AUTHENTICATE ADMIN
     * --------------------------------------------------
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

    const isAdmin =
      user.role === "admin" ||
      user.role ===
        "super_admin";

    if (!isAdmin) {
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
     * --------------------------------------------------
     * 2. VERIFY OPPORTUNITY
     * --------------------------------------------------
     */
    const {
      data: existing,
      error: existingError,
    } = await admin
      .from(
        "investment_opportunities",
      )
      .select(
        `
        id,
        status
        `,
      )
      .eq(
        "id",
        opportunityId,
      )
      .maybeSingle();

    if (
      existingError ||
      !existing
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

    /*
     * Closed opportunities should not
     * be edited directly.
     */
    if (
      existing.status ===
      "closed"
    ) {
      return NextResponse.json(
        {
          error:
            "Closed opportunities cannot be edited. Reopen it as a draft first.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 3. READ BODY
     * --------------------------------------------------
     */
    const body =
      (await request.json()) as UpdateOpportunityPayload;

    const title =
      body.title?.trim();

    const slug =
      normalizeSlug(
        body.slug ?? "",
      );

    if (!title) {
      return NextResponse.json(
        {
          error:
            "Opportunity title is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!slug) {
      return NextResponse.json(
        {
          error:
            "Opportunity slug is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !body.assetCategory ||
      !ALLOWED_CATEGORIES.includes(
        body.assetCategory as
          (typeof ALLOWED_CATEGORIES)[number],
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Select a valid asset category.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !Number.isFinite(
        body.fundingTarget,
      ) ||
      body.fundingTarget <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Funding target must be greater than zero.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !Number.isFinite(
        body.minimumInvestment,
      ) ||
      body.minimumInvestment <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Minimum investment must be greater than zero.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      body.minimumInvestment >
      body.fundingTarget
    ) {
      return NextResponse.json(
        {
          error:
            "Minimum investment cannot exceed the funding target.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      body.targetReturnMin != null &&
      body.targetReturnMax != null &&
      body.targetReturnMin >
        body.targetReturnMax
    ) {
      return NextResponse.json(
        {
          error:
            "Minimum target return cannot exceed maximum target return.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 4. VERIFY ESTATE
     * --------------------------------------------------
     */
    let estateId:
      | string
      | null =
      null;

    if (body.estateId) {
      const {
        data: estate,
        error: estateError,
      } = await admin
        .from(
          "investment_estates",
        )
        .select(
          `
          id,
          status
          `,
        )
        .eq(
          "id",
          body.estateId,
        )
        .maybeSingle();

      if (
        estateError ||
        !estate
      ) {
        return NextResponse.json(
          {
            error:
              "The selected estate or asset could not be found.",
          },
          {
            status: 400,
          },
        );
      }

      if (
        estate.status !==
        "active"
      ) {
        return NextResponse.json(
          {
            error:
              "The selected estate or asset is not active.",
          },
          {
            status: 400,
          },
        );
      }

      estateId =
        estate.id;
    }

    /*
     * --------------------------------------------------
     * 5. UPDATE
     * --------------------------------------------------
     */
    const {
      data: opportunity,
      error: updateError,
    } = await admin
      .from(
        "investment_opportunities",
      )
      .update({
        title,

        slug,

        short_description:
          body.shortDescription
            ?.trim() ||
          null,

        full_description:
          body.fullDescription
            ?.trim() ||
          null,

        asset_category:
          body.assetCategory,

        estate_id:
          estateId,

        location:
          body.location
            ?.trim() ||
          null,

        funding_target:
          dollarsToCents(
            body.fundingTarget,
          ),

        minimum_investment:
          dollarsToCents(
            body.minimumInvestment,
          ),

        expected_duration_months:
          body.expectedDurationMonths ??
          null,

        target_return_min:
          body.targetReturnMin ??
          null,

        target_return_max:
          body.targetReturnMax ??
          null,

        target_return_note:
          body.targetReturnNote
            ?.trim() ||
          null,

        updated_by:
          user.id,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        opportunityId,
      )
      .select(
        `
        id,
        title,
        slug,
        status,
        updated_at
        `,
      )
      .single();

    if (updateError) {
      console.error(
        "Opportunity update error:",
        updateError,
      );

      if (
        updateError.code ===
        "23505"
      ) {
        return NextResponse.json(
          {
            error:
              "Another opportunity already uses this URL slug.",
          },
          {
            status: 409,
          },
        );
      }

      return NextResponse.json(
        {
          error:
            "Unable to update investment opportunity.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,

      opportunity,
    });
  } catch (error) {
    console.error(
      "Update opportunity API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while updating the opportunity.",
      },
      {
        status: 500,
      },
    );
  }
}