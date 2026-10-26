import type { Metadata } from "next";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Globe2,
  GraduationCap,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sprout,
  Users,
  Wine,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import { events } from "@/src/data/event";

import {
  EventHeroReveal,
  EventReveal,
  EventStagger,
  EventStaggerItem,
} from "@/src/components/events/event-motion";

export const metadata: Metadata = {
  title: "Events | Tevuah Reserve",
  description:
    "Explore Tevuah Reserve events across fine wine, agricultural technology, olive estates and cultivated assets. Discover specialist gatherings, investment briefings and curated experiences.",
};

const engagementFormats = [
  {
    icon: Wine,
    title: "Fine-wine tastings",
    description:
      "Explore selected wines through guided tastings and discussions covering provenance, production, collection practices and market context.",
  },
  {
    icon: Users,
    title: "Industry discussions",
    description:
      "Hear perspectives on agricultural operations, fine-wine markets, estate management and developments affecting the sectors in which Tevuah Reserve operates.",
  },
  {
    icon: Sprout,
    title: "Technology sessions",
    description:
      "Examine how agricultural technology is used in the field, including monitoring, irrigation management, operational data and resource planning.",
  },
  {
    icon: GraduationCap,
    title: "Estate experiences",
    description:
      "Gain a closer understanding of cultivated assets through experiences focused on agricultural practices, infrastructure, production and stewardship.",
  },
];

const participationSteps = [
  {
    number: "01",
    title: "Explore the programme",
    description:
      "Review available events and identify the subjects, formats and experiences relevant to your interests.",
  },
  {
    number: "02",
    title: "Review the details",
    description:
      "Explore the event programme, proposed schedule, location, participation requirements and registration conditions.",
  },
  {
    number: "03",
    title: "Register your interest",
    description:
      "Submit an enquiry for your selected event. Our events team will review your request and provide further information about availability and next steps.",
  },
];

const eventPrinciples = [
  {
    icon: ShieldCheck,
    title: "Clear information",
    description:
      "Published event details communicate the programme, proposed schedule, format and participation conditions.",
  },
  {
    icon: Globe2,
    title: "Industry expertise",
    description:
      "Sessions explore relevant practices, developments and perspectives from the sectors covered.",
  },
  {
    icon: MessageCircle,
    title: "Open questions",
    description:
      "Events encourage informed questions and constructive engagement with the subjects under consideration.",
  },
  {
    icon: Users,
    title: "Responsible communication",
    description:
      "Investment-related discussions distinguish factual information, professional opinions and potential outcomes from guarantees or promises of performance.",
  },
];

