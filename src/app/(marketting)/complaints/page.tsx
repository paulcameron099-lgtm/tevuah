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
      "Tevuah Reserve provides a channel for prospective and existing investors to raise concerns about the website, investor access, onboarding, investment administration, communications and related services.",
      "Complaints are considered with regard to the information available, the circumstances of the matter and the relevant contractual, operational and legal requirements.",
      "The process supports the review of service issues, the correction of errors where appropriate and the identification of improvements to investor services.",
      "Where an investment agreement, service arrangement or applicable law establishes a specific complaints or dispute-resolution procedure, that procedure also applies.",
    ],
  },
  {
    id: "what-you-can-raise",
    number: "02",
    title: "What you can raise",
    paragraphs: [
      "You may contact Tevuah Reserve if you are dissatisfied with a service, decision, communication or administrative process connected with your interaction with the platform. Matters may include:",
    ],
    points: [
      "Investor enquiries or communications that have not been handled appropriately.",
      "Investor onboarding, account access or verification concerns.",
      "Problems accessing investment information or documents.",
      "Subscription or investment administration.",
      "Funding instructions or payment administration.",
      "Joint-investment invitations, member consent or administrative matters.",
      "Investor statements, distributions or portfolio records.",
      "Privacy, account security or personal information.",
      "Information presented through the website or investor platform.",
      "Conduct, service quality or another matter connected with your relationship with Tevuah Reserve.",
    ],
  },
  {
    id: "before-submitting",
    number: "03",
    title: "Before submitting a complaint",
    paragraphs: [
      "Some matters can be resolved through an ordinary investor enquiry. ",
      "If you need information, clarification or assistance, you may contact Tevuah Reserve through the Contact page.",
      "If you are dissatisfied with the service received, believe an error requires investigation or want a matter formally reviewed, clearly identify your communication as a complaint.",
      "Providing a clear description of the issue and the outcome you are seeking helps distinguish a formal complaint from a general request for assistance.",
    ],
  },
  {
    id: "how-to-submit",
    number: "04",
    title: "How to submit a complaint",
    paragraphs: [
      "Submit your complaint through the Tevuah Reserve Contact page. Clearly state that your message is a complaint and provide sufficient information to identify the matter.",
      "If you are an existing investor, include relevant account, opportunity, investment or transaction references where applicable. Do not include passwords, authentication codes or other sensitive credentials.",
      "Supporting documents may be provided where relevant to understanding the issue. If further information is needed, Tevuah Reserve may contact you through the contact details supplied.",
    ],
  },
  {
    id: "information-to-include",
    number: "05",
    title: "Information to include",
    paragraphs: [
      "Clear and relevant information helps Tevuah Reserve understand the concern and assess the appropriate response. When submitting a complaint, include:",
    ],
    points: [
      "Your name and appropriate contact information.",
      "A clear description of the issue.",
      "The relevant investment or opportunity, where applicable.",
      "Relevant dates and a sequence of events.",
      "Transaction, subscription or other reference information, where applicable.",
      "Copies or descriptions of relevant communications and documents.",
      "The outcome or resolution you are seeking, where appropriate.",
    ],
  },
  {
    id: "acknowledgement",
    number: "06",
    title: "Acknowledgement",
    paragraphs: [
      "Tevuah Reserve reviews incoming complaints and identifies the information required to address each matter.",
      "Where additional information is needed, you may be contacted to clarify the concern or provide relevant supporting material.",
      "Any acknowledgement or subsequent communication should identify the complaint where possible and explain the applicable next steps. Acknowledgement of a complaint does not, by itself, mean that its allegations have been accepted or that a particular outcome has been determined.",
    ],
  },
  {
    id: "review",
    number: "07",
    title: "Review and investigation",
    paragraphs: [
      "The review depends on the nature and complexity of the complaint. Relevant material may include account records, investment documents, correspondence, transaction information, system records and other evidence connected with the matter.",
      "Where appropriate, the review may involve the relevant administrative, investment, technical, compliance or other responsible personnel.",
      "The objective is to understand the circumstances, consider the available evidence and determine an appropriate response in light of the applicable agreements, policies and legal requirements.",
    ],
  },
  {
    id: "additional-information",
    number: "08",
    title: "Requests for additional information",
    paragraphs: [
      "Tevuah Reserve may request additional information where the material provided is insufficient to understand or investigate the complaint.",
      "For matters involving account access, investment records or confidential information, reasonable identity and authority checks may be necessary before information is disclosed or account-related action is taken.",
      "Providing requested information promptly can help avoid unnecessary delays. Any information supplied should be relevant to the matter being reviewed.",
    ],
  },
  {
    id: "response",
    number: "09",
    title: "Our response",
    paragraphs: [
      "Following the review, Tevuah Reserve communicates the outcome in a manner appropriate to the circumstances and applicable requirements.",
      "The response may explain the findings, the basis for the decision, any corrective action taken or proposed, and any further steps available to the complainant.",
      "Where a matter cannot be fully resolved, the response may explain what remains outstanding and why.",
      "Submitting a complaint does not guarantee a particular outcome. Decisions are based on the available evidence, relevant agreements and applicable legal and operational requirements.",
    ],
  },
  {
    id: "timing",
    number: "10",
    title: "Timing",
    paragraphs: [
      "Tevuah Reserve aims to handle complaints promptly and without unnecessary delay while allowing sufficient time for a fair and thorough review.",
      "Straightforward matters may be addressed more quickly than complaints involving multiple transactions, third parties, extensive documentation or complex investment arrangements.",
      "Where a review takes longer than expected, appropriate communication about the status of the matter may be provided. Any applicable statutory, regulatory or contractual deadlines take precedence over general processing expectations.",
    ],
  },
  {
    id: "escalation",
    number: "11",
    title: "Internal escalation",
    paragraphs: [
      "Where a complaint remains unresolved or requires further consideration, it may be escalated to an appropriate person or function within Tevuah Reserve.",
      "The escalation process depends on the nature of the issue, the decisions already made and the appropriate level of review.",
      "Material complaints should receive suitable oversight, with appropriate attention to impartiality, conflicts of interest and the separation of responsibilities where necessary.",
      "Where an internal escalation route is available, the relevant steps may be explained in the complaint response or subsequent correspondence.",
    ],
  },
  {
    id: "external",
    number: "12",
    title: "External rights and escalation",
    paragraphs: [
      "Depending on the relevant legal entity, investment structure, contractual terms and applicable jurisdiction, investors may have rights to pursue a dispute, complaint or other remedy through an external body or legal process.",
      "Any available external route depends on the circumstances of the complaint and the laws and agreements governing the relationship.",
      "Where an ombudsman, regulator, tribunal, mediation procedure or other external process applies, the relevant information should be provided through the applicable agreement or complaint correspondence.",
      "Nothing in this policy limits any legal rights or remedies available to an investor under applicable law.",
    ],
  },
  {
    id: "privacy",
    number: "13",
    title: "Privacy and confidentiality",
    paragraphs: [
      "Information submitted in connection with a complaint may include personal information, investment records, financial details and other confidential material.",
      "Such information is handled with appropriate regard for confidentiality, security and applicable data-protection requirements. Access and use should be limited to what is reasonably necessary to receive, investigate, administer, escalate and respond to the complaint, or otherwise permitted or required by law.",
      "Further information about the handling of personal information is available in the Tevuah Reserve Privacy Policy.",
    ],
  },
  {
    id: "records",
    number: "14",
    title: "Complaint records",
    paragraphs: [
      "Tevuah Reserve maintains appropriate records of complaints and their handling in accordance with applicable requirements.",
      "Depending on the matter, records may include the original complaint, supporting documents, correspondence, review activity, findings, decisions, responses and corrective actions.",
      "Complaint records are handled with appropriate access controls and retained in accordance with relevant legal, contractual, operational and compliance obligations.",
    ],
  },
  {
    id: "fair-treatment",
    number: "15",
    title: "Fair treatment",
    paragraphs: [
      "Complaints are considered on their substance, the available evidence and the circumstances of the matter.",
      "Raising a genuine concern or requesting a formal review should not, by itself, result in inappropriate adverse treatment.",
      "This principle does not prevent appropriate action in response to fraud, threats, abusive conduct, security risks, misuse of the platform or other misconduct. Any such action should be considered separately and handled in accordance with applicable requirements.",
    ],
  },
  {
    id: "urgent-security",
    number: "16",
    title: "Urgent account or payment concerns",
    paragraphs: [
      "Suspected account compromise, unauthorised access, fraudulent communications or unexpected changes to funding instructions may require immediate attention outside the ordinary complaint-review process.",
      "If you suspect that your account has been compromised or receive suspicious payment instructions, contact Tevuah Reserve promptly through a trusted contact channel.",
      "Do not make a payment solely on the basis of unexpected instructions received by email, messaging services or another unverified channel. Verify payment instructions independently before acting.",
      "Do not share passwords, authentication codes or other credentials when reporting an urgent concern.",
    ],
  },
  {
    id: "contact",
    number: "17",
    title: "Contact Tevuah Reserve",
    paragraphs: [
      "Use the Tevuah Reserve Contact page to submit a complaint, request assistance or ask about the appropriate process for raising a concern.",
      "Clearly identify your message as a complaint and include the relevant facts, dates, references and supporting information available to you.",
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
            src="/images/hero/complaint-page-hero.jpeg"
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
                A clear process for raising concerns about investor access, onboarding, investment administration, communications and services provided by Tevuah Reserve.
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
                  Concerns should have a clear route to review.
                </h2>

                <p className="mt-6 max-w-4xl text-sm leading-7 text-stone-700 sm:text-base sm:leading-8">
                  If something has not worked as expected, tell us what happened and provide the information needed to understand the matter. Formal complaints are handled through an appropriate review process, with attention to the facts, relevant records and circumstances.
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
                  Clear, fair and appropriately documented.
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: UserCheck,
                    title: "Fair review",
                    text: "Consider the substance of the concern and the available evidence.",
                  },
                  {
                    icon: Search,
                    title: "Appropriate investigation",
                    text: "Review relevant records and obtain further information where necessary.",
                  },
                  {
                    icon: FileText,
                    title: "Clear records",
                    text: "Maintain appropriate records of complaints, findings and actions taken.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Responsible handling",
                    text: "Protect sensitive investor and complaint information throughout the process.",
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
                text: "Record the complaint and gather the information needed for review.",
              },
              {
                number: "03",
                title: "Review",
                text: "Consider the relevant records, circumstances and supporting evidence.",
              },
              {
                number: "04",
                title: "Respond",
                text: "Communicate the outcome and explain any appropriate next steps.",
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
                  Do not wait for the ordinary complaint-review process if you believe your account has been compromised or receive unexpected payment instructions.
                </p>

                <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
                  {[
                    "Do not disclose passwords or authentication credentials.",
                    "Do not rely solely on unexpected funding instructions received by email or messaging services.",
                    "Verify suspicious communications through a trusted Tevuah Reserve contact route.",
                    "Provide sufficient information to identify the issue without unnecessarily sharing sensitive credentials.",
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
                  Use the Contact page and clearly identify your message as a complaint. Include the relevant facts, references and supporting information available to you.
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