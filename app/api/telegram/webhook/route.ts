import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  sendMessage,
  parseCommand,
  parseProductFromCaption,
  isVerificationCode,
  detectLanguage,
  getFile,
  downloadFile,
  formatHelpMessage,
  formatStatsMessage,
  formatOrdersMessage,
  formatProductsMessage,
  formatProductCreatedMessage,
} from "@/lib/telegram";
import { uploadBufferToR2 } from "@/lib/r2-server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Telegram update types
interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
}

interface TelegramPhoto {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
}

interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: { id: number };
  text?: string;
  caption?: string;
  photo?: TelegramPhoto[];
}

interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json();

    // Handle callback queries (inline button presses)
    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
      return NextResponse.json({ ok: true });
    }

    const message = update.message;
    if (!message || !message.from) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const telegramUserId = String(message.from.id);
    const telegramUsername = message.from.username;
    const text = message.text?.trim() || "";
    const caption = message.caption?.trim() || "";

    // 1. Check for /start command
    if (text === "/start") {
      await sendMessage(
        chatId,
        "Welcome to ma5zani Bot!\n\n" +
          "To connect your store, generate a code from your dashboard " +
          "(Dashboard > Telegram) and send it here.\n\n" +
          "مرحبا بك في بوت مخزني!\n\n" +
          "لربط متجرك، انشئ رمز من لوحة التحكم " +
          "(لوحة التحكم > تيليجرام) وارسله هنا."
      );
      return NextResponse.json({ ok: true });
    }

    // 2. Check for verification code (6 alphanumeric chars)
    if (isVerificationCode(text)) {
      await handleVerification(chatId, telegramUserId, telegramUsername, text);
      return NextResponse.json({ ok: true });
    }

    // 3. Look up seller by Telegram userId
    const seller = await convex.query(api.telegram.getSellerByTelegramUser, {
      telegramUserId,
    });

    if (!seller) {
      const lang = detectLanguage(text || caption);
      await sendMessage(
        chatId,
        lang === "ar"
          ? "حسابك غير مربوط. انشئ رمز من لوحة التحكم (تيليجرام) وارسله هنا."
          : "Your account is not linked. Generate a code from your dashboard (Telegram) and send it here."
      );
      return NextResponse.json({ ok: true });
    }

    const lang = detectLanguage(text || caption || "en");

    // 4. Check for /cancel command first
    const parsed = parseCommand(text);
    if (parsed?.command === "cancel") {
      await convex.mutation(api.telegram.deleteSession, { telegramUserId });
      await sendMessage(
        chatId,
        lang === "ar" ? "تم الغاء العملية." : "Operation cancelled."
      );
      return NextResponse.json({ ok: true });
    }

    // 5. Check for active session (guided flow)
    const session = await convex.query(api.telegram.getSession, {
      telegramUserId,
    });

    if (session) {
      await handleSession(
        chatId,
        telegramUserId,
        seller._id,
        session,
        message,
        lang
      );
      return NextResponse.json({ ok: true });
    }

    // 6. Handle photo without command → quick product creation
    if (message.photo && message.photo.length > 0) {
      await handleQuickPhotoAdd(
        chatId,
        telegramUserId,
        seller._id,
        message,
        lang
      );
      return NextResponse.json({ ok: true });
    }

    // 7. Parse and route commands
    if (parsed) {
      await handleCommand(
        chatId,
        telegramUserId,
        seller._id,
        parsed,
        lang
      );
      return NextResponse.json({ ok: true });
    }

    // 8. Unknown message
    await sendMessage(
      chatId,
      lang === "ar"
        ? "لم افهم. ارسل /help لعرض الاوامر."
        : "I didn't understand. Send /help to see commands."
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}

// ============ VERIFICATION ============

