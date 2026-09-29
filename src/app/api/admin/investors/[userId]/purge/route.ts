import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

type PurgeRequestBody = {
  confirmation?: unknown;
  reason?: unknown;
};

type PurgeResult = {
  investor_id: string;
  operation_type:
  | "danger_purge"
  | "normal_delete";
  first_name: string | null;
  last_name: string | null;
  affected_opportunity_ids: string[] | null;
  affected_joint_subscription_ids: string[] | null;
  storage_objects: unknown;
  deleted_counts: unknown;
  database_purge_complete: boolean;
  auth_user_delete_required: boolean;
  storage_cleanup_required: boolean;
  purged_at: string;
};

type PurgeOperation = {
  id: string;
  investor_id: string;

  operation_type:
    | "danger_purge"
    | "normal_delete";

  investor_first_name: string | null;
  investor_last_name: string | null;
  initiated_by: string;
  reason: string;

  status:
    | "database_purged"
    | "storage_cleanup_failed"
    | "storage_cleaned"
    | "auth_delete_failed"
    | "completed";

  affected_opportunity_ids: string[] | null;
  affected_joint_subscription_ids: string[] | null;

  storage_objects: unknown;
  database_deleted_counts: unknown;

  database_purge_complete: boolean;
  storage_cleanup_complete: boolean;
  auth_user_deleted: boolean;
  profile_deleted: boolean;

  storage_deleted_counts: Record<string, number> | null;

  failure_stage: string | null;
  failure_message: string | null;

  database_purged_at: string | null;
  storage_cleaned_at: string | null;
  auth_user_deleted_at: string | null;
  completed_at: string | null;

  created_at: string;
  updated_at: string;
};

type StorageObjectRecord = {
  source?: unknown;
  bucket?: unknown;
  bucket_name?: unknown;
  path?: unknown;
  storage_path?: unknown;
  object_path?: unknown;
};

type StorageTarget = {
  bucket: string;
  path: string;
  source: string | null;
};

const INVESTOR_PREFIX_BUCKETS = [
  "investor-verification",
  "investment-payment-proofs",
] as const;

const NEVER_PREFIX_DELETE_BUCKETS = new Set([
  "investment-documents",
  "investment-media",
]);

const FORBIDDEN_EXACT_DELETE_BUCKETS = new Set([
  "investment-media",
]);

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function normalizeStoragePath(value: string): string {
  return value
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+/g, "/");
}

function joinStoragePath(
  prefix: string,
  name: string,
): string {
  const cleanPrefix =
    normalizeStoragePath(prefix);

  const cleanName =
    normalizeStoragePath(name);

  if (!cleanPrefix) {
    return cleanName;
  }

  return `${cleanPrefix}/${cleanName}`;
}

function chunk<T>(
  items: T[],
  size: number,
): T[][] {
  const result: T[][] = [];

  for (
    let index = 0;
    index < items.length;
    index += size
  ) {
    result.push(
      items.slice(index, index + size),
    );
  }

  return result;
}

function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function stringValue(
  value: unknown,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0
    ? trimmed
    : null;
}

function collectStorageRecords(
  value: unknown,
  records: StorageObjectRecord[] = [],
): StorageObjectRecord[] {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectStorageRecords(
        item,
        records,
      );
    }

    return records;
  }

  if (!isPlainObject(value)) {
    return records;
  }

  const hasStorageFields =
    "bucket" in value ||
    "bucket_name" in value ||
    "path" in value ||
    "storage_path" in value ||
    "object_path" in value;

  if (hasStorageFields) {
    records.push(
      value as StorageObjectRecord,
    );
  }

  for (
    const nestedValue
    of Object.values(value)
  ) {
    if (
      Array.isArray(nestedValue) ||
      isPlainObject(nestedValue)
    ) {
      collectStorageRecords(
        nestedValue,
        records,
      );
    }
  }

  return records;
}

function inferInvestorStorageBucket(
  source: string | null,
): string | null {
  switch (source) {
    /*
     * Investor identity / compliance documents.
     *
     * These legacy database records may contain
     * only a Storage path and source identifier,
     * without storing the bucket name.
     *
     * We map ONLY explicitly known source types.
     * Unknown sources MUST remain unresolved so
     * the purge fails closed before Auth deletion.
     */
    case "address_proof":

    case "kyc_drivers_license_front":
    case "kyc_drivers_license_back":

    case "kyc_ssn_front":
    case "kyc_ssn_back":

    case "tax_w9":
    case "tax_w9_supporting":

    case "tax_w8ben":
    case "tax_w8ben_supporting":
      return "investor-verification";

    default:
      return null;
  }
}

