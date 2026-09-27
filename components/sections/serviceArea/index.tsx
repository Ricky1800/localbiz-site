import { ServiceAreaPillCloud } from "./ServiceAreaPillCloud";
import { ServiceAreaListColumns } from "./ServiceAreaListColumns";

export function ServiceAreaSection({
  towns,
  variant = "pill-cloud",
}: {
  towns: string[];
  variant?: "pill-cloud" | "list-columns";
}) {
  if (variant === "list-columns") {
    return <ServiceAreaListColumns towns={towns} />;
  }
  return <ServiceAreaPillCloud towns={towns} />;
}
