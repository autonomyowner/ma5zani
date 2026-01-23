import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const ADMIN_PASSWORD = "ma5zani2026";

// Verify admin password
export const verifyAdmin = query({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    return args.password === ADMIN_PASSWORD;
  },
});

// Get all sellers
export const getAllSellers = query({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    if (args.password !== ADMIN_PASSWORD) {
      throw new Error("Unauthorized");
    }
    return await ctx.db.query("sellers").collect();
  },
});

// Get all orders (across all sellers)
export const getAllOrders = query({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    if (args.password !== ADMIN_PASSWORD) {
      throw new Error("Unauthorized");
    }
    return await ctx.db.query("orders").collect();
  },
});

// Get all products (across all sellers)
export const getAllProducts = query({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    if (args.password !== ADMIN_PASSWORD) {
      throw new Error("Unauthorized");
    }
    return await ctx.db.query("products").collect();
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

    // Delete all products for this seller
    const products = await ctx.db
      .query("products")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .collect();
    for (const product of products) {
      await ctx.db.delete(product._id);
    }

    // Delete all orders for this seller
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .collect();
    for (const order of orders) {
      await ctx.db.delete(order._id);
    }

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

    return {
      totalSellers: sellers.length,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalRevenue,
      pendingOrders,
      planCounts,
    };
  },
});
