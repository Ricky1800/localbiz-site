import { describe, expect, it } from "vitest";
import { SECTION_VARIANTS, sectionEntrySchema, sectionsConfigSchema } from "../sections/schema";

describe("sections schema", () => {
  it("includes gallery in section variants", () => {
    expect(SECTION_VARIANTS.gallery).toEqual(["grid"]);
  });

  it("validates gallery section entry correctly", () => {
    const valid = sectionEntrySchema.parse({ type: "gallery", variant: "grid" });
    expect(valid.type).toBe("gallery");
    expect(valid.variant).toBe("grid");

    const withDefault = sectionEntrySchema.parse({ type: "gallery" });
    expect(withDefault.variant).toBe("grid");
  });

  it("allows gallery in sections list without duplicates", () => {
    const sections = [
      { type: "hero", variant: "split-image" },
      { type: "gallery", variant: "grid" },
    ];
    const parsed = sectionsConfigSchema.parse(sections);
    expect(parsed).toHaveLength(2);
  });
});