function parseExplicitStorageTargets(
  storageObjects: unknown,
): {
  targets: StorageTarget[];
  unresolved: StorageObjectRecord[];
} {
  const records =
    collectStorageRecords(
      storageObjects,
    );

  const targets: StorageTarget[] = [];

  const unresolved:
    StorageObjectRecord[] = [];

  for (const record of records) {
    /*
     * Prefer a bucket explicitly captured by
     * the database operation.
     */
    const explicitBucket =
      stringValue(record.bucket) ??
      stringValue(record.bucket_name);

    const rawPath =
      stringValue(record.path) ??
      stringValue(record.storage_path) ??
      stringValue(record.object_path);

    const source =
      stringValue(record.source);

    /*
     * A record without an object path cannot
     * identify a Storage object.
     *
     * This matches the existing behavior:
     * there is nothing we can safely delete.
     */
    if (!rawPath) {
      continue;
    }

    /*
     * Legacy compliance rows can contain:
     *
     *   {
     *     path: "...",
     *     bucket: null,
     *     source: "address_proof"
     *   }
     *
     * For those records, infer the bucket ONLY
     * from our explicit source allow-list.
     *
     * We NEVER use a generic fallback such as:
     *
     *   bucket ?? "investor-verification"
     *
     * because that could delete an unknown
     * future object from the wrong bucket.
     */
    const bucket =
      explicitBucket ??
      inferInvestorStorageBucket(
        source,
      );

    /*
     * Unknown bucket/source combinations
     * remain unresolved.
     *
     * The calling purge workflow will stop
     * before Auth deletion.
     */
    if (!bucket) {
      unresolved.push(record);

      continue;
    }

    const path =
      normalizeStoragePath(
        rawPath,
      );

    if (!path) {
      continue;
    }

    /*
     * Opportunity media is shared/opportunity
     * scoped and must NEVER be deleted by an
     * investor purge.
     */
    if (
      FORBIDDEN_EXACT_DELETE_BUCKETS.has(
        bucket,
      )
    ) {
      unresolved.push(record);

      continue;
    }

    targets.push({
      bucket,
      path,
      source,
    });
  }

  /*
   * Deduplicate identical bucket/path targets.
   *
   * This also prevents repeated deletion calls
   * when the same object was captured through
   * more than one database source.
   */
  const unique =
    new Map<
      string,
      StorageTarget
    >();

  for (const target of targets) {
    unique.set(
      `${target.bucket}\u0000${target.path}`,
      target,
    );
  }

  return {
    targets:
      Array.from(
        unique.values(),
      ),

    unresolved,
  };
}

async function listFilesRecursively(
  admin: ReturnType<
    typeof createAdminClient
  >,
  bucket: string,
  prefix: string,
): Promise<string[]> {
  const files: string[] = [];

  async function walk(
    currentPrefix: string,
  ): Promise<void> {
    let offset = 0;

    const limit = 1000;

    while (true) {
      const {
        data,
        error,
      } = await admin.storage
        .from(bucket)
        .list(currentPrefix, {
          limit,
          offset,
          sortBy: {
            column: "name",
            order: "asc",
          },
        });

      if (error) {
        throw new Error(
          `Unable to list Storage bucket "${bucket}" at prefix "${currentPrefix}": ${error.message}`,
        );
      }

      const entries = data ?? [];

      for (const entry of entries) {
        const fullPath =
          joinStoragePath(
            currentPrefix,
            entry.name,
          );

        /*
         * Real Storage objects have an id.
         * Folder entries do not.
         */
        if (entry.id) {
          files.push(fullPath);
        } else {
          await walk(fullPath);
        }
      }

      if (entries.length < limit) {
        break;
      }

      offset += limit;
    }
  }

  await walk(
    normalizeStoragePath(prefix),
  );

  return files;
}

async function removeStoragePaths(
  admin: ReturnType<
    typeof createAdminClient
  >,
  bucket: string,
  paths: string[],
): Promise<number> {
  const uniquePaths =
    Array.from(
      new Set(
        paths
          .map(normalizeStoragePath)
          .filter(Boolean),
      ),
    );

  if (uniquePaths.length === 0) {
    return 0;
  }

  let deleted = 0;

  for (
    const batch
    of chunk(uniquePaths, 100)
  ) {
    const { error } =
      await admin.storage
        .from(bucket)
        .remove(batch);

    if (error) {
      throw new Error(
        `Storage deletion failed in bucket "${bucket}": ${error.message}`,
      );
    }

    deleted += batch.length;
  }

  return deleted;
}

