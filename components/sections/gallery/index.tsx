import type { GalleryItem } from "@/lib/config";
import { GalleryGrid } from "./GalleryGrid";

export function GallerySection({
  gallery,
}: {
  gallery?: GalleryItem[];
  variant?: "grid";
}) {
  if (!gallery || gallery.length === 0) {
    return null;
  }
  return <GalleryGrid items={gallery} />;
}
