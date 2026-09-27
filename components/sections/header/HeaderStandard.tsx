import Link from "next/link";
import Image from "next/image";
import type { BusinessConfig } from "@/lib/config";
import { phoneHref } from "@/lib/format";
import { MobileNav, type NavLink } from "@/components/MobileNav";

/** Logo + name at left, nav centered, phone CTA at right — the classic,
 * highest-recognition header layout. */
export function HeaderStandard({
  config,
  navLinks,
}: {
  config: BusinessConfig;
  navLinks: NavLink[];
}) {
  return (
    <header className="relative border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image src={config.logoPath} alt={`${config.name} logo`} width={40} height={40} priority />
          <span className="font-heading text-lg font-bold text-fg">{config.name}</span>
        </Link>

        <nav aria-label="Primary" className="hidden sm:block">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-fg-muted transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <a
            href={phoneHref(config.phone)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            Call {config.phone}
          </a>
        </div>

        <MobileNav links={navLinks} />
      </div>
    </header>
  );
}
