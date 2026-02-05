import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireSeller } from "./auth";

// ============ DASHBOARD FUNCTIONS (Clerk auth) ============

export const generateVerificationCode = mutation({
  args: {},
  handler: async (ctx) => {
    const seller = await requireSeller(ctx);
    const now = Date.now();

    // Generate 6-char alphanumeric code
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const expiresAt = now + 10 * 60 * 1000; // 10 minutes

    // Check if seller already has a link record
    const existing = await ctx.db
      .query("telegramLinks")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        verificationCode: code,
        codeExpiresAt: expiresAt,
        status: existing.status === "linked" ? "linked" : "pending",
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("telegramLinks", {
        sellerId: seller._id,
        telegramUserId: "",
        verificationCode: code,
        codeExpiresAt: expiresAt,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      });
    }

    return { code, expiresAt };
  },
});

export const getTelegramLink = query({
  args: {},
  handler: async (ctx) => {
    const seller = await requireSeller(ctx);

    const link = await ctx.db
      .query("telegramLinks")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .first();

    if (!link) return null;

    return {
      status: link.status,
      telegramUsername: link.telegramUsername,
      linkedAt: link.linkedAt,
    };
  },
});

export const unlinkTelegram = mutation({
  args: {},
  handler: async (ctx) => {
    const seller = await requireSeller(ctx);

    const link = await ctx.db
      .query("telegramLinks")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .first();

    if (link) {
      // Delete any active sessions
      const sessions = await ctx.db
        .query("telegramSessions")
        .withIndex("by_telegram_user", (q) =>
          q.eq("telegramUserId", link.telegramUserId)
        )
        .collect();
      for (const session of sessions) {
        await ctx.db.delete(session._id);
      }

      await ctx.db.delete(link._id);
    }

    return true;
  },
});

// ============ WEBHOOK FUNCTIONS (no Clerk auth, verified by telegramUserId) ============

export const verifyTelegramCode = mutation({
  args: {
    code: v.string(),
    telegramUserId: v.string(),
    telegramUsername: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Find link record with this code
    const links = await ctx.db
      .query("telegramLinks")
      .withIndex("by_verification_code", (q) =>
        q.eq("verificationCode", args.code.toUpperCase())
      )
      .collect();

    const link = links.find(
      (l) => l.verificationCode === args.code.toUpperCase()
    );

    if (!link) {
      return { success: false, error: "invalid_code" as const };
    }

    if (link.codeExpiresAt && link.codeExpiresAt < now) {
      return { success: false, error: "expired_code" as const };
    }

    // Check if this telegram user is already linked to another seller
    const existingLink = await ctx.db
      .query("telegramLinks")
      .withIndex("by_telegram_user", (q) =>
        q.eq("telegramUserId", args.telegramUserId)
      )
      .first();

    if (existingLink && existingLink._id !== link._id && existingLink.status === "linked") {
      return { success: false, error: "already_linked" as const };
    }

    // Link the account
    await ctx.db.patch(link._id, {
      telegramUserId: args.telegramUserId,
      telegramUsername: args.telegramUsername,
      verificationCode: undefined,
      codeExpiresAt: undefined,
      status: "linked",
      linkedAt: now,
      updatedAt: now,
    });

    // Get seller name
    const seller = await ctx.db.get(link.sellerId);

    return {
      success: true,
      sellerName: seller?.name || "Seller",
    };
  },
});

export const getSellerByTelegramUser = query({
  args: { telegramUserId: v.string() },
  handler: async (ctx, args) => {
    const link = await ctx.db
      .query("telegramLinks")
      .withIndex("by_telegram_user", (q) =>
        q.eq("telegramUserId", args.telegramUserId)
      )
      .first();

    if (!link || link.status !== "linked") return null;

    const seller = await ctx.db.get(link.sellerId);
    return seller;
  },
});

