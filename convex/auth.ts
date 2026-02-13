import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { QueryCtx, MutationCtx } from "./_generated/server";
import { betterAuth } from "better-auth";
import authConfig from "./auth.config";

// baseURL must point to the FRONTEND (Next.js) URL, not Convex
// OAuth callbacks go to Next.js /api/auth/* which proxies to Convex
const siteUrl = process.env.SITE_URL || "http://localhost:3000";

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    trustedOrigins: [
      "https://www.ma5zani.com",
      "https://ma5zani.com",
      "http://localhost:3000",
      "exp://",
      "ma5zani://",
    ],
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      minPasswordLength: 8,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
    plugins: [convex({ authConfig })],
  });
};

// Get authenticated seller (replaces getCurrentSeller)
export async function getAuthenticatedSeller(ctx: QueryCtx | MutationCtx) {
  try {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser || !authUser.email) return null;

    const seller = await ctx.db
      .query("sellers")
      .withIndex("by_email", (q) => q.eq("email", authUser.email))
      .first();
    return seller;
  } catch {
    return null;
  }
}

// Alias for backwards compatibility
export const getCurrentSeller = getAuthenticatedSeller;

export async function requireSeller(ctx: QueryCtx | MutationCtx) {
  const seller = await getAuthenticatedSeller(ctx);
  if (!seller) {
    throw new Error("Seller not found. Please complete onboarding.");
  }
  return seller;
}

// Get auth user directly (for onboarding)
export async function getAuthUser(ctx: QueryCtx | MutationCtx) {
  try {
    return await authComponent.getAuthUser(ctx);
  } catch {
    return null;
  }
}
