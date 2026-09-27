import { describe, expect, it } from "vitest";
import {
  DEFAULT_SECTIONS,
  layoutConfigSchema,
  sectionsConfigSchema,
} from "../schema";

describe("sectionsConfigSchema", () => {
  it("defaults to DEFAULT_SECTIONS when omitted", () => {
    const parsed = sectionsConfigSchema.parse(undefined);
    expect(parsed).toEqual(DEFAULT_SECTIONS);
  });

  it("applies a per-section default variant when only 'type' is given", () => {
    const parsed = sectionsConfigSchema.parse([{ type: "hero" }, { type: "faq" }]);
    expect(parsed).toEqual([
      { type: "hero", variant: "split-image" },
      { type: "faq", variant: "accordion" },
    ]);
  });

  it("accepts an explicit variant per section", () => {
    const parsed = sectionsConfigSchema.parse([
      { type: "hero", variant: "centered" },
      { type: "services", variant: "list-rows" },
    ]);
    expect(parsed[0]).toEqual({ type: "hero", variant: "centered" });
    expect(parsed[1]).toEqual({ type: "services", variant: "list-rows" });
  });

  it("rejects an unknown variant for a given section type", () => {
    const result = sectionsConfigSchema.safeParse([{ type: "hero", variant: "not-a-variant" }]);
    expect(result.success).toBe(false);
  });

  it("rejects a duplicate section type", () => {
    const result = sectionsConfigSchema.safeParse([
      { type: "hero", variant: "centered" },
      { type: "hero", variant: "split-image" },
    ]);
    expect(result.success).toBe(false);
  });

  it("rejects an unknown section type", () => {
    const result = sectionsConfigSchema.safeParse([{ type: "not-a-section" }]);
    expect(result.success).toBe(false);
  });
});

describe("layoutConfigSchema", () => {
  it("defaults header/footer variants when omitted entirely", () => {
    const parsed = layoutConfigSchema.parse(undefined);
    expect(parsed).toEqual({ header: { variant: "standard" }, footer: { variant: "simple" } });
  });

  it("accepts partial overrides", () => {
    const parsed = layoutConfigSchema.parse({ header: { variant: "centered" } });
    expect(parsed.header.variant).toBe("centered");
    expect(parsed.footer.variant).toBe("simple");
  });
});
