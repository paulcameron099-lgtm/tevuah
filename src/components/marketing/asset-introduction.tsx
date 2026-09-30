"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import { Section } from "@/src/components/ui/section";
import { premiumEase } from "@/src/components/motion/premium-motion";

export function AssetIntroduction() {
  const reduceMotion = useReducedMotion();

  return (
    <Section
      id="introduction"
      className="overflow-hidden bg-ivory-100"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.55fr] lg:gap-24">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
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
            <div className="flex items-center gap-3">
              <motion.span
                aria-hidden="true"
                className="h-px w-8 origin-left bg-gold-600"
                initial={reduceMotion ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{
                  once: true,
                  amount: 0.8,
                }}
                transition={{
                  duration: 0.7,
                  ease: premiumEase,
                }}
              />

              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">
                A cultivated perspective
              </p>
            </div>
          </motion.div>

          <div>
            <div className="overflow-hidden pb-2">
              <motion.h2
                className="font-display max-w-5xl text-balance text-4xl leading-[1.02] font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl lg:text-6xl"
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        y: 38,
                      }
                }
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.35,
                }}
                transition={{
                  duration: 0.9,
                  delay: reduceMotion ? 0 : 0.06,
                  ease: premiumEase,
                }}
              >
                Real assets shaped by heritage and strengthened by modern
                intelligence.
              </motion.h2>
            </div>

            <motion.div
              className="mt-8 grid gap-7 md:grid-cols-2"
              initial={reduceMotion ? false : "hidden"}
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.3,
              }}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.11,
                    delayChildren: 0.12,
                  },
                },
              }}
            >
              <motion.p
                className="text-base leading-8 text-stone-700"
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
                Tevuah Reserve is being designed to connect investors with
                carefully presented opportunities across productive
                agriculture, estate development and fine-wine assets.
              </motion.p>

              <motion.p
                className="text-base leading-8 text-stone-700"
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
                Each opportunity will bring together clear documentation,
                operating information, project milestones and an investor
                experience built around long-term transparency.
              </motion.p>
            </motion.div>

            <motion.div
              className="mt-9"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{
                once: true,
                amount: 0.5,
              }}
              transition={{
                duration: 0.7,
                delay: reduceMotion ? 0 : 0.22,
                ease: premiumEase,
              }}
            >
              <Button
                href="/how-it-works"
                variant="secondary"
                size="lg"
              >
                Understand our approach
                <ArrowUpRight className="size-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </Container>
    </Section>
  );
}