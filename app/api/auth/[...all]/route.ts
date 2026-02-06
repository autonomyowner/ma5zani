import { handler } from "@/lib/auth-server";
import { NextRequest } from "next/server";

// Use the official handler but intercept and fix cookies
async function handleWithCookieFix(request: NextRequest, method: "GET" | "POST"): Promise<Response> {
  const url = new URL(request.url);
  console.log(`[Auth ${method}]`, url.pathname);

  // Log incoming cookies
  const cookies = request.headers.get("cookie");
  if (cookies) {
    console.log("[Auth] Request cookies:", cookies.substring(0, 150));
  }

  // Call the official handler
  const response = method === "GET"
    ? await handler.GET(request)
    : await handler.POST(request);

  console.log("[Auth] Response status:", response.status);

  // Get Set-Cookie headers using getSetCookie() for proper handling
  const setCookies = (response.headers as any).getSetCookie?.() || [];
  const singleCookie = response.headers.get("set-cookie");

  console.log("[Auth] getSetCookie count:", setCookies.length);
  if (singleCookie) {
    console.log("[Auth] set-cookie header:", singleCookie.substring(0, 200));
  }

  // If no cookies to fix, return as-is
  if (setCookies.length === 0 && !singleCookie) {
    return response;
  }

  // Fix cookies by removing domain
  const allCookies = setCookies.length > 0 ? setCookies : (singleCookie ? singleCookie.split(/, (?=[^;]+=)/) : []);

  const newHeaders = new Headers();
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "set-cookie") {
      newHeaders.set(key, value);
    }
  });

  for (const cookie of allCookies) {
    // Remove domain so cookie defaults to current domain
    let fixed = cookie.replace(/;\s*domain=[^;]*/gi, "");
    if (!fixed.toLowerCase().includes("samesite=")) {
      fixed += "; SameSite=Lax";
    }
    console.log("[Auth] Fixed cookie:", fixed.substring(0, 100));
    newHeaders.append("Set-Cookie", fixed);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

export async function GET(request: NextRequest) {
  return handleWithCookieFix(request, "GET");
}

export async function POST(request: NextRequest) {
  return handleWithCookieFix(request, "POST");
}
