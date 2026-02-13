import { query, mutation, internalQuery, internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireSeller } from "./auth";

// ============ QUERIES ============

export const getDeliverySettings = query({
  args: {},
  handler: async (ctx) => {
    const seller = await requireSeller(ctx);
    if (!seller.deliverySettings) return null;
    return {
      provider: seller.deliverySettings.provider,
      apiId: seller.deliverySettings.apiId,
      // Mask token for display: show first 4 and last 4 chars
      apiToken: seller.deliverySettings.apiToken.length > 8
        ? seller.deliverySettings.apiToken.slice(0, 4) + "****" + seller.deliverySettings.apiToken.slice(-4)
        : "****",
      originWilayaCode: seller.deliverySettings.originWilayaCode,
      isEnabled: seller.deliverySettings.isEnabled,
      defaultWeight: seller.deliverySettings.defaultWeight,
    };
  },
});

// Internal: get full credentials (not exposed to client)
export const getDeliveryCredentials = query({
  args: { sellerId: v.id("sellers") },
  handler: async (ctx, args) => {
    const seller = await ctx.db.get(args.sellerId);
    if (!seller || !seller.deliverySettings || !seller.deliverySettings.isEnabled) return null;
    return seller.deliverySettings;
  },
});

// Get delivery credentials by storefront slug (for fee API)
export const getDeliveryCredentialsBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const storefront = await ctx.db
      .query("storefronts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug.toLowerCase()))
      .first();
    if (!storefront) return null;

    const seller = await ctx.db.get(storefront.sellerId);
    if (!seller || !seller.deliverySettings || !seller.deliverySettings.isEnabled) return null;

    return {
      apiId: seller.deliverySettings.apiId,
      apiToken: seller.deliverySettings.apiToken,
      originWilayaCode: seller.deliverySettings.originWilayaCode,
    };
  },
});

// ============ MUTATIONS ============

export const updateDeliverySettings = mutation({
  args: {
    apiId: v.string(),
    apiToken: v.string(),
    originWilayaCode: v.string(),
    isEnabled: v.boolean(),
    defaultWeight: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);
    await ctx.db.patch(seller._id, {
      deliverySettings: {
        provider: "yalidine" as const,
        apiId: args.apiId,
        apiToken: args.apiToken,
        originWilayaCode: args.originWilayaCode,
        isEnabled: args.isEnabled,
        defaultWeight: args.defaultWeight,
      },
      updatedAt: Date.now(),
    });
    return seller._id;
  },
});

// Submit order to Yalidine
export const submitToYalidine = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);
    const order = await ctx.db.get(args.orderId);

    if (!order || order.sellerId !== seller._id) {
      throw new Error("Order not found");
    }
    if (order.yalidineTracking) {
      throw new Error("Order already submitted to Yalidine");
    }
    if (!seller.deliverySettings || !seller.deliverySettings.isEnabled) {
      throw new Error("Delivery settings not configured");
    }

    // Mark as submitting
    await ctx.db.patch(args.orderId, {
      yalidineStatus: "submitting",
      updatedAt: Date.now(),
    });

    // Schedule async action
    await ctx.scheduler.runAfter(0, internal.delivery.sendToYalidineAction, {
      orderId: args.orderId,
      sellerId: seller._id,
    });
  },
});

// Cancel Yalidine parcel (only if not yet picked up)
export const cancelYalidineParcel = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);
    const order = await ctx.db.get(args.orderId);

    if (!order || order.sellerId !== seller._id) {
      throw new Error("Order not found");
    }
    if (!order.yalidineTracking) {
      throw new Error("No tracking number to cancel");
    }

    await ctx.db.patch(args.orderId, {
      yalidineStatus: "cancelled",
      updatedAt: Date.now(),
    });
  },
});

// ============ INTERNAL ACTIONS ============

