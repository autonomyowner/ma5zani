import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireSeller, requireActiveSeller, getAuthenticatedSeller } from "./auth";

// ============ AUTHENTICATED (SELLER) FUNCTIONS ============

export const getMyLandingPages = query({
  args: {},
  handler: async (ctx) => {
    const seller = await getAuthenticatedSeller(ctx);
    if (!seller) return [];
    const pages = await ctx.db
      .query("landingPages")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .collect();

    // Filter out archived + auto-expire stuck "generating" records (>2min)
    const now = Date.now();
    const active = pages
      .filter((p) => {
        if (p.status === "archived") return false;
        if (p.status === "generating" && now - p.createdAt > 2 * 60 * 1000) return false;
        return true;
      })
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
    const seller = await getAuthenticatedSeller(ctx);
    if (!seller) return null;
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
    description: v.string(),
    ctaText: v.string(),
    deliveryTo58: v.optional(v.boolean()),
    freeDelivery: v.optional(v.boolean()),
    returnsAccepted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const seller = await requireActiveSeller(ctx);

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
        headline: product.name,
        subheadline: args.description.slice(0, 120),
        featureBullets: [],
        ctaText: args.ctaText,
        productDescription: args.description,
        deliveryTo58: args.deliveryTo58,
        freeDelivery: args.freeDelivery,
        returnsAccepted: args.returnsAccepted,
      },
      design: {
        primaryColor: storefront.colors?.primary || storefront.theme.primaryColor,
        accentColor: storefront.colors?.accent || storefront.theme.accentColor,
        backgroundColor: storefront.colors?.background || "#ffffff",
        textColor: storefront.colors?.text || "#1a1a1a",
      },
      templateVersion: 2,
      isPublished: false,
      status: "draft",
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
      // v3 fields
      guaranteeText: v.optional(v.string()),
      secondaryCta: v.optional(v.string()),
      scarcityText: v.optional(v.string()),
      microCopy: v.optional(v.object({
        delivery: v.string(),
        payment: v.string(),
        returns: v.string(),
      })),
      deliveryTo58: v.optional(v.boolean()),
      freeDelivery: v.optional(v.boolean()),
      returnsAccepted: v.optional(v.boolean()),
    }),
    design: v.object({
      primaryColor: v.string(),
      accentColor: v.string(),
      backgroundColor: v.string(),
      textColor: v.string(),
      gradientFrom: v.optional(v.string()),
      gradientTo: v.optional(v.string()),
      contrastValidated: v.optional(v.boolean()),
      isDarkTheme: v.optional(v.boolean()),
    }),
    enhancedImageKeys: v.optional(v.array(v.string())),
    sceneImageKeys: v.optional(v.array(v.string())),
    templateVersion: v.optional(v.number()),
    templateType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // No auth required — called from API route after generation
    const page = await ctx.db.get(args.id);
    if (!page) {
      throw new Error("Landing page not found");
    }

    const patch: Record<string, unknown> = {
      content: args.content,
      design: args.design,
      status: "draft",
      updatedAt: Date.now(),
    };

    if (args.enhancedImageKeys) {
      patch.enhancedImageKeys = args.enhancedImageKeys;
    }
    if (args.sceneImageKeys) {
      patch.sceneImageKeys = args.sceneImageKeys;
    }
    if (args.templateVersion) {
      patch.templateVersion = args.templateVersion;
    }
    if (args.templateType) {
      patch.templateType = args.templateType;
    }

    await ctx.db.patch(args.id, patch);
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
    // Check auth if available, otherwise allow (for API route cleanup)
    let seller = null;
    try { seller = await requireActiveSeller(ctx); } catch { /* API route call */ }

    const page = await ctx.db.get(args.id);
    if (!page) {
      throw new Error("Landing page not found");
    }

    // If authenticated, verify ownership
    if (seller && page.sellerId !== seller._id) {
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
    const seller = await requireActiveSeller(ctx);
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

    // Allow draft + published (pageId is unguessable). Block archived/generating.
    if (!page || page.status === "archived" || page.status === "generating") {
      return null;
    }

    const product = await ctx.db.get(page.productId);
    if (!product) return null;

    const storefront = await ctx.db.get(page.storefrontId);
    if (!storefront) return null;
    if (!storefront.isPublished) return { reason: "storefront_not_published" as const };

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
        logoKey: storefront.logoKey,
        theme: storefront.theme,
        colors: storefront.colors,
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
