# Contributing to localbiz-site

Thanks for considering a contribution! This project is a Next.js starter
template meant to stay small, readable, and dependency-light, so contributions
that keep it that way are especially welcome.

## Getting started

```bash
git clone https://github.com/Ricky1800/localbiz-site.git
cd localbiz-site
npm install
npm run dev
```

The site will be running at `http://localhost:3000`, rendering the example
`business.config.ts` ("Maple Street Plumbing").

## Before you open a PR

Run the full check suite locally — CI runs the same four commands:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

All four must pass. If you touched `lib/hours.ts`, `lib/config.ts`, or
`lib/schema-org.ts`, please add or update tests in the matching
`lib/__tests__/*.test.ts` file — these are pure functions and should stay
100% testable without mocking the framework.

## Scope guidelines

- **Keep `business.config.ts` the single source of truth.** New fields belong
  in `lib/config.ts`'s zod schema first, with a sensible default where
  possible, then flow through to the example config, JSON-LD builder, and UI.
- **No backend.** This is a static/SSG-friendly starter with zero required
  infrastructure. Features that require a database, auth, or a persistent
  server belong in a fork, not this repo — see `ROADMAP_ISSUES.md` for the
  kind of scope that *is* a good fit (e.g. an optional webhook integration).
- **Accessibility and SEO are not optional.** Any new UI should keep landmark
  regions, visible focus states, and keyboard operability; any new
  page/section should keep JSON-LD and metadata in sync.
- **No new dependencies without discussion.** Open an issue first if you think
  the project needs one — the goal is to stay easy to audit and easy to fork.

## Commit style

This repo uses [Conventional Commits](https://www.conventionalcommits.org/)
(`feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`). Keep commits
focused — one logical change per commit.

## Code style

- TypeScript strict mode; avoid `any`.
- Prefer server components; only mark a component `"use client"` when it
  genuinely needs interactivity, state, or browser-only APIs.
- Run `npm run lint` before pushing — it also runs in CI and will block merge.

## Reporting bugs / requesting features

Please use the issue templates under `.github/ISSUE_TEMPLATE/`. See
`ROADMAP_ISSUES.md` for a list of known good first issues if you're looking
for somewhere to start.
