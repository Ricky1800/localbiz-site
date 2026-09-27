import type { BusinessConfig } from "@/lib/config";
import { CtaBandSimple } from "./CtaBandSimple";
import { CtaBandGradient } from "./CtaBandGradient";

export function CtaBandSection({
  config,
  variant = "simple",
}: {
  config: BusinessConfig;
  variant?: "simple" | "gradient";
}) {
  if (variant === "gradient") {
    return <CtaBandGradient config={config} />;
  }
  return <CtaBandSimple config={config} />;
}
