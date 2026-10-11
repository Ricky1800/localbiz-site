import type { NextRequest } from "next/server";
import { x402BotPaywall } from "@/lib/x402-bot-paywall";

/**
 * x402 bot paywall: humans browse free, AI crawlers/scrapers pay per request.
 * See lib/x402-bot-paywall.ts and the "x402 bot paywall" section in README.
 */
export function middleware(req: NextRequest) {
  return x402BotPaywall(req);
}

export const config = {
  runtime: "nodejs",
  // Skip always-free paths (static assets, robots/sitemaps, favicon, llms.txt,
  // .well-known, API routes) so they never touch the middleware.
  matcher: [
    "/((?!_next/static|_next/image|api/|\\.well-known/|robots\\.txt|sitemap[^/]*\\.xml|favicon|llms\\.txt|.*\\.(?:css|js|mjs|map|json|txt|xml|ico|png|jpe?g|gif|webp|avif|svg|bmp|woff2?|ttf|otf|eot|mp4|webm|mp3|wav|pdf|webmanifest)$).*)",
  ],
};
