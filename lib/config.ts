import { z } from "zod";
import { BUSINESS_TYPE_KEYS } from "./business-types";
import { DAY_KEYS, type DayKey } from "./hours";

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const timeStringSchema = z
  .string()
  .regex(TIME_REGEX, "Time must be 24-hour \"HH:mm\", e.g. \"09:00\"");

const hoursRangeSchema = z
  .object({
    open: timeStringSchema,
    close: timeStringSchema,
  })
  .refine((r) => r.open !== r.close, {
    message: "open and close time cannot be identical",
    path: ["close"],
  });

const dayScheduleSchema = z.discriminatedUnion("closed", [
  z.object({ closed: z.literal(true) }),
  z.object({
    closed: z.literal(false),
    ranges: z.array(hoursRangeSchema).min(1, "at least one range is required when open"),
  }),
]);

const weeklyHoursSchema = z.object(
  Object.fromEntries(DAY_KEYS.map((day) => [day, dayScheduleSchema])) as Record<
    DayKey,
    typeof dayScheduleSchema
  >,
);

const dateOverrideSchema = z
  .object({
    date: z.string().regex(DATE_REGEX, "Date must be \"YYYY-MM-DD\""),
    label: z.string().min(1).optional(),
    closed: z.boolean(),
    ranges: z.array(hoursRangeSchema).optional(),
  })
  .refine((o) => o.closed || (o.ranges && o.ranges.length > 0), {
    message: "ranges is required when closed is false",
    path: ["ranges"],
  });

const serviceSchema = z.object({
  slug: z.string().regex(SLUG_REGEX, "slug must be lowercase kebab-case, e.g. \"drain-cleaning\""),
  name: z.string().min(1),
  description: z.string().min(1),
  priceFrom: z.number().positive().optional(),
});

const testimonialSchema = z.object({
  name: z.string().min(1),
  quote: z.string().min(1),
  rating: z.number().min(1).max(5).optional(),
  town: z.string().min(1).optional(),
});

const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

const socialLinksSchema = z.object({
  facebook: z.url().optional(),
  instagram: z.url().optional(),
  google: z.url().optional(),
  yelp: z.url().optional(),
  x: z.url().optional(),
  tiktok: z.url().optional(),
  linkedin: z.url().optional(),
});

const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  zip: z.string().min(3),
  country: z.string().min(2).default("US"),
});

const geoSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const brandColorsSchema = z.object({
  primary: z.string().regex(HEX_COLOR_REGEX, "must be a hex color, e.g. \"#0f766e\""),
  secondary: z.string().regex(HEX_COLOR_REGEX).optional(),
  accent: z.string().regex(HEX_COLOR_REGEX).optional(),
});

export const businessConfigSchema = z
  .object({
    name: z.string().min(1),
    tagline: z.string().min(1),
    businessType: z.enum(BUSINESS_TYPE_KEYS),
    description: z.string().min(1),
    address: addressSchema,
    phone: z.string().min(7),
    email: z.email(),
    geo: geoSchema,
    timezone: z.string().min(1),
    hours: weeklyHoursSchema,
    dateOverrides: z.array(dateOverrideSchema).default([]),
    services: z.array(serviceSchema).min(1, "at least one service is required"),
    serviceAreas: z.array(z.string().min(1)).min(1, "at least one service area town is required"),
    testimonials: z.array(testimonialSchema).default([]),
    faq: z.array(faqSchema).default([]),
    social: socialLinksSchema.default({}),
    bookingUrl: z.url().optional(),
    contactFormWebhookUrl: z.url().optional(),
    brandColors: brandColorsSchema,
    logoPath: z.string().min(1),
    siteUrl: z.url(),
  })
  .superRefine((cfg, ctx) => {
    try {
      Intl.DateTimeFormat("en-US", { timeZone: cfg.timezone });
    } catch {
      ctx.addIssue({
        code: "custom",
        message: `"${cfg.timezone}" is not a valid IANA timezone (e.g. "America/New_York")`,
        path: ["timezone"],
      });
    }

    const seenSlugs = new Set<string>();
    cfg.services.forEach((service, index) => {
      if (seenSlugs.has(service.slug)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate service slug "${service.slug}"`,
          path: ["services", index, "slug"],
        });
      }
      seenSlugs.add(service.slug);
    });

    const seenDates = new Set<string>();
    cfg.dateOverrides.forEach((override, index) => {
      if (seenDates.has(override.date)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate dateOverrides entry for "${override.date}"`,
          path: ["dateOverrides", index, "date"],
        });
      }
      seenDates.add(override.date);
    });
  });

export type BusinessConfig = z.infer<typeof businessConfigSchema>;
export type Service = BusinessConfig["services"][number];
export type Testimonial = BusinessConfig["testimonials"][number];
export type FaqItem = BusinessConfig["faq"][number];

/**
 * Validates a raw business config object, throwing a readable
 * `ZodError`-derived message on failure. Call this once, at build/import
 * time, on the default export of `business.config.ts`.
 */
export function parseBusinessConfig(input: unknown): BusinessConfig {
  const result = businessConfigSchema.safeParse(input);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid business.config.ts:\n${issues}`);
  }
  return result.data;
}
