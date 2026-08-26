import {
  NextResponse,
  type NextRequest,
} from "next/server";

import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";
import { encryptSensitiveValue } from "@/src/lib/security/encryption";
import {
  checkOnboardingEditable,
} from "@/src/lib/onboarding/require-editable";
import {
  checkAccountAccess,
} from "@/src/lib/auth/account-status";

type TaxPayload = {
  isUsPerson: boolean;

  taxpayerName: string;
  taxResidencyCountry: string;

  countryOfCitizenship?: string;
  dateOfBirth?: string;

  taxClassification?: string;

  tinType?: string;
  tin?: string;

  foreignTin?: string;

  foreignTaxIdNotRequired?: boolean;

  permanentAddressLine1?: string;
  permanentAddressLine2?: string;

  permanentCity?: string;
  permanentStateRegion?: string;
  permanentPostalCode?: string;
  permanentCountry?: string;

  treatyClaimed?: boolean;

  treatyCountry?: string;
  treatyArticle?: string;
  treatyRate?: string;
  treatyIncomeType?: string;

  exemptPayeeCode?: string;
  fatcaExemptionCode?: string;

  certificationAccepted: boolean;
  certificationName: string;

  w9DocumentPath?: string | null;
  w9SupportingDocumentPath?: string | null;

  w8benDocumentPath?: string | null;
  w8benSupportingDocumentPath?: string | null;
};

function normalizeUsTin(
  value: string,
) {
  return value.replace(
    /\D/g,
    "",
  );
}

function lastFour(
  value: string,
) {
  return value.slice(-4);
}

