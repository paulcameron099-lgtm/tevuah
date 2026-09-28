import { NextResponse } from "next/server";

import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

type OpportunityStatus = "draft" | "published";

type RouteContext = {
  params: Promise<{
    opportunityId: string;
  }>;
};

export async function POST(
  request: Request,
  context: RouteContext,
) {
  try {
    // ---------------------------------------------------------
    // 1. Authenticate current user
    // ---------------------------------------------------------

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    if (
      currentUser.role !== "admin" &&
      currentUser.role !== "super_admin"
    ) {
      return NextResponse.json(
        {
          error: "Admin authorization required.",
        },
        { status: 403 },
      );
    }

    // ---------------------------------------------------------
    // 2. Resolve route params
    // ---------------------------------------------------------

    const { opportunityId } = await context.params;

    if (!opportunityId) {
      return NextResponse.json(
        {
          error: "Opportunity ID is required.",
        },
        { status: 400 },
      );
    }

    // ---------------------------------------------------------
    // 3. Parse requested status
    // ---------------------------------------------------------

    let body: {
      status?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid request body.",
        },
        { status: 400 },
      );
    }

    const requestedStatus = body.status?.trim();

    if (!requestedStatus) {
      return NextResponse.json(
        {
          error: "Status is required.",
        },
        { status: 400 },
      );
    }

    // ---------------------------------------------------------
    // IMPORTANT:
    //
    // Closing is NOT an ordinary status transition anymore.
    //
    // Closing/removal must go through:
    //
    // admin_remove_or_close_investment_opportunity(...)
    //
    // That RPC:
    // - requires a reason
    // - checks lifecycle/financial history
    // - decides hard-delete vs preserve/close
    // - creates the lifecycle audit record
    //
    // This route must never bypass that process.
    // ---------------------------------------------------------

    if (requestedStatus === "closed") {
      return NextResponse.json(
        {
          error:
            "Closing an opportunity must use the audited lifecycle action.",
        },
        { status: 409 },
      );
    }

    const allowedStatuses: OpportunityStatus[] = [
      "draft",
      "published",
    ];

    if (
      !allowedStatuses.includes(
        requestedStatus as OpportunityStatus,
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid opportunity status.",
        },
        { status: 400 },
      );
    }

    const targetStatus =
      requestedStatus as OpportunityStatus;

    // ---------------------------------------------------------
    // 4. Load current opportunity
    // ---------------------------------------------------------

    const admin = createAdminClient();

    const {
      data: opportunity,
      error: opportunityError,
    } = await admin
      .from("investment_opportunities")
      .select(`
        id,
        slug,
        title,
        status,
        published_at,
        closed_at,
        funding_target,
        minimum_investment,
        asset_category,
        short_description,
        full_description
      `)
      .eq("id", opportunityId)
      .maybeSingle();

    if (opportunityError) {
      console.error(
        "Opportunity status lookup error:",
        opportunityError,
      );

      return NextResponse.json(
        {
          error: "Failed to load opportunity.",
        },
        { status: 500 },
      );
    }

    if (!opportunity) {
      return NextResponse.json(
        {
          error: "Opportunity not found.",
        },
        { status: 404 },
      );
    }

    // ---------------------------------------------------------
    // 5. Closed is terminal
    // ---------------------------------------------------------

    if (opportunity.status === "closed") {
      return NextResponse.json(
        {
          error: "Closed opportunities cannot be reopened.",
        },
        { status: 409 },
      );
    }

    // ---------------------------------------------------------
    // 6. No-op transition
    // ---------------------------------------------------------

    if (opportunity.status === targetStatus) {
      return NextResponse.json({
        success: true,
        opportunity: {
          id: opportunity.id,
          status: opportunity.status,
          published_at: opportunity.published_at,
          closed_at: opportunity.closed_at,
        },
      });
    }

    // ---------------------------------------------------------
    // 7. Validate allowed transition
    //
    // Only:
    //
    // draft     -> published
    // published -> draft
    //
    // are permitted here.
    // ---------------------------------------------------------

    if (
      targetStatus === "published" &&
      opportunity.status !== "draft"
    ) {
      return NextResponse.json(
        {
          error:
            "Only draft opportunities can be published.",
        },
        { status: 409 },
      );
    }

    if (
      targetStatus === "draft" &&
      opportunity.status !== "published"
    ) {
      return NextResponse.json(
        {
          error:
            "Only published opportunities can be unpublished.",
        },
        { status: 409 },
      );
    }

    // ---------------------------------------------------------
    // 8. Publication validation
    // ---------------------------------------------------------

    if (targetStatus === "published") {
      const validationErrors: string[] = [];

      if (!opportunity.title?.trim()) {
        validationErrors.push(
          "Opportunity title is required.",
        );
      }

      if (!opportunity.slug?.trim()) {
        validationErrors.push(
          "Opportunity slug is required.",
        );
      }

      if (!opportunity.asset_category?.trim()) {
        validationErrors.push(
          "Asset category is required.",
        );
      }

      if (
        !opportunity.funding_target ||
        opportunity.funding_target <= 0
      ) {
        validationErrors.push(
          "Funding target must be greater than zero.",
        );
      }

      if (
        !opportunity.minimum_investment ||
        opportunity.minimum_investment <= 0
      ) {
        validationErrors.push(
          "Minimum investment must be greater than zero.",
        );
      }

      if (
        opportunity.minimum_investment >
        opportunity.funding_target
      ) {
        validationErrors.push(
          "Minimum investment cannot exceed the funding target.",
        );
      }

      if (!opportunity.short_description?.trim()) {
        validationErrors.push(
          "Short description is required before publication.",
        );
      }

      if (!opportunity.full_description?.trim()) {
        validationErrors.push(
          "Full description is required before publication.",
        );
      }

      if (validationErrors.length > 0) {
        return NextResponse.json(
          {
            error:
              "Opportunity is not ready for publication.",
            validationErrors,
          },
          { status: 400 },
        );
      }
    }

    // ---------------------------------------------------------
    // 9. Build safe update
    // ---------------------------------------------------------

    const now = new Date().toISOString();

    const updatePayload: Record<string, unknown> = {
      status: targetStatus,
      updated_by: currentUser.id,
      updated_at: now,
    };

    if (targetStatus === "published") {
      /*
       * Preserve the FIRST publication timestamp.
       *
       * If this opportunity was previously published and later
       * unpublished, published_at must NOT be replaced.
       *
       * This is important because published_at is lifecycle
       * history and is also used by the safe-delete rules.
       */
      if (!opportunity.published_at) {
        updatePayload.published_at = now;
      }
    }

    if (targetStatus === "draft") {
      /*
       * IMPORTANT:
       *
       * Do NOT clear published_at.
       *
       * A previously published opportunity remains historically
       * published even after it is unpublished back to draft.
       *
       * Also do not touch closed_at here.
       */
    }

    // ---------------------------------------------------------
    // 10. Apply transition
    // ---------------------------------------------------------

    const {
      data: updatedOpportunity,
      error: updateError,
    } = await admin
      .from("investment_opportunities")
      .update(updatePayload)
      .eq("id", opportunityId)
      .select(`
        id,
        slug,
        title,
        status,
        published_at,
        closed_at,
        updated_by,
        updated_at
      `)
      .single();

    if (updateError) {
      console.error(
        "Opportunity status update error:",
        updateError,
      );

      return NextResponse.json(
        {
          error: "Failed to update opportunity status.",
        },
        { status: 500 },
      );
    }

    // ---------------------------------------------------------
    // 11. Success
    // ---------------------------------------------------------

    return NextResponse.json({
      success: true,
      opportunity: updatedOpportunity,
    });
  } catch (error) {
    console.error(
      "Opportunity status API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "An unexpected error occurred while updating the opportunity status.",
      },
      { status: 500 },
    );
  }
}