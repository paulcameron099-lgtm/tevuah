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
      "This Privacy Policy explains how Tevuah Reserve handles personal information when you visit the website, submit an investor enquiry, complete investor onboarding, access an investor account or use investment-related services.",
      "It describes the categories of information that may be collected, the purposes for which it is used, the circumstances in which it may be shared and the measures taken to protect it.",
      "Additional privacy information may apply to particular services, investment arrangements or verification processes.",
    ],
  },

  {
    id: "information-collected",
    number: "02",
    title: "Personal information we may collect",
    paragraphs: [
      "The personal information collected depends on your relationship with Tevuah Reserve and the services you use. A visitor submitting an initial enquiry will generally provide less information than an investor completing verification and participating in an investment.",
    ],
    points: [
      "Identity information: Name and other identifying details.",
      "Contact information: Email address, telephone number, country or jurisdiction and other contact details you provide.",
      "Enquiry information: Investment interests, indicative investment range and messages submitted through the website.",
      "Account information: Information associated with investor access and authentication.",
      "Verification information: Identity documents, address details and supporting documentation required during onboarding.",
      "Investment records: Subscription details, commitments, ownership or economic interests and investment status.",
      "Joint-investment records: Invitations, participation details, consent and acceptance records where applicable.",
      "Funding and transaction information: Records associated with investment funding, payment instructions and transactions.",
      "Investor documents: Agreements, disclosures, acknowledgements, signatures, statements and related records.",
      "Communications: Correspondence between you and Tevuah Reserve.",
      "Technical information: Information relating to website use, authentication, platform activity and security.",
    ],
  },

  {
    id: "enquiries",
    number: "03",
    title: "Investor enquiries",
    paragraphs: [
      "When you submit an enquiry through the Tevuah Reserve Contact page, we collect the information you provide, which may include your name, email address, country or jurisdiction, investment interests, indicative investment range and message.",
      "We use this information to respond to your enquiry, understand your interests, communicate relevant information and explain the next steps in the investor process.",
      "Submitting an enquiry does not automatically create an investor account or guarantee eligibility, access to an investment opportunity or acceptance of an investment.",
    ],
  },

  {
    id: "accounts",
    number: "04",
    title: "Investor accounts and authentication",
    paragraphs: [
      "Tevuah Reserve does not offer unrestricted public self-registration for investor accounts. Investor access is established administratively after the applicable onboarding requirements have been addressed.",
      "Account information is used to establish and maintain authorised access, authenticate users, manage permissions, associate activity with the appropriate investor and provide access to relevant investment information.",
      "Technical records associated with authentication and account activity may also be used to protect account security, investigate suspected unauthorised access and maintain the integrity of the platform.",
    ],
  },

  {
    id: "verification",
    number: "05",
    title: "Identity, KYC and address verification",
    paragraphs: [
      "Investor onboarding may require information to verify identity, confirm an address, assess eligibility and meet applicable compliance requirements.",
      "Depending on the relevant process, this may include identity numbers, identity-document images, address information, supporting documents and information needed to assess or verify an investor's details.",
      "Access to verification information is restricted according to the requirements of the relevant process and the responsibilities of authorised personnel and service providers. This information is handled for verification, compliance, security and administrative purposes, subject to applicable privacy requirements.",
    ],
  },

  {
    id: "investment-data",
    number: "06",
    title: "Investment and portfolio information",
    paragraphs: [
      "When you participate in an investment, Tevuah Reserve processes information relating to subscriptions, commitments, funding, ownership or economic interests, investment status, portfolio positions, statements, distributions and related documentation.",
      "This information supports investment administration, transaction recordkeeping, investor communications and portfolio reporting. Investment records may be retained after an opportunity closes or an investment ends where necessary for recordkeeping, contractual, legal or other permitted purposes.",
    ],
  },

  {
    id: "joint-investments",
    number: "07",
    title: "Joint-investment information",
    paragraphs: [
      "Where an investment involves multiple participants, Tevuah Reserve may process information relating to each participant, the joint subscription, funding allocations, invitations, consent, acknowledgements and signatures.",
      "Information may be shared with other authorised participants where reasonably necessary to administer the joint investment, confirm participation or manage the associated documentation.",
      "Access to joint-investment information is subject to applicable permissions, confidentiality requirements and the rights of the individuals concerned.",
    ],
  },

  {
    id: "documents",
    number: "08",
    title: "Documents, signatures and acknowledgements",
    paragraphs: [
      "Tevuah Reserve may process documents and records associated with onboarding, investment review, agreements, disclosures, acknowledgements, signatures, statements and other investor activity.",
      "Electronic acceptance and signature records may include the relevant document or version reference, the name associated with the acceptance, a timestamp and technical information relating to the transaction.",
      "These records support the administration of investments, the preservation of transaction history and the management of the investor relationship.",
    ],
  },

  {
    id: "technical-data",
    number: "09",
    title: "Technical, device and security information",
    paragraphs: [
      "When you access the website or investor platform, technical information may be generated to support the operation, maintenance and security of the service.",
      "Depending on the systems and services used, this information may include IP addresses, browser information, authentication events, timestamps, request records and other technical data.",
      "Such information may be used for troubleshooting, service administration, fraud prevention, security monitoring and investigation of suspected misuse.",
      "Technical information is handled in a manner appropriate to its purpose and subject to applicable privacy requirements.",
    ],
  },

  {
    id: "purposes",
    number: "10",
    title: "How personal information may be used",
    paragraphs: [
      "Tevuah Reserve uses personal information to operate the website and investor platform, respond to enquiries and administer relationships with prospective and existing investors. Purposes include:",
    ],
    points: [
      "Responding to investor enquiries and communications.",
      "Establishing and administering approved investor access.",
      "Authenticating users and protecting investor accounts.",
      "Completing identity, address and other applicable verification processes.",
      "Administering investment subscriptions and joint investments.",
      "Managing investment documents, acknowledgements and signatures.",
      "Providing authorised funding instructions and maintaining transaction records.",
      "Maintain portfolio, statement and distribution records.",
      "Communicating relevant investment and administrative information.",
      "Operating, maintaining and improving platform functionality.",
      "Detecting and investigating suspected fraud, misuse and security incidents.",
      "Maintaining operational, contractual, compliance and legal records.",
      "Establishing, exercising or defending legal claims where necessary.",
    ],
  },

  {
    id: "legal-basis",
    number: "11",
    title: "Basis for processing",
    paragraphs: [
      "The legal basis for processing personal information depends on the applicable privacy law, the nature of the information and the purpose of the processing.",
      "Depending on the circumstances, processing may be necessary to take steps requested by an individual, perform or administer a contract, comply with a legal obligation, pursue legitimate operational or security interests, or meet another recognised legal basis.",
      "Where consent is required, personal information will be processed on that basis. Consent may be withdrawn in accordance with applicable law, without affecting the lawfulness of processing carried out before withdrawal.",
      "The applicable legal basis and any relevant conditions depend on the processing activity and the law governing it.",
    ],
  },

  {
    id: "sharing",
    number: "12",
    title: "When information may be shared",
    paragraphs: [
      "Tevuah Reserve does not disclose personal information indiscriminately. Information may be shared where necessary to provide services, administer investments, maintain platform security, meet legal obligations or protect legitimate rights. Recipients may include:",
    ],
    points: [
      "Technology, hosting, database and infrastructure providers.",
      "Authentication, communications and email-service providers.",
      "Identity-verification and compliance-service providers.",
      "Banks, payment providers and financial-service counterparties involved in investment funding or administration.",
      "Estate operators, investment administrators, custodians and other parties involved in a relevant investment.",
      "Legal, accounting, compliance and other professional advisers.",
      "Courts, regulators, public authorities or other recipients where disclosure is required or permitted by applicable law.",
      "Parties involved in a corporate transaction, restructuring or business transfer, subject to applicable confidentiality and legal requirements.",
    ],
  },

  {
    id: "providers",
    number: "13",
    title: "Service providers and infrastructure",
    paragraphs: [
      "Tevuah Reserve uses technology and service providers to support the operation of its website, investor platform and related services.",
      "Depending on their role, these providers may process personal information on behalf of Tevuah Reserve or handle information under their own legal responsibilities.",
      "Access to personal information is limited to what is reasonably necessary for the services provided. Appropriate contractual, confidentiality, security and data-protection measures apply where required.",
    ],
  },

  {
    id: "international",
    number: "14",
    title: "International processing and transfers",
    paragraphs: [
      "Personal information may be processed in countries other than the country in which an investor resides, including where technology infrastructure or service providers operate across borders.",
      "Where international transfers are subject to legal requirements, Tevuah Reserve will apply the safeguards or transfer mechanisms required by the applicable privacy law.",
      "The treatment of international transfers depends on the countries involved, the recipient, the nature of the information and the applicable legal requirements.",
    ],
  },

  {
    id: "retention",
    number: "15",
    title: "How long information is retained",
    paragraphs: [
      "Tevuah Reserve retains personal information for as long as reasonably necessary for the purposes for which it was collected, subject to applicable legal and regulatory requirements.",
      "Retention periods depend on the type of information and the circumstances. Relevant considerations include the duration of the investor relationship, the investment lifecycle, recordkeeping obligations, compliance requirements, security needs and the time necessary to establish or defend legal claims.",
      "When personal information is no longer required, it is deleted, anonymised or otherwise handled in accordance with applicable retention requirements, unless continued retention is legally justified.",
    ],
  },

  {
    id: "security",
    number: "16",
    title: "Information security",
    paragraphs: [
      "Tevuah Reserve uses appropriate technical and organisational measures to protect personal information against unauthorised access, disclosure, alteration, loss or misuse.",
      "Security measures may include authentication controls, access restrictions, database permissions, secure document access, monitoring, logging and other administrative or technical safeguards appropriate to the information and associated risks.",
      "No digital system can be guaranteed to be completely secure. Investors should protect their account credentials and notify Tevuah Reserve promptly if they suspect unauthorised access or activity.",
    ],
  },

  {
    id: "rights",
    number: "17",
    title: "Your privacy rights",
    paragraphs: [
      "Depending on the privacy law applicable to you and the circumstances of the processing, you may have rights concerning your personal information. These rights may include:",
    ],
    points: [
      "Requesting information about how your personal information is processed.",
      "Requesting access to personal information held about you.",
      "Requesting correction of inaccurate or incomplete information.",
      "Requesting deletion where the right to deletion applies.",
      "Requesting restriction of processing where permitted by law.",
      "Objecting to certain processing where a right to object exists.",
      "Requesting a copy of eligible information in a portable format where applicable.",
      "Withdrawing consent where processing relies on consent.",
      "Raising a concern or complaint about the handling of your personal information.",
    ],
  },

  {
    id: "requests",
    number: "18",
    title: "Privacy requests and identity verification",
    paragraphs: [
      "If you submit a request concerning your personal information, Tevuah Reserve may need to verify your identity before disclosing information or making changes.",
      "This helps protect personal information against unauthorised access, alteration or deletion.",
      "Requests will be handled in accordance with the applicable legal requirements, including any relevant response periods, verification requirements and permitted exceptions.",
    ],
  },

  {
    id: "automated-decisions",
    number: "19",
    title: "Automated decision-making",
    paragraphs: [
      "Personal information may be processed using automated systems for technical operations, account administration, verification support and security purposes.",
      "Where automated processing is used to make decisions that are subject to specific privacy protections, information about that processing and the rights available to affected individuals will be provided as required by applicable law.",
    ],
  },

  {
    id: "cookies",
    number: "20",
    title: "Cookies and similar technologies",
    paragraphs: [
      "The website and investor platform may use cookies and similar technologies to support functionality, authentication, security, preferences and other website operations.",
      "The Cookie Policy provides further information about the cookies and similar technologies used, their purposes and the choices available to users where applicable.",
    ],
  },

  {
    id: "communications",
    number: "21",
    title: "Investor communications",
    paragraphs: [
      "Tevuah Reserve uses contact information to respond to enquiries, administer investor accounts, deliver relevant documents, communicate investment-related information and provide important administrative or security notices.",
      "Marketing and promotional communications are handled in accordance with applicable law and any consent or preference requirements that apply.",
      "Administrative, security and investment-related communications may still be necessary even where an individual has opted out of optional marketing communications.",
    ],
  },

  {
    id: "third-party-links",
    number: "22",
    title: "Third-party websites and services",
    paragraphs: [
      "The Tevuah Reserve website may contain links to third-party websites or services. Those services may collect and process personal information under their own privacy policies and practices.",
      "This Privacy Policy applies to Tevuah Reserve's handling of personal information and does not govern independent third-party websites or services.",
      "Users should review the privacy information provided by third parties before submitting personal information through their services.",
    ],
  },

  {
    id: "changes",
    number: "23",
    title: "Changes to this Privacy Policy",
    paragraphs: [
      "Tevuah Reserve may update this Privacy Policy to reflect changes in its services, platform operations, information-handling practices or applicable legal requirements.",
      "The current version will be made available through the website, together with the date of the latest revision.",
      "Where applicable law requires notice or consent for a material change, the relevant process will be followed.",
    ],
  },

  {
    id: "contact",
    number: "24",
    title: "Contact and privacy enquiries",
    paragraphs: [
      "For questions about this Privacy Policy, requests concerning personal information or enquiries about how investor records are handled, please contact Tevuah Reserve through the Contact page.",
      "Requests will be handled in accordance with applicable privacy requirements. Where the law provides a right to complain to a data-protection or privacy authority, that right remains available subject to the applicable legal framework.",
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
                Understand how Tevuah Reserve collects, uses, protects and handles personal information when you interact with the website, submit an investor enquiry or use the investor platform.
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
                  Personal information deserves careful handling.
                </h2>

                <p className="mt-6 max-w-4xl text-sm leading-7 text-stone-700 sm:text-base sm:leading-8">
                  Tevuah Reserve uses personal information to respond to investor enquiries, manage onboarding and verification, support secure account access, administer investments and provide related platform services.
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
                    text: "Explain what information is collected, how it is used and when it may be shared.",
                  },
                  {
                    icon: Database,
                    title: "Data minimisation",
                    text: "Collect information relevant to the purpose for which it is required.",
                  },
                  {
                    icon: LockKeyhole,
                    title: "Security",
                    text: "Protect personal and investor information through appropriate access controls and security measures.",
                  },
                  {
                    icon: UserCheck,
                    title: "Accountability",
                    text: "Handle personal information responsibly and in accordance with applicable privacy requirements.",
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
                  Privacy and data protection
                </p>

                <h2 className="font-display mt-5 text-3xl font-medium tracking-[-0.03em] text-forest-950 sm:text-4xl">
                  Personal information is handled with care and for defined purposes.
                </h2>
              </div>

              <div className="space-y-5 text-sm leading-7 text-stone-700">
                <p>
                  Tevuah Reserve’s privacy practices cover the collection, use, storage and sharing of personal information throughout the investor relationship, from initial enquiries and identity verification to investment administration and portfolio reporting.
                </p>

                <p>
                  Personal information is handled in accordance with applicable privacy and data-protection requirements. The information collected, the purposes for which it is used, and the circumstances in which it may be shared depend on the services provided and the nature of the relationship with Tevuah Reserve.
                </p>

                <div className="rounded-2xl border border-gold-500/25 bg-gold-500/5 p-5">
                  <p className="text-xs leading-6 text-stone-700">
                   Where information is shared with service providers or processed across borders, appropriate arrangements must be established to protect that information and meet applicable legal requirements. Privacy enquiries and requests concerning personal information may be submitted through the contact channels provided in this policy.
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
                Information is handled throughout the investor relationship.
              </h2>
            </div>
          </PrivacyReveal>

          <div className="mt-10 grid gap-4 lg:grid-cols-4">
            {[
              {
                number: "01",
                icon: Mail,
                title: "Enquiry",
                text: "Contact details, jurisdiction, investment interests and enquiry correspondence.",
              },
              {
                number: "02",
                icon: Fingerprint,
                title: "Onboarding",
                text: "Account information, identity and address details, and verification records where required.",
              },
              {
                number: "03",
                icon: FileCheck2,
                title: "Investment",
                text: "Subscription documents, consents, funding information and transaction records.",
              },
              {
                number: "04",
                icon: Database,
                title: "Portfolio",
                text: "Investment positions, statements, distributions, documents and records associated with the investment lifecycle.",
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
                  Sensitive information requires controlled access.
                </h2>
              </div>

              <div>
                <p className="max-w-3xl text-base leading-8 text-white/65">
                  Investor identity documents, personal information and investment records must be protected against unauthorised access and disclosure.
                </p>

                <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
                  {[
                    "Use authentication and permissions to control investor access.",
                    "Restrict administrative access according to authorised responsibilities.",
                    "Protect sensitive documents through appropriate storage and access controls.",
                    "Maintain relevant security records to support monitoring and investigation.",
                    " Investigate suspected unauthorised activity and take appropriate protective measures.",
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
                  Contact Tevuah Reserve if you have a question about personal information, investor records or the handling of information associated with your use of the website and platform.
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