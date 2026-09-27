import Link from "next/link";
import type { Service } from "@/lib/config";

/** A numbered list of horizontal rows instead of a card grid — reads more
 * like a menu/price list, which suits businesses with a few, clearly
 * differentiated services (e.g. a salon's service menu). */
export function ServicesListRows({ services }: { services: Service[] }) {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="section-y mx-auto max-w-4xl px-4 sm:px-6"
    >
      <h2 id="services-heading" className="font-heading text-3xl font-bold text-fg">
        Services
      </h2>
      <ol className="mt-8 divide-y divide-border border-y border-border">
        {services.map((service, index) => (
          <li key={service.slug}>
            <Link
              href={`/services/${service.slug}`}
              className="flex items-start gap-4 py-5 transition-colors hover:bg-surface-2 sm:items-center"
            >
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-bold text-primary"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="flex-1">
                <span className="block font-heading text-base font-semibold text-fg">
                  {service.name}
                </span>
                <span className="mt-1 block text-sm text-fg-muted">{service.description}</span>
              </span>
              {typeof service.priceFrom === "number" ? (
                <span className="shrink-0 whitespace-nowrap font-heading text-sm font-semibold text-primary">
                  From ${service.priceFrom}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
