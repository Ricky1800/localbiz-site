import Image from "next/image";
import type { GalleryItem } from "@/lib/config";

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      className="section-y mx-auto max-w-6xl px-4 sm:px-6"
    >
      <div className="text-center">
        <h2 id="gallery-heading" className="font-heading text-3xl font-bold text-fg">
          Our Work
        </h2>
        <p className="mt-2 text-base text-fg-muted">
          A glimpse into our completed projects and daily craftsmanship.
        </p>
      </div>

      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, idx) => (
          <li
            key={`${item.src}-${idx}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-surface-2 shadow-sm transition hover:shadow-md"
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
