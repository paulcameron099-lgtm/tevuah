import type {
  MetadataRoute,
} from "next";

import {
  siteConfig,
} from "@/src/config/site";

type SitemapEntry = {
  path: string;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
};

const publicPages: SitemapEntry[] = [
  {
    path: "",
    changeFrequency: "weekly",
    priority: 1,
  },

  {
    path: "/investments",
    changeFrequency: "daily",
    priority: 0.9,
  },

  {
    path: "/how-it-works",
    changeFrequency: "monthly",
    priority: 0.8,
  },

  {
    path: "/our-estates",
    changeFrequency: "weekly",
    priority: 0.8,
  },

  {
    path: "/agtech",
    changeFrequency: "monthly",
    priority: 0.8,
  },

  {
    path: "/fine-wine",
    changeFrequency: "weekly",
    priority: 0.8,
  },

  {
    path: "/about",
    changeFrequency: "monthly",
    priority: 0.7,
  },

  {
    path: "/insights",
    changeFrequency: "weekly",
    priority: 0.7,
  },

  {
    path: "/faq",
    changeFrequency: "monthly",
    priority: 0.6,
  },

  {
    path: "/risk-disclosure",
    changeFrequency: "monthly",
    priority: 0.5,
  },

  {
    path: "/contact",
    changeFrequency: "monthly",
    priority: 0.5,
  },

  {
    path: "/terms",
    changeFrequency: "monthly",
    priority: 0.4,
  },

  {
    path: "/privacy",
    changeFrequency: "monthly",
    priority: 0.4,
  },

  {
    path: "/cookies",
    changeFrequency: "monthly",
    priority: 0.4,
  },

  {
    path: "/complaints",
    changeFrequency: "monthly",
    priority: 0.4,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    siteConfig.url.replace(
      /\/$/,
      "",
    );

  return publicPages.map(
    ({
      path,
      changeFrequency,
      priority,
    }) => ({
      url:
        `${baseUrl}${path}`,

      changeFrequency,

      priority,
    }),
  );
}