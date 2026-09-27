import { defineConfig, devices } from "@playwright/test";

/**
 * Runs the whole suite (a11y matrix, visual smoke screenshots, and the
 * `/design` dev-only-404 check) against a single production build+server,
 * built with `ALLOW_THEME_OVERRIDE=1` so tests can switch presets per-page
 * via an `e2e-preset` cookie (see `lib/theme/e2e-override.ts`) instead of
 * rebuilding the site once per preset. This flag has no effect on
 * `/design`'s dev-only 404 behavior (that only checks `NODE_ENV`), and a
 * normal `npm run build` (no env var) never takes this code path at all —
 * see that file for why this doesn't affect the real production build.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  outputDir: "test-results",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run build && npm run start -- -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { ALLOW_THEME_OVERRIDE: "1" },
  },
});
