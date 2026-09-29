import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

type DeleteBody = {
  confirmation?: unknown;
  reason?: unknown;
};

type PurgeOperation = {
  id: string;
  investor_id: string;
  operation_type: "normal_delete" | "danger_purge";
  status:
    | "database_purged"
    | "storage_cleanup_failed"
    | "storage_cleaned"
    | "auth_delete_failed"
    | "completed";

  storage_objects: unknown;
  database_deleted_counts: unknown;

  database_purge_complete: boolean;
  storage_cleanup_complete: boolean;
  auth_user_deleted: boolean;
  profile_deleted: boolean;

  database_purged_at: string | null;
  storage_cleaned_at: string | null;
  auth_user_deleted_at: string | null;
  completed_at: string | null;

  failure_stage: string | null;
  failure_message: string | null;
};

type StorageObject = {
  bucket: string;
  path: string;
  source?: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SAFE_PREFIX_BUCKETS = new Set([
  "investor-verification",
  "investment-payment-proofs",
]);

const NEVER_PREFIX_DELETE_BUCKETS = new Set([
  "investment-documents",
  "investment-media",
]);

const ALLOWED_EXACT_BUCKETS = new Set([
  "investor-verification",
  "investment-payment-proofs",
  "investment-documents",
]);

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function normalizePath(value: string): string {
  return value
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+/g, "/");
}

function joinPath(...parts: string[]): string {
  return parts
    .map(normalizePath)
    .filter(Boolean)
    .join("/");
}

function chunks<T>(items: T[], size = 100): T[][] {
  const output: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    output.push(items.slice(index, index + size));
  }

  return output;
}

function isExplicitAuthNotFound(error: {
  status?: number;
  code?: string;
  message?: string;
} | null): boolean {
  if (!error) return false;

  const message = (error.message ?? "").toLowerCase();

  return (
    error.status === 404 ||
    error.code === "user_not_found" ||
    message.includes("user not found")
  );
}

function collectStorageObjects(value: unknown): StorageObject[] {
  if (!Array.isArray(value)) return [];

  const result: StorageObject[] = [];
  const seen = new Set<string>();

  for (const item of value) {
    if (!item || typeof item !== "object") continue;

    const record = item as Record<string, unknown>;

    const bucket =
      typeof record.bucket === "string"
        ? record.bucket.trim()
        : "";

    const path =
      typeof record.path === "string"
        ? normalizePath(record.path)
        : "";

    const source =
      typeof record.source === "string"
        ? record.source
        : undefined;

    if (!bucket || !path) continue;

    const key = `${bucket}:${path}`;

    if (seen.has(key)) continue;

    seen.add(key);

    result.push({
      bucket,
      path,
      source,
    });
  }

  return result;
}

