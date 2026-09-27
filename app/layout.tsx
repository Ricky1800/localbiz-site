import type { Metadata } from "next";
import type { CSSProperties } from "react";
import businessConfig from "@/business.config";
import { buildLocalBusinessJsonLd } from "@/lib/schema-org";
import { JsonLd } from "@/components/JsonLd";
import { SkipLink } from "@/components/SkipLink";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(businessConfig.siteUrl),
  title: {
    default: `${businessConfig.name} | ${businessConfig.tagline}`,
    template: `%s | ${businessConfig.name}`,
  },
  description: businessConfig.description,
  openGraph: {
    type: "website",
    url: businessConfig.siteUrl,
    siteName: businessConfig.name,
    title: businessConfig.name,
    description: businessConfig.description,
    images: [{ url: businessConfig.logoPath }],
  },
  twitter: {
    card: "summary",
    title: businessConfig.name,
    description: businessConfig.description,
    images: [businessConfig.logoPath],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const brandStyle = {
    "--brand-primary": businessConfig.brandColors.primary,
    ...(businessConfig.brandColors.secondary
      ? { "--brand-secondary": businessConfig.brandColors.secondary }
      : {}),
    ...(businessConfig.brandColors.accent
      ? { "--brand-accent": businessConfig.brandColors.accent }
      : {}),
  } as CSSProperties;

  return (
    <html lang="en" style={brandStyle}>
      <body>
        <JsonLd data={buildLocalBusinessJsonLd(businessConfig)} />
        <SkipLink />
        <Header config={businessConfig} />
        <main id="main-content">{children}</main>
        <Footer config={businessConfig} />
      </body>
    </html>
  );
}