export async function POST(
  request: NextRequest,
) {
  try {
    /*
     * 1. Authenticate current investor.
     */
    const supabase =
      await createClient();

    const {
      data: claimsData,
    } =
      await supabase.auth.getClaims();

    const userId =
      claimsData?.claims?.sub;

    if (!userId) {
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
 * Reject suspended / disabled accounts.
 */
const accountAccess =
  await checkAccountAccess(
    userId,
  );

if (
  !accountAccess.allowed
) {
  return NextResponse.json(
    {
      error:
        accountAccess.reason,

      accountStatus:
        accountAccess.status,
    },
    {
      status: 403,
    },
  );
}

    /*
 * Do not allow edits after the
 * complete onboarding package has
 * been locked for compliance review.
 */
const editCheck =
  await checkOnboardingEditable(
    userId,
    "tax",
  );

if (!editCheck.allowed) {
  return NextResponse.json(
    {
      error:
        editCheck.reason,
    },
    {
      status: 423,
    },
  );
}

    /*
     * 2. Read payload.
     */
    const body =
      (await request.json()) as TaxPayload;

    const taxpayerName =
      body.taxpayerName?.trim();

    const taxResidencyCountry =
      body.taxResidencyCountry?.trim();

    const certificationName =
      body.certificationName?.trim();

    /*
     * 3. Common validations.
     */
    if (!taxpayerName) {
      return NextResponse.json(
        {
          error:
            "Taxpayer legal name is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!taxResidencyCountry) {
      return NextResponse.json(
        {
          error:
            "Tax residency country is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !body.certificationAccepted
    ) {
      return NextResponse.json(
        {
          error:
            "You must accept the tax certification.",
        },
        {
          status: 400,
        },
      );
    }

    if (!certificationName) {
      return NextResponse.json(
        {
          error:
            "Enter your full legal name as your electronic certification.",
        },
        {
          status: 400,
        },
      );
    }

    let taxFormType:
      | "W-9"
      | "W-8BEN";

    let tinType:
      string | null =
      null;

    let tin:
      string | null =
      null;

    let foreignTin:
      string | null =
      null;

    /*
     * 4. U.S. PERSON / W-9
     */
    if (body.isUsPerson) {
      taxFormType =
        "W-9";

      const submittedTinType =
        body.tinType?.trim();

      if (
        !submittedTinType ||
        ![
          "SSN",
          "ITIN",
          "EIN",
        ].includes(
          submittedTinType,
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Select a valid U.S. TIN type.",
          },
          {
            status: 400,
          },
        );
      }

      tinType =
        submittedTinType;

      tin =
        normalizeUsTin(
          body.tin ?? "",
        );

      if (
        tin.length !== 9
      ) {
        return NextResponse.json(
          {
            error:
              "Enter a valid 9-digit U.S. taxpayer identification number.",
          },
          {
            status: 400,
          },
        );
      }

      /*
       * W-9 document is mandatory.
       */
      if (
        !body.w9DocumentPath
      ) {
        return NextResponse.json(
          {
            error:
              "Upload your completed W-9 document.",
          },
          {
            status: 400,
          },
        );
      }

      const expectedPrefix =
        `${userId}/tax/`;

      if (
        !body.w9DocumentPath.startsWith(
          expectedPrefix,
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid W-9 document path.",
          },
          {
            status: 403,
          },
        );
      }

      if (
        body.w9SupportingDocumentPath &&
        !body.w9SupportingDocumentPath.startsWith(
          expectedPrefix,
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid W-9 supporting document path.",
          },
          {
            status: 403,
          },
        );
      }
    } else {
      /*
       * 5. NON-U.S. INDIVIDUAL / W-8BEN
       */
      taxFormType =
        "W-8BEN";

      const citizenship =
        body.countryOfCitizenship?.trim();

      if (!citizenship) {
        return NextResponse.json(
          {
            error:
              "Country of citizenship is required.",
          },
          {
            status: 400,
          },
        );
      }

      if (!body.dateOfBirth) {
        return NextResponse.json(
          {
            error:
              "Date of birth is required.",
          },
          {
            status: 400,
          },
        );
      }

      if (
        !body.permanentAddressLine1?.trim() ||
        !body.permanentCity?.trim() ||
        !body.permanentCountry?.trim()
      ) {
        return NextResponse.json(
          {
            error:
              "Complete your permanent residence address.",
          },
          {
            status: 400,
          },
        );
      }

      foreignTin =
        body.foreignTin?.trim() ||
        null;

      if (
        !foreignTin &&
        !body.foreignTaxIdNotRequired
      ) {
        return NextResponse.json(
          {
            error:
              "Enter your foreign TIN or indicate that a foreign TIN is not required.",
          },
          {
            status: 400,
          },
        );
      }

      /*
       * Optional U.S. ITIN/TIN.
       */
      if (
        body.tin?.trim()
      ) {
        tin =
          normalizeUsTin(
            body.tin,
          );

        if (
          tin.length !== 9
        ) {
          return NextResponse.json(
            {
              error:
                "The U.S. TIN must contain 9 digits.",
            },
            {
              status: 400,
            },
          );
        }

        tinType =
          body.tinType?.trim() ||
          "ITIN";
      }

      /*
       * W-8BEN document mandatory.
       */
      if (
        !body.w8benDocumentPath
      ) {
        return NextResponse.json(
          {
            error:
              "Upload your completed W-8BEN document.",
          },
          {
            status: 400,
          },
        );
      }

      const expectedPrefix =
        `${userId}/tax/`;

      if (
        !body.w8benDocumentPath.startsWith(
          expectedPrefix,
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid W-8BEN document path.",
          },
          {
            status: 403,
          },
        );
      }

      if (
        body.w8benSupportingDocumentPath &&
        !body.w8benSupportingDocumentPath.startsWith(
          expectedPrefix,
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid W-8BEN supporting document path.",
          },
          {
            status: 403,
          },
        );
      }
    }

    /*
     * 6. Encrypt sensitive TIN values.
     */
    const encryptedTin =
      tin
        ? encryptSensitiveValue(
            tin,
          )
        : null;

    const encryptedForeignTin =
      foreignTin
        ? encryptSensitiveValue(
            foreignTin,
          )
        : null;

    const admin =
      createAdminClient();

    const now =
      new Date().toISOString();

    /*
     * 7. Save encrypted values.
     */
    const {
      error: sensitiveError,
    } = await admin.rpc(
      "save_sensitive_tax_identity",
      {
        p_user_id:
          userId,

        p_tin_ciphertext:
          encryptedTin?.ciphertext ??
          null,

        p_tin_iv:
          encryptedTin?.iv ??
          null,

        p_tin_auth_tag:
          encryptedTin?.authTag ??
          null,

        p_foreign_tin_ciphertext:
          encryptedForeignTin?.ciphertext ??
          null,

        p_foreign_tin_iv:
          encryptedForeignTin?.iv ??
          null,

        p_foreign_tin_auth_tag:
          encryptedForeignTin?.authTag ??
          null,
      },
    );

    if (sensitiveError) {
      console.error(
        "Sensitive tax save error:",
        sensitiveError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to securely save taxpayer identification information.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 8. Construct ONE tax record.
     *
     * Important:
     * document paths are explicitly included.
     */
    const taxRecord = {
      user_id:
        userId,

      tax_residency_country:
        taxResidencyCountry,

      country_of_tax_residence:
        taxResidencyCountry,

      is_us_citizen:
        body.isUsPerson,

      is_us_tax_resident:
        body.isUsPerson,

      tax_form_type:
        taxFormType,

      taxpayer_name:
        taxpayerName,

      tax_classification:
        body.isUsPerson
          ? body.taxClassification?.trim() ||
            "individual"
          : null,

      tin_type:
        tinType,

      tin_last_four:
        tin
          ? lastFour(tin)
          : null,

      foreign_tin_last_four:
        foreignTin
          ? lastFour(
              foreignTin,
            )
          : null,

      foreign_tax_id_not_required:
        body.isUsPerson
          ? false
          : Boolean(
              body.foreignTaxIdNotRequired,
            ),

      country_of_citizenship:
        body.isUsPerson
          ? null
          : body.countryOfCitizenship?.trim() ||
            null,

      date_of_birth:
        body.isUsPerson
          ? null
          : body.dateOfBirth ||
            null,

      permanent_address_line_1:
        body.isUsPerson
          ? null
          : body.permanentAddressLine1?.trim() ||
            null,

      permanent_address_line_2:
        body.isUsPerson
          ? null
          : body.permanentAddressLine2?.trim() ||
            null,

      permanent_city:
        body.isUsPerson
          ? null
          : body.permanentCity?.trim() ||
            null,

      permanent_state_region:
        body.isUsPerson
          ? null
          : body.permanentStateRegion?.trim() ||
            null,

      permanent_postal_code:
        body.isUsPerson
          ? null
          : body.permanentPostalCode?.trim() ||
            null,

      permanent_country:
        body.isUsPerson
          ? null
          : body.permanentCountry?.trim() ||
            null,

      treaty_claimed:
        body.isUsPerson
          ? false
          : Boolean(
              body.treatyClaimed,
            ),

      treaty_country:
        !body.isUsPerson &&
        body.treatyClaimed
          ? body.treatyCountry?.trim() ||
            null
          : null,

      treaty_article:
        !body.isUsPerson &&
        body.treatyClaimed
          ? body.treatyArticle?.trim() ||
            null
          : null,

      treaty_rate:
        !body.isUsPerson &&
        body.treatyClaimed
          ? body.treatyRate?.trim() ||
            null
          : null,

      treaty_income_type:
        !body.isUsPerson &&
        body.treatyClaimed
          ? body.treatyIncomeType?.trim() ||
            null
          : null,

      exempt_payee_code:
        body.isUsPerson
          ? body.exemptPayeeCode?.trim() ||
            null
          : null,

      fatca_exemption_code:
        body.isUsPerson
          ? body.fatcaExemptionCode?.trim() ||
            null
          : null,

      /*
       * THE CRITICAL W-9 FIELDS.
       */
      w9_document_path:
        body.isUsPerson
          ? body.w9DocumentPath
          : null,

      w9_supporting_document_path:
        body.isUsPerson
          ? body.w9SupportingDocumentPath ??
            null
          : null,

      /*
       * W-8BEN fields.
       */
      w8ben_document_path:
        !body.isUsPerson
          ? body.w8benDocumentPath
          : null,

      w8ben_supporting_document_path:
        !body.isUsPerson
          ? body.w8benSupportingDocumentPath ??
            null
          : null,

      certification_accepted:
        true,

      certification_name:
        certificationName,

      certification_date:
        now,

      irs_verification_reference:
        null,

      status:
        "under_review",

      rejection_reason:
        null,

      admin_notes:
        null,

      submitted_at:
        now,

      updated_at:
        now,
    };

    /*
     * 9. Save and immediately SELECT
     * the database result.
     *
     * This guarantees we know what
     * Postgres actually saved.
     */
    const {
      data: savedTax,
      error: taxError,
    } = await admin
      .from(
        "investor_tax_profiles",
      )
      .upsert(
        taxRecord,
        {
          onConflict:
            "user_id",
        },
      )
      .select(
        `
        user_id,
        tax_form_type,
        tin_type,
        tin_last_four,
        foreign_tin_last_four,
        w9_document_path,
        w9_supporting_document_path,
        w8ben_document_path,
        w8ben_supporting_document_path,
        status
        `,
      )
      .single();

    if (taxError) {
      console.error(
        "Tax profile save error:",
        taxError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to save tax certification.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 10. Defensive verification.
     *
     * If this is W-9, the DB MUST return
     * the W-9 path we just wrote.
     */
    if (
      body.isUsPerson &&
      !savedTax.w9_document_path
    ) {
      console.error(
        "W-9 path missing after database write:",
        savedTax,
      );

      return NextResponse.json(
        {
          error:
            "The W-9 uploaded successfully, but its document path was not saved. Tax submission was not completed.",
        },
        {
          status: 500,
        },
      );
    }

    if (
      !body.isUsPerson &&
      !savedTax.w8ben_document_path
    ) {
      console.error(
        "W-8BEN path missing after database write:",
        savedTax,
      );

      return NextResponse.json(
        {
          error:
            "The W-8BEN uploaded successfully, but its document path was not saved. Tax submission was not completed.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 11. Update profile.
     */
    const {
      error: profileError,
    } = await admin
      .from("profiles")
      .update({
        tax_status:
          "under_review",

        onboarding_status:
          "in_progress",

        updated_at:
          now,
      })
      .eq(
        "id",
        userId,
      );

    if (profileError) {
      console.error(
        "Tax profile status error:",
        profileError,
      );

      return NextResponse.json(
        {
          error:
            "Tax certification was saved, but the investor profile could not be updated.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 12. Onboarding progress.
     */
    const {
      error: onboardingError,
    } = await admin
      .from(
        "investor_onboarding",
      )
      .upsert(
        {
          user_id:
            userId,

          tax_completed:
            true,

          current_step:
            "review",

          updated_at:
            now,
        },
        {
          onConflict:
            "user_id",
        },
      );

    if (onboardingError) {
      console.error(
        "Tax onboarding progress error:",
        onboardingError,
      );

      return NextResponse.json(
        {
          error:
            "Tax certification was saved, but onboarding progress could not be updated.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 13. Success.
     */
    return NextResponse.json({
      success: true,

      taxFormType,

      status:
        "under_review",

      documentPath:
        body.isUsPerson
          ? savedTax.w9_document_path
          : savedTax.w8ben_document_path,

      next:
        "/dashboard/onboarding/review",
    });
  } catch (error) {
    console.error(
      "Tax certification submission error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while submitting your tax certification.",
      },
      {
        status: 500,
      },
    );
  }
}