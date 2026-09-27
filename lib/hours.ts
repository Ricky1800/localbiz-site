/**
 * Pure logic for computing "is this business open right now" in the
 * business's own timezone, and describing when it opens/closes next.
 *
 * Design notes:
 * - All wall-clock reasoning happens in the business's IANA timezone via the
 *   `Intl` API, never in the server/client's local timezone. A visitor in
 *   Tokyo checking a Princeton, NJ plumber's site must see the same
 *   "open now" state as a visitor in New Jersey.
 * - Weekly hours support multiple ranges per day (e.g. lunch break) and
 *   "overnight" ranges where `close` is numerically earlier than `open`
 *   (e.g. a bar open 18:00-02:00 spills into the next calendar day).
 * - Date overrides (holidays, special hours) take priority over the
 *   regular weekly schedule for that specific calendar date, in the
 *   business's timezone.
 */

export type DayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export const DAY_KEYS: readonly DayKey[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

export interface HoursRange {
  /** 24-hour "HH:mm" local time, e.g. "09:00" */
  open: string;
  /** 24-hour "HH:mm" local time, e.g. "17:30". May be numerically before
   *  `open` to represent an overnight range (spills into the next day). */
  close: string;
}

export type DaySchedule =
  | { closed: true; ranges?: undefined }
  | { closed: false; ranges: HoursRange[] };

export type WeeklyHours = Record<DayKey, DaySchedule>;

export interface DateOverride {
  /** "YYYY-MM-DD" calendar date in the business's timezone. */
  date: string;
  /** Optional label, e.g. "Christmas Day", shown in UI/tooltips. */
  label?: string;
  closed: boolean;
  ranges?: HoursRange[];
}

export interface OpenNowResult {
  isOpen: boolean;
  /** The range currently active, if open. */
  activeRange?: HoursRange;
  /** The next moment (UTC instant) the status flips, if determinable. */
  changesAt?: Date;
  /** Human-readable summary, e.g. "Open now · Closes 6:00 PM". */
  label: string;
}

/** Minutes since local midnight, e.g. "09:30" -> 570. */
function toMinutes(time: string): number {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!match) {
    throw new Error(`Invalid time string: "${time}"`);
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours * 60 + minutes;
}

interface WallClock {
  /** ISO calendar date, "YYYY-MM-DD", in the target timezone. */
  date: string;
  /** 0 (Sunday) - 6 (Saturday), in the target timezone. */
  weekday: number;
  /** Minutes since local midnight, in the target timezone. */
  minutes: number;
}

/**
 * Reads the wall-clock date/weekday/time-of-day for a UTC instant, as
 * observed in `timeZone`. Uses `Intl.DateTimeFormat` so it correctly
 * accounts for DST and historical offset changes without any date library.
 */
function getWallClock(instant: Date, timeZone: string): WallClock {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "short",
  });

  const parts = formatter.formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes): string => {
    const part = parts.find((p) => p.type === type);
    if (!part) {
      throw new Error(`Missing "${type}" part while formatting date`);
    }
    return part.value;
  };

  const year = get("year");
  const month = get("month");
  const day = get("day");
  // Some locales/environments report "24" for midnight hour instead of "00".
  const hourRaw = Number(get("hour"));
  const hour = hourRaw === 24 ? 0 : hourRaw;
  const minute = Number(get("minute"));
  const weekdayShort = get("weekday").toLowerCase().slice(0, 3);

  const weekdayMap: Record<string, number> = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  };

  const weekday = weekdayMap[weekdayShort];
  if (weekday === undefined) {
    throw new Error(`Unrecognized weekday abbreviation: "${weekdayShort}"`);
  }

  return {
    date: `${year}-${month}-${day}`,
    weekday,
    minutes: hour * 60 + minute,
  };
}

/** Parses a "YYYY-MM-DD" string into numeric parts. Callers in this module
 * only ever pass already-validated date strings (either derived internally
 * or validated by `lib/config.ts`'s zod schema), so a malformed string here
 * indicates a programming error rather than bad user input. */
function parseDateStr(dateStr: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) {
    throw new Error(`Invalid date string: "${dateStr}"`);
  }
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

