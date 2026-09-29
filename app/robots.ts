import type { MetadataRoute } from "next";
import businessConfig from "@/business.config";
import { getRobotsRules } from "@/lib/robots-config";

export default function robots(): MetadataRoute.Robots {
  const base = businessConfig.siteUrl.replace(/\/+$/, "");

  return {
    rules: getRobotsRules(),
    sitemap: `${base}/sitemap.xml`,
  };
}
