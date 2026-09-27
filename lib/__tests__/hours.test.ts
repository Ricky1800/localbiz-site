import { describe, expect, it } from "vitest";
import {
  formatMinutesAsClock,
  getOpenNowStatus,
  type WeeklyHours,
} from "../hours";

const NY = "America/New_York";

/** Mon-Fri 09:00-17:00, Sat 09:00-01:00 (overnight), Sun closed. */
const standardHours: WeeklyHours = {
  mon: { closed: false, ranges: [{ open: "09:00", close: "17:00" }] },
  tue: { closed: false, ranges: [{ open: "09:00", close: "17:00" }] },
  wed: { closed: false, ranges: [{ open: "09:00", close: "17:00" }] },
  thu: { closed: false, ranges: [{ open: "09:00", close: "17:00" }] },
  fri: { closed: false, ranges: [{ open: "09:00", close: "17:00" }] },
  sat: { closed: false, ranges: [{ open: "09:00", close: "01:00" }] },
  sun: { closed: true },
};

describe("formatMinutesAsClock", () => {
  it("formats midnight as 12 AM", () => {
    expect(formatMinutesAsClock(0)).toBe("12 AM");
  });

  it("formats noon as 12 PM", () => {
    expect(formatMinutesAsClock(720)).toBe("12 PM");
  });

  it("formats times with minutes", () => {
    expect(formatMinutesAsClock(90)).toBe("1:30 AM");
    expect(formatMinutesAsClock(1020)).toBe("5 PM");
  });

  it("wraps values past 24h", () => {
    expect(formatMinutesAsClock(1500)).toBe("1 AM"); // 1500 - 1440 = 60
  });
});

describe("getOpenNowStatus — same-day hours", () => {
  it("reports open during business hours (Monday 10:00 EST)", () => {
    // 2026-01-05 is a Monday; America/New_York is EST (UTC-5) in January.
    const now = new Date(Date.UTC(2026, 0, 5, 15, 0)); // 10:00 local
    const result = getOpenNowStatus({ hours: standardHours, timezone: NY, now });
    expect(result.isOpen).toBe(true);
    expect(result.label).toBe("Open now · Closes 5 PM");
    expect(result.changesAt?.getTime()).toBe(Date.UTC(2026, 0, 5, 22, 0));
  });

  it("reports closed before opening (Monday 07:00 EST)", () => {
    const now = new Date(Date.UTC(2026, 0, 5, 12, 0)); // 07:00 local
    const result = getOpenNowStatus({ hours: standardHours, timezone: NY, now });
    expect(result.isOpen).toBe(false);
    expect(result.label).toBe("Closed · Opens 9 AM");
    expect(result.changesAt?.getTime()).toBe(Date.UTC(2026, 0, 5, 14, 0));
  });

  it("reports closed after hours and names the next open day (Monday 18:00 EST)", () => {
    const now = new Date(Date.UTC(2026, 0, 5, 23, 0)); // 18:00 local Monday
    const result = getOpenNowStatus({ hours: standardHours, timezone: NY, now });
    expect(result.isOpen).toBe(false);
    expect(result.label).toBe("Closed · Opens 9 AM tomorrow");
  });

  it("is DST-aware: same local close time yields a different UTC offset in EDT", () => {
    // 2026-03-09 is the Monday after the US spring-forward (2026-03-08); NY is EDT (UTC-4).
    const now = new Date(Date.UTC(2026, 2, 9, 14, 0)); // 10:00 local EDT
    const result = getOpenNowStatus({ hours: standardHours, timezone: NY, now });
    expect(result.isOpen).toBe(true);
    expect(result.changesAt?.getTime()).toBe(Date.UTC(2026, 2, 9, 21, 0));
  });
});

describe("getOpenNowStatus — overnight ranges", () => {
  it("stays open past midnight on the day the overnight range starts (Saturday 23:30)", () => {
    // 2026-01-10 is a Saturday. 23:30 local EST = 04:30 UTC on 2026-01-11.
    const now = new Date(Date.UTC(2026, 0, 11, 4, 30));
    const result = getOpenNowStatus({ hours: standardHours, timezone: NY, now });
    expect(result.isOpen).toBe(true);
    expect(result.label).toBe("Open now · Closes 1 AM");
    expect(result.changesAt?.getTime()).toBe(Date.UTC(2026, 0, 11, 6, 0));
  });

  it("is still open on Sunday morning via the overnight spillover from Saturday", () => {
    // 2026-01-11 (Sunday) 00:30 local EST = 05:30 UTC.
    const now = new Date(Date.UTC(2026, 0, 11, 5, 30));
    const result = getOpenNowStatus({ hours: standardHours, timezone: NY, now });
    expect(result.isOpen).toBe(true);
    expect(result.changesAt?.getTime()).toBe(Date.UTC(2026, 0, 11, 6, 0));
  });

  it("is closed on Sunday once the overnight spillover range has ended", () => {
    // 2026-01-11 (Sunday) 03:00 local EST = 08:00 UTC — Sunday is otherwise fully closed.
    const now = new Date(Date.UTC(2026, 0, 11, 8, 0));
    const result = getOpenNowStatus({ hours: standardHours, timezone: NY, now });
    expect(result.isOpen).toBe(false);
    // Next open is Monday 09:00, which is "tomorrow" relative to Sunday.
    expect(result.label).toBe("Closed · Opens 9 AM tomorrow");
  });
});

