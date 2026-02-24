import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  console.error("ADMIN_PASSWORD environment variable is not set");
}

// Verify admin password
export const verifyAdmin = query({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    return args.password === ADMIN_PASSWORD;
  },
});

// Get all sellers (paginated)
export const getAllSellers = query({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    if (args.password !== ADMIN_PASSWORD) {
      throw new Error("Unauthorized");
    }
    return await ctx.db.query("sellers").order("desc").take(500);
  },
});

// Get all orders (paginated, most recent first)
export const getAllOrders = query({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    if (args.password !== ADMIN_PASSWORD) {
      throw new Error("Unauthorized");
    }
    return await ctx.db.query("orders").order("desc").take(500);
  },
});

// Get all products (paginated)
export const getAllProducts = query({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    if (args.password !== ADMIN_PASSWORD) {
      throw new Error("Unauthorized");
    }
    return await ctx.db.query("products").order("desc").take(500);
  },
});

// Activate/deactivate seller
export const activateSeller = mutation({
  args: {
    password: v.string(),
    sellerId: v.id("sellers"),
    isActivated: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (args.password !== ADMIN_PASSWORD) {
      throw new Error("Unauthorized");
    }
    const updates: Record<string, unknown> = {
      isActivated: args.isActivated,
      updatedAt: Date.now(),
    };
    if (args.isActivated) {
      updates.activatedAt = Date.now();
    }
    await ctx.db.patch(args.sellerId, updates);

    // If activating, check for pending referral and credit the referrer
    if (args.isActivated) {
      const referral = await ctx.db
        .query("referrals")
        .withIndex("by_referred", (q) => q.eq("referredSellerId", args.sellerId))
        .first();

      if (referral && referral.status === "pending") {
        await ctx.db.patch(referral._id, {
          status: "activated",
          activatedAt: Date.now(),
        });

        const referrer = await ctx.db.get(referral.referrerId);
        if (referrer) {
          await ctx.db.patch(referrer._id, {
            referralEarnings: (referrer.referralEarnings || 0) + referral.referrerReward,
            referralCount: (referrer.referralCount || 0) + 1,
            updatedAt: Date.now(),
          });
        }
      }
    }

    return args.sellerId;
  },
});

// Update seller plan
export const updateSellerPlan = mutation({
  args: {
    password: v.string(),
    sellerId: v.id("sellers"),
    plan: v.union(v.literal("basic"), v.literal("plus"), v.literal("gros")),
  },
  handler: async (ctx, args) => {
    if (args.password !== ADMIN_PASSWORD) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.sellerId, {
      plan: args.plan,
      updatedAt: Date.now(),
    });
    return args.sellerId;
  },
});

