import { internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const sendNewOrderNotification = internalAction({
  args: {
    sellerId: v.id("sellers"),
    customerName: v.string(),
    orderAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const seller = await ctx.runQuery(internal.notifications.getSellerPushToken, {
      sellerId: args.sellerId,
    });

    if (!seller?.expoPushToken) {
      return;
    }

    const message = {
      to: seller.expoPushToken,
      sound: "soundofmoney.mp3",
      channelId: "orders-v2",
      title: "طلب جديد | Nouvelle commande",
      body: `${args.customerName} - ${args.orderAmount} دج`,
      data: { type: "new_order" },
    };

    try {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error("Failed to send push notification:", error);
    }
  },
});

export const getSellerPushToken = internalQuery({
  args: { sellerId: v.id("sellers") },
  handler: async (ctx, args) => {
    const seller = await ctx.db.get(args.sellerId);
    if (!seller) return null;
    return { expoPushToken: seller.expoPushToken };
  },
});

export const getSellerEmailInfo = internalQuery({
  args: { sellerId: v.id("sellers") },
  handler: async (ctx, args) => {
    const seller = await ctx.db.get(args.sellerId);
    if (!seller) return null;
    return {
      email: seller.email,
      name: seller.name,
      emailNotifications: seller.emailNotifications,
    };
  },
});

export const sendOrderEmailNotification = internalAction({
  args: {
    sellerId: v.id("sellers"),
    customerName: v.string(),
    customerPhone: v.string(),
    orderAmount: v.number(),
    wilaya: v.string(),
    productName: v.string(),
    quantity: v.number(),
    orderNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const seller = await ctx.runQuery(internal.notifications.getSellerEmailInfo, {
      sellerId: args.sellerId,
    });

    if (!seller?.email || seller.emailNotifications === false) {
      return;
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY not set");
      return;
    }

    const emailHtml = `
<!DOCTYPE html>
<html dir="rtl">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:20px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:#0054A6;padding:24px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;">طلب جديد | New Order</h1>
    </div>
    <div style="padding:24px;">
      <p style="color:#334155;font-size:16px;margin:0 0 20px;">
        مرحباً ${seller.name}، لديك طلب جديد!
        <br><span style="color:#64748b;font-size:14px;">Hello ${seller.name}, you have a new order!</span>
      </p>
      <div style="background:#f1f5f9;border-radius:8px;padding:16px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:14px;">رقم الطلب / Order #</td>
            <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:bold;text-align:left;">${args.orderNumber}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:14px;">العميل / Customer</td>
            <td style="padding:8px 0;color:#0f172a;font-size:14px;text-align:left;">${args.customerName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:14px;">الهاتف / Phone</td>
            <td style="padding:8px 0;color:#0f172a;font-size:14px;text-align:left;">${args.customerPhone}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:14px;">المنتج / Product</td>
            <td style="padding:8px 0;color:#0f172a;font-size:14px;text-align:left;">${args.productName} x${args.quantity}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:14px;">الولاية / Wilaya</td>
            <td style="padding:8px 0;color:#0f172a;font-size:14px;text-align:left;">${args.wilaya}</td>
          </tr>
          <tr style="border-top:1px solid #e2e8f0;">
            <td style="padding:12px 0 8px;color:#64748b;font-size:14px;">المبلغ / Amount</td>
            <td style="padding:12px 0 8px;color:#0054A6;font-size:18px;font-weight:bold;text-align:left;">${args.orderAmount.toLocaleString()} د.ج</td>
          </tr>
        </table>
      </div>
      <a href="https://www.ma5zani.com/dashboard/orders" style="display:block;background:#F7941D;color:#ffffff;text-align:center;padding:14px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">
        عرض الطلب | View Order
      </a>
    </div>
    <div style="padding:16px 24px;background:#f8fafc;text-align:center;">
      <p style="margin:0;color:#94a3b8;font-size:12px;">ma5zani.com</p>
    </div>
  </div>
</body>
</html>`;

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "ma5zani <orders@ma5zani.com>",
          to: seller.email,
          subject: `طلب جديد #${args.orderNumber} - ${args.customerName} | New Order`,
          html: emailHtml,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error("Failed to send email notification:", error);
      }
    } catch (error) {
      console.error("Failed to send email notification:", error);
    }
  },
});
