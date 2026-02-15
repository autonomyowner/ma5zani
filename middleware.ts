import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Redirect non-www to www
  if (request.headers.get("host") === "ma5zani.com") {
    const url = new URL(request.url);
    url.hostname = "www.ma5zani.com";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
