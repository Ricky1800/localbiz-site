/**
 * Renders a single `<script type="application/ld+json">` tag. Server
 * component — the JSON is fully known at render time, no client JS needed.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
