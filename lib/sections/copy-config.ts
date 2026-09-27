import type { FontKey } from "../theme/font-registry";
import type { DensityStyle, MotionStyle, PresetKey, RadiusStyle, ShadowStyle } from "../theme/presets";
import type { LayoutConfig } from "./schema";
import type { SectionEntry } from "./schema";

export interface CopyConfigInput {
  preset: PresetKey;
  brandColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  headingFont?: FontKey;
  bodyFont?: FontKey;
  radius?: RadiusStyle;
  shadow?: ShadowStyle;
  motion?: MotionStyle;
  density?: DensityStyle;
  sections: SectionEntry[];
  layout: LayoutConfig;
}

function indent(lines: string[], depth: number): string[] {
  const pad = "  ".repeat(depth);
  return lines.map((line) => `${pad}${line}`);
}

/**
 * Renders the exact `theme` / `sections` / `layout` snippet to paste into
 * `business.config.ts`, from the design panel's current in-memory state.
 * Only emits fields that differ from "unset" (theme overrides) so the
 * output looks like something a person would actually write by hand,
 * rather than a fully-expanded dump of every possible field.
 */
export function buildConfigSnippet(input: CopyConfigInput): string {
  const themeLines: string[] = [`preset: ${JSON.stringify(input.preset)},`];
  if (input.brandColor) themeLines.push(`brandColor: ${JSON.stringify(input.brandColor)},`);
  if (input.secondaryColor) themeLines.push(`secondaryColor: ${JSON.stringify(input.secondaryColor)},`);
  if (input.accentColor) themeLines.push(`accentColor: ${JSON.stringify(input.accentColor)},`);
  if (input.headingFont || input.bodyFont) {
    const fontLines: string[] = [];
    if (input.headingFont) fontLines.push(`heading: ${JSON.stringify(input.headingFont)},`);
    if (input.bodyFont) fontLines.push(`body: ${JSON.stringify(input.bodyFont)},`);
    themeLines.push("fonts: {", ...indent(fontLines, 1), "},");
  }
  if (input.radius) themeLines.push(`radius: ${JSON.stringify(input.radius)},`);
  if (input.shadow) themeLines.push(`shadow: ${JSON.stringify(input.shadow)},`);
  if (input.motion) themeLines.push(`motion: ${JSON.stringify(input.motion)},`);
  if (input.density) themeLines.push(`density: ${JSON.stringify(input.density)},`);

  const sectionLines = input.sections.map(
    (section) => `{ type: ${JSON.stringify(section.type)}, variant: ${JSON.stringify(section.variant)} },`,
  );

  const layoutLines = [
    `header: { variant: ${JSON.stringify(input.layout.header.variant)} },`,
    `footer: { variant: ${JSON.stringify(input.layout.footer.variant)} },`,
  ];

  const lines = [
    "theme: {",
    ...indent(themeLines, 1),
    "},",
    "sections: [",
    ...indent(sectionLines, 1),
    "],",
    "layout: {",
    ...indent(layoutLines, 1),
    "},",
  ];

  return lines.join("\n");
}
