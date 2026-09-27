import type { Service } from "@/lib/config";
import { ServicesGridCards } from "./ServicesGridCards";
import { ServicesListRows } from "./ServicesListRows";

export function ServicesSection({
  services,
  variant = "grid-cards",
}: {
  services: Service[];
  variant?: "grid-cards" | "list-rows";
}) {
  if (variant === "list-rows") {
    return <ServicesListRows services={services} />;
  }
  return <ServicesGridCards services={services} />;
}
