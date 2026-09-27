export function ServiceAreaPillCloud({ towns }: { towns: string[] }) {
  return (
    <section
      id="service-area"
      aria-labelledby="service-area-heading"
      className="section-y mx-auto max-w-6xl px-4 sm:px-6"
    >
      <h2 id="service-area-heading" className="font-heading text-3xl font-bold text-fg">
        Proudly serving
      </h2>
      <ul className="mt-6 flex flex-wrap gap-3">
        {towns.map((town) => (
          <li
            key={town}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-fg-muted"
          >
            {town}
          </li>
        ))}
      </ul>
    </section>
  );
}