describe("getOpenNowStatus — closed days and weekend scan-forward", () => {
  const weekdayOnly: WeeklyHours = {
    mon: { closed: false, ranges: [{ open: "09:00", close: "17:00" }] },
    tue: { closed: false, ranges: [{ open: "09:00", close: "17:00" }] },
    wed: { closed: false, ranges: [{ open: "09:00", close: "17:00" }] },
    thu: { closed: false, ranges: [{ open: "09:00", close: "17:00" }] },
    fri: { closed: false, ranges: [{ open: "09:00", close: "17:00" }] },
    sat: { closed: true },
    sun: { closed: true },
  };

  it("scans forward across a fully-closed weekend to Monday", () => {
    // 2026-01-10 (Saturday) noon local EST = 17:00 UTC.
    const now = new Date(Date.UTC(2026, 0, 10, 17, 0));
    const result = getOpenNowStatus({ hours: weekdayOnly, timezone: NY, now });
    expect(result.isOpen).toBe(false);
    expect(result.label).toBe("Closed · Opens 9 AM Monday");
    expect(result.changesAt?.getTime()).toBe(Date.UTC(2026, 0, 12, 14, 0));
  });
});

describe("getOpenNowStatus — date overrides (holidays)", () => {
  it("closes on a holiday override even though the weekday is normally open", () => {
    // 2026-07-06 is a Monday, normally open 09:00-17:00. NY is EDT (UTC-4) in July,
    // so 10:00 local is 14:00 UTC.
    const now = new Date(Date.UTC(2026, 6, 6, 14, 0));
    const result = getOpenNowStatus({
      hours: standardHours,
      timezone: NY,
      dateOverrides: [{ date: "2026-07-06", label: "Test Holiday", closed: true }],
      now,
    });
    expect(result.isOpen).toBe(false);
  });

  it("applies special reduced hours on a date override", () => {
    // 2026-12-24 is a Thursday, normally open 09:00-17:00; override to a half day 08:00-13:00.
    const withinHalfDay = new Date(Date.UTC(2026, 11, 24, 15, 0)); // 10:00 local EST
    const afterHalfDayCloses = new Date(Date.UTC(2026, 11, 24, 19, 0)); // 14:00 local EST

    const overrides = [
      {
        date: "2026-12-24",
        label: "Christmas Eve",
        closed: false,
        ranges: [{ open: "08:00", close: "13:00" }],
      },
    ];

    const openResult = getOpenNowStatus({
      hours: standardHours,
      timezone: NY,
      dateOverrides: overrides,
      now: withinHalfDay,
    });
    expect(openResult.isOpen).toBe(true);
    expect(openResult.label).toBe("Open now · Closes 1 PM");

    const closedResult = getOpenNowStatus({
      hours: standardHours,
      timezone: NY,
      dateOverrides: overrides,
      now: afterHalfDayCloses,
    });
    expect(closedResult.isOpen).toBe(false);
  });

  it("does not affect other dates", () => {
    // A normal Monday, unaffected by an unrelated override.
    const now = new Date(Date.UTC(2026, 0, 5, 15, 0)); // Monday 10:00 local EST
    const result = getOpenNowStatus({
      hours: standardHours,
      timezone: NY,
      dateOverrides: [{ date: "2026-07-04", closed: true }],
      now,
    });
    expect(result.isOpen).toBe(true);
  });
});

describe("getOpenNowStatus — timezone correctness", () => {
  it("gives different answers for the same UTC instant in different timezones", () => {
    // 14:00 UTC on Monday 2026-01-05: 09:00 local in New York (EST, just opened),
    // but only 06:00 local in Los Angeles (PST, still closed).
    const now = new Date(Date.UTC(2026, 0, 5, 14, 0));

    const nyResult = getOpenNowStatus({ hours: standardHours, timezone: NY, now });
    const laResult = getOpenNowStatus({
      hours: standardHours,
      timezone: "America/Los_Angeles",
      now,
    });

    expect(nyResult.isOpen).toBe(true);
    expect(laResult.isOpen).toBe(false);
  });
});
