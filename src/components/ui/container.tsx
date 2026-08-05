import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cn } from "@/src/lib/utils";

type ContainerProps<T extends ElementType = "div"> = {
  as?: T;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

export function Container<T extends ElementType = "div">({
  as,
  className,
  ...props
}: ContainerProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={cn(
        "mx-auto w-full max-w-360 px-5 sm:px-7 lg:px-10 xl:px-14",
        className,
      )}
      {...props}
    />
  );
}