import type { FaqItem } from "@/lib/config";

/** A zero-JavaScript accordion built on native `<details>`/`<summary>` — fully
 * keyboard operable and works before hydration, with no client component
 * needed. */
export function FaqAccordion({ faq }: { faq: FaqItem[] }) {
  if (faq.length === 0) return null;

  return (
    <section id="faq" aria-labelledby="faq-heading" className="section-y mx-auto max-w-3xl px-4 sm:px-6">
      <h2 id="faq-heading" className="font-heading text-3xl font-bold text-fg">
        Frequently asked questions
      </h2>
      <div className="mt-8 divide-y divide-border border-t border-border">
        {faq.map((item, index) => (
          <details key={index} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between text-left text-base font-semibold text-fg">
              {item.question}
              <span aria-hidden="true" className="ml-4 text-fg-muted transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-fg-muted">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
