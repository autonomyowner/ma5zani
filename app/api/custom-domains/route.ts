import { NextRequest, NextResponse } from "next/server";

const CF_API = "https://api.cloudflare.com/client/v4";

async function cfFetch(path: string, options: RequestInit = {}) {
  const token = process.env.CLOUDFLARE_CUSTOM_HOSTNAME_API_TOKEN;
  if (!token) throw new Error("Missing CLOUDFLARE_CUSTOM_HOSTNAME_API_TOKEN");

  const res = await fetch(`${CF_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  return res.json();
}

// POST — Provision custom hostname on Cloudflare
// Body: { hostname: string }
// Returns: { cloudflareHostnameId, sslStatus } or error
export async function POST(request: NextRequest) {
  try {
    const { hostname } = await request.json();
    if (!hostname) {
      return NextResponse.json({ error: "Missing hostname" }, { status: 400 });
    }

    const zoneId = process.env.CLOUDFLARE_ZONE_ID;
    if (!zoneId) {
      // No zone ID — return pending status (domain record already in Convex)
      return NextResponse.json({
        cloudflareHostnameId: null,
        sslStatus: "pending",
        message: "CLOUDFLARE_ZONE_ID not configured. Domain saved but not provisioned.",
      });
    }

    const cfResult = await cfFetch(`/zones/${zoneId}/custom_hostnames`, {
      method: "POST",
      body: JSON.stringify({
        hostname: hostname.toLowerCase().trim(),
        ssl: {
          method: "http",
          type: "dv",
          settings: {
            min_tls_version: "1.2",
          },
        },
      }),
    });

    if (cfResult.success && cfResult.result) {
      return NextResponse.json({
        cloudflareHostnameId: cfResult.result.id,
        sslStatus: cfResult.result.ssl?.status || "pending",
      });
    }

    const errors = cfResult.errors?.map((e: any) => e.message) || ["Unknown Cloudflare error"];
    return NextResponse.json({ error: errors.join(", "), errors }, { status: 500 });
  } catch (error) {
    console.error("Custom domain POST error:", error);
    return NextResponse.json({ error: "Failed to provision domain" }, { status: 500 });
  }
}

// GET — Check custom hostname status on Cloudflare
// Params: cloudflareHostnameId
// Returns: { status, sslStatus, cloudflareStatus }
export async function GET(request: NextRequest) {
  try {
    const cloudflareHostnameId = request.nextUrl.searchParams.get("cloudflareHostnameId");
    if (!cloudflareHostnameId) {
      return NextResponse.json({ error: "Missing cloudflareHostnameId" }, { status: 400 });
    }

    const zoneId = process.env.CLOUDFLARE_ZONE_ID;
    if (!zoneId) {
      return NextResponse.json({ error: "CLOUDFLARE_ZONE_ID not configured" }, { status: 500 });
    }

    const cfResult = await cfFetch(`/zones/${zoneId}/custom_hostnames/${cloudflareHostnameId}`);

    if (!cfResult.success) {
      return NextResponse.json({ error: "Failed to check domain status" }, { status: 500 });
    }

    const cfStatus = cfResult.result.status;
    const sslStatus = cfResult.result.ssl?.status || "unknown";

    // Map Cloudflare status to our status
    let status: "pending" | "pending_validation" | "active" | "failed";
    if (cfStatus === "active" && (sslStatus === "active" || sslStatus === "active_certificate")) {
      status = "active";
    } else if (cfStatus === "pending" || sslStatus === "pending_validation" || sslStatus === "pending_issuance") {
      status = "pending_validation";
    } else if (cfStatus === "moved" || cfStatus === "deleted") {
      status = "failed";
    } else {
      status = "pending_validation";
    }

    return NextResponse.json({ status, sslStatus, cloudflareStatus: cfStatus });
  } catch (error) {
    console.error("Custom domain GET error:", error);
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
  }
}

// DELETE — Remove custom hostname from Cloudflare
// Body: { cloudflareHostnameId: string }
export async function DELETE(request: NextRequest) {
  try {
    const { cloudflareHostnameId } = await request.json();
    if (!cloudflareHostnameId) {
      return NextResponse.json({ success: true }); // Nothing to delete on CF side
    }

    const zoneId = process.env.CLOUDFLARE_ZONE_ID;
    if (!zoneId) {
      return NextResponse.json({ success: true }); // Can't delete without zone ID
    }

    await cfFetch(`/zones/${zoneId}/custom_hostnames/${cloudflareHostnameId}`, {
      method: "DELETE",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Custom domain DELETE error:", error);
    return NextResponse.json({ error: "Failed to remove domain from Cloudflare" }, { status: 500 });
  }
}
