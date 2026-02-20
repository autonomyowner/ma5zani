import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireSeller, requireActiveSeller } from "./auth";

export const getMyMarketingImages = query({
  args: {},
  handler: async (ctx) => {
    const seller = await requireSeller(ctx);
    return await ctx.db
      .query("marketingImages")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .order("desc")
      .collect();
  },
});

export const saveMarketingImage = mutation({
  args: {
    productId: v.id("products"),
    templateId: v.string(),
    format: v.string(),
    imageKey: v.string(),
    headline: v.optional(v.string()),
    subheadline: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const seller = await requireActiveSeller(ctx);
    return await ctx.db.insert("marketingImages", {
      sellerId: seller._id,
      productId: args.productId,
      templateId: args.templateId,
      format: args.format,
      imageKey: args.imageKey,
      headline: args.headline,
      subheadline: args.subheadline,
      createdAt: Date.now(),
    });
  },
});

export const deleteMarketingImage = mutation({
  args: { id: v.id("marketingImages") },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);
    const image = await ctx.db.get(args.id);
    if (!image || image.sellerId !== seller._id) {
      throw new Error("Image not found");
    }
    await ctx.db.delete(args.id);
  },
});
