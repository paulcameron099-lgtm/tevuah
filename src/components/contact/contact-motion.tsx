"use client";

import type { ReactNode } from "react";

import {
  motion,
  useReducedMotion,
} from "motion/react";

import {
  premiumEase,
} from "@/src/components/motion/premium-motion";

type MotionProps = {
  children?: ReactNode;
  className?: string;
  delay?: number;
};

export function ContactHeroImage({
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
              scale: 1.07,
            }
      }
      animate={
        reduceMotion
          ? undefined
          : {
              opacity: 1,
              scale: 1,
            }
      }
      transition={{
        duration: 1.45,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function ContactHeroOverlay({
  className,
  delay = 0,
}: MotionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className={className}
      initial={
        reduceMotion
          ? false
          : { opacity: 0 }
      }
      animate={
        reduceMotion
          ? undefined
          : { opacity: 1 }
      }
      transition={{
        duration: 1,
        delay,
        ease: premiumEase,
      }}
    />
  );
}

export function ContactHeroLine({
  className,
}: MotionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      aria-hidden="true"
      className={className}
      initial={
        reduceMotion
          ? false
          : { scaleX: 0 }
      }
      animate={
        reduceMotion
          ? undefined
          : { scaleX: 1 }
      }
      transition={{
        duration: 0.72,
        delay: 0.08,
        ease: premiumEase,
      }}
    />
  );
}

export function ContactHeroReveal({
  children,
  className,
  delay = 0,
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
            }
      }
      animate={
        reduceMotion
          ? undefined
          : {
              opacity: 1,
              y: 0,
            }
      }
      transition={{
        duration: 0.78,
        delay,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function ContactReveal({
  children,
  className,
  delay = 0,
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
              y: 25,
            }
      }
      whileInView={
        reduceMotion
          ? undefined
          : {
              opacity: 1,
              y: 0,
            }
      }
      viewport={{
        once: true,
        amount: 0.13,
      }}
      transition={{
        duration: 0.7,
        delay,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function ContactRevealSoft({
  children,
  className,
  delay = 0,
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
              y: 14,
            }
      }
      whileInView={
        reduceMotion
          ? undefined
          : {
              opacity: 1,
              y: 0,
            }
      }
      viewport={{
        once: true,
        amount: 0.16,
      }}
      transition={{
        duration: 0.62,
        delay,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function ContactStagger({
  children,
  className,
}: MotionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        reduceMotion ? false : "hidden"
      }
      whileInView={
        reduceMotion ? undefined : "visible"
      }
      viewport={{
        once: true,
        amount: 0.08,
      }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.08,
            delayChildren: 0.03,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function ContactStaggerItem({
  children,
  className,
}: MotionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={
        reduceMotion
          ? undefined
          : {
              hidden: {
                opacity: 0,
                y: 18,
              },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.6,
                  ease: premiumEase,
                },
              },
            }
      }
    >
      {children}
    </motion.div>
  );
}