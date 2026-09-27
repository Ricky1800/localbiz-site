import { expect, test } from "@playwright/test";

test.describe("/design in a production build", () => {
  test("returns 404 (the live design panel is dev-only)", async ({ page }) => {
    const response = await page.goto("/design");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /page not found/i })).toBeVisible();
  });

  test("the rest of the site still serves normally", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  });
});
