import type { Metadata } from "next";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  MapPin,
} from "lucide-react";

import { Container } from "@/src/components/ui/container";
import { events, getEvent } from "@/src/data/event";

import {
  EventHeroReveal,
  EventReveal,
  EventStagger,
  EventStaggerItem,
} from "@/src/components/events/event-motion";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return events.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = getEvent(slug);

  return event
    ? {
        title: `${event.title} | Tevuah Reserve Events`,
        description: event.summary,
      }
    : {
        title: "Event not found",
      };
}

export default async function EventDetailPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const event = getEvent(slug);

  if (!event) {
    notFound();
  }

  const registerHref =
    `/events/register?event=${encodeURIComponent(event.slug)}`;

  return (
    <main className="bg-ivory-100">
      {/* HERO */}

      <section className="relative flex min-h-150 items-end overflow-hidden bg-forest-950 pt-22 text-white lg:min-h-175">
        <Image
          src={event.image}
          alt={event.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-linear-to-r from-forest-950 via-forest-950/90 to-forest-950/35" />
        <div className="absolute inset-0 bg-linear-to-t from-forest-950/85 to-transparent" />

        <Container className="relative z-10 pb-16 pt-26 lg:pb-20">
          <EventHeroReveal>
            <Link
              href="/events"
              className="focus-ring inline-flex items-center gap-2 text-sm text-white/75 transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4" />
              All events
            </Link>
          </EventHeroReveal>

          <EventHeroReveal delay={0.1}>
            <p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
              Tevuah Reserve Events
            </p>

            <p className="mt-4 text-sm font-semibold text-white/80">
              {event.eyebrow}
            </p>

            <h1 className="font-display mt-5 max-w-5xl text-balance text-5xl font-medium leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              {event.title}
            </h1>
          </EventHeroReveal>

          <EventHeroReveal delay={0.22}>
            <p className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/80">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4 text-gold-400" />
                {event.date}
              </span>

              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4 text-gold-400" />
                {event.location}
              </span>
            </p>

            <p className="mt-7 max-w-3xl text-base leading-8 text-white/70">
              {event.summary}
            </p>

            <Link
              href={registerHref}
              className="focus-ring mt-9 inline-flex min-h-12 items-center gap-2 rounded-full bg-gold-500 px-7 text-sm font-semibold text-forest-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-400 hover:shadow-lg motion-reduce:transform-none"
            >
              Register your interest
              <ArrowUpRight className="size-4" />
            </Link>
          </EventHeroReveal>

          <EventStagger className="mt-14 grid gap-5 border-t border-white/15 pt-7 sm:grid-cols-3">
            {event.highlights.map(([label, value]) => (
              <EventStaggerItem key={label}>
                <p className="text-xs uppercase tracking-[0.17em] text-gold-400">
                  {label}
                </p>

                <p className="mt-2 text-sm font-semibold text-white">
                  {value}
                </p>
              </EventStaggerItem>
            ))}
          </EventStagger>
        </Container>
      </section>

      {/* ABOUT THE EVENT */}

      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <EventReveal>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                About the event
              </p>
            </EventReveal>

            <EventReveal delay={0.08}>
              <h2 className="font-display text-4xl font-medium leading-none tracking-[-0.035em] text-forest-950 sm:text-5xl">
                {event.aboutHeading}
              </h2>

              {event.about.map((paragraph, index) => (
                <p
                  key={index}
                  className="mt-6 text-base leading-8 text-stone-700"
                >
                  {paragraph}
                </p>
              ))}
            </EventReveal>
          </div>
        </Container>
      </section>

      {/* SESSION TOPICS */}

      <section className="border-y border-forest-900/10 bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <EventReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
              What the session explores
            </p>

            <h2 className="font-display mt-5 max-w-4xl text-4xl font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
              {event.sessionHeading}
            </h2>
          </EventReveal>

          <EventStagger className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {event.sessions.map((session, index) => (
              <EventStaggerItem key={session.title}>
                <article className="h-full rounded-3xl border border-forest-900/10 bg-ivory-50 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-gold-600/30 hover:shadow-[0_18px_50px_rgba(10,23,18,0.07)] motion-reduce:transform-none">
                  <p className="font-display text-4xl text-gold-600">
                    {String(index + 1).padStart(2, "0")}
                  </p>

                  <h3 className="font-display mt-6 text-2xl font-medium text-forest-950">
                    {session.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-stone-600">
                    {session.description}
                  </p>
                </article>
              </EventStaggerItem>
            ))}
          </EventStagger>
        </Container>
      </section>

      {/* THE EXPERIENCE */}

      <section className="bg-forest-950 py-16 text-white sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <EventReveal>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                The experience
              </p>
            </EventReveal>

            <EventReveal delay={0.08}>
              <h2 className="font-display text-4xl font-medium tracking-[-0.035em] sm:text-5xl">
                {event.experienceHeading}
              </h2>

              {event.experience.map((paragraph, index) => (
                <p
                  key={index}
                  className="mt-6 text-base leading-8 text-white/70"
                >
                  {paragraph}
                </p>
              ))}
            </EventReveal>
          </div>
        </Container>
      </section>

      {/* EVENT DETAILS AND REGISTRATION */}

      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-20">
            <EventReveal>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Event details
              </p>

              <h2 className="font-display mt-5 text-4xl font-medium text-forest-950 sm:text-5xl">
                At a glance.
              </h2>

              <dl className="mt-8 divide-y divide-forest-900/10 rounded-3xl border border-forest-900/10 bg-ivory-50 px-6">
                {[
                  ["Date", event.date],
                  ["Location", event.location],
                  ["Format", event.format],
                  ["Focus", event.category],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="grid gap-2 py-5 sm:grid-cols-[7rem_1fr]"
                  >
                    <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                      {label}
                    </dt>

                    <dd className="text-sm font-semibold text-forest-950">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </EventReveal>

            <EventReveal
              delay={0.1}
              className="flex flex-col justify-center rounded-4xl bg-ivory-100 p-8 sm:p-12"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Registration
              </p>

              <h2 className="font-display mt-5 text-3xl font-medium text-forest-950 sm:text-4xl">
                {event.registrationHeading}
              </h2>

              <p className="mt-5 text-sm leading-8 text-stone-600">
                {event.registrationText}
              </p>

              <Link
                href={registerHref}
                className="focus-ring mt-8 inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-800 motion-reduce:transform-none"
              >
                Register your interest
                <ArrowUpRight className="size-4" />
              </Link>
            </EventReveal>
          </div>
        </Container>
      </section>

      {/* RISK / CONSIDERATIONS */}

      <section className="border-t border-forest-900/10 bg-ivory-100 py-12">
        <Container>
          <EventReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
              {event.disclosureHeading}
            </p>

            <p className="mt-4 max-w-4xl text-sm leading-7 text-stone-600">
              {event.disclosure}
            </p>
          </EventReveal>
        </Container>
      </section>
    </main>
  );
}