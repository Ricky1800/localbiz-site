import type { BusinessConfig } from "@/lib/config";
import { HoursContactCard } from "./HoursContactCard";
import { HoursContactBanner } from "./HoursContactBanner";

export function HoursContactSection({
  config,
  variant = "card",
}: {
  config: BusinessConfig;
  variant?: "card" | "banner";
}) {
  if (variant === "banner") {
    return <HoursContactBanner config={config} />;
  }
  return <HoursContactCard config={config} />;
}
