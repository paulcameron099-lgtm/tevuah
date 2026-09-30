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

export function HowHeroImage({
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
              opacity: 0.9,
              scale: 1.07,
            }
      }
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 1.8,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function HowHeroOverlay({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
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
        delay: reduceMotion ? 0 : delay,
        ease: premiumEase,
      }}
    />
  );
}

export function HowHeroLine({
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
        delay: reduceMotion ? 0 : 0.15,
        ease: premiumEase,
      }}
    />
  );
}

export function HowHeroReveal({
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

export function HowReveal({
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
              y: 25,
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.14,
      }}
      transition={{
        duration: 0.8,
        delay: reduceMotion ? 0 : delay,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function HowRevealSoft({
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
              y: 15,
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.18,
      }}
      transition={{
        duration: 0.68,
        delay: reduceMotion ? 0 : delay,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function HowImageReveal({
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
              y: 26,
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.1,
      }}
      transition={{
        duration: 0.95,
        ease: premiumEase,
      }}
    >
      <motion.div
        className="absolute inset-0"
        initial={reduceMotion ? false : { scale: 1.055 }}
        whileInView={{ scale: 1 }}
        viewport={{
          once: true,
          amount: 0.1,
        }}
        transition={{
          duration: 1.45,
          ease: premiumEase,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function HowStagger({
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

export function HowStaggerItem({
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
            duration: 0.7,
            ease: premiumEase,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function HowListItem({
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