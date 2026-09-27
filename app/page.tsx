import type { Metadata } from "next";
import businessConfig from "@/business.config";
import { buildFaqJsonLd } from "@/lib/schema-org";
import { JsonLd } from "@/components/JsonLd";
import { RenderSection } from "@/components/sections";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const faqJsonLd = buildFaqJsonLd(businessConfig.faq);

  return (
    <>
      {faqJsonLd ? <JsonLd data={faqJsonLd} /> : null}
      {businessConfig.sections.map((entry) => (
        <RenderSection key={entry.type} entry={entry} config={businessConfig} />
      ))}
    </>
  );
}
