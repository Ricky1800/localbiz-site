"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type ElementType } from "react";

interface AnimateInProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}

const emptySubscribe = () => () => {};

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => {};
  }
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => {
    mediaQuery.removeEventListener("change", callback);
  };
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * AnimateIn wraps section headings or components with a lightweight,
 * dependency-free entrance transition triggered via IntersectionObserver.
 *
 * Requirements satisfied:
 * 1. Zero external animation dependencies.
 * 2. Pure CSS-based fade/slide transition with progressive enhancement.
 * 3. Graceful fallback when JavaScript is disabled (content is visible by default before mount).
 * 4. Honors `prefers-reduced-motion: reduce` both in CSS and via matchMedia.
 */
export function AnimateIn({
  children,
  as: Component = "div",
  className = "",
}: AnimateInProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [isIntersected, setIsIntersected] = useState(false);
  const hasMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setIsIntersected(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsIntersected(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [prefersReducedMotion]);

  // When not yet mounted (SSR or JS disabled), don't hide the content.
  // When reduced motion is preferred, immediately visible without transition delays.
  const isVisible = prefersReducedMotion || isIntersected;
  const stateClass = !hasMounted
    ? "opacity-100 translate-y-0"
    : isVisible
    ? "opacity-100 translate-y-0 duration-700 ease-out"
    : "opacity-0 translate-y-4";

  return (
    <Component
      ref={ref}
      className={`transition-[opacity,transform] motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${stateClass} ${className}`.trim()}
    >
      {children}
    </Component>
  );
}
