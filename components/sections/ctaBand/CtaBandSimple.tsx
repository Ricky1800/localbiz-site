import Link from "next/link";
import type { BusinessConfig } from "@/lib/config";
import { formatAddress, mapsHref, phoneHref } from "@/lib/format";

/** A quiet, tinted band matching the page background family — the original
 * homepage closing section. */
export function CtaBandSimple({ config }: { config: BusinessConfig }) {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="bg-primary/5">
      <div className="section-y mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 id="contact-heading" className="font-heading text-3xl font-bold text-fg">
          Get in touch
        </h2>
        <p className="mt-4 text-base text-fg-muted">{formatAddress(config.address)}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href={phoneHref(config.phone)}
            className="rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:opacity-90"
          >
            Call {config.phone}
          </a>
          <a
            href={mapsHref(config.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border-2 border-border px-6 py-3 text-base font-semibold text-fg-muted transition-colors hover:border-primary hover:text-primary"
          >
            Get directions
          </a>
          <Link
            href="/contact"
            className="rounded-md border-2 border-border px-6 py-3 text-base font-semibold text-fg-muted transition-colors hover:border-primary hover:text-primary"
          >
            Contact page
          </Link>
        </div>
      </div>
    </section>
  );
}