async function handleVerification(
  chatId: number,
  telegramUserId: string,
  telegramUsername: string | undefined,
  code: string
) {
  const result = await convex.mutation(api.telegram.verifyTelegramCode, {
    code: code.toUpperCase(),
    telegramUserId,
    telegramUsername,
  });

  if (result.success) {
    await sendMessage(
      chatId,
      `Account linked successfully! Welcome, ${result.sellerName}.\n` +
        `تم ربط الحساب بنجاح! مرحبا، ${result.sellerName}.\n\n` +
        `Send /help for available commands.\n` +
        `ارسل /help لعرض الاوامر المتاحة.`
    );
  } else if (result.error === "expired_code") {
    await sendMessage(
      chatId,
      "Code expired. Generate a new one from your dashboard.\n" +
        "انتهت صلاحية الرمز. انشئ رمز جديد من لوحة التحكم."
    );
  } else if (result.error === "already_linked") {
    await sendMessage(
      chatId,
      "This Telegram account is already linked to another store.\n" +
        "حساب تيليجرام مربوط بمتجر اخر."
    );
  } else {
    await sendMessage(
      chatId,
      "Invalid code. Check and try again.\n" +
        "رمز غير صحيح. تحقق وحاول مرة اخرى."
    );
  }
}

// ============ COMMAND HANDLER ============

async function handleCommand(
  chatId: number,
  telegramUserId: string,
  sellerId: Id<"sellers">,
  parsed: { command: string; args: string },
  lang: "ar" | "en"
) {
  switch (parsed.command) {
    case "help":
      await sendMessage(chatId, formatHelpMessage(lang));
      break;

    case "add":
      await startGuidedAdd(chatId, telegramUserId, sellerId, lang);
      break;

    case "products":
      await handleProductsList(chatId, telegramUserId, lang);
      break;

    case "orders":
      await handleOrdersList(chatId, telegramUserId, lang);
      break;

    case "stats":
      await handleStats(chatId, telegramUserId, lang);
      break;

    case "price":
      await handleQuickPrice(chatId, telegramUserId, parsed.args, lang);
      break;

    case "stock":
      await handleQuickStock(chatId, telegramUserId, parsed.args, lang);
      break;

    case "hide":
      await handleVisibility(chatId, telegramUserId, parsed.args, false, lang);
      break;

    case "show":
      await handleVisibility(chatId, telegramUserId, parsed.args, true, lang);
      break;

    case "delete":
      await handleDeleteStart(chatId, telegramUserId, parsed.args, lang);
      break;

    default:
      await sendMessage(
        chatId,
        lang === "ar"
          ? "امر غير معروف. ارسل /help لعرض الاوامر."
          : "Unknown command. Send /help to see commands."
      );
  }
}

// ============ PRODUCTS LIST ============

async function handleProductsList(
  chatId: number,
  telegramUserId: string,
  lang: "ar" | "en"
) {
  const products = await convex.query(api.telegram.getProductsBySeller, {
    telegramUserId,
  });

  await sendMessage(chatId, formatProductsMessage(products, lang));
}

// ============ ORDERS LIST ============

async function handleOrdersList(
  chatId: number,
  telegramUserId: string,
  lang: "ar" | "en"
) {
  const orders = await convex.query(api.telegram.getOrdersBySeller, {
    telegramUserId,
    limit: 10,
  });

  await sendMessage(chatId, formatOrdersMessage(orders, lang));
}

// ============ STATS ============

async function handleStats(
  chatId: number,
  telegramUserId: string,
  lang: "ar" | "en"
) {
  const stats = await convex.query(api.telegram.getStatsBySeller, {
    telegramUserId,
  });

  if (!stats) {
    await sendMessage(
      chatId,
      lang === "ar" ? "لا توجد بيانات." : "No data available."
    );
    return;
  }

  await sendMessage(chatId, formatStatsMessage(stats, lang));
}

// ============ QUICK PRICE UPDATE ============

