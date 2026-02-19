import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sellers: defineTable({
    // clerkId kept as optional for backwards compatibility during migration
    clerkId: v.optional(v.string()),
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    businessAddress: v.optional(v.object({
      street: v.string(),
      wilaya: v.string(),
      postalCode: v.string(),
    })),
    plan: v.union(v.literal("basic"), v.literal("plus"), v.literal("gros")),
    isActivated: v.optional(v.boolean()),
    activatedAt: v.optional(v.number()),
    trialEndsAt: v.optional(v.number()),
    expoPushToken: v.optional(v.string()),
    emailNotifications: v.optional(v.boolean()),
    deliverySettings: v.optional(v.object({
      provider: v.literal("yalidine"),
      apiId: v.string(),
      apiToken: v.string(),
      originWilayaCode: v.string(),
      isEnabled: v.boolean(),
      defaultWeight: v.optional(v.number()),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
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
    sizes: v.optional(v.array(v.string())),
    colors: v.optional(v.array(v.string())),
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
    commune: v.optional(v.string()),
    deliveryType: v.optional(v.union(v.literal("office"), v.literal("home"))),
    deliveryAddress: v.optional(v.string()),
    productName: v.string(),
    quantity: v.number(),
    selectedSize: v.optional(v.string()),
    selectedColor: v.optional(v.string()),
    amount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    // Storefront fields
    source: v.optional(v.union(v.literal("dashboard"), v.literal("storefront"), v.literal("landing_page"))),
    storefrontId: v.optional(v.id("storefronts")),
    fulfillmentStatus: v.optional(v.union(
      v.literal("pending_submission"),
      v.literal("submitted_to_ma5zani"),
      v.literal("accepted"),
      v.literal("rejected")
    )),
    deliveryFee: v.optional(v.number()),
    yalidineTracking: v.optional(v.string()),
    yalidineStatus: v.optional(v.string()),
    yalidineSubmittedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_seller", ["sellerId"])
    .index("by_seller_status", ["sellerId", "status"])
    .index("by_storefront", ["storefrontId"])
    .index("by_yalidine_tracking", ["yalidineTracking"]),

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

    // ============ TEMPLATE SYSTEM ============
    templateId: v.optional(v.string()), // "shopify", "minimal", "bold"

    // Extended colors
    colors: v.optional(v.object({
      primary: v.string(),
      accent: v.string(),
      background: v.string(),
      text: v.string(),
      headerBg: v.string(),
      footerBg: v.string(),
    })),

    // Sections array
    sections: v.optional(v.array(v.object({
      id: v.string(),
      type: v.string(), // "hero", "announcement", "featured", "categories", "grid", "features", "collection", "newsletter", "about"
      order: v.number(),
      enabled: v.boolean(),
      content: v.object({
        title: v.optional(v.string()),
        titleAr: v.optional(v.string()),
        subtitle: v.optional(v.string()),
        subtitleAr: v.optional(v.string()),
        imageKey: v.optional(v.string()),
        backgroundColor: v.optional(v.string()),
        textColor: v.optional(v.string()),
        ctaText: v.optional(v.string()),
        ctaTextAr: v.optional(v.string()),
        ctaLink: v.optional(v.string()),
        items: v.optional(v.array(v.any())), // For features, collections
        productsPerRow: v.optional(v.number()),
        productCount: v.optional(v.number()),
        showFilters: v.optional(v.boolean()),
        layout: v.optional(v.string()), // "grid" | "scroll"
      }),
    }))),

    // AI-generated fonts
    fonts: v.optional(v.object({
      display: v.string(),  // Font for headings
      body: v.string(),     // Font for body text
      arabic: v.string(),   // Font for Arabic text
    })),

    // AI aesthetic direction
    aestheticDirection: v.optional(v.string()),

    // Footer customization
    footer: v.optional(v.object({
      showPoweredBy: v.boolean(),
      customText: v.optional(v.string()),
      customTextAr: v.optional(v.string()),
      links: v.optional(v.array(v.object({
        label: v.string(),
        labelAr: v.optional(v.string()),
        url: v.string(),
      }))),
    })),

    customDomain: v.optional(v.string()),  // "mystore.com"

    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_seller", ["sellerId"])
    .index("by_slug", ["slug"])
    .index("by_customDomain", ["customDomain"]),

  // ============ CUSTOM DOMAINS ============

  customDomains: defineTable({
    storefrontId: v.id("storefronts"),
    sellerId: v.id("sellers"),
    hostname: v.string(),               // "mystore.com"
    cloudflareHostnameId: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),              // Waiting for DNS
      v.literal("pending_validation"),   // DNS found, SSL being issued
      v.literal("active"),               // Live
      v.literal("failed"),
      v.literal("deleted")
    ),
    validationErrors: v.optional(v.array(v.string())),
    sslStatus: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_hostname", ["hostname"])
    .index("by_storefront", ["storefrontId"])
    .index("by_seller", ["sellerId"]),

  categories: defineTable({
    sellerId: v.id("sellers"),
    name: v.string(),
    nameAr: v.string(),
    sortOrder: v.number(),
    createdAt: v.number(),
  })
    .index("by_seller", ["sellerId"]),

  // Support Chat System
  chats: defineTable({
    recipientId: v.optional(v.string()), // clerkId if logged in, null for anonymous
    recipientName: v.optional(v.string()), // name provided or from seller
    recipientEmail: v.optional(v.string()),
    sessionId: v.string(), // unique session ID for anonymous users
    status: v.union(v.literal("open"), v.literal("closed")),
    lastMessageAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_status", ["status"])
    .index("by_recipient", ["recipientId"]),

  chatMessages: defineTable({
    chatId: v.id("chats"),
    sender: v.union(v.literal("user"), v.literal("admin")),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_chat", ["chatId"]),

  // ============ AI CHATBOT SYSTEM ============

  // Bot configuration per storefront
  chatbots: defineTable({
    storefrontId: v.id("storefronts"),
    sellerId: v.id("sellers"),
    name: v.string(),
    greeting: v.string(),
    personality: v.union(
      v.literal("friendly"),
      v.literal("professional"),
      v.literal("casual")
    ),
    isEnabled: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_storefront", ["storefrontId"])
    .index("by_seller", ["sellerId"]),

  // Trained knowledge base
  chatbotKnowledge: defineTable({
    chatbotId: v.id("chatbots"),
    category: v.string(), // "shipping", "returns", "products", "payment", "general"
    question: v.string(),
    answer: v.string(),
    keywords: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_chatbot", ["chatbotId"])
    .index("by_category", ["chatbotId", "category"]),

  // Customer conversations with AI bot
  chatbotConversations: defineTable({
    chatbotId: v.id("chatbots"),
    storefrontId: v.id("storefronts"),
    sessionId: v.string(),
    customerName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("handoff"),
      v.literal("closed")
    ),
    lastMessageAt: v.number(),
    context: v.optional(v.object({
      currentProductId: v.optional(v.id("products")),
      cartItems: v.optional(v.array(v.string())),
      wilaya: v.optional(v.string()),
      // Order-taking fields
      orderState: v.optional(v.union(
        v.literal("idle"),
        v.literal("selecting"),
        v.literal("collecting_info"),
        v.literal("confirming"),
        v.literal("completed"),
        v.literal("cancelled")
      )),
      orderItems: v.optional(v.array(v.object({
        productId: v.string(),
        productName: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        selectedSize: v.optional(v.string()),
        selectedColor: v.optional(v.string()),
      }))),
      customerName: v.optional(v.string()),
      customerPhone: v.optional(v.string()),
      deliveryAddress: v.optional(v.string()),
      deliveryType: v.optional(v.union(v.literal("office"), v.literal("home"))),
      commune: v.optional(v.string()),
      deliveryFee: v.optional(v.number()),
      placedOrderIds: v.optional(v.array(v.string())),
      placedOrderNumber: v.optional(v.string()),
    })),
    createdAt: v.number(),
  })
    .index("by_chatbot", ["chatbotId"])
    .index("by_storefront", ["storefrontId"])
    .index("by_session", ["sessionId"])
    .index("by_status", ["chatbotId", "status"]),

  // ============ TELEGRAM BOT INTEGRATION ============

  telegramLinks: defineTable({
    sellerId: v.id("sellers"),
    telegramUserId: v.string(),
    telegramUsername: v.optional(v.string()),
    verificationCode: v.optional(v.string()),
    codeExpiresAt: v.optional(v.number()),
    status: v.union(v.literal("pending"), v.literal("linked"), v.literal("unlinked")),
    linkedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_seller", ["sellerId"])
    .index("by_telegram_user", ["telegramUserId"])
    .index("by_verification_code", ["verificationCode"]),

  telegramSessions: defineTable({
    telegramUserId: v.string(),
    sellerId: v.id("sellers"),
    command: v.string(),
    step: v.number(),
    data: v.object({
      name: v.optional(v.string()),
      price: v.optional(v.number()),
      stock: v.optional(v.number()),
      description: v.optional(v.string()),
      imageKeys: v.optional(v.array(v.string())),
      productId: v.optional(v.string()),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_telegram_user", ["telegramUserId"]),

  // ============ AI LANDING PAGES ============

  landingPages: defineTable({
    sellerId: v.id("sellers"),
    storefrontId: v.id("storefronts"),
    productId: v.id("products"),
    pageId: v.string(), // nanoid 8-char for URL: /slug/lp/abc12345
    content: v.object({
      headline: v.string(),
      subheadline: v.string(),
      featureBullets: v.array(v.object({
        title: v.string(),
        description: v.string(),
      })),
      ctaText: v.string(),
      urgencyText: v.optional(v.string()),
      productDescription: v.string(),
      socialProof: v.optional(v.string()),
      // v3 fields (testimonial kept for backward compat with existing data)
      testimonial: v.optional(v.object({
        text: v.string(),
        author: v.string(),
        location: v.string(),
      })),
      guaranteeText: v.optional(v.string()),
      secondaryCta: v.optional(v.string()),
      scarcityText: v.optional(v.string()),
      microCopy: v.optional(v.object({
        delivery: v.string(),
        payment: v.string(),
        returns: v.string(),
      })),
    }),
    design: v.object({
      primaryColor: v.string(),
      accentColor: v.string(),
      backgroundColor: v.string(),
      textColor: v.string(),
      gradientFrom: v.optional(v.string()),
      gradientTo: v.optional(v.string()),
      contrastValidated: v.optional(v.boolean()),
      isDarkTheme: v.optional(v.boolean()),
    }),
    enhancedImageKeys: v.optional(v.array(v.string())),
    sceneImageKeys: v.optional(v.array(v.string())),
    templateVersion: v.optional(v.number()),
    templateType: v.optional(v.string()),
    isPublished: v.boolean(),
    status: v.union(
      v.literal("generating"),
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    viewCount: v.optional(v.number()),
    orderCount: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_seller", ["sellerId"])
    .index("by_pageId", ["pageId"])
    .index("by_product", ["productId"]),

  // ============ VOICE STUDIO ============

  voiceClips: defineTable({
    sellerId: v.id("sellers"),
    title: v.string(),
    transcript: v.string(),
    audioKey: v.string(),        // R2 key e.g. "audio/1234-abc.mp3"
    language: v.string(),         // "ar" | "en" | "fr"
    voiceId: v.string(),          // Cartesia voice UUID
    voiceName: v.optional(v.string()),
    durationMs: v.optional(v.number()),
    speed: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_seller", ["sellerId"])
    .index("by_seller_created", ["sellerId", "createdAt"]),

  // ============ MARKETING IMAGES ============

  marketingImages: defineTable({
    sellerId: v.id("sellers"),
    productId: v.id("products"),
    templateId: v.string(),        // e.g. "gradient-float", "bold-price"
    format: v.string(),            // "square" | "story" | "facebook"
    imageKey: v.string(),          // R2 key for the generated PNG
    headline: v.optional(v.string()),
    subheadline: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_seller", ["sellerId"])
    .index("by_product", ["productId"]),

  // Messages in chatbot conversations
  chatbotMessages: defineTable({
    conversationId: v.id("chatbotConversations"),
    sender: v.union(
      v.literal("customer"),
      v.literal("bot"),
      v.literal("seller")
    ),
    content: v.string(),
    metadata: v.optional(v.object({
      type: v.optional(v.union(
        v.literal("text"),
        v.literal("product"),
        v.literal("order"),
        v.literal("order_summary"),
        v.literal("order_confirmed")
      )),
      productId: v.optional(v.id("products")),
      orderId: v.optional(v.id("orders")),
      orderData: v.optional(v.object({
        items: v.optional(v.array(v.object({
          productName: v.string(),
          quantity: v.number(),
          unitPrice: v.number(),
          selectedSize: v.optional(v.string()),
          selectedColor: v.optional(v.string()),
        }))),
        subtotal: v.optional(v.number()),
        deliveryFee: v.optional(v.number()),
        total: v.optional(v.number()),
        customerName: v.optional(v.string()),
        wilaya: v.optional(v.string()),
        orderNumber: v.optional(v.string()),
        orderId: v.optional(v.string()),
      })),
    })),
    createdAt: v.number(),
  })
    .index("by_conversation", ["conversationId"]),
});