export const createProductViaTelegram = mutation({
  args: {
    telegramUserId: v.string(),
    name: v.string(),
    price: v.number(),
    stock: v.optional(v.number()),
    description: v.optional(v.string()),
    imageKeys: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const link = await ctx.db
      .query("telegramLinks")
      .withIndex("by_telegram_user", (q) =>
        q.eq("telegramUserId", args.telegramUserId)
      )
      .first();

    if (!link || link.status !== "linked") {
      throw new Error("Telegram account not linked");
    }

    const now = Date.now();
    const stock = args.stock ?? 10;

    let status: "active" | "low_stock" | "out_of_stock" = "active";
    if (stock === 0) status = "out_of_stock";
    else if (stock <= 10) status = "low_stock";

    // Generate SKU
    const sku = `TG-${Date.now().toString(36).toUpperCase()}`;

    // Get highest sort order
    const products = await ctx.db
      .query("products")
      .withIndex("by_seller", (q) => q.eq("sellerId", link.sellerId))
      .collect();

    const maxSortOrder =
      products.length > 0
        ? Math.max(...products.map((p) => p.sortOrder || 0))
        : -1;

    const productId = await ctx.db.insert("products", {
      sellerId: link.sellerId,
      name: args.name,
      sku,
      stock,
      price: args.price,
      status,
      description: args.description,
      imageKeys: args.imageKeys,
      showOnStorefront: true,
      sortOrder: maxSortOrder + 1,
      createdAt: now,
      updatedAt: now,
    });

    return productId;
  },
});

export const updateProductViaTelegram = mutation({
  args: {
    telegramUserId: v.string(),
    productId: v.id("products"),
    name: v.optional(v.string()),
    price: v.optional(v.number()),
    stock: v.optional(v.number()),
    description: v.optional(v.string()),
    showOnStorefront: v.optional(v.boolean()),
    imageKeys: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const link = await ctx.db
      .query("telegramLinks")
      .withIndex("by_telegram_user", (q) =>
        q.eq("telegramUserId", args.telegramUserId)
      )
      .first();

    if (!link || link.status !== "linked") {
      throw new Error("Telegram account not linked");
    }

    const product = await ctx.db.get(args.productId);
    if (!product || product.sellerId !== link.sellerId) {
      throw new Error("Product not found");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.price !== undefined) updates.price = args.price;
    if (args.description !== undefined) updates.description = args.description;
    if (args.showOnStorefront !== undefined)
      updates.showOnStorefront = args.showOnStorefront;
    if (args.imageKeys !== undefined) updates.imageKeys = args.imageKeys;

    if (args.stock !== undefined) {
      updates.stock = args.stock;
      if (args.stock === 0) updates.status = "out_of_stock";
      else if (args.stock <= 10) updates.status = "low_stock";
      else updates.status = "active";
    }

    await ctx.db.patch(args.productId, updates);
    return args.productId;
  },
});

export const deleteProductViaTelegram = mutation({
  args: {
    telegramUserId: v.string(),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const link = await ctx.db
      .query("telegramLinks")
      .withIndex("by_telegram_user", (q) =>
        q.eq("telegramUserId", args.telegramUserId)
      )
      .first();

    if (!link || link.status !== "linked") {
      throw new Error("Telegram account not linked");
    }

    const product = await ctx.db.get(args.productId);
    if (!product || product.sellerId !== link.sellerId) {
      throw new Error("Product not found");
    }

    await ctx.db.delete(args.productId);
    return args.productId;
  },
});

export const findProductByName = query({
  args: {
    telegramUserId: v.string(),
    searchName: v.string(),
  },
  handler: async (ctx, args) => {
    const link = await ctx.db
      .query("telegramLinks")
      .withIndex("by_telegram_user", (q) =>
        q.eq("telegramUserId", args.telegramUserId)
      )
      .first();

    if (!link || link.status !== "linked") return [];

    const products = await ctx.db
      .query("products")
      .withIndex("by_seller", (q) => q.eq("sellerId", link.sellerId))
      .collect();

    const search = args.searchName.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(search));
  },
});

