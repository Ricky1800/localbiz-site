import type { Metadata } from "next";
import type { CSSProperties } from "react";
import businessConfig from "@/business.config";
import { buildLocalBusinessJsonLd } from "@/lib/schema-org";
import { JsonLd } from "@/components/JsonLd";
import { SkipLink } from "@/components/SkipLink";
import { Header, Footer } from "@/components/sections";
import { allFontVariableClassNames } from "@/lib/theme/fonts";
import { resolveTheme, themeToCssVariables } from "@/lib/theme/tokens";
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
  const resolvedTheme = resolveTheme(businessConfig.theme);
  const themeStyle = themeToCssVariables(resolvedTheme) as CSSProperties;

  return (
    <html lang="en" style={themeStyle} className={allFontVariableClassNames()}>
      <body>
        <JsonLd data={buildLocalBusinessJsonLd(businessConfig)} />
        <SkipLink />
        <Header config={businessConfig} variant={businessConfig.layout.header.variant} />
        <main id="main-content">{children}</main>
        <Footer config={businessConfig} variant={businessConfig.layout.footer.variant} />
      </body>
    </html>
  );
}
