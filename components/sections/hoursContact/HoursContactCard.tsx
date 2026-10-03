import type { BusinessConfig } from "@/lib/config";
import { formatAddress, formatTimeOfDay, mailHref, mapsHref, phoneHref } from "@/lib/format";
import { HoursWidget } from "@/components/HoursWidget";
import { AnimateIn } from "@/components/AnimateIn";

const DAY_LABELS: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};
const DISPLAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

/** A two-column card: full weekly hours table on the left, contact details
 * on the right — the "everything you need to visit us" reference block. */
export function HoursContactCard({ config }: { config: BusinessConfig }) {
  return (
    <section
      id="hours-contact"
      aria-labelledby="hours-contact-heading"
      className="section-y mx-auto max-w-5xl px-4 sm:px-6"
    >
      <AnimateIn>
        <h2 id="hours-contact-heading" className="font-heading text-3xl font-bold text-fg">
          Hours &amp; contact
        </h2>
      </AnimateIn>

      <div className="mt-8 grid gap-8 rounded-xl border border-border bg-surface p-8 shadow-sm sm:grid-cols-2">
        <div>
          <HoursWidget
            hours={config.hours}
            timezone={config.timezone}
            dateOverrides={config.dateOverrides}
          />
          <dl className="mt-4 divide-y divide-border text-sm">
            {DISPLAY_ORDER.map((day) => {
              const schedule = config.hours[day];
              return (
                <div key={day} className="flex justify-between py-2">
                  <dt className="text-fg-muted">{DAY_LABELS[day]}</dt>
                  <dd className="font-medium text-fg">
                    {schedule.closed
                      ? "Closed"
                      : schedule.ranges
                          .map((r) => `${formatTimeOfDay(r.open)}–${formatTimeOfDay(r.close)}`)
                          .join(", ")}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-fg-muted">
            Get in touch
          </h3>
          <ul className="mt-3 space-y-3 text-base">
            <li>
              <a href={phoneHref(config.phone)} className="font-semibold text-primary hover:underline">
                {config.phone}
              </a>
            </li>
            <li>
              <a href={mailHref(config.email)} className="text-fg hover:text-primary">
                {config.email}
              </a>
            </li>
            <li>
              <a
                href={mapsHref(config.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-fg hover:text-primary"
              >
                {formatAddress(config.address)}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
