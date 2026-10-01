import type {
  Metadata,
} from "next";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowDown,
  ArrowUpRight,
  BarChart3,
  Cookie,
  Fingerprint,
  LockKeyhole,
  Settings2,
  ShieldCheck,
} from "lucide-react";

import {
  CookiesHeroImage,
  CookiesHeroLine,
  CookiesHeroOverlay,
  CookiesHeroReveal,
  CookiesReveal,
  CookiesRevealSoft,
} from "@/src/components/cookies/cookies-motion";

import {
  Button,
} from "@/src/components/ui/button";

import {
  Container,
} from "@/src/components/ui/container";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Information about cookies and similar technologies used through the Tevuah Reserve website and investor platform.",
};

type CookieSection = {
  id: string;
  number: string;
  title: string;
  paragraphs?: string[];
  points?: string[];
};

const cookieSections: CookieSection[] = [
  {
    id: "scope",
    number: "01",
    title: "About this Cookie Policy",
    paragraphs: [
      "This Cookie Policy explains how cookies and similar technologies may be used when you access the Tevuah Reserve website and investor platform.",
      "It should be read together with the Tevuah Reserve Privacy Policy, which provides broader information about how personal information is collected, used, protected and handled.",
      "The technologies actually used by the platform may change as functionality, infrastructure and service providers develop. Tevuah Reserve should maintain an accurate inventory of technologies in use and update this policy where material changes occur.",
    ],
  },

  {
    id: "what-are-cookies",
    number: "02",
    title: "What are cookies?",
    paragraphs: [
      "Cookies are small pieces of information that a website can store on a browser or device and later access. They can support functions such as maintaining a session, recognising an authenticated user, remembering a preference or supporting website security.",
      "Some cookies last only for the duration of a browsing session. Others may remain on a device for a defined period or until they are removed.",
      "The term cookie is often used alongside other technologies that can store or access information on a device. Where appropriate, references to cookies in this policy also include comparable storage or access technologies.",
    ],
  },

  {
    id: "similar-technologies",
    number: "03",
    title: "Similar technologies",
    paragraphs: [
      "Websites and digital applications may use technologies other than traditional browser cookies to store or access information. Depending on implementation, these can include local browser storage, session storage, software-development tools, pixels, tags or comparable technologies.",
      "The legal treatment of a technology can depend on how it operates, what information it uses, its purpose and the law applicable to the relevant user.",
      "Tevuah Reserve should assess storage and access technologies according to their actual function rather than relying only on the name given to the technology.",
    ],
  },

  {
    id: "necessary",
    number: "04",
    title: "Strictly necessary and essential technologies",
    paragraphs: [
      "Certain technologies may be necessary for the website or investor platform to provide functionality requested by a user or to operate securely.",
      "Depending on the platform implementation, necessary technologies may support authentication, session management, security, load balancing, account access, request integrity or the recording of privacy preferences.",
      "Where applicable law permits necessary technologies to operate without prior consent, they should still be described transparently where required.",
    ],
    points: [
      "Maintaining secure authenticated investor sessions.",
      "Protecting account access and platform security.",
      "Supporting essential website or application functionality.",
      "Maintaining request or session integrity.",
      "Remembering privacy or cookie choices where a preference mechanism is provided.",
    ],
  },

  {
    id: "authentication",
    number: "05",
    title: "Authentication and account access",
    paragraphs: [
      "Authenticated investor functionality may require browser storage or cookies to maintain secure account sessions and recognise whether a user is signed in.",
      "Disabling technologies that are essential to authentication or session management may prevent an investor from signing in or using protected areas of the platform.",
      "Authentication technologies should be configured and used only for appropriate account, session and security purposes.",
    ],
  },

  {
    id: "security",
    number: "06",
    title: "Security technologies",
    paragraphs: [
      "Cookies or similar technologies may be used where appropriate to protect the platform, maintain session integrity, identify suspicious requests or support other security controls.",
      "Security-related technologies should be proportionate to the relevant risk and should not be repurposed for unrelated tracking without appropriate assessment and, where required, user choice.",
    ],
  },

  {
    id: "preferences",
    number: "07",
    title: "Preference technologies",
    paragraphs: [
      "The platform may use technologies to remember choices made by a user, such as privacy preferences or other settings that improve or maintain the requested experience.",
      "Whether a preference technology requires consent depends on its purpose, implementation and the law applicable to the relevant user.",
    ],
  },

  {
    id: "analytics",
    number: "08",
    title: "Analytics and performance technologies",
    paragraphs: [
      "Analytics technologies can be used to understand how visitors interact with a website, identify technical problems, measure performance and improve digital services.",
      "This policy does not state that Tevuah Reserve currently uses a particular analytics provider or analytics cookie because a verified production cookie inventory has not yet been established.",
      "If analytics technologies are introduced or confirmed, Tevuah Reserve should document the provider, purpose, information involved, duration and applicable user choice or consent requirements before representing those technologies as part of the production platform.",
    ],
  },

  {
    id: "marketing",
    number: "09",
    title: "Advertising and marketing technologies",
    paragraphs: [
      "Advertising, behavioural profiling and cross-site tracking technologies can involve materially different privacy considerations from technologies required to operate an investor account.",
      "This policy does not state that Tevuah Reserve currently uses behavioural advertising, retargeting or cross-site marketing cookies.",
      "If such technologies are introduced, they should be separately assessed and should not be activated merely because a user accesses the website where applicable law requires prior consent or another form of user choice.",
    ],
  },

  {
    id: "third-party",
    number: "10",
    title: "First-party and third-party technologies",
    paragraphs: [
      "A first-party cookie is generally set in connection with the domain a person is visiting. A third-party technology may be provided by another organisation whose service is integrated into the website or platform.",
      "Third-party technologies may be associated with infrastructure, embedded content, analytics, communications or other services.",
      "Before using a third-party technology, Tevuah Reserve should understand what information the provider receives, the purposes for which it is used, how long the technology operates and any applicable privacy or consent requirements.",
    ],
  },

  {
    id: "duration",
    number: "11",
    title: "Session and persistent cookies",
    paragraphs: [
      "Session cookies generally operate for a limited browsing session and may expire when the session or browser is closed.",
      "Persistent cookies can remain on a device for a longer defined period and may be used, for example, to remember a setting or recognise a returning browser.",
      "Cookie duration should be appropriate to the purpose for which the technology is used. Tevuah Reserve should not publish specific expiry periods until those periods have been verified against the technologies actually deployed.",
    ],
  },

  {
    id: "consent",
    number: "12",
    title: "Consent and user choice",
    paragraphs: [
      "Cookie and device-storage requirements vary by jurisdiction and by the purpose of the relevant technology.",
      "Where applicable law requires consent or another user choice before a non-essential technology is used, Tevuah Reserve should provide an appropriate mechanism before activating that technology.",
      "Where consent is relied upon, users should receive sufficiently clear information to understand what they are choosing and should be able to change or withdraw that choice where required by applicable law.",
    ],
  },

  {
    id: "managing",
    number: "13",
    title: "Managing cookies",
    paragraphs: [
      "Most modern browsers provide controls that allow users to inspect, block or delete cookies and other site data.",
      "Blocking all cookies or browser storage can affect website functionality. In particular, disabling technologies required for authentication or session management may prevent access to protected investor functionality.",
      "Where Tevuah Reserve provides an on-site cookie or privacy-preference control, users may also be able to manage optional technologies through that control.",
    ],
  },

  {
    id: "browser",
    number: "14",
    title: "Browser controls",
    paragraphs: [
      "Browser settings commonly provide options for deleting stored cookies, blocking cookies, limiting third-party cookies or controlling site-specific storage.",
      "The exact controls vary between browsers and devices. Users should refer to the current settings and support information provided by their browser or device provider.",
      "Changing browser settings does not necessarily remove information already stored, so users may need to delete existing site data separately if that is their intention.",
    ],
  },

  {
    id: "inventory",
    number: "15",
    title: "Cookie inventory",
    paragraphs: [
      "A production Cookie Policy should accurately identify the material cookies and similar technologies actually used by the website and investor platform.",
      "Before Tevuah Reserve publishes a definitive cookie inventory, the deployed application should be audited in a production-like environment, including public pages, authentication, investor account access and any enabled third-party integrations.",
      "The resulting inventory should record, where appropriate, the technology name, provider, purpose, category, duration and whether user consent or another choice mechanism applies.",
    ],
  },

  {
    id: "changes",
    number: "16",
    title: "Changes to this Cookie Policy",
    paragraphs: [
      "Tevuah Reserve may update this Cookie Policy as website functionality, platform infrastructure, service providers, technologies or applicable legal requirements change.",
      "Material changes to the technologies used by the platform should trigger a review of both this policy and any cookie or privacy-preference mechanism in use.",
      "Where applicable law requires renewed consent or additional notice following a change, the appropriate process should be followed.",
    ],
  },

  {
    id: "privacy",
    number: "17",
    title: "Personal information and privacy",
    paragraphs: [
      "Information obtained through cookies or similar technologies may constitute or be associated with personal information depending on the technology and circumstances.",
      "The Tevuah Reserve Privacy Policy provides broader information about the handling of personal information, including purposes, sharing, retention, security and applicable privacy rights.",
    ],
  },

  {
    id: "contact",
    number: "18",
    title: "Questions about cookies",
    paragraphs: [
      "If you have a question about this Cookie Policy or the use of browser or device-storage technologies through Tevuah Reserve, you may contact Tevuah Reserve through the Contact page.",
      "Jurisdiction-specific contact information or regulatory references should be added where required once the applicable legal entity and operating jurisdictions have been confirmed.",
    ],
  },
];

