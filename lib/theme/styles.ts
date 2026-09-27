import type { DensityStyle, MotionStyle, RadiusStyle, ShadowStyle } from "./presets";

export interface RadiusScale {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

/** Radius ramps per style, in rem. `full` is always a pill/circle except for
 * the sharpest ("none") style, which caps it so badges don't look out of
 * place next to perfectly square cards. */
export const RADIUS_SCALES: Record<RadiusStyle, RadiusScale> = {
  none: { sm: "0.0625rem", md: "0.125rem", lg: "0.25rem", xl: "0.375rem", full: "0.375rem" },
  sm: { sm: "0.1875rem", md: "0.375rem", lg: "0.625rem", xl: "0.875rem", full: "9999px" },
  md: { sm: "0.25rem", md: "0.5rem", lg: "0.875rem", xl: "1.25rem", full: "9999px" },
  lg: { sm: "0.375rem", md: "0.75rem", lg: "1.25rem", xl: "1.75rem", full: "9999px" },
  pill: { sm: "0.625rem", md: "1.125rem", lg: "1.75rem", xl: "9999px", full: "9999px" },
};

export interface ShadowScale {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export const SHADOW_SCALES: Record<ShadowStyle, ShadowScale> = {
  flat: {
    sm: "0 1px 2px rgba(15, 23, 42, 0.04)",
    md: "0 1px 3px rgba(15, 23, 42, 0.06)",
    lg: "0 2px 6px rgba(15, 23, 42, 0.08)",
    xl: "0 4px 10px rgba(15, 23, 42, 0.1)",
  },
  soft: {
    sm: "0 1px 2px rgba(15, 23, 42, 0.05)",
    md: "0 4px 10px rgba(15, 23, 42, 0.08)",
    lg: "0 10px 24px rgba(15, 23, 42, 0.1)",
    xl: "0 20px 40px rgba(15, 23, 42, 0.12)",
  },
  elevated: {
    sm: "0 2px 4px rgba(15, 23, 42, 0.08)",
    md: "0 8px 16px rgba(15, 23, 42, 0.14)",
    lg: "0 16px 32px rgba(15, 23, 42, 0.18)",
    xl: "0 24px 48px rgba(15, 23, 42, 0.22)",
  },
};

export interface MotionScale {
  fast: string;
  base: string;
  slow: string;
  easing: string;
}

/** Durations chosen inside the 150-300ms window recommended for perceived
 * "smooth but not sluggish" UI transitions. */
export const MOTION_SCALES: Record<MotionStyle, MotionScale> = {
  subtle: { fast: "100ms", base: "150ms", slow: "220ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  standard: { fast: "120ms", base: "200ms", slow: "300ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  energetic: { fast: "140ms", base: "220ms", slow: "320ms", easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
};

export interface DensityScale {
  /** Vertical section padding, mobile -> desktop fluid clamp. */
  sectionY: string;
  /** Gap between major elements within a section. */
  gap: string;
}

export const DENSITY_SCALES: Record<DensityStyle, DensityScale> = {
  compact: { sectionY: "clamp(2.5rem, 2rem + 2vw, 3.5rem)", gap: "1rem" },
  comfortable: { sectionY: "clamp(3rem, 2.4rem + 3vw, 5rem)", gap: "1.5rem" },
  spacious: { sectionY: "clamp(3.5rem, 2.6rem + 4vw, 6.5rem)", gap: "2rem" },
};

export interface TypeStep {
  size: string;
  lineHeight: string;
}

const TYPE_STEP_INDEX: Record<string, number> = {
  xs: -2,
  sm: -1,
  base: 0,
  lg: 1,
  xl: 2,
  "2xl": 3,
  "3xl": 4,
  "4xl": 5,
  "5xl": 6,
  "6xl": 7,
};

/** Generates a fluid, modular type scale keyed to match Tailwind's default
 * `--text-*` size steps, so overriding these variables re-tunes every
 * existing `text-*` utility in the app without touching component markup. */
export function buildTypeScale(ratio: number): Record<string, TypeStep> {
  const scale: Record<string, TypeStep> = {};
  for (const [name, index] of Object.entries(TYPE_STEP_INDEX)) {
    const idealRem = Math.pow(ratio, index);
    if (index <= 2) {
      // Small/body sizes: fixed rem, no viewport scaling needed.
      scale[name] = { size: `${idealRem.toFixed(4)}rem`, lineHeight: index <= 0 ? "1.6" : "1.5" };
    } else {
      const minRem = idealRem * 0.78;
      const vw = ((idealRem - minRem) * 2.6).toFixed(3);
      scale[name] = {
        size: `clamp(${minRem.toFixed(4)}rem, ${(minRem * 0.85).toFixed(4)}rem + ${vw}vw, ${idealRem.toFixed(4)}rem)`,
        lineHeight: index >= 5 ? "1.1" : "1.25",
      };
    }
  }
  return scale;
}
