import type {
  Metadata,
} from "next";

import Image from "next/image";
import Link from "next/link";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUpRight,
  FileCheck2,
  Scale,
  ShieldCheck,
} from "lucide-react";

import {
  TermsHeroImage,
  TermsHeroLine,
  TermsHeroOverlay,
  TermsHeroReveal,
  TermsReveal,
  TermsRevealSoft,
} from "@/src/components/terms/terms-motion";

import {
  Button,
} from "@/src/components/ui/button";

import {
  Container,
} from "@/src/components/ui/container";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms governing access to and use of the Tevuah Reserve website, investor platform, information, documents and related digital services.",
};

type TermsSection = {
  id: string;
  number: string;
  title: string;
  paragraphs?: string[];
  points?: string[];
};

const termsSections: TermsSection[] = [
  {
    id: "acceptance",
    number: "01",
    title: "Acceptance of these Terms",
    paragraphs: [
      "These Terms of Use govern your access to and use of the Tevuah Reserve website, investor platform and related digital services made available by or on behalf of Tevuah Reserve.",
      "By accessing or using the website or platform, you acknowledge that you have read and understood these Terms and agree to comply with them. If you do not agree with these Terms, you should not use the website or platform.",
      "Additional terms, agreements, acknowledgements or disclosures may apply to particular services, investor accounts or investment opportunities. Where additional terms apply, they should be read together with these Terms.",
    ],
  },

  {
    id: "platform-purpose",
    number: "02",
    title: "Purpose of the platform",
    paragraphs: [
      "Tevuah Reserve provides a digital environment through which users may access information about the company, selected investment opportunities, productive agricultural assets, agricultural technology, fine wine and related investor services.",
      "Approved investors may also be provided with secure functionality for onboarding, verification, investment workflows, documents, funding information, portfolio records, statements, distributions and other investment-related activity.",
      "The availability of any particular feature, service or opportunity may vary over time and may depend on investor status, verification, eligibility, jurisdiction, opportunity availability and other applicable requirements.",
    ],
  },

  {
    id: "no-public-registration",
    number: "03",
    title: "Investor access and account creation",
    paragraphs: [
      "Tevuah Reserve does not provide unrestricted public self-registration for investor accounts. Prospective investors may contact Tevuah Reserve to begin an investor enquiry and, where appropriate, proceed through the applicable onboarding process.",
      "Investor accounts may be established administratively after relevant onboarding steps. Creating or providing access to an account does not itself guarantee eligibility to invest, approval for any particular opportunity or the availability of an investment allocation.",
      "Tevuah Reserve may request information or documentation reasonably required for identity verification, address verification, compliance review, investor administration or other applicable onboarding requirements.",
    ],
  },

  {
    id: "account-security",
    number: "04",
    title: "Account security and authorised use",
    paragraphs: [
      "If you are provided with investor account access, you are responsible for maintaining the confidentiality and security of your login credentials and for taking reasonable steps to prevent unauthorised access to your account.",
      "You should notify Tevuah Reserve promptly if you become aware of suspected unauthorised access, compromised credentials or activity that you do not recognise.",
    ],
    points: [
      "Do not knowingly share account credentials with an unauthorised person.",
      "Use accurate information when completing account or investment processes.",
      "Do not attempt to access another investor's account, documents or information.",
      "Do not attempt to bypass authentication, permissions or other security controls.",
      "Review unexpected requests involving account details, payment instructions or sensitive information carefully.",
    ],
  },

  {
    id: "eligibility",
    number: "05",
    title: "Eligibility and verification",
    paragraphs: [
      "Access to information on the public website does not mean that every investment opportunity is available to every person.",
      "Before allowing an investment to proceed, Tevuah Reserve may require completion of applicable identity, address, compliance, eligibility or other verification processes.",
      "Tevuah Reserve may decline, restrict, suspend or discontinue access to an investment process where applicable requirements have not been satisfied or where continued access would be inappropriate under the relevant circumstances.",
    ],
  },

  {
    id: "investment-information",
    number: "06",
    title: "Investment information",
    paragraphs: [
      "Information presented on the website or platform may include descriptions of investment opportunities, underlying assets, operators, target returns, expected durations, funding progress, valuations, operational information, documents and other investment-related material.",
      "Such information should be considered together with the documents and disclosures applicable to the specific opportunity. Website summaries are not intended to replace investment agreements, subscription documents, risk disclosures or other definitive materials.",
      "You are responsible for reviewing the information made available to you and for seeking clarification where material information is not understood.",
    ],
  },

  {
    id: "no-offer",
    number: "07",
    title: "No automatic offer or entitlement",
    paragraphs: [
      "The presence of information about an opportunity on the website or platform does not by itself create a contractual right to invest, reserve capacity or require Tevuah Reserve or any relevant investment vehicle, issuer, operator or other party to accept an investment.",
      "An investment may be subject to availability, eligibility, verification, documentation, acceptance, funding and other applicable conditions.",
      "Tevuah Reserve may close, withdraw, pause or amend the availability of an opportunity where appropriate, subject to any rights that have already arisen under binding investment-specific agreements.",
    ],
  },

  {
    id: "investment-risk",
    number: "08",
    title: "Investment risk",
    paragraphs: [
      "Investments involve risk. The value of an investment may decrease, returns may be lower than expected and an investor may lose some or all of the capital invested.",
      "Private investments may also be illiquid and may need to be held for an extended period. Target returns, expected durations, projected distributions, valuations, forecasts and other forward-looking information are not guarantees.",
      "You should read the Tevuah Reserve Risk Disclosure and any opportunity-specific risk information before deciding whether to invest.",
    ],
  },

  {
    id: "no-advice",
    number: "09",
    title: "No personalised professional advice",
    paragraphs: [
      "General information provided through the website or platform does not by itself constitute personalised financial, investment, legal, tax or accounting advice.",
      "Tevuah Reserve may explain its platform, opportunities, investment processes and relevant portfolio considerations. You remain responsible for your own investment decisions and for determining whether independent professional advice is appropriate for your circumstances.",
    ],
  },

  {
    id: "accuracy",
    number: "10",
    title: "Information, accuracy and availability",
    paragraphs: [
      "Tevuah Reserve seeks to present information in a clear and useful manner. However, information may originate from operators, data providers, valuation sources, service providers or other third parties and may be subject to delay, revision, error or incomplete availability.",
      "Operational, AgTech, market and valuation information should be interpreted according to its source, timestamp, methodology and context. Information displayed through the platform should not automatically be assumed to be real-time.",
      "Tevuah Reserve may correct, update, supplement or remove information where appropriate.",
    ],
  },

  {
    id: "forward-looking",
    number: "11",
    title: "Forward-looking information",
    paragraphs: [
      "The website and platform may contain forecasts, projections, estimates, targets, expected durations, anticipated distributions and other forward-looking statements.",
      "Forward-looking information depends on assumptions and future events that may not occur as expected. Actual outcomes may differ materially because of market, financial, operational, agricultural, environmental, regulatory or other factors.",
      "Forward-looking information should not be interpreted as a promise, warranty or guarantee of future performance.",
    ],
  },

  {
    id: "funding",
    number: "12",
    title: "Funding instructions and payments",
    paragraphs: [
      "Where an investor proceeds with an investment, funding instructions may be made available through authorised Tevuah Reserve processes or other approved channels.",
      "You are responsible for carefully checking payment information before transferring funds. If you receive unexpected or changed payment instructions, you should verify them through an authorised Tevuah Reserve contact before making a transfer.",
      "You should not send funds solely in reliance on an unsolicited message purporting to change previously provided payment details.",
    ],
  },

  {
    id: "joint-investments",
    number: "13",
    title: "Joint investments",
    paragraphs: [
      "Where the platform supports joint investment, participating members may be required to provide separate consent, acceptance, signatures, acknowledgements or other information before a joint investment can progress.",
      "Each participating member is responsible for reviewing the information and documents applicable to that member and the joint investment.",
      "The rights and obligations relating to a particular joint investment are determined by the applicable investment-specific documents and not solely by these Terms.",
    ],
  },

  {
    id: "documents",
    number: "14",
    title: "Documents and electronic records",
    paragraphs: [
      "The platform may provide access to agreements, disclosures, statements, investment records, notices and other documents in electronic form.",
      "You are responsible for reviewing documents made available to you and for maintaining copies where appropriate for your own records.",
      "Electronic records, acknowledgements and signatures may be used within platform workflows where supported and applicable. Investment-specific documentation will determine the legal effect of the relevant acceptance, signature or acknowledgement.",
    ],
  },

  {
    id: "acceptable-use",
    number: "15",
    title: "Acceptable use",
    paragraphs: [
      "You must use the website and platform lawfully and in a manner that does not interfere with their security, integrity, operation or use by others.",
    ],
    points: [
      "Do not use the platform for fraudulent, unlawful or misleading activity.",
      "Do not attempt to gain unauthorised access to systems, accounts, databases or restricted information.",
      "Do not introduce malicious code, malware or other harmful technology.",
      "Do not probe, scan or test platform security without express authorisation.",
      "Do not scrape, harvest or systematically extract protected platform data without permission.",
      "Do not impersonate another person or misrepresent your authority to act for another person or entity.",
      "Do not interfere with platform availability, security controls or normal operation.",
    ],
  },

  {
    id: "intellectual-property",
    number: "16",
    title: "Intellectual property",
    paragraphs: [
      "Unless otherwise indicated, the website and platform, including their design, branding, text, graphics, software, interfaces and original content, are owned by or licensed for use by Tevuah Reserve and are protected by applicable intellectual-property laws.",
      "You may use platform content for your own lawful personal or internal investment-review purposes where such use is consistent with these Terms and any applicable document restrictions.",
      "You may not reproduce, distribute, modify, commercially exploit or create derivative works from protected Tevuah Reserve content without appropriate permission, except where applicable law expressly permits otherwise.",
    ],
  },

  {
    id: "third-party",
    number: "17",
    title: "Third-party services and information",
    paragraphs: [
      "The platform may use, display or link to information, infrastructure or services provided by third parties. These may include technology providers, payment or banking infrastructure, data providers, operators, custodians, advisers or other service providers.",
      "Tevuah Reserve does not control every third-party system or source and cannot guarantee that third-party services will always be available, accurate or free from interruption.",
      "Where you access a third-party service, separate terms or privacy practices may apply.",
    ],
  },

  {
    id: "availability",
    number: "18",
    title: "Platform availability and changes",
    paragraphs: [
      "Tevuah Reserve may update, maintain, modify, suspend or discontinue parts of the website or platform from time to time.",
      "Continuous or uninterrupted availability is not guaranteed. Maintenance, security events, service-provider failures, communications outages or other circumstances may temporarily affect platform functionality.",
      "Where reasonably practicable, material changes affecting active investor processes should be handled in a manner consistent with applicable investment agreements and legal obligations.",
    ],
  },

  {
    id: "suspension",
    number: "19",
    title: "Suspension or restriction of access",
    paragraphs: [
      "Tevuah Reserve may restrict or suspend platform access where reasonably necessary to protect investors, maintain security, investigate suspected misuse, address compliance concerns, respond to legal requirements or protect the integrity of the platform.",
      "Account restriction or suspension does not by itself alter rights or obligations that have already arisen under a separate binding investment agreement.",
    ],
  },

  {
    id: "privacy",
    number: "20",
    title: "Privacy and personal information",
    paragraphs: [
      "Use of the platform may involve the collection and processing of personal information, including information provided during enquiries, onboarding, identity verification, account administration and investment activity.",
      "Further information about how personal information is handled will be provided in the Tevuah Reserve Privacy Policy. Cookie and similar-technology information will be addressed separately in the Cookie Policy.",
    ],
  },

  {
    id: "liability",
    number: "21",
    title: "Responsibility and limitations",
    paragraphs: [
      "Nothing in these Terms is intended to exclude or limit responsibility where such exclusion or limitation would be prohibited by applicable law.",
      "Subject to applicable law and any separate binding agreement, Tevuah Reserve does not guarantee uninterrupted platform availability, the accuracy of every third-party data source, the achievement of investment projections or any particular investment outcome.",
      "Investment losses arising from ordinary investment, market, operational or asset-specific risks should not be interpreted as a failure of the platform merely because actual outcomes differ from expectations or projections.",
    ],
  },

  {
    id: "indemnity",
    number: "22",
    title: "Responsibility for misuse",
    paragraphs: [
      "You are responsible for your own unlawful, fraudulent or unauthorised use of the website or platform and for information you knowingly provide through your account.",
      "Nothing in this section is intended to impose liability beyond what is permitted by applicable law or to override rights and protections that cannot lawfully be waived.",
    ],
  },

  {
    id: "investment-agreements",
    number: "23",
    title: "Relationship with investment-specific agreements",
    paragraphs: [
      "These Terms govern use of the website and platform. They do not replace subscription agreements, investment agreements, joint-investment agreements, disclosures or other binding documents applicable to a particular investment.",
      "If a provision of these Terms conflicts with a binding investment-specific agreement in relation to that investment, the investment-specific agreement will govern that investment to the extent of the conflict, subject to applicable law.",
    ],
  },

  {
    id: "changes",
    number: "24",
    title: "Changes to these Terms",
    paragraphs: [
      "Tevuah Reserve may update these Terms from time to time to reflect changes to the platform, services, legal requirements, security practices or business processes.",
      "The current version should be made available through the website. Where a change requires additional notice or consent under applicable law or a separate agreement, the appropriate process should be followed.",
    ],
  },

  {
    id: "severability",
    number: "25",
    title: "Severability",
    paragraphs: [
      "If any provision of these Terms is determined to be invalid, unlawful or unenforceable, the remaining provisions should continue to apply to the extent permitted by applicable law.",
    ],
  },

  {
    id: "governing-law",
    number: "26",
    title: "Governing law and jurisdiction",
    paragraphs: [
      "The governing law and jurisdiction applicable to these Terms should be determined by the final legal structure of Tevuah Reserve, the entity providing the platform and the jurisdictions in which the service is made available.",
      "This provision should be finalised before these Terms are relied upon as production legal terms. Tevuah Reserve should not state a governing law or exclusive forum until the appropriate legal entity and jurisdiction have been confirmed.",
    ],
  },

  {
    id: "contact",
    number: "27",
    title: "Questions about these Terms",
    paragraphs: [
      "If you have a question about these Terms or the operation of the Tevuah Reserve platform, you may contact Tevuah Reserve through the Contact page.",
      "Separate processes may apply to privacy requests, complaints, investment administration or other formal matters once the relevant policies and procedures are in place.",
    ],
  },
];

