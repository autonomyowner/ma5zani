import { query } from "./_generated/server";
import { requireSeller } from "./auth";

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const seller = await requireSeller(ctx);

    const now = Date.now();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodayMs = startOfToday.getTime();

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startOfMonthMs = startOfMonth.getTime();

    // Get all orders for this seller
    const allOrders = await ctx.db
      .query("orders")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .collect();

    // Orders today
    const ordersToday = allOrders.filter(
      (order) => order.createdAt >= startOfTodayMs
    ).length;

    // Pending orders
    const pendingOrders = allOrders.filter(
      (order) => order.status === "pending" || order.status === "processing"
    ).length;

    // Monthly revenue (delivered orders only)
    const monthlyRevenue = allOrders
      .filter(
        (order) =>
          order.createdAt >= startOfMonthMs && order.status === "delivered"
      )
      .reduce((sum, order) => sum + order.amount, 0);

    // Total products
    const products = await ctx.db
      .query("products")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .collect();
    const totalProducts = products.length;

    return {
      ordersToday,
      pendingOrders,
      monthlyRevenue,
      totalProducts,
    };
  },
});
