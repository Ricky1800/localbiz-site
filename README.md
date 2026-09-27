# localbiz-site

[![CI](https://github.com/Ricky1800/localbiz-site/actions/workflows/ci.yml/badge.svg)](https://github.com/Ricky1800/localbiz-site/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

A Next.js (App Router) + TypeScript (strict) + Tailwind CSS starter that turns
**one typed config file** into a fast, SEO-ready website for a local
business — a plumber, salon, restaurant, contractor, or anything in between.

[**Deploy to Vercel**](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FRicky1800%2Flocalbiz-site)

## The problem this solves

Most local businesses (a plumber, a salon, a one-location restaurant) don't
need a CMS, a database, or a page builder subscription — they need a fast,
correct, good-looking site that answers three questions: *are you open right
now, what do you do, and how do I reach you.* Building that from scratch
every time means re-solving the same handful of hard, easy-to-get-wrong
problems: timezone-correct "open now" logic, valid JSON-LD for local search,
and an accessible, mobile-friendly layout.

`localbiz-site` solves it once. You edit `business.config.ts` — a single
typed, validated file — and get a complete, statically-generatable site.
There's no admin panel and no database because there doesn't need to be one:
the config file *is* the CMS, and it's checked into git like everything else.

## Live features

- **One config file.** `business.config.ts` is validated against a
  [zod](https://zod.dev) schema at build time (`lib/config.ts`) — typos and
  missing fields fail fast with a readable error instead of a broken page.
- **Timezone-correct "open now" status.** `lib/hours.ts` computes whether the
  business is open right now in *its own* timezone (not the visitor's or the
  server's), using the `Intl` API — no date-library dependency. Supports:
  - Multiple ranges per day (e.g. a lunch closure)
  - Overnight ranges that spill past midnight (e.g. a bar open until 2 AM)
  - Fully closed days
  - Holiday / one-off date overrides (closed, or special reduced hours)
  - Daylight Saving Time transitions
- **Statically generated service pages** at `/services/[slug]`, one per
  entry in `business.config.ts`'s `services` array.
- **An optional contact form** on `/contact` that POSTs JSON to a configurable
  webhook URL (Zapier, Make, Formspree, your own endpoint — anything that
  accepts a JSON POST). Leave `contactFormWebhookUrl` unset and the form
  simply doesn't render; phone/email contact still does.
- **JSON-LD structured data** on every page: `LocalBusiness` (mapped to the
  correct schema.org subtype — `Plumber`, `HairSalon`, `Restaurant`, etc.,
  falling back to generic `LocalBusiness`), `openingHoursSpecification`,
  `geo`, `areaServed`, `FAQPage`, and per-service `Service` + `Offer`.
- **Per-page metadata**, canonical URLs, OpenGraph/Twitter cards,
  `app/sitemap.ts`, and `app/robots.ts`.
- **Accessible by default**: skip-to-content link, landmark regions, visible
  focus rings, `prefers-reduced-motion` support, a keyboard-operable mobile
  nav, and a zero-JavaScript `<details>`-based FAQ accordion.
- **Fast by default**: React Server Components everywhere except the three
  places that genuinely need client JS (the mobile nav toggle, the live hours
  widget, and the contact form).

## Tech stack

Next.js (App Router) · TypeScript (strict) · Tailwind CSS · zod · Vitest

## Quickstart

```bash
git clone https://github.com/Ricky1800/localbiz-site.git
cd localbiz-site
npm install
npm run dev
```

Open `http://localhost:3000` — you'll see the example business, **Maple
Street Plumbing** (a fictional business in Princeton, NJ with a placeholder
555 phone number).

## Customize in 10 minutes

1. **Open `business.config.ts`.** This is the only file you need to edit to
   launch your own site.
2. **Replace the identity fields**: `name`, `tagline`, `description`,
   `businessType` (see the config reference below for supported values),
   `address`, `phone`, `email`, `geo` (latitude/longitude — grab these from
   Google Maps: right-click your location → the coordinates are the first
   item in the context menu), and `timezone` (an
   [IANA timezone name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones),
   e.g. `"America/Chicago"`).
3. **Set your `hours`.** One entry per day, either `{ closed: true }` or
   `{ closed: false, ranges: [{ open: "09:00", close: "17:00" }] }`. Add a
   second range for a lunch break; set `close` earlier than `open` for a
   range that spans midnight.
4. **Add `dateOverrides`** for holidays or one-off schedule changes — see the
   example config for the shape.
5. **Fill in `services`** — each needs a unique `slug` (used in the URL,
   lowercase-kebab-case), a `name`, and a `description`. `priceFrom` is
   optional.
6. **Set `serviceAreas`, `testimonials`, and `faq`** to your own towns,
   reviews, and questions.
7. **Set `brandColors.primary`** (and optionally `secondary`/`accent`) to hex
   colors matching your brand — the whole site re-themes from these.
8. **Replace `public/logo.svg`** with your own logo, and update `logoPath` if
   you rename the file.
9. **Set `siteUrl`** to your real domain once you have one (it's used to
   build canonical URLs, JSON-LD `@id`s, and the sitemap).
10. **Optionally set `bookingUrl`** (a Calendly/Cal.com link) and
    `contactFormWebhookUrl` (see below) — both are optional and the UI adapts
    automatically when they're unset.

Run `npm run build` once you're done — if `business.config.ts` has a typing
or validation problem, the build will fail with a specific, readable error
telling you exactly which field is wrong.

### Wiring up the contact form

`contactFormWebhookUrl` should point at anything that accepts a JSON `POST`
body of `{ name, email, phone, message }`. This project doesn't include a
backend on purpose — pick whichever of these fits:

- A [Zapier](https://zapier.com) "Catch Hook" trigger
- A [Make.com](https://www.make.com) webhook trigger
- [Formspree](https://formspree.io) or a similar forms-as-a-service endpoint
- Your own serverless function, deployed separately

Leave it unset (`undefined`) to hide the form entirely and rely on
click-to-call / email only.

## Config reference

All fields live in `business.config.ts` and are enforced by the zod schema in
`lib/config.ts`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | `string` | ✅ | Business name. |
| `tagline` | `string` | ✅ | Short one-line pitch, shown in the hero and `<title>`. |
| `businessType` | enum | ✅ | One of the keys in `lib/business-types.ts` (e.g. `"plumber"`, `"hair_salon"`, `"restaurant"`); maps to a schema.org subtype. Use `"other"` to fall back to generic `LocalBusiness`. |
| `description` | `string` | ✅ | Longer description used in metadata and JSON-LD. |
| `address` | object | ✅ | `{ street, city, state, zip, country? }` (`country` defaults to `"US"`). |
| `phone` | `string` | ✅ | Display format; converted to a `tel:` link automatically. |
| `email` | `string` | ✅ | Must be a valid email address. |
| `geo` | object | ✅ | `{ lat, lng }`, used for JSON-LD `GeoCoordinates`. |
| `timezone` | `string` | ✅ | IANA timezone name; validated against the `Intl` API. |
| `hours` | object | ✅ | One entry per day (`mon`…`sun`); see "Customize" above. |
| `dateOverrides` | array | — | Holiday/special-hours overrides; defaults to `[]`. |
| `services` | array | ✅ (min 1) | `{ slug, name, description, priceFrom? }`; slugs must be unique. |
| `serviceAreas` | `string[]` | ✅ (min 1) | Town/city names shown on the homepage and in JSON-LD `areaServed`. |
| `testimonials` | array | — | `{ name, quote, rating?, town? }`; defaults to `[]`. |
| `faq` | array | — | `{ question, answer }`; defaults to `[]`; renders as `FAQPage` JSON-LD when non-empty. |
| `social` | object | — | Any of `facebook`, `instagram`, `google`, `yelp`, `x`, `tiktok`, `linkedin` — full URLs. |
| `bookingUrl` | `string` | — | Calendly/Cal.com link; shows a "Book online" button when set. |
| `contactFormWebhookUrl` | `string` | — | See above; hides the contact form when unset. |
| `brandColors` | object | ✅ | `{ primary, secondary?, accent? }`, hex colors. |
| `logoPath` | `string` | ✅ | Path under `public/`, e.g. `"/logo.svg"`. |
| `siteUrl` | `string` | ✅ | Full production URL, e.g. `"https://www.example.com"`. |

## How SEO works

- **JSON-LD** is generated from your config at request time by
  `lib/schema-org.ts` and injected via `components/JsonLd.tsx`:
  - A `LocalBusiness` (or the matching subtype) graph on every page, with
    `openingHoursSpecification` built from `hours`, `areaServed` built from
    `serviceAreas`, and an `aggregateRating`/`review` block computed
    automatically when any `testimonials` entries include a `rating`.
  - An `FAQPage` graph on the homepage when `faq` is non-empty.
  - A `Service` graph (with an `Offer` when `priceFrom` is set) on each
    `/services/[slug]` page.
- **Metadata**: every page sets a title (via the root template in
  `app/layout.tsx`), description, canonical URL, and OpenGraph/Twitter tags.
- **`app/sitemap.ts`** enumerates the homepage, `/contact`, and every service
  page. **`app/robots.ts`** allows all crawling and points at the sitemap.
- None of this requires an API key, a Search Console property, or any
  external service — it's all derived from `business.config.ts` at build/
  request time.
  ### SEO & Indexing
By default, the site allows all crawlers. To disable indexing (useful for staging environments), set the following environment variable:
`NEXT_PUBLIC_ALLOW_INDEXING=false`

## Testing

Pure logic — the hours engine, the config schema, and the JSON-LD builders —
lives in `lib/` and is unit tested with [Vitest](https://vitest.dev) in
`lib/__tests__/`. These tests cover timezones, overnight ranges, closed days,
holiday overrides, and DST transitions without needing a browser or a
running server.

```bash
npm test          # run once
npm run test:watch
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server at `http://localhost:3000`. |
| `npm run build` | Production build (also statically generates service pages). |
| `npm start` | Serve the production build. |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript rules). |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm test` | Run the Vitest suite once. |

## Roadmap

See [`ROADMAP_ISSUES.md`](./ROADMAP_ISSUES.md) for a set of scoped,
contributor-friendly issues — multi-location support, a blog/announcements
collection, a Playwright accessibility/visual-regression suite, i18n, and
more. Nothing in that list is implemented yet; see it as a backlog, not a
feature list.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md). Bug reports and feature requests
use the templates under `.github/ISSUE_TEMPLATE/`.

## License

[MIT](./LICENSE) © 2026 Ricky1800