export const getProductsBySeller = query({
  args: { telegramUserId: v.string() },
  handler: async (ctx, args) => {
    const link = await ctx.db
      .query("telegramLinks")
      .withIndex("by_telegram_user", (q) =>
        q.eq("telegramUserId", args.telegramUserId)
      )
      .first();

    if (!link || link.status !== "linked") return [];

    return await ctx.db
      .query("products")
      .withIndex("by_seller", (q) => q.eq("sellerId", link.sellerId))
      .collect();
  },
});

export const getOrdersBySeller = query({
  args: {
    telegramUserId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const link = await ctx.db
      .query("telegramLinks")
      .withIndex("by_telegram_user", (q) =>
        q.eq("telegramUserId", args.telegramUserId)
      )
      .first();

    if (!link || link.status !== "linked") return [];

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_seller", (q) => q.eq("sellerId", link.sellerId))
      .collect();

    // Sort by createdAt desc and limit
    orders.sort((a, b) => b.createdAt - a.createdAt);
    return orders.slice(0, args.limit || 10);
  },
});

export const getStatsBySeller = query({
  args: { telegramUserId: v.string() },
  handler: async (ctx, args) => {
    const link = await ctx.db
      .query("telegramLinks")
      .withIndex("by_telegram_user", (q) =>
        q.eq("telegramUserId", args.telegramUserId)
      )
      .first();

    if (!link || link.status !== "linked") return null;

    const now = Date.now();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodayMs = startOfToday.getTime();

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startOfMonthMs = startOfMonth.getTime();

    const allOrders = await ctx.db
      .query("orders")
      .withIndex("by_seller", (q) => q.eq("sellerId", link.sellerId))
      .collect();

    const ordersToday = allOrders.filter(
      (o) => o.createdAt >= startOfTodayMs
    ).length;

    const pendingOrders = allOrders.filter(
      (o) => o.status === "pending" || o.status === "processing"
    ).length;

    const monthlyRevenue = allOrders
      .filter(
        (o) => o.createdAt >= startOfMonthMs && o.status === "delivered"
      )
      .reduce((sum, o) => sum + o.amount, 0);

    const products = await ctx.db
      .query("products")
      .withIndex("by_seller", (q) => q.eq("sellerId", link.sellerId))
      .collect();

    const totalProducts = products.length;
    const totalOrders = allOrders.length;
    const deliveredOrders = allOrders.filter(
      (o) => o.status === "delivered"
    ).length;

    return {
      ordersToday,
      pendingOrders,
      monthlyRevenue,
      totalProducts,
      totalOrders,
      deliveredOrders,
    };
  },
});

// ============ SESSION CRUD ============

export const getSession = query({
  args: { telegramUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("telegramSessions")
      .withIndex("by_telegram_user", (q) =>
        q.eq("telegramUserId", args.telegramUserId)
      )
      .first();
  },
});

export const upsertSession = mutation({
  args: {
    telegramUserId: v.string(),
    sellerId: v.id("sellers"),
    command: v.string(),
    step: v.number(),
    data: v.object({
      name: v.optional(v.string()),
      price: v.optional(v.number()),
      stock: v.optional(v.number()),
      description: v.optional(v.string()),
      imageKeys: v.optional(v.array(v.string())),
      productId: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const existing = await ctx.db
      .query("telegramSessions")
      .withIndex("by_telegram_user", (q) =>
        q.eq("telegramUserId", args.telegramUserId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        command: args.command,
        step: args.step,
        data: args.data,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("telegramSessions", {
      telegramUserId: args.telegramUserId,
      sellerId: args.sellerId,
      command: args.command,
      step: args.step,
      data: args.data,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const deleteSession = mutation({
  args: { telegramUserId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("telegramSessions")
      .withIndex("by_telegram_user", (q) =>
        q.eq("telegramUserId", args.telegramUserId)
      )
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return true;
  },
});
