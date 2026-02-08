const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ============ TELEGRAM API HELPERS ============

interface InlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
}

interface SendMessageOptions {
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
  reply_markup?: {
    inline_keyboard?: InlineKeyboardButton[][];
    remove_keyboard?: boolean;
  };
}

export async function sendMessage(
  chatId: string | number,
  text: string,
  options?: SendMessageOptions
) {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: options?.parse_mode || "HTML",
  };

  if (options?.reply_markup) {
    body.reply_markup = options.reply_markup;
  }

  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Telegram sendMessage error:", err);
  }

  return res.json();
}

export async function getFile(fileId: string) {
  const res = await fetch(`${TELEGRAM_API}/getFile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_id: fileId }),
  });

  const data = await res.json();
  return data.result?.file_path as string | undefined;
}

export async function downloadFile(filePath: string): Promise<Buffer> {
  const url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ============ COMMAND PARSING ============

interface ParsedCommand {
  command: string;
  args: string;
}

const COMMAND_ALIASES: Record<string, string> = {
  // English
  "/start": "start",
  "/help": "help",
  "/add": "add",
  "/products": "products",
  "/orders": "orders",
  "/stats": "stats",
  "/price": "price",
  "/stock": "stock",
  "/hide": "hide",
  "/show": "show",
  "/delete": "delete",
  "/cancel": "cancel",
  // Arabic
  "/مساعدة": "help",
  "/اضف": "add",
  "/منتجات": "products",
  "/طلبات": "orders",
  "/احصائيات": "stats",
  "/سعر": "price",
  "/مخزون": "stock",
  "/اخفاء": "hide",
  "/اظهار": "show",
  "/حذف": "delete",
  "/الغاء": "cancel",
};

export function parseCommand(text: string): ParsedCommand | null {
  if (!text || !text.startsWith("/")) return null;

  const parts = text.split(/\s+/);
  const rawCommand = parts[0].toLowerCase().split("@")[0]; // Remove @botname
  const command = COMMAND_ALIASES[rawCommand];

  if (!command) return null;

  return {
    command,
    args: parts.slice(1).join(" ").trim(),
  };
}

// ============ CAPTION PARSING ============

interface ParsedProduct {
  name: string;
  price: number;
  description?: string;
}

export function parseProductFromCaption(
  caption: string
): ParsedProduct | null {
  const lines = caption.split("\n").map((l) => l.trim()).filter(Boolean);

  if (lines.length < 2) return null;

  const name = lines[0];
  const priceStr = lines[1].replace(/[^\d.]/g, "");
  const price = parseFloat(priceStr);

  if (!name || isNaN(price) || price <= 0) return null;

  const description = lines.length > 2 ? lines.slice(2).join("\n") : undefined;

  return { name, price, description };
}

// ============ LANGUAGE DETECTION ============

export function detectLanguage(text: string): "ar" | "en" {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
  if (arabicRegex.test(text)) return "ar";
  return "en";
}

// ============ VERIFICATION CODE CHECK ============

export function isVerificationCode(text: string): boolean {
  return /^[A-Z0-9]{6}$/i.test(text.trim());
}

// ============ RESPONSE TEMPLATES ============

interface StatsData {
  ordersToday: number;
  pendingOrders: number;
  monthlyRevenue: number;
  totalProducts: number;
  totalOrders: number;
  deliveredOrders: number;
}

interface OrderData {
  orderNumber: string;
  customerName: string;
  productName: string;
  amount: number;
  status: string;
  wilaya: string;
  createdAt: number;
}

interface ProductData {
  _id: string;
  name: string;
  price: number;
  stock: number;
  status: string;
  showOnStorefront?: boolean;
}

const STATUS_LABELS: Record<string, Record<string, string>> = {
  ar: {
    pending: "معلق",
    processing: "قيد المعالجة",
    shipped: "تم الشحن",
    delivered: "تم التوصيل",
    cancelled: "ملغي",
    active: "نشط",
    low_stock: "مخزون منخفض",
    out_of_stock: "نفد المخزون",
  },
  en: {
    pending: "Pending",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    active: "Active",
    low_stock: "Low Stock",
    out_of_stock: "Out of Stock",
  },
};

export function formatHelpMessage(lang: "ar" | "en"): string {
  if (lang === "ar") {
    return (
      "<b>اوامر البوت:</b>\n\n" +
      "/add - اضافة منتج جديد (خطوة بخطوة)\n" +
      "/products - عرض جميع المنتجات\n" +
      "/orders - اخر الطلبات\n" +
      "/stats - احصائيات المتجر\n" +
      "/price اسم المنتج المبلغ - تحديث السعر\n" +
      "/stock اسم المنتج الكمية - تحديث المخزون\n" +
      "/hide اسم المنتج - اخفاء من المتجر\n" +
      "/show اسم المنتج - اظهار في المتجر\n" +
      "/delete اسم المنتج - حذف المنتج\n" +
      "/cancel - الغاء العملية الحالية\n\n" +
      "<b>اضافة سريعة:</b> ارسل صورة مع تعليق:\n" +
      "اسم المنتج\nالسعر\nالوصف (اختياري)"
    );
  }
  return (
    "<b>Bot Commands:</b>\n\n" +
    "/add - Add new product (step by step)\n" +
    "/products - List all products\n" +
    "/orders - Recent orders\n" +
    "/stats - Store statistics\n" +
    "/price ProductName Amount - Update price\n" +
    "/stock ProductName Quantity - Update stock\n" +
    "/hide ProductName - Hide from storefront\n" +
    "/show ProductName - Show on storefront\n" +
    "/delete ProductName - Delete product\n" +
    "/cancel - Cancel current operation\n\n" +
    "<b>Quick add:</b> Send a photo with caption:\n" +
    "Product Name\nPrice\nDescription (optional)"
  );
}

export function formatStatsMessage(
  stats: StatsData,
  lang: "ar" | "en"
): string {
  if (lang === "ar") {
    return (
      "<b>احصائيات المتجر</b>\n\n" +
      `طلبات اليوم: <b>${stats.ordersToday}</b>\n` +
      `طلبات معلقة: <b>${stats.pendingOrders}</b>\n` +
      `ايرادات الشهر: <b>${stats.monthlyRevenue.toLocaleString()} دج</b>\n` +
      `اجمالي المنتجات: <b>${stats.totalProducts}</b>\n` +
      `اجمالي الطلبات: <b>${stats.totalOrders}</b>\n` +
      `طلبات تم توصيلها: <b>${stats.deliveredOrders}</b>`
    );
  }
  return (
    "<b>Store Statistics</b>\n\n" +
    `Orders today: <b>${stats.ordersToday}</b>\n` +
    `Pending orders: <b>${stats.pendingOrders}</b>\n` +
    `Monthly revenue: <b>${stats.monthlyRevenue.toLocaleString()} DZD</b>\n` +
    `Total products: <b>${stats.totalProducts}</b>\n` +
    `Total orders: <b>${stats.totalOrders}</b>\n` +
    `Delivered orders: <b>${stats.deliveredOrders}</b>`
  );
}

export function formatOrdersMessage(
  orders: OrderData[],
  lang: "ar" | "en"
): string {
  if (orders.length === 0) {
    return lang === "ar" ? "لا توجد طلبات بعد." : "No orders yet.";
  }

  const labels = STATUS_LABELS[lang];
  const header =
    lang === "ar"
      ? `<b>اخر ${orders.length} طلبات:</b>\n\n`
      : `<b>Last ${orders.length} orders:</b>\n\n`;

  const lines = orders.map((o) => {
    const date = new Date(o.createdAt).toLocaleDateString("en-GB");
    const statusLabel = labels[o.status] || o.status;
    return (
      `<b>${o.orderNumber}</b>\n` +
      `${o.customerName} - ${o.wilaya}\n` +
      `${o.productName} - ${o.amount.toLocaleString()} ${lang === "ar" ? "دج" : "DZD"}\n` +
      `${statusLabel} | ${date}`
    );
  });

  return header + lines.join("\n\n");
}

export function formatProductsMessage(
  products: ProductData[],
  lang: "ar" | "en"
): string {
  if (products.length === 0) {
    return lang === "ar" ? "لا توجد منتجات بعد." : "No products yet.";
  }

  const labels = STATUS_LABELS[lang];
  const header =
    lang === "ar"
      ? `<b>منتجاتك (${products.length}):</b>\n\n`
      : `<b>Your products (${products.length}):</b>\n\n`;

  const lines = products.map((p, i) => {
    const statusLabel = labels[p.status] || p.status;
    const visibility =
      p.showOnStorefront !== false
        ? ""
        : lang === "ar"
          ? " [مخفي]"
          : " [hidden]";
    return (
      `${i + 1}. <b>${p.name}</b>${visibility}\n` +
      `   ${p.price.toLocaleString()} ${lang === "ar" ? "دج" : "DZD"} | ` +
      `${lang === "ar" ? "المخزون" : "Stock"}: ${p.stock} | ${statusLabel}`
    );
  });

  return header + lines.join("\n\n");
}

export function formatProductCreatedMessage(
  name: string,
  price: number,
  stock: number,
  lang: "ar" | "en"
): string {
  if (lang === "ar") {
    return (
      `تم اضافة المنتج بنجاح\n\n` +
      `<b>${name}</b>\n` +
      `السعر: ${price.toLocaleString()} دج\n` +
      `المخزون: ${stock}`
    );
  }
  return (
    `Product added successfully\n\n` +
    `<b>${name}</b>\n` +
    `Price: ${price.toLocaleString()} DZD\n` +
    `Stock: ${stock}`
  );
}
