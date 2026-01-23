import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireSeller } from "./auth";

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const seller = await requireSeller(ctx);

    const categories = await ctx.db
      .query("categories")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .collect();

    return categories.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const getCategoriesBySeller = query({
  args: { sellerId: v.id("sellers") },
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .collect();

    return categories.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const createCategory = mutation({
  args: {
    name: v.string(),
    nameAr: v.string(),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    // Get the highest sort order
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .collect();

    const maxSortOrder = categories.length > 0
      ? Math.max(...categories.map((c) => c.sortOrder))
      : -1;

    const categoryId = await ctx.db.insert("categories", {
      sellerId: seller._id,
      name: args.name,
      nameAr: args.nameAr,
      sortOrder: maxSortOrder + 1,
      createdAt: Date.now(),
    });

    return categoryId;
  },
});

export const updateCategory = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.optional(v.string()),
    nameAr: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.sellerId !== seller._id) {
      throw new Error("Category not found");
    }

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.nameAr !== undefined) updates.nameAr = args.nameAr;
    if (args.sortOrder !== undefined) updates.sortOrder = args.sortOrder;

    await ctx.db.patch(args.categoryId, updates);
    return args.categoryId;
  },
});

export const deleteCategory = mutation({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.sellerId !== seller._id) {
      throw new Error("Category not found");
    }

    // Remove category from all products that use it
    const products = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    for (const product of products) {
      await ctx.db.patch(product._id, { categoryId: undefined });
    }

    await ctx.db.delete(args.categoryId);
    return args.categoryId;
  },
});

export const reorderCategories = mutation({
  args: {
    categoryIds: v.array(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    for (let i = 0; i < args.categoryIds.length; i++) {
      const category = await ctx.db.get(args.categoryIds[i]);
      if (!category || category.sellerId !== seller._id) {
        throw new Error("Category not found");
      }
      await ctx.db.patch(args.categoryIds[i], { sortOrder: i });
    }

    return true;
  },
});
