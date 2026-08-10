import type { WineRegion } from "@/src/data/fine-wine-platform";

type WineRegionAllocationProps = {
  regions: WineRegion[];
};

export function WineRegionAllocation({
  regions,
}: WineRegionAllocationProps) {
  return (
    <div className="space-y-6">
      {regions.map((region) => (
        <article key={region.id}>
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="font-display text-2xl font-semibold text-burgundy-900">
                {region.name}
              </p>

              <p className="mt-1 text-xs text-stone-500">
                {region.country}
              </p>
            </div>

            <p className="font-display text-2xl font-semibold text-burgundy-900">
              {region.allocation}%
            </p>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-burgundy-900/10">
            <div
              className="h-full rounded-full bg-gold-500"
              style={{
                width: `${region.allocation}%`,
              }}
            />
          </div>

          <p className="mt-3 text-xs leading-6 text-stone-600">
            {region.description}
          </p>
        </article>
      ))}
    </div>
  );
}