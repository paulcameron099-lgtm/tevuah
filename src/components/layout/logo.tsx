import Link from "next/link";

import { siteConfig } from "@/src/config/site";
import { cn } from "@/src/lib/utils";

type LogoProps = {
  variant?: "light" | "dark";
  className?: string;
};

export function Logo({
  variant = "dark",
  className,
}: LogoProps) {
  const isLight = variant === "light";

  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} home`}
      className={cn(
        "focus-ring inline-flex items-center gap-3 rounded-md",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative flex size-10 shrink-0 items-center justify-center rounded-full border",
          isLight
            ? "border-white/25 bg-white/10"
            : "border-forest-900/15 bg-forest-900",
        )}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          className="size-7"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 31V11"
            stroke="#C2A266"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          <path
            d="M20 17C15.2 17 11.8 14.6 10.2 10.2C15 10.1 18.4 12.4 20 17Z"
            fill={isLight ? "#F7F3EA" : "#D4B97E"}
          />

          <path
            d="M20 23C24.8 23 28.2 20.6 29.8 16.2C25 16.1 21.6 18.4 20 23Z"
            fill="#C2A266"
          />

          <circle cx="20" cy="8" r="2.4" fill="#C2A266" />
        </svg>
      </span>

      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[1.35rem] font-semibold tracking-tight",
            isLight ? "text-white" : "text-forest-950",
          )}
        >
          {siteConfig.shortName}
        </span>

        {/* <span
          className={cn(
            "mt-1 text-[0.55rem] font-semibold uppercase tracking-[0.3em]",
            isLight ? "text-white/60" : "text-stone-500",
          )}
        >
          Reserve
        </span> */}
      </span>
    </Link>
  );
}