function getEventIcon(category: string) {
  switch (category.toLowerCase()) {
    case "fine wine":
      return Wine;
    case "agtech":
    case "olive estates":
      return Sprout;
    default:
      return CalendarDays;
  }
}

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
      {/* HERO */}
      <section className="relative flex min-h-165 items-end overflow-hidden bg-forest-950 pt-22 text-white lg:min-h-190">
        <Image
          src="/images/hero/event-page-hero.jpeg"
          alt="Agricultural estate landscape"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-linear-to-r from-forest-950 via-forest-950/90 to-forest-950/35" />
        <div className="absolute inset-0 bg-linear-to-t from-forest-950 via-forest-950/25 to-forest-950/25" />

        <Container className="relative z-10 pb-16 pt-24 lg:pb-20">
          <EventHeroReveal className="max-w-5xl">
            <SectionEyebrow light>Events</SectionEyebrow>

            <h1 className="font-display mt-7 max-w-5xl text-balance text-5xl font-medium leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-8xl">
              Where cultivated assets meet new perspectives.
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
              Discover a programme of specialist gatherings
              exploring fine wine, agricultural technology,
              olive and vineyard estates. Each event brings
              a closer perspective on the assets, expertise
              and market forces shaping long-term investment
              opportunities.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button
                href="#event-experiences"
                variant="outline"
                size="lg"
                className="border-white/25 text-white hover:bg-white/10 hover:text-white"
              >
                Upcoming events
                <CalendarDays className="size-4" />
              </Button>
            </div>
          </EventHeroReveal>

          <EventStagger className="mt-16 grid gap-6 border-t border-white/15 pt-8 sm:grid-cols-3">
            {[
              { label: "Explore", value: "Cultivated assets" },
              {
                label: "Understand",
                value: "Investment perspectives",
              },
              {
                label: "Connect",
                value: "People and expertise",
              },
            ].map((item) => (
              <EventStaggerItem key={item.label}>
                <p className="text-xs uppercase tracking-[0.15em] text-white/45">
                  {item.label}
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {item.value}
                </p>
              </EventStaggerItem>
            ))}
          </EventStagger>
        </Container>
      </section>

      {/* INTRODUCTION */}
      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <EventReveal className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <SectionEyebrow>
              Beyond the marketplace
            </SectionEyebrow>

            <div>
              <h2 className="font-display max-w-4xl text-4xl font-medium leading-none tracking-[-0.035em] text-forest-950 sm:text-5xl lg:text-6xl">
                Where expertise, assets and new perspectives
                come together.
              </h2>

              <p className="mt-7 max-w-3xl text-base leading-8 text-stone-700">
                Tevuah Reserve presents events centred on fine
                wine, vineyard estates, olive estates and
                agricultural technology. Each gathering offers
                an opportunity to explore industry developments,
                hear specialist perspectives and gain a deeper
                understanding of the assets, practices and
                market dynamics shaping these sectors.
              </p>

              <p className="mt-5 max-w-3xl text-base leading-8 text-stone-600">
                Discover upcoming events, exchange perspectives
                and engage with the people and ideas behind
                Tevuah Reserve&apos;s investment opportunities.
              </p>
            </div>
          </EventReveal>
        </Container>
      </section>

      {/* EVENT EXPERIENCES */}
      <section
        id="event-experiences"
        className="scroll-mt-24 border-y border-forest-900/10 bg-white py-16 sm:py-20 lg:py-24"
      >
        <Container>
          <EventReveal className="max-w-4xl">
            <SectionEyebrow>Event experiences</SectionEyebrow>

            <h2 className="font-display mt-6 text-4xl font-medium leading-none tracking-[-0.035em] text-forest-950 sm:text-5xl lg:text-6xl">
              Explore upcoming events and experiences.
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-600">
              Explore scheduled gatherings, specialist
              sessions and curated experiences across
              Tevuah Reserve&apos;s four investment areas.
              Each listing will provide the relevant event
              details, participation requirements and
              registration information.
            </p>
          </EventReveal>

          <EventStagger className="mt-12 space-y-8">
            {events.map((event, index) => {
              const Icon = getEventIcon(event.category);

              return (
                <EventStaggerItem key={event.slug}>
                  <article className="group overflow-hidden rounded-4xl border border-forest-900/10 bg-ivory-50 shadow-[0_18px_60px_rgba(10,23,18,0.035)] transition-shadow duration-500 hover:shadow-[0_25px_80px_rgba(10,23,18,0.09)]">
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
                          alt={event.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.045]"
                        />

                        <div className="absolute inset-0 bg-linear-to-t from-forest-950/70 via-forest-950/10 to-transparent" />

                        <div className="absolute left-6 top-6">
                          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-forest-950/65 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md">
                            <Icon className="size-4 text-gold-400" />
                            {event.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
                        <div className="flex items-center gap-3">
                          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold-500/10 text-gold-700">
                            <Icon className="size-5" />
                          </span>

                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
                            {event.eyebrow}
                          </p>
                        </div>

                        <h3 className="font-display mt-7 max-w-xl text-3xl font-medium leading-tight tracking-[-0.035em] text-forest-950 sm:text-4xl">
                          {event.title}
                        </h3>

                        <div className="mt-6 space-y-3">
                          <div className="flex items-start gap-3">
                            <CalendarDays className="mt-0.5 size-4 shrink-0 text-gold-600" />
                            <p className="text-sm font-semibold text-forest-950">
                              {event.date}
                            </p>
                          </div>

                          <div className="flex items-start gap-3">
                            <MapPin className="mt-0.5 size-4 shrink-0 text-gold-600" />
                            <p className="text-sm text-stone-700">
                              {event.location}
                            </p>
                          </div>
                        </div>

                        <p className="mt-6 text-sm leading-8 text-stone-600">
                          {event.summary}
                        </p>

                        <dl className="mt-7 grid gap-5 border-t border-forest-900/10 pt-6 sm:grid-cols-2">
                          <div>
                            <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-stone-500">
                              Format
                            </dt>
                            <dd className="mt-2 text-sm font-semibold leading-6 text-forest-950">
                              {event.format}
                            </dd>
                          </div>

                          <div>
                            <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-stone-500">
                              Focus
                            </dt>
                            <dd className="mt-2 text-sm font-semibold leading-6 text-forest-950">
                              {event.category}
                            </dd>
                          </div>
                        </dl>

                        <Link
                          href={`/events/${event.slug}`}
                          className="focus-ring mt-9 inline-flex min-h-12 w-fit items-center gap-3 rounded-full bg-forest-950 px-7 text-sm font-semibold text-white transition-all duration-300 hover:bg-forest-800 hover:shadow-[0_12px_30px_rgba(10,23,18,0.18)]"
                        >
                          Explore event
                          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                </EventStaggerItem>
              );
            })}
          </EventStagger>

          <EventReveal className="mt-10 rounded-2xl border border-gold-600/15 bg-ivory-100 p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <CalendarDays className="mt-1 size-5 shrink-0 text-gold-700" />

              <div>
                <h3 className="text-sm font-semibold text-forest-950">
                  Event registration and availability
                </h3>

                <p className="mt-2 max-w-4xl text-sm leading-7 text-stone-600">
                  Event dates, venues, programmes and
                  participation arrangements are subject to
                  confirmation. Registering your interest allows
                  the Tevuah Reserve events team to review your
                  enquiry and provide further details.
                  Submission does not guarantee admission or
                  reserve a place.
                </p>
              </div>
            </div>
          </EventReveal>
        </Container>
      </section>

      {/* WAYS TO ENGAGE */}
      <section className="bg-forest-950 py-16 text-white sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <EventReveal>
              <SectionEyebrow light>Ways to engage</SectionEyebrow>

              <h2 className="font-display mt-6 text-4xl font-medium leading-none tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                Different formats. One informed perspective.
              </h2>

              <p className="mt-6 max-w-lg text-sm leading-8 text-white/60">
                Each event is designed around its subject,
                audience and purpose, providing different
                ways to explore the assets and ideas
                represented across Tevuah Reserve.
              </p>
            </EventReveal>

            <EventStagger className="grid gap-4 sm:grid-cols-2">
              {engagementFormats.map((format) => {
                const Icon = format.icon;

                return (
                  <EventStaggerItem key={format.title}>
                    <article className="h-full rounded-3xl border border-white/10 bg-white/5 p-6 transition-colors duration-300 hover:bg-white/8">
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
                  </EventStaggerItem>
                );
              })}
            </EventStagger>
          </div>
        </Container>
      </section>

      {/* PARTICIPATION PROCESS */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <EventReveal className="max-w-4xl">
            <SectionEyebrow>Participation</SectionEyebrow>

            <h2 className="font-display mt-6 text-4xl font-medium leading-none tracking-[-0.035em] text-forest-950 sm:text-5xl">
              From discovery to participation.
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-8 text-stone-600">
              Explore an event, review its programme and
              submit your interest. Our events team can
              then provide information about availability,
              participation arrangements and next steps.
            </p>
          </EventReveal>

          <EventStagger className="mt-12 grid gap-6 md:grid-cols-3">
            {participationSteps.map((step) => (
              <EventStaggerItem key={step.number}>
                <article className="h-full rounded-3xl border border-forest-900/10 bg-ivory-50 p-7 sm:p-8">
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
              </EventStaggerItem>
            ))}
          </EventStagger>
        </Container>
      </section>

      {/* EVENT PRINCIPLES */}
      <section className="border-y border-forest-900/10 bg-ivory-100 py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
            <EventReveal>
              <SectionEyebrow>
                Informed participation
              </SectionEyebrow>

              <h2 className="font-display mt-6 text-4xl font-medium leading-none tracking-[-0.035em] text-forest-950 sm:text-5xl">
                Engagement begins with clear expectations.
              </h2>

              <p className="mt-6 text-sm leading-8 text-stone-600">
                Tevuah Reserve events are designed to
                encourage informed discussion, industry
                understanding and meaningful engagement.
                They do not constitute investment advice,
                an offer to invest or a guarantee of access
                to any investment opportunity.
              </p>

              <Link
                href="/risk-disclosure"
                className="focus-ring mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-forest-950 transition hover:text-gold-700"
              >
                Review risk disclosures
                <ChevronRight className="size-4" />
              </Link>
            </EventReveal>

            <EventStagger className="grid gap-4 sm:grid-cols-2">
              {eventPrinciples.map((principle) => {
                const Icon = principle.icon;

                return (
                  <EventStaggerItem key={principle.title}>
                    <article className="h-full rounded-3xl border border-forest-900/10 bg-white p-6">
                      <Icon className="size-6 text-gold-600" />

                      <h3 className="mt-5 text-base font-semibold text-forest-950">
                        {principle.title}
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-stone-600">
                        {principle.description}
                      </p>
                    </article>
                  </EventStaggerItem>
                );
              })}
            </EventStagger>
          </div>
        </Container>
      </section>

      {/* FINAL CTA */}
      <section className="bg-burgundy-900 py-16 text-white sm:py-20 lg:py-24">
        <Container>
          <EventReveal className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <SectionEyebrow light>Stay connected</SectionEyebrow>

              <h2 className="font-display mt-6 max-w-4xl text-4xl font-medium leading-none tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                Continue exploring beyond the event.
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-8 text-white/65">
                Discover Tevuah Reserve&apos;s investment
                opportunities, explore our insights or
                contact our team to enquire about upcoming
                events and future experiences.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Button href="/contact" size="lg">
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
          </EventReveal>
        </Container>
      </section>
    </main>
  );
}