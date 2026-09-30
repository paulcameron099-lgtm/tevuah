"use client";

import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import { premiumEase } from "@/src/components/motion/premium-motion";

export function HomeHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative flex min-h-190 items-end overflow-hidden bg-forest-950 text-white sm:min-h-205 lg:min-h-screen">
      <motion.div
        className="absolute inset-0"
        initial={
          reduceMotion
            ? false
            : {
                scale: 1.07,
                opacity: 0.72,
              }
        }
        animate={{
          scale: 1,
          opacity: 1,
        }}
        transition={{
          duration: 1.8,
          ease: premiumEase,
        }}
      >
        <Image
          src="/images/hero/tevuah-vineyard-hero.jpg"
          alt="A vineyard estate representing Tevuah Reserve investments"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      <motion.div
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,23,18,0.96)_0%,rgba(10,23,18,0.78)_42%,rgba(10,23,18,0.25)_100%)]"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 1.2,
          ease: premiumEase,
        }}
      />

      <motion.div
        className="absolute inset-0 bg-[linear-gradient(0deg,rgba(10,23,18,0.85)_0%,transparent_60%)]"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 1.3,
          delay: reduceMotion ? 0 : 0.1,
          ease: premiumEase,
        }}
      />

      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_78%_25%,rgba(194,162,102,0.12),transparent_35%)]"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 1.5,
          delay: reduceMotion ? 0 : 0.2,
          ease: premiumEase,
        }}
      />

      <Container className="relative z-10 pb-16 pt-36 sm:pb-20 sm:pt-44 lg:pb-24">
        <div className="max-w-5xl">
          <motion.div
            className="mb-7 flex items-center gap-3"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: reduceMotion ? 0 : 0.2,
              ease: premiumEase,
            }}
          >
            <motion.span
              className="h-px w-10 origin-left bg-gold-500"
              initial={reduceMotion ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 0.7,
                delay: reduceMotion ? 0 : 0.25,
                ease: premiumEase,
              }}
            />

            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">
              Tevuah Reserve
            </p>
          </motion.div>

          <div className="overflow-hidden pb-2">
            <motion.h1
              className="font-display max-w-5xl text-balance text-[3.5rem] leading-[0.91] font-medium tracking-[-0.045em] sm:text-7xl lg:text-[6.2rem] xl:text-[7rem]"
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: "32%",
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 1,
                delay: reduceMotion ? 0 : 0.3,
                ease: premiumEase,
              }}
            >
              Where enduring assets take root.
            </motion.h1>
          </div>

          <motion.p
            className="mt-8 max-w-2xl text-pretty text-base leading-8 text-white/70 sm:text-lg"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: reduceMotion ? 0 : 0.48,
              ease: premiumEase,
            }}
          >
            Discover carefully considered opportunities across vineyard
            estates, olive agriculture, AgTech infrastructure and
            professionally managed fine wine.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-col gap-3 sm:flex-row"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.75,
              delay: reduceMotion ? 0 : 0.62,
              ease: premiumEase,
            }}
          >
            <Button href="/investments" size="lg">
              Explore investments
              <ArrowUpRight className="size-4" />
            </Button>

            <Button
              href="/how-it-works"
              variant="outline"
              size="lg"
              className="border-white/25 text-white hover:bg-white/10"
            >
              How it works
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="mt-16 flex flex-col gap-7 border-t border-white/15 pt-7 md:flex-row md:items-end md:justify-between lg:mt-20"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: reduceMotion ? 0 : 0.78,
            ease: premiumEase,
          }}
        >
          <div className="grid max-w-3xl gap-5 sm:grid-cols-3">
            {[
              ["Asset focus", "Productive real assets"],
              ["Reporting", "Transparent estate data"],
              ["Perspective", "Long-term stewardship"],
            ].map(([label, value], index) => (
              <motion.div
                key={label}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.65,
                  delay: reduceMotion ? 0 : 0.88 + index * 0.09,
                  ease: premiumEase,
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                  {label}
                </p>

                <p className="mt-2 text-sm text-white/80">{value}</p>
              </motion.div>
            ))}
          </div>

          <motion.a
            href="#introduction"
            className="focus-ring hidden items-center gap-3 rounded-full text-xs font-semibold uppercase tracking-[0.16em] text-white/60 transition-colors hover:text-white md:flex"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.7,
              delay: reduceMotion ? 0 : 1.1,
              ease: premiumEase,
            }}
          >
            Discover more

            <motion.span
              className="flex size-10 items-center justify-center rounded-full border border-white/20"
              animate={
                reduceMotion
                  ? undefined
                  : {
                      y: [0, 4, 0],
                    }
              }
              transition={
                reduceMotion
                  ? undefined
                  : {
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
            >
              <ArrowDown className="size-4" />
            </motion.span>
          </motion.a>
        </motion.div>
      </Container>
    </section>
  );
}