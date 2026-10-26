"use client";

import Image from "next/image";
import {
  ArrowUpRight,
  CheckCircle2,
  LockKeyhole,
  SearchCheck,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { GovernanceCard } from "@/src/components/marketing/governance-card";
import { SectionHeading } from "@/src/components/marketing/section-heading";
import { premiumEase } from "@/src/components/motion/premium-motion";
import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import { Section } from "@/src/components/ui/section";
import { governancePrinciples } from "@/src/data/governance-principles";

const reviewStages = [
  "Asset and operator review",
  "Legal and structural review",
  "Financial assumptions",
  "Risk and disclosure preparation",
  "Due-diligence framework"
];

export function GovernanceSection() {
  const reduceMotion = useReducedMotion();

  return (
    <Section className="overflow-hidden bg-ivory-100">
      <Container>
        {/* Section introduction */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            className="max-w-5xl"
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{
              once: true,
              amount: 0.3,
            }}
            transition={{
              duration: 0.9,
              ease: premiumEase,
            }}
          >
            <SectionHeading
              eyebrow="Governance and trust"
              title="Trust should be supported by systems, evidence and oversight."
              description="A professional investment platform must make its review process, documentation, risks and operational controls visible. Confidence should be built through evidence, accountability and disciplined processes—not simply through presentation or marketing."
              className="max-w-5xl"
            />
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{
              once: true,
              amount: 0.6,
            }}
            transition={{
              duration: 0.7,
              delay: reduceMotion ? 0 : 0.08,
              ease: premiumEase,
            }}
          >
            <Button
              href="/about"
              variant="secondary"
              size="lg"
              className="w-fit shrink-0"
            >
              Learn about our approach
              <ArrowUpRight className="size-4" />
            </Button>
          </motion.div>
        </div>

        {/* Governance principles */}
        <motion.div
          className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.1,
          }}
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
          {governancePrinciples.map((principle, index) => (
            <motion.div
              key={principle.id}
              className="h-full"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 26,
                  scale: 0.99,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    duration: 0.78,
                    ease: premiumEase,
                  },
                },
              }}
            >
              <GovernanceCard
                principle={principle}
                index={index}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Due-diligence feature */}
        <motion.div
          className="mt-16 grid overflow-hidden rounded-4xl border border-forest-900/10 bg-white lg:grid-cols-[0.95fr_1.05fr]"
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 36,
                  scale: 0.992,
                }
          }
          whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          viewport={{
            once: true,
            amount: 0.1,
          }}
          transition={{
            duration: 1,
            ease: premiumEase,
          }}
        >
          {/* Estate review image */}
          <div className="relative min-h-110 overflow-hidden lg:min-h-155">
            <motion.div
              className="absolute inset-0"
              initial={reduceMotion ? false : { scale: 1.065 }}
              whileInView={{ scale: 1 }}
              viewport={{
                once: true,
                amount: 0.15,
              }}
              transition={{
                duration: 1.55,
                ease: premiumEase,
              }}
            >
              <Image
                src="/images/sections/governance-estate-review.jpeg"
                alt="Professional estate review representing Tevuah Reserve governance and due diligence"
                fill
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover"
              />
            </motion.div>

            <div className="absolute inset-0 bg-linear-to-t from-forest-950/75 via-forest-950/15 to-transparent" />
          </div>

          {/* Framework */}
          <motion.div
            className="flex flex-col justify-center p-7 sm:p-10 lg:p-14"
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
                  staggerChildren: 0.1,
                  delayChildren: 0.12,
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
                className="flex size-11 items-center justify-center rounded-full bg-forest-950 text-gold-400"
                variants={{
                  hidden: {
                    opacity: 0,
                    scale: 0.75,
                  },
                  visible: {
                    opacity: 1,
                    scale: 1,
                    transition: {
                      duration: 0.6,
                      ease: premiumEase,
                    },
                  },
                }}
              >
                <LockKeyhole className="size-5" />
              </motion.span>

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Due-diligence framework
              </p>
            </motion.div>

            <motion.h3
              className="font-display mt-6 text-balance text-4xl leading-[1.02] font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 24,
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
              Due diligence begins before investor capital.
            </motion.h3>

            <motion.p
              className="mt-6 text-base leading-8 text-stone-700"
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
              Before an opportunity is made available, Tevuah Reserve reviews the asset, operator, ownership structure, financial model, legal documentation, fees and material risks.
            </motion.p>

            <motion.ul
              className="mt-8 space-y-4"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.08,
                    delayChildren: 0.05,
                  },
                },
              }}
            >
              {reviewStages.map((stage) => (
                <motion.li
                  key={stage}
                  className="flex items-center gap-3 text-sm font-medium text-forest-950"
                  variants={{
                    hidden: {
                      opacity: 0,
                      x: -12,
                    },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: {
                        duration: 0.58,
                        ease: premiumEase,
                      },
                    },
                  }}
                >
                  <motion.span
                    className="flex shrink-0"
                    variants={{
                      hidden: {
                        opacity: 0,
                        scale: 0.72,
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
                    <CheckCircle2 className="size-5 text-gold-600" />
                  </motion.span>

                  {stage}
                </motion.li>
              ))}
            </motion.ul>

            <motion.div
              className="mt-9 rounded-2xl border border-gold-500/25 bg-gold-500/5 p-5"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 14,
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
              <p className="text-xs leading-6 text-stone-700">
                The governance and compliance framework is supported by qualified legal, financial and regulatory advisers appropriate to the jurisdictions in which the platform, assets and investors operate.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </Container>
    </Section>
  );
}