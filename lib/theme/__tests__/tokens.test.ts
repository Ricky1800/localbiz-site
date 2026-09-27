import { describe, expect, it } from "vitest";
import { isValidHexColor } from "../color";
import { PRESET_KEYS } from "../presets";
import type { ThemeConfig } from "../schema";
import { resolveTheme, themeToCssVariables } from "../tokens";

function themeConfig(overrides: Partial<ThemeConfig> = {}): ThemeConfig {
  return { preset: "neutral", ...overrides } as ThemeConfig;
}

describe("resolveTheme", () => {
  it.each(PRESET_KEYS)("resolves preset '%s' with a fully passing contrast report", (preset) => {
    const theme = resolveTheme(themeConfig({ preset }));
    expect(theme.contrastReport.length).toBeGreaterThan(0);
    for (const check of theme.contrastReport) {
      expect(check.passes, `${check.name}: ${check.ratio}:1 (needs ${check.required}:1)`).toBe(
        true,
      );
      expect(check.ratio).toBeGreaterThanOrEqual(check.required);
    }
  });

  it.each(PRESET_KEYS)("produces only valid hex colors for preset '%s'", (preset) => {
    const theme = resolveTheme(themeConfig({ preset }));
    for (const value of Object.values(theme.colors)) {
      expect(isValidHexColor(value)).toBe(true);
    }
  });

  it("applies a brandColor override on top of a preset", () => {
    const base = resolveTheme(themeConfig({ preset: "salon-beauty" }));
    const overridden = resolveTheme(
      themeConfig({ preset: "salon-beauty", brandColor: "#1d4ed8" }),
    );
    expect(overridden.colors.primary).not.toBe(base.colors.primary);
  });

  it("applies font overrides", () => {
    const theme = resolveTheme(
      themeConfig({ preset: "neutral", fonts: { heading: "Fraunces", body: "Rubik" } }),
    );
    expect(theme.fonts.heading).toBe("Fraunces");
    expect(theme.fonts.body).toBe("Rubik");
  });

  it("applies radius/shadow/motion/density overrides", () => {
    const theme = resolveTheme(
      themeConfig({
        preset: "neutral",
        radius: "pill",
        shadow: "elevated",
        motion: "energetic",
        density: "compact",
      }),
    );
    expect(theme.radius.full).toBe("9999px");
    expect(theme.shadow.xl).toContain("0.22");
    expect(theme.motion.slow).toBe("320ms");
  });

  it("throws a descriptive error for a genuinely inaccessible accent color", () => {
    // Pure, highly-saturated yellow reflects a lot of both the red and
    // green channels, giving it high relative luminance almost regardless
    // of how it's darkened in OKLCH terms — a textbook case of a brand
    // color that simply cannot be used as small text/icon color on a light
    // surface without changing hue, which our accent-as-icon check
    // deliberately does not permit (see `tokens.ts`'s bounded maxDeltaL).
    expect(() =>
      resolveTheme(themeConfig({ preset: "neutral", accentColor: "#fde047" })),
    ).toThrow(/Theme accessibility check failed/);
  });
});

describe("themeToCssVariables", () => {
  it("emits every expected CSS custom property", () => {
    const theme = resolveTheme(themeConfig());
    const vars = themeToCssVariables(theme);
    for (const key of [
      "--t-bg",
      "--t-primary",
      "--t-primary-foreground",
      "--t-radius-md",
      "--t-shadow-md",
      "--t-motion-base",
      "--t-font-heading",
      "--t-text-3xl",
      "--t-leading-3xl",
    ]) {
      expect(vars).toHaveProperty(key);
      expect(vars[key]).toBeTruthy();
    }
  });
});
