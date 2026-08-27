import {
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  sendStatementEmail,
} from "@/src/lib/email/send-statement-email";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type ReviewPayload = {
  statementId?: string;

  action?:
    | "publish"
    | "void"
    | "reinstate";
};

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
      user.role !==
        "admin" &&
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

    /*
     * ==================================================
     * 2. REQUEST
     * ==================================================
     */
    const body =
      (await request.json()) as ReviewPayload;

    const statementId =
      body.statementId?.trim();

    const action =
      body.action;

    if (
      !statementId
    ) {
      return NextResponse.json(
        {
          error:
            "Statement ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      action !==
        "publish" &&
      action !==
        "void" &&
      action !==
        "reinstate"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid statement review action.",
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
     * 3. LOAD STATEMENT
     * ==================================================
     */
    const {
      data: statement,
      error:
        statementError,
    } = await admin
      .from(
        "investor_statements",
      )
      .select(
        `
        id,

        investor_id,

        status,

        statement_type,

        period_start,
        period_end,

        position_count,

        reconstructed_from_legacy,

        historical_generated_at,
        historical_published_at,

        published_at
        `,
      )
      .eq(
        "id",
        statementId,
      )
      .maybeSingle();

    if (
      statementError ||
      !statement
    ) {
      console.error(
        "Statement review lookup error:",
        statementError,
      );

      return NextResponse.json(
        {
          error:
            "Statement not found.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * Everything below uses statementRecord so
     * TypeScript knows it is non-null.
     */
    const statementRecord =
      statement;

    /*
     * ==================================================
     * 4. LOAD INVESTOR EMAIL + NAME
     * ==================================================
     */
    const {
      data:
        investorProfile,
      error:
        investorProfileError,
    } = await admin
      .from(
        "profiles",
      )
      .select(
        `
        id,
        first_name,
        last_name
        `,
      )
      .eq(
        "id",
        statementRecord.investor_id,
      )
      .maybeSingle();

    if (
      investorProfileError
    ) {
      console.error(
        "Statement investor profile lookup error:",
        investorProfileError,
      );
    }

    const {
      data:
        authUserData,
      error:
        authUserError,
    } =
      await admin.auth.admin.getUserById(
        statementRecord.investor_id,
      );

    if (
      authUserError
    ) {
      console.error(
        "Statement investor Auth lookup error:",
        authUserError,
      );
    }

    const investorEmail =
      authUserData.user
        ?.email ??
      null;

    const investorName =
      investorProfile
        ? [
            investorProfile.first_name,
            investorProfile.last_name,
          ]
            .filter(Boolean)
            .join(" ")
            .trim() ||
          "Investor"
        : "Investor";

    const now =
      new Date().toISOString();

    /*
     * ==================================================
     * 5. SNAPSHOT VALIDATION
     * ==================================================
     */
    async function validateSnapshot() {
      const {
        count,
        error,
      } = await admin
        .from(
          "investor_statement_positions",
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
          "statement_id",
          statementId,
        );

      if (
        error
      ) {
        console.error(
          "Statement snapshot validation error:",
          error,
        );

        return {
          ok:
            false as const,

          status:
            500,

          error:
            "Unable to validate the statement snapshot.",
        };
      }

      const expectedPositionCount =
        Number(
          statementRecord.position_count,
        );

      if (
        expectedPositionCount >
          0 &&
        (count ?? 0) !==
          expectedPositionCount
      ) {
        return {
          ok:
            false as const,

          status:
            409,

          error:
            "Statement position snapshot is incomplete.",
        };
      }

      return {
        ok:
          true as const,
      };
    }

    /*
     * ==================================================
     * 6. PUBLISH
     * ==================================================
     */
    if (
      action ===
      "publish"
    ) {
      if (
        statementRecord.status !==
        "draft"
      ) {
        return NextResponse.json(
          {
            error:
              "Only draft statements can be published.",
          },
          {
            status:
              409,
          },
        );
      }

      const validation =
        await validateSnapshot();

      if (
        !validation.ok
      ) {
        return NextResponse.json(
          {
            error:
              validation.error,
          },
          {
            status:
              validation.status,
          },
        );
      }

      const {
        data:
          updated,
        error:
          publishError,
      } = await admin
        .from(
          "investor_statements",
        )
        .update({
          status:
            "published",

          published_by:
            user.id,

          published_at:
            now,

          updated_at:
            now,
        })
        .eq(
          "id",
          statementId,
        )
        .eq(
          "status",
          "draft",
        )
        .select(
          "id,status,published_at",
        )
        .maybeSingle();

      if (
        publishError ||
        !updated
      ) {
        console.error(
          "Statement publish error:",
          publishError,
        );

        return NextResponse.json(
          {
            error:
              publishError?.message ??
              "Unable to publish statement.",
          },
          {
            status:
              500,
          },
        );
      }

      /*
       * ----------------------------------------------
       * EMAIL
       * ----------------------------------------------
       *
       * Statement is already published at this point.
       * Email failure must NOT roll back publication.
       */
      let emailSent =
        false;

      if (
        investorEmail
      ) {
        try {
          await sendStatementEmail({
            to:
              investorEmail,

            investorName,

            action:
              "published",

            statementId:
              statementRecord.id,

            statementType:
              statementRecord.statement_type,

            periodStart:
              statementRecord.period_start,

            periodEnd:
              statementRecord.period_end,

            reconstructedFromLegacy:
              Boolean(
                statementRecord.reconstructed_from_legacy,
              ),

            historicalPublishedAt:
              statementRecord.historical_published_at,
          });

          emailSent =
            true;
        } catch (
          emailError
        ) {
          console.error(
            "Published statement email failed:",
            emailError,
          );
        }
      } else {
        console.error(
          "Published statement email skipped: investor email not found.",
        );
      }

      return NextResponse.json({
        success:
          true,

        statementId,

        status:
          "published",

        emailSent,
      });
    }

    /*
     * ==================================================
     * 7. VOID
     * ==================================================
     */
    if (
      action ===
      "void"
    ) {
      if (
        statementRecord.status ===
        "void"
      ) {
        return NextResponse.json(
          {
            error:
              "Statement has already been voided.",
          },
          {
            status:
              409,
          },
        );
      }

      if (
        statementRecord.status !==
          "draft" &&
        statementRecord.status !==
          "published"
      ) {
        return NextResponse.json(
          {
            error:
              "This statement cannot be voided from its current status.",
          },
          {
            status:
              409,
          },
        );
      }

      /*
       * We only send a withdrawal email if the
       * statement was actually published before being
       * voided.
       */
      const wasPublished =
        statementRecord.status ===
        "published";

      const {
        data:
          updated,
        error:
          voidError,
      } = await admin
        .from(
          "investor_statements",
        )
        .update({
          status:
            "void",

          voided_by:
            user.id,

          voided_at:
            now,

          updated_at:
            now,
        })
        .eq(
          "id",
          statementId,
        )
        .neq(
          "status",
          "void",
        )
        .select(
          "id,status",
        )
        .maybeSingle();

      if (
        voidError ||
        !updated
      ) {
        console.error(
          "Statement void error:",
          voidError,
        );

        return NextResponse.json(
          {
            error:
              voidError?.message ??
              "Unable to void statement.",
          },
          {
            status:
              500,
          },
        );
      }

      let emailSent =
        false;

      /*
       * Draft statements were never visible to the
       * investor, so there is no reason to send an
       * investor withdrawal email for a voided draft.
       */
      if (
        wasPublished &&
        investorEmail
      ) {
        try {
          await sendStatementEmail({
            to:
              investorEmail,

            investorName,

            action:
              "voided",

            statementId:
              statementRecord.id,

            statementType:
              statementRecord.statement_type,

            periodStart:
              statementRecord.period_start,

            periodEnd:
              statementRecord.period_end,

            reconstructedFromLegacy:
              Boolean(
                statementRecord.reconstructed_from_legacy,
              ),

            historicalPublishedAt:
              statementRecord.historical_published_at,
          });

          emailSent =
            true;
        } catch (
          emailError
        ) {
          console.error(
            "Voided statement email failed:",
            emailError,
          );
        }
      }

      return NextResponse.json({
        success:
          true,

        statementId,

        status:
          "void",

        emailSent,
      });
    }

    /*
     * ==================================================
     * 8. REINSTATE
     * ==================================================
     */
    if (
      statementRecord.status !==
      "void"
    ) {
      return NextResponse.json(
        {
          error:
            "Only voided statements can be reinstated.",
        },
        {
          status:
            409,
        },
      );
    }

    const validation =
      await validateSnapshot();

    if (
      !validation.ok
    ) {
      return NextResponse.json(
        {
          error:
            validation.error,
        },
        {
          status:
            validation.status,
        },
      );
    }

    const reinstateUpdate: {
      status: string;

      reinstated_by:
        string;

      reinstated_at:
        string;

      updated_at:
        string;

      published_by?:
        string;

      published_at?:
        string;
    } = {
      status:
        "published",

      reinstated_by:
        user.id,

      reinstated_at:
        now,

      updated_at:
        now,
    };

    /*
     * If a draft was voided before it was ever
     * published, reinstating it becomes its first
     * publication.
     */
    if (
      !statementRecord.published_at
    ) {
      reinstateUpdate.published_by =
        user.id;

      reinstateUpdate.published_at =
        now;
    }

    const {
      data:
        reinstated,
      error:
        reinstateError,
    } = await admin
      .from(
        "investor_statements",
      )
      .update(
        reinstateUpdate,
      )
      .eq(
        "id",
        statementId,
      )
      .eq(
        "status",
        "void",
      )
      .select(
        "id,status,published_at,reinstated_at",
      )
      .maybeSingle();

    if (
      reinstateError ||
      !reinstated
    ) {
      console.error(
        "Statement reinstate error:",
        reinstateError,
      );

      return NextResponse.json(
        {
          error:
            reinstateError?.message ??
            "Unable to reinstate statement.",
        },
        {
          status:
            500,
        },
      );
    }

    let emailSent =
      false;

    if (
      investorEmail
    ) {
      try {
        await sendStatementEmail({
          to:
            investorEmail,

          investorName,

          action:
            "reinstated",

          statementId:
            statementRecord.id,

          statementType:
            statementRecord.statement_type,

          periodStart:
            statementRecord.period_start,

          periodEnd:
            statementRecord.period_end,

          reconstructedFromLegacy:
            Boolean(
              statementRecord.reconstructed_from_legacy,
            ),

          historicalPublishedAt:
            statementRecord.historical_published_at,
        });

        emailSent =
          true;
      } catch (
        emailError
      ) {
        console.error(
          "Reinstated statement email failed:",
          emailError,
        );
      }
    } else {
      console.error(
        "Reinstated statement email skipped: investor email not found.",
      );
    }

    return NextResponse.json({
      success:
        true,

      statementId,

      status:
        "published",

      emailSent,
    });
  } catch (error) {
    console.error(
      "Statement review API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while reviewing the statement.",
      },
      {
        status:
          500,
      },
    );
  }
}