import { expect, test } from "@playwright/test";
import { PRESET_KEYS } from "../../lib/theme/presets";
import { setPresetCookie } from "./utils";

/**
 * A visual *smoke* check per preset — not pixel-diff visual regression
 * (which is brittle across OS/font-rendering environments for a project
 * with no committed baseline images). Each screenshot is attached to the
 * HTML report as a look-at-it artifact, and the test also asserts the page
 * actually rendered real content (not a blank/error page) and that the
 * resolved brand color made it into the page's CSS custom properties.
 */
for (const preset of PRESET_KEYS) {
  test(`visual smoke: "${preset}" renders the homepage`, async ({ page }, testInfo) => {
    await setPresetCookie(page, preset);
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();

    const primaryColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--t-primary").trim(),
    );
    expect(primaryColor).toMatch(/^#[0-9a-f]{6}$/i);

    const screenshot = await page.screenshot({ fullPage: true });
    await testInfo.attach(`${preset}-homepage`, { body: screenshot, contentType: "image/png" });
  });
}
