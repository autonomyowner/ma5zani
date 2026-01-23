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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_seller", ["sellerId"]),

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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_seller", ["sellerId"])
    .index("by_seller_status", ["sellerId", "status"]),
});
