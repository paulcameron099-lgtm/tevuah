import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

import {
  InvestmentsMarketplaceClient,
  type MarketplaceOpportunity,
} from "@/src/components/investments/investments-marketplace-client";

export const dynamic = "force-dynamic";

export default async function InvestmentsMarketplacePage() {
  const admin = createAdminClient();

  /*
   * --------------------------------------------------
   * 1. LOAD PUBLISHED OPPORTUNITIES
   * --------------------------------------------------
   */

  const {
    data: opportunities,
    error,
  } = await admin
    .from("investment_opportunities")
    .select(
      `
      id,
      slug,
      title,
      short_description,
      asset_category,
      location,

      funding_target,
      minimum_investment,
      total_funded,
      investor_count,

      expected_duration_months,

      target_return_min,
      target_return_max,
      target_return_note,

      cover_image_path,

      status,
      published_at,
      funding_closed_at,

      estate:investment_estates (
        id,
        name,
        country,
        region
      )
      `,
    )
    .eq("status", "published")
    .order("published_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Published opportunities load error:",
      error,
    );

    throw new Error(
      "Unable to load investment opportunities.",
    );
  }

  /*
   * --------------------------------------------------
   * 2. CREATE TEMPORARY COVER IMAGE URLS
   * --------------------------------------------------
   */

  const records: MarketplaceOpportunity[] =
    await Promise.all(
      (opportunities ?? []).map(
        async (opportunity) => {
          let coverImageUrl: string | null = null;

          if (opportunity.cover_image_path) {
            const {
              data,
              error: coverError,
            } = await admin.storage
              .from("investment-media")
              .createSignedUrl(
                opportunity.cover_image_path,
                60 * 30,
              );

            if (coverError) {
              console.error(
                `Marketplace cover URL error for ${opportunity.id}:`,
                coverError,
              );
            }

            coverImageUrl =
              data?.signedUrl ?? null;
          }

          return {
            id: opportunity.id,
            slug: opportunity.slug,
            title: opportunity.title,
            short_description:
              opportunity.short_description,
            asset_category:
              opportunity.asset_category,
            location: opportunity.location,

            funding_target: Number(
              opportunity.funding_target,
            ),
            minimum_investment: Number(
              opportunity.minimum_investment,
            ),
            total_funded: Number(
              opportunity.total_funded,
            ),

            expected_duration_months:
              opportunity.expected_duration_months,

            target_return_min:
              opportunity.target_return_min,
            target_return_max:
              opportunity.target_return_max,

            funding_closed_at:
              opportunity.funding_closed_at,

            coverImageUrl,
          };
        },
      ),
    );

  /*
   * --------------------------------------------------
   * 3. RENDER FILTERABLE MARKETPLACE
   * --------------------------------------------------
   */

  return (
    <InvestmentsMarketplaceClient
      opportunities={records}
    />
  );
}