import type { Metadata } from "next";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowDown,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  LockKeyhole,
  Mail,
  MessageSquareText,
  Search,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import {
  ComplaintsHeroImage,
  ComplaintsHeroLine,
  ComplaintsHeroOverlay,
  ComplaintsHeroReveal,
  ComplaintsReveal,
  ComplaintsRevealSoft,
} from "@/src/components/complaints/complaints-motion";

import {
  Button,
} from "@/src/components/ui/button";

import {
  Container,
} from "@/src/components/ui/container";

export const metadata: Metadata = {
  title: "Complaints",
  description:
    "Information about raising a complaint or concern with Tevuah Reserve and how complaints are reviewed and handled.",
};

type ComplaintSection = {
  id: string;
  number: string;
  title: string;
  paragraphs?: string[];
  points?: string[];
};

const complaintSections: ComplaintSection[] = [
  {
    id: "purpose",
    number: "01",
    title: "Purpose of this process",
    paragraphs: [
      "Tevuah Reserve aims to provide prospective and existing investors with a clear route for raising concerns about the website, investor access, onboarding, investment administration, communications and related services.",
      "A complaint should be considered carefully, fairly and objectively. Raising a concern should also provide Tevuah Reserve with an opportunity to identify operational issues, correct errors where appropriate and improve the investor experience.",
      "This page describes the general Tevuah Reserve complaints process. Additional procedures may apply where a particular investment agreement, service provider or applicable law establishes a specific dispute or complaint process.",
    ],
  },
  {
    id: "what-you-can-raise",
    number: "02",
    title: "What you can raise",
    paragraphs: [
      "You may contact Tevuah Reserve if you are dissatisfied with a service, decision, communication or administrative process connected with your interaction with the platform.",
    ],
    points: [
      "Investor enquiries or communications that have not been handled appropriately.",
      "Investor onboarding, account access or verification concerns.",
      "Problems accessing investment information or documents.",
      "Questions or concerns about subscription or investment administration.",
      "Funding-instruction or payment-administration concerns.",
      "Joint-investment invitations, member consent or administrative issues.",
      "Investor statements, distributions or portfolio-record concerns.",
      "Privacy, account-security or personal-information concerns.",
      "Concerns about information presented through the website or investor platform.",
      "Conduct, service quality or another matter connected with your relationship with Tevuah Reserve.",
    ],
  },
  {
    id: "before-submitting",
    number: "03",
    title: "Before submitting a complaint",
    paragraphs: [
      "Some matters can be resolved quickly as an ordinary investor enquiry. If you are simply seeking information, clarification or assistance, you may use the Contact page without treating the matter as a formal complaint.",
      "If you are dissatisfied with what occurred, believe an error requires investigation, or want the matter formally reviewed, make that clear in your communication so that it can be treated appropriately.",
    ],
  },
  {
    id: "how-to-submit",
    number: "04",
    title: "How to submit a complaint",
    paragraphs: [
      "You may submit a complaint through the Tevuah Reserve Contact page. Clearly state that your message is a complaint and provide enough information for the matter to be identified and reviewed.",
      "If you are an existing investor, provide sufficient information to identify the relevant account, opportunity, investment or transaction without including passwords, authentication credentials or other information that is unnecessary for the complaint.",
      "Supporting documents may be requested where they are relevant to understanding or resolving the matter.",
    ],
  },
  {
    id: "information-to-include",
    number: "05",
    title: "Information to include",
    paragraphs: [
      "Providing clear and relevant information can help Tevuah Reserve understand the concern and avoid unnecessary delays in reviewing it.",
    ],
    points: [
      "Your name and appropriate contact information.",
      "A clear description of the issue or concern.",
      "The relevant investment or opportunity, where applicable.",
      "Relevant dates or sequence of events.",
      "Any transaction, subscription or other reference information that helps identify the matter.",
      "Copies or descriptions of relevant communications or documents.",
      "The outcome or resolution you are seeking, where appropriate.",
    ],
  },
  {
    id: "acknowledgement",
    number: "06",
    title: "Acknowledgement",
    paragraphs: [
      "Tevuah Reserve should acknowledge a formal complaint after it has been received and identified as a complaint.",
      "The acknowledgement may confirm that the matter has been received, identify any additional information required and explain the next stage of the review.",
      "A fixed acknowledgement period is not stated on this page because any formal service standard should be aligned with the company's final operating and regulatory requirements before it is presented as a commitment to investors.",
    ],
  },
  {
    id: "review",
    number: "07",
    title: "Review and investigation",
    paragraphs: [
      "The nature of the review will depend on the complaint. Tevuah Reserve may examine account records, investment records, documents, communications, transaction information, system records and other material relevant to the matter.",
      "Where appropriate, the review may involve members of the administrative, investment, technical, compliance or other relevant functions.",
      "The review should be conducted objectively and with appropriate regard for the information provided by the complainant and the records available to Tevuah Reserve.",
    ],
  },
  {
    id: "additional-information",
    number: "08",
    title: "Requests for additional information",
    paragraphs: [
      "Tevuah Reserve may contact you for additional information where the available material is insufficient to understand or investigate the complaint.",
      "Where a complaint concerns account or investment information, reasonable steps may also be taken to verify the identity or authority of the person making the request before sensitive information is disclosed.",
    ],
  },
  {
    id: "response",
    number: "09",
    title: "Our response",
    paragraphs: [
      "After the complaint has been sufficiently reviewed, Tevuah Reserve should communicate the outcome in a manner appropriate to the circumstances.",
      "The response may explain the findings, any action taken or proposed, whether further information is required and any internal next step that is available.",
      "A particular outcome cannot be guaranteed merely because a complaint has been submitted. The response should reflect the available evidence, applicable agreements and relevant legal or operational requirements.",
    ],
  },
  {
    id: "timing",
    number: "10",
    title: "Timing",
    paragraphs: [
      "Tevuah Reserve should seek to handle complaints without unnecessary delay while allowing sufficient time for a fair review.",
      "Some complaints may be resolved relatively quickly, while matters involving multiple records, counterparties, technical investigation or complex investment issues may require more time.",
      "This page does not publish a fixed statutory or regulatory resolution period because Tevuah Reserve's final regulatory status and applicable complaint-handling requirements have not been established.",
    ],
  },
  {
    id: "escalation",
    number: "11",
    title: "Internal escalation",
    paragraphs: [
      "If a complaint cannot be resolved at the initial review stage, it may be escalated internally to an appropriate person or function for further consideration.",
      "The appropriate escalation route will depend on the nature of the complaint and the company's final governance and compliance structure.",
      "Tevuah Reserve should maintain sufficient separation or oversight where necessary to support an objective review of material complaints.",
    ],
  },
  {
    id: "external",
    number: "12",
    title: "External rights and escalation",
    paragraphs: [
      "Depending on the legal entity involved, the investment structure, the investor's jurisdiction and the regulatory framework applicable to the matter, an investor may have rights to pursue a complaint, dispute or other remedy outside Tevuah Reserve.",
      "This page does not identify Tevuah Reserve as supervised by a particular regulator and does not direct investors to a particular ombudsman, tribunal or regulator unless that route is confirmed to apply.",
      "Where a specific external complaint or dispute route applies, the relevant information should be provided in the applicable agreement, final complaint response or other appropriate communication.",
    ],
  },
  {
    id: "privacy",
    number: "13",
    title: "Privacy and confidentiality",
    paragraphs: [
      "Information provided in connection with a complaint may include personal, investment or other sensitive information.",
      "Complaint information should be accessed and used only where reasonably necessary to receive, investigate, administer, escalate or respond to the matter, or where disclosure is otherwise required or permitted by applicable law.",
      "Further information about the handling of personal information is available in the Tevuah Reserve Privacy Policy.",
    ],
  },
  {
    id: "records",
    number: "14",
    title: "Complaint records",
    paragraphs: [
      "Tevuah Reserve should maintain appropriate records of formal complaints and their handling.",
      "Depending on the matter, records may include the complaint, supporting information, relevant correspondence, review activity, findings, decisions, responses and any corrective action.",
      "Retention should reflect applicable legal, contractual, operational and compliance requirements rather than an arbitrary period stated before those requirements are confirmed.",
    ],
  },
  {
    id: "fair-treatment",
    number: "15",
    title: "Fair treatment",
    paragraphs: [
      "Complaints should be considered on their substance and available evidence.",
      "A person should not receive inappropriate adverse treatment merely because they have raised a genuine complaint or requested that a concern be reviewed.",
      "This principle does not prevent Tevuah Reserve from taking appropriate action where platform misuse, fraud, abusive conduct, security threats or other misconduct is identified.",
    ],
  },
  {
    id: "urgent-security",
    number: "16",
    title: "Urgent account or payment concerns",
    paragraphs: [
      "A suspected account compromise, unauthorised access, fraudulent communication or unexpected change to funding instructions should not be treated as an ordinary service complaint where immediate protective action may be required.",
      "Contact Tevuah Reserve promptly through a trusted contact route and do not make a payment solely on the basis of unexpected instructions received by email, messaging services or another unverified channel.",
    ],
  },
  {
    id: "contact",
    number: "17",
    title: "Contact Tevuah Reserve",
    paragraphs: [
      "You can use the Tevuah Reserve Contact page to raise a complaint, request assistance or ask how a concern should be handled.",
      "When submitting a formal complaint, clearly identify it as a complaint and provide the relevant facts and supporting information available to you.",
    ],
  },
];

