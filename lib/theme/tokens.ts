import { bestForeground, contrastRatio, ensureContrast } from "./color";
import { fontCssVar, type FontKey } from "./font-registry";
import { buildBrandPalette, type ColorScale } from "./palette";
import { getPreset, type PresetKey } from "./presets";
import type { ThemeConfig } from "./schema";
import {
  buildTypeScale,
  DENSITY_SCALES,
  MOTION_SCALES,
  RADIUS_SCALES,
  SHADOW_SCALES,
} from "./styles";

export interface ContrastCheck {
  /** Human-readable pair name, e.g. "body text on page background". */
  name: string;
  background: string;
  foreground: string;
  ratio: number;
  required: number;
  passes: boolean;
  /** True if the foreground color shown here differs from the role's
   * "ideal"/requested color because it had to be nudged to pass. */
  adjusted: boolean;
}

export interface ResolvedColors {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  fg: string;
  fgMuted: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  danger: string;
  dangerForeground: string;
}

export interface ResolvedTheme {
  preset: PresetKey;
  colors: ResolvedColors;
  scales: { brand: ColorScale; neutral: ColorScale; secondary: ColorScale; accent: ColorScale };
  radius: (typeof RADIUS_SCALES)["md"];
  shadow: { sm: string; md: string; lg: string; xl: string };
  motion: (typeof MOTION_SCALES)["standard"];
  density: (typeof DENSITY_SCALES)["comfortable"];
  typeScale: ReturnType<typeof buildTypeScale>;
  fonts: { heading: FontKey; body: FontKey; headingVar: string; bodyVar: string };
  contrastReport: ContrastCheck[];
}

const AA_LARGE_MIN_RATIO = 3;

/**
 * Resolves a `theme` config block (preset + overrides) into every concrete
 * design token the app consumes: color roles (with WCAG AA contrast
 * verified — and auto-corrected where it's safe to do so), radius/shadow/
 * motion/density scales, a fluid type scale, and font selections.
 *
 * Throws a descriptive error if, even after auto-correction, a color pairing
 * cannot meet WCAG AA — this is the "fail the build" half of the
 * accessibility contract described in the README; see `contrastReport` for
 * the passing case (returned for every pair, adjusted or not, so the design
 * panel can render a live report).
 */
export function resolveTheme(theme: ThemeConfig): ResolvedTheme {
  const preset = getPreset(theme.preset);

  const brandColor = theme.brandColor ?? preset.brandColor;
  const secondaryColor = theme.secondaryColor ?? preset.secondaryColor;
  const accentColor = theme.accentColor ?? preset.accentColor;
  const headingFont = theme.fonts?.heading ?? preset.headingFont;
  const bodyFont = theme.fonts?.body ?? preset.bodyFont;
  const radiusStyle = theme.radius ?? preset.radius;
  const shadowStyle = theme.shadow ?? preset.shadow;
  const motionStyle = theme.motion ?? preset.motion;
  const densityStyle = theme.density ?? preset.density;

  const scales = buildBrandPalette(brandColor, secondaryColor, accentColor);

  const bg = scales.neutral[50];
  const surface = "#ffffff";
  const surface2 = scales.neutral[100];
  const border = scales.neutral[200];

  const contrastReport: ContrastCheck[] = [];

  function pair(
    name: string,
    background: string,
    preferredForeground: string,
    opts?: { level?: "AA" | "AA-large"; maxDeltaL?: number },
  ): string {
    const level = opts?.level ?? "AA";
    const required = level === "AA" ? 4.5 : AA_LARGE_MIN_RATIO;
    const { hex, ratio, adjusted } = ensureContrast(
      background,
      preferredForeground,
      level,
      opts?.maxDeltaL,
    );
    contrastReport.push({
      name,
      background,
      foreground: hex,
      ratio: Math.round(ratio * 100) / 100,
      required,
      passes: ratio >= required,
      adjusted,
    });
    if (ratio < required) {
      throw new Error(
        `Theme accessibility check failed for "${name}": ${hex} on ${background} is only ` +
          `${ratio.toFixed(2)}:1 (needs >= ${required}:1 for WCAG ${level}). This color pairing ` +
          `cannot be auto-corrected within the allowed adjustment range — choose a different ` +
          `brandColor/accentColor/secondaryColor in business.config.ts's "theme" block.`,
      );
    }
    return hex;
  }

  // Near-black/near-white are the auto-foreground candidates for solid,
  // neutral-anchored surfaces — nudging is essentially unbounded here since
  // these never need to "look like" a specific brand hue.
  const fg = pair("body text on page background", bg, scales.neutral[950]);
  const fgMuted = pair("muted text on page background", bg, scales.neutral[600]);
  pair("body text on card surface", surface, scales.neutral[950]);
  pair("body text on alternate surface", surface2, scales.neutral[950]);

  const primary = scales.brand[600];
  const primaryForeground = pair(
    "button text on primary",
    primary,
    bestForeground(primary, scales.neutral[950], "#ffffff"),
  );

  const secondary = scales.secondary[700];
  const secondaryForeground = pair(
    "text on secondary",
    secondary,
    bestForeground(secondary, scales.neutral[950], "#ffffff"),
  );

  const accentSolid = scales.accent[500];
  const accentForeground = pair(
    "button text on accent",
    accentSolid,
    bestForeground(accentSolid, scales.neutral[950], "#ffffff"),
  );

  // The accent's *raw*, as-configured tone (not a re-lightened scale step,
  // and not swapped for black/white) is also used directly as a small
  // amount of text/iconography (e.g. star ratings) on light surfaces, so it
  // must itself be legible — bounded to a small lightness nudge (+/-0.12)
  // so a genuinely too-pale accent color (e.g. a pastel yellow) is reported
  // as a real failure instead of silently being darkened beyond recognition
  // or swapped for an unrelated color.
  pair("accent icon color on card surface", surface, accentColor ?? scales.accent[500], {
    level: "AA-large",
    maxDeltaL: 0.12,
  });

  const success = "#15803d";
  const successForeground = pair(
    "text on success",
    success,
    bestForeground(success, "#0b2e17", "#ffffff"),
  );
  const warning = "#b45309";
  const warningForeground = pair(
    "text on warning",
    warning,
    bestForeground(warning, "#2a1503", "#ffffff"),
  );
  const danger = "#b91c1c";
  const dangerForeground = pair(
    "text on danger",
    danger,
    bestForeground(danger, "#2a0a0a", "#ffffff"),
  );

  return {
    preset: theme.preset,
    colors: {
      bg,
      surface,
      surface2,
      border,
      fg,
      fgMuted,
      primary,
      primaryForeground,
      secondary,
      secondaryForeground,
      accent: accentSolid,
      accentForeground,
      success,
      successForeground,
      warning,
      warningForeground,
      danger,
      dangerForeground,
    },
    scales: {
      brand: scales.brand,
      neutral: scales.neutral,
      secondary: scales.secondary,
      accent: scales.accent,
    },
    radius: RADIUS_SCALES[radiusStyle],
    shadow: SHADOW_SCALES[shadowStyle],
    motion: MOTION_SCALES[motionStyle],
    density: DENSITY_SCALES[densityStyle],
    typeScale: buildTypeScale(preset.typeScaleRatio),
    fonts: {
      heading: headingFont,
      body: bodyFont,
      headingVar: fontCssVar(headingFont),
      bodyVar: fontCssVar(bodyFont),
    },
    contrastReport,
  };
}

