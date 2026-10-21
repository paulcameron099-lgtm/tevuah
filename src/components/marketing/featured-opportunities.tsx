import { createAdminClient } from "@/src/lib/supabase/admin";

import {
  FeaturedOpportunitiesClient,
  type FeaturedOpportunity,
} from "../marketing/featured-opportunities-client";

type FeaturedCategory =
  | "fine_wine"
  | "agtech"
  | "vineyard"
  | "olive";

const CATEGORY_ORDER: FeaturedCategory[] = [
  "fine_wine",
  "agtech",
  "vineyard",
  "olive",
];

function resolveCategory(
  value: string | null,
): FeaturedCategory | null {
  const category = (value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");

  if (
    [
      "fine_wine",
      "fine_wines",
      "wine",
      "wine_investment",
    ].includes(category)
  ) {
    return "fine_wine";
  }

  if (
    [
      "agtech",
      "ag_tech",
      "agricultural_technology",
      "agricultural_infrastructure",
    ].includes(category)
  ) {
    return "agtech";
  }

  if (
    [
      "vineyard",
      "vineyards",
      "vineyard_estate",
      "vineyard_estates",
    ].includes(category)
  ) {
    return "vineyard";
  }

  if (
    [
      "olive",
      "olives",
      "olive_estate",
      "olive_estates",
      "olive_agriculture",
    ].includes(category)
  ) {
    return "olive";
  }

  return null;
}

export async function FeaturedOpportunities() {
  const admin = createAdminClient();

  const { data, error } = await admin
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
      expected_duration_months,
      target_return_min,
      target_return_max,
      cover_image_path,
      status,
      published_at,
      funding_closed_at
      `,
    )
    .eq("status", "published")
    .is("funding_closed_at", null)
    .order("published_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Homepage featured opportunities load error:",
      error,
    );

    return (
      <FeaturedOpportunitiesClient
        opportunities={[]}
        loadError
      />
    );
  }

  const eligible = (data ?? []).filter((opportunity) => {
    const target = Number(opportunity.funding_target);
    const funded = Number(opportunity.total_funded);

    return (
      Number.isFinite(target) &&
      target > 0 &&
      Number.isFinite(funded) &&
      funded >= 0 &&
      funded < target
    );
  });

  const selected = CATEGORY_ORDER.flatMap((category) => {
    const match = eligible.find(
      (opportunity) =>
        resolveCategory(opportunity.asset_category) ===
        category,
    );

    return match ? [match] : [];
  });

  const opportunities: FeaturedOpportunity[] =
    await Promise.all(
      selected.map(async (opportunity) => {
        let coverImageUrl: string | null = null;

        if (opportunity.cover_image_path) {
          const { data: imageData, error: imageError } =
            await admin.storage
              .from("investment-media")
              .createSignedUrl(
                opportunity.cover_image_path,
                60 * 30,
              );

          if (imageError) {
            console.error(
              `Featured cover image error for ${opportunity.id}:`,
              imageError,
            );
          }

          coverImageUrl = imageData?.signedUrl ?? null;
        }

        return {
          id: opportunity.id,
          slug: opportunity.slug,
          title: opportunity.title,
          short_description:
            opportunity.short_description,
          asset_category: opportunity.asset_category,
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
          coverImageUrl,
        };
      }),
    );

  return (
    <FeaturedOpportunitiesClient
      opportunities={opportunities}
    />
  );
}