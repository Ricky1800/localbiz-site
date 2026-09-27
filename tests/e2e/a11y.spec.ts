import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { PRESET_KEYS } from "../../lib/theme/presets";
import { PAGES_UNDER_TEST, setPresetCookie } from "./utils";

const SERIOUS_OR_WORSE = new Set(["serious", "critical"]);

for (const preset of PRESET_KEYS) {
  test.describe(`a11y: preset "${preset}"`, () => {
    for (const path of PAGES_UNDER_TEST) {
      test(`${path} has zero serious/critical violations`, async ({ page }) => {
        await setPresetCookie(page, preset);
        await page.goto(path);

        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();

        const seriousOrWorse = results.violations.filter((v) =>
          SERIOUS_OR_WORSE.has(v.impact ?? ""),
        );

        expect(
          seriousOrWorse,
          seriousOrWorse
            .map((v) => `[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))`)
            .join("\n"),
        ).toEqual([]);
      });
    }
  });
}

