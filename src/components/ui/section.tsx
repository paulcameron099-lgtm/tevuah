import type {
  ComponentPropsWithoutRef,
  ElementType,
} from "react";

import { cn } from "@/src/lib/utils";

type SectionProps<T extends ElementType = "section"> = {
  as?: T;
  spacing?: "none" | "sm" | "md" | "lg";
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

const spacingClasses = {
  none: "",
  sm: "py-14 sm:py-16 lg:py-20",
  md: "py-18 sm:py-22 lg:py-28",
  lg: "py-20 sm:py-28 lg:py-32 xl:py-36",
};

export function Section<T extends ElementType = "section">({
  as,
  spacing = "lg",
  className,
  ...props
}: SectionProps<T>) {
  const Component = as ?? "section";

  return (
    <Component
      className={cn(spacingClasses[spacing], className)}
      {...props}
    />
  );
}