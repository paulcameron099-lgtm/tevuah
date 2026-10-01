"use client";

import type { ReactNode } from "react";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";

import {
  premiumEase,
} from "@/src/components/motion/premium-motion";

type MotionProps = {
  children?: ReactNode;
  className?: string;
};

type HeaderDropdownProps = MotionProps & {
  open: boolean;
};

type MobileMotionProps = MotionProps & {
  open: boolean;
};

type MobileNavigationItemProps = MotionProps & {
  open: boolean;
  index: number;
};

export function HeaderEntrance({
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
              y: -10,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.65,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function HeaderDropdown({
  open,
  children,
  className,
}: HeaderDropdownProps) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={className}
          initial={
            reduceMotion
              ? { opacity: 1 }
              : {
                  opacity: 0,
                  y: 10,
                  scale: 0.985,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={
            reduceMotion
              ? { opacity: 0 }
              : {
                  opacity: 0,
                  y: 7,
                  scale: 0.99,
                }
          }
          transition={{
            duration: reduceMotion
              ? 0.01
              : 0.24,
            ease: premiumEase,
          }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function MobileBackdrop({
  open,
  children,
  className,
}: MobileMotionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={false}
      animate={{
        opacity: open ? 1 : 0,
      }}
      transition={{
        duration: reduceMotion
          ? 0.01
          : 0.3,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function MobileDrawer({
  open,
  children,
  className,
}: MobileMotionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={false}
      animate={{
        x: open ? "0%" : "100%",
      }}
      transition={
        reduceMotion
          ? {
              duration: 0.01,
            }
          : {
              duration: 0.48,
              ease: premiumEase,
            }
      }
    >
      {children}
    </motion.div>
  );
}

export function MobileNavigationItem({
  open,
  index,
  children,
  className,
}: MobileNavigationItemProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.li
      className={className}
      initial={false}
      animate={
        open
          ? {
              opacity: 1,
              x: 0,
            }
          : {
              opacity: 0,
              x: 14,
            }
      }
      transition={{
        duration: reduceMotion
          ? 0.01
          : 0.4,
        delay:
          open && !reduceMotion
            ? 0.12 + index * 0.035
            : 0,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.li>
  );
}