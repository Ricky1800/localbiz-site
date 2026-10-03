import { describe, it, expect } from "vitest";
import { generateConfigFileContent, type InitAnswers } from "../../scripts/init";
import { parseBusinessConfig } from "../config";

describe("Scaffold CLI scripts/init", () => {
  const sampleAnswers: InitAnswers = {
    name: "Summit Dental Care",
    tagline: "Gentle family dentistry you can count on",
    street: "450 Aspen Way",
    city: "Denver",
    state: "CO",
    zip: "80202",
    phone: "(303) 555-0199",
    email: "office@summitdental.example",
    timezone: "America/Denver",
    brandColor: "#0ea5e9",
    serviceName: "Teeth Whitening",
    serviceDescription: "In-office laser whitening treatment with take-home touch-up kit.",
    servicePriceFrom: 299,
  };

  it("generates valid TypeScript code string matching BusinessConfig schema", () => {
    const generatedCode = generateConfigFileContent(sampleAnswers);
    expect(generatedCode).toContain('name: "Summit Dental Care"');
    expect(generatedCode).toContain('brandColor: "#0ea5e9"');
    expect(generatedCode).toContain('slug: "teeth-whitening"');
    expect(generatedCode).toContain("priceFrom: 299");
  });

  it("produces an object that parses cleanly under zod parseBusinessConfig", () => {
    const rawGenerated = {
      name: sampleAnswers.name,
      tagline: sampleAnswers.tagline,
      businessType: "dentist" as const,
      siteUrl: "https://example.com",
      logoPath: "/logo.svg",
      description: `${sampleAnswers.name} provides trusted professional services.`,
      address: {
        street: sampleAnswers.street,
        city: sampleAnswers.city,
        state: sampleAnswers.state,
        zip: sampleAnswers.zip,
        country: "US",
      },
      phone: sampleAnswers.phone,
      email: sampleAnswers.email,
      geo: { lat: 39.7392, lng: -104.9903 },
      timezone: sampleAnswers.timezone,
      hours: {
        mon: { closed: false, ranges: [{ open: "09:00", close: "17:00" }] },
        tue: { closed: false, ranges: [{ open: "09:00", close: "17:00" }] },
        wed: { closed: false, ranges: [{ open: "09:00", close: "17:00" }] },
        thu: { closed: false, ranges: [{ open: "09:00", close: "17:00" }] },
        fri: { closed: false, ranges: [{ open: "09:00", close: "17:00" }] },
        sat: { closed: true },
        sun: { closed: true },
      },
      theme: {
        preset: "neutral" as const,
        brandColor: sampleAnswers.brandColor,
      },
      services: [
        {
          slug: "teeth-whitening",
          name: sampleAnswers.serviceName,
          description: sampleAnswers.serviceDescription,
          priceFrom: sampleAnswers.servicePriceFrom,
        },
      ],
      testimonials: [
        {
          quote: "Outstanding experience from start to finish.",
          name: "Jordan Lee",
          town: sampleAnswers.city,
          rating: 5,
        },
      ],
      serviceAreas: [sampleAnswers.city],
      faq: [
        {
          question: "Do you take insurance?",
          answer: "We accept most major dental plans.",
        },
      ],
      images: {
        hero: "/images/hero.jpg",
      },
      sections: [
        { type: "hero" as const, variant: "split-image" as const },
        { type: "services" as const, variant: "grid-cards" as const },
        { type: "testimonials" as const, variant: "grid-cards" as const },
        { type: "serviceArea" as const, variant: "pill-cloud" as const },
        { type: "hoursContact" as const, variant: "card" as const },
        { type: "faq" as const, variant: "accordion" as const },
        { type: "ctaBand" as const, variant: "simple" as const },
      ],
    };

    const parsed = parseBusinessConfig(rawGenerated);
    expect(parsed.name).toBe("Summit Dental Care");
    expect(parsed.services[0]?.slug).toBe("teeth-whitening");
    expect(parsed.theme.brandColor).toBe("#0ea5e9");
  });
});