const navigation = [
  ["#what-are-cookies", "Cookies"],
  ["#necessary", "Essential"],
  ["#authentication", "Authentication"],
  ["#analytics", "Analytics"],
  ["#marketing", "Marketing"],
  ["#consent", "Consent"],
  ["#managing", "Controls"],
  ["#inventory", "Inventory"],
] as const;

export default function CookiePolicyPage() {
  return (
    <main className="bg-ivory-100">
      {/* ==========================================
          HERO
      ========================================== */}

      <section className="relative flex min-h-145 items-end overflow-hidden bg-forest-950 pt-19 text-white lg:pt-22">
        <CookiesHeroImage className="absolute inset-0">
          <Image
            src="/images/hero/estates-page-hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </CookiesHeroImage>

        <CookiesHeroOverlay
          className="absolute inset-0 bg-linear-to-r from-forest-950 via-forest-950/94 to-forest-950/45"
          delay={0.04}
        />

        <CookiesHeroOverlay
          className="absolute inset-0 bg-linear-to-t from-forest-950/95 via-forest-950/25 to-forest-950/25"
          delay={0.1}
        />

        <Container className="relative z-10 pb-14 pt-24 sm:pb-18 lg:pb-20">
          <div className="max-w-5xl">
            <CookiesHeroReveal delay={0.1}>
              <div className="flex items-center gap-3">
                <CookiesHeroLine className="h-px w-10 origin-left bg-gold-400" />

                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
                  Privacy & technology
                </p>
              </div>
            </CookiesHeroReveal>

            <CookiesHeroReveal delay={0.2}>
              <h1 className="font-display mt-7 text-5xl leading-[0.94] font-medium tracking-[-0.045em] sm:text-6xl lg:text-8xl">
                Cookie Policy
              </h1>
            </CookiesHeroReveal>

            <CookiesHeroReveal delay={0.31}>
              <p className="mt-7 max-w-3xl text-base leading-8 text-white/65 sm:text-lg">
                Understand how cookies and
                similar technologies may support
                functionality, security,
                preferences and other digital
                services across Tevuah Reserve.
              </p>
            </CookiesHeroReveal>

            <CookiesHeroReveal
              delay={0.41}
              className="mt-10 sm:mt-12"
            >
              <Button
                href="#cookie-introduction"
                size="lg"
              >
                Read the policy

                <ArrowDown className="size-4" />
              </Button>
            </CookiesHeroReveal>
          </div>
        </Container>
      </section>

      {/* ==========================================
          INTRODUCTION
      ========================================== */}

      <section
        id="cookie-introduction"
        className="scroll-mt-28 border-b border-forest-900/10 bg-white py-16 sm:py-20 lg:py-24"
      >
        <Container>
          <CookiesReveal>
            <div className="grid gap-8 rounded-4xl border border-forest-900/10 bg-ivory-100 p-7 sm:p-10 lg:grid-cols-[auto_1fr] lg:gap-10 lg:p-12">
              <span className="flex size-14 items-center justify-center rounded-full bg-forest-950 text-gold-400">
                <Cookie className="size-6" />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Clear technology choices
                </p>

                <h2 className="font-display mt-4 max-w-4xl text-3xl font-medium tracking-[-0.03em] text-forest-950 sm:text-4xl">
                  Cookies should have a clear
                  purpose — and users should
                  understand that purpose.
                </h2>

                <p className="mt-6 max-w-4xl text-sm leading-7 text-stone-700 sm:text-base sm:leading-8">
                  Some browser technologies can
                  be important for secure account
                  access and core functionality.
                  Others may be optional and can
                  require additional user choice,
                  depending on their purpose and
                  applicable law.
                </p>
              </div>
            </div>
          </CookiesReveal>
        </Container>
      </section>

      {/* ==========================================
          CATEGORIES
      ========================================== */}

      <section className="border-b border-forest-900/10 py-16 sm:py-20 lg:py-24">
        <Container>
          <CookiesReveal>
            <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Technology categories
                </p>

                <h2 className="font-display mt-5 text-4xl leading-none font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                  Different purposes require
                  different treatment.
                </h2>

                <p className="mt-6 max-w-md text-sm leading-7 text-stone-600">
                  These categories describe how
                  technologies may be classified.
                  They do not claim that every
                  category is currently deployed
                  by Tevuah Reserve.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: LockKeyhole,
                    title: "Essential",
                    text: "Technologies required for core functionality, authentication or security.",
                    status: "Platform operation",
                  },
                  {
                    icon: Settings2,
                    title: "Preferences",
                    text: "Technologies that may remember settings or choices made by a user.",
                    status: "Purpose dependent",
                  },
                  {
                    icon: BarChart3,
                    title: "Analytics",
                    text: "Technologies that may measure performance and website usage.",
                    status: "Not assumed active",
                  },
                  {
                    icon: Fingerprint,
                    title: "Marketing",
                    text: "Advertising, profiling or cross-site tracking technologies.",
                    status: "Not assumed active",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <CookiesRevealSoft
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

                        <p className="mt-5 border-t border-forest-900/10 pt-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-gold-600">
                          {item.status}
                        </p>
                      </article>
                    </CookiesRevealSoft>
                  );
                })}
              </div>
            </div>
          </CookiesReveal>
        </Container>
      </section>

      {/* ==========================================
          IMPORTANT STATUS
      ========================================== */}

      <section className="border-b border-forest-900/10 bg-white py-14 sm:py-16">
        <Container>
          <CookiesReveal>
            <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Current policy status
                </p>

                <h2 className="font-display mt-5 text-3xl font-medium tracking-[-0.03em] text-forest-950 sm:text-4xl">
                  We should document what the
                  platform actually uses.
                </h2>
              </div>

              <div className="space-y-5 text-sm leading-7 text-stone-700">
                <p>
                  A cookie policy should not list
                  analytics providers, advertising
                  networks, cookie names or
                  retention periods merely because
                  they are common on other
                  websites.
                </p>

                <p>
                  Before the final production
                  policy is published, Tevuah
                  Reserve should audit the
                  technologies actually created
                  or accessed across the public
                  website, authentication flow
                  and authenticated investor
                  platform.
                </p>

                <div className="rounded-2xl border border-gold-500/25 bg-gold-500/5 p-5">
                  <p className="text-xs leading-6 text-stone-700">
                    The verified inventory can
                    then be added with exact
                    cookie or storage names,
                    providers, purposes, durations
                    and applicable user controls.
                  </p>
                </div>
              </div>
            </div>
          </CookiesReveal>
        </Container>
      </section>

      {/* ==========================================
          NAVIGATION
      ========================================== */}

      <section className="sticky top-0 z-20 border-b border-forest-900/10 bg-white/95 py-4 backdrop-blur-xl">
        <Container>
          <CookiesRevealSoft>
            <nav
              aria-label="Cookie Policy sections"
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
          </CookiesRevealSoft>
        </Container>
      </section>

      {/* ==========================================
          POLICY
      ========================================== */}

      <section className="bg-white">
        <Container>
          <div className="mx-auto max-w-6xl">
            {cookieSections.map(
              (section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-32 border-b border-forest-900/10 py-14 last:border-b-0 sm:py-16 lg:py-20"
                >
                  <div className="grid gap-7 lg:grid-cols-[0.55fr_1.45fr] lg:gap-20">
                    <CookiesReveal>
                      <div className="lg:sticky lg:top-28 lg:self-start">
                        <p className="font-display text-2xl text-gold-600">
                          {section.number}
                        </p>

                        <h2 className="font-display mt-4 max-w-sm text-3xl leading-[1.05] font-medium tracking-[-0.03em] text-forest-950">
                          {section.title}
                        </h2>
                      </div>
                    </CookiesReveal>

                    <CookiesReveal delay={0.05}>
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
                    </CookiesReveal>
                  </div>
                </section>
              ),
            )}
          </div>
        </Container>
      </section>

      {/* ==========================================
          COOKIE INVENTORY
      ========================================== */}

      <section className="border-y border-forest-900/10 bg-ivory-100 py-16 sm:py-20 lg:py-24">
        <Container>
          <CookiesReveal>
            <div className="grid gap-10 rounded-4xl bg-forest-950 p-7 text-white sm:p-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16 lg:p-12">
              <div>
                <Cookie className="size-7 text-gold-400" />

                <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                  Production inventory
                </p>

                <h2 className="font-display mt-4 text-3xl font-medium tracking-[-0.03em] sm:text-4xl">
                  Audit first. Publish exact
                  details second.
                </h2>
              </div>

              <div>
                <p className="text-sm leading-7 text-white/65">
                  Before launch, the deployed
                  application should be inspected
                  so the final inventory reflects
                  the technologies users actually
                  encounter.
                </p>

                <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
                  {[
                    {
                      number: "01",
                      title: "Name",
                      text: "Exact cookie, local-storage or comparable technology identifier.",
                    },
                    {
                      number: "02",
                      title: "Provider",
                      text: "The organisation or service responsible for the technology.",
                    },
                    {
                      number: "03",
                      title: "Purpose",
                      text: "Why the technology is used and what functionality it supports.",
                    },
                    {
                      number: "04",
                      title: "Duration",
                      text: "Whether it is session-based or how long it persists.",
                    },
                    {
                      number: "05",
                      title: "Control",
                      text: "Whether it is essential or subject to an applicable preference or consent mechanism.",
                    },
                  ].map((item) => (
                    <div
                      key={item.number}
                      className="grid gap-3 py-5 sm:grid-cols-[55px_140px_1fr]"
                    >
                      <p className="font-display text-lg text-gold-400">
                        {item.number}
                      </p>

                      <p className="text-sm font-semibold text-white">
                        {item.title}
                      </p>

                      <p className="text-sm leading-7 text-white/55">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CookiesReveal>
        </Container>
      </section>

      {/* ==========================================
          USER CONTROL
      ========================================== */}

      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <CookiesReveal>
            <div className="grid gap-10 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-10">
              <span className="flex size-14 items-center justify-center rounded-full bg-forest-950 text-gold-400">
                <Settings2 className="size-6" />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Your controls
                </p>

                <h2 className="font-display mt-4 max-w-3xl text-3xl font-medium tracking-[-0.03em] text-forest-950 sm:text-4xl">
                  Browser settings can provide
                  additional control.
                </h2>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
                  Blocking technologies that are
                  required for secure
                  authentication or essential
                  functionality may prevent parts
                  of the investor platform from
                  working correctly.
                </p>
              </div>

              <Button
                href="/contact"
                variant="secondary"
                className="w-fit"
              >
                Ask a question

                <ArrowUpRight className="size-4" />
              </Button>
            </div>
          </CookiesReveal>
        </Container>
      </section>

      {/* ==========================================
          RELATED POLICIES
      ========================================== */}

      <section className="border-t border-forest-900/10 py-16 sm:py-20">
        <Container>
          <CookiesReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
              Related information
            </p>

            <h2 className="font-display mt-5 text-4xl font-medium tracking-[-0.035em] text-forest-950">
              Privacy and platform information.
            </h2>
          </CookiesReveal>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {[
              {
                href: "/privacy",
                title: "Privacy Policy",
                description:
                  "How personal information may be collected, used, protected and handled.",
              },
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
                  "Important information about the risks associated with private investments.",
              },
            ].map((item) => (
              <CookiesRevealSoft
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
              </CookiesRevealSoft>
            ))}
          </div>
        </Container>
      </section>

      {/* ==========================================
          FOOTNOTE
      ========================================== */}

      <section className="border-t border-forest-900/10 bg-white py-8">
        <Container>
          <CookiesRevealSoft>
            <div className="flex flex-col gap-3 text-xs leading-6 text-stone-500 sm:flex-row sm:items-start sm:justify-between">
              <p>Cookie Policy</p>

              <p className="max-w-3xl sm:text-right">
                This policy describes the general
                approach to cookies and similar
                technologies. A verified
                production inventory should be
                maintained to reflect the
                technologies actually deployed by
                Tevuah Reserve.
              </p>
            </div>
          </CookiesRevealSoft>
        </Container>
      </section>
    </main>
  );
}