import {
  Barlow_Condensed,
  DM_Sans,
  DM_Serif_Display,
  Fraunces,
  IBM_Plex_Sans,
  Inter,
  Manrope,
  Merriweather,
  Nunito_Sans,
  Oswald,
  Playfair_Display,
  Poppins,
  Public_Sans,
  Rubik,
  Work_Sans,
} from "next/font/google";
import type { FontKey } from "./font-registry";

/**
 * Every font pair used by any preset, declared once at module scope.
 *
 * `next/font/google` requires its call to be a top-level `const` initializer
 * (its build-time compiler plugin statically rewrites these call sites), so
 * it cannot be called conditionally per-preset. Instead, every font used by
 * any preset is declared here; `lib/theme/tokens.ts` picks which pair's CSS
 * variable actually gets applied to the page based on the resolved theme.
 * Only the woff2 files for the *applied* variable are ever requested by the
 * browser (the unused `@font-face` declarations add a small amount of inert
 * CSS, not extra network requests) — see README's "Design system" section.
 *
 * This module is intentionally NOT imported by `lib/config.ts`, the zod
 * schema, or any pure logic module (see `font-registry.ts` for the plain
 * data those need) — only by `app/layout.tsx` and the `/design` panel,
 * which run inside Next's own build/bundler where this transform applies.
 */
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-inter" });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-playfair-display" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-poppins" });
const barlowCondensed = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-barlow-condensed" });
const workSans = Work_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-work-sans" });
const fraunces = Fraunces({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-fraunces" });
const nunitoSans = Nunito_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-nunito-sans" });
const manrope = Manrope({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-manrope" });
const ibmPlexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-ibm-plex-sans" });
const oswald = Oswald({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-oswald" });
const rubik = Rubik({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-rubik" });
const merriweather = Merriweather({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-merriweather" });
const publicSans = Public_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-public-sans" });
const dmSerifDisplay = DM_Serif_Display({ subsets: ["latin"], weight: ["400"], variable: "--font-dm-serif-display" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-dm-sans" });

export const FONT_REGISTRY: Record<FontKey, { className: string; variable: string }> = {
  Inter: inter,
  "Playfair Display": playfairDisplay,
  Poppins: poppins,
  "Barlow Condensed": barlowCondensed,
  "Work Sans": workSans,
  Fraunces: fraunces,
  "Nunito Sans": nunitoSans,
  Manrope: manrope,
  "IBM Plex Sans": ibmPlexSans,
  Oswald: oswald,
  Rubik: rubik,
  Merriweather: merriweather,
  "Public Sans": publicSans,
  "DM Serif Display": dmSerifDisplay,
  "DM Sans": dmSans,
};

/** The full `className` string (variable classes) for every registered font
 * — applied once on `<html>` so any preset's `--font-*` variable is always
 * available, regardless of which preset is active for this request. */
export function allFontVariableClassNames(): string {
  return Object.values(FONT_REGISTRY)
    .map((f) => f.variable)
    .join(" ");
}

export type { FontKey } from "./font-registry";
export { fontCssVar } from "./font-registry";
