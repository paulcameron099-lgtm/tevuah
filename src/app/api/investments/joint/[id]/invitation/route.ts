import {
  NextResponse,
  type NextRequest,
} from "next/server";

import {
  createHash,
  randomBytes,
} from "crypto";

import {
  createClient,
} from "@/src/lib/supabase/server";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

import {
  checkAccountAccess,
} from "@/src/lib/auth/account-status";

import {
  sendApplicationMail,
} from "@/src/lib/email/application-mailer";

import {
  jointInvestmentInvitationEmail,
} from "@/src/lib/email/joint-investment";


export const dynamic =
  "force-dynamic";


function isUuid(
  value: string,
) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}


function getAppOrigin(
  request: NextRequest,
) {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL;

  if (configuredOrigin) {
    return configuredOrigin.replace(
      /\/$/,
      "",
    );
  }

  return request.nextUrl.origin.replace(
    /\/$/,
    "",
  );
}


export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    /*
     * ==========================================================
     * 1. AUTHENTICATE INITIATOR
     * ==========================================================
     */

    const supabase =
      await createClient();

    const {
      data: claimsData,
      error: claimsError,
    } =
      await supabase.auth.getClaims();

    const userId =
      claimsData?.claims?.sub;

    if (
      claimsError ||
      !userId
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
     * ==========================================================
     * 2. ACCOUNT ACCESS
     * ==========================================================
     */

    const accountAccess =
      await checkAccountAccess(
        userId,
      );

    if (!accountAccess.allowed) {
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
     * ==========================================================
     * 3. VALIDATE JOINT INVESTMENT ID
     * ==========================================================
     */

    const { id } =
      await context.params;

    if (
      !id ||
      !isUuid(id)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid joint investment.",
        },
        {
          status: 400,
        },
      );
    }


    /*
     * ==========================================================
     * 4. SERVER-SIDE DATA LOOKUPS
     * ==========================================================
     *
     * Admin client is used ONLY to load the data required for
     * email construction.
     *
     * The invitation RPC itself is intentionally called using
     * the authenticated Supabase client later so auth.uid()
     * remains available to PostgreSQL.
     */

    const admin =
      createAdminClient();


    const {
      data: joint,
      error: jointError,
    } =
      await admin
        .from(
          "joint_investment_subscriptions",
        )
        .select(
          `
            id,
            initiated_by,
            opportunity_id,
            total_commitment_amount,
            currency,
            status
          `,
        )
        .eq(
          "id",
          id,
        )
        .maybeSingle();


    if (
      jointError ||
      !joint
    ) {
      console.error(
        "Joint investment lookup error:",
        jointError,
      );

      return NextResponse.json(
        {
          error:
            "Joint investment not found.",
        },
        {
          status: 404,
        },
      );
    }


    /*
     * Defense in depth.
     *
     * PostgreSQL will independently enforce this again
     * inside issue_joint_investment_invitation().
     */

    if (
      joint.initiated_by !==
      userId
    ) {
      return NextResponse.json(
        {
          error:
            "You are not authorized to issue this invitation.",
        },
        {
          status: 403,
        },
      );
    }


    /*
     * ==========================================================
     * 5. LOAD BOTH JOINT MEMBERS
     * ==========================================================
     */

    const {
      data: members,
      error: membersError,
    } =
      await admin
        .from(
          "joint_investment_members",
        )
        .select(
          `
            id,
            investor_id,
            member_slot,
            obligation_amount,
            member_status
          `,
        )
        .eq(
          "joint_subscription_id",
          id,
        )
        .order(
          "member_slot",
          {
            ascending: true,
          },
        );


    if (
      membersError ||
      !members
    ) {
      console.error(
        "Joint members lookup error:",
        membersError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to load joint investment members.",
        },
        {
          status: 500,
        },
      );
    }


    const memberOne =
      members.find(
        (member) =>
          member.member_slot === 1,
      );

    const memberTwo =
      members.find(
        (member) =>
          member.member_slot === 2,
      );


    if (
      !memberOne ||
      !memberTwo
    ) {
      return NextResponse.json(
        {
          error:
            "Joint investment members are incomplete.",
        },
        {
          status: 400,
        },
      );
    }


    /*
     * ==========================================================
     * 6. LOAD INVESTOR PROFILE NAMES
     * ==========================================================
     */

    const {
      data: profiles,
      error: profilesError,
    } =
      await admin
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
        .in(
          "id",
          [
            memberOne.investor_id,
            memberTwo.investor_id,
          ],
        );


    if (profilesError) {
      console.error(
        "Joint profile lookup error:",
        profilesError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to load investor information.",
        },
        {
          status: 500,
        },
      );
    }


    const initiatorProfile =
      profiles?.find(
        (profile) =>
          profile.id ===
          memberOne.investor_id,
      );

    const inviteeProfile =
      profiles?.find(
        (profile) =>
          profile.id ===
          memberTwo.investor_id,
      );


    if (
      !initiatorProfile ||
      !inviteeProfile
    ) {
      return NextResponse.json(
        {
          error:
            "Investor profile information is incomplete.",
        },
        {
          status: 400,
        },
      );
    }


    const inviterName =
      [
        initiatorProfile.first_name,
        initiatorProfile.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      "An investor";


    const inviteeName =
      [
        inviteeProfile.first_name,
        inviteeProfile.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      "Investor";


    /*
     * ==========================================================
     * 7. LOAD INVITEE EMAIL FROM SUPABASE AUTH
     * ==========================================================
     *
     * profiles does not contain email in the current schema.
     */

    const {
      data: inviteeAuthData,
      error: inviteeAuthError,
    } =
      await admin.auth.admin.getUserById(
        memberTwo.investor_id,
      );


    if (inviteeAuthError) {
      console.error(
        "Joint invitee auth lookup error:",
        inviteeAuthError,
      );
    }


    const inviteeEmail =
      inviteeAuthData?.user?.email ??
      null;


    if (!inviteeEmail) {
      return NextResponse.json(
        {
          error:
            "The invited investor does not have a valid email address.",
        },
        {
          status: 400,
        },
      );
    }


    /*
     * ==========================================================
     * 8. LOAD OPPORTUNITY
     * ==========================================================
     */

    const {
      data: opportunity,
      error: opportunityError,
    } =
      await admin
        .from(
          "investment_opportunities",
        )
        .select(
          `
            id,
            title
          `,
        )
        .eq(
          "id",
          joint.opportunity_id,
        )
        .maybeSingle();


    if (
      opportunityError ||
      !opportunity
    ) {
      console.error(
        "Joint opportunity lookup error:",
        opportunityError,
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


    /*
     * ==========================================================
     * 9. GENERATE INVITATION TOKEN
     * ==========================================================
     *
     * rawToken exists only temporarily in server memory.
     *
     * PostgreSQL receives ONLY the SHA-256 digest.
     */

    const rawToken =
      randomBytes(32).toString(
        "base64url",
      );


    const tokenHash =
      createHash("sha256")
        .update(rawToken)
        .digest("hex");


    /*
     * Invitation validity = 24 hours.
     *
     * PostgreSQL independently enforces the maximum
     * invitation lifetime.
     */

    const expiresAt =
      new Date(
        Date.now() +
          24 * 60 * 60 * 1000,
      ).toISOString();


    /*
     * ==========================================================
     * 10. CREATE INVITATION THROUGH AUTHENTICATED RPC
     * ==========================================================
     *
     * IMPORTANT:
     *
     * Do NOT use admin.rpc() here.
     *
     * The authenticated Supabase client preserves auth.uid(),
     * allowing the database to verify that the caller is
     * actually the joint-investment initiator.
     */

    const {
      data: invitationData,
      error: invitationError,
    } =
      await supabase.rpc(
        "issue_joint_investment_invitation",
        {
          p_joint_subscription_id:
            id,

          p_token_hash:
            tokenHash,

          p_expires_at:
            expiresAt,
        },
      );


    if (invitationError) {
      console.error(
        "Joint invitation issuance RPC error:",
        invitationError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to issue the joint investment invitation.",
        },
        {
          status: 400,
        },
      );
    }


    const invitation =
      Array.isArray(
        invitationData,
      )
        ? invitationData[0]
        : invitationData;


    if (!invitation) {
      console.error(
        "Joint invitation RPC returned no result.",
      );

      return NextResponse.json(
        {
          error:
            "Joint investment invitation was not issued.",
        },
        {
          status: 500,
        },
      );
    }


    /*
     * ==========================================================
     * 11. BUILD SECURE INVITATION URL
     * ==========================================================
     *
     * The raw token appears only in this URL and therefore
     * only in the invitation email.
     *
     * It is NOT returned by this API.
     */

    const origin =
      getAppOrigin(
        request,
      );


    const invitationUrl =
      `${origin}/dashboard/investments/joint/invitations/${encodeURIComponent(
        rawToken,
      )}`;


    /*
     * ==========================================================
     * 12. BUILD INVITATION EMAIL
     * ==========================================================
     */

    const email =
      jointInvestmentInvitationEmail({
        inviteeName,

        inviterName,

        opportunityTitle:
          opportunity.title,

        totalCommitmentAmount:
          Number(
            joint.total_commitment_amount,
          ),

        individualCommitmentAmount:
          Number(
            memberTwo.obligation_amount,
          ),

        expiresAt:

          invitation.expires_at ??
          expiresAt,

        invitationUrl,
      });


    /*
     * ==========================================================
     * 13. DELIVER EMAIL
     * ==========================================================
     *
     * This follows the same application-mailer pattern already
     * used elsewhere in Tevuah Reserve.
     *
     * sendApplicationMail() catches SMTP failures internally and
     * returns:
     *
     * {
     *   sent: boolean,
     *   messageId?: string,
     *   error?: string
     * }
     */

    const delivery =
      await sendApplicationMail({
        to:
          inviteeEmail,

        ...email,
      });


    /*
     * IMPORTANT:
     *
     * The invitation has already been created in PostgreSQL.
     *
     * SMTP is external and cannot participate in the PostgreSQL
     * transaction. Therefore a failed delivery must NOT cause us
     * to pretend that the invitation does not exist.
     *
     * We will add explicit resend/revoke lifecycle handling
     * separately.
     */

    if (!delivery.sent) {
      console.error(
        "Joint investment invitation email was not delivered:",
        {
          invitationId:
            invitation.invitation_id,

          jointSubscriptionId:
            id,

          error:
            delivery.error,
        },
      );


      return NextResponse.json(
        {
          success: false,

          invitationCreated:
            true,

          emailSent:
            false,

          invitation: {
            invitationId:
              invitation.invitation_id,

            jointSubscriptionId:
              invitation.joint_subscription_id,

            memberId:
              invitation.member_id,

            inviteeInvestorId:
              invitation.invitee_investor_id,

            expiresAt:
              invitation.expires_at ??
              expiresAt,

            status:
              invitation.status ??
              "pending",
          },

          error:
            "The invitation was created, but the email could not be delivered.",
        },
        {
          status: 502,
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        },
      );
    }


    /*
     * ==========================================================
     * 14. SAFE SUCCESS RESPONSE
     * ==========================================================
     *
     * Deliberately excluded:
     *
     * - rawToken
     * - tokenHash
     * - SMTP credentials
     *
     * We also do not need to return the invitee email address.
     */

    return NextResponse.json(
      {
        success: true,

        invitation: {
          invitationId:
            invitation.invitation_id,

          jointSubscriptionId:
            invitation.joint_subscription_id,

          memberId:
            invitation.member_id,

          inviteeInvestorId:
            invitation.invitee_investor_id,

          expiresAt:
            invitation.expires_at ??
            expiresAt,

          status:
            invitation.status ??
            "pending",

          emailSent:
            true,
        },
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Joint investment invitation API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while issuing the joint investment invitation.",
      },
      {
        status: 500,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  }
}