export function ServiceArea({ towns }: { towns: string[] }) {
  return (
    <section id="service-area" aria-labelledby="service-area-heading" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 id="service-area-heading" className="text-3xl font-bold text-gray-900">
        Proudly serving
      </h2>
      <ul className="mt-6 flex flex-wrap gap-3">
        {towns.map((town) => (
          <li
            key={town}
            className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700"
          >
            {town}
          </li>
        ))}
      </ul>
    </section>
  );
}
