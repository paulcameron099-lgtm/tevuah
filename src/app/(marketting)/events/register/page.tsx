import type { Metadata } from "next";

import { notFound } from "next/navigation";

import {
  EventRegistrationForm,
} from "@/src/components/events/event-registration-form";

import {
  getEvent,
} from "@/src/data/event";

export const metadata: Metadata = {
  title: "Register your interest | Tevuah Reserve Events",
  description:
    "Submit an event registration enquiry to Tevuah Reserve.",
};

type PageProps = {
  searchParams: Promise<{
    event?: string;
  }>;
};

export default async function EventRegistrationPage({
  searchParams,
}: PageProps) {
  const { event: slug } = await searchParams;

  const event = slug ? getEvent(slug) : undefined;

  if (!event) {
    notFound();
  }

  return <EventRegistrationForm event={event} />;
}