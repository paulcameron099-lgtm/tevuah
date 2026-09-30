"use client";

import { motion, useReducedMotion } from "motion/react";

import { investmentCategories } from "@/src/data/investment-categories";

import { CategoryCard } from "@/src/components/marketing/category-card";
import { SectionHeading } from "@/src/components/marketing/section-heading";
import { Container } from "@/src/components/ui/container";
import { Section } from "@/src/components/ui/section";
import { premiumEase } from "@/src/components/motion/premium-motion";

export function InvestmentCategories() {
  const reduceMotion = useReducedMotion();

  return (
    <Section className="overflow-hidden bg-ivory-100">
      <Container>
        <motion.div
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
            eyebrow="Investment categories"
            title="Four distinct paths into cultivated assets."
            description="Explore opportunities connected to productive estates, agricultural innovation and carefully selected collectible assets."
          />
        </motion.div>

        <motion.div
          className="mt-12 grid gap-6 lg:grid-cols-2"
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
                staggerChildren: 0.12,
                delayChildren: 0.08,
              },
            },
          }}
        >
          {investmentCategories.map((category, index) => (
            <motion.div
              key={category.id}
              className="h-full"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 34,
                  scale: 0.985,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    duration: 0.85,
                    ease: premiumEase,
                  },
                },
              }}
            >
              <CategoryCard
                category={category}
                priority={index < 2}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-8 rounded-2xl border border-forest-900/10 bg-white/60 px-6 py-5"
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
          <p className="text-xs leading-6 text-stone-500">
            The opportunities and categories currently displayed are for
            platform-design demonstration purposes. They do not constitute an
            offer, financial recommendation or guarantee of performance.
          </p>
        </motion.div>
      </Container>
    </Section>
  );
}