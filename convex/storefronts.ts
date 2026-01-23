import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireSeller } from "./auth";

export const getMyStorefront = query({
  args: {},
  handler: async (ctx) => {
    const seller = await requireSeller(ctx);

    const storefront = await ctx.db
      .query("storefronts")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
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
      throw new Error("Slug is already taken");
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
        throw new Error("Slug is already taken");
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
