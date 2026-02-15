import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireSeller, requireActiveSeller } from "./auth";

// Public query: resolve hostname → storefront slug (used by middleware)
export const getStorefrontSlugByDomain = query({
  args: { hostname: v.string() },
  handler: async (ctx, args) => {
    const hostname = args.hostname.toLowerCase();

    // Check customDomains table for active domain
    const domainRecord = await ctx.db
      .query("customDomains")
      .withIndex("by_hostname", (q) => q.eq("hostname", hostname))
      .first();

    if (!domainRecord || domainRecord.status !== "active") {
      return null;
    }

    const storefront = await ctx.db.get(domainRecord.storefrontId);
    if (!storefront || !storefront.isPublished) {
      return null;
    }

    return { slug: storefront.slug };
  },
});

// Authenticated: get seller's custom domain + status
export const getMyCustomDomain = query({
  args: {},
  handler: async (ctx) => {
    const seller = await requireSeller(ctx);
    const domain = await ctx.db
      .query("customDomains")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .first();

    if (!domain || domain.status === "deleted") {
      return null;
    }

    return domain;
  },
});

// Authenticated: add a custom domain
export const addCustomDomain = mutation({
  args: {
    hostname: v.string(),
    storefrontId: v.id("storefronts"),
  },
  handler: async (ctx, args) => {
    const seller = await requireActiveSeller(ctx);
    const hostname = args.hostname.toLowerCase().trim();

    // Validate hostname format
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/.test(hostname)) {
      throw new Error("INVALID_DOMAIN");
    }

    // Reject ma5zani.com subdomains
    if (hostname.endsWith(".ma5zani.com") || hostname === "ma5zani.com") {
      throw new Error("RESERVED_DOMAIN");
    }

    // Check storefront belongs to seller
    const storefront = await ctx.db.get(args.storefrontId);
    if (!storefront || storefront.sellerId !== seller._id) {
      throw new Error("STOREFRONT_NOT_FOUND");
    }

    // Check domain not already taken
    const existing = await ctx.db
      .query("customDomains")
      .withIndex("by_hostname", (q) => q.eq("hostname", hostname))
      .first();

    if (existing && existing.status !== "deleted") {
      throw new Error("DOMAIN_TAKEN");
    }

    // Check seller doesn't already have an active domain
    const sellerDomain = await ctx.db
      .query("customDomains")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .first();

    if (sellerDomain && sellerDomain.status !== "deleted") {
      throw new Error("ALREADY_HAS_DOMAIN");
    }

    const now = Date.now();
    const domainId = await ctx.db.insert("customDomains", {
      storefrontId: args.storefrontId,
      sellerId: seller._id,
      hostname,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return domainId;
  },
});

// Update domain status (called from API route after Cloudflare API calls)
export const updateDomainStatus = mutation({
  args: {
    domainId: v.id("customDomains"),
    status: v.union(
      v.literal("pending"),
      v.literal("pending_validation"),
      v.literal("active"),
      v.literal("failed"),
      v.literal("deleted")
    ),
    cloudflareHostnameId: v.optional(v.string()),
    sslStatus: v.optional(v.string()),
    validationErrors: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);
    const { domainId, status, ...rest } = args;
    const domain = await ctx.db.get(domainId);
    if (!domain) return;

    // Verify ownership
    if (domain.sellerId !== seller._id) {
      throw new Error("UNAUTHORIZED");
    }

    const update: Record<string, unknown> = {
      status,
      updatedAt: Date.now(),
    };

    if (rest.cloudflareHostnameId !== undefined) {
      update.cloudflareHostnameId = rest.cloudflareHostnameId;
    }
    if (rest.sslStatus !== undefined) {
      update.sslStatus = rest.sslStatus;
    }
    if (rest.validationErrors !== undefined) {
      update.validationErrors = rest.validationErrors;
    }

    await ctx.db.patch(domainId, update);

    // If active, also set customDomain on storefront
    if (status === "active") {
      await ctx.db.patch(domain.storefrontId, {
        customDomain: domain.hostname,
        updatedAt: Date.now(),
      });
    }

    // If deleted, clear customDomain from storefront
    if (status === "deleted") {
      const storefront = await ctx.db.get(domain.storefrontId);
      if (storefront && storefront.customDomain === domain.hostname) {
        await ctx.db.patch(domain.storefrontId, {
          customDomain: undefined,
          updatedAt: Date.now(),
        });
      }
    }
  },
});

// Authenticated: remove custom domain
export const removeCustomDomain = mutation({
  args: {},
  handler: async (ctx) => {
    const seller = await requireSeller(ctx);

    const domain = await ctx.db
      .query("customDomains")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .first();

    if (!domain || domain.status === "deleted") {
      throw new Error("NO_DOMAIN");
    }

    // Mark as deleted
    await ctx.db.patch(domain._id, {
      status: "deleted" as const,
      updatedAt: Date.now(),
    });

    // Clear from storefront
    const storefront = await ctx.db.get(domain.storefrontId);
    if (storefront && storefront.customDomain === domain.hostname) {
      await ctx.db.patch(domain.storefrontId, {
        customDomain: undefined,
        updatedAt: Date.now(),
      });
    }

    return { cloudflareHostnameId: domain.cloudflareHostnameId, domainId: domain._id };
  },
});
