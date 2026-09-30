"use client";

import type { ReactNode } from "react";

import {
  motion,
  useReducedMotion,
} from "motion/react";

import {
  premiumEase,
} from "@/src/components/motion/premium-motion";

type FooterMotionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function FooterReveal({
  children,
  className,
  delay = 0,
}: FooterMotionProps) {
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
        amount: 0.12,
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

export function FooterRevealSoft({
  children,
  className,
  delay = 0,
}: FooterMotionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 12,
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
        duration: 0.58,
        delay,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function FooterStagger({
  children,
  className,
}: FooterMotionProps) {
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
            staggerChildren: 0.07,
            delayChildren: 0.04,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function FooterStaggerItem({
  children,
  className,
}: FooterMotionProps) {
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
                y: 14,
              },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.55,
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

export function FooterLinkItem({
  children,
  className,
}: FooterMotionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.li
      className={className}
      variants={
        reduceMotion
          ? undefined
          : {
              hidden: {
                opacity: 0,
                x: -7,
              },
              visible: {
                opacity: 1,
                x: 0,
                transition: {
                  duration: 0.45,
                  ease: premiumEase,
                },
              },
            }
      }
    >
      {children}
    </motion.li>
  );
}