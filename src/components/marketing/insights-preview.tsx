"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { InsightCard } from "@/src/components/marketing/insight-card";
import { SectionHeading } from "@/src/components/marketing/section-heading";
import { premiumEase } from "@/src/components/motion/premium-motion";
import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import { Section } from "@/src/components/ui/section";
import { featuredInsights } from "@/src/data/insights";

export function InsightsPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <Section className="overflow-hidden bg-ivory-50">
      <Container>
        {/* Section introduction */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            className="max-w-5xl"
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
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
              eyebrow="Insights"
              title="Perspective for long-term investors."
              description="Explore thinking around real assets, agriculture, fine wine, technology and the principles behind disciplined long-term investing."
            />
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
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
              href="/insights"
              variant="secondary"
              size="lg"
              className="w-fit shrink-0"
            >
              View all insights
              <ArrowUpRight className="size-4" />
            </Button>
          </motion.div>
        </div>

        {/* Editorial cards */}
        <motion.div
          className="mt-12 grid gap-7 md:grid-cols-2 xl:grid-cols-3"
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
                staggerChildren: 0.12,
                delayChildren: 0.06,
              },
            },
          }}
        >
          {featuredInsights.map((article, index) => (
            <motion.div
              key={article.id}
              className="h-full"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 30,
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
              <InsightCard
                article={article}
                priority={index === 0}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Editorial disclosure */}
        <motion.div
          className="mt-9 border-t border-forest-900/10 pt-6"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.6,
          }}
          transition={{
            duration: 0.75,
            delay: reduceMotion ? 0 : 0.05,
            ease: premiumEase,
          }}
        >
          <p className="max-w-4xl text-xs leading-6 text-stone-500">
            Tevuah Reserve insights are provided for general informational and
            educational purposes only. They should not be interpreted as
            investment, legal, tax or financial advice, or as a recommendation
            to acquire or dispose of any investment.
          </p>
        </motion.div>
      </Container>
    </Section>
  );
}