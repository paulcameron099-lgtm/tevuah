import {
  NextResponse,
} from "next/server";

import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    opportunityId: string;
  }>;
};

type LifecycleAction =
  | "close"
  | "delete";

type Payload = {
  action?: LifecycleAction;
  reason?: string;
};

type LifecycleResult = {
  opportunity_id: string;

  action_taken: string;

  resulting_status:
    | string
    | null;

  hard_deleted: boolean;

  closed_at:
    | string
    | null;
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

    if (
      user.role !== "admin" &&
      user.role !==
        "super_admin"
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

    if (!opportunityId) {
      return NextResponse.json(
        {
          error:
            "Opportunity ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 2. PARSE REQUEST
     * --------------------------------------------------
     */
    const body =
      (await request.json()) as Payload;

    const action =
      body.action;

    const reason =
      body.reason?.trim() ?? "";

    /*
     * --------------------------------------------------
     * 3. VALIDATE EXPLICIT ACTION
     * --------------------------------------------------
     *
     * The API must never infer whether the admin wants
     * to close or permanently delete an opportunity.
     */
    if (
      action !== "close" &&
      action !== "delete"
    ) {
      return NextResponse.json(
        {
          error:
            "Action must be either close or delete.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 4. VALIDATE REASON
     * --------------------------------------------------
     */
    if (
      reason.length < 10
    ) {
      return NextResponse.json(
        {
          error:
            "Please provide a reason of at least 10 characters.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 5. LOAD OPPORTUNITY
     * --------------------------------------------------
     *
     * We always verify that the opportunity exists.
     *
     * For DELETE we also capture Storage paths before
     * calling the RPC because the DB rows may disappear.
     *
     * For CLOSE these paths are left untouched.
     */
    const admin =
      createAdminClient();

    const opportunityResult =
      await admin
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
      opportunityResult.error
    ) {
      console.error(
        "Lifecycle opportunity lookup error:",
        opportunityResult.error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to load the investment opportunity.",
        },
        {
          status: 500,
        },
      );
    }

    if (
      !opportunityResult.data
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
     * 6. CAPTURE STORAGE PATHS FOR DELETE ONLY
     * --------------------------------------------------
     */
    let coverImagePath:
      | string
      | null =
      null;

    let documentPaths:
      string[] = [];

    if (
      action === "delete"
    ) {
      coverImagePath =
        opportunityResult.data
          .cover_image_path;

      const documentsResult =
        await admin
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
            "opportunity_id",
            opportunityId,
          );

      if (
        documentsResult.error
      ) {
        console.error(
          "Lifecycle document lookup error:",
          documentsResult.error,
        );

        return NextResponse.json(
          {
            error:
              "Unable to inspect opportunity documents.",
          },
          {
            status: 500,
          },
        );
      }

      documentPaths =
        (
          documentsResult.data ??
          []
        )
          .map(
            (document) =>
              document.storage_path,
          )
          .filter(
            (
              path,
            ): path is string =>
              Boolean(path),
          );
    }

    /*
     * --------------------------------------------------
     * 7. CALL LIFECYCLE RPC AS AUTHENTICATED ADMIN
     * --------------------------------------------------
     *
     * IMPORTANT:
     *
     * Do not use createAdminClient() for this RPC.
     *
     * The database function uses auth.uid() and performs
     * its own administrator authorization.
     *
     * Most importantly, the requested action is now
     * explicit. DELETE can never silently become CLOSE.
     */
    const supabase =
      await createClient();

    const {
      data,
      error: rpcError,
    } = await supabase.rpc(
      "admin_remove_or_close_investment_opportunity",
      {
        p_opportunity_id:
          opportunityId,

        p_reason:
          reason,

        p_action:
          action,
      },
    );

    if (rpcError) {
      console.error(
        "Opportunity lifecycle RPC error:",
        rpcError,
      );

      /*
       * The RPC may deliberately reject DELETE when the
       * opportunity cannot yet be safely purged.
       *
       * That rejection must NOT be converted into CLOSE.
       */
      return NextResponse.json(
        {
          error:
            rpcError.message ||
            `Unable to ${action} the investment opportunity.`,
        },
        {
          status: 409,
        },
      );
    }

    const result =
      (
        Array.isArray(data)
          ? data[0]
          : data
      ) as
        | LifecycleResult
        | null;

    if (!result) {
      console.error(
        "Opportunity lifecycle RPC returned no result.",
      );

      return NextResponse.json(
        {
          error:
            "The opportunity lifecycle operation returned no result.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 8. CLOSE RESULT
     * --------------------------------------------------
     *
     * Closing preserves all DB history and Storage.
     */
    if (
      action === "close"
    ) {
      if (
        result.hard_deleted
      ) {
        /*
         * Defensive invariant.
         *
         * A CLOSE request must never produce a deletion.
         */
        console.error(
          "Lifecycle invariant violation: CLOSE returned hard_deleted=true.",
          result,
        );

        return NextResponse.json(
          {
            error:
              "The lifecycle operation returned an unexpected result.",
          },
          {
            status: 500,
          },
        );
      }

      return NextResponse.json({
        success: true,

        requestedAction:
          "close",

        action:
          result.action_taken,

        hardDeleted:
          false,

        resultingStatus:
          result.resulting_status,

        closedAt:
          result.closed_at,

        storageCleanup: {
          required:
            false,

          complete:
            true,

          errors:
            [],
        },
      });
    }

    /*
     * --------------------------------------------------
     * 9. DELETE RESULT MUST ACTUALLY BE A DELETE
     * --------------------------------------------------
     *
     * This is intentionally strict.
     *
     * The API must never report success for DELETE if the
     * database merely closed/preserved the opportunity.
     */
    if (
      !result.hard_deleted
    ) {
      console.error(
        "Lifecycle invariant violation: DELETE did not hard-delete.",
        result,
      );

      return NextResponse.json(
        {
          error:
            "Permanent deletion did not complete. The opportunity was not reported as deleted.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 10. DELETE STORAGE OBJECTS
     * --------------------------------------------------
     *
     * Database deletion has succeeded at this point.
     *
     * Only now may opportunity-owned physical Storage
     * objects be removed.
     */
    const cleanupErrors:
      string[] = [];

    if (
      documentPaths.length >
      0
    ) {
      const {
        error:
          documentStorageError,
      } = await admin.storage
        .from(
          "investment-documents",
        )
        .remove(
          documentPaths,
        );

      if (
        documentStorageError
      ) {
        console.error(
          "Opportunity document storage cleanup error:",
          documentStorageError,
        );

        cleanupErrors.push(
          "One or more investment documents could not be removed from storage.",
        );
      }
    }

    if (coverImagePath) {
      const {
        error:
          coverStorageError,
      } = await admin.storage
        .from(
          "investment-media",
        )
        .remove([
          coverImagePath,
        ]);

      if (
        coverStorageError
      ) {
        console.error(
          "Opportunity cover storage cleanup error:",
          coverStorageError,
        );

        cleanupErrors.push(
          "The opportunity cover image could not be removed from storage.",
        );
      }
    }

    /*
     * --------------------------------------------------
     * 11. DELETE SUCCESS
     * --------------------------------------------------
     *
     * If Storage cleanup fails, the DB deletion has still
     * completed.
     *
     * We therefore return success plus cleanup warnings
     * rather than encouraging the client to retry DELETE
     * against a row that no longer exists.
     */
    return NextResponse.json({
      success: true,

      requestedAction:
        "delete",

      action:
        result.action_taken,

      hardDeleted:
        true,

      resultingStatus:
        null,

      closedAt:
        null,

      storageCleanup: {
        required:
          documentPaths.length >
            0 ||
          Boolean(
            coverImagePath,
          ),

        complete:
          cleanupErrors.length ===
          0,

        errors:
          cleanupErrors,
      },
    });
  } catch (error) {
    console.error(
      "Opportunity lifecycle API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while processing the opportunity lifecycle action.",
      },
      {
        status: 500,
      },
    );
  }
}