const navigation = [
  ["#acceptance", "Acceptance"],
  ["#platform-purpose", "Platform"],
  ["#account-security", "Accounts"],
  ["#investment-information", "Investments"],
  ["#investment-risk", "Risk"],
  ["#acceptable-use", "Acceptable use"],
  ["#privacy", "Privacy"],
  ["#liability", "Responsibility"],
  ["#governing-law", "Governing law"],
] as const;

export default function TermsPage() {
  return (
    <main className="bg-ivory-100">
      {/* HERO */}

      <section className="relative flex min-h-145 items-end overflow-hidden bg-forest-950 pt-19 text-white lg:pt-22">
        <TermsHeroImage className="absolute inset-0">
          <Image
            src="/images/hero/estates-page-hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </TermsHeroImage>

        <TermsHeroOverlay
          className="absolute inset-0 bg-linear-to-r from-forest-950 via-forest-950/94 to-forest-950/45"
          delay={0.04}
        />

        <TermsHeroOverlay
          className="absolute inset-0 bg-linear-to-t from-forest-950/95 via-forest-950/25 to-forest-950/25"
          delay={0.1}
        />

        <Container className="relative z-10 pb-14 pt-24 sm:pb-18 lg:pb-20">
          <div className="max-w-5xl">
            <TermsHeroReveal delay={0.1}>
              <div className="flex items-center gap-3">
                <TermsHeroLine className="h-px w-10 origin-left bg-gold-400" />

                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
                  Legal
                </p>
              </div>
            </TermsHeroReveal>

            <TermsHeroReveal delay={0.2}>
              <h1 className="font-display mt-7 text-5xl leading-[0.94] font-medium tracking-[-0.045em] sm:text-6xl lg:text-8xl">
                Terms of Use
              </h1>
            </TermsHeroReveal>

            <TermsHeroReveal delay={0.31}>
              <p className="mt-7 max-w-3xl text-base leading-8 text-white/65 sm:text-lg">
                Terms governing access to and
                use of the Tevuah Reserve
                website, investor platform,
                information and related digital
                services.
              </p>
            </TermsHeroReveal>

            <TermsHeroReveal
            delay={0.41}
            className="mt-10 sm:mt-12"
            >
            <Button
                href="#terms-introduction"
                size="lg"
            >
                Read the terms

                <ArrowDown className="size-4" />
            </Button>
            </TermsHeroReveal>
          </div>
        </Container>
      </section>

      {/* INTRODUCTION */}

      <section
        id="terms-introduction"
        className="scroll-mt-28 border-b border-forest-900/10 bg-white py-16 sm:py-20 lg:py-24"
      >
        <Container>
          <TermsReveal>
            <div className="grid gap-8 rounded-4xl border border-forest-900/10 bg-ivory-100 p-7 sm:p-10 lg:grid-cols-[auto_1fr] lg:gap-10 lg:p-12">
              <span className="flex size-14 items-center justify-center rounded-full bg-forest-950 text-gold-400">
                <FileCheck2 className="size-6" />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Please read carefully
                </p>

                <h2 className="font-display mt-4 max-w-4xl text-3xl font-medium tracking-[-0.03em] text-forest-950 sm:text-4xl">
                  These Terms govern use of the
                  platform — not the economic
                  terms of an individual
                  investment.
                </h2>

                <p className="mt-6 max-w-4xl text-sm leading-7 text-stone-700 sm:text-base sm:leading-8">
                  Individual investments may be
                  subject to separate subscription
                  agreements, disclosures,
                  acknowledgements and other
                  documents. Those materials
                  should be reviewed carefully
                  before capital is committed.
                </p>
              </div>
            </div>
          </TermsReveal>
        </Container>
      </section>

      {/* LEGAL STATUS NOTE */}

      <section className="border-b border-forest-900/10 py-14 sm:py-16">
        <Container>
          <TermsReveal>
            <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Document status
                </p>

                <h2 className="font-display mt-5 text-3xl font-medium tracking-[-0.03em] text-forest-950 sm:text-4xl">
                  Platform terms with legal
                  details still to be finalised.
                </h2>
              </div>

              <div>
                <p className="text-sm leading-7 text-stone-700">
                  These Terms intentionally do not
                  identify a legal entity,
                  registered office, regulator,
                  licence, governing law or court
                  jurisdiction that has not yet
                  been confirmed for Tevuah
                  Reserve.
                </p>

                <div className="mt-6 flex items-start gap-4 rounded-2xl border border-gold-500/25 bg-gold-500/5 p-5">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-gold-600" />

                  <p className="text-xs leading-6 text-stone-700">
                    The governing-law section and
                    any entity-specific regulatory
                    language should be completed
                    after the relevant legal
                    structure and jurisdictions
                    have been confirmed.
                  </p>
                </div>
              </div>
            </div>
          </TermsReveal>
        </Container>
      </section>

      {/* NAVIGATION */}

      <section className="sticky top-0 z-20 border-b border-forest-900/10 bg-white/95 py-4 backdrop-blur-xl">
        <Container>
          <TermsRevealSoft>
            <nav
              aria-label="Terms sections"
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
          </TermsRevealSoft>
        </Container>
      </section>

      {/* TERMS */}

      <section className="bg-white">
        <Container>
          <div className="mx-auto max-w-6xl">
            {termsSections.map(
              (section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-32 border-b border-forest-900/10 py-14 last:border-b-0 sm:py-16 lg:py-20"
                >
                  <div className="grid gap-7 lg:grid-cols-[0.55fr_1.45fr] lg:gap-20">
                    <TermsReveal>
                      <div className="lg:sticky lg:top-28 lg:self-start">
                        <p className="font-display text-2xl text-gold-600">
                          {section.number}
                        </p>

                        <h2 className="font-display mt-4 max-w-sm text-3xl leading-[1.05] font-medium tracking-[-0.03em] text-forest-950">
                          {section.title}
                        </h2>
                      </div>
                    </TermsReveal>

                    <TermsReveal delay={0.05}>
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
                        "investment-risk" ? (
                          <Link
                            href="/risk-disclosure"
                            className="focus-ring mt-7 inline-flex items-center gap-2 text-sm font-semibold text-forest-950 transition hover:text-gold-600"
                          >
                            Read the Risk
                            Disclosure

                            <ArrowUpRight className="size-4" />
                          </Link>
                        ) : null}

                        {section.id ===
                        "privacy" ? (
                          <div className="mt-7 flex flex-wrap gap-4">
                            <Link
                              href="/privacy"
                              className="focus-ring inline-flex items-center gap-2 text-sm font-semibold text-forest-950 transition hover:text-gold-600"
                            >
                              Privacy Policy

                              <ArrowUpRight className="size-4" />
                            </Link>

                            <Link
                              href="/cookies"
                              className="focus-ring inline-flex items-center gap-2 text-sm font-semibold text-forest-950 transition hover:text-gold-600"
                            >
                              Cookie Policy

                              <ArrowUpRight className="size-4" />
                            </Link>
                          </div>
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
                    </TermsReveal>
                  </div>
                </section>
              ),
            )}
          </div>
        </Container>
      </section>

      {/* DOCUMENT HIERARCHY */}

      <section className="border-y border-forest-900/10 bg-ivory-100 py-16 sm:py-20 lg:py-24">
        <Container>
          <TermsReveal>
            <div className="grid gap-10 rounded-4xl bg-forest-950 p-7 text-white sm:p-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16 lg:p-12">
              <div>
                <Scale className="size-7 text-gold-400" />

                <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                  Document hierarchy
                </p>

                <h2 className="font-display mt-4 text-3xl font-medium tracking-[-0.03em] sm:text-4xl">
                  Platform terms and investment
                  terms serve different purposes.
                </h2>
              </div>

              <div className="space-y-6 text-sm leading-7 text-white/65">
                <p>
                  These Terms establish the
                  general conditions for accessing
                  and using the Tevuah Reserve
                  digital platform.
                </p>

                <p>
                  When an investor enters into a
                  specific investment, separate
                  documentation may establish the
                  investment amount, ownership or
                  economic interest, rights,
                  obligations, restrictions,
                  distributions and other terms
                  applicable to that investment.
                </p>

                <p>
                  Investors should therefore read
                  both the platform terms and all
                  documents applicable to the
                  investment they are considering.
                </p>
              </div>
            </div>
          </TermsReveal>
        </Container>
      </section>

      {/* SECURITY */}

      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <TermsReveal>
            <div className="grid gap-10 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-10">
              <span className="flex size-14 items-center justify-center rounded-full bg-forest-950 text-gold-400">
                <ShieldCheck className="size-6" />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Secure use
                </p>

                <h2 className="font-display mt-4 max-w-3xl text-3xl font-medium tracking-[-0.03em] text-forest-950 sm:text-4xl">
                  Protect your investor account
                  and verify unusual requests.
                </h2>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
                  Contact Tevuah Reserve if you
                  suspect unauthorised account
                  activity or receive unexpected
                  instructions involving sensitive
                  information or investment
                  funding.
                </p>
              </div>

              <Button
                href="/contact"
                variant="secondary"
                className="w-fit"
              >
                Contact us

                <ArrowUpRight className="size-4" />
              </Button>
            </div>
          </TermsReveal>
        </Container>
      </section>

      {/* RELATED POLICIES */}

      <section className="border-t border-forest-900/10 py-16 sm:py-20">
        <Container>
          <TermsReveal>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Related information
              </p>

              <h2 className="font-display mt-5 text-4xl font-medium tracking-[-0.035em] text-forest-950">
                Read alongside these Terms.
              </h2>
            </div>
          </TermsReveal>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {[
              {
                href: "/risk-disclosure",
                title: "Risk Disclosure",
                description:
                  "Important risks associated with private investments and opportunities presented through Tevuah Reserve.",
              },
              {
                href: "/privacy",
                title: "Privacy Policy",
                description:
                  "How personal information is collected, used, protected and handled through the platform.",
              },
              {
                href: "/cookies",
                title: "Cookie Policy",
                description:
                  "Information about cookies and similar technologies used through the website and platform.",
              },
            ].map((item) => (
              <TermsRevealSoft
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
                    Read policy

                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              </TermsRevealSoft>
            ))}
          </div>
        </Container>
      </section>

      {/* FOOTNOTE */}

      <section className="border-t border-forest-900/10 bg-white py-8">
        <Container>
          <TermsRevealSoft>
            <div className="flex flex-col gap-3 text-xs leading-6 text-stone-500 sm:flex-row sm:items-start sm:justify-between">
              <p>Terms of Use</p>

              <p className="max-w-3xl sm:text-right">
                These Terms govern use of the
                Tevuah Reserve website and
                platform. Investment-specific
                rights and obligations are
                governed by the applicable
                investment documentation.
              </p>
            </div>
          </TermsRevealSoft>
        </Container>
      </section>
    </main>
  );
}