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

export function EstatesHeroImage({
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

export function EstatesHeroOverlay({
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

export function EstatesHeroLine({
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

export function EstatesHeroReveal({
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

export function EstatesReveal({
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
        amount: 0.14,
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

export function EstatesRevealSoft({
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
        duration: 0.65,
        delay,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function EstatesImageReveal({
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
        duration: 0.88,
        delay,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function EstatesStagger({
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

export function EstatesStaggerItem({
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

export function EstatesListItem({
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

export function EstateSlugHeroImage({
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
              scale: 1.06,
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

export function EstateSlugHeroReveal({
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
              y: 22,
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