const navigation = [
  ["#what-you-can-raise", "What you can raise"],
  ["#how-to-submit", "Submit"],
  ["#information-to-include", "Information"],
  ["#review", "Review"],
  ["#response", "Response"],
  ["#timing", "Timing"],
  ["#escalation", "Escalation"],
  ["#privacy", "Privacy"],
] as const;

export default function ComplaintsPage() {
  return (
    <main className="bg-ivory-100">
      {/* ==========================================
          HERO
      ========================================== */}

      <section className="relative flex min-h-145 items-end overflow-hidden bg-forest-950 pt-19 text-white lg:pt-22">
        <ComplaintsHeroImage className="absolute inset-0">
          <Image
            src="/images/hero/estates-page-hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </ComplaintsHeroImage>

        <ComplaintsHeroOverlay
          className="absolute inset-0 bg-linear-to-r from-forest-950 via-forest-950/94 to-forest-950/45"
          delay={0.04}
        />

        <ComplaintsHeroOverlay
          className="absolute inset-0 bg-linear-to-t from-forest-950/95 via-forest-950/25 to-forest-950/25"
          delay={0.1}
        />

        <Container className="relative z-10 pb-14 pt-24 sm:pb-18 lg:pb-20">
          <div className="max-w-5xl">
            <ComplaintsHeroReveal delay={0.1}>
              <div className="flex items-center gap-3">
                <ComplaintsHeroLine className="h-px w-10 origin-left bg-gold-400" />

                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
                  Investor support
                </p>
              </div>
            </ComplaintsHeroReveal>

            <ComplaintsHeroReveal delay={0.2}>
              <h1 className="font-display mt-7 text-5xl leading-[0.94] font-medium tracking-[-0.045em] sm:text-6xl lg:text-8xl">
                Complaints
              </h1>
            </ComplaintsHeroReveal>

            <ComplaintsHeroReveal delay={0.31}>
              <p className="mt-7 max-w-3xl text-base leading-8 text-white/65 sm:text-lg">
                A clear process for raising
                concerns about investor access,
                onboarding, investment
                administration, communications
                and related Tevuah Reserve
                services.
              </p>
            </ComplaintsHeroReveal>

            <ComplaintsHeroReveal
              delay={0.41}
              className="mt-10 sm:mt-12"
            >
              <Button
                href="#complaints-introduction"
                size="lg"
              >
                Understand the process

                <ArrowDown className="size-4" />
              </Button>
            </ComplaintsHeroReveal>
          </div>
        </Container>
      </section>

      {/* ==========================================
          INTRODUCTION
      ========================================== */}

      <section
        id="complaints-introduction"
        className="scroll-mt-28 border-b border-forest-900/10 bg-white py-16 sm:py-20 lg:py-24"
      >
        <Container>
          <ComplaintsReveal>
            <div className="grid gap-8 rounded-4xl border border-forest-900/10 bg-ivory-100 p-7 sm:p-10 lg:grid-cols-[auto_1fr] lg:gap-10 lg:p-12">
              <span className="flex size-14 items-center justify-center rounded-full bg-forest-950 text-gold-400">
                <MessageSquareText className="size-6" />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Raising a concern
                </p>

                <h2 className="font-display mt-4 max-w-4xl text-3xl font-medium tracking-[-0.03em] text-forest-950 sm:text-4xl">
                  Concerns should have a clear
                  route to review.
                </h2>

                <p className="mt-6 max-w-4xl text-sm leading-7 text-stone-700 sm:text-base sm:leading-8">
                  If something has not worked as
                  expected, tell us what happened
                  and provide the information
                  needed to understand the matter.
                  A formal complaint should be
                  identified, recorded and
                  reviewed appropriately.
                </p>
              </div>
            </div>
          </ComplaintsReveal>
        </Container>
      </section>

      {/* ==========================================
          PRINCIPLES
      ========================================== */}

      <section className="border-b border-forest-900/10 py-16 sm:py-20 lg:py-24">
        <Container>
          <ComplaintsReveal>
            <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Our approach
                </p>

                <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                  Clear, fair and appropriately
                  documented.
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: UserCheck,
                    title: "Fair review",
                    text: "Consider the substance of the concern and the information available.",
                  },
                  {
                    icon: Search,
                    title: "Appropriate investigation",
                    text: "Review relevant records and request further information where necessary.",
                  },
                  {
                    icon: FileText,
                    title: "Clear records",
                    text: "Maintain an appropriate record of formal complaints and their handling.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Responsible handling",
                    text: "Protect sensitive investor and complaint information during the process.",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <ComplaintsRevealSoft
                      key={item.title}
                    >
                      <article className="h-full rounded-2xl border border-forest-900/10 bg-white p-6">
                        <span className="flex size-10 items-center justify-center rounded-full bg-forest-950 text-gold-400">
                          <Icon className="size-4" />
                        </span>

                        <h3 className="font-display mt-5 text-2xl font-medium text-forest-950">
                          {item.title}
                        </h3>

                        <p className="mt-3 text-sm leading-7 text-stone-600">
                          {item.text}
                        </p>
                      </article>
                    </ComplaintsRevealSoft>
                  );
                })}
              </div>
            </div>
          </ComplaintsReveal>
        </Container>
      </section>

      {/* ==========================================
          PROCESS OVERVIEW
      ========================================== */}

      <section className="border-b border-forest-900/10 bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <ComplaintsReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
              Complaint journey
            </p>

            <h2 className="font-display mt-5 max-w-4xl text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
              From concern to considered response.
            </h2>
          </ComplaintsReveal>

          <div className="mt-10 grid gap-4 lg:grid-cols-4">
            {[
              {
                number: "01",
                title: "Raise",
                text: "Tell us what happened and clearly identify the matter as a complaint.",
              },
              {
                number: "02",
                title: "Record",
                text: "The complaint is identified and relevant information is gathered.",
              },
              {
                number: "03",
                title: "Review",
                text: "Relevant records, circumstances and supporting information are considered.",
              },
              {
                number: "04",
                title: "Respond",
                text: "The outcome and any appropriate next steps are communicated.",
              },
            ].map((item) => (
              <ComplaintsRevealSoft
                key={item.number}
              >
                <article className="h-full rounded-3xl border border-forest-900/10 bg-ivory-100 p-6">
                  <span className="font-display text-xl text-gold-600">
                    {item.number}
                  </span>

                  <h3 className="font-display mt-7 text-2xl font-medium text-forest-950">
                    {item.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-stone-600">
                    {item.text}
                  </p>
                </article>
              </ComplaintsRevealSoft>
            ))}
          </div>
        </Container>
      </section>

      {/* ==========================================
          NAVIGATION
      ========================================== */}

      <section className="sticky top-0 z-20 border-b border-forest-900/10 bg-white/95 py-4 backdrop-blur-xl">
        <Container>
          <ComplaintsRevealSoft>
            <nav
              aria-label="Complaints sections"
              className="flex gap-2 overflow-x-auto pb-1"
            >
              {navigation.map(
                ([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    className="focus-ring shrink-0 rounded-full border border-forest-900/10 bg-ivory-100 px-4 py-2 text-xs font-semibold text-forest-950 transition hover:border-gold-500/40 hover:bg-white"
                  >
                    {label}
                  </Link>
                ),
              )}
            </nav>
          </ComplaintsRevealSoft>
        </Container>
      </section>

      {/* ==========================================
          COMPLAINT SECTIONS
      ========================================== */}

      <section className="bg-white">
        <Container>
          <div className="mx-auto max-w-6xl">
            {complaintSections.map(
              (section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-32 border-b border-forest-900/10 py-14 last:border-b-0 sm:py-16 lg:py-20"
                >
                  <div className="grid gap-7 lg:grid-cols-[0.55fr_1.45fr] lg:gap-20">
                    <ComplaintsReveal>
                      <div className="lg:sticky lg:top-28 lg:self-start">
                        <p className="font-display text-2xl text-gold-600">
                          {section.number}
                        </p>

                        <h2 className="font-display mt-4 max-w-sm text-3xl leading-[1.05] font-medium tracking-[-0.03em] text-forest-950">
                          {section.title}
                        </h2>
                      </div>
                    </ComplaintsReveal>

                    <ComplaintsReveal delay={0.05}>
                      <div className="space-y-5">
                        {section.paragraphs?.map(
                          (paragraph) => (
                            <p
                              key={paragraph}
                              className="text-[15px] leading-8 text-stone-700"
                            >
                              {paragraph}
                            </p>
                          ),
                        )}

                        {section.points ? (
                          <div className="mt-7 grid gap-3">
                            {section.points.map(
                              (point) => (
                                <div
                                  key={point}
                                  className="flex items-start gap-4 rounded-2xl bg-ivory-100 p-4 sm:p-5"
                                >
                                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-600" />

                                  <p className="text-sm leading-7 text-stone-700">
                                    {point}
                                  </p>
                                </div>
                              ),
                            )}
                          </div>
                        ) : null}

                        {section.id ===
                        "privacy" ? (
                          <Link
                            href="/privacy"
                            className="focus-ring mt-7 inline-flex items-center gap-2 text-sm font-semibold text-forest-950 transition hover:text-gold-600"
                          >
                            Read the Privacy Policy

                            <ArrowUpRight className="size-4" />
                          </Link>
                        ) : null}

                        {section.id ===
                        "contact" ? (
                          <Button
                            href="/contact"
                            variant="secondary"
                            className="mt-5"
                          >
                            Contact Tevuah Reserve

                            <ArrowUpRight className="size-4" />
                          </Button>
                        ) : null}
                      </div>
                    </ComplaintsReveal>
                  </div>
                </section>
              ),
            )}
          </div>
        </Container>
      </section>

      {/* ==========================================
          IMPORTANT SECURITY NOTICE
      ========================================== */}

      <section className="bg-forest-950 py-16 text-white sm:py-20 lg:py-24">
        <Container>
          <ComplaintsReveal>
            <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
              <div>
                <LockKeyhole className="size-7 text-gold-400" />

                <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                  Urgent concerns
                </p>

                <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] sm:text-5xl">
                  Security and payment concerns
                  may require immediate action.
                </h2>
              </div>

              <div>
                <p className="max-w-3xl text-base leading-8 text-white/65">
                  Do not wait for the ordinary
                  complaint-review process if you
                  believe your account has been
                  compromised or you receive
                  unexpected payment instructions.
                </p>

                <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
                  {[
                    "Do not disclose passwords or authentication credentials.",
                    "Do not rely solely on unexpected funding instructions received by email or messaging services.",
                    "Use a trusted Tevuah Reserve contact route to verify suspicious communications.",
                    "Provide enough information for the issue to be identified without unnecessarily sharing sensitive credentials.",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex gap-4 py-5"
                    >
                      <CheckCircle2 className="mt-1 size-4 shrink-0 text-gold-400" />

                      <p className="text-sm leading-7 text-white/60">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ComplaintsReveal>
        </Container>
      </section>

      {/* ==========================================
          SUBMIT CTA
      ========================================== */}

      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <ComplaintsReveal>
            <div className="grid gap-10 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-10">
              <span className="flex size-14 items-center justify-center rounded-full bg-forest-950 text-gold-400">
                <Mail className="size-6" />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Raise a concern
                </p>

                <h2 className="font-display mt-4 max-w-3xl text-3xl font-medium tracking-[-0.03em] text-forest-950 sm:text-4xl">
                  Tell us what happened.
                </h2>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
                  Use the Contact page and clearly
                  identify your message as a
                  complaint. Include the relevant
                  facts, references and supporting
                  information available to you.
                </p>
              </div>

              <Button
                href="/contact"
                size="lg"
                className="w-fit"
              >
                Submit a complaint

                <ArrowUpRight className="size-4" />
              </Button>
            </div>
          </ComplaintsReveal>
        </Container>
      </section>

      {/* ==========================================
          RELATED INFORMATION
      ========================================== */}

      <section className="border-t border-forest-900/10 py-16 sm:py-20">
        <Container>
          <ComplaintsReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
              Related information
            </p>

            <h2 className="font-display mt-5 text-4xl font-medium tracking-[-0.035em] text-forest-950">
              Investor information and policies.
            </h2>
          </ComplaintsReveal>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {[
              {
                href: "/terms",
                title: "Terms of Use",
                description:
                  "Terms governing access to and use of the Tevuah Reserve website and investor platform.",
              },
              {
                href: "/privacy",
                title: "Privacy Policy",
                description:
                  "How personal information may be collected, used, protected and handled.",
              },
              {
                href: "/risk-disclosure",
                title: "Risk Disclosure",
                description:
                  "Important information about the risks associated with private investments.",
              },
            ].map((item) => (
              <ComplaintsRevealSoft
                key={item.href}
              >
                <Link
                  href={item.href}
                  className="focus-ring group block h-full rounded-3xl border border-forest-900/10 bg-white p-6 transition duration-300 hover:-translate-y-0.5 hover:border-gold-500/40 hover:shadow-[0_18px_45px_rgba(18,38,30,0.06)]"
                >
                  <h3 className="font-display text-2xl font-medium text-forest-950">
                    {item.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-stone-600">
                    {item.description}
                  </p>

                  <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-forest-950">
                    Read more

                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              </ComplaintsRevealSoft>
            ))}
          </div>
        </Container>
      </section>

      {/* ==========================================
          STATUS NOTE
      ========================================== */}

      <section className="border-t border-forest-900/10 bg-white py-8">
        <Container>
          <ComplaintsRevealSoft>
            <div className="flex flex-col gap-3 text-xs leading-6 text-stone-500 sm:flex-row sm:items-start sm:justify-between">
              <p>Complaints</p>

              <p className="max-w-3xl sm:text-right">
                This page describes Tevuah
                Reserve&apos;s general approach to
                receiving and reviewing
                complaints. Any mandatory
                regulatory timelines, external
                escalation routes or
                jurisdiction-specific procedures
                should be incorporated once the
                applicable legal and regulatory
                framework is confirmed.
              </p>
            </div>
          </ComplaintsRevealSoft>
        </Container>
      </section>
    </main>
  );
}