export const sendToYalidineAction = internalAction({
  args: {
    orderId: v.id("orders"),
    sellerId: v.id("sellers"),
  },
  handler: async (ctx, args) => {
    // Fetch order and seller
    const order = await ctx.runQuery(internal.delivery.internalGetOrder, { orderId: args.orderId });
    const seller = await ctx.runQuery(internal.delivery.internalGetSeller, { sellerId: args.sellerId });

    if (!order || !seller || !seller.deliverySettings) {
      await ctx.runMutation(internal.delivery.updateYalidineStatus, {
        orderId: args.orderId,
        status: "failed",
      });
      return;
    }

    const settings = seller.deliverySettings;

    try {
      // Dynamic import to keep Yalidine client code in lib/
      // Build the parcel data
      const nameParts = order.customerName.trim().split(/\s+/);
      const firstname = nameParts[0] || order.customerName;
      const familyname = nameParts.slice(1).join(" ") || firstname;

      // Map wilaya name to Yalidine format
      const wilayaNameMap: Record<string, string> = { Algiers: "Alger" };
      const toWilayaName = wilayaNameMap[order.wilaya] || order.wilaya;

      // Get origin wilaya name from code
      const originCode = parseInt(settings.originWilayaCode, 10);

      // Determine commune - use order commune or wilaya name as fallback
      const communeName = order.commune || toWilayaName;

      // COD price = product amount + delivery fee
      const codPrice = order.amount + (order.deliveryFee || 0);

      const parcelData = {
        order_id: order.orderNumber,
        from_wilaya_name: getWilayaNameByCode(originCode),
        firstname,
        familyname,
        contact_phone: order.customerPhone || "",
        address: order.deliveryAddress || "",
        to_commune_name: communeName,
        to_wilaya_name: toWilayaName,
        product_list: order.productName,
        price: codPrice,
        is_stopdesk: order.deliveryType === "office",
        has_exchange: false,
        weight: settings.defaultWeight || 1,
      };

      // Call Yalidine API
      const res = await fetch("https://api.yalidine.app/v1/parcels/", {
        method: "POST",
        headers: {
          "X-API-ID": settings.apiId,
          "X-API-TOKEN": settings.apiToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([parcelData]),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Yalidine API error: ${res.status} - ${text}`);
      }

      const data = await res.json();
      const result = Array.isArray(data) ? data[0] : data;

      if (!result.tracking) {
        throw new Error(`No tracking returned: ${JSON.stringify(result)}`);
      }

      // Success
      await ctx.runMutation(internal.delivery.updateYalidineSuccess, {
        orderId: args.orderId,
        tracking: result.tracking,
      });
    } catch (error: unknown) {
      console.error("Yalidine submission failed:", error);
      await ctx.runMutation(internal.delivery.updateYalidineStatus, {
        orderId: args.orderId,
        status: "failed",
      });
    }
  },
});

// Polling action for status sync
export const pollYalidineStatuses = internalAction({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.runQuery(internal.delivery.getPendingYalidineOrders, {});

    for (const order of orders) {
      if (!order.yalidineTracking || !order.sellerId) continue;

      const seller = await ctx.runQuery(internal.delivery.internalGetSeller, {
        sellerId: order.sellerId,
      });
      if (!seller?.deliverySettings) continue;

      try {
        const res = await fetch(
          `https://api.yalidine.app/v1/parcels/${order.yalidineTracking}`,
          {
            headers: {
              "X-API-ID": seller.deliverySettings.apiId,
              "X-API-TOKEN": seller.deliverySettings.apiToken,
            },
          }
        );

        if (!res.ok) continue;
        const data = await res.json();

        const history = data.historique || [];
        if (history.length === 0) continue;

        const latestStatus = history[history.length - 1]?.status;
        if (!latestStatus) continue;

        const mappedStatus = mapYalidineStatus(latestStatus);
        if (mappedStatus && mappedStatus !== order.yalidineStatus) {
          await ctx.runMutation(internal.delivery.updateOrderDeliveryStatus, {
            orderId: order._id,
            yalidineStatus: latestStatus,
            orderStatus: mappedStatus,
          });
        }
      } catch (err) {
        console.error(`Poll failed for ${order.yalidineTracking}:`, err);
      }
    }
  },
});

// ============ INTERNAL QUERIES ============

export const internalGetOrder = internalQuery({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

export const internalGetSeller = internalQuery({
  args: { sellerId: v.id("sellers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sellerId);
  },
});

export const getPendingYalidineOrders = internalQuery({
  args: {},
  handler: async (ctx) => {
    // Get all orders with tracking that aren't delivered or cancelled
    const allOrders = await ctx.db.query("orders").collect();
    return allOrders.filter(
      (o) =>
        o.yalidineTracking &&
        o.yalidineStatus !== "Livre" &&
        o.yalidineStatus !== "Retourne" &&
        o.status !== "delivered" &&
        o.status !== "cancelled"
    );
  },
});

// ============ INTERNAL MUTATIONS ============

export const updateYalidineStatus = internalMutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      yalidineStatus: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const updateYalidineSuccess = internalMutation({
  args: {
    orderId: v.id("orders"),
    tracking: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      yalidineTracking: args.tracking,
      yalidineStatus: "submitted",
      yalidineSubmittedAt: Date.now(),
      status: "processing",
      updatedAt: Date.now(),
    });
  },
});

export const updateOrderDeliveryStatus = internalMutation({
  args: {
    orderId: v.id("orders"),
    yalidineStatus: v.string(),
    orderStatus: v.string(),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = {
      yalidineStatus: args.yalidineStatus,
      updatedAt: Date.now(),
    };
    // Only update order status if it's a valid transition
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (validStatuses.includes(args.orderStatus)) {
      updates.status = args.orderStatus;
    }
    await ctx.db.patch(args.orderId, updates);
  },
});

// Webhook handler mutation
export const handleYalidineWebhook = internalMutation({
  args: {
    tracking: v.string(),
    newStatus: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_yalidine_tracking", (q) => q.eq("yalidineTracking", args.tracking))
      .first();

    if (!order) return;

    const mappedStatus = mapYalidineStatus(args.newStatus);
    if (!mappedStatus) return;

    const updates: Record<string, unknown> = {
      yalidineStatus: args.newStatus,
      updatedAt: Date.now(),
    };

    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (validStatuses.includes(mappedStatus)) {
      updates.status = mappedStatus;
    }

    await ctx.db.patch(order._id, updates);
  },
});

// ============ HELPERS ============

function mapYalidineStatus(yalidineStatus: string): string | null {
  const normalized = yalidineStatus.toLowerCase().trim();
  if (normalized.includes("preparation")) return "processing";
  if (normalized.includes("expedie") || normalized.includes("en cours") || normalized.includes("transfere")) return "shipped";
  if (normalized.includes("livre") || normalized.includes("delivered")) return "delivered";
  if (normalized.includes("retourne") || normalized.includes("echoue")) return "cancelled";
  return null;
}

function getWilayaNameByCode(code: number): string {
  const wilayaNames: Record<number, string> = {
    1: "Adrar", 2: "Chlef", 3: "Laghouat", 4: "Oum El Bouaghi", 5: "Batna",
    6: "Bejaia", 7: "Biskra", 8: "Bechar", 9: "Blida", 10: "Bouira",
    11: "Tamanrasset", 12: "Tebessa", 13: "Tlemcen", 14: "Tiaret", 15: "Tizi Ouzou",
    16: "Alger", 17: "Djelfa", 18: "Jijel", 19: "Setif", 20: "Saida",
    21: "Skikda", 22: "Sidi Bel Abbes", 23: "Annaba", 24: "Guelma", 25: "Constantine",
    26: "Medea", 27: "Mostaganem", 28: "M'Sila", 29: "Mascara", 30: "Ouargla",
    31: "Oran", 32: "El Bayadh", 33: "Illizi", 34: "Bordj Bou Arreridj", 35: "Boumerdes",
    36: "El Tarf", 37: "Tindouf", 38: "Tissemsilt", 39: "El Oued", 40: "Khenchela",
    41: "Souk Ahras", 42: "Tipaza", 43: "Mila", 44: "Ain Defla", 45: "Naama",
    46: "Ain Temouchent", 47: "Ghardaia", 48: "Relizane",
  };
  return wilayaNames[code] || "Alger";
}
