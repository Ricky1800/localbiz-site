import type { BusinessConfig } from "@/lib/config";
import { HeroSplitImage } from "./HeroSplitImage";
import { HeroCentered } from "./HeroCentered";

export function Hero({
  config,
  variant = "split-image",
  imageUrl,
}: {
  config: BusinessConfig;
  variant?: "split-image" | "centered";
  imageUrl?: string;
}) {
  if (variant === "centered") {
    return <HeroCentered config={config} />;
  }
  return <HeroSplitImage config={config} imageUrl={imageUrl} />;
}
