import { cn } from "@/src/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  alignment?: "left" | "center";
  theme?: "light" | "dark";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  alignment = "left",
  theme = "light",
  className,
}: SectionHeadingProps) {
  const centered = alignment === "center";
  const dark = theme === "dark";

  return (
    <div
      className={cn(
        centered && "mx-auto text-center",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3",
          centered && "justify-center",
        )}
      >
        <span
          className={cn(
            "h-px w-8",
            dark ? "bg-gold-400" : "bg-gold-600",
          )}
        />

        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.22em]",
            dark ? "text-gold-400" : "text-gold-600",
          )}
        >
          {eyebrow}
        </p>
      </div>

      <h2
        className={cn(
          "font-display mt-6 max-w-4xl text-balance text-4xl leading-none font-medium tracking-[-0.035em] sm:text-5xl lg:text-6xl",
          centered && "mx-auto",
          dark ? "text-white" : "text-forest-950",
        )}
      >
        {title}
      </h2>

      {description ? (
        <p
          className={cn(
            "mt-6 max-w-2xl text-pretty text-base leading-8",
            centered && "mx-auto",
            dark ? "text-white/60" : "text-stone-700",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}