async function purgeInvestorOwnedPrefixes(
  admin: ReturnType<
    typeof createAdminClient
  >,
  userId: string,
): Promise<Record<string, number>> {
  const deletedCounts:
    Record<string, number> = {};

  for (
    const bucket
    of INVESTOR_PREFIX_BUCKETS
  ) {
    if (
      NEVER_PREFIX_DELETE_BUCKETS.has(
        bucket,
      )
    ) {
      throw new Error(
        `Safety failure: bucket "${bucket}" cannot be prefix-deleted.`,
      );
    }

    const files =
      await listFilesRecursively(
        admin,
        bucket,
        userId,
      );

    deletedCounts[bucket] =
      await removeStoragePaths(
        admin,
        bucket,
        files,
      );
  }

  return deletedCounts;
}

async function removeExplicitStorageTargets(
  admin: ReturnType<
    typeof createAdminClient
  >,
  targets: StorageTarget[],
): Promise<Record<string, number>> {
  const byBucket =
    new Map<
      string,
      Set<string>
    >();

  for (const target of targets) {
    if (
      FORBIDDEN_EXACT_DELETE_BUCKETS.has(
        target.bucket,
      )
    ) {
      throw new Error(
        `Safety failure: investor purge cannot delete objects from "${target.bucket}".`,
      );
    }

    let paths =
      byBucket.get(target.bucket);

    if (!paths) {
      paths = new Set<string>();

      byBucket.set(
        target.bucket,
        paths,
      );
    }

    paths.add(target.path);
  }

  const deletedCounts:
    Record<string, number> = {};

  for (
    const [bucket, paths]
    of byBucket.entries()
  ) {
    deletedCounts[bucket] =
      await removeStoragePaths(
        admin,
        bucket,
        Array.from(paths),
      );
  }

  return deletedCounts;
}

async function verifyInvestorPrefixesEmpty(
  admin: ReturnType<
    typeof createAdminClient
  >,
  userId: string,
): Promise<void> {
  for (
    const bucket
    of INVESTOR_PREFIX_BUCKETS
  ) {
    const remaining =
      await listFilesRecursively(
        admin,
        bucket,
        userId,
      );

    if (remaining.length > 0) {
      throw new Error(
        `Storage verification failed: ${remaining.length} object(s) remain under "${bucket}/${userId}".`,
      );
    }
  }
}

async function verifyExplicitTargetsRemoved(
  admin: ReturnType<
    typeof createAdminClient
  >,
  targets: StorageTarget[],
): Promise<void> {
  for (const target of targets) {
    const normalizedPath =
      normalizeStoragePath(
        target.path,
      );

    const slashIndex =
      normalizedPath.lastIndexOf("/");

    const parent =
      slashIndex >= 0
        ? normalizedPath.slice(
            0,
            slashIndex,
          )
        : "";

    const fileName =
      slashIndex >= 0
        ? normalizedPath.slice(
            slashIndex + 1,
          )
        : normalizedPath;

    let offset = 0;

    const limit = 1000;

    while (true) {
      const {
        data,
        error,
      } = await admin.storage
        .from(target.bucket)
        .list(parent, {
          limit,
          offset,
          search: fileName,
        });

      if (error) {
        throw new Error(
          `Unable to verify Storage deletion for "${target.bucket}/${normalizedPath}": ${error.message}`,
        );
      }

      const entries = data ?? [];

      const stillExists =
        entries.some(
          (entry) =>
            Boolean(entry.id) &&
            entry.name === fileName,
        );

      if (stillExists) {
        throw new Error(
          `Storage verification failed: "${target.bucket}/${normalizedPath}" still exists.`,
        );
      }

      if (entries.length < limit) {
        break;
      }

      offset += limit;
    }
  }
}

function mergeDeletedCounts(
  ...countSets:
    Array<Record<string, number>>
): Record<string, number> {
  const result:
    Record<string, number> = {};

  for (const countSet of countSets) {
    for (
      const [bucket, count]
      of Object.entries(countSet)
    ) {
      result[bucket] =
        (result[bucket] ?? 0) +
        count;
    }
  }

  return result;
}

