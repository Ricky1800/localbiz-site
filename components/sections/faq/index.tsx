import type { FaqItem } from "@/lib/config";
import { FaqAccordion } from "./FaqAccordion";
import { FaqTwoColumn } from "./FaqTwoColumn";

export function FaqSection({
  faq,
  variant = "accordion",
}: {
  faq: FaqItem[];
  variant?: "accordion" | "two-column";
}) {
  if (variant === "two-column") {
    return <FaqTwoColumn faq={faq} />;
  }
  return <FaqAccordion faq={faq} />;
}
