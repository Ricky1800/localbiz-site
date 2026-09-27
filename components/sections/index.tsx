import type { BusinessConfig } from "@/lib/config";
import type { SectionEntry } from "@/lib/sections/schema";
import { Hero } from "./hero";
import { ServicesSection } from "./services";
import { TestimonialsSection } from "./testimonials";
import { ServiceAreaSection } from "./serviceArea";
import { HoursContactSection } from "./hoursContact";
import { CtaBandSection } from "./ctaBand";
import { FaqSection } from "./faq";

export { Header } from "./header";
export { Footer } from "./footer";

/**
 * Renders one configured homepage section. This is the single place that
 * maps a `business.config.ts` `sections[]` entry to its component tree —
 * both `app/page.tsx` and the `/design` live preview panel go through this
 * so they can never drift apart.
 */
export function RenderSection({
  entry,
  config,
}: {
  entry: SectionEntry;
  config: BusinessConfig;
}) {
  switch (entry.type) {
    case "hero":
      return <Hero config={config} variant={entry.variant} imageUrl={config.images.hero} />;
    case "services":
      return <ServicesSection services={config.services} variant={entry.variant} />;
    case "testimonials":
      return <TestimonialsSection testimonials={config.testimonials} variant={entry.variant} />;
    case "serviceArea":
      return <ServiceAreaSection towns={config.serviceAreas} variant={entry.variant} />;
    case "hoursContact":
      return <HoursContactSection config={config} variant={entry.variant} />;
    case "ctaBand":
      return <CtaBandSection config={config} variant={entry.variant} />;
    case "faq":
      return <FaqSection faq={config.faq} variant={entry.variant} />;
    default: {
      const exhaustiveCheck: never = entry;
      return exhaustiveCheck;
    }
  }
}
