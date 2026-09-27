import type { Metadata } from "next";
import { notFound } from "next/navigation";
import businessConfig from "@/business.config";
import { DesignPanel } from "./DesignPanel";

export const metadata: Metadata = {
  title: "Design panel",
  robots: { index: false, follow: false },
};

/**
 * `/design` — a development-only live design panel for tuning the theme
 * preset, brand color, fonts, radius, and each section's variant, with a
 * live multi-viewport preview, a WCAG contrast report, and a "copy config"
 * button that outputs the exact `theme`/`sections` snippet to paste into
 * `business.config.ts`.
 *
 * This route must not exist in production: it exposes internal config
 * shapes and is meaningless for a visitor. Rather than relying on it simply
 * not being linked anywhere, it actively 404s outside development — see
 * `tests/e2e/design-panel.spec.ts` for the check that a production build
 * really does return 404 here.
 */
export default function DesignPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return <DesignPanel initialConfig={businessConfig} />;
}
