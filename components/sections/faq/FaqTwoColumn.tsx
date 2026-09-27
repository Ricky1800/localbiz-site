import type { FaqItem } from "@/lib/config";

/** Every question/answer shown at once (not collapsed) in a two-column
 * card grid — better for SEO-visible answer text and for shorter FAQ lists
 * where a click-to-expand accordion adds friction for no real benefit. */
export function FaqTwoColumn({ faq }: { faq: FaqItem[] }) {
  if (faq.length === 0) return null;

  return (
    <section id="faq" aria-labelledby="faq-heading" className="section-y mx-auto max-w-5xl px-4 sm:px-6">
      <h2 id="faq-heading" className="font-heading text-3xl font-bold text-fg">
        Frequently asked questions
      </h2>
      <dl className="mt-8 grid gap-6 sm:grid-cols-2">
        {faq.map((item, index) => (
          <div key={index} className="rounded-lg border border-border bg-surface p-6 shadow-sm">
            <dt className="font-heading text-base font-semibold text-fg">{item.question}</dt>
            <dd className="mt-2 text-sm text-fg-muted">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
