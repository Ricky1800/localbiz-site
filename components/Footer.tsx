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

export function Footer({ config }: { config: BusinessConfig }) {
  const year = new Date().getFullYear();
  const socialEntries = Object.entries(config.social).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  );

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            {config.name}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{config.tagline}</p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Contact
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li>{formatAddress(config.address)}</li>
            <li>
              <a href={phoneHref(config.phone)} className="hover:text-brand-primary">
                {config.phone}
              </a>
            </li>
            <li>
              <a href={mailHref(config.email)} className="hover:text-brand-primary">
                {config.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Links
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li>
              <Link href="/contact" className="hover:text-brand-primary">
                Contact
              </Link>
            </li>
            {socialEntries.map(([key, url]) => (
              <li key={key}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-primary"
                >
                  {SOCIAL_LABELS[key] ?? key}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200 px-4 py-4 text-center text-xs text-gray-500 sm:px-6">
        © {year} {config.name}. All rights reserved.
      </div>
    </footer>
  );
}
