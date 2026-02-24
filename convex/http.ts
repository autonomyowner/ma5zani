import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

// Allowed origins for CORS (web + mobile app)
const ALLOWED_ORIGINS = [
  "https://www.ma5zani.com",
  "https://ma5zani.com",
  "http://localhost:3000",
  "http://localhost:8788",
];

function getCorsHeaders(request?: Request) {
  const origin = request?.headers?.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
  };
}

// Handle OPTIONS preflight requests for auth routes
http.route({
  path: "/api/auth/get-session",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: getCorsHeaders() });
  }),
});

http.route({
  path: "/api/auth/sign-in/email",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: getCorsHeaders() });
  }),
});

http.route({
  path: "/api/auth/sign-up/email",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: getCorsHeaders() });
  }),
});

http.route({
  path: "/api/auth/sign-in/social",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: getCorsHeaders() });
  }),
});

http.route({
  path: "/api/auth/sign-out",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: getCorsHeaders() });
  }),
});

// Custom handler for set-password (better-auth doesn't register this as an HTTP route)
http.route({
  path: "/api/auth/set-password",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const auth = createAuth(ctx);
      const body = await request.json();
      const result = await auth.api.setPassword({
        body: { newPassword: body.newPassword },
        headers: request.headers,
        asResponse: true,
      });
      return result;
    } catch (e: any) {
      return new Response(
        JSON.stringify({ message: e?.message || "Failed to set password" }),
        { status: e?.statusCode || 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

http.route({
  path: "/api/auth/set-password",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: getCorsHeaders() });
  }),
});

// Custom handler for list-accounts (for detecting if user has a password)
http.route({
  path: "/api/auth/list-accounts",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const auth = createAuth(ctx);
      const result = await auth.api.listUserAccounts({
        headers: request.headers,
        asResponse: true,
      });
      return result;
    } catch (e: any) {
      return new Response(
        JSON.stringify({ message: e?.message || "Failed to list accounts" }),
        { status: e?.statusCode || 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

http.route({
  path: "/api/auth/list-accounts",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: getCorsHeaders() });
  }),
});

// ============ YALIDINE WEBHOOK ============

http.route({
  path: "/webhooks/yalidine",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      // Yalidine sends: { tracking, new_status, ... }
      const tracking = body.tracking;
      const newStatus = body.new_status || body.status;

      if (!tracking || !newStatus) {
        return new Response(JSON.stringify({ error: "Missing tracking or status" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      await ctx.runMutation(internal.delivery.handleYalidineWebhook, {
        tracking,
        newStatus,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e: any) {
      console.error("Yalidine webhook error:", e);
      return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

http.route({
  path: "/webhooks/yalidine",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: getCorsHeaders() });
  }),
});

// Register better-auth routes
authComponent.registerRoutes(http, createAuth);

export default http;
