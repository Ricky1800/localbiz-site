import type { Metadata } from "next";
import businessConfig from "@/business.config";
import { formatAddress, mailHref, mapsHref, phoneHref } from "@/lib/format";
import { ContactForm } from "@/components/ContactForm";
import { HoursWidget } from "@/components/HoursWidget";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${businessConfig.name}: ${formatAddress(businessConfig.address)}, ${businessConfig.phone}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-fg sm:text-4xl">Contact us</h1>

      <div className="mt-6">
        <HoursWidget
          hours={businessConfig.hours}
          timezone={businessConfig.timezone}
          dateOverrides={businessConfig.dateOverrides}
        />
      </div>

      <dl className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-semibold uppercase tracking-wide text-fg-muted">Phone</dt>
          <dd className="mt-1">
            <a href={phoneHref(businessConfig.phone)} className="text-lg text-primary hover:underline">
              {businessConfig.phone}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold uppercase tracking-wide text-fg-muted">Email</dt>
          <dd className="mt-1">
            <a href={mailHref(businessConfig.email)} className="text-lg text-primary hover:underline">
              {businessConfig.email}
            </a>
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-sm font-semibold uppercase tracking-wide text-fg-muted">Address</dt>
          <dd className="mt-1">
            <a
              href={mapsHref(businessConfig.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg text-primary hover:underline"
            >
              {formatAddress(businessConfig.address)}
            </a>
          </dd>
        </div>
      </dl>

      {businessConfig.contactFormWebhookUrl ? (
        <div className="mt-12 border-t border-border pt-8">
          <h2 className="font-heading text-xl font-semibold text-fg">Send us a message</h2>
          <div className="mt-4">
            <ContactForm webhookUrl={businessConfig.contactFormWebhookUrl} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
