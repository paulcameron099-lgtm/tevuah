"use client";

import {
  BarChart3,
  FileCheck2,
  Leaf,
  ShieldCheck,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Container } from "@/src/components/ui/container";
import { premiumEase } from "@/src/components/motion/premium-motion";

const trustItems = [
  {
    title: "Carefully presented",
    description: "Clear opportunity information",
    icon: FileCheck2,
  },
  {
    title: "Real-asset focus",
    description: "Land, production and collections",
    icon: Leaf,
  },
  {
    title: "Transparent reporting",
    description: "Operational and portfolio updates",
    icon: BarChart3,
  },
  {
    title: "Secure investor access",
    description: "Private account infrastructure",
    icon: ShieldCheck,
  },
];

export function TrustStrip() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-label="Platform principles"
      className="overflow-hidden border-b border-forest-900/10 bg-ivory-50"
    >
      <Container>
        <motion.div
          className="grid divide-y divide-forest-900/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4"
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
                staggerChildren: 0.09,
                delayChildren: 0.05,
              },
            },
          }}
        >
          {trustItems.map((item) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                className="flex items-start gap-4 px-0 py-6 sm:px-6 lg:px-7 lg:py-7 first:pl-0 last:pr-0"
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 18,
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
                <motion.span
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-forest-900 text-gold-400"
                  variants={{
                    hidden: {
                      opacity: 0,
                      scale: 0.82,
                    },
                    visible: {
                      opacity: 1,
                      scale: 1,
                      transition: {
                        duration: 0.65,
                        ease: premiumEase,
                      },
                    },
                  }}
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          y: -2,
                          scale: 1.04,
                        }
                  }
                  transition={{
                    duration: 0.3,
                    ease: premiumEase,
                  }}
                >
                  <Icon className="size-4.5" />
                </motion.span>

                <div>
                  <h2 className="text-sm font-semibold text-forest-950">
                    {item.title}
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-stone-500">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}