import type { BusinessConfig } from "@/lib/config";
import type { NavLink } from "@/components/MobileNav";
import { HeaderStandard } from "./HeaderStandard";
import { HeaderCentered } from "./HeaderCentered";

export function Header({
  config,
  variant = "standard",
}: {
  config: BusinessConfig;
  variant?: "standard" | "centered";
}) {
  const navLinks: NavLink[] = [
    { href: "/#services", label: "Services" },
    { href: "/#service-area", label: "Service Area" },
    { href: "/#faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
  ];

  if (variant === "centered") {
    return <HeaderCentered config={config} navLinks={navLinks} />;
  }
  return <HeaderStandard config={config} navLinks={navLinks} />;
}
