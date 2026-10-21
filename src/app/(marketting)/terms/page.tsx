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
      "These Terms of Use govern your access to and use of the Tevuah Reserve website, investor platform and related digital services.",
      "By accessing or using the website or platform, you agree to comply with these Terms. If you do not agree, you must discontinue use of the website and platform.",
      "Additional terms, agreements or disclosures may apply to particular services, investor accounts or investment opportunities. Where applicable, those documents must be read together with these Terms.",
    ],
  },

  {
    id: "platform-purpose",
    number: "02",
    title: "Purpose of the platform",
    paragraphs: [
      "Tevuah Reserve provides information about its activities, investment opportunities, productive agricultural assets, agricultural technology, fine wine and related investor services.",
      "Subject to approval, eligibility and applicable requirements, investors may receive access to platform features for onboarding, identity verification, investment documentation, funding information, transaction records, portfolio reporting and related investment administration.",
      "Access to individual features and services may depend on account status, verification, jurisdiction, eligibility, opportunity availability and other applicable requirements.",
    ],
  },

  {
    id: "no-public-registration",
    number: "03",
    title: "Investor access and account creation",
    paragraphs: [
      "Tevuah Reserve does not offer unrestricted public self-registration for investor accounts. Prospective investors may begin by submitting an enquiry through the Contact page.",
      "Where appropriate, Tevuah Reserve will explain the applicable onboarding process and any information or documentation required to proceed.",
      "Investor accounts are established through Tevuah Reserve's administrative process after the relevant onboarding requirements have been completed. Account creation or access does not guarantee approval to invest, eligibility for a particular opportunity or the availability of an investment allocation.",
      "Tevuah Reserve may request identity and address verification, investor classification, eligibility information, source-of-funds documentation or other information required for compliance, account administration or applicable legal obligations.",
      "An enquiry, onboarding request or submission of documents does not create an obligation for Tevuah Reserve to approve an account or accept an investment.",
    ],
  },

  {
    id: "account-security",
    number: "04",
    title: "Account security and authorised use",
    paragraphs: [
      "If you receive access to an investor account, you are responsible for maintaining the confidentiality of your login credentials and taking reasonable steps to prevent unauthorised access.",
      "You must notify Tevuah Reserve promptly if you suspect that your account has been compromised, your credentials have been disclosed or unauthorised activity has occurred.",
      "Tevuah Reserve may take appropriate measures to investigate suspected unauthorised activity and protect accounts, information and platform security.",
    ],
    points: [
      "Share your login credentials with unauthorised persons.",
      "Access or attempt to access another investor's account or restricted information.",
      "Circumvent authentication procedures, permissions or security controls.",
      "Provide false, misleading or materially incomplete information during account or investment processes.",
      "Ignore suspicious requests involving account access, personal information or payment instructions.",
    ],
  },

  {
    id: "eligibility",
    number: "05",
    title: "Eligibility and verification",
    paragraphs: [
      "Information available on the public website does not mean that every investment opportunity is available to every person.",
      "Access to investment opportunities may be restricted by investor classification, financial eligibility, jurisdiction, regulatory requirements, verification results or other applicable conditions.",
      "Before an investment can proceed, Tevuah Reserve may require identity verification, address verification, compliance checks, source-of-funds information and other documentation relevant to the proposed investment.",
      "Tevuah Reserve may decline an enquiry, withhold approval, restrict access or discontinue an onboarding or investment process where applicable requirements have not been satisfied or where proceeding would be inappropriate under the circumstances.",
      "Investors must provide accurate information and promptly notify Tevuah Reserve of material changes to information previously supplied.",
    ],
  },

  {
    id: "investment-information",
    number: "06",
    title: "Investment information",
    paragraphs: [
      "The website and platform may provide information about investment opportunities, underlying assets, operators, investment structures, target returns, expected durations, funding progress, valuations, operating performance and related documentation.",
      "Website summaries and other general descriptions are intended to help users understand the opportunities presented. They do not replace the definitive documentation governing a particular investment.",
      "Before committing capital, investors should review the relevant investment agreements, offering or subscription documents, risk disclosures, fee information, ownership arrangements, distribution provisions and other applicable materials.",
      "Investors are responsible for evaluating the information provided, asking questions about matters they do not understand and obtaining independent professional advice where appropriate.",
    ],
  },
  {
    id: "Availability of Investment Opportunities",
    number: "06",
    title: "Availability of Investment Opportunities",
    paragraphs: [
      "The publication of an investment opportunity does not, by itself, create a contractual right to invest, reserve an allocation or require Tevuah Reserve or another relevant party to accept a proposed investment.",
      "Participation may be subject to eligibility, verification, available capacity, execution of the required documents, acceptance of the investment and satisfaction of applicable funding conditions.",
      "Tevuah Reserve may update, pause, close, withdraw or discontinue an opportunity, subject to applicable law and any rights or obligations established under binding investment-specific agreements.",
      "An investor's rights in an accepted investment are determined by the applicable investment documentation.",
    ],
  },

  // {
  //   id: "no-offer",
  //   number: "07",
  //   title: "No automatic offer or entitlement",
  //   paragraphs: [
  //     "The presence of information about an opportunity on the website or platform does not by itself create a contractual right to invest, reserve capacity or require Tevuah Reserve or any relevant investment vehicle, issuer, operator or other party to accept an investment.",
  //     "An investment may be subject to availability, eligibility, verification, documentation, acceptance, funding and other applicable conditions.",
  //     "Tevuah Reserve may close, withdraw, pause or amend the availability of an opportunity where appropriate, subject to any rights that have already arisen under binding investment-specific agreements.",
  //   ],
  // },

  {
    id: "investment-risk",
    number: "08",
    title: "Investment risk",
    paragraphs: [
      "Investments involve risk, including the possible loss of some or all invested capital. Investment values may decline, actual performance may differ from expectations, and distributions may be lower than anticipated, delayed, suspended or not made.",
      "Private investments may be illiquid and may need to be held for an extended period. An investor may not be able to sell, transfer or exit an investment when desired.",
      "Investments involving agricultural assets, vineyards, olive estates, agricultural technology and fine wine may be exposed to operational, environmental, climatic, market, production, storage, valuation, regulatory and other asset-specific risks.",
      "Target returns, projected distributions, estimated valuations, forecasts and expected investment durations are not guarantees of future results.",
      "Investors must review the Tevuah Reserve Risk Disclosure and all relevant opportunity-specific risk information before making an investment decision.",
    ],
  },

  {
    id: "No Personalised Professional Advice",
    number: "09",
    title: "No personalised professional advice",
    paragraphs: [
      "Information provided through the website or platform is general in nature and does not, by itself, constitute personalised financial, investment, legal, tax or accounting advice.",
      "Information about an opportunity, asset or investment process should not be treated as a recommendation that the investment is suitable for a particular person.",
      "Each investor is responsible for assessing their own financial circumstances, investment objectives, risk tolerance, liquidity needs and ability to bear potential losses. Independent professional advice should be obtained where appropriate.",
      "Nothing in these Terms excludes any obligation or responsibility that cannot lawfully be excluded.",
    ],
  },

  {
    id: "accuracy",
    number: "10",
    title: "Information, accuracy and availability",
    paragraphs: [
      "Tevuah Reserve seeks to provide information that is clear, relevant and maintained with appropriate care. Information displayed on the website or platform may originate from asset operators, data providers, valuation specialists, custodians, service providers or other third parties.",
      "Such information may be delayed, revised, incomplete or subject to error. Tevuah Reserve does not represent that every item of information supplied by a third party is independently verified or continuously updated.",
      "Operational, agricultural, market and valuation information should be assessed in light of its source, reporting date, methodology and limitations. Information displayed on the platform should not be assumed to reflect real-time conditions unless expressly stated.",
      "Tevuah Reserve may correct, update, supplement or remove information when necessary or appropriate.",
    ],
  },

  {
    id: "forward-looking",
    number: "11",
    title: "Forward-looking information",
    paragraphs: [
      "The website and platform may contain estimates, forecasts, projections, target returns, anticipated distributions, expected durations and other statements concerning future performance.",
      "These statements are based on assumptions and expectations that may not be realised. Actual results may differ materially because of market conditions, financial performance, operating decisions, agricultural outcomes, environmental events, regulatory changes or other factors.",
      "Forward-looking information is provided for informational purposes and must not be interpreted as a promise, warranty or guarantee of future performance.",
      "Investors should consider the assumptions, limitations and risks underlying such information before making a decisio",
    ],
  },

  {
    id: "funding",
    number: "12",
    title: "Funding instructions and payments",
    paragraphs: [
      "Where an investment proceeds, funding instructions will be provided through authorised Tevuah Reserve processes or other approved channels.",
      "Before transferring funds, investors must verify the payment details and confirm that the instructions relate to the intended investment.",
      "Any unexpected change to payment instructions must be independently verified through an authorised Tevuah Reserve contact before funds are transferred. Investors should not rely solely on an unsolicited email, message or telephone call requesting payment to new or different account details.",
      "Tevuah Reserve should be notified promptly of suspected payment fraud, incorrect transfers or suspicious funding requests.",
      "The applicable investment documentation and authorised funding instructions govern the payment requirements for each investment.",
    ],
  },

  {
    id: "joint-investments",
    number: "13",
    title: "Joint investments",
    paragraphs: [
      "Where joint investment is permitted, each participating investor may be required to provide separate consent, verification, signatures, acknowledgements or other information before the investment can proceed.",
      "Each participant is responsible for reviewing the documentation applicable to their participation and understanding the rights and obligations associated with the arrangement.",
      "Ownership, decision-making authority, transfer restrictions, distributions and other matters relating to a joint investment are governed by the relevant investment-specific agreements.",
      "Use of a joint-investment feature on the platform does not, by itself, establish ownership rights or override the applicable legal documentation.",
    ],
  },

  {
    id: "documents",
    number: "14",
    title: "Documents and electronic records",
    paragraphs: [
      "The platform may provide access to investment agreements, disclosures, statements, transaction records, notices and other documents in electronic form.",
      "Users are responsible for reviewing documents made available to them and retaining copies where appropriate.",
      "Electronic acknowledgements, signatures and records may be used where supported by the relevant process and permitted by applicable law. Their legal effect depends on the applicable documentation and circumstances.",
      "The existence of a document or record on the platform does not, by itself, establish that an investment has been accepted, funded or completed.",
    ],
  },

  {
    id: "acceptable-use",
    number: "15",
    title: "Acceptable use",
    paragraphs: [
      "You must use the website and platform lawfully and must not interfere with their security, integrity, operation or availability.",
    ],
    points: [
      "Use the website or platform for fraudulent, unlawful or misleading activities.",
      "Attempt to gain unauthorised access to accounts, systems, databases or restricted information.",
      "Introduce malicious code, malware or other harmful technology.",
      "Probe, scan or test security controls without express authorisation.",
      "Scrape, harvest or systematically extract protected information without permission.",
      "Impersonate another person or misrepresent your authority to act for another individual or entity.",
      "Interfere with the platform's normal operation or attempt to circumvent access restrictions.",
      "Use platform information in a manner that infringes intellectual-property rights, confidentiality obligations or applicable law.",
      "Tevuah Reserve may investigate suspected misuse and take appropriate action, including restricting access where necessary.",
    ],
  },

  {
    id: "intellectual-property",
    number: "16",
    title: "Intellectual property",
    paragraphs: [
      "Unless otherwise indicated, the website and platform, including their branding, design, text, graphics, software, interfaces and original content, are owned by or licensed to Tevuah Reserve and are protected by applicable intellectual-property laws.",
      "You may access and use platform content for lawful personal review and permitted internal investment evaluation, subject to these Terms and any applicable confidentiality or document restrictions.",
      "You must not reproduce, distribute, modify, commercially exploit or create derivative works from protected content without the necessary permission, except where applicable law expressly permits such use.",
      "Access to the website or platform does not transfer ownership of any intellectual-property rights.",
    ],
  },

  {
    id: "third-party",
    number: "17",
    title: "Third-party services and information",
    paragraphs: [
      "The website and platform may incorporate or link to third-party services, information or infrastructure. These may include technology providers, banking or payment services, data providers, asset operators, custodians, advisers and other service providers.",
      "Third-party services may be governed by separate terms, privacy notices and other conditions. Users are responsible for reviewing those conditions where applicable.",
      "Tevuah Reserve does not control every third-party system or information source and cannot guarantee that third-party services will remain continuously available or that all third-party information will be accurate, complete or current.",
      "Nothing in this section limits any responsibility that applicable law requires Tevuah Reserve to retain.",
    ],
  },

  {
    id: "availability",
    number: "18",
    title: "Platform availability and changes",
    paragraphs: [
      "Tevuah Reserve may maintain, update, modify, suspend or discontinue features of the website or platform from time to time.",
      "Continuous or uninterrupted availability is not guaranteed. Maintenance, technical failures, security incidents, communications outages and third-party service interruptions may affect access or functionality.",
      "Where reasonably practicable, changes affecting active investor processes will be handled consistently with applicable legal obligations and binding investment agreements.",
      "Changes to platform features do not, by themselves, amend or extinguish rights established under a separate binding investment agreement.",
    ],
  },

  {
    id: "suspension",
    number: "19",
    title: "Suspension or restriction of access",
    paragraphs: [
      "Tevuah Reserve may restrict or suspend access where reasonably necessary to protect accounts or information, maintain platform security, investigate suspected misuse, address compliance concerns, respond to legal requirements or protect the integrity of the platform.",
      "Where appropriate and permitted, Tevuah Reserve may request additional information or verification before restoring access.",
      "A restriction or suspension of platform access does not, by itself, cancel, amend or extinguish rights or obligations arising under a separate binding investment agreement.",
      "Any action affecting an existing investment remains subject to applicable law and the relevant investment documentation.",
    ],
  },

  {
    id: "privacy",
    number: "20",
    title: "Privacy and personal information",
    paragraphs: [
      "Use of the website and platform may involve the collection and processing of personal information submitted through enquiries, onboarding, identity verification, account administration and investment activity.",
      "Personal information will be handled in accordance with the applicable Tevuah Reserve Privacy Policy and relevant data-protection requirements.",
      "Cookies and similar technologies used on the website or platform are addressed in the Cookie Policy.",
      "Please review these policies to understand how personal information is handled and how cookies and similar technologies are used.",
    ],
  },

  {
    id: "liability",
    number: "21",
    title: "Responsibility and limitations",
    paragraphs: [
      "Nothing in these Terms excludes or limits liability where such exclusion or limitation is prohibited by applicable law.",
      "Subject to applicable law and any binding agreement, Tevuah Reserve does not guarantee uninterrupted access to the platform, the accuracy or availability of every third-party information source, the achievement of investment projections or any particular investment outcome.",
      "Investment performance may be affected by market conditions, asset operations, environmental events, liquidity constraints and other risks specific to the relevant investment.",
      "The fact that an investment performs differently from a forecast or target does not, by itself, establish that the website or platform has failed to operate as intended.",
      "Any limitation of liability under these Terms applies only to the extent permitted by applicable law.",
    ],
  },

  {
    id: "indemnity",
    number: "22",
    title: "Responsibility for misuse",
    paragraphs: [
      "You are responsible for your unlawful, fraudulent or unauthorised use of the website or platform and for information you knowingly provide that is false or misleading.",
      "Tevuah Reserve may take appropriate steps in response to suspected misuse, subject to applicable law and any relevant contractual obligations.",
      "Nothing in this section creates liability beyond that permitted by applicable law or removes rights and protections that cannot lawfully be waived.",
    ],
  },

  {
    id: "investment-agreements",
    number: "23",
    title: "Relationship with investment-specific agreements",
    paragraphs: [
      "These Terms govern access to and use of the Tevuah Reserve website and platform. They do not replace the subscription agreements, investment agreements, joint-investment agreements, risk disclosures or other binding documents applicable to an individual investment.",
      "Investment-specific documents govern matters such as the investment amount, ownership or economic interest, investor rights, restrictions, fees, distributions, duration, transfer arrangements and exit provisions.",
      "Where these Terms conflict with a binding investment-specific agreement concerning a particular investment, the investment-specific agreement will govern that matter to the extent of the conflict, subject to applicable law.",
      "Investors should review all relevant documents before committing capital.",
    ],
  },

  {
    id: "changes",
    number: "24",
    title: "Changes to these Terms",
    paragraphs: [
      "Tevuah Reserve may revise these Terms to reflect changes to the website, platform, services, security practices, business operations or applicable legal requirements.",
      "The current version will be made available through the website. The date of the latest revision should be stated at the beginning of the document.",
      "Where applicable law or a separate agreement requires notice, consent or another formal process for changes, that process will be followed.",
      "Continued use of the website or platform following a revision will have the effect provided by applicable law. Where affirmative acceptance is legally required, continued use alone will not replace that requirement.",
    ],
  },

  {
    id: "severability",
    number: "25",
    title: "Severability",
    paragraphs: [
      "If any provision of these Terms is determined to be invalid, unlawful or unenforceable, the remaining provisions will continue to apply to the extent permitted by applicable law.",
      "The invalidity or unenforceability of one provision will not automatically invalidate the remaining provisions.",
    ],
  },

  {
    id: "governing-law",
    number: "26",
    title: "Governing law and jurisdiction",
    paragraphs: [
      "These Terms will be governed by the law specified in the final, legally approved version of this document. Any applicable court jurisdiction must likewise be identified in that version.",
      "Nothing in these Terms is intended to displace mandatory legal protections or jurisdictional requirements that apply under applicable law.",
    ],
  },

  {
    id: "contact",
    number: "27",
    title: "Questions about these Terms",
    paragraphs: [
      "For questions concerning these Terms or the operation of the Tevuah Reserve website and platform, please contact Tevuah Reserve through the Contact page.",
      "Requests concerning personal information, complaints, account access or investment administration may be subject to separate procedures and requirements.",
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
                These Terms of Use govern access to and use of the Tevuah Reserve website, investor platform and related digital services.
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
                  They govern access to Tevuah Reserve's digital services and do not replace the agreements, disclosures or other documents governing an individual investment.
                </h2>

                <p className="mt-6 max-w-4xl text-sm leading-7 text-stone-700 sm:text-base sm:leading-8">
                  An investment may be subject to separate subscription agreements, investment agreements, risk disclosures and other documentation. Those documents establish the specific rights, obligations and economic terms applicable to the investment.
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
                  Terms governing access to Tevuah Reserve.
                </h2>
              </div>

              <div>
                <p className="text-sm leading-7 text-stone-700">
                  These Terms of Use establish the conditions for accessing and using the Tevuah Reserve website, investor platform and related services. They should be read alongside the applicable investment agreements, disclosures and policies.
                </p>

                <div className="mt-6 flex items-start gap-4 rounded-2xl border border-gold-500/25 bg-gold-500/5 p-5">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-gold-600" />

                  <p className="text-xs leading-6 text-stone-700">
                    The rights and obligations associated with an individual investment are governed by the relevant investment documentation. These Terms do not replace those documents or guarantee access to any investment opportunity.
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
                  Relationship Between Platform Terms and Investment Documents
                </h2>
              </div>

              <div className="space-y-6 text-sm leading-7 text-white/65">
                <p>
                  These Terms establish the general conditions governing access to and use of the Tevuah Reserve website and platform.
                </p>

                <p>
                  A specific investment is governed by its applicable legal and investment documentation, which sets out the relevant investment amount, ownership or economic interest, rights, obligations, fees, restrictions, distributions and other material terms.
                </p>

                <p>
                  Investors should review both these Terms and all documentation applicable to the investment they are considering. If any information is unclear or incomplete, clarification should be obtained before capital is committed.
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
                  Protecting Your Account
                </h2>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
                  Keep your investor account credentials secure and verify unexpected requests involving sensitive information or investment funding.
                </p>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
                  If you suspect unauthorised account activity or receive suspicious payment instructions, contact Tevuah Reserve through an authorised contact channel.
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
                  "Review the risks associated with private investments, asset ownership, liquidity, valuations, operating performance and potential investment losses.",
              },
              {
                href: "/privacy",
                title: "Privacy Policy",
                description:
                  "Review how personal information is collected, used, retained and protected in connection with the website and platform.",
              },
              {
                href: "/cookies",
                title: "Cookie Policy",
                description:
                  "Review information about cookies and similar technologies used through the website and platform.",
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