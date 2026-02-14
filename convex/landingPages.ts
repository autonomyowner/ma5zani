import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireSeller } from "./auth";
import { internal } from "./_generated/api";

// ============ AUTHENTICATED (SELLER) FUNCTIONS ============

export const getMyLandingPages = query({
  args: {},
  handler: async (ctx) => {
    const seller = await requireSeller(ctx);
    const pages = await ctx.db
      .query("landingPages")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .collect();

    // Filter out archived, sort by newest first
    const active = pages
      .filter((p) => p.status !== "archived")
      .sort((a, b) => b.createdAt - a.createdAt);

    // Attach product info
    const results = await Promise.all(
      active.map(async (page) => {
        const product = await ctx.db.get(page.productId);
        const storefront = await ctx.db.get(page.storefrontId);
        return {
          ...page,
          productName: product?.name || "Deleted product",
          productImage: product?.imageKeys?.[0] || null,
          productPrice: product?.price || 0,
          productSalePrice: product?.salePrice,
          storefrontSlug: storefront?.slug || "",
        };
      })
    );

    return results;
  },
});

export const getLandingPage = query({
  args: { id: v.id("landingPages") },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);
    const page = await ctx.db.get(args.id);
    if (!page || page.sellerId !== seller._id) return null;

    const product = await ctx.db.get(page.productId);
    const storefront = await ctx.db.get(page.storefrontId);

    return {
      ...page,
      productName: product?.name || "Deleted product",
      productImage: product?.imageKeys?.[0] || null,
      productPrice: product?.price || 0,
      productSalePrice: product?.salePrice,
      productImages: product?.imageKeys || [],
      productSizes: product?.sizes || [],
      productColors: product?.colors || [],
      storefrontSlug: storefront?.slug || "",
    };
  },
});

export const createLandingPage = mutation({
  args: {
    storefrontId: v.id("storefronts"),
    productId: v.id("products"),
    pageId: v.string(),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    // Verify ownership
    const storefront = await ctx.db.get(args.storefrontId);
    if (!storefront || storefront.sellerId !== seller._id) {
      throw new Error("Storefront not found");
    }

    const product = await ctx.db.get(args.productId);
    if (!product || product.sellerId !== seller._id) {
      throw new Error("Product not found");
    }

    const now = Date.now();
    const id = await ctx.db.insert("landingPages", {
      sellerId: seller._id,
      storefrontId: args.storefrontId,
      productId: args.productId,
      pageId: args.pageId,
      content: {
        headline: "",
        subheadline: "",
        featureBullets: [],
        ctaText: "",
        productDescription: "",
      },
      design: {
        primaryColor: storefront.theme.primaryColor,
        accentColor: storefront.theme.accentColor,
        backgroundColor: "#ffffff",
        textColor: "#1a1a1a",
      },
      isPublished: false,
      status: "generating",
      viewCount: 0,
      orderCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

export const updateLandingPageContent = mutation({
  args: {
    id: v.id("landingPages"),
    content: v.object({
      headline: v.string(),
      subheadline: v.string(),
      featureBullets: v.array(v.object({
        title: v.string(),
        description: v.string(),
      })),
      ctaText: v.string(),
      urgencyText: v.optional(v.string()),
      productDescription: v.string(),
      socialProof: v.optional(v.string()),
    }),
    design: v.object({
      primaryColor: v.string(),
      accentColor: v.string(),
      backgroundColor: v.string(),
      textColor: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);
    const page = await ctx.db.get(args.id);
    if (!page || page.sellerId !== seller._id) {
      throw new Error("Landing page not found");
    }

    await ctx.db.patch(args.id, {
      content: args.content,
      design: args.design,
      status: "draft",
      updatedAt: Date.now(),
    });
  },
});

export const updateLandingPageStatus = mutation({
  args: {
    id: v.id("landingPages"),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);
    const page = await ctx.db.get(args.id);
    if (!page || page.sellerId !== seller._id) {
      throw new Error("Landing page not found");
    }

    await ctx.db.patch(args.id, {
      status: args.status,
      isPublished: args.status === "published",
      updatedAt: Date.now(),
    });
  },
});

export const deleteLandingPage = mutation({
  args: { id: v.id("landingPages") },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);
    const page = await ctx.db.get(args.id);
    if (!page || page.sellerId !== seller._id) {
      throw new Error("Landing page not found");
    }

    await ctx.db.patch(args.id, {
      status: "archived",
      isPublished: false,
      updatedAt: Date.now(),
    });
  },
});

// ============ PUBLIC FUNCTIONS (NO AUTH) ============

export const getPublicLandingPage = query({
  args: { pageId: v.string() },
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("landingPages")
      .withIndex("by_pageId", (q) => q.eq("pageId", args.pageId))
      .first();

    if (!page || !page.isPublished || page.status !== "published") {
      return null;
    }

    const product = await ctx.db.get(page.productId);
    if (!product) return null;

    const storefront = await ctx.db.get(page.storefrontId);
    if (!storefront || !storefront.isPublished) return null;

    return {
      page,
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        imageKeys: product.imageKeys || [],
        sizes: product.sizes || [],
        colors: product.colors || [],
        stock: product.stock,
        status: product.status,
      },
      storefront: {
        _id: storefront._id,
        slug: storefront.slug,
        boutiqueName: storefront.boutiqueName,
        sellerId: storefront.sellerId,
        metaPixelId: storefront.metaPixelId,
      },
    };
  },
});

export const incrementViewCount = mutation({
  args: { pageId: v.string() },
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("landingPages")
      .withIndex("by_pageId", (q) => q.eq("pageId", args.pageId))
      .first();

    if (!page) return;

    await ctx.db.patch(page._id, {
      viewCount: (page.viewCount || 0) + 1,
    });
  },
});

export const incrementOrderCount = mutation({
  args: { pageId: v.string() },
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("landingPages")
      .withIndex("by_pageId", (q) => q.eq("pageId", args.pageId))
      .first();

    if (!page) return;

    await ctx.db.patch(page._id, {
      orderCount: (page.orderCount || 0) + 1,
    });
  },
});
