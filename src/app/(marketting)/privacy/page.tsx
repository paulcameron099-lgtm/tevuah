import type {
  Metadata,
} from "next";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowDown,
  ArrowUpRight,
  Database,
  Eye,
  FileCheck2,
  Fingerprint,
  LockKeyhole,
  Mail,
  Server,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import {
  PrivacyHeroImage,
  PrivacyHeroLine,
  PrivacyHeroOverlay,
  PrivacyHeroReveal,
  PrivacyReveal,
  PrivacyRevealSoft,
} from "@/src/components/privacy/privacy-motion";

import {
  Button,
} from "@/src/components/ui/button";

import {
  Container,
} from "@/src/components/ui/container";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Information about how Tevuah Reserve collects, uses, stores, protects and handles personal information through its website and investor platform.",
};

type PrivacySection = {
  id: string;
  number: string;
  title: string;
  paragraphs?: string[];
  points?: string[];
};

const privacySections: PrivacySection[] = [
  {
    id: "scope",
    number: "01",
    title: "Scope of this Privacy Policy",
    paragraphs: [
      "This Privacy Policy explains how personal information may be collected, used, stored, disclosed and otherwise handled when you interact with the Tevuah Reserve website, submit an investor enquiry, proceed through investor onboarding, access an investor account or use investment-related platform services.",
      "The policy is intended to provide clear information about the principal categories of personal information used within the Tevuah Reserve platform and the purposes for which that information may be required.",
      "Additional privacy information may be provided where a particular investment, service, verification process or third-party provider requires more specific disclosure.",
    ],
  },

  {
    id: "information-collected",
    number: "02",
    title: "Personal information we may collect",
    paragraphs: [
      "The information Tevuah Reserve processes depends on how you interact with the company and platform. A visitor making an initial enquiry will generally provide substantially less information than an approved investor completing verification and investment activity.",
    ],
    points: [
      "Identity information, such as your name and other identifying details.",
      "Contact information, such as your email address, country or jurisdiction and other contact details you provide.",
      "Investor-enquiry information, including investment interests, indicative investment range and messages submitted to Tevuah Reserve.",
      "Account information associated with investor access and authentication.",
      "Identity and verification information supplied during investor onboarding.",
      "Address information and supporting address-verification documentation.",
      "Investment, subscription and commitment records.",
      "Joint-investment membership, invitation, acceptance and consent records where applicable.",
      "Funding, payment-instruction and transaction-related records associated with investments.",
      "Investment documents, acknowledgements, signatures, statements and other investor records.",
      "Communications exchanged with Tevuah Reserve.",
      "Technical and security information generated when the platform is accessed or used.",
    ],
  },

  {
    id: "enquiries",
    number: "03",
    title: "Investor enquiries",
    paragraphs: [
      "When you submit an investor enquiry through the Tevuah Reserve Contact page, the platform may collect information such as your name, email address, country or jurisdiction, primary investment interest, indicative investment range and the content of your message.",
      "This information is used to receive and respond to your enquiry, understand the nature of your interest, communicate with you about the investor process and determine appropriate next steps.",
      "Submitting an enquiry does not automatically create an investor account and does not guarantee investor eligibility, access to an opportunity or acceptance of an investment.",
    ],
  },

  {
    id: "accounts",
    number: "04",
    title: "Investor accounts and authentication",
    paragraphs: [
      "Tevuah Reserve does not provide unrestricted public self-registration for investor accounts. Where a prospective investor proceeds through the applicable process, investor access may be established administratively.",
      "Account-related information may be processed to create and maintain investor access, authenticate users, protect account security, associate platform activity with the appropriate investor and provide access to authorised investment information.",
      "Authentication and account systems may generate technical records necessary to maintain security and investigate suspected unauthorised access.",
    ],
  },

  {
    id: "verification",
    number: "05",
    title: "Identity, KYC and address verification",
    paragraphs: [
      "Investor onboarding may require Tevuah Reserve to collect and process information necessary to verify identity, address and other information relevant to the investor onboarding or compliance process.",
      "Depending on the applicable process, this may include identity numbers, identity-document images, address information, supporting documents and information used to review or verify the investor.",
      "Verification information may be particularly sensitive. Access should therefore be limited to authorised persons and service providers with a legitimate need to use the information for the relevant verification, compliance, security or administrative purpose.",
    ],
  },

  {
    id: "investment-data",
    number: "06",
    title: "Investment and portfolio information",
    paragraphs: [
      "When an investor participates in an opportunity, Tevuah Reserve may process information relating to investment commitments, subscriptions, funding, ownership or economic interests, investment status, portfolio records, statements, documents and distributions.",
      "This information is used to administer investments, maintain investor records, provide platform reporting, support investment workflows and preserve records relating to the investment lifecycle.",
      "Investment records may need to remain associated with an investor after an opportunity closes or an investment is completed where continued recordkeeping is appropriate or required.",
    ],
  },

  {
    id: "joint-investments",
    number: "07",
    title: "Joint-investment information",
    paragraphs: [
      "Where investors participate jointly, Tevuah Reserve may process information relating to each participating member, the joint subscription, ownership or funding allocation, invitations, consent status, acknowledgements and signatures.",
      "Some information relating to a joint investment may necessarily be associated with or visible to other authorised participants in that joint investment where required to administer the shared investment relationship.",
      "Tevuah Reserve should limit such access to information that is appropriate for the joint investment and applicable platform permissions.",
    ],
  },

  {
    id: "documents",
    number: "08",
    title: "Documents, signatures and acknowledgements",
    paragraphs: [
      "The platform may process documents and records associated with onboarding, investment review, agreements, disclosures, acknowledgements, signatures, statements and other investor activity.",
      "Where an electronic acceptance or signature process is used, records may include the relevant document reference or version, signature name, acceptance timestamp and technical information associated with the acceptance process.",
      "These records may be retained where necessary to demonstrate the investment process, preserve transaction history or administer the relevant investor relationship.",
    ],
  },

  {
    id: "technical-data",
    number: "09",
    title: "Technical, device and security information",
    paragraphs: [
      "When you use the website or investor platform, certain technical information may be generated as part of providing and securing the service.",
      "Depending on the relevant platform process, this may include IP address information, browser or user-agent information, authentication events, timestamps, security records, request information and other technical data required for operation, troubleshooting, fraud prevention or security.",
      "Technical information should be used proportionately and in connection with legitimate platform, administrative and security purposes.",
    ],
  },

  {
    id: "purposes",
    number: "10",
    title: "How personal information may be used",
    paragraphs: [
      "Tevuah Reserve may process personal information where necessary to operate the website and investor platform and to administer relationships with prospective and existing investors.",
    ],
    points: [
      "Respond to investor enquiries and communications.",
      "Establish and administer approved investor access.",
      "Authenticate users and protect investor accounts.",
      "Complete identity, address and other applicable verification processes.",
      "Administer investment subscriptions and joint investments.",
      "Provide and manage investment documents and acknowledgements.",
      "Provide applicable funding instructions and maintain transaction records.",
      "Maintain portfolio, statement and distribution records.",
      "Provide investor communications and relevant investment updates.",
      "Operate, maintain and improve platform functionality.",
      "Detect, investigate and prevent suspected fraud, misuse or security incidents.",
      "Maintain records required for operational, contractual, compliance or legal purposes.",
      "Establish, exercise or defend legal rights where necessary.",
    ],
  },

  {
    id: "legal-basis",
    number: "11",
    title: "Basis for processing",
    paragraphs: [
      "The lawful basis or other legal justification for processing personal information depends on the applicable privacy law, the jurisdiction, the type of information and the purpose for which it is processed.",
      "Depending on the circumstances and applicable law, processing may be connected with steps requested by an individual, performance or administration of contractual relationships, compliance with legal obligations, legitimate operational or security interests, consent where appropriate, or another basis recognised by applicable law.",
      "Tevuah Reserve should identify and document the appropriate basis for each material processing activity once the company's legal entity, operating jurisdictions and applicable privacy regimes have been finalised.",
    ],
  },

  {
    id: "sharing",
    number: "12",
    title: "When information may be shared",
    paragraphs: [
      "Personal information should not be disclosed merely because it is held by Tevuah Reserve. Information may, however, need to be shared where another person or organisation has a legitimate role in providing the platform, administering an investment or satisfying an applicable requirement.",
    ],
    points: [
      "Technology, hosting, database and infrastructure providers supporting the platform.",
      "Authentication, communications and email-service providers.",
      "Identity, verification or compliance-service providers where used.",
      "Banks, payment-related providers or financial-service counterparties where relevant to investment funding or administration.",
      "Estate operators, investment administrators, custodians or other parties involved in administering a particular investment where appropriate.",
      "Professional advisers such as legal, accounting or compliance advisers where necessary.",
      "Authorities, regulators, courts or other recipients where disclosure is required or permitted by applicable law.",
      "Other parties involved in a corporate transaction, restructuring or transfer, subject to appropriate confidentiality and legal requirements.",
    ],
  },

  {
    id: "providers",
    number: "13",
    title: "Service providers and infrastructure",
    paragraphs: [
      "Tevuah Reserve relies on technology and service providers to operate parts of its digital infrastructure. Such providers may process personal information on behalf of Tevuah Reserve or, depending on the service and circumstances, under their own applicable responsibilities.",
      "Access by service providers should be limited to what is reasonably necessary for the relevant service and should be subject to appropriate contractual, confidentiality, security and data-protection requirements where required.",
      "The categories of service providers used by the platform may change as infrastructure and operational requirements develop.",
    ],
  },

  {
    id: "international",
    number: "14",
    title: "International processing and transfers",
    paragraphs: [
      "Digital services may involve infrastructure, service providers or recipients located in more than one country. As a result, personal information may in some circumstances be processed outside the country in which an investor is located.",
      "Where applicable privacy law imposes requirements on international transfers of personal information, Tevuah Reserve should use the transfer mechanism or safeguard required for the relevant processing arrangement.",
      "The specific international-transfer framework applicable to Tevuah Reserve should be confirmed after the company's operating jurisdictions, infrastructure arrangements and applicable privacy laws have been established.",
    ],
  },

  {
    id: "retention",
    number: "15",
    title: "How long information is retained",
    paragraphs: [
      "Tevuah Reserve should retain personal information only for as long as reasonably necessary for the purpose for which it was collected or for another legitimate purpose permitted or required by applicable law.",
      "Different categories of information may require different retention periods. Relevant considerations may include the duration of the investor relationship, investment lifecycle, recordkeeping requirements, compliance obligations, dispute or limitation periods, security requirements and the need to establish or defend legal rights.",
      "Information that is no longer required should be deleted, anonymised or otherwise handled in accordance with the applicable retention process, subject to legal or operational requirements that justify continued retention.",
    ],
  },

  {
    id: "security",
    number: "16",
    title: "Information security",
    paragraphs: [
      "Tevuah Reserve should use technical and organisational safeguards appropriate to the nature of the information and the risks associated with its processing.",
      "Measures may include authentication controls, access restrictions, database permissions, secure document access, monitoring, logging and other technical or administrative controls designed to reduce the risk of unauthorised access, disclosure, alteration or loss.",
      "No digital system can be guaranteed to be completely secure. Investors should also protect their credentials and promptly report suspected unauthorised account activity.",
    ],
  },

  {
    id: "rights",
    number: "17",
    title: "Your privacy rights",
    paragraphs: [
      "Depending on the privacy law applicable to you and the relevant processing activity, you may have rights in relation to your personal information.",
      "These rights are not identical in every jurisdiction and may be subject to conditions, limitations or exceptions under applicable law.",
    ],
    points: [
      "Request information about how your personal information is processed.",
      "Request access to personal information held about you.",
      "Request correction of inaccurate or incomplete information.",
      "Request deletion of information in circumstances where a right to deletion applies.",
      "Request restriction of certain processing where recognised by applicable law.",
      "Object to certain processing where an applicable right to object exists.",
      "Request portability of eligible information where applicable.",
      "Withdraw consent where processing relies on consent, without affecting processing lawfully carried out before withdrawal.",
      "Raise a concern or complaint about the handling of your personal information.",
    ],
  },

  {
    id: "requests",
    number: "18",
    title: "Privacy requests and identity verification",
    paragraphs: [
      "If you make a request concerning your personal information, Tevuah Reserve may need to take reasonable steps to confirm your identity before disclosing information or acting on the request.",
      "This is intended to protect personal information from being disclosed, changed or deleted in response to an unauthorised request.",
      "The manner and timing for responding to a privacy request will depend on the applicable law and the nature of the request.",
    ],
  },

  {
    id: "automated-decisions",
    number: "19",
    title: "Automated decision-making",
    paragraphs: [
      "This Privacy Policy does not state that Tevuah Reserve currently makes solely automated decisions producing legal or similarly significant effects on investors.",
      "If such processing is introduced in the future, the relevant privacy information should be updated to explain the processing and any rights that apply under the relevant law.",
    ],
  },

  {
    id: "cookies",
    number: "20",
    title: "Cookies and similar technologies",
    paragraphs: [
      "The website or platform may use cookies or similar browser technologies where required for functionality, authentication, security, preferences or other legitimate platform purposes.",
      "The specific cookies and similar technologies actually used by Tevuah Reserve should be described in the separate Cookie Policy, including their purposes and any available choices where required.",
    ],
  },

  {
    id: "communications",
    number: "21",
    title: "Investor communications",
    paragraphs: [
      "Tevuah Reserve may use contact information to respond to enquiries, provide account or investment-related communications, deliver documents, communicate material administrative information and provide other communications connected with the investor relationship.",
      "Marketing or optional promotional communications, if introduced, should be handled in accordance with applicable law and any preferences or consent requirements that apply.",
      "Administrative, security or investment-related communications may need to be sent independently of marketing preferences where they are necessary to administer the relevant relationship or service.",
    ],
  },

  {
    id: "third-party-links",
    number: "22",
    title: "Third-party websites and services",
    paragraphs: [
      "The Tevuah Reserve website may contain links to third-party websites or services. Those third parties may operate under their own privacy policies and practices.",
      "This Privacy Policy applies to Tevuah Reserve's handling of personal information and does not automatically govern independent third-party websites or services.",
    ],
  },

  {
    id: "changes",
    number: "23",
    title: "Changes to this Privacy Policy",
    paragraphs: [
      "Tevuah Reserve may update this Privacy Policy to reflect changes to the platform, processing activities, service providers, legal requirements or operational practices.",
      "The current version should be made available through the website. Where applicable law requires additional notice or consent for a material change, the appropriate process should be followed.",
    ],
  },

  {
    id: "contact",
    number: "24",
    title: "Contact and privacy enquiries",
    paragraphs: [
      "Questions about this Privacy Policy or the handling of personal information may be submitted through the Tevuah Reserve Contact page.",
      "Before this policy is relied upon as the final production privacy notice, the identity and contact details of the applicable legal entity or data controller, and any required privacy contact or representative, should be added once confirmed.",
      "Where applicable law gives an individual the right to complain to a privacy or data-protection authority, that right and the relevant authority should be identified once the applicable jurisdiction has been established.",
    ],
  },
];

