import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireSeller } from "./auth";

// Public: validate a referral code (no auth needed)
export const validateReferralCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const code = args.code.toUpperCase().trim();
    if (code.length !== 6) return null;

    const referrer = await ctx.db
      .query("sellers")
      .withIndex("by_referralCode", (q) => q.eq("referralCode", code))
      .first();

    if (!referrer) return null;
    return { name: referrer.name };
  },
});

// Authenticated: apply a referral code to current seller
export const applyReferralCode = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);
    const code = args.code.toUpperCase().trim();

    // Can't apply after activation
    if (seller.isActivated) {
      throw new Error("Cannot apply referral code after activation");
    }

    // Can't apply twice
    if (seller.referredBy) {
      throw new Error("Referral code already applied");
    }

    const referrer = await ctx.db
      .query("sellers")
      .withIndex("by_referralCode", (q) => q.eq("referralCode", code))
      .first();

    if (!referrer) {
      throw new Error("Invalid referral code");
    }

    // Can't self-refer
    if (referrer._id === seller._id) {
      throw new Error("Cannot use your own referral code");
    }

    // Set referredBy on seller
    await ctx.db.patch(seller._id, {
      referredBy: referrer._id,
      updatedAt: Date.now(),
    });

    // Create referral record
    await ctx.db.insert("referrals", {
      referrerId: referrer._id,
      referredSellerId: seller._id,
      status: "pending",
      referrerReward: 500,
      referredDiscount: 500,
      createdAt: Date.now(),
    });

    return { referrerName: referrer.name };
  },
});

// Get current seller's referral stats
export const getMyReferralStats = query({
  args: {},
  handler: async (ctx) => {
    const seller = await requireSeller(ctx);

    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrer", (q) => q.eq("referrerId", seller._id))
      .collect();

    // Get referred seller names
    const referralDetails = await Promise.all(
      referrals.map(async (r) => {
        const referred = await ctx.db.get(r.referredSellerId);
        return {
          _id: r._id,
          referredName: referred?.name || "Unknown",
          status: r.status,
          referrerReward: r.referrerReward,
          createdAt: r.createdAt,
          activatedAt: r.activatedAt,
          paidAt: r.paidAt,
        };
      })
    );

    return {
      referralCode: seller.referralCode || "",
      totalEarnings: seller.referralEarnings || 0,
      totalCount: seller.referralCount || 0,
      pendingCount: referrals.filter((r) => r.status === "activated").length,
      referrals: referralDetails,
    };
  },
});

// Get just the referral code (lightweight)
export const getMyReferralCode = query({
  args: {},
  handler: async (ctx) => {
    const seller = await requireSeller(ctx);
    return seller.referralCode || null;
  },
});