// Delete seller
export const deleteSeller = mutation({
  args: {
    password: v.string(),
    sellerId: v.id("sellers"),
  },
  handler: async (ctx, args) => {
    if (args.password !== ADMIN_PASSWORD) {
      throw new Error("Unauthorized");
    }

    // Helper to delete all docs from an indexed query
    const deleteAll = async (table: string, index: string, field: string, value: unknown) => {
      const docs = await (ctx.db.query(table as any) as any)
        .withIndex(index, (q: any) => q.eq(field, value))
        .collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    };

    // Delete all products for this seller
    await deleteAll("products", "by_seller", "sellerId", args.sellerId);

    // Delete all orders for this seller
    await deleteAll("orders", "by_seller", "sellerId", args.sellerId);

    // Delete categories
    await deleteAll("categories", "by_seller", "sellerId", args.sellerId);

    // Delete storefronts and related data
    const storefronts = await ctx.db
      .query("storefronts")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .collect();

    for (const storefront of storefronts) {
      // Delete custom domains for this storefront
      const domains = await ctx.db
        .query("customDomains")
        .withIndex("by_storefront", (q) => q.eq("storefrontId", storefront._id))
        .collect();
      for (const domain of domains) await ctx.db.delete(domain._id);

      // Delete chatbots and their data
      const chatbots = await ctx.db
        .query("chatbots")
        .withIndex("by_storefront", (q) => q.eq("storefrontId", storefront._id))
        .collect();
      for (const chatbot of chatbots) {
        // Delete knowledge base
        const knowledge = await ctx.db
          .query("chatbotKnowledge")
          .withIndex("by_chatbot", (q) => q.eq("chatbotId", chatbot._id))
          .collect();
        for (const k of knowledge) await ctx.db.delete(k._id);

        // Delete conversations and messages
        const convos = await ctx.db
          .query("chatbotConversations")
          .withIndex("by_chatbot", (q) => q.eq("chatbotId", chatbot._id))
          .collect();
        for (const convo of convos) {
          const msgs = await ctx.db
            .query("chatbotMessages")
            .withIndex("by_conversation", (q) => q.eq("conversationId", convo._id))
            .collect();
          for (const msg of msgs) await ctx.db.delete(msg._id);
          await ctx.db.delete(convo._id);
        }

        await ctx.db.delete(chatbot._id);
      }

      // Delete landing pages
      const landingPages = await ctx.db
        .query("landingPages")
        .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
        .collect();
      for (const lp of landingPages) await ctx.db.delete(lp._id);

      await ctx.db.delete(storefront._id);
    }

    // Delete voice clips
    await deleteAll("voiceClips", "by_seller", "sellerId", args.sellerId);

    // Delete marketing images
    await deleteAll("marketingImages", "by_seller", "sellerId", args.sellerId);

    // Delete telegram links
    await deleteAll("telegramLinks", "by_seller", "sellerId", args.sellerId);

    // Delete the seller
    await ctx.db.delete(args.sellerId);
    return args.sellerId;
  },
});

// Update order status (admin)
export const adminUpdateOrderStatus = mutation({
  args: {
    password: v.string(),
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    if (args.password !== ADMIN_PASSWORD) {
      throw new Error("Unauthorized");
    }

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // If cancelling, restore stock
    if (args.status === "cancelled" && order.status !== "cancelled") {
      const product = await ctx.db.get(order.productId);
      if (product) {
        const newStock = product.stock + order.quantity;
        let newStatus: "active" | "low_stock" | "out_of_stock" = "active";
        if (newStock === 0) {
          newStatus = "out_of_stock";
        } else if (newStock <= 10) {
          newStatus = "low_stock";
        }

        await ctx.db.patch(order.productId, {
          stock: newStock,
          status: newStatus,
          updatedAt: Date.now(),
        });
      }
    }

    await ctx.db.patch(args.orderId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return args.orderId;
  },
});

// Delete order (admin)
export const deleteOrder = mutation({
  args: {
    password: v.string(),
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    if (args.password !== ADMIN_PASSWORD) {
      throw new Error("Unauthorized");
    }
    await ctx.db.delete(args.orderId);
    return args.orderId;
  },
});

// Delete product (admin)
export const adminDeleteProduct = mutation({
  args: {
    password: v.string(),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    if (args.password !== ADMIN_PASSWORD) {
      throw new Error("Unauthorized");
    }
    await ctx.db.delete(args.productId);
    return args.productId;
  },
});

// Get admin stats
export const getAdminStats = query({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    if (args.password !== ADMIN_PASSWORD) {
      throw new Error("Unauthorized");
    }

    const sellers = await ctx.db.query("sellers").collect();
    const orders = await ctx.db.query("orders").collect();
    const products = await ctx.db.query("products").collect();
    const storefronts = await ctx.db.query("storefronts").collect();

    const totalRevenue = orders
      .filter((o) => o.status === "delivered")
      .reduce((sum, o) => sum + o.amount, 0);

    const pendingOrders = orders.filter(
      (o) => o.status === "pending" || o.status === "processing"
    ).length;

    const planCounts = {
      basic: sellers.filter((s) => s.plan === "basic").length,
      plus: sellers.filter((s) => s.plan === "plus").length,
      gros: sellers.filter((s) => s.plan === "gros").length,
    };

    const publishedStorefronts = storefronts.filter((s) => s.isPublished).length;

    return {
      totalSellers: sellers.length,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalStorefronts: storefronts.length,
      publishedStorefronts,
      totalRevenue,
      pendingOrders,
      planCounts,
    };
  },
});

