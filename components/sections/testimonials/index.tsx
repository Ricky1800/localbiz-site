import type { Testimonial } from "@/lib/config";
import { TestimonialsGridCards } from "./TestimonialsGridCards";
import { TestimonialsSpotlight } from "./TestimonialsSpotlight";

export function TestimonialsSection({
  testimonials,
  variant = "grid-cards",
}: {
  testimonials: Testimonial[];
  variant?: "grid-cards" | "spotlight";
}) {
  if (variant === "spotlight") {
    return <TestimonialsSpotlight testimonials={testimonials} />;
  }
  return <TestimonialsGridCards testimonials={testimonials} />;
}
