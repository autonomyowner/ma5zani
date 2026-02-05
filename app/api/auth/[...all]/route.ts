import { handler } from "@/lib/auth-server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  console.log('[Auth GET]', url.pathname, url.search);
  return handler.GET(request);
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
  return handler.POST(request);
}
