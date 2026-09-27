import type { BusinessConfig } from "@/lib/config";
import { phoneHref } from "@/lib/format";
import { HoursWidget } from "./HoursWidget";

export function Hero({ config }: { config: BusinessConfig }) {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="max-w-2xl">
          <HoursWidget
            hours={config.hours}
            timezone={config.timezone}
            dateOverrides={config.dateOverrides}
          />
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            {config.name}
          </h1>
          <p className="mt-4 text-xl text-gray-600">{config.tagline}</p>
          <p className="mt-4 text-base text-gray-600">{config.description}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={phoneHref(config.phone)}
              className="rounded-md bg-brand-primary px-6 py-3 text-base font-semibold text-white shadow-sm hover:opacity-90"
            >
              Call {config.phone}
            </a>
            {config.bookingUrl ? (
              <a
                href={config.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border-2 border-brand-primary px-6 py-3 text-base font-semibold text-brand-primary hover:bg-brand-primary hover:text-white"
              >
                Book online
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
