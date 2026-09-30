"use client";

import type {
  ComponentProps,
  ReactNode,
} from "react";

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

type MotionDivProps =
  ComponentProps<typeof motion.div>;

export function InsightsHeroImage({
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
        duration: 1.4,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function InsightsHeroOverlay({
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

export function InsightsHeroLine({
  className,
}: MotionContentProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      aria-hidden="true"
      className={className}
      initial={
        reduceMotion
          ? false
          : {
              scaleX: 0,
            }
      }
      animate={
        reduceMotion
          ? undefined
          : {
              scaleX: 1,
            }
      }
      transition={{
        duration: 0.72,
        delay: 0.08,
        ease: premiumEase,
      }}
    />
  );
}

export function InsightsHeroReveal({
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

export function InsightsReveal({
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
              y: 26,
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
        duration: 0.72,
        delay,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function InsightsRevealSoft({
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
              y: 15,
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
        amount: 0.18,
      }}
      transition={{
        duration: 0.66,
        delay,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function InsightsImageReveal({
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
              scale: 1.035,
              y: 18,
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
        duration: 0.9,
        delay,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function InsightsStagger({
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

export function InsightsStaggerItem({
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
                y: 20,
              },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.62,
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

export function InsightsListItem({
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
                  duration: 0.52,
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

export function InsightsArticleHero({
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
              y: 20,
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
        duration: 0.76,
        delay,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function InsightsArticleImage({
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
              scale: 1.025,
              y: 20,
            }
      }
      animate={
        reduceMotion
          ? undefined
          : {
              opacity: 1,
              scale: 1,
              y: 0,
            }
      }
      transition={{
        duration: 0.95,
        delay: 0.25,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function InsightsArticleSection({
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
              y: 20,
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
        amount: 0.1,
      }}
      transition={{
        duration: 0.68,
        delay,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function InsightsTakeawayCard({
  children,
  className,
}: MotionDivProps) {
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
              scale: 0.99,
            }
      }
      whileInView={
        reduceMotion
          ? undefined
          : {
              opacity: 1,
              y: 0,
              scale: 1,
            }
      }
      viewport={{
        once: true,
        amount: 0.18,
      }}
      transition={{
        duration: 0.75,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}