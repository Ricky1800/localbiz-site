import type { Testimonial } from "@/lib/config";
import { Stars } from "./Stars";
import { AnimateIn } from "@/components/AnimateIn";

/** One large "spotlight" quote (the first testimonial) up top, with the
 * rest in a horizontally scrollable strip below — no client JS: the strip
 * uses native CSS scroll-snap and is keyboard-scrollable. */
export function TestimonialsSpotlight({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;
  const [featured, ...rest] = testimonials;
  if (!featured) return null;

  return (
    <section id="testimonials" aria-labelledby="testimonials-heading" className="bg-surface-2">
      <div className="section-y mx-auto max-w-4xl px-4 sm:px-6">
        <AnimateIn>
          <h2 id="testimonials-heading" className="text-center font-heading text-3xl font-bold text-fg">
            What our customers say
          </h2>
        </AnimateIn>

        <figure className="mt-10 text-center">
          <span aria-hidden="true" className="font-heading text-6xl text-primary/30">
            &ldquo;
          </span>
          <blockquote className="mx-auto max-w-2xl font-heading text-xl font-medium text-fg sm:text-2xl">
            {featured.quote}
          </blockquote>
          <figcaption className="mt-4 text-sm text-fg-muted">
            {typeof featured.rating === "number" ? (
              <p className="mb-1">
                <span className="sr-only">Rated {featured.rating} out of 5 stars</span>
                <Stars rating={featured.rating} />
              </p>
            ) : null}
            <span className="font-semibold text-fg">{featured.name}</span>
            {featured.town ? ` · ${featured.town}` : null}
          </figcaption>
        </figure>

        {rest.length > 0 ? (
          <ul
            tabIndex={0}
            aria-label="More testimonials"
            className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
          >
            {rest.map((testimonial, index) => (
              <li
                key={`${testimonial.name}-${index}`}
                className="w-72 shrink-0 snap-start rounded-lg bg-surface p-5 shadow-sm ring-1 ring-border"
              >
                <p className="text-sm text-fg">&ldquo;{testimonial.quote}&rdquo;</p>
                <p className="mt-3 text-sm font-semibold text-fg">
                  {testimonial.name}
                  {testimonial.town ? (
                    <span className="font-normal text-fg-muted"> · {testimonial.town}</span>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