async function getActiveNormalDeleteOperation(
  admin: ReturnType<typeof createAdminClient>,
  investorId: string,
): Promise<PurgeOperation | null> {
  const { data, error } = await admin
    .from("investor_purge_operations")
    .select(
      `
        id,
        investor_id,
        operation_type,
        status,
        storage_objects,
        database_deleted_counts,
        database_purge_complete,
        storage_cleanup_complete,
        auth_user_deleted,
        profile_deleted,
        database_purged_at,
        storage_cleaned_at,
        auth_user_deleted_at,
        completed_at,
        failure_stage,
        failure_message
      `,
    )
    .eq("investor_id", investorId)
    .eq("operation_type", "normal_delete")
    .neq("status", "completed")
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to read Normal Delete recovery operation: ${error.message}`,
    );
  }

  return (data as PurgeOperation | null) ?? null;
}

async function markOperationFailure(
  admin: ReturnType<typeof createAdminClient>,
  operationId: string,
  status: "storage_cleanup_failed" | "auth_delete_failed",
  stage: string,
  message: string,
): Promise<void> {
  const { error } = await admin
    .from("investor_purge_operations")
    .update({
      status,
      failure_stage: stage,
      failure_message: message,
    })
    .eq("id", operationId)
    .eq("operation_type", "normal_delete");

  if (error) {
    console.error(
      "Failed to persist Normal Delete failure state:",
      error,
    );
  }
}

async function listAllFilesUnderPrefix(
  admin: ReturnType<typeof createAdminClient>,
  bucket: string,
  prefix: string,
): Promise<string[]> {
  const normalizedPrefix = normalizePath(prefix);

  const discovered: string[] = [];

  async function walk(currentPrefix: string): Promise<void> {
    let offset = 0;

    while (true) {
      const { data, error } = await admin.storage
        .from(bucket)
        .list(currentPrefix, {
          limit: 100,
          offset,
          sortBy: {
            column: "name",
            order: "asc",
          },
        });

      if (error) {
        throw new Error(
          `Unable to list storage ${bucket}/${currentPrefix}: ${error.message}`,
        );
      }

      const rows = data ?? [];

      for (const row of rows) {
        const childPath = joinPath(
          currentPrefix,
          row.name,
        );

        /*
         * Supabase Storage list() returns folders without object metadata
         * and files with metadata.
         */
        if (row.metadata == null) {
          await walk(childPath);
        } else {
          discovered.push(childPath);
        }
      }

      if (rows.length < 100) break;

      offset += rows.length;
    }
  }

  await walk(normalizedPrefix);

  return discovered;
}

async function removeExactStorageObjects(
  admin: ReturnType<typeof createAdminClient>,
  objects: StorageObject[],
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  const byBucket = new Map<string, Set<string>>();

  for (const object of objects) {
    if (!ALLOWED_EXACT_BUCKETS.has(object.bucket)) {
      throw new Error(
        `Normal Delete refused unknown/unapproved storage bucket: ${object.bucket}`,
      );
    }

    /*
     * Never touch investment-media during investor deletion.
     */
    if (object.bucket === "investment-media") {
      throw new Error(
        "Normal Delete refuses investor deletion from investment-media.",
      );
    }

    const paths =
      byBucket.get(object.bucket) ??
      new Set<string>();

    paths.add(normalizePath(object.path));

    byBucket.set(object.bucket, paths);
  }

  for (const [bucket, paths] of byBucket) {
    const pathArray = [...paths];

    for (const batch of chunks(pathArray, 100)) {
      if (batch.length === 0) continue;

      const { error } = await admin.storage
        .from(bucket)
        .remove(batch);

      if (error) {
        throw new Error(
          `Unable to delete exact storage objects from ${bucket}: ${error.message}`,
        );
      }

      counts[bucket] =
        (counts[bucket] ?? 0) + batch.length;
    }
  }

  return counts;
}

async function removeSafePrefix(
  admin: ReturnType<typeof createAdminClient>,
  bucket: string,
  prefix: string,
): Promise<number> {
  if (!SAFE_PREFIX_BUCKETS.has(bucket)) {
    throw new Error(
      `Prefix deletion is not allowed for bucket ${bucket}.`,
    );
  }

  if (NEVER_PREFIX_DELETE_BUCKETS.has(bucket)) {
    throw new Error(
      `Prefix deletion is forbidden for bucket ${bucket}.`,
    );
  }

  const files = await listAllFilesUnderPrefix(
    admin,
    bucket,
    prefix,
  );

  for (const batch of chunks(files, 100)) {
    if (batch.length === 0) continue;

    const { error } = await admin.storage
      .from(bucket)
      .remove(batch);

    if (error) {
      throw new Error(
        `Unable to delete storage prefix ${bucket}/${prefix}: ${error.message}`,
      );
    }
  }

  return files.length;
}

async function verifyPrefixEmpty(
  admin: ReturnType<typeof createAdminClient>,
  bucket: string,
  prefix: string,
): Promise<void> {
  const remaining = await listAllFilesUnderPrefix(
    admin,
    bucket,
    prefix,
  );

  if (remaining.length > 0) {
    throw new Error(
      `Storage verification failed: ${remaining.length} object(s) remain under ${bucket}/${prefix}.`,
    );
  }
}

async function verifyExactObjectsAbsent(
  admin: ReturnType<typeof createAdminClient>,
  objects: StorageObject[],
): Promise<void> {
  for (const object of objects) {
    const normalized = normalizePath(object.path);

    const slashIndex = normalized.lastIndexOf("/");

    const folder =
      slashIndex >= 0
        ? normalized.slice(0, slashIndex)
        : "";

    const fileName =
      slashIndex >= 0
        ? normalized.slice(slashIndex + 1)
        : normalized;

    const { data, error } = await admin.storage
      .from(object.bucket)
      .list(folder, {
        limit: 100,
        search: fileName,
      });

    if (error) {
      throw new Error(
        `Unable to verify storage object ${object.bucket}/${normalized}: ${error.message}`,
      );
    }

    const stillExists = (data ?? []).some(
      (entry) => entry.name === fileName,
    );

    if (stillExists) {
      throw new Error(
        `Storage verification failed: ${object.bucket}/${normalized} still exists.`,
      );
    }
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  let operationId: string | null = null;

  try {
    const { userId } = await context.params;

    if (!isUuid(userId)) {
      return NextResponse.json(
        {
          error: "Invalid investor ID.",
        },
        {
          status: 400,
        },
      );
    }

    let body: DeleteBody;

    try {
      body = (await request.json()) as DeleteBody;
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON request body.",
        },
        {
          status: 400,
        },
      );
    }

    const confirmation =
      typeof body.confirmation === "string"
        ? body.confirmation.trim()
        : "";

    const reason =
      typeof body.reason === "string"
        ? body.reason.trim()
        : "";

    if (confirmation !== "DELETE") {
      return NextResponse.json(
        {
          error:
            'Normal Delete requires exact confirmation "DELETE".',
        },
        {
          status: 400,
        },
      );
    }

    if (reason.length < 10) {
      return NextResponse.json(
        {
          error:
            "A deletion reason of at least 10 characters is required.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Cookie-authenticated client.
     *
     * This is REQUIRED for RPCs that depend on auth.uid().
     */
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        {
          status: 401,
        },
      );
    }

    if (user.id === userId) {
      return NextResponse.json(
        {
          error:
            "An administrator cannot delete their own account.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Service-role client for recovery-table reads, Storage,
     * profile verification and Auth deletion.
     */
    const admin = createAdminClient();

    /*
     * Explicit Admin check before doing anything privileged.
     */
    const {
      data: callerProfile,
      error: callerProfileError,
    } = await admin
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (callerProfileError) {
      throw new Error(
        `Unable to verify administrator: ${callerProfileError.message}`,
      );
    }

    if (
      !callerProfile ||
      !["admin", "super_admin"].includes(
        String(callerProfile.role),
      )
    ) {
      return NextResponse.json(
        {
          error: "Admin access required.",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * ------------------------------------------------------------
     * RECOVERY FIRST
     * ------------------------------------------------------------
     *
     * If the DB phase previously committed but Storage/Auth failed,
     * never call the destructive DB RPC again.
     */
    let operation =
      await getActiveNormalDeleteOperation(
        admin,
        userId,
      );

    if (operation) {
      operationId = operation.id;

      if (!operation.database_purge_complete) {
        throw new Error(
          "Existing Normal Delete recovery operation is not marked database-complete. Refusing automatic continuation.",
        );
      }
    } else {
      /*
       * ----------------------------------------------------------
       * PREFLIGHT
       * ----------------------------------------------------------
       */

      const {
        data: preflight,
        error: preflightError,
      } = await supabase.rpc(
        "admin_preflight_unused_investor_delete",
        {
          p_investor_id: userId,
        },
      );

      if (preflightError) {
        return NextResponse.json(
          {
            error: preflightError.message,
            stage: "preflight",
          },
          {
            status: 400,
          },
        );
      }

      const preflightRecord =
        preflight &&
        typeof preflight === "object" &&
        !Array.isArray(preflight)
          ? (preflight as Record<string, unknown>)
          : null;

      const eligible =
        preflightRecord?.eligible_for_normal_delete ===
        true;

      if (!eligible) {
        return NextResponse.json(
          {
            error:
              "Normal Delete refused because this investor has protected financial, investment, joint, statement, distribution, or retirement history.",
            stage: "preflight",
            preflight,
            danger_delete_required: true,
            automatic_escalation_to_danger_delete: false,
          },
          {
            status: 409,
          },
        );
      }

      /*
       * ----------------------------------------------------------
       * DATABASE DELETE
       * ----------------------------------------------------------
       *
       * The RPC repeats all important checks under the profile lock.
       */
      const {
        data: deleteResult,
        error: deleteError,
      } = await supabase.rpc(
        "admin_delete_unused_investor",
        {
          p_investor_id: userId,
          p_confirmation: confirmation,
          p_reason: reason,
        },
      );

      if (deleteError) {
        return NextResponse.json(
          {
            error: deleteError.message,
            stage: "database_delete",
          },
          {
            status: 400,
          },
        );
      }

      const deleteRecord =
        deleteResult &&
        typeof deleteResult === "object" &&
        !Array.isArray(deleteResult)
          ? (deleteResult as Record<string, unknown>)
          : null;

      if (
        !deleteRecord ||
        deleteRecord.operation_type !==
          "normal_delete" ||
        deleteRecord.database_cleanup_complete !== true
      ) {
        throw new Error(
          "Normal Delete RPC returned an invalid completion payload.",
        );
      }

      /*
       * DB RPC created this operation atomically.
       */
      operation =
        await getActiveNormalDeleteOperation(
          admin,
          userId,
        );

      if (!operation) {
        throw new Error(
          "Database cleanup completed but the Normal Delete recovery operation could not be found.",
        );
      }

      operationId = operation.id;
    }

    /*
     * ------------------------------------------------------------
     * STORAGE CLEANUP
     * ------------------------------------------------------------
     */

    if (!operation.storage_cleanup_complete) {
      try {
        const explicitObjects =
          collectStorageObjects(
            operation.storage_objects,
          );

        /*
         * Safety check: exact objects may only use approved buckets.
         */
        for (const object of explicitObjects) {
          if (
            !ALLOWED_EXACT_BUCKETS.has(
              object.bucket,
            )
          ) {
            throw new Error(
              `Unapproved Normal Delete storage bucket: ${object.bucket}`,
            );
          }

          if (
            object.bucket ===
            "investment-media"
          ) {
            throw new Error(
              "Normal Delete refuses investment-media cleanup.",
            );
          }
        }

        /*
         * These two prefixes are known to be investor-scoped.
         *
         * Normal Delete usually has no payment proof objects because
         * payment history is a blocker, but deleting an empty prefix
         * is harmless and makes retries deterministic.
         */
        const verificationPrefixCount =
          await removeSafePrefix(
            admin,
            "investor-verification",
            userId,
          );

        const paymentProofPrefixCount =
          await removeSafePrefix(
            admin,
            "investment-payment-proofs",
            userId,
          );

        const exactCounts =
          await removeExactStorageObjects(
            admin,
            explicitObjects,
          );

        /*
         * Verify before touching Auth.
         */
        await verifyPrefixEmpty(
          admin,
          "investor-verification",
          userId,
        );

        await verifyPrefixEmpty(
          admin,
          "investment-payment-proofs",
          userId,
        );

        await verifyExactObjectsAbsent(
          admin,
          explicitObjects,
        );

        const storageDeletedCounts = {
          investor_verification_prefix:
            verificationPrefixCount,

          investment_payment_proofs_prefix:
            paymentProofPrefixCount,

          exact_objects_by_bucket:
            exactCounts,
        };

        const {
          error: storageOperationError,
        } = await admin
          .from("investor_purge_operations")
          .update({
            status: "storage_cleaned",
            storage_cleanup_complete: true,
            storage_deleted_counts:
              storageDeletedCounts,
            storage_cleaned_at:
              new Date().toISOString(),
            failure_stage: null,
            failure_message: null,
          })
          .eq("id", operation.id)
          .eq(
            "operation_type",
            "normal_delete",
          );

        if (storageOperationError) {
          throw new Error(
            `Storage was cleaned but recovery state could not be updated: ${storageOperationError.message}`,
          );
        }

        operation = {
          ...operation,
          status: "storage_cleaned",
          storage_cleanup_complete: true,
          storage_cleaned_at:
            new Date().toISOString(),
          failure_stage: null,
          failure_message: null,
        };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unknown Storage cleanup error.";

        await markOperationFailure(
          admin,
          operation.id,
          "storage_cleanup_failed",
          "storage_cleanup",
          message,
        );

        /*
         * CRITICAL:
         * Auth is intentionally preserved.
         */
        return NextResponse.json(
          {
            error:
              "Database cleanup completed, but Storage cleanup failed. Auth user was preserved and the operation can be retried safely.",
            stage: "storage_cleanup",
            operation_id: operation.id,
            details: message,
            auth_user_preserved: true,
            retryable: true,
          },
          {
            status: 500,
          },
        );
      }
    }

    /*
     * ------------------------------------------------------------
     * AUTH DELETE — LAST
     * ------------------------------------------------------------
     *
     * Idempotent against the crash window where deleteUser()
     * succeeded but the operation update did not.
     */

    let authUserDeleted =
      operation.auth_user_deleted;

    if (!authUserDeleted) {
      const {
        data: authLookup,
        error: authLookupError,
      } =
        await admin.auth.admin.getUserById(
          userId,
        );

      if (
        authLookupError &&
        !isExplicitAuthNotFound(
          authLookupError,
        )
      ) {
        await markOperationFailure(
          admin,
          operation.id,
          "auth_delete_failed",
          "auth_lookup",
          authLookupError.message,
        );

        return NextResponse.json(
          {
            error:
              "Storage cleanup completed, but Auth lookup failed. The operation can be retried safely.",
            stage: "auth_lookup",
            operation_id: operation.id,
            details:
              authLookupError.message,
            retryable: true,
          },
          {
            status: 500,
          },
        );
      }

      const authAlreadyAbsent =
        !!authLookupError &&
        isExplicitAuthNotFound(
          authLookupError,
        );

      if (
        !authAlreadyAbsent &&
        authLookup?.user
      ) {
        const {
          error: deleteAuthError,
        } =
          await admin.auth.admin.deleteUser(
            userId,
          );

        if (
          deleteAuthError &&
          !isExplicitAuthNotFound(
            deleteAuthError,
          )
        ) {
          await markOperationFailure(
            admin,
            operation.id,
            "auth_delete_failed",
            "auth_delete",
            deleteAuthError.message,
          );

          return NextResponse.json(
            {
              error:
                "Storage cleanup completed, but Auth deletion failed. The operation can be retried safely.",
              stage: "auth_delete",
              operation_id:
                operation.id,
              details:
                deleteAuthError.message,
              retryable: true,
            },
            {
              status: 500,
            },
          );
        }
      }

      /*
       * Auth is now known absent.
       *
       * Best-effort persistence. If this update fails after Auth was
       * deleted, the next retry performs getUserById(), sees the user
       * is already absent and continues safely.
       */
      const {
        error: authStateError,
      } = await admin
        .from("investor_purge_operations")
        .update({
          auth_user_deleted: true,
          auth_user_deleted_at:
            new Date().toISOString(),
          failure_stage: null,
          failure_message: null,
        })
        .eq("id", operation.id)
        .eq(
          "operation_type",
          "normal_delete",
        );

      if (authStateError) {
        console.error(
          "Auth user deleted but recovery state update failed:",
          authStateError,
        );
      }

      authUserDeleted = true;

      operation = {
        ...operation,
        auth_user_deleted: true,
        auth_user_deleted_at:
          new Date().toISOString(),
      };
    }

    /*
     * ------------------------------------------------------------
     * PROFILE CASCADE VERIFICATION
     * ------------------------------------------------------------
     */

    const {
      data: remainingProfile,
      error: profileLookupError,
    } = await admin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (profileLookupError) {
      await markOperationFailure(
        admin,
        operation.id,
        "auth_delete_failed",
        "profile_verification",
        profileLookupError.message,
      );

      return NextResponse.json(
        {
          error:
            "Auth deletion completed, but profile cascade verification failed.",
          stage:
            "profile_verification",
          operation_id: operation.id,
          retryable: true,
        },
        {
          status: 500,
        },
      );
    }

    if (remainingProfile) {
      await markOperationFailure(
        admin,
        operation.id,
        "auth_delete_failed",
        "profile_cascade",
        "Profile still exists after Auth user deletion.",
      );

      return NextResponse.json(
        {
          error:
            "Auth user was removed but the investor profile still exists. Automatic completion was stopped.",
          stage: "profile_cascade",
          operation_id: operation.id,
          retryable: true,
        },
        {
          status: 500,
        },
      );
    }

    /*
     * ------------------------------------------------------------
     * COMPLETE
     * ------------------------------------------------------------
     */

    const completedAt =
      new Date().toISOString();

    const {
      data: completedOperation,
      error: completionError,
    } = await admin
      .from("investor_purge_operations")
      .update({
        status: "completed",
        database_purge_complete: true,
        storage_cleanup_complete: true,
        auth_user_deleted: true,
        profile_deleted: true,

        auth_user_deleted_at:
          operation.auth_user_deleted_at ??
          completedAt,

        completed_at: completedAt,

        failure_stage: null,
        failure_message: null,
      })
      .eq("id", operation.id)
      .eq(
        "operation_type",
        "normal_delete",
      )
      .select(
        `
          id,
          investor_id,
          operation_type,
          status,
          database_deleted_counts,
          storage_deleted_counts,
          database_purge_complete,
          storage_cleanup_complete,
          auth_user_deleted,
          profile_deleted,
          database_purged_at,
          storage_cleaned_at,
          auth_user_deleted_at,
          completed_at
        `,
      )
      .single();

    if (completionError) {
      /*
       * All destructive work is already complete.
       * A retry is safe because Auth absence is idempotently handled.
       */
      return NextResponse.json(
        {
          error:
            "Investor deletion completed, but the recovery operation could not be marked completed.",
          stage: "completion_state",
          operation_id: operation.id,
          investor_deleted: true,
          retryable: true,
          details:
            completionError.message,
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,

        action: "normal_delete",

        investor_id: userId,

        operation_id: operation.id,

        database_cleanup_complete:
          true,

        storage_cleanup_complete:
          true,

        auth_user_deleted:
          authUserDeleted,

        profile_deleted: true,

        danger_delete_invoked: false,

        automatic_escalation_to_danger_delete:
          false,

        operation:
          completedOperation,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Normal Delete investor route failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Normal Delete failed.",

        operation_id: operationId,
      },
      {
        status: 500,
      },
    );
  }
}