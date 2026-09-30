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

type StaggerProps = MotionProps & {
  delay?: number;
  stagger?: number;
  amount?: number;
};

export function AgTechHeroImage({
  children,
  className,
}: MotionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0.9, scale: 1.07 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 1.8,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function AgTechHeroOverlay({
  className,
  delay = 0,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className={className}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 1.1,
        delay: reduceMotion ? 0 : delay,
        ease: premiumEase,
      }}
    />
  );
}

export function AgTechHeroLine({
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
        delay: reduceMotion ? 0 : 0.14,
        ease: premiumEase,
      }}
    />
  );
}

export function AgTechHeroReveal({
  children,
  className,
  delay = 0,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
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

export function AgTechReveal({
  children,
  className,
  delay = 0,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
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

export function AgTechRevealSoft({
  children,
  className,
  delay = 0,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{
        once: true,
        amount: 0.16,
      }}
      transition={{
        duration: 0.65,
        delay: reduceMotion ? 0 : delay,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function AgTechImageReveal({
  children,
  className,
}: MotionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{
        once: true,
        amount: 0.1,
      }}
      transition={{
        duration: 0.9,
        ease: premiumEase,
      }}
    >
      <motion.div
        className="absolute inset-0"
        initial={reduceMotion ? false : { scale: 1.05 }}
        whileInView={{ scale: 1 }}
        viewport={{
          once: true,
          amount: 0.1,
        }}
        transition={{
          duration: 1.4,
          ease: premiumEase,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function AgTechStagger({
  children,
  className,
  delay = 0.04,
  stagger = 0.08,
  amount = 0.08,
}: StaggerProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{
        once: true,
        amount,
      }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: reduceMotion ? 0 : delay,
            staggerChildren: reduceMotion ? 0 : stagger,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function AgTechStaggerItem({
  children,
  className,
}: MotionProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: {
          opacity: 0,
          y: 22,
        },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.68,
            ease: premiumEase,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function AgTechListItem({
  children,
  className,
}: MotionProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: {
          opacity: 0,
          x: -12,
        },
        visible: {
          opacity: 1,
          x: 0,
          transition: {
            duration: 0.56,
            ease: premiumEase,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function AgTechConsole({
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
              y: 30,
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
        duration: 0.95,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function AgTechProgress({
  progress,
}: {
  progress: number;
}) {
  const reduceMotion = useReducedMotion();

  const normalized = Math.max(
    0,
    Math.min(100, progress),
  );

  return (
    <motion.div
      className="h-full origin-left rounded-full bg-gold-500"
      initial={
        reduceMotion
          ? { scaleX: normalized / 100 }
          : { scaleX: 0 }
      }
      whileInView={{
        scaleX: normalized / 100,
      }}
      viewport={{
        once: true,
        amount: 0.8,
      }}
      transition={{
        duration: reduceMotion ? 0 : 0.9,
        ease: premiumEase,
      }}
    />
  );
}