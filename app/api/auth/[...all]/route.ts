import { handler } from "@/lib/auth-server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  console.log('[Auth GET]', url.pathname, url.search?.substring(0, 200));

  // Log ALL cookies for debugging OAuth callback
  const cookies = request.headers.get('cookie');
  console.log('[Auth GET] Request Cookies:', cookies || 'NONE');

  const response = await handler.GET(request);

  // Log ALL response headers
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value.substring(0, 200);
  });
  console.log('[Auth GET] Response Headers:', JSON.stringify(headers));
  console.log('[Auth GET] Response Status:', response.status);

  return response;
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  console.log('[Auth POST]', url.pathname);

  try {
    const clonedRequest = request.clone();
    const body = await clonedRequest.text();
    console.log('[Auth POST] Body:', body.substring(0, 200));
  } catch (e) {
    console.log('[Auth POST] Could not read body');
  }

  const response = await handler.POST(request);

  // Log ALL response headers
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value.substring(0, 200);
  });
  console.log('[Auth POST] Response Headers:', JSON.stringify(headers));
  console.log('[Auth POST] Response Status:', response.status);

  return response;
}
