import Link from "next/link";
import type { Service } from "@/lib/config";

/** A responsive card grid — one card per service, each linking to its own
 * statically-generated `/services/[slug]` page. */
export function ServicesGridCards({ services }: { services: Service[] }) {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="section-y mx-auto max-w-6xl px-4 sm:px-6"
    >
      <h2 id="services-heading" className="font-heading text-3xl font-bold text-fg">
        Services
      </h2>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <li key={service.slug}>
            <Link
              href={`/services/${service.slug}`}
              className="block h-full rounded-lg border border-border bg-surface p-6 shadow-sm transition hover:border-primary hover:shadow-md motion-reduce:transition-none"
            >
              <h3 className="font-heading text-lg font-semibold text-fg">{service.name}</h3>
              <p className="mt-2 text-sm text-fg-muted">{service.description}</p>
              {typeof service.priceFrom === "number" ? (
                <p className="mt-3 text-sm font-medium text-primary">From ${service.priceFrom}</p>
              ) : null}
              <span className="mt-4 inline-block text-sm font-semibold text-primary">
                Learn more →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
