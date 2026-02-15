import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { api } from "@/convex/_generated/api";

// Reserved subdomains that should not be treated as store slugs
const RESERVED_SUBDOMAINS = new Set([
  "www", "api", "admin", "dashboard", "mail", "smtp",
  "ftp", "cdn", "static", "dev", "staging", "app",
]);

// In-memory cache for custom domain → slug resolution (5min TTL)
const domainCache = new Map<string, { slug: string; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Lazy-init ConvexHttpClient (Workers-compatible pattern)
let _convex: import("convex/browser").ConvexHttpClient;
function getConvex() {
  if (!_convex) {
    const { ConvexHttpClient } = require("convex/browser");
    _convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  }
  return _convex;
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0]; // Strip port for localhost

  // 1. Redirect non-www ma5zani.com to www
  if (hostname === "ma5zani.com") {
    const url = new URL(request.url);
    url.hostname = "www.ma5zani.com";
    return NextResponse.redirect(url, 301);
  }

  // 2. Main site (www.ma5zani.com or localhost) — pass through
  if (hostname === "www.ma5zani.com" || hostname === "localhost") {
    return NextResponse.next();
  }

  // 3. Subdomain: X.ma5zani.com → rewrite to /X/...
  if (hostname.endsWith(".ma5zani.com")) {
    const subdomain = hostname.replace(".ma5zani.com", "");

    if (RESERVED_SUBDOMAINS.has(subdomain)) {
      return NextResponse.next();
    }

    // Rewrite: subdomain.ma5zani.com/path → /subdomain/path
    const url = request.nextUrl.clone();
    const path = url.pathname;
    url.pathname = `/${subdomain}${path}`;
    return NextResponse.rewrite(url);
  }

  // 4. Custom domain: mystore.com → resolve slug from Convex
  const now = Date.now();

  // Clean up expired cache entries (no setInterval on Workers)
  if (domainCache.size > 200) {
    for (const [key, val] of domainCache) {
      if (now > val.expiresAt) domainCache.delete(key);
    }
  }

  // Check cache first
  const cached = domainCache.get(hostname);
  if (cached && now < cached.expiresAt) {
    const url = request.nextUrl.clone();
    url.pathname = `/${cached.slug}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Cache miss — query Convex
  try {
    const result = await getConvex().query(api.customDomains.getStorefrontSlugByDomain, {
      hostname,
    });

    if (result && result.slug) {
      domainCache.set(hostname, { slug: result.slug, expiresAt: now + CACHE_TTL });
      const url = request.nextUrl.clone();
      url.pathname = `/${result.slug}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  } catch (err) {
    console.error("Custom domain resolution failed:", err);
  }

  // Domain not found — pass through (will likely 404)
  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
