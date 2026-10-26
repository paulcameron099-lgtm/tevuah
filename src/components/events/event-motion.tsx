
"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";

import type { ReactNode } from "react";

type MotionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

const premiumEase = [0.22, 1, 0.36, 1] as const;

export function EventReveal({
  children,
  className,
  delay = 0,
}: MotionProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        reduced ? false : { opacity: 0, y: 28 }
      }
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.8,
        delay,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function EventHeroReveal({
  children,
  className,
  delay = 0,
}: MotionProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        reduced ? false : { opacity: 0, y: 34 }
      }
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.95,
        delay,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function EventStagger({
  children,
  className,
  delay = 0,
}: MotionProps) {
  const reduced = useReducedMotion();

  const variants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduced ? 0 : 0.11,
        delayChildren: reduced ? 0 : delay,
      },
    },
  };

  return (
    <motion.div
      className={className}
      initial={reduced ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

export function EventStaggerItem({
  children,
  className,
}: Omit<MotionProps, "delay">) {
  const reduced = useReducedMotion();

  const variants: Variants = {
    hidden: reduced
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: premiumEase,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
