import type { BusinessConfig } from "@/lib/config";
import { mailHref, phoneHref } from "@/lib/format";
import { HoursWidget } from "@/components/HoursWidget";

/** A compact single-row banner — open/closed status plus click-to-call and
 * email, no full hours table. Good for a slim, low-commitment placement
 * (e.g. directly under the header) rather than a full dedicated block. */
export function HoursContactBanner({ config }: { config: BusinessConfig }) {
  return (
    <section
      id="hours-contact"
      aria-label="Hours and contact"
      className="border-y border-border bg-surface-2"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <HoursWidget
          hours={config.hours}
          timezone={config.timezone}
          dateOverrides={config.dateOverrides}
        />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <a href={phoneHref(config.phone)} className="font-semibold text-primary hover:underline">
            {config.phone}
          </a>
          <a href={mailHref(config.email)} className="text-fg-muted hover:text-primary">
            {config.email}
          </a>
        </div>
      </div>
    </section>
  );
}
