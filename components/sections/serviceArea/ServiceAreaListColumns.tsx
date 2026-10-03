import { AnimateIn } from "@/components/AnimateIn";

/** A multi-column list with a location-pin icon per town, inside a card —
 * reads more like a structured "coverage area" reference than a tag cloud. */
export function ServiceAreaListColumns({ towns }: { towns: string[] }) {
  return (
    <section
      id="service-area"
      aria-labelledby="service-area-heading"
      className="section-y mx-auto max-w-5xl px-4 sm:px-6"
    >
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <AnimateIn>
          <h2 id="service-area-heading" className="font-heading text-3xl font-bold text-fg">
            Proudly serving
          </h2>
        </AnimateIn>
        <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
          {towns.map((town) => (
            <li key={town} className="flex items-center gap-2 text-sm text-fg-muted">
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="h-4 w-4 shrink-0 text-primary"
                fill="currentColor"
              >
                <path d="M10 1.5c-3.176 0-5.75 2.574-5.75 5.75 0 4.243 5.75 11.25 5.75 11.25s5.75-7.007 5.75-11.25c0-3.176-2.574-5.75-5.75-5.75Zm0 8a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5Z" />
              </svg>
              {town}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
