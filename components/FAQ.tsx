import type { FaqItem } from "@/lib/config";

/**
 * A zero-JavaScript accordion built on native `<details>`/`<summary>` — fully
 * keyboard operable and works before hydration, with no client component
 * needed.
 */
export function FAQ({ faq }: { faq: FaqItem[] }) {
  if (faq.length === 0) return null;

  return (
    <section id="faq" aria-labelledby="faq-heading" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h2 id="faq-heading" className="text-3xl font-bold text-gray-900">
        Frequently asked questions
      </h2>
      <div className="mt-8 divide-y divide-gray-200 border-t border-gray-200">
        {faq.map((item, index) => (
          <details key={index} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between text-left text-base font-semibold text-gray-900">
              {item.question}
              <span aria-hidden="true" className="ml-4 text-gray-400 group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-gray-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
