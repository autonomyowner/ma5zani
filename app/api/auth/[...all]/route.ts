import { handler } from "@/lib/auth-server";
import { NextRequest, NextResponse } from "next/server";

// Helper to fix cookie domain from Convex to our domain
function fixCookieDomain(response: Response): Response {
  const setCookieHeader = response.headers.get('set-cookie');
  if (!setCookieHeader) return response;

  // Log original cookie for debugging
  console.log('[Auth] Original Set-Cookie:', setCookieHeader.substring(0, 300));

  // Remove any domain attribute from the cookie so it defaults to current domain
  // Also ensure SameSite=Lax for OAuth redirects
  const fixedCookie = setCookieHeader
    .split(', ')
    .map(cookie => {
      // Remove domain=xxx.convex.site
      let fixed = cookie.replace(/;\s*domain=[^;]*/gi, '');
      // Ensure SameSite=Lax (not Strict) for OAuth
      if (!fixed.toLowerCase().includes('samesite=')) {
        fixed += '; SameSite=Lax';
      }
      return fixed;
    })
    .join(', ');

  console.log('[Auth] Fixed Set-Cookie:', fixedCookie.substring(0, 300));

  // Create new response with fixed headers
  const newHeaders = new Headers(response.headers);
  newHeaders.set('set-cookie', fixedCookie);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  console.log('[Auth GET]', url.pathname);

  // Log cookies for debugging
  const cookies = request.headers.get('cookie');
  console.log('[Auth GET] Cookies:', cookies?.substring(0, 200) || 'NONE');

  const response = await handler.GET(request);
  console.log('[Auth GET] Status:', response.status);

  return fixCookieDomain(response);
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  console.log('[Auth POST]', url.pathname);

  const response = await handler.POST(request);
  console.log('[Auth POST] Status:', response.status);

  return fixCookieDomain(response);
}
