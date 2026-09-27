import type { BusinessConfig } from "@/lib/config";
import { phoneHref } from "@/lib/format";
import { HoursWidget } from "@/components/HoursWidget";

/** No image, centered text — a calmer, more editorial hero for businesses
 * that would rather lead with words than a photo (or don't have one yet). */
export function HeroCentered({ config }: { config: BusinessConfig }) {
  return (
    <section className="bg-gradient-to-b from-surface-2 to-bg">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <div className="flex justify-center">
          <HoursWidget
            hours={config.hours}
            timezone={config.timezone}
            dateOverrides={config.dateOverrides}
          />
        </div>
        <h1 className="mt-6 font-heading text-4xl font-extrabold tracking-tight text-fg sm:text-6xl">
          {config.name}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-xl text-fg-muted">{config.tagline}</p>
        <p className="mx-auto mt-4 max-w-2xl text-base text-fg-muted">{config.description}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href={phoneHref(config.phone)}
            className="rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:opacity-90"
          >
            Call {config.phone}
          </a>
          {config.bookingUrl ? (
            <a
              href={config.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border-2 border-primary px-6 py-3 text-base font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Book online
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
