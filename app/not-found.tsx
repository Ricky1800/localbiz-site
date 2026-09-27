import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-4 text-base text-gray-600">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-md bg-brand-primary px-6 py-3 text-base font-semibold text-white hover:opacity-90"
      >
        Back to home
      </Link>
    </section>
  );
}