// Backfill trials for existing non-activated sellers
export const backfillTrials = mutation({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    if (args.password !== ADMIN_PASSWORD) {
      throw new Error("Unauthorized");
    }
    const sellers = await ctx.db.query("sellers").collect();
    let count = 0;
    for (const seller of sellers) {
      if (!seller.isActivated && seller.trialEndsAt === undefined) {
        await ctx.db.patch(seller._id, {
          trialEndsAt: Date.now() + 14 * 24 * 60 * 60 * 1000,
          updatedAt: Date.now(),
        });
        count++;
      }
    }
    return { updated: count };
  },
});

// Get all storefronts with seller info
export const getAllStorefronts = query({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    if (args.password !== ADMIN_PASSWORD) {
      throw new Error("Unauthorized");
    }

    const storefronts = await ctx.db.query("storefronts").order("desc").take(500);

    // Get seller info for each storefront
    const storefrontsWithSeller = await Promise.all(
      storefronts.map(async (storefront) => {
        const seller = await ctx.db.get(storefront.sellerId);
        return {
          ...storefront,
          sellerName: seller?.name || "Unknown",
          sellerEmail: seller?.email || "Unknown",
        };
      })
    );

    return storefrontsWithSeller;
  },
});

// Get all referrals with seller names
export const getAllReferrals = query({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    if (args.password !== ADMIN_PASSWORD) {
      throw new Error("Unauthorized");
    }

    const referrals = await ctx.db.query("referrals").order("desc").collect();

    const referralsWithNames = await Promise.all(
      referrals.map(async (r) => {
        const referrer = await ctx.db.get(r.referrerId);
        const referred = await ctx.db.get(r.referredSellerId);
        return {
          ...r,
          referrerName: referrer?.name || "Unknown",
          referrerEmail: referrer?.email || "Unknown",
          referredName: referred?.name || "Unknown",
          referredEmail: referred?.email || "Unknown",
        };
      })
    );

    return referralsWithNames;
  },
});

// Mark a referral as paid
export const markReferralPaid = mutation({
  args: {
    password: v.string(),
    referralId: v.id("referrals"),
  },
  handler: async (ctx, args) => {
    if (args.password !== ADMIN_PASSWORD) {
      throw new Error("Unauthorized");
    }

    const referral = await ctx.db.get(args.referralId);
    if (!referral) throw new Error("Referral not found");
    if (referral.status !== "activated") {
      throw new Error("Can only mark activated referrals as paid");
    }

    await ctx.db.patch(args.referralId, {
      status: "paid",
      paidAt: Date.now(),
    });

    return args.referralId;
  },
});

// Backfill referral codes for existing sellers
export const backfillReferralCodes = mutation({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    if (args.password !== ADMIN_PASSWORD) {
      throw new Error("Unauthorized");
    }

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const sellers = await ctx.db.query("sellers").collect();
    let count = 0;

    for (const seller of sellers) {
      if (!seller.referralCode) {
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

        await ctx.db.patch(seller._id, {
          referralCode,
          referralEarnings: seller.referralEarnings ?? 0,
          referralCount: seller.referralCount ?? 0,
          updatedAt: Date.now(),
        });
        count++;
      }
    }

    return { updated: count };
  },
});

// Revert migration: undo accidental activation, give 14-day trial instead
// Only reverts sellers activated in the last 2 hours (by the migration), not manually activated ones
export const migrateRevertToTrial = mutation({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    if (args.password !== ADMIN_PASSWORD) {
      throw new Error("Unauthorized");
    }

    const sellers = await ctx.db.query("sellers").collect();
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const trialDuration = 14 * 24 * 60 * 60 * 1000;
    let count = 0;

    for (const seller of sellers) {
      // Only revert sellers activated recently (by migration), not manually activated ones
      if (seller.isActivated && seller.activatedAt && seller.activatedAt > twoHoursAgo) {
        await ctx.db.patch(seller._id, {
          isActivated: false,
          activatedAt: undefined,
          trialEndsAt: Date.now() + trialDuration,
          updatedAt: Date.now(),
        });
        count++;
      }
    }

    return { reverted: count, total: sellers.length };
  },
});
