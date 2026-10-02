import type { MetadataRoute } from "next";

import {
  siteConfig,
} from "@/src/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",

        allow: "/",

        disallow: [
          "/admin/",
          "/dashboard/",
          "/api/",
          "/login",
          "/forgot-password",
          "/reset-password",
          "/verify-recovery",
          "/auth/",
        ],
      },
    ],

    sitemap:
      `${siteConfig.url}/sitemap.xml`,

    host:
      siteConfig.url,
  };
}