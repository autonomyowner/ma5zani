import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const getStorefrontProducts = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const storefront = await ctx.db
      .query("storefronts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug.toLowerCase()))
      .first();

    if (!storefront || !storefront.isPublished) {
      return null;
    }

    const products = await ctx.db
      .query("products")
      .withIndex("by_seller", (q) => q.eq("sellerId", storefront.sellerId))
      .filter((q) => q.eq(q.field("showOnStorefront"), true))
      .take(200);

    // Filter out-of-stock products if setting is off
    const filteredProducts = storefront.settings.showOutOfStock
      ? products
      : products.filter((p) => p.status !== "out_of_stock");

    // Sort by sortOrder
    filteredProducts.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    // Get categories
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_seller", (q) => q.eq("sellerId", storefront.sellerId))
      .collect();

    return {
      products: filteredProducts,
      categories: categories.sort((a, b) => a.sortOrder - b.sortOrder),
    };
  },
});

export const getPublicProduct = query({
  args: {
    slug: v.string(),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    // Get storefront by slug
    const storefront = await ctx.db
      .query("storefronts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug.toLowerCase()))
      .first();

    if (!storefront || !storefront.isPublished) {
      return null;
    }

    // Get product
    const product = await ctx.db.get(args.productId);
    if (!product || product.sellerId !== storefront.sellerId || !product.showOnStorefront) {
      return null;
    }

    // Get category if exists
    let category = null;
    if (product.categoryId) {
      category = await ctx.db.get(product.categoryId);
    }

    // Get related products (same category or same seller, excluding current)
    let relatedProducts = await ctx.db
      .query("products")
      .withIndex("by_seller", (q) => q.eq("sellerId", storefront.sellerId))
      .filter((q) =>
        q.and(
          q.eq(q.field("showOnStorefront"), true),
          q.neq(q.field("_id"), args.productId)
        )
      )
      .take(4);

    // Prioritize same category
    if (product.categoryId) {
      const sameCategory = relatedProducts.filter(p => p.categoryId === product.categoryId);
      const otherCategory = relatedProducts.filter(p => p.categoryId !== product.categoryId);
      relatedProducts = [...sameCategory, ...otherCategory].slice(0, 4);
    }

    return {
      product,
      category,
      relatedProducts,
      storefront,
    };
  },
});

export const createPublicOrder = mutation({
  args: {
    storefrontSlug: v.string(),
    items: v.array(v.object({
      productId: v.id("products"),
      quantity: v.number(),
      selectedSize: v.optional(v.string()),
      selectedColor: v.optional(v.string()),
    })),
    customerName: v.string(),
    customerPhone: v.string(),
    wilaya: v.string(),
    commune: v.optional(v.string()),
    deliveryType: v.optional(v.union(v.literal("office"), v.literal("home"))),
    deliveryAddress: v.string(),
    deliveryFee: v.optional(v.number()),
    source: v.optional(v.union(v.literal("storefront"), v.literal("landing_page"))),
  },
  handler: async (ctx, args) => {
    const storefront = await ctx.db
      .query("storefronts")
      .withIndex("by_slug", (q) => q.eq("slug", args.storefrontSlug.toLowerCase()))
      .first();

    if (!storefront || !storefront.isPublished) {
      throw new Error("Storefront not found");
    }

    const now = Date.now();
    const orderIds: Id<"orders">[] = [];
    const productNames: string[] = [];
    let firstOrderNumber = "";
    let totalQuantity = 0;

    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (!product || product.sellerId !== storefront.sellerId) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      if (!product.showOnStorefront) {
        throw new Error(`Product not available: ${product.name}`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      // Calculate price (use sale price if available)
      const unitPrice = product.salePrice ?? product.price;
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

      const orderId = await ctx.db.insert("orders", {
        sellerId: storefront.sellerId,
        productId: item.productId,
        orderNumber,
        customerName: args.customerName,
        customerPhone: args.customerPhone,
        wilaya: args.wilaya,
        commune: args.commune,
        deliveryType: args.deliveryType,
        deliveryAddress: args.deliveryAddress,
        productName: product.name,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        amount: unitPrice * item.quantity,
        deliveryFee: args.deliveryFee,
        status: "pending",
        source: args.source || "storefront",
        storefrontId: storefront._id,
        fulfillmentStatus: storefront.settings.autoFulfillment
          ? "submitted_to_ma5zani"
          : "pending_submission",
        createdAt: now,
        updatedAt: now,
      });

      orderIds.push(orderId);
      productNames.push(product.name);
      totalQuantity += item.quantity;
      if (!firstOrderNumber) firstOrderNumber = orderNumber;

      // Update product stock
      const newStock = product.stock - item.quantity;
      let newStatus: "active" | "low_stock" | "out_of_stock" = "active";
      if (newStock === 0) {
        newStatus = "out_of_stock";
      } else if (newStock <= 10) {
        newStatus = "low_stock";
      }

      await ctx.db.patch(item.productId, {
        stock: newStock,
        status: newStatus,
        updatedAt: now,
      });
    }

    // Send push notification to seller
    let notificationAmount = 0;
    for (const oid of orderIds) {
      const o = await ctx.db.get(oid);
      if (o) notificationAmount += o.amount;
    }

    await ctx.scheduler.runAfter(0, internal.notifications.sendNewOrderNotification, {
      sellerId: storefront.sellerId,
      customerName: args.customerName,
      orderAmount: notificationAmount,
    });

    // Send email notification to seller
    await ctx.scheduler.runAfter(0, internal.notifications.sendOrderEmailNotification, {
      sellerId: storefront.sellerId,
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      orderAmount: notificationAmount,
      wilaya: args.wilaya,
      productName: productNames.join(", "),
      quantity: totalQuantity,
      orderNumber: firstOrderNumber,
    });

    return { orderIds, orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}` };
  },
});

export const getPublicOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order || (order.source !== "storefront" && order.source !== "landing_page")) {
      return null;
    }

    return {
      orderNumber: order.orderNumber,
      productName: order.productName,
      quantity: order.quantity,
      selectedSize: order.selectedSize,
      selectedColor: order.selectedColor,
      amount: order.amount,
      deliveryFee: order.deliveryFee,
      status: order.status,
      customerName: order.customerName,
      wilaya: order.wilaya,
      commune: order.commune,
      deliveryType: order.deliveryType,
      createdAt: order.createdAt,
    };
  },
});
