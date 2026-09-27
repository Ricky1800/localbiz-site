/**
 * Pure font metadata: the list of Google Font family names any preset can
 * reference, and their CSS custom-property names. Deliberately has zero
 * dependency on `next/font/google` (see `lib/theme/fonts.ts`) so it can be
 * imported from plain-Node contexts — config validation (`lib/config.ts`),
 * the zod schema, and Vitest — without requiring Next's build-time font
 * compiler transform, which only runs inside Next's own bundler.
 */
export const FONT_KEYS = [
  "Inter",
  "Playfair Display",
  "Poppins",
  "Barlow Condensed",
  "Work Sans",
  "Fraunces",
  "Nunito Sans",
  "Manrope",
  "IBM Plex Sans",
  "Oswald",
  "Rubik",
  "Merriweather",
  "Public Sans",
  "DM Serif Display",
  "DM Sans",
] as const;

export type FontKey = (typeof FONT_KEYS)[number];

/** The literal CSS custom-property name each font is registered under in
 * `lib/theme/fonts.ts` (must match the `variable:` option passed to each
 * `next/font/google` call there). */
export const FONT_VAR_NAMES: Record<FontKey, string> = {
  Inter: "--font-inter",
  "Playfair Display": "--font-playfair-display",
  Poppins: "--font-poppins",
  "Barlow Condensed": "--font-barlow-condensed",
  "Work Sans": "--font-work-sans",
  Fraunces: "--font-fraunces",
  "Nunito Sans": "--font-nunito-sans",
  Manrope: "--font-manrope",
  "IBM Plex Sans": "--font-ibm-plex-sans",
  Oswald: "--font-oswald",
  Rubik: "--font-rubik",
  Merriweather: "--font-merriweather",
  "Public Sans": "--font-public-sans",
  "DM Serif Display": "--font-dm-serif-display",
  "DM Sans": "--font-dm-sans",
};

/** Resolves a font key to its CSS variable reference, e.g. `var(--font-inter)`. */
export function fontCssVar(key: FontKey): string {
  return `var(${FONT_VAR_NAMES[key]})`;
}
