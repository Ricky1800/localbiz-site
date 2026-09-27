import type { BusinessConfig } from "@/lib/config";
import { FooterSimple } from "./FooterSimple";
import { FooterColumns } from "./FooterColumns";

export function Footer({
  config,
  variant = "simple",
}: {
  config: BusinessConfig;
  variant?: "simple" | "columns";
}) {
  if (variant === "columns") {
    return <FooterColumns config={config} />;
  }
  return <FooterSimple config={config} />;
}
