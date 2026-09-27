import { describe, expect, it } from "vitest";
import { contrastRatio, hexToOklch, isValidHexColor } from "../color";
import { buildBrandPalette, generateNeutralScale, generateScale, resolveRolePair } from "../palette";

describe("generateScale", () => {
  it("produces all 11 steps as valid hex colors", () => {
    const scale = generateScale("#3457a6");
    const steps: Array<keyof typeof scale> = [
      50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
    ];
    for (const step of steps) {
      expect(isValidHexColor(scale[step])).toBe(true);
    }
  });

  it("is monotonically decreasing in lightness from 50 to 950", () => {
    const scale = generateScale("#c2410c");
    const steps: Array<keyof typeof scale> = [
      50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
    ];
    const lightnesses = steps.map((step) => hexToOklch(scale[step]).l);
    for (let i = 1; i < lightnesses.length; i++) {
      expect(lightnesses[i]).toBeLessThan(lightnesses[i - 1] as number);
    }
  });

  it("preserves hue across the scale (within a reasonable tolerance)", () => {
    const brandHex = "#0d9488";
    const baseHue = hexToOklch(brandHex).h;
    const scale = generateScale(brandHex);
    // The 500 step is closest to the source color's own hue; extreme steps
    // (near-black/near-white) naturally have less stable hue since chroma
    // is tapered toward zero there, so we only assert the midtones.
    for (const step of [300, 400, 500, 600, 700] as const) {
      const hue = hexToOklch(scale[step]).h;
      expect(Math.abs(hue - baseHue)).toBeLessThan(3);
    }
  });
});

describe("generateNeutralScale", () => {
  it("has very low chroma at every step (looks gray)", () => {
    const neutral = generateNeutralScale("#b8336a");
    for (const hex of Object.values(neutral)) {
      expect(hexToOklch(hex).c).toBeLessThan(0.02);
    }
  });
});

describe("buildBrandPalette", () => {
  it("derives secondary/accent hues when not provided", () => {
    const palette = buildBrandPalette("#3457a6");
    expect(palette.secondary[500]).not.toBe(palette.brand[500]);
    expect(palette.accent[500]).not.toBe(palette.brand[500]);
  });

  it("uses explicit secondary/accent colors when provided", () => {
    const palette = buildBrandPalette("#3457a6", "#111827", "#f2a900");
    // The 500 step of a scale generated *from* a color should stay close in
    // hue to that seed color.
    const seedHue = hexToOklch("#f2a900").h;
    const accentHue = hexToOklch(palette.accent[500]).h;
    expect(Math.abs(seedHue - accentHue)).toBeLessThan(3);
  });
});

describe("resolveRolePair", () => {
  it("passes through an already-compliant pair unchanged", () => {
    const result = resolveRolePair("#ffffff", "#111111");
    expect(result.adjusted).toBe(false);
    expect(result.ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("auto-adjusts a failing pair and reports the real ratio achieved", () => {
    const result = resolveRolePair("#fafafa", "#6d8fd1");
    expect(result.adjusted).toBe(true);
    expect(result.ratio).toBeCloseTo(contrastRatio(result.background, result.foreground), 5);
    expect(result.ratio).toBeGreaterThanOrEqual(4.5);
  });
});
