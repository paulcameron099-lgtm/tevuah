"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

import { premiumEase } from "@/src/components/motion/premium-motion";

type MotionProps = {
  children?: ReactNode;
  className?: string;
};

type MotionDelayProps = MotionProps & {
  delay?: number;
};

type MotionStaggerProps = MotionProps & {
  delay?: number;
  stagger?: number;
  amount?: number;
};

export function AboutHeroImage({
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
              scale: 1.07,
              opacity: 0.9,
            }
      }
      animate={{
        scale: 1,
        opacity: 1,
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

export function AboutHeroOverlay({
  children,
  className,
  delay = 0,
}: MotionDelayProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 1.15,
        delay: reduceMotion ? 0 : delay,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function AboutHeroReveal({
  children,
  className,
  delay = 0,
}: MotionDelayProps) {
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
        duration: 0.85,
        delay: reduceMotion ? 0 : delay,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function AboutHeroLine({
  className,
}: {
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      className={className}
      initial={reduceMotion ? false : { scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{
        duration: 0.85,
        delay: reduceMotion ? 0 : 0.18,
        ease: premiumEase,
      }}
    />
  );
}

export function AboutReveal({
  children,
  className,
  delay = 0,
}: MotionDelayProps) {
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
        amount: 0.15,
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

export function AboutRevealSoft({
  children,
  className,
  delay = 0,
}: MotionDelayProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 16,
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.72,
        delay: reduceMotion ? 0 : delay,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function AboutImageReveal({
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
              y: 28,
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
        duration: 1,
        ease: premiumEase,
      }}
    >
      <motion.div
        className="absolute inset-0"
        initial={reduceMotion ? false : { scale: 1.065 }}
        whileInView={{ scale: 1 }}
        viewport={{
          once: true,
          amount: 0.12,
        }}
        transition={{
          duration: 1.55,
          ease: premiumEase,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function AboutStagger({
  children,
  className,
  delay = 0.04,
  stagger = 0.09,
  amount = 0.1,
}: MotionStaggerProps) {
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
            staggerChildren: reduceMotion ? 0 : stagger,
            delayChildren: reduceMotion ? 0 : delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function AboutStaggerItem({
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
          scale: 0.99,
        },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.72,
            ease: premiumEase,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function AboutListItem({
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