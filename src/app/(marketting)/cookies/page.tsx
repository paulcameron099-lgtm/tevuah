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
      "This Cookie Policy explains how cookies and similar technologies are used in connection with the Tevuah Reserve website and investor platform.",
      "It should be read together with the Tevuah Reserve Privacy Policy, which explains how personal information is collected, used, protected and handled.",
      "Tevuah Reserve reviews its use of cookies and related technologies in connection with platform functionality, security, service delivery and applicable privacy requirements.",
    ],
  },

  {
    id: "what-are-cookies",
    number: "02",
    title: "What are cookies?",
    paragraphs: [
      "Cookies are small pieces of information that a website stores on a browser or device and subsequently accesses.",
      "They can support functions such as maintaining a session, recognising an authenticated user, remembering preferences and protecting website security.",
      "Some cookies last only for the duration of a browsing session.",
      "Others remain on a device for a defined period or until they are removed.",
      "The term cookie is also commonly used to describe comparable technologies that store or access information on a device.",
    ],
  },

  {
    id: "similar-technologies",
    number: "03",
    title: "Similar technologies",
    paragraphs: [
      "Digital platforms may use technologies other than traditional browser cookies to store or access information.",
      "These include local browser storage, session storage, pixels, tags and comparable technologies.",
      "Their purpose and legal treatment depend on how they operate, the information they handle and the applicable requirements.",
      "Tevuah Reserve considers these technologies according to their actual function and purpose, including their implications for privacy, security and user choice.",
    ],
  },

  {
    id: "necessary",
    number: "04",
    title: "Strictly necessary and essential technologies",
    paragraphs: [
      "Certain technologies are necessary to provide functionality requested by a user or maintain the secure operation of a website or digital platform.",
      "Depending on the service involved, these technologies can support authentication, session management, account access, request integrity, platform security and the retention of privacy preferences.",
      "Essential technologies may include functions for:",
    ],
    points: [
      "Maintaining secure investor sessions.",
      "Protecting account access and platform security.",
      "Supporting core website and application functionality.",
      "Maintaining session and request integrity.",
      "emembering privacy or cookie choices.",
    ],
  },

  {
    id: "authentication",
    number: "05",
    title: "Authentication and account access",
    paragraphs: [
      "Cookies and similar technologies can support authenticated investor functionality by maintaining secure sessions and recognising whether a user is signed in.",
      "These technologies help maintain continuity between account requests and protect access to restricted areas of the platform.",
      "Disabling or deleting technologies required for authentication or session management may interrupt an active session or prevent access to protected functionality.",
    ],
  },

  {
    id: "security",
    number: "06",
    title: "Security technologies",
    paragraphs: [
      "Cookies and similar technologies can support measures designed to protect Tevuah Reserve against unauthorised access, suspicious requests and misuse of digital services.",
      "Depending on their function, these technologies may assist with session integrity, request validation, abuse prevention and other security controls.",
      "Security-related technologies should be proportionate to their purpose and handled in accordance with applicable privacy and data-protection requirements.",
    ],
  },

  {
    id: "preferences",
    number: "07",
    title: "Preference technologies",
    paragraphs: [
      "Preference technologies allow a website or platform to remember choices made by a user, helping maintain a consistent experience across visits.",
      "Depending on the functionality provided, these choices may include interface settings, language preferences or privacy selections.",
      "Where a preference technology requires consent under applicable law, it is subject to the appropriate user-choice mechanism.",
    ],
  },

  {
    id: "analytics",
    number: "08",
    title: "Analytics and performance technologies",
    paragraphs: [
      "Analytics and performance technologies help assess website usage, identify technical issues and understand how visitors interact with digital services.",
      "Depending on the tools used, information may include page interactions, browser or device details, performance measurements and usage patterns.",
      "Analytics technologies are subject to applicable privacy requirements. Where prior consent is required, they must not be activated before the required consent has been obtained.",
    ],
  },

  {
    id: "marketing",
    number: "09",
    title: "Advertising and marketing technologies",
    paragraphs: [
      "Advertising and marketing technologies may support campaign measurement, targeted advertising, retargeting or behavioural profiling.",
      "These technologies can involve tracking beyond the immediate website and therefore require appropriate consideration of transparency, privacy and user choice.",
      "Where Tevuah Reserve uses technologies of this kind, their purposes and relevant providers should be disclosed as required, and prior consent must be obtained wherever applicable law requires it.",
    ],
  },

  {
    id: "third-party",
    number: "10",
    title: "First-party and third-party technologies",
    paragraphs: [
      "A first-party cookie is generally associated with the website a user visits. A third-party technology is provided through a service operated by another organisation.",
      "Third-party services may support website infrastructure, authentication, communications, analytics, embedded content or other digital functions.",
      "The use of third-party technologies is subject to the relevant provider's role, the information involved, the purpose of processing and applicable legal requirements.",
    ],
  },

  {
    id: "duration",
    number: "11",
    title: "Session and persistent cookies",
    paragraphs: [
      "Session cookies generally operate during a browsing session and expire when the session ends, subject to the browser and the cookie's configuration.",
      "Persistent cookies remain on a device for a defined period or until they are deleted. They may support functions such as remembering preferences or recognising a returning browser.",
      "Cookie durations should be appropriate to their intended purposes and comply with applicable requirements.",
      "Where specific retention periods are disclosed, they should reflect the relevant technology's actual configuration.",
    ],
  },

  {
    id: "consent",
    number: "12",
    title: "Consent and user choice",
    paragraphs: [
      "Requirements for cookies and device-storage technologies vary by jurisdiction and depend on their purpose and operation.",
      "Where applicable law requires consent before a non-essential technology is used, consent must be obtained before that technology is activated.",
      "Users should receive clear information about the relevant categories and purposes and, where required, be able to accept, reject, change or withdraw their choices through an appropriate mechanism.",
      "Essential technologies may be treated differently where applicable law permits their use without prior consent.",
    ],
  },

  {
    id: "managing",
    number: "13",
    title: "Managing cookies",
    paragraphs: [
      "Most modern browsers provide controls that allow users to inspect, block or delete cookies and other website data.",
      "Blocking cookies or browser storage may affect website functionality.",
      "In particular, disabling technologies required for authentication or session management may prevent access to restricted investor functionality.",
      "Where an on-site cookie-preference tool is available, users can also use that tool to manage the optional technologies covered by its controls.",
    ],
  },

  {
    id: "browser",
    number: "14",
    title: "Browser controls",
    paragraphs: [
      "Browser settings commonly provide options for deleting stored cookies, blocking cookies, limiting third-party cookies and managing site-specific storage.",
      "The available controls vary between browsers and devices. Users should consult the current settings and support information provided by their browser or device manufacturer.",
      "Changing browser settings does not necessarily remove information already stored. Existing cookies and website data may need to be deleted separately.",
    ],
  },

  {
    id: "inventory",
    number: "15",
    title: "Cookie inventory",
    paragraphs: [
      "The cookies and similar technologies associated with a website depend on its functionality, infrastructure and integrated services.",
      "Information about individual technologies should accurately identify their names, providers, purposes, categories and durations, together with any applicable consent or preference requirements.",
      "Tevuah Reserve's cookie disclosures should reflect the technologies used across its public website, authentication functionality, investor platform and relevant third-party integrations.",
      "Specific identifiers and retention periods should correspond to the actual technical configuration."
    ],
  },

  {
    id: "changes",
    number: "16",
    title: "Changes to this Cookie Policy",
    paragraphs: [
      "Tevuah Reserve may update this Cookie Policy to reflect changes in website functionality, platform infrastructure, service providers, technologies or applicable legal requirements.",
      "Changes affecting the use of cookies or the choices available to users will be addressed through appropriate policy updates and notices.",
      "Where applicable law requires renewed consent or additional notification, the relevant process will be followed.",
    ],
  },

  {
    id: "privacy",
    number: "17",
    title: "Personal information and privacy",
    paragraphs: [
      "Information obtained through cookies and similar technologies may constitute or be associated with personal information, depending on the technology and circumstances.",
      "The Tevuah Reserve Privacy Policy provides further information about how personal information is collected, used, shared, retained and protected, together with applicable privacy rights.",
    ],
  },

  {
    id: "contact",
    number: "18",
    title: "Questions about cookies",
    paragraphs: [
      "For questions about this Cookie Policy or the use of cookies and similar technologies across Tevuah Reserve, please contact us through the Contact page.",
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
            src="/images/hero/cookies-page-hero.jpeg"
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
                Learn how cookies and similar technologies support website functionality, security, preferences and digital services across Tevuah Reserve.
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
                  Cookies serve defined purposes across the digital experience.
                </h2>

                <p className="mt-6 max-w-4xl text-sm leading-7 text-stone-700 sm:text-base sm:leading-8">
                  Cookies and similar technologies support website functionality, account access, security and user preferences. Depending on their purpose, these technologies can also support performance measurement and marketing activities.
                </p>
                <p className="mt-6 max-w-4xl text-sm leading-7 text-stone-700 sm:text-base sm:leading-8">
                  Tevuah Reserve handles these technologies according to their function and applicable privacy requirements. Users should be able to understand the purpose of relevant technologies and exercise the choices available to them under applicable law.
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
                  Different purposes require different treatment.
                </h2>

                <p className="mt-6 max-w-md text-sm leading-7 text-stone-600">
                  Cookies and similar technologies are classified according to their function, including essential operations, preferences, analytics and marketing. Each category is subject to the requirements applicable to its use.
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
                    text: "Technologies that remember settings or choices made by a user.",
                    status: "User preferences",
                  },
                  {
                    icon: BarChart3,
                    title: "Analytics",
                    text: "Technologies that measure performance and website usage.",
                    status: "Performance insights",
                  },
                  {
                    icon: Fingerprint,
                    title: "Marketing",
                    text: "Technologies used for advertising, profiling or cross-site tracking.",
                    status: "User choice",
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
                  Cookie management
                </p>

                <h2 className="font-display mt-5 text-3xl font-medium tracking-[-0.03em] text-forest-950 sm:text-4xl">
                  Understanding the technologies behind your experience.
                </h2>
              </div>

              <div className="space-y-5 text-sm leading-7 text-stone-700">
                <p>
                  Cookies, authentication, preferences, analytics and consent controls serve different purposes across digital services. Their use should be transparent, proportionate and consistent with applicable privacy requirements.
                </p>
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
                  You can manage cookies and website data through your browser settings. Where an on-site cookie-preference tool is available, it can provide additional control over the optional technologies covered by that tool.
                </p>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
                  Blocking technologies required for secure authentication or essential functionality may affect access to parts of the investor platform..
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