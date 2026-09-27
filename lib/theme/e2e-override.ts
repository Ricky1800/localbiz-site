import { cookies } from "next/headers";
import { PRESET_KEYS, type PresetKey } from "./presets";

/**
 * Lets the Playwright suite render every page under every preset without
 * rebuilding the site 8 times: when explicitly enabled at build time via
 * `ALLOW_THEME_OVERRIDE=1` (see `playwright.config.ts`'s `webServer.env`),
 * an `e2e-preset` cookie can force which preset `app/layout.tsx` resolves,
 * bypassing `business.config.ts`'s own `theme` entirely for that request.
 *
 * This is intentionally NOT reachable in a normal production build: the
 * `OVERRIDE_ENABLED` check below is a plain runtime branch around the
 * `cookies()` call (a Next.js "dynamic API"). Next determines whether a
 * route is static or dynamic by observing which APIs are actually invoked
 * while attempting to statically render it — when `ALLOW_THEME_OVERRIDE`
 * is unset (the default for `npm run build`/any real deployment), this
 * branch is never taken, `cookies()` is never called, and every page stays
 * fully static, exactly as before this file existed.
 */
const OVERRIDE_ENABLED = process.env.ALLOW_THEME_OVERRIDE === "1";

export async function getE2EPresetOverride(): Promise<PresetKey | null> {
  if (!OVERRIDE_ENABLED) return null;

  const store = await cookies();
  const value = store.get("e2e-preset")?.value;
  if (value && (PRESET_KEYS as readonly string[]).includes(value)) {
    return value as PresetKey;
  }
  return null;
}
