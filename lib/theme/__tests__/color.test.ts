import { describe, expect, it } from "vitest";
import {
  bestForeground,
  contrastRatio,
  ensureContrast,
  hexToOklch,
  hexToRgb,
  isValidHexColor,
  meetsWcagAA,
  oklchToHex,
  relativeLuminance,
} from "../color";

describe("hexToRgb / isValidHexColor", () => {
  it("parses 6-digit and 3-digit hex", () => {
    expect(hexToRgb("#ffffff")).toEqual({ r: 1, g: 1, b: 1 });
    expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb("#fff")).toEqual({ r: 1, g: 1, b: 1 });
  });

  it("validates hex strings", () => {
    expect(isValidHexColor("#0f766e")).toBe(true);
    expect(isValidHexColor("#fff")).toBe(true);
    expect(isValidHexColor("0f766e")).toBe(true);
    expect(isValidHexColor("not-a-color")).toBe(false);
    expect(isValidHexColor("#ggg")).toBe(false);
  });
});

describe("OKLCH round-trip", () => {
  it("converts hex -> OKLCH -> hex back to (approximately) the same color", () => {
    const samples = ["#3457a6", "#b8336a", "#15803d", "#f2a900", "#111111", "#eeeeee"];
    for (const hex of samples) {
      const oklch = hexToOklch(hex);
      const roundTripped = oklchToHex(oklch);
      const rgbA = hexToRgb(hex);
      const rgbB = hexToRgb(roundTripped);
      // Allow a small tolerance for float rounding through the cube-root /
      // matrix math and 8-bit quantization on the way back to hex.
      expect(Math.abs(rgbA.r - rgbB.r)).toBeLessThan(0.01);
      expect(Math.abs(rgbA.g - rgbB.g)).toBeLessThan(0.01);
      expect(Math.abs(rgbA.b - rgbB.b)).toBeLessThan(0.01);
    }
  });

  it("black and white have expected extreme lightness", () => {
    expect(hexToOklch("#000000").l).toBeCloseTo(0, 2);
    expect(hexToOklch("#ffffff").l).toBeCloseTo(1, 2);
  });

  it("grayscale colors have ~zero chroma", () => {
    expect(hexToOklch("#808080").c).toBeLessThan(0.005);
  });
});

describe("contrastRatio / relativeLuminance", () => {
  it("black on white is the maximum ratio, 21:1", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
  });

  it("identical colors have a ratio of 1", () => {
    expect(contrastRatio("#3457a6", "#3457a6")).toBeCloseTo(1, 5);
  });

  it("is symmetric regardless of argument order", () => {
    const a = contrastRatio("#111111", "#eeeeee");
    const b = contrastRatio("#eeeeee", "#111111");
    expect(a).toBeCloseTo(b, 10);
  });

  it("relative luminance of white is 1 and black is 0", () => {
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 5);
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 5);
  });
});

describe("meetsWcagAA", () => {
  it("passes for black text on white background", () => {
    expect(meetsWcagAA("#ffffff", "#000000")).toBe(true);
  });

  it("fails for low-contrast pastel-on-white", () => {
    expect(meetsWcagAA("#ffffff", "#f5f5f5")).toBe(false);
  });

  it("AA-large has a lower bar than AA", () => {
    // A pair around 3.5:1 should pass "AA-large" (>= 3) but fail "AA" (>= 4.5).
    expect(meetsWcagAA("#ffffff", "#767676", "AA")).toBe(true); // ~4.5:1, right at the edge
    expect(meetsWcagAA("#ffffff", "#949494", "AA")).toBe(false);
    expect(meetsWcagAA("#ffffff", "#949494", "AA-large")).toBe(true);
  });
});

describe("bestForeground", () => {
  it("picks white text on a dark background", () => {
    expect(bestForeground("#111111", "#000000", "#ffffff")).toBe("#ffffff");
  });

  it("picks black text on a light background", () => {
    expect(bestForeground("#f5f5f5", "#000000", "#ffffff")).toBe("#000000");
  });
});

describe("ensureContrast", () => {
  it("returns the original color unmodified when it already passes", () => {
    const result = ensureContrast("#ffffff", "#000000");
    expect(result.adjusted).toBe(false);
    expect(result.hex).toBe("#000000");
    expect(result.ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("nudges a failing pair until it passes AA, preserving hue", () => {
    // A mid-tone brand blue on a near-white background typically fails AA
    // outright; ensureContrast should darken it until it passes.
    const bg = "#fafafa";
    const fg = "#6d8fd1"; // light-ish blue, likely < 4.5:1 on near-white
    const before = contrastRatio(bg, fg);
    expect(before).toBeLessThan(4.5);

    const result = ensureContrast(bg, fg, "AA");
    expect(result.adjusted).toBe(true);
    expect(result.ratio).toBeGreaterThanOrEqual(4.5);

    // Hue should be preserved (still "blue-ish"), only lightness changed.
    const beforeHue = hexToOklch(fg).h;
    const afterHue = hexToOklch(result.hex).h;
    expect(Math.abs(beforeHue - afterHue)).toBeLessThan(5);
  });

  it("respects a maxDeltaL bound and can fail to reach the threshold", () => {
    const bg = "#ffffff";
    const fg = "#fef9c3"; // very pale yellow — nowhere near AA-large on white
    const result = ensureContrast(bg, fg, "AA-large", 0.05);
    expect(result.ratio).toBeLessThan(3);
  });

  it("with an unbounded search, always eventually reaches AA against a light background", () => {
    const bg = "#fafafa";
    const fg = "#fef9c3";
    const result = ensureContrast(bg, fg, "AA");
    expect(result.ratio).toBeGreaterThanOrEqual(4.5);
  });
});
