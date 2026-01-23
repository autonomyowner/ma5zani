import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sellers: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    businessAddress: v.optional(v.object({
      street: v.string(),
      wilaya: v.string(),
      postalCode: v.string(),
    })),
    plan: v.union(v.literal("basic"), v.literal("plus"), v.literal("gros")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  products: defineTable({
    sellerId: v.id("sellers"),
    name: v.string(),
    sku: v.string(),
    stock: v.number(),
    price: v.number(),
    status: v.union(v.literal("active"), v.literal("low_stock"), v.literal("out_of_stock")),
    description: v.optional(v.string()),
    // Storefront fields - using R2 keys (strings)
    imageKeys: v.optional(v.array(v.string())),
    categoryId: v.optional(v.id("categories")),
    showOnStorefront: v.optional(v.boolean()),
    salePrice: v.optional(v.number()),
    sortOrder: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_seller", ["sellerId"])
    .index("by_category", ["categoryId"]),

  orders: defineTable({
    sellerId: v.id("sellers"),
    productId: v.id("products"),
    orderNumber: v.string(),
    customerName: v.string(),
    customerPhone: v.optional(v.string()),
    wilaya: v.string(),
    deliveryAddress: v.optional(v.string()),
    productName: v.string(),
    quantity: v.number(),
    amount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    // Storefront fields
    source: v.optional(v.union(v.literal("dashboard"), v.literal("storefront"))),
    storefrontId: v.optional(v.id("storefronts")),
    fulfillmentStatus: v.optional(v.union(
      v.literal("pending_submission"),
      v.literal("submitted_to_ma5zani"),
      v.literal("accepted"),
      v.literal("rejected")
    )),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_seller", ["sellerId"])
    .index("by_seller_status", ["sellerId", "status"])
    .index("by_storefront", ["storefrontId"]),

  storefronts: defineTable({
    sellerId: v.id("sellers"),
    slug: v.string(),
    boutiqueName: v.string(),
    logoKey: v.optional(v.string()),  // R2 key for logo
    description: v.optional(v.string()),
    theme: v.object({
      primaryColor: v.string(),
      accentColor: v.string(),
    }),
    socialLinks: v.optional(v.object({
      instagram: v.optional(v.string()),
      facebook: v.optional(v.string()),
      tiktok: v.optional(v.string()),
    })),
    settings: v.object({
      autoFulfillment: v.boolean(),
      showOutOfStock: v.boolean(),
    }),
    // Tracking & Analytics
    metaPixelId: v.optional(v.string()),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_seller", ["sellerId"])
    .index("by_slug", ["slug"]),

  categories: defineTable({
    sellerId: v.id("sellers"),
    name: v.string(),
    nameAr: v.string(),
    sortOrder: v.number(),
    createdAt: v.number(),
  })
    .index("by_seller", ["sellerId"]),
});
