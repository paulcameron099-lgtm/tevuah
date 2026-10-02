import type {
  Metadata,
  Viewport,
} from "next";

import {
  Cormorant_Garamond,
  Manrope,
} from "next/font/google";

import {
  siteConfig,
} from "@/src/config/site";

import "./globals.css";

const displayFont =
  Cormorant_Garamond({
    variable:
      "--font-display",

    subsets: [
      "latin",
    ],

    weight: [
      "400",
      "500",
      "600",
      "700",
    ],

    display:
      "swap",
  });

const bodyFont =
  Manrope({
    variable:
      "--font-body",

    subsets: [
      "latin",
    ],

    display:
      "swap",
  });

export const metadata: Metadata = {
  /*
   * ==================================================
   * METADATA BASE
   * ==================================================
   */

  metadataBase:
    new URL(
      siteConfig.url,
    ),

  /*
   * ==================================================
   * TITLE / DESCRIPTION
   * ==================================================
   */

  title: {
    default:
      `${siteConfig.name} | Cultivated Alternative Investments`,

    template:
      `%s | ${siteConfig.name}`,
  },

  description:
    siteConfig.description,

  applicationName:
    siteConfig.name,

  /*
   * ==================================================
   * SEARCH / DISCOVERY
   * ==================================================
   */

  keywords: [
    "vineyard investment",
    "olive estate investment",
    "agricultural investment",
    "AgTech investment",
    "fine wine investment",
    "alternative assets",
  ],

  authors: [
    {
      name:
        siteConfig.name,

      url:
        siteConfig.url,
    },
  ],

  creator:
    siteConfig.name,

  publisher:
    siteConfig.name,

  /*
   * ==================================================
   * SEARCH ENGINE VERIFICATION
   * ==================================================
   *
   * Bing Webmaster Tools / Microsoft:
   *
   * <meta
   *   name="msvalidate.01"
   *   content="A7E5AC56FF81DB5A34E3CDF18D05AA60"
   * />
   * ==================================================
   */

  verification: {
    other: {
      "msvalidate.01":
        "A7E5AC56FF81DB5A34E3CDF18D05AA60",
    },
  },

  /*
   * ==================================================
   * FAVICONS / ICONS
   * ==================================================
   */

  icons: {
    icon: [
      {
        url:
          "/favicon.ico",

        sizes:
          "16x16 32x32 48x48 64x64 128x128 256x256",

        type:
          "image/x-icon",
      },

      {
        url:
          "/icon.png",

        sizes:
          "512x512",

        type:
          "image/png",
      },

      {
        url:
          "/icon.svg",

        sizes:
          "any",

        type:
          "image/svg+xml",
      },
    ],

    shortcut: [
      {
        url:
          "/favicon.ico",

        type:
          "image/x-icon",
      },
    ],

    apple: [
      {
        url:
          "/apple-icon.png",

        sizes:
          "180x180",

        type:
          "image/png",
      },
    ],
  },

  /*
   * ==================================================
   * ROBOTS
   * ==================================================
   */

  robots: {
    index:
      true,

    follow:
      true,

    googleBot: {
      index:
        true,

      follow:
        true,

      "max-image-preview":
        "large",

      "max-snippet":
        -1,

      "max-video-preview":
        -1,
    },
  },

  /*
   * ==================================================
   * OPEN GRAPH
   * ==================================================
   */

  openGraph: {
    type:
      "website",

    locale:
      "en_GB",

    url:
      siteConfig.url,

    siteName:
      siteConfig.name,

    title:
      `${siteConfig.name} | Cultivated Alternative Investments`,

    description:
      siteConfig.description,

    images: [
      {
        url:
          "/brand/tevuah-reserve-social.jpg",

        width:
          1200,

        height:
          630,

        alt:
          `${siteConfig.name} — Cultivated Alternative Investments`,
      },
    ],
  },

  /*
   * ==================================================
   * TWITTER / X
   * ==================================================
   */

  twitter: {
    card:
      "summary_large_image",

    title:
      `${siteConfig.name} | Cultivated Alternative Investments`,

    description:
      siteConfig.description,

    images: [
      "/brand/tevuah-reserve-social.jpg",
    ],
  },
};

export const viewport: Viewport = {
  width:
    "device-width",

  initialScale:
    1,

  themeColor:
    "#132a22",
};

type RootLayoutProps =
  Readonly<{
    children:
      React.ReactNode;
  }>;

export default function RootLayout({
  children,
}: RootLayoutProps) {
  /*
   * ==================================================
   * ORGANIZATION STRUCTURED DATA
   * ==================================================
   */

  const organizationStructuredData = {
    "@context":
      "https://schema.org",

    "@type":
      "Organization",

    name:
      siteConfig.name,

    url:
      siteConfig.url,

    logo:
      `${siteConfig.url}/brand/tevuah-reserve-logo.png`,

    description:
      siteConfig.description,
  };

  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable}`}
    >
      <body>
        {
          children
        }

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                organizationStructuredData,
              ).replace(
                /</g,
                "\\u003c",
              ),
          }}
        />
      </body>
    </html>
  );
}