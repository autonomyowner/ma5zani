import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  return NextResponse.next();  // Pass through - client handles auth
}

export const config = {
  matcher: [],  // Disabled
};
