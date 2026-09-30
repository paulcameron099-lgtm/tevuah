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

type SectionProps =
  ComponentProps<typeof motion.section>;

type DivProps =
  ComponentProps<typeof motion.div>;

type MotionContentProps = {
  children?: ReactNode;
  className?: string;
  delay?: number;
};

export function FineWineHeroSection({
  children,
  ...props
}: SectionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      {...props}
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
        duration: 0.8,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.section>
  );
}

export function FineWineHeroImage({
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

export function FineWineHeroOverlay({
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

export function FineWineHeroReveal({
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

export function FineWineHeroLine({
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
        duration: 0.75,
        delay: 0.08,
        ease: premiumEase,
      }}
    />
  );
}

export function FineWineSection({
  children,
  ...props
}: SectionProps) {
  return (
    <motion.section
      {...props}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.08,
      }}
    >
      {children}
    </motion.section>
  );
}

export function FineWineReveal({
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
        amount: 0.18,
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

export function FineWineRevealSoft({
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
              y: 16,
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
        amount: 0.2,
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

export function FineWineImageReveal({
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
        amount: 0.16,
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

export function FineWinePortfolioReveal({
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
              y: 30,
              scale: 0.985,
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
        amount: 0.12,
      }}
      transition={{
        duration: 0.9,
        ease: premiumEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function FineWineStagger({
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
        amount: 0.1,
      }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.09,
            delayChildren: 0.04,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function FineWineStaggerItem({
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
                y: 22,
              },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.66,
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

export function FineWineListItem({
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
                x: -12,
              },
              visible: {
                opacity: 1,
                x: 0,
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

export function FineWineProgress({
  progress,
}: {
  progress: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="h-full origin-left rounded-full bg-burgundy-900"
      initial={
        reduceMotion
          ? false
          : {
              scaleX: 0,
            }
      }
      whileInView={
        reduceMotion
          ? undefined
          : {
              scaleX: progress / 100,
            }
      }
      viewport={{
        once: true,
        amount: 0.6,
      }}
      transition={{
        duration: 0.9,
        ease: premiumEase,
      }}
      style={
        reduceMotion
          ? {
              transform: `scaleX(${progress / 100})`,
            }
          : undefined
      }
    />
  );
}