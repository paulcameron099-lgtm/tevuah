import type { Metadata } from "next";

import Link from "next/link";
import Image from "next/image";

import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Globe2,
  GraduationCap,
  Leaf,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sprout,
  Users,
  Video,
  Wine,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";

export const metadata: Metadata = {
  title: "Events | Tevuah Reserve",
  description:
    "Discover Tevuah Reserve event experiences, including estate visits, fine-wine conversations, AgTech sessions, investor briefings and educational programmes.",
};

const eventExperiences = [
  {
    id: "estate-visits",
    number: "01",
    eyebrow: "Estate experiences",
    title: "Discover the assets behind the investment.",
    description:
      "Estate visits provide a closer perspective on cultivated land, agricultural operations and the infrastructure supporting long-term asset management.",
    image: "/images/hero/agtech-page-hero.jpg",
    imageAlt:
      "Cultivated estate landscape representing Tevuah Reserve estate experiences",
    icon: Leaf,
    details: [
      "Estate and agricultural operations",
      "Infrastructure and stewardship",
      "Asset-level investment context",
    ],
    href: "/estates",
    linkLabel: "Explore our estates",
  },
  {
    id: "fine-wine",
    number: "02",
    eyebrow: "Fine-wine experiences",
    title: "Understand fine wine beyond the bottle.",
    description:
      "Fine-wine experiences focus on provenance, collection strategy, specialist custody and the considerations involved in owning and managing tangible wine assets.",
    image: "/images/hero/fine-wine-page-hero.jpg",
    imageAlt:
      "Fine-wine cellar representing professional wine custody",
    icon: Wine,
    details: [
      "Provenance and collection selection",
      "Storage and custody practices",
      "Wine-market and portfolio considerations",
    ],
    href: "/fine-wine",
    linkLabel: "Explore fine wine",
  },
  {
    id: "agtech",
    number: "03",
    eyebrow: "Agricultural technology",
    title: "Explore the intelligence behind modern agriculture.",
    description:
      "AgTech sessions examine how agricultural data, monitoring systems and operational technology can support visibility, efficiency and decision-making across cultivated assets.",
    image: "/images/wine/fine-wine-provenance.jpg",
    imageAlt:
      "Documented asset information representing technology and operational transparency",
    icon: Sprout,
    details: [
      "Agricultural monitoring and data",
      "Operational efficiency",
      "Technology and investment considerations",
    ],
    href: "/agtech",
    linkLabel: "Explore AgTech",
  },
];

const engagementFormats = [
  {
    icon: Video,
    title: "Virtual briefings",
    description:
      "Online conversations designed to explain investment themes, asset structures and relevant market considerations.",
  },
  {
    icon: Users,
    title: "Investor conversations",
    description:
      "Focused discussions around investment participation, asset management, reporting and investor questions.",
  },
  {
    icon: MapPin,
    title: "Estate experiences",
    description:
      "On-location learning opportunities that connect agricultural operations with the assets represented on the platform.",
  },
  {
    icon: GraduationCap,
    title: "Educational sessions",
    description:
      "Accessible discussions of investment fundamentals, risk, holding periods, custody and agricultural technology.",
  },
];

const participationSteps = [
  {
    number: "01",
    title: "Explore the programme",
    description:
      "Review the subject, format, intended audience and participation requirements of a published event.",
  },
  {
    number: "02",
    title: "Review event details",
    description:
      "Check the confirmed schedule, location or online format, availability and any applicable eligibility conditions.",
  },
  {
    number: "03",
    title: "Register when available",
    description:
      "Follow the registration instructions provided for that event. Some experiences may have limited capacity.",
  },
];

function SectionEyebrow({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`h-px w-9 ${
          light ? "bg-gold-400" : "bg-gold-600"
        }`}
      />
      <p
        className={`text-xs font-semibold uppercase tracking-[0.2em] ${
          light ? "text-gold-400" : "text-gold-600"
        }`}
      >
        {children}
      </p>
    </div>
  );
}

