import type { Testimonial } from "@/lib/config";

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-hidden="true" className="text-brand-accent">
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="bg-gray-50"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 id="testimonials-heading" className="text-3xl font-bold text-gray-900">
          What our customers say
        </h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <li
              key={`${testimonial.name}-${index}`}
              className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200"
            >
              {typeof testimonial.rating === "number" ? (
                <p className="mb-2">
                  <span className="sr-only">Rated {testimonial.rating} out of 5 stars</span>
                  <Stars rating={testimonial.rating} />
                </p>
              ) : null}
              <p className="text-sm text-gray-700">&ldquo;{testimonial.quote}&rdquo;</p>
              <p className="mt-4 text-sm font-semibold text-gray-900">
                {testimonial.name}
                {testimonial.town ? (
                  <span className="font-normal text-gray-500"> · {testimonial.town}</span>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