/** Flattens a `ResolvedTheme` into the CSS custom properties consumed by
 * `app/globals.css`'s `@theme inline` block (which maps them onto Tailwind's
 * own token namespaces — colors, `--radius-*`, `--shadow-*`, `--text-*`,
 * `--font-*` — so existing utility classes like `rounded-lg` or `text-3xl`
 * automatically pick up the active preset's values). */
export function themeToCssVariables(theme: ResolvedTheme): Record<string, string> {
  const vars: Record<string, string> = {
    "--t-bg": theme.colors.bg,
    "--t-surface": theme.colors.surface,
    "--t-surface-2": theme.colors.surface2,
    "--t-border": theme.colors.border,
    "--t-fg": theme.colors.fg,
    "--t-fg-muted": theme.colors.fgMuted,
    "--t-primary": theme.colors.primary,
    "--t-primary-foreground": theme.colors.primaryForeground,
    "--t-secondary": theme.colors.secondary,
    "--t-secondary-foreground": theme.colors.secondaryForeground,
    "--t-accent": theme.colors.accent,
    "--t-accent-foreground": theme.colors.accentForeground,
    "--t-success": theme.colors.success,
    "--t-success-foreground": theme.colors.successForeground,
    "--t-warning": theme.colors.warning,
    "--t-warning-foreground": theme.colors.warningForeground,
    "--t-danger": theme.colors.danger,
    "--t-danger-foreground": theme.colors.dangerForeground,

    "--t-radius-sm": theme.radius.sm,
    "--t-radius-md": theme.radius.md,
    "--t-radius-lg": theme.radius.lg,
    "--t-radius-xl": theme.radius.xl,
    "--t-radius-full": theme.radius.full,

    "--t-shadow-sm": theme.shadow.sm,
    "--t-shadow-md": theme.shadow.md,
    "--t-shadow-lg": theme.shadow.lg,
    "--t-shadow-xl": theme.shadow.xl,

    "--t-motion-fast": theme.motion.fast,
    "--t-motion-base": theme.motion.base,
    "--t-motion-slow": theme.motion.slow,
    "--t-motion-easing": theme.motion.easing,

    "--t-space-section-y": theme.density.sectionY,
    "--t-space-gap": theme.density.gap,

    "--t-font-heading": theme.fonts.headingVar,
    "--t-font-body": theme.fonts.bodyVar,
  };

  for (const [step, value] of Object.entries(theme.typeScale)) {
    vars[`--t-text-${step}`] = value.size;
    vars[`--t-leading-${step}`] = value.lineHeight;
  }

  return vars;
}

export { contrastRatio };
