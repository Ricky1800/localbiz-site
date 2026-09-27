"use client";

import { useId, useState } from "react";

type SubmitState = "idle" | "submitting" | "success" | "error";

/**
 * A progressively-enhanced contact form that POSTs JSON to a configurable
 * webhook (e.g. a Zapier/Make/Formspree endpoint). There is no backend in
 * this project — the parent page only renders this component when
 * `business.config.ts` sets `contactFormWebhookUrl`; otherwise contact is
 * phone/email only.
 */
export function ContactForm({ webhookUrl }: { webhookUrl: string }) {
  const [state, setState] = useState<SubmitState>("idle");
  const formId = useId();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`Webhook responded with ${response.status}`);
      setState("success");
      form.reset();
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <p role="status" className="rounded-md bg-success/10 p-4 text-success">
        Thanks — your message has been sent. We&apos;ll get back to you soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor={`${formId}-name`} className="block text-sm font-medium text-fg">
          Name
        </label>
        <input
          id={`${formId}-name`}
          name="name"
          type="text"
          required
          className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-fg shadow-sm transition-colors focus:border-primary"
        />
      </div>

      <div>
        <label htmlFor={`${formId}-email`} className="block text-sm font-medium text-fg">
          Email
        </label>
        <input
          id={`${formId}-email`}
          name="email"
          type="email"
          required
          className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-fg shadow-sm transition-colors focus:border-primary"
        />
      </div>

      <div>
        <label htmlFor={`${formId}-phone`} className="block text-sm font-medium text-fg">
          Phone (optional)
        </label>
        <input
          id={`${formId}-phone`}
          name="phone"
          type="tel"
          className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-fg shadow-sm transition-colors focus:border-primary"
        />
      </div>

      <div>
        <label htmlFor={`${formId}-message`} className="block text-sm font-medium text-fg">
          Message
        </label>
        <textarea
          id={`${formId}-message`}
          name="message"
          rows={4}
          required
          className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-fg shadow-sm transition-colors focus:border-primary"
        />
      </div>

      {state === "error" ? (
        <p role="alert" className="text-sm text-danger">
          Something went wrong sending your message. Please try again, or call us directly.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:opacity-90 disabled:opacity-60"
      >
        {state === "submitting" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
