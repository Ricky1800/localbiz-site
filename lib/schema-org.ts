import type { BusinessConfig, FaqItem, Service } from "./config";
import { schemaOrgTypeFor } from "./business-types";
import { DAY_KEYS, type DayKey } from "./hours";

const SCHEMA_DAY_NAMES: Record<DayKey, string> = {
  sun: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
};

/** Joins a site URL and a path, avoiding double/missing slashes. */
function joinUrl(base: string, path: string): string {
  const trimmedBase = base.replace(/\/+$/, "");
  const trimmedPath = path.replace(/^\/+/, "");
  return `${trimmedBase}/${trimmedPath}`;
}

/**
 * Builds the `openingHoursSpecification` array for JSON-LD from the
 * business's weekly hours. One entry per (day, range) pair — schema.org
 * allows `dayOfWeek` to be a single value per specification, which keeps
 * this simple and unambiguous. Days with no ranges (closed) are omitted.
 */
export function buildOpeningHoursSpecification(
  config: BusinessConfig,
): Record<string, unknown>[] {
  const specs: Record<string, unknown>[] = [];
  for (const day of DAY_KEYS) {
    const schedule = config.hours[day];
    if (schedule.closed) continue;
    for (const range of schedule.ranges) {
      specs.push({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${SCHEMA_DAY_NAMES[day]}`,
        opens: range.open,
        closes: range.close,
      });
    }
  }
  return specs;
}

/** Builds `areaServed` entries (schema.org `City`) from service-area towns. */
export function buildAreaServed(config: BusinessConfig): Record<string, unknown>[] {
  return config.serviceAreas.map((town) => ({
    "@type": "City",
    name: town,
  }));
}

/**
 * Builds the main `LocalBusiness` (or subtype) JSON-LD object for a
 * business config. Intended to be embedded on every page via a
 * `<script type="application/ld+json">` tag (see `components/JsonLd.tsx`).
 */
export function buildLocalBusinessJsonLd(
  config: BusinessConfig,
): Record<string, unknown> {
  const ratedTestimonials = config.testimonials.filter(
    (t): t is typeof t & { rating: number } => typeof t.rating === "number",
  );

  const json: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": schemaOrgTypeFor(config.businessType),
    "@id": joinUrl(config.siteUrl, "/#business"),
    name: config.name,
    description: config.description,
    url: config.siteUrl,
    image: joinUrl(config.siteUrl, config.logoPath),
    telephone: config.phone,
    email: config.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: config.address.street,
      addressLocality: config.address.city,
      addressRegion: config.address.state,
      postalCode: config.address.zip,
      addressCountry: config.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: config.geo.lat,
      longitude: config.geo.lng,
    },
    openingHoursSpecification: buildOpeningHoursSpecification(config),
    areaServed: buildAreaServed(config),
  };

  if (Object.keys(config.social).length > 0) {
    json.sameAs = Object.values(config.social);
  }

  if (ratedTestimonials.length > 0) {
    const sum = ratedTestimonials.reduce((acc, t) => acc + t.rating, 0);
    const average = sum / ratedTestimonials.length;
    json.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(average.toFixed(1)),
      reviewCount: ratedTestimonials.length,
    };
    json.review = ratedTestimonials.map((t) => ({
      "@type": "Review",
      author: { "@type": "Person", name: t.name },
      reviewRating: {
        "@type": "Rating",
        ratingValue: t.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: t.quote,
    }));
  }

  return json;
}

/** Builds an `FAQPage` JSON-LD object, or `null` if there are no FAQ items. */
export function buildFaqJsonLd(faq: FaqItem[]): Record<string, unknown> | null {
  if (faq.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/** Builds a `Service` JSON-LD object for a single service page, linked back
 * to the business via `provider`. */
export function buildServiceJsonLd(
  config: BusinessConfig,
  service: Service,
): Record<string, unknown> {
  const json: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    areaServed: buildAreaServed(config),
    provider: {
      "@type": schemaOrgTypeFor(config.businessType),
      name: config.name,
      "@id": joinUrl(config.siteUrl, "/#business"),
    },
    url: joinUrl(config.siteUrl, `/services/${service.slug}`),
  };

  if (typeof service.priceFrom === "number") {
    json.offers = {
      "@type": "Offer",
      priceCurrency: "USD",
      price: service.priceFrom,
      priceSpecification: {
        "@type": "PriceSpecification",
        minPrice: service.priceFrom,
        priceCurrency: "USD",
      },
    };
  }

  return json;
}
