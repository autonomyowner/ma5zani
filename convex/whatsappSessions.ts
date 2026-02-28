import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedSeller, requireActiveSeller } from "./auth";

// Get WhatsApp session for current seller
export const getSession = query({
  args: {},
  handler: async (ctx) => {
    const seller = await getAuthenticatedSeller(ctx);
    if (!seller) return null;

    return await ctx.db
      .query("whatsappSessions")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .first();
  },
});

// Upsert WhatsApp session (called from API route)
export const upsertSession = mutation({
  args: {
    sellerId: v.id("sellers"),
    status: v.union(
      v.literal("connected"),
      v.literal("disconnected"),
      v.literal("qr_pending")
    ),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("whatsappSessions")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        phoneNumber: args.phoneNumber || existing.phoneNumber,
        ...(args.status === "connected" ? { connectedAt: Date.now() } : {}),
        lastSeenAt: Date.now(),
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("whatsappSessions", {
      sellerId: args.sellerId,
      status: args.status,
      phoneNumber: args.phoneNumber,
      connectedAt: args.status === "connected" ? Date.now() : undefined,
      lastSeenAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Disconnect (from dashboard)
export const disconnectSession = mutation({
  args: {},
  handler: async (ctx) => {
    const seller = await requireActiveSeller(ctx);

    const session = await ctx.db
      .query("whatsappSessions")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .first();

    if (session) {
      await ctx.db.patch(session._id, {
        status: "disconnected",
        updatedAt: Date.now(),
      });
    }
  },
});
