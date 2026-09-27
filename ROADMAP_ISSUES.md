# Roadmap issues

This is a backlog of scoped, contributor-friendly issues. None of these are
implemented yet — this is intentionally a list of *future* work, not a
feature list (see the README's "Live features" for what exists today). Each
entry below is written so it could be copy-pasted directly into a GitHub
issue.

---

> **Done:** a Playwright + axe-core accessibility suite (run across every
> theme preset), visual smoke screenshots, and a Lighthouse CI budget check
> now exist — see the README's "Design system" → "Quality gates" section.
> This used to be issue #1 here.

## 2. Support multiple locations in one config

**Labels:** `enhancement`, `help wanted`

**Body:**
Right now `business.config.ts` describes exactly one location. Businesses
with 2-5 locations (common for salons, gyms, and franchises) currently need
a full separate deployment per location. Add optional multi-location support:
- Extend the schema in `lib/config.ts` with an optional `locations: Location[]`
  array (each with its own address/geo/hours/phone), keeping today's flat
  fields working unchanged for single-location businesses (backwards
  compatible — this should be purely additive).
- Add a `/locations/[slug]` route, a locations index section, and a
  `LocalBusiness` JSON-LD entry per location (schema.org supports an array of
  locations via `department` or repeated top-level entities — research the
  correct pattern before implementing).
- Update the homepage's hours widget and contact page to handle "which
  location" when more than one exists.

**Acceptance criteria:**
- [ ] Existing single-location configs continue to work with zero changes.
- [ ] A config with 2+ locations renders a locations index and per-location
      pages.
- [ ] JSON-LD validates (spot-check with Google's Rich Results Test).
- [ ] Tests cover the new schema branch in `lib/__tests__/config.test.ts`.

---

## 3. Add an optional blog / announcements collection

**Labels:** `enhancement`, `help wanted`

**Body:**
Some businesses want to post occasional updates (seasonal hours, a new
service, a community event) without needing a CMS. Add an optional,
file-based content collection:
- MDX or plain Markdown files under `content/posts/*.md`, parsed at build
  time (no runtime dependency, no database).
- A `/blog` index and `/blog/[slug]` pages, statically generated.
- Each post gets its own metadata + `Article`/`BlogPosting` JSON-LD.
- If `content/posts/` is empty or missing, the nav link and route should not
  appear at all (same "hide when unset" pattern used for the contact form
  and booking button elsewhere in this project).

**Acceptance criteria:**
- [ ] Zero posts → no `/blog` link, no `/blog` route rendered (or a graceful
      empty state — pick one and document it).
- [ ] At least one example post ships in `content/posts/` behind a flag or
      is clearly marked as a sample.
- [ ] `npm run build` still succeeds with zero posts present.

---

## 4. Internationalization (i18n) for a bilingual service area

**Labels:** `enhancement`, `help wanted`

**Body:**
Many local-service businesses (especially in NJ) serve bilingual (English/
Spanish) communities. Add optional i18n:
- Use Next.js's built-in App Router i18n routing patterns (locale segments,
  e.g. `/es/servicios/[slug]`).
- Extend `business.config.ts` so translatable strings (tagline, description,
  service names/descriptions, FAQ, testimonials) can optionally be provided
  per-locale, falling back to the default locale when a translation is
  missing.
- Keep this fully optional — a config with no translations should render
  exactly as it does today.

**Acceptance criteria:**
- [ ] A config with only English content builds and renders unchanged.
- [ ] A config with `es` translations for a subset of fields renders the
      Spanish route with translated content where provided, English
      fallbacks elsewhere.
- [ ] `hreflang` alternate links are added to metadata when more than one
      locale is configured.

---

## 5. `next/image`-optimized photo gallery section

**Labels:** `enhancement`, `good first issue`

**Body:**
Add an optional homepage "gallery" section (before/after photos, shop
photos, completed jobs) driven by a new optional `gallery: { src, alt }[]`
config field, rendered with `next/image` for automatic optimization/lazy
loading. Should render nothing when `gallery` is unset or empty, consistent
with this project's "hide when unset" convention.

**Acceptance criteria:**
- [ ] New optional `gallery` field added to the zod schema with sensible
      validation (non-empty `alt` text required for accessibility).
- [ ] Section omitted entirely when `gallery` is unset/empty.
- [ ] Images are responsive and don't cause layout shift (explicit
      width/height or a fixed aspect-ratio wrapper).

