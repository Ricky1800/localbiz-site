# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.0] — 2026-09-26

### Added

- Initial release: a Next.js (App Router) + TypeScript (strict) + Tailwind CSS
  starter that generates a full local-business website from one typed
  `business.config.ts` file, validated with zod.
- `lib/config.ts`: zod schema for the business config (address, hours,
  services, testimonials, FAQ, social links, brand colors, and more), with
  descriptive validation errors.
- `lib/hours.ts`: timezone-aware "open now" engine supporting multi-range
  days, overnight ranges (e.g. bar hours spanning midnight), fully closed
  days, and date overrides for holidays/special hours — computed via the
  `Intl` API so it's correct across DST without a date library dependency.
- `lib/schema-org.ts`: JSON-LD builders for `LocalBusiness` (mapped to the
  correct schema.org subtype per business type), `FAQPage`, and `Service`.
- Pages: home (hero, services grid, testimonials, service area, live hours
  widget, FAQ, contact CTA), `/services/[slug]` (statically generated),
  `/contact` (with an optional webhook-backed contact form).
- SEO: JSON-LD on every relevant page, per-page metadata + canonical URLs,
  OpenGraph/Twitter card metadata, `app/sitemap.ts`, `app/robots.ts`.
- Accessibility: skip link, landmark regions, visible focus rings,
  `prefers-reduced-motion` support, a zero-JS `<details>`-based FAQ accordion,
  and a keyboard-operable mobile nav.
- Example fictional business config: "Maple Street Plumbing" (Princeton, NJ).
- Unit tests (Vitest) for the hours engine, config schema, and JSON-LD
  builders, covering timezones, overnight ranges, closed days, holiday
  overrides, and DST transitions.
- CI workflow running lint, typecheck, test, and build on every push/PR.
