import type { BusinessTypeKey } from "../business-types";
import type { FontKey } from "./font-registry";

export const PRESET_KEYS = [
  "neutral",
  "salon-beauty",
  "trades-home-services",
  "restaurant-cafe",
  "clinic-wellness",
  "auto-repair",
  "professional-services",
  "boutique-retail",
] as const;

export type PresetKey = (typeof PRESET_KEYS)[number];

export type RadiusStyle = "none" | "sm" | "md" | "lg" | "pill";
export type ShadowStyle = "flat" | "soft" | "elevated";
export type MotionStyle = "subtle" | "standard" | "energetic";
export type DensityStyle = "compact" | "comfortable" | "spacious";

export interface ThemePreset {
  id: PresetKey;
  label: string;
  /** One-line description shown in the presets gallery / design panel. */
  description: string;
  /** Verticals this preset is tuned for (informational only). */
  suggestedFor: BusinessTypeKey[];
  brandColor: string;
  secondaryColor?: string;
  accentColor?: string;
  headingFont: FontKey;
  bodyFont: FontKey;
  radius: RadiusStyle;
  shadow: ShadowStyle;
  motion: MotionStyle;
  density: DensityStyle;
  /** Modular type-scale ratio applied between successive heading steps. */
  typeScaleRatio: number;
}

export const THEME_PRESETS: Record<PresetKey, ThemePreset> = {
  neutral: {
    id: "neutral",
    label: "Neutral",
    description:
      "A calm, versatile default with a single-family type system — the safe, professional starting point for any vertical.",
    suggestedFor: ["other"],
    brandColor: "#3457a6",
    headingFont: "Inter",
    bodyFont: "Inter",
    radius: "md",
    shadow: "soft",
    motion: "standard",
    density: "comfortable",
    typeScaleRatio: 1.25,
  },
  "salon-beauty": {
    id: "salon-beauty",
    label: "Salon & Beauty",
    description:
      "An elegant serif/sans pairing, pill-shaped controls, and generous whitespace for hair, nail, and spa businesses.",
    suggestedFor: ["hair_salon", "nail_salon", "day_spa"],
    brandColor: "#b8336a",
    accentColor: "#d4a24a",
    headingFont: "Playfair Display",
    bodyFont: "Poppins",
    radius: "pill",
    shadow: "soft",
    motion: "standard",
    density: "spacious",
    typeScaleRatio: 1.333,
  },
  "trades-home-services": {
    id: "trades-home-services",
    label: "Trades & Home Services",
    description:
      "Bold condensed headings, sharp corners, and flat, no-nonsense shadows for plumbers, electricians, HVAC, and contractors.",
    suggestedFor: [
      "plumber",
      "electrician",
      "hvac",
      "contractor",
      "roofer",
      "locksmith",
      "landscaper",
      "house_painter",
      "moving_company",
    ],
    brandColor: "#0f4c81",
    accentColor: "#f2a900",
    headingFont: "Barlow Condensed",
    bodyFont: "Work Sans",
    radius: "sm",
    shadow: "flat",
    motion: "subtle",
    density: "comfortable",
    typeScaleRatio: 1.2,
  },
  "restaurant-cafe": {
    id: "restaurant-cafe",
    label: "Restaurant & Cafe",
    description:
      "A warm, appetizing display serif with soft rounded cards — built for restaurants, cafes, bakeries, and bars.",
    suggestedFor: ["restaurant", "cafe", "bakery", "bar"],
    brandColor: "#c2410c",
    secondaryColor: "#3f2d20",
    headingFont: "Fraunces",
    bodyFont: "Nunito Sans",
    radius: "md",
    shadow: "soft",
    motion: "standard",
    density: "comfortable",
    typeScaleRatio: 1.333,
  },
  "clinic-wellness": {
    id: "clinic-wellness",
    label: "Clinic & Wellness",
    description:
      "Calm, spacious, and legible — a rounded modern sans pairing for dentists, physicians, vets, and gyms.",
    suggestedFor: ["dentist", "physician", "veterinarian", "gym"],
    brandColor: "#0d9488",
    accentColor: "#6d8fd1",
    headingFont: "Manrope",
    bodyFont: "IBM Plex Sans",
    radius: "lg",
    shadow: "soft",
    motion: "subtle",
    density: "spacious",
    typeScaleRatio: 1.25,
  },
  "auto-repair": {
    id: "auto-repair",
    label: "Auto Repair",
    description:
      "Industrial condensed headings and flat, compact layouts with a confident red accent for auto shops.",
    suggestedFor: ["auto_repair"],
    brandColor: "#b91c1c",
    secondaryColor: "#1f2937",
    headingFont: "Oswald",
    bodyFont: "Rubik",
    radius: "none",
    shadow: "flat",
    motion: "standard",
    density: "compact",
    typeScaleRatio: 1.2,
  },
  "professional-services": {
    id: "professional-services",
    label: "Professional Services",
    description:
      "A trustworthy serif headline face over a clean grotesk body — for law firms, accountants, and real estate agents.",
    suggestedFor: ["law_firm", "accountant", "real_estate_agent"],
    brandColor: "#3730a3",
    secondaryColor: "#111827",
    headingFont: "Merriweather",
    bodyFont: "Public Sans",
    radius: "sm",
    shadow: "soft",
    motion: "subtle",
    density: "comfortable",
    typeScaleRatio: 1.25,
  },
  "boutique-retail": {
    id: "boutique-retail",
    label: "Boutique Retail",
    description:
      "A charming display serif and rounded, generous cards for florists, pet stores, and dry cleaners.",
    suggestedFor: ["florist", "pet_store", "dry_cleaning"],
    brandColor: "#4d7c0f",
    accentColor: "#e8b13d",
    headingFont: "DM Serif Display",
    bodyFont: "DM Sans",
    radius: "lg",
    shadow: "soft",
    motion: "standard",
    density: "comfortable",
    typeScaleRatio: 1.333,
  },
};

export function getPreset(id: PresetKey): ThemePreset {
  return THEME_PRESETS[id];
}
