import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentSeller, getAuthUser, requireSeller } from "./auth";

export const getCurrentSellerProfile = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentSeller(ctx);
  },
});

export const upsertSeller = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    plan: v.union(v.literal("basic"), v.literal("plus"), v.literal("gros")),
  },
  handler: async (ctx, args) => {
    const authUser = await getAuthUser(ctx);
    if (!authUser || !authUser.email) {
      throw new Error("Unauthorized");
    }

    // Use email from auth user, not from args (security)
    const email = authUser.email;

    const existingSeller = await ctx.db
      .query("sellers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    const now = Date.now();

    if (existingSeller) {
      await ctx.db.patch(existingSeller._id, {
        name: args.name,
        phone: args.phone,
        plan: args.plan,
        updatedAt: now,
      });
      return existingSeller._id;
    }

    // Generate unique 6-char referral code
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let referralCode = "";
    let isUnique = false;
    while (!isUnique) {
      referralCode = "";
      for (let i = 0; i < 6; i++) {
        referralCode += chars[Math.floor(Math.random() * chars.length)];
      }
      const existing = await ctx.db
        .query("sellers")
        .withIndex("by_referralCode", (q) => q.eq("referralCode", referralCode))
        .first();
      if (!existing) isUnique = true;
    }

    const sellerId = await ctx.db.insert("sellers", {
      email,
      name: args.name,
      phone: args.phone,
      plan: args.plan,
      isActivated: false,
      emailNotifications: true,
      trialEndsAt: now + 14 * 24 * 60 * 60 * 1000,
      referralCode,
      referralEarnings: 0,
      referralCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return sellerId;
  },
});

// Query to get seller by ID (for internal API use)
export const getSellerById = query({
  args: { sellerId: v.id("sellers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sellerId);
  },
});

export const updateSellerProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    businessAddress: v.optional(v.object({
      street: v.string(),
      wilaya: v.string(),
      postalCode: v.string(),
    })),
    plan: v.optional(v.union(v.literal("basic"), v.literal("plus"), v.literal("gros"))),
  },
  handler: async (ctx, args) => {
    const seller = await getCurrentSeller(ctx);
    if (!seller) {
      throw new Error("Seller not found");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.businessAddress !== undefined) updates.businessAddress = args.businessAddress;
    if (args.plan !== undefined) updates.plan = args.plan;

    await ctx.db.patch(seller._id, updates);
    return seller._id;
  },
});

export const toggleEmailNotifications = mutation({
  args: { enabled: v.boolean() },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);
    await ctx.db.patch(seller._id, {
      emailNotifications: args.enabled,
      updatedAt: Date.now(),
    });
    return seller._id;
  },
});

export const updatePushToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);
    await ctx.db.patch(seller._id, {
      expoPushToken: args.token,
      updatedAt: Date.now(),
    });
    return seller._id;
  },
});
