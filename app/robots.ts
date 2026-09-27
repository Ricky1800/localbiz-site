import type { MetadataRoute } from "next";
import businessConfig from "@/business.config";

export default function robots(): MetadataRoute.Robots {
  const base = businessConfig.siteUrl.replace(/\/+$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