---

## 6. Reduced-motion-aware entrance animations

**Labels:** `good first issue`, `enhancement`

**Body:**
The homepage sections currently have no entrance animation. Add a small,
dependency-free fade/slide-in on scroll for section headings (e.g. via
`IntersectionObserver` in a small client component), fully disabled under
`prefers-reduced-motion: reduce` (which `app/globals.css` already handles
globally for `transition`/`animation` — this issue is about adding new
motion, not fixing existing motion).

**Acceptance criteria:**
- [ ] No animation library dependency added — implement with
      `IntersectionObserver` + CSS classes.
- [ ] Verified to no-op completely when `prefers-reduced-motion: reduce` is
      set (test manually via browser dev tools' emulation, or add this to
      the existing Playwright suite under `tests/e2e/`).
- [ ] No layout shift or content that's inaccessible before JS loads (content
      must be visible/readable with JavaScript disabled).

---

## 7. `robots.txt`/sitemap support for a staging-vs-production toggle

**Labels:** `good first issue`, `enhancement`

**Body:**
`app/robots.ts` currently always allows all crawling. Add an environment
variable (e.g. `NEXT_PUBLIC_ALLOW_INDEXING`) that, when explicitly set to
`"false"`, makes `app/robots.ts` disallow all crawling — useful for a staging
deployment on a Vercel preview URL that shouldn't get indexed. Default
behavior (variable unset) must remain "allow all," so existing deployments
are unaffected.

**Acceptance criteria:**
- [ ] Unset env var → current behavior (allow all) unchanged.
- [ ] `NEXT_PUBLIC_ALLOW_INDEXING=false` → `Disallow: /` for all user agents.
- [ ] Documented in the README alongside the existing SEO section.
- [ ] Covered by a unit test (this logic is pure enough to extract into
      `lib/` and test directly, rather than testing `app/robots.ts` itself).

---

## 8. CLI script to scaffold a new `business.config.ts` interactively

**Labels:** `enhancement`, `help wanted`

**Body:**
The "Customize in 10 minutes" README flow is entirely manual (open the file,
edit fields). Add an optional `npm run init` script (Node script under
`scripts/`) that interactively prompts for the required fields (name,
address, phone, timezone, at least one service, brand color) and writes a
starting `business.config.ts`, without touching the example config file
unless the user confirms an overwrite.

**Acceptance criteria:**
- [ ] Running `npm run init` on a fresh clone prompts for each required
      field and writes a valid `business.config.ts` that passes
      `npm run typecheck` and `npm run build` unmodified.
- [ ] Refuses to silently overwrite an existing customized config — asks for
      confirmation or writes to a different filename.
- [ ] No new runtime dependency added to the site itself (a CLI-only
      devDependency like `prompts` or `@inquirer/prompts` is fine).

---

## 9. Design panel: drag-to-reorder sections, image upload, dark mode

**Labels:** `enhancement`, `design-system`

**Body:**
The `/design` panel (see README's "Design system" section) covers preset,
brand color, fonts, radius/shadow/motion/density, header/footer variant, and
per-section enabled+variant — but a few adjacent, genuinely useful pieces are
explicitly out of scope for now and listed here instead of being partially
faked:
- **Reordering**: sections render in a fixed kind-order in the panel; there's
  no drag-and-drop to reorder the actual `sections[]` array. Today, reorder
  by hand in `business.config.ts` (or via "Copy config" + manual reordering).
- **Image upload**: the hero "split-image" variant reads `images.hero` (a
  `public/` path string) from config; the panel has no upload/browse UI for
  it, so previewing a real photo means adding the file to `public/` and
  setting the path in `business.config.ts` first.
- **Dark mode**: the token layer (`lib/theme/tokens.ts`) resolves one
  light-mode palette; there's no `prefers-color-scheme: dark` variant or
  panel toggle for one yet.

**Acceptance criteria:**
- [ ] Sections list in `DesignPanel.tsx` supports drag-and-drop reordering
      that's reflected in both the live preview and the copied snippet.
- [ ] A file input (or paste-a-URL field) in the panel lets you preview a
      real hero image without hand-editing `business.config.ts` first.
- [ ] A `theme.colorScheme` (`"light" | "dark" | "auto"`) config option,
      resolved tokens for both modes, and a panel toggle to preview each.
