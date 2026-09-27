import { describe, expect, it } from "vitest";
import {
  buildAreaServed,
  buildFaqJsonLd,
  buildLocalBusinessJsonLd,
  buildOpeningHoursSpecification,
  buildServiceJsonLd,
} from "../schema-org";
import businessConfig from "../../business.config";

describe("buildLocalBusinessJsonLd", () => {
  const json = buildLocalBusinessJsonLd(businessConfig);

  it("uses the correct schema.org subtype for the business type", () => {
    expect(json["@type"]).toBe("Plumber");
    expect(json["@context"]).toBe("https://schema.org");
  });

  it("includes a well-formed PostalAddress", () => {
    expect(json.address).toMatchObject({
      "@type": "PostalAddress",
      streetAddress: "12 Maple Street",
      addressLocality: "Princeton",
      addressRegion: "NJ",
      postalCode: "08542",
      addressCountry: "US",
    });
  });

  it("includes GeoCoordinates", () => {
    expect(json.geo).toMatchObject({
      "@type": "GeoCoordinates",
      latitude: 40.3573,
      longitude: -74.6672,
    });
  });

  it("computes an aggregateRating from rated testimonials", () => {
    // Ratings in business.config.ts are 5, 5, 4 -> average 4.67 -> 4.7
    expect(json.aggregateRating).toMatchObject({
      "@type": "AggregateRating",
      ratingValue: 4.7,
      reviewCount: 3,
    });
  });

  it("includes sameAs links from social config", () => {
    expect(Array.isArray(json.sameAs)).toBe(true);
    expect((json.sameAs as string[]).length).toBeGreaterThan(0);
  });
});

describe("buildOpeningHoursSpecification", () => {
  it("emits one entry per (day, range) pair and omits closed days", () => {
    const specs = buildOpeningHoursSpecification(businessConfig);
    // mon-fri (1 range each) + sat (1 overnight range) = 6; sun is closed.
    expect(specs).toHaveLength(6);
    expect(specs.every((s) => s["@type"] === "OpeningHoursSpecification")).toBe(true);
  });

  it("formats dayOfWeek as a schema.org URL", () => {
    const specs = buildOpeningHoursSpecification(businessConfig);
    const monday = specs.find((s) => s.dayOfWeek === "https://schema.org/Monday");
    expect(monday).toMatchObject({ opens: "08:00", closes: "18:00" });
  });

  it("passes overnight ranges through unmodified (closes < opens)", () => {
    const specs = buildOpeningHoursSpecification(businessConfig);
    const saturday = specs.find((s) => s.dayOfWeek === "https://schema.org/Saturday");
    expect(saturday).toMatchObject({ opens: "09:00", closes: "01:00" });
  });
});

describe("buildAreaServed", () => {
  it("maps every service area town to a City entry", () => {
    const areas = buildAreaServed(businessConfig);
    expect(areas).toHaveLength(businessConfig.serviceAreas.length);
    expect(areas[0]).toMatchObject({ "@type": "City" });
  });
});

describe("buildFaqJsonLd", () => {
  it("builds an FAQPage with one Question per FAQ item", () => {
    const json = buildFaqJsonLd(businessConfig.faq);
    expect(json).not.toBeNull();
    expect(json?.["@type"]).toBe("FAQPage");
    const mainEntity = json?.mainEntity as unknown[];
    expect(mainEntity).toHaveLength(businessConfig.faq.length);
  });

  it("returns null for an empty FAQ list", () => {
    expect(buildFaqJsonLd([])).toBeNull();
  });
});

describe("buildServiceJsonLd", () => {
  it("links the service back to the business as provider", () => {
    const service = businessConfig.services[0]!;
    const json = buildServiceJsonLd(businessConfig, service);
    expect(json["@type"]).toBe("Service");
    expect(json.name).toBe(service.name);
    expect(json.provider).toMatchObject({ "@type": "Plumber", name: businessConfig.name });
  });

  it("includes an Offer when priceFrom is set", () => {
    const service = businessConfig.services.find((s) => typeof s.priceFrom === "number")!;
    const json = buildServiceJsonLd(businessConfig, service);
    expect(json.offers).toMatchObject({ "@type": "Offer", priceCurrency: "USD" });
  });

  it("omits Offer when priceFrom is not set", () => {
    const service = businessConfig.services.find((s) => s.priceFrom === undefined)!;
    const json = buildServiceJsonLd(businessConfig, service);
    expect(json.offers).toBeUndefined();
  });
});
