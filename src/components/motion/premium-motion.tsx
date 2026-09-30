"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from "react";

const premiumEase = [0.22, 1, 0.36, 1] as const;

const revealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.85,
      ease: premiumEase,
    },
  },
};

const softRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: premiumEase,
    },
  },
};

const fadeVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: premiumEase,
    },
  },
};

const scaleRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.975,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: premiumEase,
    },
  },
};

const staggerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

type MotionRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
  once?: boolean;
  variant?: "default" | "soft" | "fade" | "scale";
};

export function MotionReveal({
  children,
  className,
  delay = 0,
  amount = 0.18,
  once = true,
  variant = "default",
}: MotionRevealProps) {
  const reduceMotion = useReducedMotion();

  const variants =
    variant === "soft"
      ? softRevealVariants
      : variant === "fade"
        ? fadeVariants
        : variant === "scale"
          ? scaleRevealVariants
          : revealVariants;

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once,
        amount,
      }}
      transition={{
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

type MotionStaggerProps = {
  children: ReactNode;
  className?: string;
  amount?: number;
  once?: boolean;
  stagger?: number;
  delayChildren?: number;
};

export function MotionStagger({
  children,
  className,
  amount = 0.15,
  once = true,
  stagger = 0.1,
  delayChildren = 0.05,
}: MotionStaggerProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren,
          },
        },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once,
        amount,
      }}
    >
      {children}
    </motion.div>
  );
}

type MotionItemProps = {
  children: ReactNode;
  className?: string;
  variant?: "default" | "soft" | "fade" | "scale";
};

export function MotionItem({
  children,
  className,
  variant = "default",
}: MotionItemProps) {
  const reduceMotion = useReducedMotion();

  const variants =
    variant === "soft"
      ? softRevealVariants
      : variant === "fade"
        ? fadeVariants
        : variant === "scale"
          ? scaleRevealVariants
          : revealVariants;

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}

type MotionImageProps = {
  children: ReactNode;
  className?: string;
  amount?: number;
};

export function MotionImage({
  children,
  className,
  amount = 0.2,
}: MotionImageProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        scale: 1.045,
      }}
      whileInView={{
        opacity: 1,
        scale: 1,
      }}
      viewport={{
        once: true,
        amount,
      }}
      transition={{
        duration: 1.25,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

type MotionLineProps = {
  className?: string;
};

export function MotionLine({ className }: MotionLineProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <span className={className} />;
  }

  return (
    <motion.span
      className={className}
      initial={{
        scaleX: 0,
        transformOrigin: "left center",
      }}
      whileInView={{
        scaleX: 1,
      }}
      viewport={{
        once: true,
        amount: 0.8,
      }}
      transition={{
        duration: 0.75,
        ease: premiumEase,
      }}
    />
  );
}

type MotionFloatProps = {
  children: ReactNode;
  className?: string;
  distance?: number;
  duration?: number;
};

export function MotionFloat({
  children,
  className,
  distance = 5,
  duration = 3.8,
}: MotionFloatProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={{
        y: [0, distance, 0],
      }}
      transition={{
        duration,
        ease: "easeInOut",
        repeat: Infinity,
      }}
    >
      {children}
    </motion.div>
  );
}

type MotionGlowProps = {
  className?: string;
};

export function MotionGlow({ className }: MotionGlowProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div aria-hidden="true" className={className} />;
  }

  return (
    <motion.div
      aria-hidden="true"
      className={className}
      animate={{
        scale: [1, 1.08, 1],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

type MotionElementProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function MotionClipReveal<T extends ElementType = "div">({
  as,
  children,
  className,
}: MotionElementProps<T>) {
  const reduceMotion = useReducedMotion();
  const Component = as ?? "div";

  if (reduceMotion) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        y: "105%",
      }}
      whileInView={{
        opacity: 1,
        y: "0%",
      }}
      viewport={{
        once: true,
        amount: 0.5,
      }}
      transition={{
        duration: 0.9,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export { premiumEase, staggerVariants };