import { handler } from "@/lib/auth-server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  console.log('[Auth GET]', url.pathname, url.search);

  // Log cookies for debugging OAuth callback
  const cookies = request.headers.get('cookie');
  console.log('[Auth GET Cookies]', cookies?.substring(0, 500) || 'NO COOKIES');

  const response = await handler.GET(request);

  // Log response headers for debugging
  const setCookie = response.headers.get('set-cookie');
  console.log('[Auth GET Response Set-Cookie]', setCookie?.substring(0, 500) || 'NO SET-COOKIE');
  console.log('[Auth GET Response Status]', response.status);

  return response;
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  console.log('[Auth POST]', url.pathname);

  try {
    const clonedRequest = request.clone();
    const body = await clonedRequest.text();
    console.log('[Auth POST Body]', body.substring(0, 200));
  } catch (e) {
    console.log('[Auth POST] Could not read body');
  }

  const response = await handler.POST(request);

  // Log response headers for debugging
  const setCookie = response.headers.get('set-cookie');
  console.log('[Auth POST Response Set-Cookie]', setCookie?.substring(0, 500) || 'NO SET-COOKIE');
  console.log('[Auth POST Response Status]', response.status);

  return response;
}