export default function EventsPage() {
  return (
    <main className="bg-ivory-100">
      {/* ==========================================
          HERO
      ========================================== */}

      <section className="relative flex min-h-165 items-end overflow-hidden bg-forest-950 pt-22 text-white lg:min-h-190">
        <div className="absolute inset-0">
          <Image
            src="/images/hero/estates-page-hero.jpg"
            alt="Agricultural estate landscape"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div className="absolute inset-0 bg-linear-to-r from-forest-950 via-forest-950/90 to-forest-950/35" />
        <div className="absolute inset-0 bg-linear-to-t from-forest-950 via-forest-950/25 to-forest-950/25" />

        <Container className="relative z-10 pb-16 pt-24 lg:pb-20">
          <div className="max-w-5xl">
            <SectionEyebrow light>
              Tevuah Reserve Events
            </SectionEyebrow>

            <h1 className="font-display mt-7 max-w-5xl text-balance text-5xl font-medium leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-8xl">
              Where assets, knowledge and people connect.
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
              Explore conversations and experiences
              connecting agricultural investment,
              fine-wine stewardship, technology and
              the people behind tangible assets.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button
                href="#event-experiences"
                size="lg"
              >
                Explore experiences
                <ArrowDown className="size-4" />
              </Button>

              <Button
                href="#upcoming-events"
                variant="outline"
                size="lg"
                className="border-white/25 text-white hover:bg-white/10 hover:text-white"
              >
                Upcoming events
                <CalendarDays className="size-4" />
              </Button>
            </div>
          </div>

          <div className="mt-16 grid gap-6 border-t border-white/15 pt-8 sm:grid-cols-3">
            {[
              {
                label: "Explore",
                value: "Cultivated assets",
              },
              {
                label: "Understand",
                value: "Investment perspectives",
              },
              {
                label: "Connect",
                value: "People and expertise",
              },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs uppercase tracking-[0.15em] text-white/45">
                  {item.label}
                </p>

                <p className="mt-2 text-sm font-semibold text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ==========================================
          INTRODUCTION
      ========================================== */}

      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <SectionEyebrow>
              Beyond the marketplace
            </SectionEyebrow>

            <div>
              <h2 className="font-display max-w-4xl text-4xl font-medium leading-none tracking-[-0.035em] text-forest-950 sm:text-5xl lg:text-6xl">
                Meaningful investment begins with
                understanding.
              </h2>

              <p className="mt-7 max-w-3xl text-base leading-8 text-stone-700">
                Tevuah Reserve brings together
                investment opportunities across
                vineyards, olive estates,
                agricultural technology and fine wine.
                Events create another way to explore
                these asset classes, ask informed
                questions and understand the
                considerations behind them.
              </p>

              <p className="mt-5 max-w-3xl text-base leading-8 text-stone-600">
                Our event programme is designed
                around useful information, relevant
                experiences and informed
                participation—not investment
                performance promises.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ==========================================
          EVENT EXPERIENCES
      ========================================== */}

      <section
        id="event-experiences"
        className="border-y border-forest-900/10 bg-white py-16 sm:py-20 lg:py-24"
      >
        <Container>
          <div className="max-w-4xl">
            <SectionEyebrow>
              Event experiences
            </SectionEyebrow>

            <h2 className="font-display mt-6 text-4xl font-medium leading-none tracking-[-0.035em] text-forest-950 sm:text-5xl lg:text-6xl">
              Explore the subjects shaping
              Tevuah Reserve.
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-600">
              Our event formats reflect the asset
              categories and investment principles
              presented across the platform.
            </p>
          </div>

          <div className="mt-12 space-y-8">
            {eventExperiences.map((event, index) => {
              const Icon = event.icon;

              return (
                <article
                  key={event.id}
                  className="group overflow-hidden rounded-4xl border border-forest-900/10 bg-ivory-50 shadow-[0_18px_60px_rgba(10,23,18,0.035)]"
                >
                  <div className="grid lg:grid-cols-2">
                    <div
                      className={`relative min-h-80 overflow-hidden bg-forest-950 lg:min-h-130 ${
                        index % 2 === 1
                          ? "lg:order-2"
                          : ""
                      }`}
                    >
                      <Image
                        src={event.image}
                        alt={event.imageAlt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                      />

                      <div className="absolute inset-0 bg-linear-to-t from-forest-950/60 via-transparent to-transparent" />

                      <span className="absolute bottom-7 left-7 font-display text-6xl font-medium text-white/75">
                        {event.number}
                      </span>
                    </div>

                    <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
                      <div className="flex items-center gap-3">
                        <span className="flex size-11 items-center justify-center rounded-full bg-gold-500/10 text-gold-700">
                          <Icon className="size-5" />
                        </span>

                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
                          {event.eyebrow}
                        </p>
                      </div>

                      <h3 className="font-display mt-7 max-w-xl text-3xl font-medium leading-tight tracking-[-0.035em] text-forest-950 sm:text-4xl">
                        {event.title}
                      </h3>

                      <p className="mt-5 text-sm leading-8 text-stone-600">
                        {event.description}
                      </p>

                      <ul className="mt-7 space-y-3">
                        {event.details.map((detail) => (
                          <li
                            key={detail}
                            className="flex items-start gap-3 text-sm text-stone-700"
                          >
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold-600" />
                            {detail}
                          </li>
                        ))}
                      </ul>

                      <Link
                        href={event.href}
                        className="focus-ring mt-9 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition hover:bg-forest-800"
                      >
                        {event.linkLabel}
                        <ArrowUpRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ==========================================
          UPCOMING EVENTS
      ========================================== */}

      <section
        id="upcoming-events"
        className="py-16 sm:py-20 lg:py-24"
      >
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <SectionEyebrow>
                Event calendar
              </SectionEyebrow>

              <h2 className="font-display mt-6 text-4xl font-medium leading-none tracking-[-0.035em] text-forest-950 sm:text-5xl">
                Upcoming events and sessions.
              </h2>

              <p className="mt-5 text-sm leading-7 text-stone-600">
                Confirmed event information,
                participation details and registration
                instructions will be published here
                when available.
              </p>
            </div>

            <Link
              href="/contact"
              className="focus-ring inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-forest-900/15 bg-white px-5 text-sm font-semibold text-forest-950 transition hover:border-gold-500/40"
            >
              Contact our team
              <ArrowUpRight className="size-4" />
            </Link>
          </div>

          <div className="mt-10 overflow-hidden rounded-4xl border border-forest-900/10 bg-white">
            <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
              <div className="flex min-h-70 flex-col justify-center bg-forest-950 p-8 text-white sm:p-12">
                <CalendarDays className="size-10 text-gold-400" />

                <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
                  Event schedule
                </p>

                <h3 className="font-display mt-4 text-3xl font-medium leading-tight sm:text-4xl">
                  New experiences will be announced here.
                </h3>
              </div>

              <div className="flex flex-col justify-center p-8 sm:p-12">
                <h3 className="font-display text-2xl font-medium text-forest-950">
                  No confirmed upcoming events
                </h3>

                <p className="mt-4 max-w-xl text-sm leading-8 text-stone-600">
                  There are no confirmed event dates
                  currently published on this page.
                  When sessions are scheduled,
                  event listings can include dates,
                  locations, formats, participation
                  requirements and registration
                  information.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/contact"
                    className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800"
                  >
                    Enquire about events
                    <ArrowUpRight className="size-4" />
                  </Link>

                  <Link
                    href="/insights"
                    className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border border-forest-900/15 px-5 text-sm font-semibold text-forest-950 transition hover:bg-ivory-100"
                  >
                    Read our insights
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ==========================================
          WAYS TO PARTICIPATE
      ========================================== */}

      <section className="bg-forest-950 py-16 text-white sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <SectionEyebrow light>
                Ways to engage
              </SectionEyebrow>

              <h2 className="font-display mt-6 text-4xl font-medium leading-none tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                Different formats. A shared
                commitment to understanding.
              </h2>

              <p className="mt-6 max-w-lg text-sm leading-8 text-white/60">
                The right format depends on the
                subject, audience and purpose of
                each event.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {engagementFormats.map((format) => {
                const Icon = format.icon;

                return (
                  <article
                    key={format.title}
                    className="rounded-3xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/8"
                  >
                    <span className="flex size-12 items-center justify-center rounded-full bg-gold-500/10 text-gold-400">
                      <Icon className="size-5" />
                    </span>

                    <h3 className="font-display mt-6 text-2xl font-medium">
                      {format.title}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-white/60">
                      {format.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* ==========================================
          PARTICIPATION PROCESS
      ========================================== */}

      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="max-w-4xl">
            <SectionEyebrow>
              Participation
            </SectionEyebrow>

            <h2 className="font-display mt-6 text-4xl font-medium leading-none tracking-[-0.035em] text-forest-950 sm:text-5xl">
              A clear path from interest
              to participation.
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-8 text-stone-600">
              When events are published, the
              relevant details will help visitors
              understand what to expect before
              deciding whether to participate.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {participationSteps.map((step) => (
              <article
                key={step.number}
                className="rounded-3xl border border-forest-900/10 bg-ivory-50 p-7 sm:p-8"
              >
                <span className="font-display text-5xl text-gold-600">
                  {step.number}
                </span>

                <h3 className="font-display mt-7 text-2xl font-medium text-forest-950">
                  {step.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-stone-600">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* ==========================================
          EVENT PRINCIPLES
      ========================================== */}

      <section className="border-y border-forest-900/10 bg-ivory-100 py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
            <div>
              <SectionEyebrow>
                Informed participation
              </SectionEyebrow>

              <h2 className="font-display mt-6 text-4xl font-medium leading-none tracking-[-0.035em] text-forest-950 sm:text-5xl">
                Useful conversations.
                Clear expectations.
              </h2>

              <p className="mt-6 text-sm leading-8 text-stone-600">
                Tevuah Reserve events are intended
                to support learning and engagement.
                Participation in an event does not
                establish investment eligibility or
                replace independent assessment of
                investment risks and documentation.
              </p>

              <Link
                href="/risk-disclosure"
                className="focus-ring mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-forest-950 transition hover:text-gold-700"
              >
                Review risk disclosures
                <ChevronRight className="size-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: ShieldCheck,
                  title: "Clear information",
                  description:
                    "Event details should distinguish confirmed information from matters still under discussion.",
                },
                {
                  icon: Globe2,
                  title: "Relevant perspectives",
                  description:
                    "Conversations can explore global agricultural and fine-wine investment themes.",
                },
                {
                  icon: MessageCircle,
                  title: "Open questions",
                  description:
                    "Participants can use appropriate sessions to ask questions and deepen their understanding.",
                },
                {
                  icon: Users,
                  title: "Respectful engagement",
                  description:
                    "Professional discussion and responsible communication are central to the experience.",
                },
              ].map((principle) => {
                const Icon = principle.icon;

                return (
                  <article
                    key={principle.title}
                    className="rounded-3xl border border-forest-900/10 bg-white p-6"
                  >
                    <Icon className="size-6 text-gold-600" />

                    <h3 className="mt-5 text-base font-semibold text-forest-950">
                      {principle.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-stone-600">
                      {principle.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* ==========================================
          FINAL CTA
      ========================================== */}

      <section className="bg-burgundy-900 py-16 text-white sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <SectionEyebrow light>
                Stay connected
              </SectionEyebrow>

              <h2 className="font-display mt-6 max-w-4xl text-4xl font-medium leading-none tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                Continue the conversation
                beyond the event.
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-8 text-white/65">
                Explore our investment opportunities,
                discover the thinking behind our
                asset classes, or contact Tevuah
                Reserve for information about
                future events.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Button
                href="/contact"
                size="lg"
              >
                Contact us
                <ArrowUpRight className="size-4" />
              </Button>

              <Button
                href="/investments"
                variant="outline"
                size="lg"
                className="border-white/25 text-white hover:bg-white/10 hover:text-white"
              >
                Explore investments
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}