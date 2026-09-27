import Link from "next/link";
import type { BusinessConfig } from "@/lib/config";
import { formatAddress, mapsHref, phoneHref } from "@/lib/format";

/** Homepage closing section: a compact contact summary + link to the full
 * `/contact` page (which includes the optional form). */
export function ContactCta({ config }: { config: BusinessConfig }) {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="bg-brand-primary/5">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h2 id="contact-heading" className="text-3xl font-bold text-gray-900">
          Get in touch
        </h2>
        <p className="mt-4 text-base text-gray-600">
          {formatAddress(config.address)}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href={phoneHref(config.phone)}
            className="rounded-md bg-brand-primary px-6 py-3 text-base font-semibold text-white shadow-sm hover:opacity-90"
          >
            Call {config.phone}
          </a>
          <a
            href={mapsHref(config.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border-2 border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 hover:border-brand-primary hover:text-brand-primary"
          >
            Get directions
          </a>
          <Link
            href="/contact"
            className="rounded-md border-2 border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 hover:border-brand-primary hover:text-brand-primary"
          >
            Contact page
          </Link>
        </div>
      </div>
    </section>
  );
}
