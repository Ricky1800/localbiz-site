import Image from "next/image";
import type { BusinessConfig } from "@/lib/config";
import { phoneHref } from "@/lib/format";
import { HoursWidget } from "@/components/HoursWidget";

/** Text + CTAs on the left, a photo (or a tasteful token-driven gradient
 * placeholder when no image is configured) on the right. The highest-
 * converting, most common local-business hero layout. */
export function HeroSplitImage({
  config,
  imageUrl,
}: {
  config: BusinessConfig;
  imageUrl?: string;
}) {
  return (
    <section className="bg-surface-2">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-16">
        <div>
          <HoursWidget
            hours={config.hours}
            timezone={config.timezone}
            dateOverrides={config.dateOverrides}
          />
          <h1 className="mt-6 font-heading text-4xl font-extrabold tracking-tight text-fg sm:text-5xl">
            {config.name}
          </h1>
          <p className="mt-4 text-xl text-fg-muted">{config.tagline}</p>
          <p className="mt-4 text-base text-fg-muted">{config.description}</p>

          <div className="mt-8 flex flex-wrap gap-4">
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

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-lg lg:aspect-square">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${config.name} — ${config.tagline}`}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary to-secondary"
            >
              <svg
                viewBox="0 0 200 200"
                className="h-2/3 w-2/3 text-primary-foreground/25"
                fill="currentColor"
              >
                <circle cx="100" cy="100" r="90" />
              </svg>
              <span className="absolute font-heading text-2xl font-bold text-primary-foreground">
                {config.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
