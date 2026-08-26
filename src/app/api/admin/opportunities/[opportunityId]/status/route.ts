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

type OpportunityStatus =
  | "draft"
  | "published"
  | "closed";

type Payload = {
  status:
    OpportunityStatus;
};

export async function POST(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  try {
    /*
     * --------------------------------------------------
     * 1. AUTH
     * --------------------------------------------------
     */
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

    const body =
      (await request.json()) as Payload;

    if (
      ![
        "draft",
        "published",
        "closed",
      ].includes(
        body.status,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid opportunity status.",
        },
        {
          status: 400,
        },
      );
    }

    const admin =
      createAdminClient();

    /*
     * --------------------------------------------------
     * 2. LOAD OPPORTUNITY
     * --------------------------------------------------
     */
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

        status
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

    /*
     * --------------------------------------------------
     * 3. PUBLICATION VALIDATION
     * --------------------------------------------------
     */
    if (
      body.status ===
      "published"
    ) {
      const reasons:
        string[] = [];

      if (
        !opportunity.title?.trim()
      ) {
        reasons.push(
          "Opportunity title is missing.",
        );
      }

      if (
        !opportunity.slug?.trim()
      ) {
        reasons.push(
          "Opportunity URL slug is missing.",
        );
      }

      if (
        !opportunity.short_description
          ?.trim()
      ) {
        reasons.push(
          "Short description is missing.",
        );
      }

      if (
        !opportunity.full_description
          ?.trim()
      ) {
        reasons.push(
          "Full description is missing.",
        );
      }

      if (
        !opportunity.asset_category
      ) {
        reasons.push(
          "Asset category is missing.",
        );
      }

      /*
       * We require either an assigned estate
       * OR a meaningful location.
       */
      if (
        !opportunity.estate_id &&
        !opportunity.location
          ?.trim()
      ) {
        reasons.push(
          "Estate / asset information is missing.",
        );
      }

      if (
        !opportunity.funding_target ||
        opportunity.funding_target <=
          0
      ) {
        reasons.push(
          "Funding target is missing.",
        );
      }

      if (
        !opportunity.minimum_investment ||
        opportunity.minimum_investment <=
          0
      ) {
        reasons.push(
          "Minimum investment is missing.",
        );
      }

      if (
        !opportunity.expected_duration_months ||
        opportunity.expected_duration_months <=
          0
      ) {
        reasons.push(
          "Expected investment duration is missing.",
        );
      }

      /*
       * Require either a numeric target-return
       * range or a return/disclosure note.
       */
      const hasReturnRange =
        opportunity.target_return_min !=
          null &&
        opportunity.target_return_max !=
          null;

      const hasReturnNote =
        Boolean(
          opportunity.target_return_note
            ?.trim(),
        );

      if (
        !hasReturnRange &&
        !hasReturnNote
      ) {
        reasons.push(
          "Expected return presentation is missing.",
        );
      }

      if (
        !opportunity.cover_image_path
      ) {
        reasons.push(
          "Cover image is missing.",
        );
      }

      /*
       * At least one investment document
       * must exist before publishing.
       */
      const {
        count:
          documentCount,
        error:
          documentError,
      } = await admin
        .from(
          "investment_opportunity_documents",
        )
        .select(
          "id",
          {
            count:
              "exact",

            head:
              true,
          },
        )
        .eq(
          "opportunity_id",
          opportunityId,
        );

      if (documentError) {
        return NextResponse.json(
          {
            error:
              "Unable to validate opportunity documents.",
          },
          {
            status: 500,
          },
        );
      }

      if (
        !documentCount ||
        documentCount < 1
      ) {
        reasons.push(
          "At least one investment document must be uploaded.",
        );
      }

      /*
       * Publication is rejected with all
       * missing reasons at once.
       */
      if (
        reasons.length > 0
      ) {
        return NextResponse.json(
          {
            error:
              "This opportunity is not ready to publish.",

            publicationErrors:
              reasons,
          },
          {
            status: 422,
          },
        );
      }
    }

    /*
     * --------------------------------------------------
     * 4. STATUS TRANSITION RULES
     * --------------------------------------------------
     */

    /*
     * Closing is only allowed for something
     * that was actually published.
     */
    if (
      body.status ===
        "closed" &&
      opportunity.status !==
        "published"
    ) {
      return NextResponse.json(
        {
          error:
            "Only a published opportunity can be closed.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * Draft can be:
     * published → draft (unpublish)
     * closed → draft (reopen for editing)
     */
    const now =
      new Date().toISOString();

    const update: {
      status:
        OpportunityStatus;

      published_at?:
        string | null;

      closed_at?:
        string | null;

      updated_by:
        string;

      updated_at:
        string;
    } = {
      status:
        body.status,

      updated_by:
        user.id,

      updated_at:
        now,
    };

    if (
      body.status ===
      "published"
    ) {
      update.published_at =
        now;

      update.closed_at =
        null;
    }

    if (
      body.status ===
      "draft"
    ) {
      update.published_at =
        null;

      update.closed_at =
        null;
    }

    if (
      body.status ===
      "closed"
    ) {
      update.closed_at =
        now;
    }

    /*
     * --------------------------------------------------
     * 5. SAVE
     * --------------------------------------------------
     */
    const {
      data: updated,
      error: updateError,
    } = await admin
      .from(
        "investment_opportunities",
      )
      .update(
        update,
      )
      .eq(
        "id",
        opportunityId,
      )
      .select(
        `
        id,
        status,
        published_at,
        closed_at
        `,
      )
      .single();

    if (updateError) {
      console.error(
        "Opportunity status update error:",
        updateError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to update opportunity status.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,

      opportunity:
        updated,
    });
  } catch (error) {
    console.error(
      "Opportunity status API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while updating the opportunity status.",
      },
      {
        status: 500,
      },
    );
  }
}