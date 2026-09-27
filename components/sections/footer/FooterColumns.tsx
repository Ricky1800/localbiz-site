import Link from "next/link";
import Image from "next/image";
import type { BusinessConfig } from "@/lib/config";
import { formatAddress, mailHref, phoneHref } from "@/lib/format";

const SOCIAL_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  google: "Google",
  yelp: "Yelp",
  x: "X",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
};

/** A wider, 4-column footer that also surfaces the services list and a
 * compact weekly-hours table — more information-dense, good for
 * multi-service businesses. */
export function FooterColumns({ config }: { config: BusinessConfig }) {
  const year = new Date().getFullYear();
  const socialEntries = Object.entries(config.social).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  );
  const dayLabels: Record<string, string> = {
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",
    sun: "Sun",
  };
  const displayOrder = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

  return (
    <footer className="border-t border-border bg-surface-2">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <Image src={config.logoPath} alt={`${config.name} logo`} width={32} height={32} />
            <span className="font-heading text-base font-bold text-fg">{config.name}</span>
          </div>
          <p className="mt-3 text-sm text-fg-muted">{config.tagline}</p>
          {socialEntries.length > 0 ? (
            <ul className="mt-4 flex gap-3 text-sm">
              {socialEntries.map(([key, url]) => (
                <li key={key}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fg-muted transition-colors hover:text-primary"
                  >
                    {SOCIAL_LABELS[key] ?? key}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-fg-muted">
            Services
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {config.services.slice(0, 6).map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  className="text-fg-muted transition-colors hover:text-primary"
                >
                  {service.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-fg-muted">
            Contact
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm text-fg-muted">
            <li>{formatAddress(config.address)}</li>
            <li>
              <a href={phoneHref(config.phone)} className="transition-colors hover:text-primary">
                {config.phone}
              </a>
            </li>
            <li>
              <a href={mailHref(config.email)} className="transition-colors hover:text-primary">
                {config.email}
              </a>
            </li>
            <li>
              <Link href="/contact" className="transition-colors hover:text-primary">
                Contact page →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-fg-muted">
            Hours
          </h2>
          <dl className="mt-3 space-y-1 text-sm text-fg-muted">
            {displayOrder.map((day) => {
              const schedule = config.hours[day];
              return (
                <div key={day} className="flex justify-between gap-4">
                  <dt>{dayLabels[day]}</dt>
                  <dd>
                    {schedule.closed
                      ? "Closed"
                      : schedule.ranges.map((r) => `${r.open}–${r.close}`).join(", ")}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>

      <div className="border-t border-border px-4 py-4 text-center text-xs text-fg-muted sm:px-6">
        © {year} {config.name}. All rights reserved.
      </div>
    </footer>
  );
}
