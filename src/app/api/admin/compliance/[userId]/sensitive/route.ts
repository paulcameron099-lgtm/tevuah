import {
  NextResponse,
} from "next/server";

import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";
import {
  recordComplianceAudit,
} from "@/src/lib/compliance/audit";

import {
  decryptSensitiveValue,
} from "@/src/lib/security/encryption";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

type SensitiveField =
  | "ssn"
  | "drivers_license"
  | "tin"
  | "foreign_tin";

type RequestPayload = {
  field: SensitiveField;
};

export async function POST(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  try {
    /*
     * 1. Authenticate the currently
     * signed-in user.
     */
    const supabase =
      await createClient();

    const {
      data: claimsData,
      error: claimsError,
    } =
      await supabase.auth.getClaims();

    const adminUserId =
      claimsData?.claims?.sub;

    if (
      claimsError ||
      !adminUserId
    ) {
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
     * 2. Use server-only admin client.
     */
    const admin =
      createAdminClient();

    /*
     * 3. Verify admin role.
     */
    const {
      data: adminProfile,
      error:
        adminProfileError,
    } = await admin
      .from("profiles")
      .select(
        `
        id,
        role
        `,
      )
      .eq(
        "id",
        adminUserId,
      )
      .maybeSingle();

    if (
      adminProfileError ||
      !adminProfile
    ) {
      return NextResponse.json(
        {
          error:
            "Unable to verify administrator.",
        },
        {
          status: 403,
        },
      );
    }

    if (
      adminProfile.role !==
        "admin" &&
      adminProfile.role !==
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
     * 4. Determine which investor is
     * being reviewed.
     */
    const {
      userId,
    } = await params;

    if (!userId) {
      return NextResponse.json(
        {
          error:
            "Investor ID is missing.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 5. Parse requested sensitive field.
     */
    const body =
      (await request.json()) as RequestPayload;

    const field =
      body.field;

    const allowedFields:
      SensitiveField[] = [
        "ssn",
        "drivers_license",
        "tin",
        "foreign_tin",
      ];

    if (
      !field ||
      !allowedFields.includes(
        field,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid sensitive field.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 6. Identity fields.
     */
    if (
      field === "ssn" ||
      field ===
        "drivers_license"
    ) {
     const {
  data: identityRows,
  error: identityError,
} = await admin.rpc(
  "get_sensitive_identity_for_admin",
  {
    p_user_id: userId,
  },
);

const identity =
  identityRows?.[0];

      if (
        identityError ||
        !identity
      ) {
        console.error(
          "Sensitive identity lookup error:",
          identityError,
        );

        return NextResponse.json(
          {
            error:
              "Sensitive identity information could not be loaded.",
          },
          {
            status: 404,
          },
        );
      }

      if (
        field === "ssn"
      ) {
        if (
          !identity.ssn_ciphertext ||
          !identity.ssn_iv ||
          !identity.ssn_auth_tag
        ) {
          return NextResponse.json(
            {
              error:
                "Full SSN is not available.",
            },
            {
              status: 404,
            },
          );
        }

        const value =
        decryptSensitiveValue({
            ciphertext:
            identity.ssn_ciphertext,

            iv:
            identity.ssn_iv,

            authTag:
            identity.ssn_auth_tag,
        });

        await recordComplianceAudit({
        actorUserId:
            adminUserId,

        investorUserId:
            userId,

        action:
            "sensitive_value_revealed",

        fieldName:
            "ssn",
        });

        return NextResponse.json({
        success: true,
        field: "ssn",
        value,
        });
      }

      if (
        !identity.drivers_license_ciphertext ||
        !identity.drivers_license_iv ||
        !identity.drivers_license_auth_tag
      ) {
        return NextResponse.json(
          {
            error:
              "Full driver's license number is not available.",
          },
          {
            status: 404,
          },
        );
      }

        const value =
    decryptSensitiveValue({
        ciphertext:
        identity.drivers_license_ciphertext,

        iv:
        identity.drivers_license_iv,

        authTag:
        identity.drivers_license_auth_tag,
    });

    await recordComplianceAudit({
    actorUserId:
        adminUserId,

    investorUserId:
        userId,

    action:
        "sensitive_value_revealed",

    fieldName:
        "drivers_license",
    });

    return NextResponse.json({
    success: true,
    field:
        "drivers_license",
    value,
    });
    }

    /*
     * 7. Tax fields.
     */
    const {
  data: taxRows,
  error: taxError,
} = await admin.rpc(
  "get_sensitive_tax_for_admin",
  {
    p_user_id: userId,
  },
);

const tax =
  taxRows?.[0];

    if (
      taxError ||
      !tax
    ) {
      console.error(
        "Sensitive tax lookup error:",
        taxError,
      );

      return NextResponse.json(
        {
          error:
            "Sensitive tax information could not be loaded.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      field === "tin"
    ) {
      if (
        !tax.tin_ciphertext ||
        !tax.tin_iv ||
        !tax.tin_auth_tag
      ) {
        return NextResponse.json(
          {
            error:
              "Full TIN is not available.",
          },
          {
            status: 404,
          },
        );
      }

      const value =
        decryptSensitiveValue({
            ciphertext:
            tax.tin_ciphertext,

            iv:
            tax.tin_iv,

            authTag:
            tax.tin_auth_tag,
        });

        await recordComplianceAudit({
        actorUserId:
            adminUserId,

        investorUserId:
            userId,

        action:
            "sensitive_value_revealed",

        fieldName:
            "tin",
        });

        return NextResponse.json({
        success: true,
        field: "tin",
        value,
        });
    }

    if (
      !tax.foreign_tin_ciphertext ||
      !tax.foreign_tin_iv ||
      !tax.foreign_tin_auth_tag
    ) {
      return NextResponse.json(
        {
          error:
            "Full foreign TIN is not available.",
        },
        {
          status: 404,
        },
      );
    }

    const value =
    decryptSensitiveValue({
        ciphertext:
        tax.foreign_tin_ciphertext,

        iv:
        tax.foreign_tin_iv,

        authTag:
        tax.foreign_tin_auth_tag,
    });

    /*
    * Audit the foreign TIN reveal.
    */
    await recordComplianceAudit({
    actorUserId:
        adminUserId,

    investorUserId:
        userId,

    action:
        "sensitive_value_revealed",

    fieldName:
        "foreign_tin",
    });

    return NextResponse.json({
    success: true,

    field:
        "foreign_tin",

    value,
    });
 } catch (error) {
  console.error(
    "Sensitive reveal error:",
    error,
  );

  return NextResponse.json(
    {
      error:
        "Unable to reveal sensitive information.",
    },
    {
      status: 500,
    },
  );
}
}