import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "@/src/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type SharedButtonProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type LinkButtonProps = SharedButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  };

type NativeButtonProps = SharedButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonProps = LinkButtonProps | NativeButtonProps;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-gold-500 bg-gold-500 text-forest-950 hover:border-gold-400 hover:bg-gold-400",
  secondary:
    "border border-forest-900 bg-forest-900 text-white hover:border-forest-800 hover:bg-forest-800 hover:text-white",
  outline:
    "border border-current bg-transparent text-current hover:bg-white/10",
  ghost:
    "border border-transparent bg-transparent text-current hover:bg-black/5",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-12 px-5 text-sm",
  lg: "min-h-14 px-7 text-[0.92rem]",
};

export function Button(props: ButtonProps) {
  const {
    children,
    className,
    variant = "primary",
    size = "md",
  } = props;

  const classes = cn(
    "focus-ring inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.01em] transition-colors duration-300 disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

  if (typeof props.href === "string") {
    const {
      href,
      children: linkChildren,
      className: _className,
      variant: _variant,
      size: _size,
      ...linkProps
    } = props;

    return (
      <Link href={href} className={classes} {...linkProps}>
        {linkChildren}
      </Link>
    );
  }

  const {
    children: buttonChildren,
    className: _className,
    variant: _variant,
    size: _size,
    href: _href,
    type = "button",
    ...buttonProps
  } = props;

  return (
    <button type={type} className={classes} {...buttonProps}>
      {buttonChildren}
    </button>
  );
}