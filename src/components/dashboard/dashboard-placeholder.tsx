type DashboardPlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function DashboardPlaceholder({
  eyebrow,
  title,
  description,
}: DashboardPlaceholderProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
        {eyebrow}
      </p>

      <h1 className="font-display mt-4 text-4xl font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
        {title}
      </h1>

      <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-600">
        {description}
      </p>

      <div className="mt-10 min-h-90 rounded-[1.75rem] border border-dashed border-forest-900/15 bg-white/50" />
    </div>
  );
}