/** Adds `days` calendar days to a "YYYY-MM-DD" string (UTC-safe, no TZ math). */
function addDaysToDateString(date: string, days: number): string {
  const { year, month, day } = parseDateStr(date);
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() + days);
  const yyyy = utc.getUTCFullYear();
  const mm = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(utc.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Converts a "HH:mm" 12-hour-friendly label, e.g. 570 -> "9:30 AM". */
export function formatMinutesAsClock(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hour24 = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const period = hour24 < 12 ? "AM" : "PM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const minuteStr = String(minute).padStart(2, "0");
  return minute === 0 ? `${hour12} ${period}` : `${hour12}:${minuteStr} ${period}`;
}

/** Safely resolves a 0-6 weekday index to a `DayKey`. `weekday` is always
 * the result of a `% 7` computation in this module, so it is always in
 * bounds — this just satisfies `noUncheckedIndexedAccess` explicitly rather
 * than asserting it away. */
function dayKeyForWeekday(weekday: number): DayKey {
  const key = DAY_KEYS[weekday];
  if (!key) {
    throw new Error(`Weekday index out of range: ${weekday}`);
  }
  return key;
}

const DAY_LABELS: Record<DayKey, string> = {
  sun: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
};

/** Resolves the effective schedule for a given calendar date, applying any
 * matching date override, otherwise falling back to the weekly schedule. */
function scheduleForDate(
  dateStr: string,
  weekday: number,
  hours: WeeklyHours,
  overrides: DateOverride[],
): DaySchedule {
  const override = overrides.find((o) => o.date === dateStr);
  if (override) {
    return override.closed
      ? { closed: true }
      : { closed: false, ranges: override.ranges ?? [] };
  }
  return hours[dayKeyForWeekday(weekday)];
}

/**
 * Determines whether the business is open at `now` (a real UTC instant),
 * given its weekly hours, timezone, and any date overrides (holidays).
 */
export function getOpenNowStatus(params: {
  hours: WeeklyHours;
  timezone: string;
  dateOverrides?: DateOverride[];
  now?: Date;
}): OpenNowResult {
  const { hours, timezone } = params;
  const overrides = params.dateOverrides ?? [];
  const now = params.now ?? new Date();

  const today = getWallClock(now, timezone);
  const yesterdayDateStr = addDaysToDateString(today.date, -1);
  const yesterdayWeekday = (today.weekday + 6) % 7;

  // 1. Check if we're still inside an overnight range that started yesterday.
  const yesterdaySchedule = scheduleForDate(
    yesterdayDateStr,
    yesterdayWeekday,
    hours,
    overrides,
  );
  if (!yesterdaySchedule.closed) {
    for (const range of yesterdaySchedule.ranges) {
      const openMin = toMinutes(range.open);
      const closeMin = toMinutes(range.close);
      const isOvernight = closeMin <= openMin;
      if (isOvernight && today.minutes < closeMin) {
        const closesAt = buildInstantForTodayMinutes(
          now,
          timezone,
          today,
          closeMin,
        );
        return {
          isOpen: true,
          activeRange: range,
          changesAt: closesAt,
          label: `Open now · Closes ${formatMinutesAsClock(closeMin)}`,
        };
      }
    }
  }

  // 2. Check today's own ranges.
  const todaySchedule = scheduleForDate(
    today.date,
    today.weekday,
    hours,
    overrides,
  );
  if (!todaySchedule.closed) {
    for (const range of todaySchedule.ranges) {
      const openMin = toMinutes(range.open);
      const closeMin = toMinutes(range.close);
      const isOvernight = closeMin <= openMin;

      if (!isOvernight) {
        if (today.minutes >= openMin && today.minutes < closeMin) {
          const closesAt = buildInstantForTodayMinutes(
            now,
            timezone,
            today,
            closeMin,
          );
          return {
            isOpen: true,
            activeRange: range,
            changesAt: closesAt,
            label: `Open now · Closes ${formatMinutesAsClock(closeMin)}`,
          };
        }
      } else if (today.minutes >= openMin) {
        // Overnight range that started today; still open past midnight.
        const closesAt = buildInstantForTodayMinutes(
          now,
          timezone,
          today,
          closeMin + 1440,
        );
        return {
          isOpen: true,
          activeRange: range,
          changesAt: closesAt,
          label: `Open now · Closes ${formatMinutesAsClock(closeMin)}`,
        };
      }
    }
  }

  // 3. Closed right now — find the next opening, scanning forward up to 8
  // days (covers a full week plus one date-override edge case).
  for (let offset = 0; offset <= 8; offset++) {
    const candidateDateStr =
      offset === 0 ? today.date : addDaysToDateString(today.date, offset);
    const candidateWeekday = (today.weekday + offset) % 7;
    const candidateSchedule = scheduleForDate(
      candidateDateStr,
      candidateWeekday,
      hours,
      overrides,
    );

    if (candidateSchedule.closed) continue;

    for (const range of candidateSchedule.ranges) {
      const openMin = toMinutes(range.open);
      if (offset === 0 && openMin <= today.minutes) {
        // Already passed today (and not overnight-active, checked above).
        continue;
      }
      const opensAt = buildInstantForFutureMinutes(
        now,
        timezone,
        today,
        offset,
        openMin,
      );
      const dayLabel =
        offset === 0
          ? "today"
          : offset === 1
            ? "tomorrow"
            : DAY_LABELS[dayKeyForWeekday(candidateWeekday)];
      return {
        isOpen: false,
        changesAt: opensAt,
        label: `Closed · Opens ${formatMinutesAsClock(openMin)}${
          dayLabel === "today" ? "" : ` ${dayLabel}`
        }`,
      };
    }
  }

  return { isOpen: false, label: "Closed" };
}

/**
 * Builds a UTC `Date` for `targetMinutes` (minutes since local midnight,
 * may exceed 1440 to represent "tomorrow") on the wall-clock day currently
 * being evaluated, by binary-searching the UTC timeline for the instant
 * whose local wall-clock (in `timezone`) matches. This correctly handles
 * DST transitions without manual offset math.
 */
function buildInstantForTodayMinutes(
  now: Date,
  timezone: string,
  today: WallClock,
  targetMinutes: number,
): Date {
  return findInstantForMinutesFromDate(now, timezone, today.date, targetMinutes);
}

function buildInstantForFutureMinutes(
  now: Date,
  timezone: string,
  today: WallClock,
  dayOffset: number,
  targetMinutes: number,
): Date {
  const baseDate =
    dayOffset === 0 ? today.date : addDaysToDateString(today.date, dayOffset);
  return findInstantForMinutesFromDate(now, timezone, baseDate, targetMinutes);
}

/**
 * Finds the UTC instant such that, when viewed in `timezone`, the wall
 * clock reads `baseDate` (YYYY-MM-DD) plus `targetMinutes` minutes past
 * midnight. `targetMinutes` may be >= 1440 to roll into following day(s).
 *
 * Implemented as a bounded binary search over the UTC timeline rather than
 * naive offset arithmetic, so it's correct across DST transitions.
 */
function findInstantForMinutesFromDate(
  now: Date,
  timezone: string,
  baseDate: string,
  targetMinutes: number,
): Date {
  const dayRoll = Math.floor(targetMinutes / 1440);
  const minutesInDay = ((targetMinutes % 1440) + 1440) % 1440;
  const targetDateStr = addDaysToDateString(baseDate, dayRoll);

  // Seed a UTC guess assuming UTC offset of 0, then refine.
  const { year, month, day } = parseDateStr(targetDateStr);
  let guess = new Date(
    Date.UTC(year, month - 1, day, Math.floor(minutesInDay / 60), minutesInDay % 60),
  );

  // Refine up to 3 times: compare the wall clock the guess produces in the
  // target timezone against the target, and correct the residual offset.
  for (let i = 0; i < 3; i++) {
    const observed = getWallClock(guess, timezone);
    const observedTotalMinutes =
      dateStringToDayIndex(observed.date) * 1440 + observed.minutes;
    const targetTotalMinutes =
      dateStringToDayIndex(targetDateStr) * 1440 + minutesInDay;
    const diffMinutes = targetTotalMinutes - observedTotalMinutes;
    if (diffMinutes === 0) break;
    guess = new Date(guess.getTime() + diffMinutes * 60_000);
  }

  return guess;
}

/** Days since a fixed epoch, purely for comparing two date strings' distance
 * in minutes without re-deriving a Date object each time. */
function dateStringToDayIndex(dateStr: string): number {
  const { year, month, day } = parseDateStr(dateStr);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}
