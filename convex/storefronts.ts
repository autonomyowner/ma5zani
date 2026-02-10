import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { requireSeller, getCurrentSeller } from "./auth";

export const getMyStorefront = query({
  args: {},
  handler: async (ctx) => {
    // Use getCurrentSeller instead of requireSeller to avoid throwing
    // This prevents client-side crashes when seller isn't found
    const seller = await getCurrentSeller(ctx);
    if (!seller) {
      return null;
    }

    const storefront = await ctx.db
      .query("storefronts")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .first();

    return storefront;
  },
});

// Query to get storefront by seller ID (for internal API use)
export const getStorefrontBySeller = query({
  args: { sellerId: v.id("sellers") },
  handler: async (ctx, args) => {
    const storefront = await ctx.db
      .query("storefronts")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .first();

    return storefront;
  },
});

export const getStorefrontBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const storefront = await ctx.db
      .query("storefronts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug.toLowerCase()))
      .first();

    if (!storefront || !storefront.isPublished) {
      return null;
    }

    return storefront;
  },
});

export const checkSlugAvailability = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const slug = args.slug.toLowerCase().trim();

    // Reserved slugs
    const reserved = ["dashboard", "login", "signup", "admin", "api", "onboarding", "settings"];
    if (reserved.includes(slug)) {
      return { available: false, reason: "reserved" };
    }

    // Check if slug is valid (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return { available: false, reason: "invalid" };
    }

    if (slug.length < 3 || slug.length > 30) {
      return { available: false, reason: "length" };
    }

    const existing = await ctx.db
      .query("storefronts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    return { available: !existing, reason: existing ? "taken" : null };
  },
});

export const createStorefront = mutation({
  args: {
    slug: v.string(),
    boutiqueName: v.string(),
    logoKey: v.optional(v.string()),
    description: v.optional(v.string()),
    theme: v.optional(v.object({
      primaryColor: v.string(),
      accentColor: v.string(),
    })),
    socialLinks: v.optional(v.object({
      instagram: v.optional(v.string()),
      facebook: v.optional(v.string()),
      tiktok: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    // Check if seller already has a storefront
    const existing = await ctx.db
      .query("storefronts")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .first();

    if (existing) {
      throw new Error("Seller already has a storefront");
    }

    const slug = args.slug.toLowerCase().trim();

    // Check slug availability
    const slugCheck = await ctx.db
      .query("storefronts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (slugCheck) {
      throw new ConvexError("SLUG_TAKEN");
    }

    const now = Date.now();

    const storefrontId = await ctx.db.insert("storefronts", {
      sellerId: seller._id,
      slug,
      boutiqueName: args.boutiqueName,
      logoKey: args.logoKey,
      description: args.description,
      theme: args.theme || {
        primaryColor: "#0054A6",
        accentColor: "#F7941D",
      },
      socialLinks: args.socialLinks,
      settings: {
        autoFulfillment: false,
        showOutOfStock: false,
      },
      isPublished: false,
      createdAt: now,
      updatedAt: now,
    });

    return storefrontId;
  },
});

export const updateStorefront = mutation({
  args: {
    boutiqueName: v.optional(v.string()),
    logoKey: v.optional(v.string()),
    description: v.optional(v.string()),
    theme: v.optional(v.object({
      primaryColor: v.string(),
      accentColor: v.string(),
    })),
    socialLinks: v.optional(v.object({
      instagram: v.optional(v.string()),
      facebook: v.optional(v.string()),
      tiktok: v.optional(v.string()),
    })),
    settings: v.optional(v.object({
      autoFulfillment: v.boolean(),
      showOutOfStock: v.boolean(),
    })),
    metaPixelId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    const storefront = await ctx.db
      .query("storefronts")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .first();

    if (!storefront) {
      throw new Error("Storefront not found");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.boutiqueName !== undefined) updates.boutiqueName = args.boutiqueName;
    if (args.logoKey !== undefined) updates.logoKey = args.logoKey;
    if (args.description !== undefined) updates.description = args.description;
    if (args.theme !== undefined) updates.theme = args.theme;
    if (args.socialLinks !== undefined) updates.socialLinks = args.socialLinks;
    if (args.settings !== undefined) updates.settings = args.settings;
    if (args.metaPixelId !== undefined) updates.metaPixelId = args.metaPixelId;

    await ctx.db.patch(storefront._id, updates);
    return storefront._id;
  },
});

export const updateSlug = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    const storefront = await ctx.db
      .query("storefronts")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .first();

    if (!storefront) {
      throw new Error("Storefront not found");
    }

    const slug = args.slug.toLowerCase().trim();

    // Check if new slug is available (but not if it's the same)
    if (slug !== storefront.slug) {
      const slugCheck = await ctx.db
        .query("storefronts")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();

      if (slugCheck) {
        throw new ConvexError("SLUG_TAKEN");
      }
    }

    await ctx.db.patch(storefront._id, {
      slug,
      updatedAt: Date.now(),
    });

    return storefront._id;
  },
});

