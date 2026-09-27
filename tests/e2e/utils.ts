import type { Page } from "@playwright/test";
import type { PresetKey } from "../../lib/theme/presets";

const BASE_URL = "http://localhost:3100";

/**
 * Sets the `e2e-preset` cookie (only honored when the server was built with
 * `ALLOW_THEME_OVERRIDE=1`, see `playwright.config.ts` / `lib/theme/
 * e2e-override.ts`) so the next navigation renders under `preset` instead of
 * whatever `business.config.ts` itself configures. Must be called before
 * `page.goto(...)`.
 */
export async function setPresetCookie(page: Page, preset: PresetKey): Promise<void> {
  await page.context().addCookies([{ name: "e2e-preset", value: preset, url: BASE_URL }]);
}

/** A representative sample of every statically-distinct page shape. */
export const PAGES_UNDER_TEST = ["/", "/contact", "/services/drain-cleaning"] as const;
