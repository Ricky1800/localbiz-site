import Link from "next/link";
import type { Service } from "@/lib/config";

export function ServicesGrid({ services }: { services: Service[] }) {
  return (
    <section id="services" aria-labelledby="services-heading" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 id="services-heading" className="text-3xl font-bold text-gray-900">
        Services
      </h2>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <li key={service.slug}>
            <Link
              href={`/services/${service.slug}`}
              className="block h-full rounded-lg border border-gray-200 p-6 shadow-sm transition hover:border-brand-primary hover:shadow-md motion-reduce:transition-none"
            >
              <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
              <p className="mt-2 text-sm text-gray-600">{service.description}</p>
              {typeof service.priceFrom === "number" ? (
                <p className="mt-3 text-sm font-medium text-brand-primary">
                  From ${service.priceFrom}
                </p>
              ) : null}
              <span className="mt-4 inline-block text-sm font-semibold text-brand-primary">
                Learn more →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
