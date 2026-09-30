"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import { Section } from "@/src/components/ui/section";
import { featuredOpportunities } from "@/src/data/opportunities";

import { OpportunityCard } from "./opportunity-card";
import { SectionHeading } from "./section-heading";
import { premiumEase } from "@/src/components/motion/premium-motion";

export function FeaturedOpportunities() {
  const reduceMotion = useReducedMotion();

  return (
    <Section className="overflow-hidden bg-white">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            className="max-w-4xl"
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{
              once: true,
              amount: 0.35,
            }}
            transition={{
              duration: 0.85,
              ease: premiumEase,
            }}
          >
            <SectionHeading
              eyebrow="Featured opportunities"
              title="Explore what cultivated investing could look like."
              description="Review illustrative opportunities across vineyard estates, olive agriculture and agricultural infrastructure."
              className="max-w-4xl"
            />
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
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
              href="/investments"
              variant="secondary"
              size="lg"
              className="w-fit shrink-0"
            >
              View all opportunities
              <ArrowUpRight className="size-4" />
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="mt-12 grid items-stretch gap-7 md:grid-cols-2 xl:grid-cols-3"
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.08,
          }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.11,
                delayChildren: 0.08,
              },
            },
          }}
        >
          {featuredOpportunities.map((opportunity) => (
            <motion.div
              key={opportunity.id}
              className="h-full"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 32,
                  scale: 0.99,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    duration: 0.8,
                    ease: premiumEase,
                  },
                },
              }}
            >
              <OpportunityCard opportunity={opportunity} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-8 flex gap-3 rounded-2xl border border-gold-500/25 bg-gold-500/5 px-5 py-5 sm:px-6"
          initial={reduceMotion ? false : { opacity: 0, y: 15 }}
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
          <motion.span
            aria-hidden="true"
            className="mt-2 size-2 shrink-0 rounded-full bg-gold-600"
            animate={
              reduceMotion
                ? undefined
                : {
                    opacity: [0.55, 1, 0.55],
                  }
            }
            transition={
              reduceMotion
                ? undefined
                : {
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
          />

          <p className="text-xs leading-6 text-stone-700">
            These opportunities, funding values, locations and classifications
            are illustrative content created for the Tevuah Reserve platform
            design. They are not live offerings and do not represent guaranteed
            returns or investment recommendations.
          </p>
        </motion.div>
      </Container>
    </Section>
  );
}