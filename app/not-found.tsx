import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-fg">Page not found</h1>
      <p className="mt-4 text-base text-fg-muted">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-colors hover:opacity-90"
      >
        Back to home
      </Link>
    </section>
  );
}
