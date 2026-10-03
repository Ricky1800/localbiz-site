import { describe, expect, it } from "vitest";
import { businessConfigSchema, parseBusinessConfig } from "../config";

function baseValidConfig() {
  return {
    name: "Test Co.",
    tagline: "We do things",
    businessType: "plumber",
    description: "A test business.",
    address: {
      street: "1 Main St",
      city: "Testville",
      state: "NJ",
      zip: "00000",
    },
    phone: "555-000-0000",
    email: "test@example.com",
    geo: { lat: 40.0, lng: -74.0 },
    timezone: "America/New_York",
    hours: {
      mon: { closed: false, ranges: [{ open: "09:00", close: "17:00" }] },
      tue: { closed: false, ranges: [{ open: "09:00", close: "17:00" }] },
      wed: { closed: false, ranges: [{ open: "09:00", close: "17:00" }] },
      thu: { closed: false, ranges: [{ open: "09:00", close: "17:00" }] },
      fri: { closed: false, ranges: [{ open: "09:00", close: "17:00" }] },
      sat: { closed: true },
      sun: { closed: true },
    },
    services: [
      { slug: "test-service", name: "Test Service", description: "Does a thing." },
    ],
    serviceAreas: ["Testville"],
    theme: { preset: "neutral" },
    logoPath: "/logo.svg",
    siteUrl: "https://example.com",
  };
}

describe("businessConfigSchema", () => {
  it("accepts a minimal valid config and applies defaults", () => {
    const parsed = businessConfigSchema.parse(baseValidConfig());
    expect(parsed.dateOverrides).toEqual([]);
    expect(parsed.testimonials).toEqual([]);
    expect(parsed.faq).toEqual([]);
    expect(parsed.address.country).toBe("US");
  });

  it("rejects a bad time format", () => {
    const config = baseValidConfig();
    config.hours.mon.ranges[0]!.open = "9:00"; // missing leading zero — invalid at runtime
    const result = businessConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it("rejects an invalid IANA timezone", () => {
    const config = baseValidConfig();
    config.timezone = "Not/A_Zone";
    const result = businessConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("timezone"))).toBe(true);
    }
  });

  it("rejects duplicate service slugs", () => {
    const config = baseValidConfig();
    config.services = [
      { slug: "same", name: "A", description: "a" },
      { slug: "same", name: "B", description: "b" },
    ];
    const result = businessConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it("rejects an open day with no ranges", () => {
    const config = baseValidConfig();
    // @ts-expect-error intentionally invalid: closed:false requires ranges
    config.hours.mon = { closed: false };
    const result = businessConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it("accepts overnight ranges (close before open)", () => {
    const config = baseValidConfig();
    config.hours.fri = { closed: false, ranges: [{ open: "18:00", close: "02:00" }] };
    const result = businessConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it("accepts a date override with reduced hours", () => {
    const config = baseValidConfig();
    (config as Record<string, unknown>).dateOverrides = [
      { date: "2026-12-24", closed: false, ranges: [{ open: "08:00", close: "13:00" }] },
    ];
    const result = businessConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it("rejects an unknown businessType", () => {
    const config = baseValidConfig();
    config.businessType = "spaceship_repair";
    const result = businessConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it("parseBusinessConfig throws a readable error on invalid input", () => {
    expect(() => parseBusinessConfig({})).toThrow(/Invalid business.config.ts/);
  });

  it("defaults theme to the neutral preset when omitted", () => {
    const config = baseValidConfig() as Record<string, unknown>;
    delete config.theme;
    const parsed = businessConfigSchema.parse(config);
    expect(parsed.theme.preset).toBe("neutral");
  });

  it("fails the build with a clear message for an inaccessible theme color", () => {
    const config = baseValidConfig();
    (config as Record<string, unknown>).theme = {
      preset: "neutral",
      accentColor: "#fde047",
    };
    expect(() => parseBusinessConfig(config)).toThrow(/theme/i);
  });

  it("accepts valid optional gallery configuration", () => {
    const config = baseValidConfig();
    (config as Record<string, unknown>).gallery = [
      { src: "/images/job-1.jpg", alt: "Completed pipe installation" },
      { src: "/images/job-2.jpg", alt: "Commercial drain cleaning work" },
    ];
    const parsed = businessConfigSchema.parse(config);
    expect(parsed.gallery).toHaveLength(2);
    expect(parsed.gallery?.[0]?.alt).toBe("Completed pipe installation");
  });

  it("rejects gallery items with missing or empty alt text", () => {
    const config = baseValidConfig();
    (config as Record<string, unknown>).gallery = [
      { src: "/images/job-1.jpg", alt: "" },
    ];
    const result = businessConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

});

describe("the example business.config.ts", () => {
  it("parses successfully and exposes the expected fixture data", async () => {
    const mod = await import("../../business.config");
    const config = mod.default;
    expect(config.name).toBe("Maple Street Plumbing");
    expect(config.businessType).toBe("plumber");
    expect(config.services.length).toBeGreaterThan(0);
    expect(config.serviceAreas).toContain("Princeton");
  });
});
