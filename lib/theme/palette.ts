import { ensureContrast, hexToOklch, oklchToHex, type Oklch } from "./color";

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

const SCALE_STEPS: Array<keyof ColorScale> = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
];

/** Target OKLCH lightness for each step of a generated tonal scale. */
const LIGHTNESS_BY_STEP: Record<keyof ColorScale, number> = {
  50: 0.97,
  100: 0.94,
  200: 0.88,
  300: 0.79,
  400: 0.69,
  500: 0.59,
  600: 0.5,
  700: 0.42,
  800: 0.34,
  900: 0.27,
  950: 0.19,
};

/**
 * Chroma multiplier by step: brand chroma is preserved near the middle
 * (where `500` sits) and tapered toward the extremes, since very light or
 * very dark colors can only hold a fraction of a mid-tone's chroma before
 * clipping out of the sRGB gamut (which would otherwise flatten highlights
 * and crush shadows toward gray).
 */
const CHROMA_MULTIPLIER_BY_STEP: Record<keyof ColorScale, number> = {
  50: 0.35,
  100: 0.45,
  200: 0.6,
  300: 0.75,
  400: 0.9,
  500: 1,
  600: 0.97,
  700: 0.88,
  800: 0.75,
  900: 0.6,
  950: 0.45,
};

/**
 * Generates an 11-step (50..950) tonal scale from a single brand hex color,
 * by holding its OKLCH hue fixed and varying lightness (and, secondarily,
 * chroma) per step. This is what makes the generated scale look like one
 * coherent color family rather than an arbitrary lightened/darkened mix.
 */
export function generateScale(brandHex: string): ColorScale {
  const base = hexToOklch(brandHex);
  const entries = SCALE_STEPS.map((step) => {
    const oklch: Oklch = {
      l: LIGHTNESS_BY_STEP[step],
      c: base.c * CHROMA_MULTIPLIER_BY_STEP[step],
      h: base.h,
    };
    return [step, oklchToHex(oklch)] as const;
  });
  return Object.fromEntries(entries) as unknown as ColorScale;
}

/**
 * Generates a near-neutral gray scale that is subtly tinted toward the
 * brand hue at very low chroma — a common technique in mature design
 * systems (Radix, Tailwind's own newer palettes) that makes surfaces feel
 * cohesive with the brand color instead of a generic, disconnected gray.
 */
export function generateNeutralScale(brandHex: string, tint = 0.014): ColorScale {
  const base = hexToOklch(brandHex);
  const entries = SCALE_STEPS.map((step) => {
    const oklch: Oklch = {
      l: LIGHTNESS_BY_STEP[step],
      c: tint,
      h: base.h,
    };
    return [step, oklchToHex(oklch)] as const;
  });
  return Object.fromEntries(entries) as unknown as ColorScale;
}

export interface RolePair {
  background: string;
  foreground: string;
  /** Contrast ratio of the returned pair, after any auto-adjustment. */
  ratio: number;
  /** True if the foreground had to be nudged to meet WCAG AA. */
  adjusted: boolean;
}

/**
 * Resolves a background/foreground role pair, auto-adjusting the foreground
 * (preserving its hue) if the naive pairing fails WCAG AA contrast.
 */
export function resolveRolePair(
  backgroundHex: string,
  preferredForegroundHex: string,
  maxDeltaL?: number,
): RolePair {
  const { hex, ratio, adjusted } = ensureContrast(
    backgroundHex,
    preferredForegroundHex,
    "AA",
    maxDeltaL,
  );
  return { background: backgroundHex, foreground: hex, ratio, adjusted };
}

export interface ContrastCheck {
  pair: string;
  background: string;
  foreground: string;
  ratio: number;
  required: number;
  passes: boolean;
  adjusted: boolean;
}

export interface BrandPalette {
  brand: ColorScale;
  neutral: ColorScale;
  secondary: ColorScale;
  accent: ColorScale;
}

/** Builds the full brand + neutral + secondary + accent tonal scales from
 * a primary brand color, deriving secondary/accent hues by rotating around
 * the OKLCH hue wheel when they aren't explicitly provided. */
export function buildBrandPalette(
  brandHex: string,
  secondaryHex?: string,
  accentHex?: string,
): BrandPalette {
  const base = hexToOklch(brandHex);

  const resolvedSecondary =
    secondaryHex ?? oklchToHex({ l: 0.4, c: base.c * 0.85, h: (base.h + 24) % 360 });
  const resolvedAccent =
    accentHex ?? oklchToHex({ l: 0.62, c: Math.min(base.c * 1.3, 0.19), h: (base.h + 150) % 360 });

  return {
    brand: generateScale(brandHex),
    neutral: generateNeutralScale(brandHex),
    secondary: generateScale(resolvedSecondary),
    accent: generateScale(resolvedAccent),
  };
}