const navigation = [
  ["#information-collected", "Information"],
  ["#enquiries", "Enquiries"],
  ["#verification", "Verification"],
  ["#investment-data", "Investments"],
  ["#sharing", "Sharing"],
  ["#retention", "Retention"],
  ["#security", "Security"],
  ["#rights", "Your rights"],
  ["#contact", "Contact"],
] as const;

export default function PrivacyPage() {
  return (
    <main className="bg-ivory-100">
      {/* ==========================================
          HERO
      ========================================== */}

      <section className="relative flex min-h-145 items-end overflow-hidden bg-forest-950 pt-19 text-white lg:pt-22">
        <PrivacyHeroImage className="absolute inset-0">
          <Image
            src="/images/hero/estates-page-hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </PrivacyHeroImage>

        <PrivacyHeroOverlay
          className="absolute inset-0 bg-linear-to-r from-forest-950 via-forest-950/94 to-forest-950/45"
          delay={0.04}
        />

        <PrivacyHeroOverlay
          className="absolute inset-0 bg-linear-to-t from-forest-950/95 via-forest-950/25 to-forest-950/25"
          delay={0.1}
        />

        <Container className="relative z-10 pb-14 pt-24 sm:pb-18 lg:pb-20">
          <div className="max-w-5xl">
            <PrivacyHeroReveal delay={0.1}>
              <div className="flex items-center gap-3">
                <PrivacyHeroLine className="h-px w-10 origin-left bg-gold-400" />

                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
                  Privacy
                </p>
              </div>
            </PrivacyHeroReveal>

            <PrivacyHeroReveal delay={0.2}>
              <h1 className="font-display mt-7 text-5xl leading-[0.94] font-medium tracking-[-0.045em] sm:text-6xl lg:text-8xl">
                Privacy Policy
              </h1>
            </PrivacyHeroReveal>

            <PrivacyHeroReveal delay={0.31}>
              <p className="mt-7 max-w-3xl text-base leading-8 text-white/65 sm:text-lg">
                Understand how personal
                information may be collected,
                used, protected and handled when
                you interact with Tevuah Reserve
                and the investor platform.
              </p>
            </PrivacyHeroReveal>

            <PrivacyHeroReveal
              delay={0.41}
              className="mt-10 sm:mt-12"
            >
              <Button
                href="#privacy-introduction"
                size="lg"
              >
                Read the policy

                <ArrowDown className="size-4" />
              </Button>
            </PrivacyHeroReveal>
          </div>
        </Container>
      </section>

      {/* ==========================================
          INTRODUCTION
      ========================================== */}

      <section
        id="privacy-introduction"
        className="scroll-mt-28 border-b border-forest-900/10 bg-white py-16 sm:py-20 lg:py-24"
      >
        <Container>
          <PrivacyReveal>
            <div className="grid gap-8 rounded-4xl border border-forest-900/10 bg-ivory-100 p-7 sm:p-10 lg:grid-cols-[auto_1fr] lg:gap-10 lg:p-12">
              <span className="flex size-14 items-center justify-center rounded-full bg-forest-950 text-gold-400">
                <ShieldCheck className="size-6" />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Our approach
                </p>

                <h2 className="font-display mt-4 max-w-4xl text-3xl font-medium tracking-[-0.03em] text-forest-950 sm:text-4xl">
                  Investor information should be
                  handled carefully and for clear
                  purposes.
                </h2>

                <p className="mt-6 max-w-4xl text-sm leading-7 text-stone-700 sm:text-base sm:leading-8">
                  Tevuah Reserve uses personal
                  information to support investor
                  enquiries, onboarding,
                  verification, secure account
                  access, investment
                  administration and related
                  platform services.
                </p>
              </div>
            </div>
          </PrivacyReveal>
        </Container>
      </section>

      {/* ==========================================
          PRIVACY PRINCIPLES
      ========================================== */}

      <section className="border-b border-forest-900/10 py-16 sm:py-20">
        <Container>
          <PrivacyReveal>
            <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Privacy principles
                </p>

                <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                  Purposeful, proportionate and
                  secure.
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: Eye,
                    title: "Transparency",
                    text: "Explain what information is used and why it is required.",
                  },
                  {
                    icon: Database,
                    title: "Data minimisation",
                    text: "Collect information that is appropriate for the relevant purpose.",
                  },
                  {
                    icon: LockKeyhole,
                    title: "Security",
                    text: "Apply appropriate controls to protect sensitive investor information.",
                  },
                  {
                    icon: UserCheck,
                    title: "Accountability",
                    text: "Maintain appropriate responsibility for how personal information is handled.",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <PrivacyRevealSoft
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
                    </PrivacyRevealSoft>
                  );
                })}
              </div>
            </div>
          </PrivacyReveal>
        </Container>
      </section>

      {/* ==========================================
          POLICY STATUS
      ========================================== */}

      <section className="border-b border-forest-900/10 bg-white py-14 sm:py-16">
        <Container>
          <PrivacyReveal>
            <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Policy status
                </p>

                <h2 className="font-display mt-5 text-3xl font-medium tracking-[-0.03em] text-forest-950 sm:text-4xl">
                  Legal details must reflect the
                  final operating structure.
                </h2>
              </div>

              <div className="space-y-5 text-sm leading-7 text-stone-700">
                <p>
                  Privacy requirements depend on
                  factors including the legal
                  entity operating the platform,
                  where it operates, where
                  investors are located and the
                  nature of the processing
                  involved.
                </p>

                <p>
                  This policy therefore does not
                  invent a data-controller entity,
                  registered address, privacy
                  officer, supervisory authority
                  or jurisdiction-specific legal
                  basis that has not yet been
                  confirmed.
                </p>

                <div className="rounded-2xl border border-gold-500/25 bg-gold-500/5 p-5">
                  <p className="text-xs leading-6 text-stone-700">
                    Entity-specific contact
                    details, applicable legal
                    bases, international-transfer
                    arrangements and
                    jurisdiction-specific rights
                    should be finalised before
                    this policy is relied upon as
                    the production legal notice.
                  </p>
                </div>
              </div>
            </div>
          </PrivacyReveal>
        </Container>
      </section>

      {/* ==========================================
          NAVIGATION
      ========================================== */}

      <section className="sticky top-0 z-20 border-b border-forest-900/10 bg-white/95 py-4 backdrop-blur-xl">
        <Container>
          <PrivacyRevealSoft>
            <nav
              aria-label="Privacy Policy sections"
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
          </PrivacyRevealSoft>
        </Container>
      </section>

      {/* ==========================================
          POLICY SECTIONS
      ========================================== */}

      <section className="bg-white">
        <Container>
          <div className="mx-auto max-w-6xl">
            {privacySections.map(
              (section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-32 border-b border-forest-900/10 py-14 last:border-b-0 sm:py-16 lg:py-20"
                >
                  <div className="grid gap-7 lg:grid-cols-[0.55fr_1.45fr] lg:gap-20">
                    <PrivacyReveal>
                      <div className="lg:sticky lg:top-28 lg:self-start">
                        <p className="font-display text-2xl text-gold-600">
                          {section.number}
                        </p>

                        <h2 className="font-display mt-4 max-w-sm text-3xl leading-[1.05] font-medium tracking-[-0.03em] text-forest-950">
                          {section.title}
                        </h2>
                      </div>
                    </PrivacyReveal>

                    <PrivacyReveal delay={0.05}>
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
                        "cookies" ? (
                          <Link
                            href="/cookies"
                            className="focus-ring mt-7 inline-flex items-center gap-2 text-sm font-semibold text-forest-950 transition hover:text-gold-600"
                          >
                            Read the Cookie Policy

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
                    </PrivacyReveal>
                  </div>
                </section>
              ),
            )}
          </div>
        </Container>
      </section>

      {/* ==========================================
          DATA JOURNEY
      ========================================== */}

      <section className="border-y border-forest-900/10 bg-ivory-100 py-16 sm:py-20 lg:py-24">
        <Container>
          <PrivacyReveal>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Investor data journey
              </p>

              <h2 className="font-display mt-5 max-w-4xl text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                Information changes as the
                investor relationship develops.
              </h2>
            </div>
          </PrivacyReveal>

          <div className="mt-10 grid gap-4 lg:grid-cols-4">
            {[
              {
                number: "01",
                icon: Mail,
                title: "Enquiry",
                text: "Basic contact, jurisdiction, investment-interest and enquiry information.",
              },
              {
                number: "02",
                icon: Fingerprint,
                title: "Onboarding",
                text: "Account, identity, address and verification information where an investor proceeds.",
              },
              {
                number: "03",
                icon: FileCheck2,
                title: "Investment",
                text: "Subscription, consent, document, funding and transaction-related records.",
              },
              {
                number: "04",
                icon: Database,
                title: "Portfolio",
                text: "Investment positions, statements, distributions, documents and lifecycle records.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <PrivacyRevealSoft
                  key={item.number}
                >
                  <article className="h-full rounded-3xl border border-forest-900/10 bg-white p-6">
                    <div className="flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-full bg-forest-950 text-gold-400">
                        <Icon className="size-4" />
                      </span>

                      <span className="font-display text-xl text-forest-950/15">
                        {item.number}
                      </span>
                    </div>

                    <h3 className="font-display mt-6 text-2xl font-medium text-forest-950">
                      {item.title}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-stone-600">
                      {item.text}
                    </p>
                  </article>
                </PrivacyRevealSoft>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ==========================================
          SECURITY
      ========================================== */}

      <section className="bg-forest-950 py-16 text-white sm:py-20 lg:py-24">
        <Container>
          <PrivacyReveal>
            <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
              <div>
                <Server className="size-7 text-gold-400" />

                <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                  Security & access
                </p>

                <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] sm:text-5xl">
                  Sensitive information requires
                  controlled access.
                </h2>
              </div>

              <div>
                <p className="max-w-3xl text-base leading-8 text-white/65">
                  Identity documents, investor
                  records and investment
                  information should be accessible
                  only where the person, service
                  or system has an appropriate
                  reason to access them.
                </p>

                <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
                  {[
                    "Use authentication and permissions to restrict investor access.",
                    "Limit administrative access according to operational responsibilities.",
                    "Protect sensitive documents through appropriate storage and access controls.",
                    "Maintain records that support security monitoring and investigation.",
                    "Review suspected unauthorised activity and take appropriate protective action.",
                  ].map(
                    (item, index) => (
                      <div
                        key={item}
                        className="grid gap-3 py-5 sm:grid-cols-[45px_1fr]"
                      >
                        <span className="font-display text-lg text-gold-400">
                          {String(
                            index + 1,
                          ).padStart(
                            2,
                            "0",
                          )}
                        </span>

                        <p className="text-sm leading-7 text-white/60">
                          {item}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </PrivacyReveal>
        </Container>
      </section>

      {/* ==========================================
          YOUR INFORMATION
      ========================================== */}

      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <PrivacyReveal>
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Your information
                </p>

                <h2 className="font-display mt-5 max-w-4xl text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                  Have a privacy question?
                </h2>

                <p className="mt-6 max-w-2xl text-base leading-8 text-stone-700">
                  Contact Tevuah Reserve if you
                  have a question about personal
                  information, investor records or
                  how information associated with
                  your platform use is handled.
                </p>
              </div>

              <Button
                href="/contact"
                size="lg"
                className="w-fit"
              >
                Contact us

                <ArrowUpRight className="size-4" />
              </Button>
            </div>
          </PrivacyReveal>
        </Container>
      </section>

      {/* ==========================================
          RELATED POLICIES
      ========================================== */}

      <section className="border-t border-forest-900/10 py-16 sm:py-20">
        <Container>
          <PrivacyReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
              Related information
            </p>

            <h2 className="font-display mt-5 text-4xl font-medium tracking-[-0.035em] text-forest-950">
              Related policies and disclosures.
            </h2>
          </PrivacyReveal>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {[
              {
                href: "/terms",
                title: "Terms of Use",
                description:
                  "Terms governing access to and use of the Tevuah Reserve website and investor platform.",
              },
              {
                href: "/risk-disclosure",
                title: "Risk Disclosure",
                description:
                  "Important information about risks associated with private investments.",
              },
              {
                href: "/cookies",
                title: "Cookie Policy",
                description:
                  "Information about cookies and similar technologies used by the platform.",
              },
            ].map((item) => (
              <PrivacyRevealSoft
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
              </PrivacyRevealSoft>
            ))}
          </div>
        </Container>
      </section>

      {/* ==========================================
          FOOTNOTE
      ========================================== */}

      <section className="border-t border-forest-900/10 bg-white py-8">
        <Container>
          <PrivacyRevealSoft>
            <div className="flex flex-col gap-3 text-xs leading-6 text-stone-500 sm:flex-row sm:items-start sm:justify-between">
              <p>Privacy Policy</p>

              <p className="max-w-3xl sm:text-right">
                This policy describes the general
                handling of personal information
                through the Tevuah Reserve
                website and investor platform.
                Applicable legal requirements may
                vary according to jurisdiction
                and processing activity.
              </p>
            </div>
          </PrivacyRevealSoft>
        </Container>
      </section>
    </main>
  );
}