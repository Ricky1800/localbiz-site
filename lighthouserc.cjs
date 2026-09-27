/**
 * Lighthouse CI config — run locally with `npm run lhci` (builds, starts a
 * production server, audits it, and asserts the budgets below) or via the
 * `lighthouse-ci` job in `.github/workflows/ci.yml`.
 *
 * Budgets match the project's stated targets: a local-business site should
 * be fast and fully indexable/accessible by default, not just "pretty
 * good." These run against the *default* production build (no theme
 * override), i.e. exactly what a real visitor gets.
 */
module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run build && npm run start",
      startServerReadyPattern: "Ready in",
      startServerReadyTimeout: 120_000,
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/contact",
        "http://localhost:3000/services/drain-cleaning",
      ],
      numberOfRuns: 3,
      settings: {
        preset: "desktop",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
