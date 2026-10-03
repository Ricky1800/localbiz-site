import type { Testimonial } from "@/lib/config";
import { Stars } from "./Stars";
import { AnimateIn } from "@/components/AnimateIn";

export function TestimonialsGridCards({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" aria-labelledby="testimonials-heading" className="bg-surface-2">
      <div className="section-y mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateIn>
          <h2 id="testimonials-heading" className="font-heading text-3xl font-bold text-fg">
            What our customers say
          </h2>
        </AnimateIn>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <li
              key={`${testimonial.name}-${index}`}
              className="rounded-lg bg-surface p-6 shadow-sm ring-1 ring-border"
            >
              {typeof testimonial.rating === "number" ? (
                <p className="mb-2">
                  <span className="sr-only">Rated {testimonial.rating} out of 5 stars</span>
                  <Stars rating={testimonial.rating} />
                </p>
              ) : null}
              <p className="text-sm text-fg">&ldquo;{testimonial.quote}&rdquo;</p>
              <p className="mt-4 text-sm font-semibold text-fg">
                {testimonial.name}
                {testimonial.town ? (
                  <span className="font-normal text-fg-muted"> · {testimonial.town}</span>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
