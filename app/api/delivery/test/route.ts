import { NextResponse } from "next/server";
import { testCredentials } from "@/lib/yalidine";

export async function POST(request: Request) {
  try {
    const { apiId, apiToken } = await request.json();

    if (!apiId || !apiToken) {
      return NextResponse.json({ success: false, error: "Missing credentials" }, { status: 400 });
    }

    const success = await testCredentials({ apiId, apiToken });
    return NextResponse.json({ success });
  } catch {
    return NextResponse.json({ success: false, error: "Test failed" }, { status: 500 });
  }
}
