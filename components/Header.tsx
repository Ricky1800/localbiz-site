import Link from "next/link";
import Image from "next/image";
import type { BusinessConfig } from "@/lib/config";
import { phoneHref } from "@/lib/format";
import { MobileNav, type NavLink } from "./MobileNav";

export function Header({ config }: { config: BusinessConfig }) {
  const navLinks: NavLink[] = [
    { href: "/#services", label: "Services" },
    { href: "/#service-area", label: "Service Area" },
    { href: "/#faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="relative border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={config.logoPath}
            alt={`${config.name} logo`}
            width={40}
            height={40}
            priority
          />
          <span className="text-lg font-bold text-gray-900">{config.name}</span>
        </Link>

        <nav aria-label="Primary" className="hidden sm:block">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-gray-700 hover:text-brand-primary"
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
            className="rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Call {config.phone}
          </a>
        </div>

        <MobileNav links={navLinks} />
      </div>
    </header>
  );
}