async function handleQuickPrice(
  chatId: number,
  telegramUserId: string,
  args: string,
  lang: "ar" | "en"
) {
  // Parse: "Product Name 1500" — last word is the price
  const parts = args.trim().split(/\s+/);
  if (parts.length < 2) {
    await sendMessage(
      chatId,
      lang === "ar"
        ? "الصيغة: /price اسم المنتج السعر\nمثال: /price شامبو 1500"
        : "Format: /price Product Name Price\nExample: /price Shampoo 1500"
    );
    return;
  }

  const priceStr = parts[parts.length - 1];
  const price = parseFloat(priceStr);
  if (isNaN(price) || price <= 0) {
    await sendMessage(
      chatId,
      lang === "ar" ? "السعر غير صحيح." : "Invalid price."
    );
    return;
  }

  const searchName = parts.slice(0, -1).join(" ");
  const products = await convex.query(api.telegram.findProductByName, {
    telegramUserId,
    searchName,
  });

  if (products.length === 0) {
    await sendMessage(
      chatId,
      lang === "ar"
        ? `لم يتم العثور على منتج باسم "${searchName}"`
        : `No product found with name "${searchName}"`
    );
    return;
  }

  const product = products[0];
  await convex.mutation(api.telegram.updateProductViaTelegram, {
    telegramUserId,
    productId: product._id as Id<"products">,
    price,
  });

  await sendMessage(
    chatId,
    lang === "ar"
      ? `تم تحديث سعر <b>${product.name}</b> الى ${price.toLocaleString()} دج`
      : `Updated <b>${product.name}</b> price to ${price.toLocaleString()} DZD`
  );
}

// ============ QUICK STOCK UPDATE ============

async function handleQuickStock(
  chatId: number,
  telegramUserId: string,
  args: string,
  lang: "ar" | "en"
) {
  const parts = args.trim().split(/\s+/);
  if (parts.length < 2) {
    await sendMessage(
      chatId,
      lang === "ar"
        ? "الصيغة: /stock اسم المنتج الكمية\nمثال: /stock شامبو 50"
        : "Format: /stock Product Name Quantity\nExample: /stock Shampoo 50"
    );
    return;
  }

  const stockStr = parts[parts.length - 1];
  const stock = parseInt(stockStr);
  if (isNaN(stock) || stock < 0) {
    await sendMessage(
      chatId,
      lang === "ar" ? "الكمية غير صحيحة." : "Invalid quantity."
    );
    return;
  }

  const searchName = parts.slice(0, -1).join(" ");
  const products = await convex.query(api.telegram.findProductByName, {
    telegramUserId,
    searchName,
  });

  if (products.length === 0) {
    await sendMessage(
      chatId,
      lang === "ar"
        ? `لم يتم العثور على منتج باسم "${searchName}"`
        : `No product found with name "${searchName}"`
    );
    return;
  }

  const product = products[0];
  await convex.mutation(api.telegram.updateProductViaTelegram, {
    telegramUserId,
    productId: product._id as Id<"products">,
    stock,
  });

  await sendMessage(
    chatId,
    lang === "ar"
      ? `تم تحديث مخزون <b>${product.name}</b> الى ${stock}`
      : `Updated <b>${product.name}</b> stock to ${stock}`
  );
}

// ============ VISIBILITY (HIDE/SHOW) ============

async function handleVisibility(
  chatId: number,
  telegramUserId: string,
  args: string,
  show: boolean,
  lang: "ar" | "en"
) {
  if (!args.trim()) {
    const cmdName = show ? "/show" : "/hide";
    await sendMessage(
      chatId,
      lang === "ar"
        ? `الصيغة: ${cmdName} اسم المنتج`
        : `Format: ${cmdName} Product Name`
    );
    return;
  }

  const products = await convex.query(api.telegram.findProductByName, {
    telegramUserId,
    searchName: args.trim(),
  });

  if (products.length === 0) {
    await sendMessage(
      chatId,
      lang === "ar"
        ? `لم يتم العثور على منتج باسم "${args.trim()}"`
        : `No product found with name "${args.trim()}"`
    );
    return;
  }

  const product = products[0];
  await convex.mutation(api.telegram.updateProductViaTelegram, {
    telegramUserId,
    productId: product._id as Id<"products">,
    showOnStorefront: show,
  });

  if (show) {
    await sendMessage(
      chatId,
      lang === "ar"
        ? `تم اظهار <b>${product.name}</b> في المتجر`
        : `<b>${product.name}</b> is now visible on storefront`
    );
  } else {
    await sendMessage(
      chatId,
      lang === "ar"
        ? `تم اخفاء <b>${product.name}</b> من المتجر`
        : `<b>${product.name}</b> is now hidden from storefront`
    );
  }
}

