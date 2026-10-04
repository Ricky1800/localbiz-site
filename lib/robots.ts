import type { MetadataRoute } from "next";

export interface RobotsRuleOptions {
  allowIndexing?: string | undefined;
}

/**
 * Generates crawler rules for robots.txt.
 *
 * Defaults to allowing all crawlers when NEXT_PUBLIC_ALLOW_INDEXING is unset.
 * When explicitly set to "false", instructs all crawlers to disallow "/",
 * protecting staging and preview deployments from unintended search indexation.
 */
export function getRobotsRules(options?: RobotsRuleOptions): MetadataRoute.Robots["rules"] {
  const allowIndexing = options?.allowIndexing ?? process.env.NEXT_PUBLIC_ALLOW_INDEXING;

  if (allowIndexing === "false") {
    return {
      userAgent: "*",
      disallow: "/",
    };
  }

  return {
    userAgent: "*",
    allow: "/",
  };
}
