/**
 * x402 bot paywall.
 *
 * Humans browse for free. Known AI crawlers / scrapers get an HTTP 402 with
 * x402 payment requirements; if they attach a valid payment, it is verified
 * and settled through the facilitator and the page is served normally.
 *
 * Fails open: any error (facilitator outage, misconfiguration, ...) serves
 * the page as if the paywall didn't exist.
 */
import { NextResponse, type NextRequest } from "next/server";
import {
  FacilitatorResponseError,
  HTTPFacilitatorClient,
  x402HTTPResourceServer,
  x402ResourceServer,
  type FacilitatorClient,
  type FacilitatorConfig,
  type HTTPRequestContext,
} from "@x402/core/server";
import { decodePaymentRequiredHeader } from "@x402/core/http";
import { SettleError, VerifyError, type Network } from "@x402/core/types";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { NextAdapter } from "@x402/next";

// ---------------------------------------------------------------------------
// Config (all env-overridable)
// ---------------------------------------------------------------------------

const DEFAULT_PAY_TO = "0x0ba3b8796ce61ef8Cbd11A7F33Be31F1Fd4A03B3";
const DEFAULT_PRICE = "$0.001";
const DEFAULT_NETWORK = "eip155:8453"; // Base mainnet (USDC)
const DEFAULT_FACILITATOR_URL = "https://x402.org/facilitator";
const DESCRIPTION = "Paid access for automated agents";

function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function isPaywallEnabled(): boolean {
  return env("X402_ENABLED")?.toLowerCase() !== "false";
}

// ---------------------------------------------------------------------------
// Bot detection (case-insensitive User-Agent substring match)
// ---------------------------------------------------------------------------

export const BOT_UA_PATTERNS = {
  /** Charged per request. */
  charge: [
    "GPTBot",
    "ChatGPT-User",
    "OAI-SearchBot",
    "ClaudeBot",
    "Claude-User",
    "Claude-SearchBot",
    "anthropic-ai",
    "CCBot",
    "PerplexityBot",
    "Perplexity-User",
    "Bytespider",
    "Amazonbot",
    "Applebot-Extended",
    "Google-Extended",
    "Meta-ExternalAgent",
    "meta-externalfetcher",
    "FacebookBot",
    "Diffbot",
    "cohere-ai",
    "cohere-training-data-crawler",
    "YouBot",
    "AI2Bot",
    "Ai2Bot-Dolma",
    "Timpibot",
    "ImagesiftBot",
    "omgili",
    "PetalBot",
    "Scrapy",
    "python-requests",
    "aiohttp",
    "Go-http-client",
    "curl",
    "wget",
    "HeadlessChrome",
    "PhantomJS",
  ],
  /** Always free; checked before `charge`. */
  neverCharge: [
    "Googlebot",
    "Bingbot",
    "DuckDuckBot",
    "Slurp",
    "Applebot", // plain Applebot only — "Applebot-Extended" is handled below
    "Twitterbot",
    "facebookexternalhit",
    "LinkedInBot",
    "Slackbot",
    "Discordbot",
    "WhatsApp",
    "TelegramBot",
    "Vercel",
    // uptime monitors
    "UptimeRobot",
    "Pingdom",
    "StatusCake",
    "BetterUptime",
    "Better Uptime",
    "Better Stack",
    "Site24x7",
    "Datadog",
    "Checkly",
    "uptime",
  ],
} as const;

const CHARGE_LC = BOT_UA_PATTERNS.charge.map((p) => p.toLowerCase());
const NEVER_CHARGE_LC = BOT_UA_PATTERNS.neverCharge.map((p) => p.toLowerCase());

/** True when the User-Agent belongs to a bot that should be charged. */
export function isChargeableBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  // "Applebot" (free) is a substring of "Applebot-Extended" (charged).
  if (ua.includes("applebot-extended")) return true;
  if (NEVER_CHARGE_LC.some((p) => ua.includes(p))) return false;
  return CHARGE_LC.some((p) => ua.includes(p));
}

// ---------------------------------------------------------------------------
// Always-free paths (also excluded via the middleware matcher)
// ---------------------------------------------------------------------------

const FREE_PATH_RE =
  /^\/(?:robots\.txt$|sitemap[^/]*\.xml$|favicon|llms\.txt$|\.well-known\/|_next\/|api\/|images\/|fonts\/|static\/|assets\/)/i;
const STATIC_EXT_RE =
  /\.(?:css|js|mjs|map|json|txt|xml|ico|png|jpe?g|gif|webp|avif|svg|bmp|woff2?|ttf|otf|eot|mp4|webm|mp3|wav|pdf|webmanifest)$/i;

export function isFreePath(pathname: string): boolean {
  return FREE_PATH_RE.test(pathname) || STATIC_EXT_RE.test(pathname);
}

// ---------------------------------------------------------------------------
// x402 resource server (lazy singleton)
// ---------------------------------------------------------------------------

async function createFacilitatorConfig(): Promise<FacilitatorConfig> {
  const cdpKeyId = env("CDP_API_KEY_ID");
  const cdpKeySecret = env("CDP_API_KEY_SECRET");
  if (cdpKeyId && cdpKeySecret) {
    // Coinbase CDP facilitator (authenticated): https://api.cdp.coinbase.com/platform/v2/x402
    const { createFacilitatorConfig: createCdpFacilitatorConfig } = await import("@coinbase/x402");
    return createCdpFacilitatorConfig(cdpKeyId, cdpKeySecret);
  }
  return { url: env("X402_FACILITATOR_URL") ?? DEFAULT_FACILITATOR_URL };
}

