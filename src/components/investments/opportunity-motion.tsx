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

type ProgressProps = {
  progress: number;
  className?: string;
};

export function OpportunityHeroImage({
  children,
  className,
}: MotionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0.88,
              scale: 1.06,
            }
      }
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 1.7,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function OpportunityHeroOverlay({
  className,
}: {
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className={className}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 1.1,
        ease: premiumEase,
      }}
    />
  );
}

export function OpportunityHeroReveal({
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
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.78,
        delay: reduceMotion ? 0 : delay,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function OpportunityReveal({
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
              y: 24,
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.12,
      }}
      transition={{
        duration: 0.78,
        delay: reduceMotion ? 0 : delay,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function OpportunitySummaryReveal({
  children,
  className,
}: MotionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 24,
              scale: 0.985,
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      viewport={{
        once: true,
        amount: 0.08,
      }}
      transition={{
        duration: 0.85,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function OpportunityStagger({
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
        amount: 0.12,
      }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduceMotion ? 0 : 0.07,
            delayChildren: reduceMotion ? 0 : 0.05,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function OpportunityStaggerItem({
  children,
  className,
}: MotionProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: {
          opacity: 0,
          y: 14,
        },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.58,
            ease: premiumEase,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function OpportunityProgress({
  progress,
  className,
}: ProgressProps) {
  const reduceMotion = useReducedMotion();

  const normalizedProgress = Math.max(
    0,
    Math.min(100, progress),
  );

  return (
    <div
      className={`overflow-hidden rounded-full bg-white/10 ${
        className ?? ""
      }`}
    >
      <motion.div
        className="h-full origin-left rounded-full bg-gold-400"
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
          duration: reduceMotion ? 0 : 1.05,
          delay: reduceMotion ? 0 : 0.16,
          ease: premiumEase,
        }}
        style={{
          width: "100%",
        }}
      />
    </div>
  );
}