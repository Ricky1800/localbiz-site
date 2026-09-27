import { z } from "zod";
import { FONT_KEYS, type FontKey } from "./font-registry";
import { PRESET_KEYS } from "./presets";

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const hexColorSchema = z
  .string()
  .regex(HEX_COLOR_REGEX, 'must be a hex color, e.g. "#0f766e"');

export const radiusStyleSchema = z.enum(["none", "sm", "md", "lg", "pill"]);
export const shadowStyleSchema = z.enum(["flat", "soft", "elevated"]);
export const motionStyleSchema = z.enum(["subtle", "standard", "energetic"]);
export const densityStyleSchema = z.enum(["compact", "comfortable", "spacious"]);
export const presetKeySchema = z.enum(PRESET_KEYS);
export const fontKeySchema = z.enum([...FONT_KEYS] as [FontKey, ...FontKey[]]);

/**
 * `theme` block of `business.config.ts`. Every field but `preset` is an
 * override on top of the chosen preset's defaults — set only what you want
 * to change from the preset (e.g. just `brandColor` to re-tint an existing
 * preset with your own brand color while keeping its fonts/radius/shadow).
 */
export const themeConfigSchema = z
  .object({
    preset: presetKeySchema.default("neutral"),
    brandColor: hexColorSchema.optional(),
    secondaryColor: hexColorSchema.optional(),
    accentColor: hexColorSchema.optional(),
    fonts: z
      .object({
        heading: fontKeySchema.optional(),
        body: fontKeySchema.optional(),
      })
      .optional(),
    radius: radiusStyleSchema.optional(),
    shadow: shadowStyleSchema.optional(),
    motion: motionStyleSchema.optional(),
    density: densityStyleSchema.optional(),
  })
  .default({ preset: "neutral" });

export type ThemeConfig = z.infer<typeof themeConfigSchema>;
