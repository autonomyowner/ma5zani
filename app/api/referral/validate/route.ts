import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";

// Lazy ConvexHttpClient init (Cloudflare Workers compatible)
let _convex: import("convex/browser").ConvexHttpClient;
function getConvex() {
  if (!_convex) {
    const { ConvexHttpClient } = require("convex/browser");
    _convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  }
  return _convex;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code || code.length !== 6) {
    return NextResponse.json({ valid: false });
  }

  try {
    const result = await getConvex().query(api.referrals.validateReferralCode, {
      code,
    });

    if (result) {
      return NextResponse.json({ valid: true, referrerName: result.name });
    }
    return NextResponse.json({ valid: false });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
