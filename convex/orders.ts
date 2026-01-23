import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireSeller } from "./auth";

export const getOrders = query({
  args: {
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    )),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    if (args.status) {
      return await ctx.db
        .query("orders")
        .withIndex("by_seller_status", (q) =>
          q.eq("sellerId", seller._id).eq("status", args.status!)
        )
        .collect();
    }

    return await ctx.db
      .query("orders")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .collect();
  },
});

export const createOrder = mutation({
  args: {
    productId: v.id("products"),
    customerName: v.string(),
    customerPhone: v.optional(v.string()),
    wilaya: v.string(),
    deliveryAddress: v.optional(v.string()),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    const product = await ctx.db.get(args.productId);
    if (!product || product.sellerId !== seller._id) {
      throw new Error("Product not found");
    }

    if (product.stock < args.quantity) {
      throw new Error("Insufficient stock");
    }

    const now = Date.now();
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

    const orderId = await ctx.db.insert("orders", {
      sellerId: seller._id,
      productId: args.productId,
      orderNumber,
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      wilaya: args.wilaya,
      deliveryAddress: args.deliveryAddress,
      productName: product.name,
      quantity: args.quantity,
      amount: product.price * args.quantity,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Update product stock
    const newStock = product.stock - args.quantity;
    let newStatus: "active" | "low_stock" | "out_of_stock" = "active";
    if (newStock === 0) {
      newStatus = "out_of_stock";
    } else if (newStock <= 10) {
      newStatus = "low_stock";
    }

    await ctx.db.patch(args.productId, {
      stock: newStock,
      status: newStatus,
      updatedAt: now,
    });

    return orderId;
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    const order = await ctx.db.get(args.orderId);
    if (!order || order.sellerId !== seller._id) {
      throw new Error("Order not found");
    }

    // If cancelling, restore stock
    if (args.status === "cancelled" && order.status !== "cancelled") {
      const product = await ctx.db.get(order.productId);
      if (product) {
        const newStock = product.stock + order.quantity;
        let newStatus: "active" | "low_stock" | "out_of_stock" = "active";
        if (newStock === 0) {
          newStatus = "out_of_stock";
        } else if (newStock <= 10) {
          newStatus = "low_stock";
        }

        await ctx.db.patch(order.productId, {
          stock: newStock,
          status: newStatus,
          updatedAt: Date.now(),
        });
      }
    }

    await ctx.db.patch(args.orderId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return args.orderId;
  },
});
