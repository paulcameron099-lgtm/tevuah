"use client";

import Image from "next/image";
import {
  ArrowUpRight,
  Check,
  Satellite,
  ScanLine,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { AgTechMetricCard } from "@/src/components/marketing/agtech-metric-card";
import { premiumEase } from "@/src/components/motion/premium-motion";
import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import { Section } from "@/src/components/ui/section";
import { agTechMetrics } from "@/src/data/agtech-metrics";

const transparencyFeatures = [
  "Estate operating updates",
  "Irrigation and water-use data",
  "Crop and harvest indicators",
  "Weather and field observations",
];

export function AgTechSection() {
  const reduceMotion = useReducedMotion();

  return (
    <Section className="overflow-hidden bg-forest-950 text-white">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-20">
          {/* Editorial content */}
          <motion.div
            initial={reduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
            }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.04,
                },
              },
            }}
          >
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
                    duration: 0.65,
                    ease: premiumEase,
                  },
                },
              }}
            >
              <motion.span
                className="h-px w-9 origin-left bg-gold-400"
                variants={{
                  hidden: {
                    scaleX: 0,
                  },
                  visible: {
                    scaleX: 1,
                    transition: {
                      duration: 0.7,
                      ease: premiumEase,
                    },
                  },
                }}
              />

              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
                AgTech transparency
              </p>
            </motion.div>

            <motion.h2
              className="font-display mt-6 max-w-3xl text-balance text-4xl leading-none font-medium tracking-[-0.035em] sm:text-5xl lg:text-6xl"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 28,
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
              Every estate has a story. Investors deserve the data behind it.
            </motion.h2>

            <motion.p
              className="mt-7 max-w-xl text-base leading-8 text-white/60"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 20,
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
              Tevuah Reserve brings estate reporting, agricultural metrics and project milestones together within the investor experience, providing greater visibility into the operational factors affecting an underlying asset.
            </motion.p>

            <motion.ul
              className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.07,
                    delayChildren: 0.05,
                  },
                },
              }}
            >
              {transparencyFeatures.map((feature) => (
                <motion.li
                  key={feature}
                  className="flex items-center gap-3 text-sm text-white/75"
                  variants={{
                    hidden: {
                      opacity: 0,
                      x: -12,
                    },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: {
                        duration: 0.6,
                        ease: premiumEase,
                      },
                    },
                  }}
                >
                  <motion.span
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10"
                    variants={{
                      hidden: {
                        opacity: 0,
                        scale: 0.75,
                      },
                      visible: {
                        opacity: 1,
                        scale: 1,
                        transition: {
                          duration: 0.5,
                          ease: premiumEase,
                        },
                      },
                    }}
                  >
                    <Check className="size-3.5 text-gold-400" />
                  </motion.span>

                  {feature}
                </motion.li>
              ))}
            </motion.ul>

            <motion.div
              variants={{
                hidden: {
                  opacity: 0,
                  y: 15,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.65,
                    ease: premiumEase,
                  },
                },
              }}
            >
              <Button
                href="/agtech"
                size="lg"
                className="mt-9"
              >
                Explore our AgTech approach
                <ArrowUpRight className="size-4" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Estate intelligence dashboard */}
          <motion.div
            className="relative"
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 38,
                    scale: 0.985,
                  }
            }
            whileInView={{
              opacity: 1,
              y: 0,
              scale: 1,
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
            <div className="relative z-10 min-h-235 overflow-hidden rounded-4xl border border-white/10 bg-forest-900 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:min-h-190">
              {/* Background estate image */}
              <motion.div
                className="absolute inset-0"
                initial={reduceMotion ? false : { scale: 1.075 }}
                whileInView={{ scale: 1 }}
                viewport={{
                  once: true,
                  amount: 0.15,
                }}
                transition={{
                  duration: 1.6,
                  ease: premiumEase,
                }}
              >
                <Image
                  src="/images/agtech/agtech-field-monitoring.jpeg"
                  alt="Agricultural field monitoring representing Tevuah Reserve reporting technology"
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              </motion.div> 
            </div>

            {/* Ambient depth */}
            <motion.div
              aria-hidden="true"
              className="absolute -right-24 -top-24 z-0 size-64 rounded-full bg-gold-500/10 blur-3xl"
              animate={
                reduceMotion
                  ? undefined
                  : {
                      scale: [1, 1.08, 1],
                      opacity: [0.55, 0.9, 0.55],
                      x: [0, -8, 0],
                      y: [0, 8, 0],
                    }
              }
              transition={
                reduceMotion
                  ? undefined
                  : {
                      duration: 9,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
            />

          <div
          aria-hidden="true"
          className="absolute -bottom-20 -left-16 z-0 size-64 rounded-full bg-olive-500/10 blur-3xl"
        />
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}