/**
 * Wraps a facilitator client so that outages (network errors, 5xx, timeouts)
 * surface as FacilitatorResponseError. The x402 HTTP server rethrows that
 * error type instead of turning it into a 402, which lets the paywall fail
 * open. Genuine "payment invalid" answers (VerifyError / SettleError) pass
 * through unchanged and still result in a 402.
 */
function failOpenOnOutage(client: FacilitatorClient): FacilitatorClient {
  const asOutage = (error: unknown): never => {
    if (
      error instanceof VerifyError ||
      error instanceof SettleError ||
      error instanceof FacilitatorResponseError
    ) {
      throw error;
    }
    throw new FacilitatorResponseError(
      `Facilitator unavailable: ${error instanceof Error ? error.message : String(error)}`,
    );
  };
  return {
    verify: (payload, requirements) => client.verify(payload, requirements).catch(asOutage),
    settle: (payload, requirements) => client.settle(payload, requirements).catch(asOutage),
    getSupported: () => client.getSupported(),
  };
}

interface Paywall {
  httpServer: x402HTTPResourceServer;
  init: () => Promise<void>;
}

let paywallPromise: Promise<Paywall> | null = null;

async function buildPaywall(): Promise<Paywall> {
  const network = (env("X402_NETWORK") ?? DEFAULT_NETWORK) as Network;
  const facilitator = failOpenOnOutage(
    new HTTPFacilitatorClient({
      ...(await createFacilitatorConfig()),
      timeoutMs: 10_000,
    }),
  );
  const resourceServer = new x402ResourceServer(facilitator).register(
    network,
    new ExactEvmScheme(),
  );
  const httpServer = new x402HTTPResourceServer(resourceServer, {
    "/*": {
      accepts: {
        scheme: "exact",
        price: env("X402_PRICE") ?? DEFAULT_PRICE,
        network,
        payTo: env("X402_PAY_TO") ?? DEFAULT_PAY_TO,
      },
      description: DESCRIPTION,
      mimeType: "text/html",
    },
  });

  // Sync supported kinds from the facilitator once; retry on the next request
  // after a failure (the caller fails open meanwhile).
  let initPromise: Promise<void> | null = null;
  const init = async () => {
    initPromise ??= httpServer.initialize().catch((error: unknown) => {
      initPromise = null;
      throw error;
    });
    await initPromise;
  };

  return { httpServer, init };
}

function getPaywall(): Promise<Paywall> {
  paywallPromise ??= buildPaywall().catch((error: unknown) => {
    paywallPromise = null;
    throw error;
  });
  return paywallPromise;
}

/** Bots are API clients: never serve them the HTML paywall UI, always JSON. */
class BotAdapter extends NextAdapter {
  getAcceptHeader(): string {
    return "application/json";
  }
}

function jsonResponse(status: number, headers: Record<string, string>, body: unknown): NextResponse {
  return new NextResponse(JSON.stringify(body ?? {}), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

/**
 * Runs the paywall for a request. Returns `NextResponse.next()` (optionally
 * carrying the x402 settlement header) when the page should be served, or a
 * 402 response with payment requirements.
 */
export async function x402BotPaywall(req: NextRequest): Promise<NextResponse> {
  if (
    !isPaywallEnabled() ||
    isFreePath(req.nextUrl.pathname) ||
    !isChargeableBot(req.headers.get("user-agent"))
  ) {
    return NextResponse.next();
  }

  try {
    const { httpServer, init } = await getPaywall();
    await init();

    const adapter = new BotAdapter(req);
    const context: HTTPRequestContext = {
      adapter,
      path: req.nextUrl.pathname,
      method: req.method,
      paymentHeader: adapter.getHeader("payment-signature") ?? adapter.getHeader("x-payment"),
    };

    const result = await httpServer.processHTTPRequest(context);

    switch (result.type) {
      case "no-payment-required":
        return NextResponse.next();

      case "payment-error": {
        const { status, headers, body } = result.response;
        // v2 carries the requirements in the PAYMENT-REQUIRED header; mirror
        // them in the JSON body so plain HTTP clients can read them too.
        const encoded = headers["PAYMENT-REQUIRED"];
        const isEmptyBody =
          body == null || (typeof body === "object" && Object.keys(body).length === 0);
        return jsonResponse(
          status,
          headers,
          encoded && isEmptyBody ? decodePaymentRequiredHeader(encoded) : body,
        );
      }

      case "payment-verified": {
        const settlement = await httpServer.processSettlement(
          result.paymentPayload,
          result.paymentRequirements,
          result.declaredExtensions,
          { request: context },
          undefined,
          result.beforeHandlerSettlement,
        );
        if (!settlement.success) {
          const { status, headers, body } = settlement.response;
          return jsonResponse(status, headers, body);
        }
        const res = NextResponse.next();
        for (const [key, value] of Object.entries(settlement.headers)) {
          res.headers.set(key, value);
        }
        res.headers.set("Cache-Control", "private, no-store");
        return res;
      }
    }
  } catch (error) {
    // FAIL OPEN: never break the site because of the paywall.
    console.error("[x402-bot-paywall] failing open:", error);
  }
  return NextResponse.next();
}
