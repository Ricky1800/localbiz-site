import type { BusinessConfig } from "./config";

/** Converts a display phone number like "(555) 018-2394" into a `tel:` href. */
export function phoneHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return `tel:${digits}`;
  // Assume a 10-digit US number when no country code is present.
  return digits.length === 10 ? `tel:+1${digits}` : `tel:${digits}`;
}

/** Builds a `mailto:` href. */
export function mailHref(email: string): string {
  return `mailto:${email}`;
}

/** Builds a Google Maps search URL for the business's address. */
export function mapsHref(address: BusinessConfig["address"]): string {
  const query = encodeURIComponent(
    `${address.street}, ${address.city}, ${address.state} ${address.zip}`,
  );
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/** Formats a full postal address as a single display line. */
export function formatAddress(address: BusinessConfig["address"]): string {
  return `${address.street}, ${address.city}, ${address.state} ${address.zip}`;
}

/** Formats a 24-hour "HH:mm" string as a 12-hour clock label, e.g. "09:00" -> "9 AM". */
export function formatTimeOfDay(time: string): string {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!match) return time;
  const hour24 = Number(match[1]);
  const minute = match[2] as string;
  const period = hour24 < 12 ? "AM" : "PM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return minute === "00" ? `${hour12} ${period}` : `${hour12}:${minute} ${period}`;
}
