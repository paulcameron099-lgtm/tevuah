import {
  NextResponse,
} from "next/server";

import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

type CreateOpportunityPayload = {
  title: string;

  slug: string;

  shortDescription?: string;

  fullDescription?: string;

  assetCategory: string;

  estateId?:
    | string
    | null;

  location?: string;

  fundingTarget: number;

  minimumInvestment: number;

  expectedDurationMonths?:
    | number
    | null;

  targetReturnMin?:
    | number
    | null;

  targetReturnMax?:
    | number
    | null;

  targetReturnNote?: string;

  coverImagePath?:
    | string
    | null;
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

export async function POST(
  request: Request,
) {
  try {
    /*
     * --------------------------------------------------
     * 1. LOAD CURRENT AUTHENTICATED USER
     * --------------------------------------------------
     *
     * IMPORTANT:
     * This uses the same auth helper that already
     * works in your dashboard layout.
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

    /*
     * --------------------------------------------------
     * 2. VERIFY ADMIN ROLE
     * --------------------------------------------------
     */
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

    const adminUserId =
      user.id;

    if (!adminUserId) {
      return NextResponse.json(
        {
          error:
            "Administrator user ID is unavailable.",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 3. READ REQUEST BODY
     * --------------------------------------------------
     */
    const body =
      (await request.json()) as CreateOpportunityPayload;

    const title =
      body.title?.trim();

    const slug =
      normalizeSlug(
        body.slug ?? "",
      );

    const shortDescription =
      body.shortDescription
        ?.trim() ||
      null;

    const fullDescription =
      body.fullDescription
        ?.trim() ||
      null;

    const location =
      body.location?.trim() ||
      null;

    const targetReturnNote =
      body.targetReturnNote
        ?.trim() ||
      null;

    /*
     * --------------------------------------------------
     * 4. VALIDATE REQUIRED INFORMATION
     * --------------------------------------------------
     */
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

    /*
     * --------------------------------------------------
     * 5. VALIDATE OPTIONAL NUMERIC VALUES
     * --------------------------------------------------
     */
    if (
      body.expectedDurationMonths !=
        null &&
      (
        !Number.isFinite(
          body.expectedDurationMonths,
        ) ||
        body.expectedDurationMonths <=
          0
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Expected duration must be greater than zero.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      body.targetReturnMin !=
        null &&
      !Number.isFinite(
        body.targetReturnMin,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Minimum target return is invalid.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      body.targetReturnMax !=
        null &&
      !Number.isFinite(
        body.targetReturnMax,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Maximum target return is invalid.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      body.targetReturnMin !=
        null &&
      body.targetReturnMax !=
        null &&
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
     * 6. VALIDATE ESTATE IF ONE WAS SELECTED
     * --------------------------------------------------
     */
    const admin =
      createAdminClient();

    let estateId:
      | string
      | null =
      null;

    if (body.estateId) {
      const {
        data: estate,
        error:
          estateError,
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
     * 7. CREATE DRAFT OPPORTUNITY
     * --------------------------------------------------
     */
    const {
      data: opportunity,
      error:
        opportunityError,
    } = await admin
      .from(
        "investment_opportunities",
      )
      .insert({
        title,

        slug,

        short_description:
          shortDescription,

        full_description:
          fullDescription,

        asset_category:
          body.assetCategory,

        estate_id:
          estateId,

        location,

        currency:
          "USD",

        /*
         * Money is stored as cents.
         */
        funding_target:
          dollarsToCents(
            body.fundingTarget,
          ),

        minimum_investment:
          dollarsToCents(
            body.minimumInvestment,
          ),

        total_funded:
          0,

        investor_count:
          0,

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
          targetReturnNote,

        cover_image_path:
          body.coverImagePath ??
          null,

        /*
         * Every newly created opportunity
         * starts as DRAFT.
         */
        status:
          "draft",

        published_at:
          null,

        closed_at:
          null,

        created_by:
          adminUserId,

        updated_by:
          adminUserId,

        updated_at:
          new Date().toISOString(),
      })
      .select(
        `
        id,
        slug,
        title,
        status,
        created_at
        `,
      )
      .single();

    /*
     * --------------------------------------------------
     * 8. HANDLE DATABASE ERROR
     * --------------------------------------------------
     */
    if (
      opportunityError
    ) {
      console.error(
        "Opportunity creation error:",
        opportunityError,
      );

      /*
       * PostgreSQL unique constraint violation.
       */
      if (
        opportunityError.code ===
        "23505"
      ) {
        return NextResponse.json(
          {
            error:
              "An investment opportunity already uses this URL slug.",
          },
          {
            status: 409,
          },
        );
      }

      return NextResponse.json(
        {
          error:
            "Unable to create investment opportunity.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 9. SUCCESS
     * --------------------------------------------------
     */
    return NextResponse.json({
      success: true,

      opportunity,
    });
  } catch (error) {
    console.error(
      "Create opportunity API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while creating the opportunity.",
      },
      {
        status: 500,
      },
    );
  }
}