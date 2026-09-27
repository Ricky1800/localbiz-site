import { describe, expect, it } from "vitest";
import { buildConfigSnippet } from "../copy-config";
import { DEFAULT_SECTIONS } from "../schema";

describe("buildConfigSnippet", () => {
  it("omits unset theme overrides", () => {
    const snippet = buildConfigSnippet({
      preset: "neutral",
      sections: DEFAULT_SECTIONS,
      layout: { header: { variant: "standard" }, footer: { variant: "simple" } },
    });
    expect(snippet).toContain('preset: "neutral"');
    expect(snippet).not.toContain("brandColor");
    expect(snippet).not.toContain("fonts:");
  });

  it("includes overrides that are set", () => {
    const snippet = buildConfigSnippet({
      preset: "salon-beauty",
      brandColor: "#123456",
      headingFont: "Fraunces",
      radius: "pill",
      sections: [{ type: "hero", variant: "centered" }],
      layout: { header: { variant: "centered" }, footer: { variant: "columns" } },
    });
    expect(snippet).toContain('brandColor: "#123456"');
    expect(snippet).toContain('heading: "Fraunces"');
    expect(snippet).toContain('radius: "pill"');
    expect(snippet).toContain('{ type: "hero", variant: "centered" }');
    expect(snippet).toContain('header: { variant: "centered" }');
    expect(snippet).toContain('footer: { variant: "columns" }');
  });

  it("produces syntactically balanced braces/brackets", () => {
    const snippet = buildConfigSnippet({
      preset: "auto-repair",
      sections: DEFAULT_SECTIONS,
      layout: { header: { variant: "standard" }, footer: { variant: "simple" } },
    });
    const opens = (snippet.match(/[{[]/g) ?? []).length;
    const closes = (snippet.match(/[}\]]/g) ?? []).length;
    expect(opens).toBe(closes);
  });
});
