import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_SITE_URL || "https://colorless-cricket-513.convex.site";

// Custom handler that properly forwards cookies between frontend and Convex
async function proxyToConvex(request: NextRequest, method: "GET" | "POST"): Promise<Response> {
  const url = new URL(request.url);
  const convexUrl = `${CONVEX_SITE_URL}${url.pathname}${url.search}`;

  console.log(`[Auth ${method}]`, url.pathname);

  // Forward the request to Convex
  const headers = new Headers();
  headers.set("Content-Type", request.headers.get("content-type") || "application/json");
  headers.set("Accept", "application/json");

  // Forward cookies from the browser to Convex
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    headers.set("Cookie", cookieHeader);
    console.log("[Auth] Forwarding cookies to Convex:", cookieHeader.substring(0, 100));
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
    redirect: "manual",
  };

  if (method === "POST") {
    fetchOptions.body = await request.text();
  }

  const convexResponse = await fetch(convexUrl, fetchOptions);

  console.log("[Auth] Convex response status:", convexResponse.status);

  // Get all Set-Cookie headers from Convex response
  // Node 18+ supports getSetCookie() for multiple Set-Cookie headers
  const setCookies = (convexResponse.headers as any).getSetCookie?.() || [];
  console.log("[Auth] Set-Cookie headers from Convex:", setCookies.length, setCookies.map((c: string) => c.substring(0, 80)));

  // Also try the standard way
  const singleSetCookie = convexResponse.headers.get("set-cookie");
  if (singleSetCookie) {
    console.log("[Auth] Single Set-Cookie header:", singleSetCookie.substring(0, 200));
  }

  // Build response with proper cookie handling
  const responseHeaders = new Headers();

  // Copy most headers from Convex response
  convexResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "set-cookie") {
      responseHeaders.set(key, value);
    }
  });

  // Handle Set-Cookie headers - strip domain and forward to browser
  const allCookies = setCookies.length > 0 ? setCookies : (singleSetCookie ? [singleSetCookie] : []);

  for (const cookie of allCookies) {
    // Remove domain attribute so cookie is set for current domain
    let fixedCookie = cookie.replace(/;\s*domain=[^;]*/gi, "");
    // Ensure SameSite=Lax for OAuth
    if (!fixedCookie.toLowerCase().includes("samesite=")) {
      fixedCookie += "; SameSite=Lax";
    }
    console.log("[Auth] Setting cookie:", fixedCookie.substring(0, 100));
    responseHeaders.append("Set-Cookie", fixedCookie);
  }

  const body = await convexResponse.text();

  return new Response(body, {
    status: convexResponse.status,
    statusText: convexResponse.statusText,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest) {
  return proxyToConvex(request, "GET");
}

export async function POST(request: NextRequest) {
  return proxyToConvex(request, "POST");
}