// ============ DELETE (with confirmation) ============

async function handleDeleteStart(
  chatId: number,
  telegramUserId: string,
  args: string,
  lang: "ar" | "en"
) {
  if (!args.trim()) {
    await sendMessage(
      chatId,
      lang === "ar"
        ? "الصيغة: /delete اسم المنتج"
        : "Format: /delete Product Name"
    );
    return;
  }

  const products = await convex.query(api.telegram.findProductByName, {
    telegramUserId,
    searchName: args.trim(),
  });

  if (products.length === 0) {
    await sendMessage(
      chatId,
      lang === "ar"
        ? `لم يتم العثور على منتج باسم "${args.trim()}"`
        : `No product found with name "${args.trim()}"`
    );
    return;
  }

  const product = products[0];
  await sendMessage(
    chatId,
    lang === "ar"
      ? `هل تريد حذف <b>${product.name}</b>؟`
      : `Delete <b>${product.name}</b>?`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: lang === "ar" ? "نعم، احذف" : "Yes, delete",
              callback_data: `delete:${product._id}`,
            },
            {
              text: lang === "ar" ? "الغاء" : "Cancel",
              callback_data: "delete:cancel",
            },
          ],
        ],
      },
    }
  );
}

// ============ CALLBACK QUERY HANDLER ============

async function handleCallbackQuery(query: TelegramCallbackQuery) {
  const chatId = query.message?.chat.id;
  if (!chatId || !query.data) return;

  const telegramUserId = String(query.from.id);
  const lang = "en"; // Default for callbacks

  if (query.data.startsWith("delete:")) {
    const productId = query.data.split(":")[1];

    if (productId === "cancel") {
      await sendMessage(
        chatId,
        "Cancelled. / تم الالغاء."
      );
      return;
    }

    try {
      await convex.mutation(api.telegram.deleteProductViaTelegram, {
        telegramUserId,
        productId: productId as Id<"products">,
      });

      await sendMessage(
        chatId,
        "Product deleted. / تم حذف المنتج."
      );
    } catch {
      await sendMessage(
        chatId,
        "Failed to delete product. / فشل حذف المنتج."
      );
    }
  }

  if (query.data.startsWith("confirm_add:")) {
    const action = query.data.split(":")[1];
    if (action === "yes") {
      await finalizeGuidedAdd(chatId, telegramUserId, lang);
    } else {
      await convex.mutation(api.telegram.deleteSession, { telegramUserId });
      await sendMessage(chatId, "Cancelled. / تم الالغاء.");
    }
  }
}

// ============ QUICK PHOTO ADD ============

async function handleQuickPhotoAdd(
  chatId: number,
  telegramUserId: string,
  sellerId: Id<"sellers">,
  message: TelegramMessage,
  lang: "ar" | "en"
) {
  const caption = message.caption || "";
  const parsed = parseProductFromCaption(caption);

  if (!parsed) {
    await sendMessage(
      chatId,
      lang === "ar"
        ? "لاضافة منتج مع صورة، ارسل صورة مع تعليق:\nاسم المنتج\nالسعر\nالوصف (اختياري)\n\nاو ارسل /add للاضافة خطوة بخطوة."
        : "To add a product with photo, send a photo with caption:\nProduct Name\nPrice\nDescription (optional)\n\nOr send /add for step-by-step."
    );
    return;
  }

  // Download and upload photo to R2
  let imageKeys: string[] | undefined;
  try {
    const photos = message.photo!;
    const largestPhoto = photos[photos.length - 1]; // Largest resolution
    const filePath = await getFile(largestPhoto.file_id);
    if (filePath) {
      const buffer = await downloadFile(filePath);
      const key = await uploadBufferToR2(
        buffer,
        "image/jpeg",
        String(sellerId)
      );
      imageKeys = [key];
    }
  } catch (err) {
    console.error("Photo upload error:", err);
  }

  try {
    await convex.mutation(api.telegram.createProductViaTelegram, {
      telegramUserId,
      name: parsed.name,
      price: parsed.price,
      stock: 10,
      description: parsed.description,
      imageKeys,
    });

    await sendMessage(
      chatId,
      formatProductCreatedMessage(parsed.name, parsed.price, 10, lang)
    );
  } catch (err) {
    console.error("Product creation error:", err);
    await sendMessage(
      chatId,
      lang === "ar" ? "فشل اضافة المنتج." : "Failed to add product."
    );
  }
}

