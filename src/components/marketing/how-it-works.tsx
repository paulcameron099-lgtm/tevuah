"use client";

import Image from "next/image";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { JourneyStepCard } from "@/src/components/marketing/journey-step-card";
import { SectionHeading } from "@/src/components/marketing/section-heading";
import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import { Section } from "@/src/components/ui/section";
import { premiumEase } from "@/src/components/motion/premium-motion";
import { investorJourneySteps } from "@/src/data/investor-journey";

const reviewPoints = [
  "Clear opportunity information",
  "Supporting documentation",
  "Visible project milestones",
  "Private investor reporting",
];

export function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <Section className="overflow-hidden bg-ivory-100">
      <Container>
        {/* Introduction */}
        <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-end lg:gap-20">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 30 }}
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
              eyebrow="How it works"
              title="A considered path from discovery to portfolio reporting."
              description="Tevuah Reserve is being designed to give investors a clear, structured journey through opportunity review, commitment and long-term monitoring."
            />
          </motion.div>

          <motion.div
            className="lg:pb-2"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{
              once: true,
              amount: 0.4,
            }}
            transition={{
              duration: 0.8,
              delay: reduceMotion ? 0 : 0.1,
              ease: premiumEase,
            }}
          >
            <p className="max-w-xl text-sm leading-7 text-stone-700">
              Every genuine opportunity will require its own legal,
              operational and financial documentation. The platform experience
              should make that information easier to review without hiding the
              underlying risks.
            </p>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{
                once: true,
                amount: 0.6,
              }}
              transition={{
                duration: 0.65,
                delay: reduceMotion ? 0 : 0.18,
                ease: premiumEase,
              }}
            >
              <Button
                href="/how-it-works"
                variant="secondary"
                size="lg"
                className="mt-7"
              >
                Explore the investor journey
                <ArrowUpRight className="size-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Investor journey */}
        <motion.div
          className="mt-14 grid gap-9 sm:grid-cols-2 xl:grid-cols-4 xl:gap-8"
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.12,
          }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.13,
                delayChildren: 0.06,
              },
            },
          }}
        >
          {investorJourneySteps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 28,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.78,
                    ease: premiumEase,
                  },
                },
              }}
            >
              <JourneyStepCard
                step={step}
                isLast={index === investorJourneySteps.length - 1}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Estate review feature */}
        <motion.div
          className="mt-16 grid overflow-hidden rounded-4xl bg-forest-950 text-white lg:grid-cols-[1.05fr_0.95fr]"
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 38,
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
          {/* Image */}
          <div className="relative min-h-105 overflow-hidden lg:min-h-145">
            <motion.div
              className="absolute inset-0"
              initial={reduceMotion ? false : { scale: 1.07 }}
              whileInView={{ scale: 1 }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: 1.5,
                ease: premiumEase,
              }}
            >
              <Image
                src="/images/sections/how-it-works-estate-review.jpg"
                alt="An estate review representing the Tevuah Reserve investment process"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
            </motion.div>

            <div className="absolute inset-0 bg-linear-to-t from-forest-950/65 via-transparent to-forest-950/10" />

            <motion.div
              className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/15 bg-forest-950/55 p-5 backdrop-blur-md sm:bottom-8 sm:left-8 sm:right-auto sm:max-w-sm"
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 24,
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
                duration: 0.8,
                delay: reduceMotion ? 0 : 0.25,
                ease: premiumEase,
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
                Structured review
              </p>

              <p className="mt-3 text-sm leading-6 text-white/75">
                Opportunity presentation should support informed review, not
                replace independent judgement or professional advice.
              </p>
            </motion.div>
          </div>

          {/* Review copy */}
          <motion.div
            className="flex flex-col justify-center p-7 sm:p-10 lg:p-14"
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
                  delayChildren: 0.15,
                },
              },
            }}
          >
            <motion.p
              className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400"
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
              Before commitment
            </motion.p>

            <motion.h3
              className="font-display mt-5 text-4xl leading-[1.02] font-medium tracking-[-0.03em] sm:text-5xl"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 24,
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
              Understand the asset, structure and risks.
            </motion.h3>

            <motion.p
              className="mt-6 text-sm leading-7 text-white/65"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 18,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.72,
                    ease: premiumEase,
                  },
                },
              }}
            >
              Each opportunity should present the investment structure, use of
              funds, estate operator, project assumptions, fees, duration,
              risks and available documentation in one clear experience.
            </motion.p>

            <motion.ul
              className="mt-8 space-y-4"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.09,
                    delayChildren: 0.08,
                  },
                },
              }}
            >
              {reviewPoints.map((point) => (
                <motion.li
                  key={point}
                  className="flex items-center gap-3 text-sm text-white/80"
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
                    className="flex shrink-0"
                    variants={{
                      hidden: {
                        scale: 0.7,
                        opacity: 0,
                      },
                      visible: {
                        scale: 1,
                        opacity: 1,
                        transition: {
                          duration: 0.55,
                          ease: premiumEase,
                        },
                      },
                    }}
                  >
                    <CheckCircle2 className="size-5 text-gold-400" />
                  </motion.span>

                  {point}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </motion.div>
      </Container>
    </Section>
  );
}