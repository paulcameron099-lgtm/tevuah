"use client";

import type { ReactNode } from "react";

import {
  motion,
  useReducedMotion,
} from "motion/react";

import {
  premiumEase,
} from "@/src/components/motion/premium-motion";

type MotionContentProps = {
  children?: ReactNode;
  className?: string;
  delay?: number;
};

export function OpportunityDetailHeroImage({
  children,
  className,
}: MotionContentProps) {
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

export function OpportunityDetailHeroOverlay({
  className,
  delay = 0,
}: MotionContentProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className={className}
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
            }
      }
      animate={
        reduceMotion
          ? undefined
          : {
              opacity: 1,
            }
      }
      transition={{
        duration: 1,
        delay,
        ease: premiumEase,
      }}
    />
  );
}

export function OpportunityDetailHeroReveal({
  children,
  className,
  delay = 0,
}: MotionContentProps) {
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

export function OpportunityDetailReveal({
  children,
  className,
  delay = 0,
}: MotionContentProps) {
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
        amount: 0.12,
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

export function OpportunityDetailRevealSoft({
  children,
  className,
  delay = 0,
}: MotionContentProps) {
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
        amount: 0.15,
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

export function OpportunityDetailImageReveal({
  children,
  className,
  delay = 0,
}: MotionContentProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              scale: 1.025,
              y: 16,
            }
      }
      whileInView={
        reduceMotion
          ? undefined
          : {
              opacity: 1,
              scale: 1,
              y: 0,
            }
      }
      viewport={{
        once: true,
        amount: 0.12,
      }}
      transition={{
        duration: 0.85,
        delay,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function OpportunityDetailStagger({
  children,
  className,
}: MotionContentProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : "hidden"}
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
            staggerChildren: 0.075,
            delayChildren: 0.03,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function OpportunityDetailStaggerItem({
  children,
  className,
}: MotionContentProps) {
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

export function OpportunityDetailListItem({
  children,
  className,
}: MotionContentProps) {
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
                x: -10,
              },

              visible: {
                opacity: 1,
                x: 0,

                transition: {
                  duration: 0.5,
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