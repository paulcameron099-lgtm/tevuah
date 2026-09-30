"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

import { premiumEase } from "@/src/components/motion/premium-motion";

type MotionProps = {
  children?: ReactNode;
  className?: string;
};

type RevealProps = MotionProps & {
  delay?: number;
};

type MarketplaceProgressProps = {
  progress: number;
  className?: string;
};

export function MarketplaceHeroReveal({
  children,
  className,
  delay = 0,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 28,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.82,
        delay: reduceMotion ? 0 : delay,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function MarketplaceHeroLine({
  className,
}: {
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      aria-hidden="true"
      className={className}
      initial={reduceMotion ? false : { scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{
        duration: 0.85,
        delay: reduceMotion ? 0 : 0.12,
        ease: premiumEase,
      }}
    />
  );
}

export function MarketplaceReveal({
  children,
  className,
  delay = 0,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 22,
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: 0.75,
        delay: reduceMotion ? 0 : delay,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function MarketplaceGrid({
  children,
  className,
}: MotionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.06,
      }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduceMotion ? 0 : 0.1,
            delayChildren: reduceMotion ? 0 : 0.05,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function MarketplaceCard({
  children,
  className,
}: MotionProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: {
          opacity: 0,
          y: 28,
          scale: 0.985,
        },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.78,
            ease: premiumEase,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function MarketplaceImage({
  children,
  className,
}: MotionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { scale: 1.045 }}
      whileInView={{ scale: 1 }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 1.15,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function MarketplaceProgress({
  progress,
  className,
}: MarketplaceProgressProps) {
  const reduceMotion = useReducedMotion();

  const normalizedProgress = Math.max(
    0,
    Math.min(100, progress),
  );

  return (
    <div
      className={`overflow-hidden rounded-full bg-stone-100 ${
        className ?? ""
      }`}
    >
      <motion.div
        className="h-full origin-left rounded-full bg-forest-950"
        initial={
          reduceMotion
            ? false
            : {
                scaleX: 0,
              }
        }
        whileInView={{
          scaleX: normalizedProgress / 100,
        }}
        viewport={{
          once: true,
          amount: 0.8,
        }}
        transition={{
          duration: reduceMotion ? 0 : 1,
          delay: reduceMotion ? 0 : 0.12,
          ease: premiumEase,
        }}
        style={{
          width: "100%",
        }}
      />
    </div>
  );
}