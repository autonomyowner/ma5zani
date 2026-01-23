import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireSeller } from "./auth";

export const getProducts = query({
  args: {},
  handler: async (ctx) => {
    const seller = await requireSeller(ctx);

    const products = await ctx.db
      .query("products")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .collect();

    return products;
  },
});

export const createProduct = mutation({
  args: {
    name: v.string(),
    sku: v.string(),
    stock: v.number(),
    price: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);
    const now = Date.now();

    // Determine status based on stock
    let status: "active" | "low_stock" | "out_of_stock" = "active";
    if (args.stock === 0) {
      status = "out_of_stock";
    } else if (args.stock <= 10) {
      status = "low_stock";
    }

    const productId = await ctx.db.insert("products", {
      sellerId: seller._id,
      name: args.name,
      sku: args.sku,
      stock: args.stock,
      price: args.price,
      status,
      description: args.description,
      createdAt: now,
      updatedAt: now,
    });

    return productId;
  },
});

export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    name: v.optional(v.string()),
    sku: v.optional(v.string()),
    stock: v.optional(v.number()),
    price: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    const product = await ctx.db.get(args.productId);
    if (!product || product.sellerId !== seller._id) {
      throw new Error("Product not found");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.sku !== undefined) updates.sku = args.sku;
    if (args.price !== undefined) updates.price = args.price;
    if (args.description !== undefined) updates.description = args.description;

    if (args.stock !== undefined) {
      updates.stock = args.stock;
      // Auto-update status based on stock
      if (args.stock === 0) {
        updates.status = "out_of_stock";
      } else if (args.stock <= 10) {
        updates.status = "low_stock";
      } else {
        updates.status = "active";
      }
    }

    await ctx.db.patch(args.productId, updates);
    return args.productId;
  },
});

export const updateStock = mutation({
  args: {
    productId: v.id("products"),
    stock: v.number(),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    const product = await ctx.db.get(args.productId);
    if (!product || product.sellerId !== seller._id) {
      throw new Error("Product not found");
    }

    // Determine status based on stock
    let status: "active" | "low_stock" | "out_of_stock" = "active";
    if (args.stock === 0) {
      status = "out_of_stock";
    } else if (args.stock <= 10) {
      status = "low_stock";
    }

    await ctx.db.patch(args.productId, {
      stock: args.stock,
      status,
      updatedAt: Date.now(),
    });

    return args.productId;
  },
});

export const deleteProduct = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    const product = await ctx.db.get(args.productId);
    if (!product || product.sellerId !== seller._id) {
      throw new Error("Product not found");
    }

    await ctx.db.delete(args.productId);
    return args.productId;
  },
});
