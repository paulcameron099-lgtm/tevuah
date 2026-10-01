"use client";

import {
  useState,
} from "react";

import {
  ChevronDown,
} from "lucide-react";

import {
  motion,
  useReducedMotion,
} from "motion/react";

import {
  premiumEase,
} from "@/src/components/motion/premium-motion";

export type FaqItem = {
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: FaqItem[];
};

export function FaqAccordion({
  items,
}: FaqAccordionProps) {
  const reduceMotion = useReducedMotion();

  const [openIndex, setOpenIndex] =
    useState<number | null>(0);

  return (
    <div className="divide-y divide-forest-900/10 border-y border-forest-900/10">
      {items.map((item, index) => {
        const isOpen =
          openIndex === index;

        const panelId =
          `faq-panel-${index}`;

        const buttonId =
          `faq-button-${index}`;

        return (
          <div
            key={item.question}
            className="group"
          >
            <button
              id={buttonId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() =>
                setOpenIndex(
                  isOpen ? null : index,
                )
              }
              className="focus-ring flex w-full items-start justify-between gap-6 rounded-sm py-6 text-left sm:py-7"
            >
              <span className="font-display pr-3 text-xl font-medium leading-7 text-forest-950 transition group-hover:text-olive-700 sm:text-2xl">
                {item.question}
              </span>

              <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full border border-forest-900/10 bg-white">
                <motion.span
                  animate={
                    reduceMotion
                      ? undefined
                      : {
                          rotate:
                            isOpen
                              ? 180
                              : 0,
                        }
                  }
                  transition={{
                    duration: 0.3,
                    ease: premiumEase,
                  }}
                >
                  <ChevronDown className="size-4 text-gold-600" />
                </motion.span>
              </span>
            </button>

            <motion.div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              initial={false}
              animate={{
                height:
                  isOpen ? "auto" : 0,
                opacity:
                  isOpen ? 1 : 0,
              }}
              transition={
                reduceMotion
                  ? {
                      duration: 0,
                    }
                  : {
                      height: {
                        duration: 0.38,
                        ease: premiumEase,
                      },
                      opacity: {
                        duration: 0.25,
                        ease: premiumEase,
                      },
                    }
              }
              className="overflow-hidden"
            >
              <div className="max-w-3xl pb-7 pr-12 text-sm leading-7 text-stone-600 sm:pb-8 sm:text-[15px] sm:leading-8">
                {item.answer}
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}