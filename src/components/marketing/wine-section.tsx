"use client";

import Image from "next/image";
import {
  ArrowUpRight,
  BadgeCheck,
  MapPin,
  PackageCheck,
  Thermometer,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { WineFeatureCard } from "@/src/components/marketing/wine-feature-card";
import { premiumEase } from "@/src/components/motion/premium-motion";
import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import { Section } from "@/src/components/ui/section";
import { fineWineFeatures } from "@/src/data/fine-wine-features";

const collectionDetails = [
  {
    label: "Storage environment",
    value: "Climate controlled",
    icon: Thermometer,
  },
  {
    label: "Provenance status",
    value: "Documented",
    icon: BadgeCheck,
  },
  {
    label: "Custody location",
    value: "Specialist facility",
    icon: MapPin,
  },
  {
    label: "Collection handling",
    value: "Professional",
    icon: PackageCheck,
  },
];

export function WineSection() {
  const reduceMotion = useReducedMotion();

  return (
    <Section className="overflow-hidden bg-burgundy-900 text-white">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20">
          {/* Editorial content */}
          <motion.div
            initial={reduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.18,
            }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.12,
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
                  y: 12,
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
                className="h-px w-9 origin-left bg-gold-400"
                variants={{
                  hidden: {
                    scaleX: 0,
                  },
                  visible: {
                    scaleX: 1,
                    transition: {
                      duration: 0.85,
                      ease: premiumEase,
                    },
                  },
                }}
              />

              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
                Fine-wine assets
              </p>
            </motion.div>

            <motion.h2
              className="font-display mt-6 max-w-4xl text-balance text-4xl leading-[0.98] font-medium tracking-[-0.04em] sm:text-5xl lg:text-6xl"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 30,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 1,
                    ease: premiumEase,
                  },
                },
              }}
            >
              A collection built for more than the cellar.
            </motion.h2>

            <motion.p
              className="mt-7 max-w-2xl text-base leading-8 text-white/65"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 20,
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
              Tevuah Reserve can provide investors with carefully presented
              access to fine-wine opportunities supported by provenance
              records, professional storage, documented custody and
              transparent portfolio reporting.
            </motion.p>

            <motion.div
              className="mt-10 grid gap-7 sm:grid-cols-2"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.11,
                    delayChildren: 0.06,
                  },
                },
              }}
            >
              {fineWineFeatures.map((feature) => (
                <motion.div
                  key={feature.id}
                  variants={{
                    hidden: {
                      opacity: 0,
                      y: 18,
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
                  <WineFeatureCard feature={feature} />
                </motion.div>
              ))}
            </motion.div>

            <motion.div
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
              <Button
                href="/fine-wine"
                size="lg"
                className="mt-10"
              >
                Explore fine wine
                <ArrowUpRight className="size-4" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Collection presentation */}
          <motion.div
            className="relative"
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 30,
                    scale: 0.99,
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
              duration: 1.15,
              ease: premiumEase,
            }}
          >
            <div className="relative z-10 min-h-190 overflow-hidden rounded-4xl border border-white/10 bg-burgundy-800 shadow-[0_30px_100px_rgba(20,4,9,0.4)] sm:min-h-170">
              {/* Cellar image */}
              <motion.div
                className="absolute inset-0"
                initial={reduceMotion ? false : { scale: 1.065 }}
                whileInView={{ scale: 1 }}
                viewport={{
                  once: true,
                  amount: 0.15,
                }}
                transition={{
                  duration: 1.8,
                  ease: premiumEase,
                }}
              >
                <Image
                  src="/images/wine/fine-wine-section.jpg"
                  alt="A professional wine cellar representing Tevuah Reserve fine-wine assets"
                  fill
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  className="object-cover"
                />
              </motion.div>

              <div className="absolute inset-0 bg-linear-to-t from-burgundy-900 via-burgundy-900/55 to-burgundy-900/10" />

              {/* Collection identity */}
              <motion.div
                className="absolute left-5 right-5 top-5 rounded-2xl border border-white/15 bg-burgundy-900/50 p-5 backdrop-blur-md sm:left-7 sm:right-auto sm:max-w-sm"
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        y: -10,
                      }
                }
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.5,
                }}
                transition={{
                  duration: 0.9,
                  delay: reduceMotion ? 0 : 0.25,
                  ease: premiumEase,
                }}
              >
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold-400">
                  Illustrative collection
                </p>

                <p className="font-display mt-2 text-2xl font-medium text-white">
                  European Fine-Wine Reserve
                </p>

                <p className="mt-2 text-xs leading-5 text-white/50">
                  Demonstration interface for collection reporting.
                </p>
              </motion.div>

              {/* Collection valuation */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                <motion.div
                  className="rounded-3xl border border-white/15 bg-burgundy-900/70 p-5 backdrop-blur-xl sm:p-6"
                  initial={
                    reduceMotion
                      ? false
                      : {
                          opacity: 0,
                          y: 22,
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
                    amount: 0.3,
                  }}
                  transition={{
                    duration: 0.95,
                    delay: reduceMotion ? 0 : 0.32,
                    ease: premiumEase,
                  }}
                >
                  <div className="flex items-end justify-between gap-5">
                    <motion.div
                      initial={
                        reduceMotion
                          ? false
                          : {
                              opacity: 0,
                              y: 10,
                            }
                      }
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.75,
                        delay: reduceMotion ? 0 : 0.45,
                        ease: premiumEase,
                      }}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                        Illustrative collection value
                      </p>

                      <p className="font-display mt-2 text-4xl font-semibold text-white">
                        €485,000
                      </p>
                    </motion.div>

                    <motion.span
                      className="rounded-full border border-gold-400/25 bg-gold-400/10 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-gold-400"
                      initial={
                        reduceMotion
                          ? false
                          : {
                              opacity: 0,
                              scale: 0.92,
                            }
                      }
                      whileInView={{
                        opacity: 1,
                        scale: 1,
                      }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.7,
                        delay: reduceMotion ? 0 : 0.5,
                        ease: premiumEase,
                      }}
                    >
                      Demonstration
                    </motion.span>
                  </div>

                  <motion.div
                    className="mt-6 grid gap-3 sm:grid-cols-2"
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
                          staggerChildren: 0.09,
                          delayChildren: 0.45,
                        },
                      },
                    }}
                  >
                    {collectionDetails.map((detail) => {
                      const Icon = detail.icon;

                      return (
                        <motion.div
                          key={detail.label}
                          className="rounded-xl border border-white/10 bg-white/5 p-4"
                          variants={{
                            hidden: {
                              opacity: 0,
                              y: 12,
                            },
                            visible: {
                              opacity: 1,
                              y: 0,
                              transition: {
                                duration: 0.7,
                                ease: premiumEase,
                              },
                            },
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <motion.span
                              className="mt-0.5 flex shrink-0"
                              variants={{
                                hidden: {
                                  opacity: 0,
                                  scale: 0.8,
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
                              <Icon className="size-4 text-gold-400" />
                            </motion.span>

                            <div>
                              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-white/40">
                                {detail.label}
                              </p>

                              <p className="mt-1 text-sm font-semibold text-white">
                                {detail.value}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* Ambient cellar glow */}
            <motion.div
              aria-hidden="true"
              className="absolute -right-20 -top-20 z-0 size-64 rounded-full bg-gold-500/10 blur-3xl"
              animate={
                reduceMotion
                  ? undefined
                  : {
                      scale: [1, 1.06, 1],
                      opacity: [0.5, 0.78, 0.5],
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
          </motion.div>
        </div>

        {/* Risk disclosure */}
        <motion.div
          className="mt-12 rounded-2xl border border-white/10 bg-white/4 px-6 py-5"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{
            once: true,
            amount: 0.5,
          }}
          transition={{
            duration: 0.8,
            ease: premiumEase,
          }}
        >
          <p className="text-xs leading-6 text-white/45">
            Fine wine can be illiquid and may involve storage, insurance,
            valuation, authenticity, custody and resale risks. The figures and
            collection information shown here are illustrative and do not
            represent a live investment product.
          </p>
        </motion.div>
      </Container>
    </Section>
  );
}