import type { FineWineFeature } from "@/src/data/fine-wine-features";

type WineFeatureCardProps = {
  feature: FineWineFeature;
};

export function WineFeatureCard({
  feature,
}: WineFeatureCardProps) {
  const Icon = feature.icon;

  return (
    <article className="border-t border-white/15 pt-6">
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-gold-400/25 bg-gold-400/10 text-gold-400">
          <Icon className="size-4.5" />
        </span>

        <div>
          <h3 className="font-display text-2xl font-medium tracking-tight text-white">
            {feature.title}
          </h3>

          <p className="mt-3 text-sm leading-7 text-white/60">
            {feature.description}
          </p>
        </div>
      </div>
    </article>
  );
}