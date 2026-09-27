import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import businessConfig from "@/business.config";
import { buildServiceJsonLd } from "@/lib/schema-org";
import { JsonLd } from "@/components/JsonLd";
import { phoneHref } from "@/lib/format";

export function generateStaticParams() {
  return businessConfig.services.map((service) => ({ slug: service.slug }));
}

function findService(slug: string) {
  return businessConfig.services.find((service) => service.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = findService(slug);
  if (!service) return {};

  return {
    title: service.name,
    description: service.description,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: `${service.name} | ${businessConfig.name}`,
      description: service.description,
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = findService(slug);
  if (!service) notFound();

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <JsonLd data={buildServiceJsonLd(businessConfig, service)} />

      <p className="text-sm">
        <Link href="/#services" className="text-primary hover:underline">
          ← All services
        </Link>
      </p>

      <h1 className="mt-4 font-heading text-3xl font-bold text-fg sm:text-4xl">{service.name}</h1>
      <p className="mt-4 text-base text-fg-muted">{service.description}</p>

      {typeof service.priceFrom === "number" ? (
        <p className="mt-4 text-lg font-semibold text-primary">
          Starting at ${service.priceFrom}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-4">
        <a
          href={phoneHref(businessConfig.phone)}
          className="rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:opacity-90"
        >
          Call {businessConfig.phone}
        </a>
        {businessConfig.bookingUrl ? (
          <a
            href={businessConfig.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border-2 border-primary px-6 py-3 text-base font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Book online
          </a>
        ) : null}
      </div>

      <div className="mt-12 border-t border-border pt-8">
        <h2 className="font-heading text-lg font-semibold text-fg">Also serving</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {businessConfig.serviceAreas.map((town) => (
            <li
              key={town}
              className="rounded-full border border-border px-3 py-1 text-xs font-medium text-fg-muted"
            >
              {town}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
