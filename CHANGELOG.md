# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.2.0] — 2026-09-27

### Added

- **Design-token layer** (`lib/theme/`): OKLCH-based color math and WCAG
  contrast checking (`color.ts`), a brand-color-to-tonal-scale palette
  generator (`palette.ts`), radius/shadow/motion/density/type-scale style
  tables (`styles.ts`), and `resolveTheme()` (`tokens.ts`), which resolves a
  `theme` config into every concrete token, auto-corrects failing color-role
  pairs where safe, and **fails the build with a descriptive error** for
  pairs it can't correct (e.g. a too-pale accent color used as icon text).
  Tokens are exposed as CSS custom properties, mapped onto Tailwind v4's own
  theme namespaces (`@theme inline` in `app/globals.css`) so existing
  utilities (`rounded-lg`, `shadow-md`, `text-3xl`, `bg-primary`, ...)
  automatically follow the active preset.
- **8 vertical-tuned presets**: `neutral`, `salon-beauty`,
  `trades-home-services`, `restaurant-cafe`, `clinic-wellness`,
  `auto-repair`, `professional-services`, `boutique-retail` — each with its
  own brand color, Google Fonts pairing (via `next/font`), radius/shadow
  style, motion feel, and density.
- **`theme` config block** in `business.config.ts` (`{ preset, brandColor?,
  secondaryColor?, accentColor?, fonts?, radius?, shadow?, motion?,
  density? }`), replacing the old fixed `brandColors` field — zod-validated,
  with unit tests for the palette math and contrast checking.
- **Section variants**: 2 professionally designed, responsive, accessible
  variants for every homepage section (header, hero, services, testimonials,
  service area, hours & contact — a new section, CTA band, FAQ, footer),
  chosen and ordered via a new `sections`/`layout` config block
  (`lib/sections/schema.ts`), rendered through a single dispatcher
  (`components/sections/index.tsx`) shared by the homepage and the design
  panel. The hero's `split-image` variant supports an optional `next/image`
  photo (`images.hero`) with a token-driven gradient fallback.
- **`/design`**: a dev-only live design panel (`app/design/`) to switch
  preset, brand color, fonts, radius/shadow/motion/density, header/footer
  variant, and each section's enabled state + variant, with a live
  mobile/tablet/desktop preview, a live WCAG contrast report, and a "Copy
  config" button that renders the exact snippet to paste into
  `business.config.ts`. 404s outside `NODE_ENV=development`, verified by an
  automated test against a production build.
- **Quality gates**: a Playwright + `@axe-core/playwright` accessibility
  matrix across every preset and page (zero serious/critical violations), a
  visual smoke screenshot per preset, and a Lighthouse CI config
  (`lighthouserc.cjs`) budgeting performance ≥ 90, accessibility ≥ 95,
  SEO ≥ 95, and best-practices ≥ 95 — all wired into new `e2e` and
  `lighthouse` CI jobs (installing Playwright's browsers in CI).

### Changed

- `business.config.ts`'s `brandColors: { primary, secondary?, accent? }`
  field is **replaced** by `theme: { preset, brandColor?, ... }` (see
  above) — existing configs need a small migration (see the README's
  "Design system" section).
- Every component now uses semantic token classes (`bg-primary`,
  `text-fg-muted`, `border-border`, ...) instead of hard-coded Tailwind
  grays or the old `brand-*` CSS variables.
- The homepage now renders its sections via the configurable
  `sections`/`layout` blocks instead of a single fixed component tree.

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
