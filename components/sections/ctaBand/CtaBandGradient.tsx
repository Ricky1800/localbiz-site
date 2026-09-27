import Link from "next/link";
import type { BusinessConfig } from "@/lib/config";
import { formatAddress, mapsHref, phoneHref } from "@/lib/format";

/** A bold, full-bleed gradient band in the brand color — a higher-contrast,
 * more assertive closing CTA for businesses that want the last thing a
 * visitor sees to be a strong call to action rather than a quiet aside. */
export function CtaBandGradient({ config }: { config: BusinessConfig }) {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="bg-gradient-to-br from-primary to-secondary"
    >
      <div className="section-y mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 id="contact-heading" className="font-heading text-3xl font-bold text-primary-foreground">
          Ready when you are
        </h2>
        <p className="mt-4 text-base text-primary-foreground/85">
          {formatAddress(config.address)}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href={phoneHref(config.phone)}
            className="rounded-md bg-surface px-6 py-3 text-base font-semibold text-primary shadow-sm transition-colors hover:opacity-90"
          >
            Call {config.phone}
          </a>
          <a
            href={mapsHref(config.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border-2 border-primary-foreground/50 px-6 py-3 text-base font-semibold text-primary-foreground transition-colors hover:border-primary-foreground"
          >
            Get directions
          </a>
          <Link
            href="/contact"
            className="rounded-md border-2 border-primary-foreground/50 px-6 py-3 text-base font-semibold text-primary-foreground transition-colors hover:border-primary-foreground"
          >
            Contact page
          </Link>
        </div>
      </div>
    </section>
  );
}
