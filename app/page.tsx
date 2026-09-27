import type { Metadata } from "next";
import businessConfig from "@/business.config";
import { buildFaqJsonLd } from "@/lib/schema-org";
import { JsonLd } from "@/components/JsonLd";
import { Hero } from "@/components/Hero";
import { ServicesGrid } from "@/components/ServicesGrid";
import { Testimonials } from "@/components/Testimonials";
import { ServiceArea } from "@/components/ServiceArea";
import { FAQ } from "@/components/FAQ";
import { ContactCta } from "@/components/ContactCta";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const faqJsonLd = buildFaqJsonLd(businessConfig.faq);

  return (
    <>
      {faqJsonLd ? <JsonLd data={faqJsonLd} /> : null}
      <Hero config={businessConfig} />
      <ServicesGrid services={businessConfig.services} />
      <Testimonials testimonials={businessConfig.testimonials} />
      <ServiceArea towns={businessConfig.serviceAreas} />
      <FAQ faq={businessConfig.faq} />
      <ContactCta config={businessConfig} />
    </>
  );
}
