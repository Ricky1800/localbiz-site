/**
 * Color math for the design-token system: sRGB <-> OKLCH conversion and
 * WCAG 2.1 contrast-ratio calculation.
 *
 * OKLCH (Oklab in cylindrical/polar form) is used instead of HSL because
 * equal steps in its lightness (`L`) and chroma (`C`) channels correspond
 * much more closely to *perceived* equal steps than HSL does — this is what
 * lets `generateScale()` produce a tonal ramp (50..950) from one brand color
 * that looks evenly spaced instead of muddy in the middle or over-saturated
 * at the ends.
 *
 * No color library dependency: this implements Björn Ottosson's published
 * OKLab formulas (https://bottosson.github.io/posts/oklab/) directly, plus
 * the WCAG relative luminance / contrast ratio formulas from
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance.
 */

export interface Oklch {
  /** Lightness, 0 (black) to 1 (white). */
  l: number;
  /** Chroma, 0 (gray) and up (typically < 0.4 for in-gamut sRGB). */
  c: number;
  /** Hue, in degrees, 0-360. */
  h: number;
}

interface Rgb {
  r: number;
  g: number;
  b: number;
}

const HEX_REGEX = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function isValidHexColor(value: string): boolean {
  return HEX_REGEX.test(value);
}

/** Parses "#rgb" or "#rrggbb" into 0-1 sRGB components. Throws on invalid input. */
export function hexToRgb(hex: string): Rgb {
  const match = HEX_REGEX.exec(hex);
  if (!match) {
    throw new Error(`Invalid hex color: "${hex}"`);
  }
  let value = match[1] as string;
  if (value.length === 3) {
    value = value
      .split("")
      .map((ch) => ch + ch)
      .join("");
  }
  const int = parseInt(value, 16);
  return {
    r: ((int >> 16) & 255) / 255,
    g: ((int >> 8) & 255) / 255,
    b: (int & 255) / 255,
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const toByte = (c: number) => {
    const clamped = Math.min(1, Math.max(0, c));
    return Math.round(clamped * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
}

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
  const clamped = Math.min(1, Math.max(0, c));
  return clamped <= 0.0031308
    ? clamped * 12.92
    : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
}

function linearRgbToOklab(r: number, g: number, b: number): { L: number; a: number; b: number } {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

function oklabToLinearRgb(L: number, a: number, b: number): Rgb {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
}

/** Converts a "#rrggbb" hex color to OKLCH (L 0-1, C >= 0, H in degrees). */
export function hexToOklch(hex: string): Oklch {
  const { r, g, b } = hexToRgb(hex);
  const lab = linearRgbToOklab(srgbToLinear(r), srgbToLinear(g), srgbToLinear(b));
  const c = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  let h = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: lab.L, c, h };
}

function linearRgbFromOklch({ l, c, h }: Oklch): Rgb {
  const hRad = (h * Math.PI) / 180;
  const a = Math.cos(hRad) * c;
  const b = Math.sin(hRad) * c;
  return oklabToLinearRgb(l, a, b);
}

const GAMUT_EPSILON = 1e-4;

function isInGamut({ r, g, b }: Rgb): boolean {
  return (
    r >= -GAMUT_EPSILON &&
    r <= 1 + GAMUT_EPSILON &&
    g >= -GAMUT_EPSILON &&
    g <= 1 + GAMUT_EPSILON &&
    b >= -GAMUT_EPSILON &&
    b <= 1 + GAMUT_EPSILON
  );
}

/**
 * Reduces an OKLCH color's chroma (holding lightness and hue exactly fixed)
 * until it fits inside the sRGB gamut, rather than letting `oklchToHex`
 * naively clamp each RGB channel independently — axis-aligned clamping
 * shifts the resulting hue (sometimes by 10+ degrees for saturated
 * colors), which would silently break "hue is preserved across the tonal
 * scale," a core property `generateScale()` relies on.
 */
export function clampChromaToGamut(oklch: Oklch): Oklch {
  if (oklch.c <= 0) return oklch;
  if (isInGamut(linearRgbFromOklch(oklch))) return oklch;

  let lo = 0;
  let hi = oklch.c;
  // Binary search for the largest in-gamut chroma at this exact L/H.
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (isInGamut(linearRgbFromOklch({ ...oklch, c: mid }))) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return { ...oklch, c: lo };
}

/** Converts OKLCH back to a "#rrggbb" hex color. Out-of-gamut input is
 * first gamut-mapped by reducing chroma (see `clampChromaToGamut`), then
 * the (now in-gamut, modulo float error) linear RGB is clamped defensively
 * before quantizing to 8-bit hex. */
export function oklchToHex(oklch: Oklch): string {
  const mapped = clampChromaToGamut(oklch);
  const linear = linearRgbFromOklch(mapped);
  return rgbToHex({
    r: linearToSrgb(linear.r),
    g: linearToSrgb(linear.g),
    b: linearToSrgb(linear.b),
  });
}

/**
 * Relative luminance per WCAG 2.1, from a "#rrggbb" hex color.
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * WCAG contrast ratio between two colors, from 1 (identical) to 21
 * (black vs white). https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
export function contrastRatio(hexA: string, hexB: string): number {
  const lA = relativeLuminance(hexA);
  const lB = relativeLuminance(hexB);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

export type WcagLevel = "AA" | "AA-large";

const WCAG_THRESHOLDS: Record<WcagLevel, number> = {
  AA: 4.5,
  "AA-large": 3,
};

export function meetsWcagAA(hexA: string, hexB: string, level: WcagLevel = "AA"): boolean {
  return contrastRatio(hexA, hexB) >= WCAG_THRESHOLDS[level];
}

/**
 * Picks whichever of near-black or near-white gives higher contrast against
 * `backgroundHex`. This is the standard "auto foreground" heuristic used by
 * most design-token systems before falling back to manual lightness search.
 */
export function bestForeground(backgroundHex: string, darkHex: string, lightHex: string): string {
  const darkRatio = contrastRatio(backgroundHex, darkHex);
  const lightRatio = contrastRatio(backgroundHex, lightHex);
  return lightRatio >= darkRatio ? lightHex : darkHex;
}

/**
 * Nudges `foregroundHex`'s OKLCH lightness away from `backgroundHex` in
 * fixed steps until the WCAG AA contrast threshold is met, or the lightness
 * bound (0 or 1) is reached. Hue and chroma are preserved so the adjusted
 * color still reads as "the same color, just darker/lighter" rather than
 * shifting toward gray or a different hue.
 *
 * Returns `{ hex, ratio, adjusted }` — `adjusted` is true if any nudging was
 * needed, so callers can surface a build-time warning.
 */
export function ensureContrast(
  backgroundHex: string,
  foregroundHex: string,
  level: WcagLevel = "AA",
  /** Caps how far (in OKLCH lightness) the foreground may be nudged. Leave
   * unset for an effectively unbounded search (used for auto-picked
   * foregrounds like button/badge text, which may become pure black/white).
   * Pass a small bound (e.g. 0.12) when the color must stay recognizably
   * "the same color" — e.g. an accent used as an icon/star color — so a
   * genuinely too-low-contrast brand color is reported as a failure instead
   * of being silently replaced with black. */
  maxDeltaL = 1,
): { hex: string; ratio: number; adjusted: boolean } {
  const threshold = WCAG_THRESHOLDS[level];
  const initialRatio = contrastRatio(backgroundHex, foregroundHex);
  if (initialRatio >= threshold) {
    return { hex: foregroundHex, ratio: initialRatio, adjusted: false };
  }

  const bgL = hexToOklch(backgroundHex).l;
  const fgOklch = hexToOklch(foregroundHex);
  // Darken if the foreground is lighter than the background's midpoint,
  // otherwise lighten — i.e. push away from the background.
  const direction = fgOklch.l <= bgL ? -1 : 1;

  const STEP = 0.02;
  const maxSteps = Math.max(1, Math.round(maxDeltaL / STEP));
  let candidate = { ...fgOklch };
  let bestHex = foregroundHex;
  let bestRatio = initialRatio;

  for (let i = 0; i < maxSteps; i++) {
    candidate = { ...candidate, l: candidate.l + direction * STEP };
    if (candidate.l < 0 || candidate.l > 1) break;
    const hex = oklchToHex(candidate);
    const ratio = contrastRatio(backgroundHex, hex);
    bestHex = hex;
    bestRatio = ratio;
    if (ratio >= threshold) break;
  }

  // If pushing in the initial direction couldn't reach the far bound (and
  // we have room to fall back to full-range black/white), try that — covers
  // near-mid-gray backgrounds where our initial direction guess was wrong.
  if (bestRatio < threshold && maxDeltaL >= 1) {
    const white = "#ffffff";
    const black = "#000000";
    const alt = bestForeground(backgroundHex, black, white);
    const altRatio = contrastRatio(backgroundHex, alt);
    if (altRatio > bestRatio) {
      bestHex = alt;
      bestRatio = altRatio;
    }
  }

  return { hex: bestHex, ratio: bestRatio, adjusted: true };
}