function mergeWithPreviousCounts(
  previous:
    | Record<string, number>
    | null
    | undefined,
  current:
    Record<string, number>,
): Record<string, number> {
  const result = {
    ...(previous ?? {}),
  };

  for (
    const [bucket, count]
    of Object.entries(current)
  ) {
    result[bucket] =
      (result[bucket] ?? 0) +
      count;
  }

  return result;
}

async function markOperationFailure(
  admin: ReturnType<
    typeof createAdminClient
  >,
  operationId: string,
  status:
    | "storage_cleanup_failed"
    | "auth_delete_failed",
  stage: string,
  message: string,
): Promise<void> {
  const { error } =
    await admin
      .from(
        "investor_purge_operations",
      )
      .update({
        status,
        failure_stage: stage,
        failure_message: message,
      })
      .eq("id", operationId);

  if (error) {
    console.error(
      "Unable to persist investor purge failure state:",
      error,
    );
  }
}

async function getActivePurgeOperation(
  admin: ReturnType<
    typeof createAdminClient
  >,

  userId: string,
): Promise<PurgeOperation | null> {
  const {
    data,
    error,
  } = await admin
    .from(
      "investor_purge_operations",
    )
    .select("*")
    .eq(
      "investor_id",
      userId,
    )
    .eq(
      "operation_type",
      "danger_purge",
    )
    .neq(
      "status",
      "completed",
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to inspect investor Danger Delete recovery state: ${error.message}`,
    );
  }

  if (
    data &&
    data.operation_type !==
      "danger_purge"
  ) {
    throw new Error(
      "Safety failure: Danger Delete attempted to resume a non-danger purge operation.",
    );
  }

  return (
    data as PurgeOperation | null
  );
}

async function getLatestPurgeOperation(
  admin: ReturnType<
    typeof createAdminClient
  >,

  userId: string,
): Promise<PurgeOperation | null> {
  const {
    data,
    error,
  } = await admin
    .from(
      "investor_purge_operations",
    )
    .select("*")
    .eq(
      "investor_id",
      userId,
    )
    .eq(
      "operation_type",
      "danger_purge",
    )
    .order(
      "created_at",
      {
        ascending: false,
      },
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to load investor Danger Delete operation: ${error.message}`,
    );
  }

  if (
    data &&
    data.operation_type !==
      "danger_purge"
  ) {
    throw new Error(
      "Safety failure: a non-danger operation was returned to the Danger Delete route.",
    );
  }

  return (
    data as PurgeOperation | null
  );
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  let userId = "";

  let operation:
    PurgeOperation | null = null;

  let databasePurgeComplete = false;
  let storageCleanupComplete = false;
  let authUserDeleted = false;

  try {
    const params =
      await context.params;

    userId =
      params.userId?.trim() ?? "";

    if (
      !userId ||
      !isUuid(userId)
    ) {
      return NextResponse.json(
        {
          error:
            "A valid investor user ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    let body: PurgeRequestBody;

    try {
      body =
        (await request.json()) as PurgeRequestBody;
    } catch {
      return NextResponse.json(
        {
          error:
            "A valid JSON request body is required.",
        },
        {
          status: 400,
        },
      );
    }

    const confirmation =
      typeof body.confirmation ===
      "string"
        ? body.confirmation.trim()
        : "";

    const reason =
      typeof body.reason ===
      "string"
        ? body.reason.trim()
        : "";

    if (
      confirmation !== "DELETE"
    ) {
      return NextResponse.json(
        {
          error:
            'Permanent investor deletion requires confirmation exactly equal to "DELETE".',
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
            "Permanent investor deletion requires a reason of at least 10 characters.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Real authenticated Admin client.
     *
     * This client is required for the
     * SECURITY DEFINER purge RPC because
     * auth.uid() must identify the Admin.
     */
    const supabase =
      await createClient();

    const {
      data: {
        user: adminUser,
      },
      error: userError,
    } =
      await supabase.auth.getUser();

    if (
      userError ||
      !adminUser
    ) {
      return NextResponse.json(
        {
          error:
            "Authentication required.",
        },
        {
          status: 401,
        },
      );
    }

    if (
      adminUser.id === userId
    ) {
      return NextResponse.json(
        {
          error:
            "An administrator cannot permanently delete their own account.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Privileged client is used only
     * after the real Admin identity has
     * been established.
     */
    const admin =
      createAdminClient();

    /*
     * Defense in depth:
     * explicitly verify the caller is
     * still a Tevuah Admin.
     */
    const {
      data: callerProfile,
      error: callerProfileError,
    } = await admin
      .from("profiles")
      .select("id, role")
      .eq(
        "id",
        adminUser.id,
      )
      .maybeSingle();

    if (callerProfileError) {
      return NextResponse.json(
        {
          error:
            callerProfileError.message,
        },
        {
          status: 500,
        },
      );
    }

    if (
      !callerProfile ||
      ![
        "admin",
        "super_admin",
      ].includes(
        String(
          callerProfile.role,
        ),
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Administrator privileges required.",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * ================================================================
     * RECOVERY CHECK
     * ================================================================
     *
     * This is the key idempotency rule.
     *
     * If an unfinished operation already
     * exists, NEVER run admin_purge_investor
     * again.
     *
     * Resume only Storage/Auth cleanup.
     */
    operation =
      await getActivePurgeOperation(
        admin,
        userId,
      );

    let resumed = false;
    let preflight: unknown = null;

    if (operation) {
      resumed = true;

      if (
        operation.database_purge_complete !==
        true
      ) {
        return NextResponse.json(
          {
            error:
              "Existing investor purge operation is inconsistent: database purge is not marked complete.",
            stage:
              "recovery_validation",
            operationId:
              operation.id,
          },
          {
            status: 500,
          },
        );
      }

      databasePurgeComplete =
        true;
    } else {
      /*
       * ==============================================================
       * FIRST EXECUTION ONLY
       * ==============================================================
       */

      const {
        data:
          preflightData,
        error:
          preflightError,
      } = await supabase.rpc(
        "admin_preflight_investor_purge",
        {
          p_investor_id:
            userId,
        },
      );

      if (preflightError) {
        return NextResponse.json(
          {
            error:
              preflightError.message,
            stage:
              "preflight",
          },
          {
            status: 400,
          },
        );
      }

      preflight =
        preflightData;

      /*
       * Destructive database purge.
       *
       * The DB function atomically creates
       * investor_purge_operations before
       * its transaction commits.
       */
      const {
        data:
          purgeData,
        error:
          purgeError,
      } = await supabase.rpc(
        "admin_purge_investor",
        {
          p_investor_id:
            userId,

          p_confirmation:
            confirmation,

          p_reason:
            reason,
        },
      );

      if (purgeError) {
        return NextResponse.json(
          {
            error:
              purgeError.message,

            stage:
              "database_purge",

            preflight,
          },
          {
            status: 400,
          },
        );
      }

      const normalizedPurgeData =
        Array.isArray(
          purgeData,
        )
          ? purgeData[0]
          : purgeData;

      if (
        !normalizedPurgeData ||
        typeof normalizedPurgeData !==
          "object"
      ) {
        return NextResponse.json(
          {
            error:
              "Database purge returned an invalid result.",

            stage:
              "database_purge_validation",
          },
          {
            status: 500,
          },
        );
      }

      const purgeResult =
        normalizedPurgeData as PurgeResult;

      if (
        purgeResult.investor_id !==
          userId ||
        purgeResult.database_purge_complete !==
          true
      ) {
        return NextResponse.json(
          {
            error:
              "Database purge did not return a valid completion confirmation.",

            stage:
              "database_purge_validation",
          },
          {
            status: 500,
          },
        );
      }

      databasePurgeComplete =
        true;

      /*
       * The operation MUST now exist
       * because it was inserted inside
       * the same DB transaction.
       */
      operation =
        await getActivePurgeOperation(
          admin,
          userId,
        );

      if (!operation) {
        /*
         * Check latest as a defensive
         * diagnostic in case something
         * unexpectedly marked it complete.
         */
        const latest =
          await getLatestPurgeOperation(
            admin,
            userId,
          );

        return NextResponse.json(
          {
            error:
              "Database purge completed but the durable purge operation could not be loaded.",

            stage:
              "recovery_operation_missing",

            databasePurgeComplete:
              true,

            latestOperation:
              latest,
          },
          {
            status: 500,
          },
        );
      }
    }

    /*
     * From this point forward, the DB
     * purge is complete and operation
     * is our durable source of truth.
     */
    if (!operation) {
      throw new Error(
        "Investor purge operation is unavailable.",
      );
    }

    if (
    operation.operation_type !==
    "danger_purge"
    ) {
    throw new Error(
        "Safety failure: Danger Delete cannot process a Normal Delete recovery operation.",
    );
    }

    const operationId =
      operation.id;

    /*
     * ================================================================
     * STORAGE
     * ================================================================
     */

    if (
      operation.storage_cleanup_complete !==
      true
    ) {
      const {
        targets:
          explicitStorageTargets,
        unresolved:
          unresolvedStorageRecords,
      } =
        parseExplicitStorageTargets(
          operation.storage_objects,
        );

      if (
        unresolvedStorageRecords.length >
        0
      ) {
        const message =
          "One or more captured Storage paths could not be mapped safely to a bucket. Auth deletion was stopped.";

        await markOperationFailure(
          admin,
          operationId,
          "storage_cleanup_failed",
          "storage_mapping",
          message,
        );

        return NextResponse.json(
          {
            error: message,

            stage:
              "storage_mapping",

            resumed,

            operationId,

            databasePurgeComplete:
              true,

            storageCleanupComplete:
              false,

            authUserDeleted:
              false,

            profileDeleted:
              false,

            unresolvedStorageRecords,
          },
          {
            status: 500,
          },
        );
      }

      try {
        /*
         * Delete all target-owned files
         * beneath confirmed investor
         * prefixes.
         */
        const prefixCounts =
          await purgeInvestorOwnedPrefixes(
            admin,
            userId,
          );

        /*
         * Delete additional explicit
         * bucket/path objects captured by
         * the DB purge.
         */
        const explicitCounts =
          await removeExplicitStorageTargets(
            admin,
            explicitStorageTargets,
          );

        /*
         * Verify both categories.
         */
        await verifyInvestorPrefixesEmpty(
          admin,
          userId,
        );

        await verifyExplicitTargetsRemoved(
          admin,
          explicitStorageTargets,
        );

        const currentCounts =
          mergeDeletedCounts(
            prefixCounts,
            explicitCounts,
          );

        const cumulativeCounts =
          mergeWithPreviousCounts(
            operation.storage_deleted_counts,
            currentCounts,
          );

        const {
          error:
            storageStateError,
        } = await admin
          .from(
            "investor_purge_operations",
          )
          .update({
            status:
              "storage_cleaned",

            storage_cleanup_complete:
              true,

            storage_deleted_counts:
              cumulativeCounts,

            storage_cleaned_at:
              new Date().toISOString(),

            failure_stage:
              null,

            failure_message:
              null,
          })
          .eq(
            "id",
            operationId,
          );

        if (storageStateError) {
          throw new Error(
            `Storage was cleaned but recovery state could not be updated: ${storageStateError.message}`,
          );
        }

        storageCleanupComplete =
          true;

        operation = {
          ...operation,

          status:
            "storage_cleaned",

          storage_cleanup_complete:
            true,

          storage_deleted_counts:
            cumulativeCounts,

          failure_stage:
            null,

          failure_message:
            null,
        };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Storage cleanup failed.";

        await markOperationFailure(
          admin,
          operationId,
          "storage_cleanup_failed",
          "storage_cleanup",
          message,
        );

        return NextResponse.json(
          {
            error: message,

            stage:
              "storage_cleanup",

            resumed,

            operationId,

            databasePurgeComplete:
              true,

            storageCleanupComplete:
              false,

            authUserDeleted:
              false,

            profileDeleted:
              false,
          },
          {
            status: 500,
          },
        );
      }
    } else {
      /*
       * Recovery request where Storage
       * was already completed.
       */
      storageCleanupComplete =
        true;
    }

    /*
     * Never proceed to Auth unless
     * Storage is known complete.
     */
    if (
      !storageCleanupComplete
    ) {
      return NextResponse.json(
        {
          error:
            "Auth deletion blocked because Storage cleanup is incomplete.",

          stage:
            "auth_delete_blocked",

          resumed,

          operationId,

          databasePurgeComplete:
            true,

          storageCleanupComplete:
            false,

          authUserDeleted:
            false,
        },
        {
          status: 500,
        },
      );
    }

   /*
 * ================================================================
 * AUTH — ALWAYS LAST
 * ================================================================
 *
 * Recovery rule:
 *
 * Before attempting deleteUser(), inspect Auth directly.
 *
 * This closes the important crash window where:
 *
 *   1. deleteUser() succeeded
 *   2. Auth user was actually removed
 *   3. updating investor_purge_operations failed
 *      or the request crashed
 *
 * On retry, an already-missing Auth user is considered
 * successfully deleted. We DO NOT require deleteUser()
 * to run twice.
 */

if (
  operation.auth_user_deleted !== true
) {
  /*
   * First determine whether the Auth user
   * still exists.
   *
   * getUserById() is performed with the
   * server-side Admin client only.
   */
  const {
    data: authLookupData,
    error: authLookupError,
  } =
    await admin.auth.admin.getUserById(
      userId,
    );

  let authUserAlreadyAbsent = false;

  if (authLookupError) {
    /*
     * Supabase Auth may represent a missing
     * user as an error.
     *
     * Only treat an explicit "user not found"
     * condition as absence.
     *
     * Any other Auth error must FAIL CLOSED.
     */
    const status =
      (
        authLookupError as {
          status?: number;
        }
      ).status;

    const code =
      (
        authLookupError as {
          code?: string;
        }
      ).code;

    const message =
      authLookupError.message
        ?.toLowerCase()
        .trim() ?? "";

    const explicitlyNotFound =
      status === 404 ||
      code === "user_not_found" ||
      message.includes(
        "user not found",
      );

    if (!explicitlyNotFound) {
      const failureMessage =
        `Unable to determine whether the Auth user still exists: ${authLookupError.message}`;

      await markOperationFailure(
        admin,
        operationId,
        "auth_delete_failed",
        "auth_lookup",
        failureMessage,
      );

      return NextResponse.json(
        {
          error:
            failureMessage,

          stage:
            "auth_lookup",

          resumed,

          operationId,

          databasePurgeComplete:
            true,

          storageCleanupComplete:
            true,

          authUserDeleted:
            false,

          profileDeleted:
            false,
        },
        {
          status: 500,
        },
      );
    }

    authUserAlreadyAbsent = true;
  } else {
    /*
     * Be defensive about a successful response
     * containing no actual user.
     */
    authUserAlreadyAbsent =
      !authLookupData?.user;
  }

  if (!authUserAlreadyAbsent) {
    /*
     * Auth user still exists.
     *
     * Storage has already been successfully
     * cleaned and verified, so Auth deletion
     * is now allowed.
     */
    const {
      error: authDeleteError,
    } =
      await admin.auth.admin.deleteUser(
        userId,
      );

    if (authDeleteError) {
      /*
       * There is another narrow idempotency
       * possibility:
       *
       * The Auth service may report "not found"
       * if the account disappeared between
       * getUserById() and deleteUser().
       *
       * Treat ONLY an explicit not-found result
       * as successful absence.
       */
      const status =
        (
          authDeleteError as {
            status?: number;
          }
        ).status;

      const code =
        (
          authDeleteError as {
            code?: string;
          }
        ).code;

      const message =
        authDeleteError.message
          ?.toLowerCase()
          .trim() ?? "";

      const explicitlyNotFound =
        status === 404 ||
        code === "user_not_found" ||
        message.includes(
          "user not found",
        );

      if (!explicitlyNotFound) {
        const failureMessage =
          `Database and Storage purge completed, but Auth deletion failed: ${authDeleteError.message}`;

        await markOperationFailure(
          admin,
          operationId,
          "auth_delete_failed",
          "auth_delete",
          failureMessage,
        );

        return NextResponse.json(
          {
            error:
              failureMessage,

            stage:
              "auth_delete",

            resumed,

            operationId,

            databasePurgeComplete:
              true,

            storageCleanupComplete:
              true,

            authUserDeleted:
              false,

            profileDeleted:
              false,
          },
          {
            status: 500,
          },
        );
      }
    }
  }

  /*
   * At this point either:
   *
   *   A. Auth user existed and deleteUser()
   *      succeeded
   *
   *   B. Auth user was already absent
   *
   *   C. Auth user disappeared between lookup
   *      and deleteUser()
   *
   * All three mean the Auth deletion stage is
   * complete.
   */
  authUserDeleted = true;

  const {
    error: authStateError,
  } = await admin
    .from(
      "investor_purge_operations",
    )
    .update({
      auth_user_deleted:
        true,

      auth_user_deleted_at:
        operation.auth_user_deleted_at ??
        new Date().toISOString(),

      failure_stage:
        null,

      failure_message:
        null,
    })
    .eq(
      "id",
      operationId,
    );

  if (authStateError) {
    /*
     * IMPORTANT:
     *
     * Do not fail the deletion itself merely
     * because recording the Auth checkpoint
     * failed.
     *
     * The Auth account is already absent.
     *
     * A later retry will perform getUserById(),
     * see that the user is absent, and safely
     * continue again.
     */
    console.error(
      "Auth user is absent but purge operation could not record the Auth checkpoint:",
      authStateError,
    );
  }

  operation = {
    ...operation,

    auth_user_deleted:
      true,

    auth_user_deleted_at:
      operation.auth_user_deleted_at ??
      new Date().toISOString(),

    failure_stage:
      null,

    failure_message:
      null,
  };
} else {
  /*
   * Recovery ledger already confirms the
   * Auth deletion stage.
   */
  authUserDeleted = true;
}
    /*
     * ================================================================
     * PROFILE CASCADE VERIFICATION
     * ================================================================
     *
     * profiles.id -> auth.users.id
     * ON DELETE CASCADE
     */

    const {
      data:
        remainingProfile,
      error:
        profileCheckError,
    } = await admin
      .from("profiles")
      .select("id")
      .eq(
        "id",
        userId,
      )
      .maybeSingle();

    if (profileCheckError) {
      return NextResponse.json(
        {
          error:
            `Auth deletion completed, but profile cascade verification failed: ${profileCheckError.message}`,

          stage:
            "profile_verification",

          resumed,

          operationId,

          databasePurgeComplete:
            true,

          storageCleanupComplete:
            true,

          authUserDeleted:
            true,

          profileDeleted:
            null,
        },
        {
          status: 500,
        },
      );
    }

    if (remainingProfile) {
      return NextResponse.json(
        {
          error:
            "Auth user deletion completed but the investor profile still exists.",

          stage:
            "profile_verification",

          resumed,

          operationId,

          databasePurgeComplete:
            true,

          storageCleanupComplete:
            true,

          authUserDeleted:
            true,

          profileDeleted:
            false,
        },
        {
          status: 500,
        },
      );
    }

    /*
     * ================================================================
     * COMPLETE DURABLE OPERATION
     * ================================================================
     */

    const completedAt =
      new Date().toISOString();

    const {
      error:
        completeError,
    } = await admin
      .from(
        "investor_purge_operations",
      )
      .update({
        status:
          "completed",

        database_purge_complete:
          true,

        storage_cleanup_complete:
          true,

        auth_user_deleted:
          true,

        profile_deleted:
          true,

        completed_at:
          completedAt,

        failure_stage:
          null,

        failure_message:
          null,
      })
      .eq(
        "id",
        operationId,
      );

    if (completeError) {
      return NextResponse.json(
        {
          error:
            `Investor was deleted successfully, but the purge operation could not be marked completed: ${completeError.message}`,

          stage:
            "operation_completion",

          resumed,

          operationId,

          databasePurgeComplete:
            true,

          storageCleanupComplete:
            true,

          authUserDeleted:
            true,

          profileDeleted:
            true,
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,

        message:
          "Investor permanently deleted.",

        investorId:
          userId,

        operationId,

        resumed,

        databasePurgeComplete:
          true,

        storageCleanupComplete:
          true,

        authUserDeleted:
          true,

        profileDeleted:
          true,

        affectedOpportunityIds:
          operation
            .affected_opportunity_ids ??
          [],

        affectedJointSubscriptionIds:
          operation
            .affected_joint_subscription_ids ??
          [],

        databaseDeletedCounts:
          operation
            .database_deleted_counts ??
          {},

        storageDeletedCounts:
          operation
            .storage_deleted_counts ??
          {},

        databasePurgedAt:
          operation.database_purged_at,

        completedAt,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected permanent investor deletion error.";

    /*
     * Best-effort recovery-state recording.
     */
    if (
      operation &&
      operation.status !==
        "completed"
    ) {
      try {
        const admin =
          createAdminClient();

        const failureStatus =
          storageCleanupComplete
            ? "auth_delete_failed"
            : "storage_cleanup_failed";

        await markOperationFailure(
          admin,
          operation.id,
          failureStatus,
          storageCleanupComplete
            ? "post_storage_cleanup"
            : "post_database_purge",
          message,
        );
      } catch {
        // Do not hide the original error.
      }
    }

    return NextResponse.json(
      {
        error: message,

        stage:
          databasePurgeComplete
            ? "recovery"
            : "before_database_purge_completion",

        operationId:
          operation?.id ?? null,

        databasePurgeComplete,

        storageCleanupComplete,

        authUserDeleted,

        investorId:
          userId || null,
      },
      {
        status: 500,
      },
    );
  }
}