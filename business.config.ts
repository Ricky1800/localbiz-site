import { parseBusinessConfig, type BusinessConfig } from "./lib/config";

/**
 * This is the ONLY file you need to edit to launch a new site.
 *
 * It is validated against `lib/config.ts`'s zod schema at build time (and at
 * `next dev` startup) — if something is missing or malformed, you'll get a
 * readable error instead of a broken page. See README.md's "Customize in 10
 * minutes" section and config reference table for a field-by-field guide.
 *
 * The business below ("Maple Street Plumbing") is a fictional example based
 * in Princeton, NJ, with a placeholder 555 phone number — replace every
 * field with your own business's real information.
 */
const rawConfig = {
  name: "Maple Street Plumbing",
  tagline: "Fast, honest plumbing for Princeton and beyond",
  businessType: "plumber",
  description:
    "Maple Street Plumbing is a family-owned plumbing company serving Princeton, NJ and the surrounding towns with same-day repairs, drain cleaning, water heater installation, and 24/7 emergency service.",

  address: {
    street: "12 Maple Street",
    city: "Princeton",
    state: "NJ",
    zip: "08542",
    country: "US",
  },
  phone: "(555) 018-2394",
  email: "hello@maplestreetplumbing.example",
  geo: {
    lat: 40.3573,
    lng: -74.6672,
  },
  timezone: "America/New_York",

  // Weekly hours. Each day is either `{ closed: true }` or
  // `{ closed: false, ranges: [{ open, close }, ...] }`. Times are 24-hour
  // "HH:mm" in the business's own timezone above. A range whose `close` is
  // numerically before its `open` (like Friday below) is an "overnight"
  // range that spills into the next calendar day.
  hours: {
    mon: { closed: false, ranges: [{ open: "08:00", close: "18:00" }] },
    tue: { closed: false, ranges: [{ open: "08:00", close: "18:00" }] },
    wed: { closed: false, ranges: [{ open: "08:00", close: "18:00" }] },
    thu: { closed: false, ranges: [{ open: "08:00", close: "18:00" }] },
    fri: { closed: false, ranges: [{ open: "08:00", close: "20:00" }] },
    // Saturday: emergency on-call line only, overnight into Sunday morning.
    sat: { closed: false, ranges: [{ open: "09:00", close: "01:00" }] },
    sun: { closed: true },
  },

  // Holiday / one-off overrides. `date` is "YYYY-MM-DD" in the business's
  // timezone. These take priority over the weekly schedule above for that
  // calendar date only.
  dateOverrides: [
    { date: "2026-07-04", label: "Independence Day", closed: true },
    { date: "2026-11-26", label: "Thanksgiving Day", closed: true },
    {
      date: "2026-12-24",
      label: "Christmas Eve (half day)",
      closed: false,
      ranges: [{ open: "08:00", close: "13:00" }],
    },
    { date: "2026-12-25", label: "Christmas Day", closed: true },
  ],

  services: [
    {
      slug: "drain-cleaning",
      name: "Drain Cleaning",
      description:
        "Fast clearing for clogged kitchen, bathroom, and main line drains using hydro-jetting and motorized augers — most jobs finished same-day.",
      priceFrom: 149,
    },
    {
      slug: "water-heater-installation",
      name: "Water Heater Installation & Repair",
      description:
        "Tank and tankless water heater installation, repair, and replacement, with same-day emergency service for no-hot-water calls.",
      priceFrom: 1200,
    },
    {
      slug: "leak-detection",
      name: "Leak Detection & Repair",
      description:
        "Non-invasive leak detection for slab leaks, hidden pipe leaks, and slow drips, followed by targeted repair with minimal wall or floor damage.",
      priceFrom: 175,
    },
    {
      slug: "emergency-plumbing",
      name: "24/7 Emergency Plumbing",
      description:
        "Burst pipes, overflowing toilets, and sewage backups don't wait for business hours — our on-call line connects you to a licensed plumber any time, day or night.",
    },
    {
      slug: "fixture-installation",
      name: "Faucet & Fixture Installation",
      description:
        "Professional installation of faucets, sinks, toilets, and garbage disposals, including fixtures you've already purchased.",
      priceFrom: 125,
    },
  ],

  serviceAreas: [
    "Princeton",
    "Lawrenceville",
    "Hopewell",
    "Pennington",
    "West Windsor",
    "Plainsboro",
    "Kingston",
  ],

  testimonials: [
    {
      name: "Danielle R.",
      quote:
        "Called at 7am about a burst pipe and someone was at my door in Lawrenceville by 9. Fixed it fast and explained exactly what happened.",
      rating: 5,
      town: "Lawrenceville",
    },
    {
      name: "Marcus T.",
      quote:
        "Replaced our old tank water heater with a tankless unit. Upfront pricing, clean install, no surprises on the bill.",
      rating: 5,
      town: "Princeton",
    },
    {
      name: "Priya K.",
      quote:
        "Our kitchen drain backed up on a Saturday night and they still picked up. Reasonable emergency rate too.",
      rating: 4,
      town: "West Windsor",
    },
  ],

  faq: [
    {
      question: "Do you charge for estimates?",
      answer:
        "Estimates are free for standard jobs booked during business hours. Emergency/after-hours calls include a flat dispatch fee, which we'll always quote before we head out.",
    },
    {
      question: "Are you licensed and insured?",
      answer:
        "Yes — Maple Street Plumbing is fully licensed in New Jersey and carries general liability insurance. Proof of license and insurance is available on request.",
    },
    {
      question: "What towns do you actually serve?",
      answer:
        "Princeton, Lawrenceville, Hopewell, Pennington, West Windsor, Plainsboro, and Kingston. If you're just outside these towns, call us — we can often still help.",
    },
    {
      question: "Do you offer emergency service outside business hours?",
      answer:
        "Yes, 24/7 for true emergencies like burst pipes, sewage backups, or total loss of water. See the Emergency Plumbing service for details.",
    },
  ],

  social: {
    facebook: "https://facebook.com/maplestreetplumbing.example",
    instagram: "https://instagram.com/maplestreetplumbing.example",
    google: "https://maps.google.com/?cid=0000000000000000000",
  },

  // Optional: a Calendly / Cal.com booking link. Leave undefined to hide the
  // "Book online" button and fall back to click-to-call only.
  bookingUrl: "https://cal.com/maplestreetplumbing-example/estimate",

  // Optional: a webhook URL (e.g. a Zapier/Make/Formspree endpoint) that the
  // contact form POSTs to as JSON. Leave undefined to hide the contact form
  // entirely and show phone/email only.
  contactFormWebhookUrl: undefined,

  // The design system: pick a preset tuned to your vertical, then override
  // only what you want to change. See README.md's "Design system" section
  // for the full preset gallery, token reference, and the live `/design`
  // panel (dev only) that lets you preview combinations and copy the exact
  // snippet to paste here.
  theme: {
    preset: "trades-home-services",
  },
  logoPath: "/logo.svg",
  siteUrl: "https://www.maplestreetplumbing.example",
} satisfies Record<string, unknown>;

const businessConfig: BusinessConfig = parseBusinessConfig(rawConfig);

export default businessConfig;