export const publishStorefront = mutation({
  args: { isPublished: v.boolean() },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    const storefront = await ctx.db
      .query("storefronts")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .first();

    if (!storefront) {
      throw new Error("Storefront not found");
    }

    // If publishing, check that there's at least one product to show
    if (args.isPublished) {
      const products = await ctx.db
        .query("products")
        .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
        .filter((q) => q.eq(q.field("showOnStorefront"), true))
        .first();

      if (!products) {
        throw new Error("Add at least one product to your storefront before publishing");
      }
    }

    await ctx.db.patch(storefront._id, {
      isPublished: args.isPublished,
      updatedAt: Date.now(),
    });

    return storefront._id;
  },
});

// ============ TEMPLATE SYSTEM MUTATIONS ============

export const updateSections = mutation({
  args: {
    sections: v.array(v.object({
      id: v.string(),
      type: v.string(),
      order: v.number(),
      enabled: v.boolean(),
      content: v.object({
        title: v.optional(v.string()),
        titleAr: v.optional(v.string()),
        subtitle: v.optional(v.string()),
        subtitleAr: v.optional(v.string()),
        imageKey: v.optional(v.string()),
        backgroundColor: v.optional(v.string()),
        textColor: v.optional(v.string()),
        ctaText: v.optional(v.string()),
        ctaTextAr: v.optional(v.string()),
        ctaLink: v.optional(v.string()),
        items: v.optional(v.array(v.any())),
        productsPerRow: v.optional(v.number()),
        productCount: v.optional(v.number()),
        showFilters: v.optional(v.boolean()),
        layout: v.optional(v.string()),
      }),
    })),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    const storefront = await ctx.db
      .query("storefronts")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .first();

    if (!storefront) {
      throw new Error("Storefront not found");
    }

    await ctx.db.patch(storefront._id, {
      sections: args.sections,
      updatedAt: Date.now(),
    });

    return storefront._id;
  },
});

export const updateColors = mutation({
  args: {
    colors: v.object({
      primary: v.string(),
      accent: v.string(),
      background: v.string(),
      text: v.string(),
      headerBg: v.string(),
      footerBg: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    const storefront = await ctx.db
      .query("storefronts")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .first();

    if (!storefront) {
      throw new Error("Storefront not found");
    }

    // Also update the legacy theme colors for backward compatibility
    await ctx.db.patch(storefront._id, {
      colors: args.colors,
      theme: {
        primaryColor: args.colors.primary,
        accentColor: args.colors.accent,
      },
      updatedAt: Date.now(),
    });

    return storefront._id;
  },
});

export const updateFooter = mutation({
  args: {
    footer: v.object({
      showPoweredBy: v.boolean(),
      customText: v.optional(v.string()),
      customTextAr: v.optional(v.string()),
      links: v.optional(v.array(v.object({
        label: v.string(),
        labelAr: v.optional(v.string()),
        url: v.string(),
      }))),
    }),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    const storefront = await ctx.db
      .query("storefronts")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .first();

    if (!storefront) {
      throw new Error("Storefront not found");
    }

    await ctx.db.patch(storefront._id, {
      footer: args.footer,
      updatedAt: Date.now(),
    });

    return storefront._id;
  },
});

export const applyTemplate = mutation({
  args: {
    templateId: v.string(),
    sections: v.array(v.object({
      id: v.string(),
      type: v.string(),
      order: v.number(),
      enabled: v.boolean(),
      content: v.object({
        title: v.optional(v.string()),
        titleAr: v.optional(v.string()),
        subtitle: v.optional(v.string()),
        subtitleAr: v.optional(v.string()),
        imageKey: v.optional(v.string()),
        backgroundColor: v.optional(v.string()),
        textColor: v.optional(v.string()),
        ctaText: v.optional(v.string()),
        ctaTextAr: v.optional(v.string()),
        ctaLink: v.optional(v.string()),
        items: v.optional(v.array(v.any())),
        productsPerRow: v.optional(v.number()),
        productCount: v.optional(v.number()),
        showFilters: v.optional(v.boolean()),
        layout: v.optional(v.string()),
      }),
    })),
    colors: v.optional(v.object({
      primary: v.string(),
      accent: v.string(),
      background: v.string(),
      text: v.string(),
      headerBg: v.string(),
      footerBg: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    const storefront = await ctx.db
      .query("storefronts")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .first();

    if (!storefront) {
      throw new Error("Storefront not found");
    }

    const updates: Record<string, unknown> = {
      templateId: args.templateId,
      sections: args.sections,
      updatedAt: Date.now(),
    };

    if (args.colors) {
      updates.colors = args.colors;
      updates.theme = {
        primaryColor: args.colors.primary,
        accentColor: args.colors.accent,
      };
    }

    await ctx.db.patch(storefront._id, updates);

    return storefront._id;
  },
});

export const updateFonts = mutation({
  args: {
    fonts: v.object({
      display: v.string(),
      body: v.string(),
      arabic: v.string(),
    }),
    aestheticDirection: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    const storefront = await ctx.db
      .query("storefronts")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .first();

    if (!storefront) {
      throw new Error("Storefront not found");
    }

    const updates: Record<string, unknown> = {
      fonts: args.fonts,
      updatedAt: Date.now(),
    };

    if (args.aestheticDirection !== undefined) {
      updates.aestheticDirection = args.aestheticDirection;
    }

    await ctx.db.patch(storefront._id, updates);

    return storefront._id;
  },
});
