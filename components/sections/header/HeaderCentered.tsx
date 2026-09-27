import Link from "next/link";
import Image from "next/image";
import type { BusinessConfig } from "@/lib/config";
import { phoneHref } from "@/lib/format";
import { MobileNav, type NavLink } from "@/components/MobileNav";

/** Logo + name centered on its own row, with nav and the call CTA sharing a
 * second row underneath — a calmer, more boutique/editorial feel than the
 * standard three-column header. */
export function HeaderCentered({
  config,
  navLinks,
}: {
  config: BusinessConfig;
  navLinks: NavLink[];
}) {
  return (
    <header className="relative border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 pt-3 sm:hidden">
        <Link href="/" className="flex items-center gap-2">
          <Image src={config.logoPath} alt={`${config.name} logo`} width={32} height={32} priority />
          <span className="font-heading text-base font-bold text-fg">{config.name}</span>
        </Link>
        <MobileNav links={navLinks} />
      </div>

      <div className="mx-auto hidden max-w-6xl flex-col items-center gap-3 px-4 py-5 sm:flex sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image src={config.logoPath} alt={`${config.name} logo`} width={44} height={44} priority />
          <span className="font-heading text-xl font-bold text-fg">{config.name}</span>
        </Link>

        <div className="flex w-full items-center justify-center gap-8">
          <nav aria-label="Primary">
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
          <a
            href={phoneHref(config.phone)}
            className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            Call {config.phone}
          </a>
        </div>
      </div>
    </header>
  );
}
