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
              Tevuah Reserve can bring estate reporting, agricultural metrics
              and project milestones into one investor experience—without
              suggesting that technology removes investment risk.
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
                  src="/images/agtech/agtech-field-monitoring.jpg"
                  alt="Agricultural field monitoring representing Tevuah Reserve reporting technology"
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              </motion.div>

              <div className="absolute inset-0 bg-linear-to-t from-forest-950 via-forest-950/70 to-forest-950/20" />

              {/* Dashboard header */}
              <motion.div
                className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-white/10 bg-forest-950/40 px-5 py-4 backdrop-blur-md sm:px-7"
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        y: -16,
                      }
                }
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.4,
                }}
                transition={{
                  duration: 0.75,
                  delay: reduceMotion ? 0 : 0.2,
                  ease: premiumEase,
                }}
              >
                <div className="flex items-center gap-3">
                  <motion.span
                    className="flex size-9 items-center justify-center rounded-full bg-gold-500/15 text-gold-400"
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.6,
                      delay: reduceMotion ? 0 : 0.32,
                      ease: premiumEase,
                    }}
                  >
                    <Satellite className="size-4" />
                  </motion.span>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Estate intelligence
                    </p>

                    <p className="mt-0.5 text-[0.62rem] uppercase tracking-[0.14em] text-white/40">
                      Demonstration dashboard
                    </p>
                  </div>
                </div>

                <span className="flex items-center gap-2 text-xs text-white/55">
                  <motion.span
                    className="size-2 rounded-full bg-emerald-400"
                    animate={
                      reduceMotion
                        ? undefined
                        : {
                            opacity: [0.45, 1, 0.45],
                            scale: [0.9, 1.12, 0.9],
                          }
                    }
                    transition={
                      reduceMotion
                        ? undefined
                        : {
                            duration: 2.4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }
                    }
                  />

                  Data active
                </span>
              </motion.div>

              {/* Dashboard lower content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                <motion.div
                  className="mb-5 flex items-center justify-between rounded-2xl border border-white/10 bg-forest-950/55 p-4 backdrop-blur-md"
                  initial={
                    reduceMotion
                      ? false
                      : {
                          opacity: 0,
                          y: 22,
                          scale: 0.98,
                        }
                  }
                  whileInView={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.5,
                  }}
                  transition={{
                    duration: 0.75,
                    delay: reduceMotion ? 0 : 0.3,
                    ease: premiumEase,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <ScanLine className="size-5 text-gold-400" />

                    <div>
                      <p className="text-sm font-semibold text-white">
                        Estate health overview
                      </p>

                      <p className="mt-1 text-xs text-white/45">
                        Last illustrative update: today
                      </p>
                    </div>
                  </div>

                  <motion.p
                    className="font-display text-2xl font-semibold text-gold-400"
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.6,
                      delay: reduceMotion ? 0 : 0.42,
                      ease: premiumEase,
                    }}
                  >
                    86%
                  </motion.p>
                </motion.div>

                <motion.div
                  className="grid gap-4 sm:grid-cols-2"
                  initial={reduceMotion ? false : "hidden"}
                  whileInView="visible"
                  viewport={{
                    once: true,
                    amount: 0.15,
                  }}
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.09,
                        delayChildren: 0.38,
                      },
                    },
                  }}
                >
                  {agTechMetrics.map((metric) => (
                    <motion.div
                      key={metric.id}
                      variants={{
                        hidden: {
                          opacity: 0,
                          y: 18,
                          scale: 0.98,
                        },
                        visible: {
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          transition: {
                            duration: 0.65,
                            ease: premiumEase,
                          },
                        },
                      }}
                    >
                      <AgTechMetricCard metric={metric} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
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

        {/* Disclosure */}
        <motion.div
          className="mt-12 rounded-2xl border border-white/10 bg-white/4 px-6 py-5"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{
            once: true,
            amount: 0.5,
          }}
          transition={{
            duration: 0.7,
            ease: premiumEase,
          }}
        >
          <p className="text-xs leading-6 text-white/45">
            The metrics shown in this section are illustrative interface data
            for the Tevuah Reserve design. Genuine estate information should
            come from verified operational sources and clearly identify when
            readings were collected, how they were measured and whether they
            were independently reviewed.
          </p>
        </motion.div>
      </Container>
    </Section>
  );
}