"use client";

import Image from "next/image";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { premiumEase } from "@/src/components/motion/premium-motion";
import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import { Section } from "@/src/components/ui/section";

export function FinalCta() {
  const reduceMotion = useReducedMotion();

  return (
    <Section className="overflow-hidden bg-forest-950 py-0">
      <motion.div
        className="relative min-h-155 overflow-hidden sm:min-h-170"
        initial={reduceMotion ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{
          once: true,
          amount: 0.12,
        }}
        transition={{
          duration: 0.9,
          ease: premiumEase,
        }}
      >
        {/* Vineyard background */}
        <motion.div
          className="absolute inset-0"
          initial={
            reduceMotion
              ? false
              : {
                  scale: 1.08,
                }
          }
          whileInView={{
            scale: 1,
          }}
          viewport={{
            once: true,
            amount: 0.12,
          }}
          transition={{
            duration: 2,
            ease: premiumEase,
          }}
        >
          <Image
            src="/images/sections/final-cta-vineyard.jpg"
            alt="Vineyard landscape representing long-term investment opportunities"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>

        {/* Cinematic overlays */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 bg-forest-950/45"
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 1.25,
            ease: premiumEase,
          }}
        />

        <motion.div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-forest-950 via-forest-950/80 to-forest-950/25"
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 1.4,
            delay: reduceMotion ? 0 : 0.08,
            ease: premiumEase,
          }}
        />

        <motion.div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-forest-950/80 via-transparent to-forest-950/15"
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 1.5,
            delay: reduceMotion ? 0 : 0.12,
            ease: premiumEase,
          }}
        />

        {/* Very restrained ambient light */}
        <motion.div
          aria-hidden="true"
          className="absolute -left-28 top-1/2 size-80 -translate-y-1/2 rounded-full bg-gold-500/10 blur-3xl"
          animate={
            reduceMotion
              ? undefined
              : {
                  opacity: [0.35, 0.6, 0.35],
                  scale: [1, 1.06, 1],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        />

        <Container className="relative z-10">
          <div className="flex min-h-155 items-center py-20 sm:min-h-170 sm:py-24">
            <motion.div
              className="max-w-4xl"
              initial={reduceMotion ? false : "hidden"}
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.25,
              }}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.12,
                    delayChildren: 0.18,
                  },
                },
              }}
            >
              {/* Eyebrow */}
              <motion.div
                className="flex items-center gap-3"
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 14,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.75,
                      ease: premiumEase,
                    },
                  },
                }}
              >
                <motion.span
                  className="h-px w-10 origin-left bg-gold-400"
                  variants={{
                    hidden: {
                      scaleX: 0,
                    },
                    visible: {
                      scaleX: 1,
                      transition: {
                        duration: 0.9,
                        ease: premiumEase,
                      },
                    },
                  }}
                />

                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
                  Invest with perspective
                </p>
              </motion.div>

              {/* Main headline */}
              <motion.h2
                className="font-display mt-7 max-w-4xl text-balance text-5xl leading-[0.94] font-medium tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl"
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 36,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 1.05,
                      ease: premiumEase,
                    },
                  },
                }}
              >
                Build a portfolio connected to enduring real assets.
              </motion.h2>

              {/* Supporting copy */}
              <motion.p
                className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg"
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 22,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.85,
                      ease: premiumEase,
                    },
                  },
                }}
              >
                Explore opportunities across agricultural estates, productive
                infrastructure and fine wine through an investor experience
                designed around transparency, documentation and long-term
                thinking.
              </motion.p>

              {/* CTA */}
              <motion.div
                className="mt-9"
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 18,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.75,
                      ease: premiumEase,
                    },
                  },
                }}
              >
                <Button
                  href="/investments"
                  size="lg"
                >
                  Explore opportunities
                  <ArrowUpRight className="size-4" />
                </Button>
              </motion.div>

              {/* Trust / risk statement */}
              <motion.div
                className="mt-10 flex max-w-2xl items-start gap-3 border-t border-white/15 pt-6"
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 14,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.8,
                      ease: premiumEase,
                    },
                  },
                }}
              >
                <motion.span
                  className="mt-0.5 flex shrink-0"
                  variants={{
                    hidden: {
                      opacity: 0,
                      scale: 0.75,
                    },
                    visible: {
                      opacity: 1,
                      scale: 1,
                      transition: {
                        duration: 0.55,
                        ease: premiumEase,
                      },
                    },
                  }}
                >
                  <ShieldCheck className="size-5 text-gold-400" />
                </motion.span>

                <p className="text-xs leading-6 text-white/50">
                  Investments involve risk, including possible loss of
                  principal and limited liquidity. Investors should review all
                  available offering information and consider their own
                  financial circumstances before investing.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </motion.div>
    </Section>
  );
}