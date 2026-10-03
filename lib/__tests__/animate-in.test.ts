import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

describe("AnimateIn component integration & reduced-motion adherence", () => {
  it("exists and exports AnimateIn", () => {
    const filePath = join(__dirname, "../../components/AnimateIn.tsx");
    expect(existsSync(filePath)).toBe(true);

    const content = readFileSync(filePath, "utf-8");
    expect(content).toContain("export function AnimateIn");
  });

  it("includes motion-reduce Tailwind classes to strictly disable transitions", () => {
    const filePath = join(__dirname, "../../components/AnimateIn.tsx");
    const content = readFileSync(filePath, "utf-8");

    expect(content).toContain("motion-reduce:transition-none");
    expect(content).toContain("motion-reduce:opacity-100");
    expect(content).toContain("motion-reduce:translate-y-0");
  });

  it("checks matchMedia for prefers-reduced-motion to reveal content immediately", () => {
    const filePath = join(__dirname, "../../components/AnimateIn.tsx");
    const content = readFileSync(filePath, "utf-8");

    expect(content).toContain("(prefers-reduced-motion: reduce)");
    expect(content).toContain("IntersectionObserver");
  });

  it("defaults to visible content when unmounted (SSR / no-JS resilient)", () => {
    const filePath = join(__dirname, "../../components/AnimateIn.tsx");
    const content = readFileSync(filePath, "utf-8");

    expect(content).toContain("opacity-100 translate-y-0");
    expect(content).toContain("useSyncExternalStore");
  });
});
