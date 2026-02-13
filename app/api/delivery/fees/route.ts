import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { getDeliveryFees } from "@/lib/yalidine";
import { toYalidineId } from "@/lib/yalidine-wilaya-map";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const toWilaya = searchParams.get("toWilaya");
    const deliveryType = searchParams.get("deliveryType") as "office" | "home" | null;

    if (!slug || !toWilaya) {
      return NextResponse.json({ available: false }, { status: 400 });
    }

    // Get seller's delivery credentials via Convex
    const creds = await convex.query(api.delivery.getDeliveryCredentialsBySlug, { slug });

    if (!creds) {
      return NextResponse.json({ available: false });
    }

    // Map wilaya name to Yalidine ID
    const fromWilayaId = parseInt(creds.originWilayaCode, 10);
    const toWilayaId = toYalidineId(toWilaya);

    if (!toWilayaId) {
      return NextResponse.json({ available: false });
    }

    // Call Yalidine API
    const fees = await getDeliveryFees(
      { apiId: creds.apiId, apiToken: creds.apiToken },
      fromWilayaId,
      toWilayaId
    );

    const fee = deliveryType === "home" ? fees.home_fee : fees.desk_fee;

    return NextResponse.json({ available: true, fee });
  } catch (error) {
    console.error("Delivery fee error:", error);
    return NextResponse.json({ available: false });
  }
}
