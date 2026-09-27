"use client";

import { useEffect, useState } from "react";
import { getOpenNowStatus, type DateOverride, type WeeklyHours } from "@/lib/hours";

const REFRESH_INTERVAL_MS = 30_000;

export function HoursWidget({
  hours,
  timezone,
  dateOverrides,
}: {
  hours: WeeklyHours;
  timezone: string;
  dateOverrides: DateOverride[];
}) {
  // Computed on every render (including the first server render) from
  // `Date.now()`, so there is no server/client mismatch to hydrate around —
  // both sides simply compute independently from the real current time.
  const [status, setStatus] = useState(() =>
    getOpenNowStatus({ hours, timezone, dateOverrides }),
  );

  useEffect(() => {
    const tick = () =>
      setStatus(getOpenNowStatus({ hours, timezone, dateOverrides }));
    tick();
    const id = setInterval(tick, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hours/dateOverrides are static config, not reactive state
  }, [timezone]);

  return (
    <p
      role="status"
      aria-live="polite"
      // The label is computed from the real current time on both server and
      // client; they will almost always agree, but a request that straddles
      // an open/close boundary second could disagree by one tick. That's a
      // display-only, self-correcting mismatch (the 30s interval fixes it),
      // so we suppress React's hydration warning for it rather than delay
      // showing real data behind a loading state.
      suppressHydrationWarning
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
        status.isOpen ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${status.isOpen ? "bg-green-600" : "bg-gray-500"}`}
      />
      {status.label}
    </p>
  );
}
