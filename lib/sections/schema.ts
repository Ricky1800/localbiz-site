import { z } from "zod";

/**
 * Every section kind that can appear in the homepage body, and the variant
 * names each one supports. This is the single source of truth consumed by
 * both the zod schema below and `components/sections/index.tsx`'s
 * dispatcher, so an invalid `variant` in `business.config.ts` fails
 * validation instead of silently rendering nothing.
 */
export const SECTION_VARIANTS = {
  hero: ["split-image", "centered"],
  services: ["grid-cards", "list-rows"],
  testimonials: ["grid-cards", "spotlight"],
  serviceArea: ["pill-cloud", "list-columns"],
  hoursContact: ["card", "banner"],
  ctaBand: ["simple", "gradient"],
  faq: ["accordion", "two-column"],
  gallery: ["grid"],
} as const;

export type SectionKind = keyof typeof SECTION_VARIANTS;
export const SECTION_KINDS = Object.keys(SECTION_VARIANTS) as SectionKind[];

export const HEADER_VARIANTS = ["standard", "centered"] as const;
export const FOOTER_VARIANTS = ["simple", "columns"] as const;

const heroSectionSchema = z.object({
  type: z.literal("hero"),
  variant: z.enum(SECTION_VARIANTS.hero).default("split-image"),
});
const servicesSectionSchema = z.object({
  type: z.literal("services"),
  variant: z.enum(SECTION_VARIANTS.services).default("grid-cards"),
});
const testimonialsSectionSchema = z.object({
  type: z.literal("testimonials"),
  variant: z.enum(SECTION_VARIANTS.testimonials).default("grid-cards"),
});
const serviceAreaSectionSchema = z.object({
  type: z.literal("serviceArea"),
  variant: z.enum(SECTION_VARIANTS.serviceArea).default("pill-cloud"),
});
const hoursContactSectionSchema = z.object({
  type: z.literal("hoursContact"),
  variant: z.enum(SECTION_VARIANTS.hoursContact).default("card"),
});
const ctaBandSectionSchema = z.object({
  type: z.literal("ctaBand"),
  variant: z.enum(SECTION_VARIANTS.ctaBand).default("simple"),
});
const faqSectionSchema = z.object({
  type: z.literal("faq"),
  variant: z.enum(SECTION_VARIANTS.faq).default("accordion"),
});
const gallerySectionSchema = z.object({
  type: z.literal("gallery"),
  variant: z.enum(SECTION_VARIANTS.gallery).default("grid"),
});

export const sectionEntrySchema = z.discriminatedUnion("type", [
  heroSectionSchema,
  servicesSectionSchema,
  testimonialsSectionSchema,
  serviceAreaSectionSchema,
  hoursContactSectionSchema,
  ctaBandSectionSchema,
  faqSectionSchema,
  gallerySectionSchema,
]);

export type SectionEntry = z.infer<typeof sectionEntrySchema>;

/** The default homepage body: order + variant chosen to match the
 * project's original (pre-design-system) single-layout homepage, so
 * omitting `sections` entirely is a safe, familiar default. `hoursContact`
 * is opt-in since its info already appears in the hero and on `/contact`. */
export const DEFAULT_SECTIONS: SectionEntry[] = [
  { type: "hero", variant: "split-image" },
  { type: "services", variant: "grid-cards" },
  { type: "testimonials", variant: "grid-cards" },
  { type: "serviceArea", variant: "pill-cloud" },
  { type: "faq", variant: "accordion" },
  { type: "ctaBand", variant: "simple" },
];

export const sectionsConfigSchema = z
  .array(sectionEntrySchema)
  .default(DEFAULT_SECTIONS)
  .superRefine((sections, ctx) => {
    const seen = new Set<string>();
    sections.forEach((section, index) => {
      if (seen.has(section.type)) {
        ctx.addIssue({
          code: "custom",
          message: `Section type "${section.type}" appears more than once — each section kind may be used at most once.`,
          path: [index, "type"],
        });
      }
      seen.add(section.type);
    });
  });

export const layoutConfigSchema = z
  .object({
    header: z
      .object({ variant: z.enum(HEADER_VARIANTS).default("standard") })
      .default({ variant: "standard" }),
    footer: z
      .object({ variant: z.enum(FOOTER_VARIANTS).default("simple") })
      .default({ variant: "simple" }),
  })
  .default({ header: { variant: "standard" }, footer: { variant: "simple" } });

export type LayoutConfig = z.infer<typeof layoutConfigSchema>;