// ============ GUIDED ADD FLOW ============

async function startGuidedAdd(
  chatId: number,
  telegramUserId: string,
  sellerId: Id<"sellers">,
  lang: "ar" | "en"
) {
  await convex.mutation(api.telegram.upsertSession, {
    telegramUserId,
    sellerId,
    command: "add",
    step: 1,
    data: {},
  });

  await sendMessage(
    chatId,
    lang === "ar"
      ? "اضافة منتج جديد\n\nالخطوة 1/5: ارسل صورة المنتج (او ارسل 'تخطي')"
      : "Adding new product\n\nStep 1/5: Send product photo (or send 'skip')"
  );
}

interface SessionData {
  command: string;
  step: number;
  data: {
    name?: string;
    price?: number;
    stock?: number;
    description?: string;
    imageKeys?: string[];
    productId?: string;
  };
}

async function handleSession(
  chatId: number,
  telegramUserId: string,
  sellerId: Id<"sellers">,
  session: SessionData,
  message: TelegramMessage,
  lang: "ar" | "en"
) {
  if (session.command !== "add") return;

  const text = message.text?.trim() || "";
  const step = session.step;
  const data = { ...session.data };

  // Step 1: Photo
  if (step === 1) {
    if (text.toLowerCase() === "skip" || text === "تخطي") {
      await convex.mutation(api.telegram.upsertSession, {
        telegramUserId,
        sellerId,
        command: "add",
        step: 2,
        data,
      });
      await sendMessage(
        chatId,
        lang === "ar"
          ? "الخطوة 2/5: ارسل اسم المنتج"
          : "Step 2/5: Send product name"
      );
      return;
    }

    if (message.photo && message.photo.length > 0) {
      try {
        const photos = message.photo;
        const largestPhoto = photos[photos.length - 1];
        const filePath = await getFile(largestPhoto.file_id);
        if (filePath) {
          const buffer = await downloadFile(filePath);
          const key = await uploadBufferToR2(
            buffer,
            "image/jpeg",
            String(sellerId)
          );
          data.imageKeys = [key];
        }
      } catch (err) {
        console.error("Photo upload error:", err);
      }

      await convex.mutation(api.telegram.upsertSession, {
        telegramUserId,
        sellerId,
        command: "add",
        step: 2,
        data,
      });
      await sendMessage(
        chatId,
        lang === "ar"
          ? "تم رفع الصورة.\n\nالخطوة 2/5: ارسل اسم المنتج"
          : "Photo uploaded.\n\nStep 2/5: Send product name"
      );
      return;
    }

    await sendMessage(
      chatId,
      lang === "ar"
        ? "ارسل صورة او 'تخطي'"
        : "Send a photo or 'skip'"
    );
    return;
  }

  // Step 2: Name
  if (step === 2) {
    if (!text) {
      await sendMessage(
        chatId,
        lang === "ar" ? "ارسل اسم المنتج" : "Send product name"
      );
      return;
    }
    data.name = text;
    await convex.mutation(api.telegram.upsertSession, {
      telegramUserId,
      sellerId,
      command: "add",
      step: 3,
      data,
    });
    await sendMessage(
      chatId,
      lang === "ar"
        ? "الخطوة 3/5: ارسل السعر (رقم فقط)"
        : "Step 3/5: Send price (number only)"
    );
    return;
  }

  // Step 3: Price
  if (step === 3) {
    const price = parseFloat(text.replace(/[^\d.]/g, ""));
    if (isNaN(price) || price <= 0) {
      await sendMessage(
        chatId,
        lang === "ar"
          ? "ارسل رقم صحيح للسعر"
          : "Send a valid price number"
      );
      return;
    }
    data.price = price;
    await convex.mutation(api.telegram.upsertSession, {
      telegramUserId,
      sellerId,
      command: "add",
      step: 4,
      data,
    });
    await sendMessage(
      chatId,
      lang === "ar"
        ? "الخطوة 4/5: ارسل كمية المخزون (رقم فقط)"
        : "Step 4/5: Send stock quantity (number only)"
    );
    return;
  }

  // Step 4: Stock
  if (step === 4) {
    const stock = parseInt(text);
    if (isNaN(stock) || stock < 0) {
      await sendMessage(
        chatId,
        lang === "ar"
          ? "ارسل رقم صحيح للمخزون"
          : "Send a valid stock number"
      );
      return;
    }
    data.stock = stock;
    await convex.mutation(api.telegram.upsertSession, {
      telegramUserId,
      sellerId,
      command: "add",
      step: 5,
      data,
    });
    await sendMessage(
      chatId,
      lang === "ar"
        ? "الخطوة 5/5: ارسل وصف المنتج (او 'تخطي')"
        : "Step 5/5: Send product description (or 'skip')"
    );
    return;
  }

  // Step 5: Description
  if (step === 5) {
    if (text.toLowerCase() !== "skip" && text !== "تخطي") {
      data.description = text;
    }

    await convex.mutation(api.telegram.upsertSession, {
      telegramUserId,
      sellerId,
      command: "add",
      step: 6,
      data,
    });

    const currency = lang === "ar" ? "دج" : "DZD";
    const summary =
      lang === "ar"
        ? `<b>تاكيد المنتج:</b>\n\nالاسم: ${data.name}\nالسعر: ${data.price?.toLocaleString()} ${currency}\nالمخزون: ${data.stock}\n${data.description ? `الوصف: ${data.description}\n` : ""}${data.imageKeys ? "الصورة: مرفقة\n" : ""}`
        : `<b>Confirm product:</b>\n\nName: ${data.name}\nPrice: ${data.price?.toLocaleString()} ${currency}\nStock: ${data.stock}\n${data.description ? `Description: ${data.description}\n` : ""}${data.imageKeys ? "Photo: attached\n" : ""}`;

    await sendMessage(chatId, summary, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: lang === "ar" ? "تاكيد" : "Confirm",
              callback_data: "confirm_add:yes",
            },
            {
              text: lang === "ar" ? "الغاء" : "Cancel",
              callback_data: "confirm_add:no",
            },
          ],
        ],
      },
    });
    return;
  }
}

async function finalizeGuidedAdd(
  chatId: number,
  telegramUserId: string,
  lang: "ar" | "en"
) {
  const session = await convex.query(api.telegram.getSession, {
    telegramUserId,
  });

  if (!session || session.command !== "add") {
    await sendMessage(
      chatId,
      lang === "ar" ? "لا توجد عملية نشطة." : "No active operation."
    );
    return;
  }

  const { name, price, stock, description, imageKeys } = session.data;

  if (!name || !price) {
    await sendMessage(
      chatId,
      lang === "ar" ? "بيانات ناقصة." : "Missing data."
    );
    await convex.mutation(api.telegram.deleteSession, { telegramUserId });
    return;
  }

  try {
    await convex.mutation(api.telegram.createProductViaTelegram, {
      telegramUserId,
      name,
      price,
      stock: stock ?? 10,
      description,
      imageKeys,
    });

    await sendMessage(
      chatId,
      formatProductCreatedMessage(name, price, stock ?? 10, lang)
    );
  } catch (err) {
    console.error("Guided add error:", err);
    await sendMessage(
      chatId,
      lang === "ar" ? "فشل اضافة المنتج." : "Failed to add product."
    );
  }

  await convex.mutation(api.telegram.deleteSession, { telegramUserId });
}
