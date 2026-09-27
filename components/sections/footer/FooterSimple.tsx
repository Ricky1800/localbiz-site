import Link from "next/link";
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

/** The original 3-column footer: identity, contact, links. */
export function FooterSimple({ config }: { config: BusinessConfig }) {
  const year = new Date().getFullYear();
  const socialEntries = Object.entries(config.social).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  );

  return (
    <footer className="border-t border-border bg-surface-2">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div>
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-fg-muted">
            {config.name}
          </h2>
          <p className="mt-2 text-sm text-fg-muted">{config.tagline}</p>
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-fg-muted">
            Contact
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-fg-muted">
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
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-fg-muted">
            Links
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-fg-muted">
            <li>
              <Link href="/contact" className="transition-colors hover:text-primary">
                Contact
              </Link>
            </li>
            {socialEntries.map(([key, url]) => (
              <li key={key}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-primary"
                >
                  {SOCIAL_LABELS[key] ?? key}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-4 py-4 text-center text-xs text-fg-muted sm:px-6">
        © {year} {config.name}. All rights reserved.
      </div>
    </footer>
  );
}
