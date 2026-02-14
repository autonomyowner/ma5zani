import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireSeller } from "./auth";

// ============ SELLER CHATBOT MANAGEMENT ============

// Get chatbot for current seller's storefront
export const getChatbot = query({
  args: {},
  handler: async (ctx) => {
    const seller = await requireSeller(ctx);

    // Get seller's storefront
    const storefront = await ctx.db
      .query("storefronts")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .first();

    if (!storefront) return null;

    // Get chatbot for this storefront
    const chatbot = await ctx.db
      .query("chatbots")
      .withIndex("by_storefront", (q) => q.eq("storefrontId", storefront._id))
      .first();

    return chatbot;
  },
});

// Create or update chatbot settings
export const upsertChatbot = mutation({
  args: {
    name: v.string(),
    greeting: v.string(),
    personality: v.union(
      v.literal("friendly"),
      v.literal("professional"),
      v.literal("casual")
    ),
    isEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    // Get seller's storefront
    const storefront = await ctx.db
      .query("storefronts")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .first();

    if (!storefront) {
      throw new Error("Please create a storefront first");
    }

    // Check if chatbot exists
    const existingChatbot = await ctx.db
      .query("chatbots")
      .withIndex("by_storefront", (q) => q.eq("storefrontId", storefront._id))
      .first();

    if (existingChatbot) {
      // Update existing
      await ctx.db.patch(existingChatbot._id, {
        name: args.name,
        greeting: args.greeting,
        personality: args.personality,
        isEnabled: args.isEnabled,
        updatedAt: Date.now(),
      });
      return existingChatbot._id;
    } else {
      // Create new
      const chatbotId = await ctx.db.insert("chatbots", {
        storefrontId: storefront._id,
        sellerId: seller._id,
        name: args.name,
        greeting: args.greeting,
        personality: args.personality,
        isEnabled: args.isEnabled,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return chatbotId;
    }
  },
});

// Toggle chatbot on/off
export const toggleChatbot = mutation({
  args: {
    isEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    const storefront = await ctx.db
      .query("storefronts")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .first();

    if (!storefront) throw new Error("Storefront not found");

    const chatbot = await ctx.db
      .query("chatbots")
      .withIndex("by_storefront", (q) => q.eq("storefrontId", storefront._id))
      .first();

    if (!chatbot) throw new Error("Chatbot not found");

    await ctx.db.patch(chatbot._id, {
      isEnabled: args.isEnabled,
      updatedAt: Date.now(),
    });
  },
});

// ============ KNOWLEDGE BASE MANAGEMENT ============

// Get all knowledge for seller's chatbot
export const getKnowledge = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    const storefront = await ctx.db
      .query("storefronts")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .first();

    if (!storefront) return [];

    const chatbot = await ctx.db
      .query("chatbots")
      .withIndex("by_storefront", (q) => q.eq("storefrontId", storefront._id))
      .first();

    if (!chatbot) return [];

    if (args.category) {
      const category = args.category;
      return await ctx.db
        .query("chatbotKnowledge")
        .withIndex("by_category", (q) =>
          q.eq("chatbotId", chatbot._id).eq("category", category)
        )
        .collect();
    }

    return await ctx.db
      .query("chatbotKnowledge")
      .withIndex("by_chatbot", (q) => q.eq("chatbotId", chatbot._id))
      .collect();
  },
});

// Add knowledge entry
export const addKnowledge = mutation({
  args: {
    category: v.string(),
    question: v.string(),
    answer: v.string(),
    keywords: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    const storefront = await ctx.db
      .query("storefronts")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .first();

    if (!storefront) throw new Error("Storefront not found");

    const chatbot = await ctx.db
      .query("chatbots")
      .withIndex("by_storefront", (q) => q.eq("storefrontId", storefront._id))
      .first();

    if (!chatbot) throw new Error("Please set up your chatbot first");

    const knowledgeId = await ctx.db.insert("chatbotKnowledge", {
      chatbotId: chatbot._id,
      category: args.category,
      question: args.question,
      answer: args.answer,
      keywords: args.keywords,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return knowledgeId;
  },
});

// Update knowledge entry
export const updateKnowledge = mutation({
  args: {
    knowledgeId: v.id("chatbotKnowledge"),
    category: v.optional(v.string()),
    question: v.optional(v.string()),
    answer: v.optional(v.string()),
    keywords: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    const knowledge = await ctx.db.get(args.knowledgeId);
    if (!knowledge) throw new Error("Knowledge entry not found");

    const chatbot = await ctx.db.get(knowledge.chatbotId);
    if (!chatbot || chatbot.sellerId !== seller._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.knowledgeId, {
      ...(args.category && { category: args.category }),
      ...(args.question && { question: args.question }),
      ...(args.answer && { answer: args.answer }),
      ...(args.keywords && { keywords: args.keywords }),
      updatedAt: Date.now(),
    });
  },
});

// Delete knowledge entry
export const deleteKnowledge = mutation({
  args: {
    knowledgeId: v.id("chatbotKnowledge"),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    const knowledge = await ctx.db.get(args.knowledgeId);
    if (!knowledge) throw new Error("Knowledge entry not found");

    const chatbot = await ctx.db.get(knowledge.chatbotId);
    if (!chatbot || chatbot.sellerId !== seller._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.knowledgeId);
  },
});

// ============ SELLER CONVERSATION MANAGEMENT ============

// Get all conversations for seller's chatbot
export const getConversations = query({
  args: {
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("handoff"),
      v.literal("closed")
    )),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    const storefront = await ctx.db
      .query("storefronts")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .first();

    if (!storefront) return [];

    const chatbot = await ctx.db
      .query("chatbots")
      .withIndex("by_storefront", (q) => q.eq("storefrontId", storefront._id))
      .first();

    if (!chatbot) return [];

    let conversations;
    if (args.status) {
      const status = args.status;
      conversations = await ctx.db
        .query("chatbotConversations")
        .withIndex("by_status", (q) =>
          q.eq("chatbotId", chatbot._id).eq("status", status)
        )
        .collect();
    } else {
      conversations = await ctx.db
        .query("chatbotConversations")
        .withIndex("by_chatbot", (q) => q.eq("chatbotId", chatbot._id))
        .collect();
    }

    // Get last message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conv) => {
        const messages = await ctx.db
          .query("chatbotMessages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
          .collect();

        const lastMessage = messages.sort((a, b) => b.createdAt - a.createdAt)[0];
        const unreadCount = messages.filter(m => m.sender === "customer").length;

        return {
          ...conv,
          lastMessage: lastMessage?.content,
          messageCount: messages.length,
          unreadCount,
        };
      })
    );

    return conversationsWithLastMessage.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  },
});

// Get messages for a conversation (seller view)
export const getConversationMessages = query({
  args: {
    conversationId: v.id("chatbotConversations"),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const chatbot = await ctx.db.get(conversation.chatbotId);
    if (!chatbot || chatbot.sellerId !== seller._id) {
      throw new Error("Unauthorized");
    }

    const messages = await ctx.db
      .query("chatbotMessages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    return messages.sort((a, b) => a.createdAt - b.createdAt);
  },
});

// Seller takes over conversation (handoff)
export const takeoverConversation = mutation({
  args: {
    conversationId: v.id("chatbotConversations"),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const chatbot = await ctx.db.get(conversation.chatbotId);
    if (!chatbot || chatbot.sellerId !== seller._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.conversationId, {
      status: "handoff",
    });

    // Add system message about seller joining
    await ctx.db.insert("chatbotMessages", {
      conversationId: args.conversationId,
      sender: "bot",
      content: "A team member has joined the conversation.",
      createdAt: Date.now(),
    });
  },
});

// Seller sends message in conversation
export const sellerReply = mutation({
  args: {
    conversationId: v.id("chatbotConversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const chatbot = await ctx.db.get(conversation.chatbotId);
    if (!chatbot || chatbot.sellerId !== seller._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.insert("chatbotMessages", {
      conversationId: args.conversationId,
      sender: "seller",
      content: args.content,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
      status: "handoff", // Ensure status is handoff when seller replies
    });
  },
});

// Return conversation to bot
export const returnToBot = mutation({
  args: {
    conversationId: v.id("chatbotConversations"),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const chatbot = await ctx.db.get(conversation.chatbotId);
    if (!chatbot || chatbot.sellerId !== seller._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.conversationId, {
      status: "active",
    });

    // Add system message
    await ctx.db.insert("chatbotMessages", {
      conversationId: args.conversationId,
      sender: "bot",
      content: "Our assistant is back to help you.",
      createdAt: Date.now(),
    });
  },
});

// Close conversation
export const closeConversation = mutation({
  args: {
    conversationId: v.id("chatbotConversations"),
  },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const chatbot = await ctx.db.get(conversation.chatbotId);
    if (!chatbot || chatbot.sellerId !== seller._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.conversationId, {
      status: "closed",
    });
  },
});

// ============ PUBLIC CHATBOT FUNCTIONS (FOR STOREFRONT) ============

// Get chatbot for a storefront (public)
export const getPublicChatbot = query({
  args: {
    storefrontSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const storefront = await ctx.db
      .query("storefronts")
      .withIndex("by_slug", (q) => q.eq("slug", args.storefrontSlug))
      .first();

    if (!storefront) return null;

    const chatbot = await ctx.db
      .query("chatbots")
      .withIndex("by_storefront", (q) => q.eq("storefrontId", storefront._id))
      .first();

    if (!chatbot || !chatbot.isEnabled) return null;

    // Return only public-safe fields
    return {
      _id: chatbot._id,
      name: chatbot.name,
      greeting: chatbot.greeting,
      personality: chatbot.personality,
    };
  },
});

// Start or get existing conversation (public)
export const getOrCreateConversation = mutation({
  args: {
    storefrontSlug: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const storefront = await ctx.db
      .query("storefronts")
      .withIndex("by_slug", (q) => q.eq("slug", args.storefrontSlug))
      .first();

    if (!storefront) throw new Error("Storefront not found");

    const chatbot = await ctx.db
      .query("chatbots")
      .withIndex("by_storefront", (q) => q.eq("storefrontId", storefront._id))
      .first();

    if (!chatbot || !chatbot.isEnabled) throw new Error("Chat not available");

    // Check for existing conversation
    const existing = await ctx.db
      .query("chatbotConversations")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existing && existing.storefrontId === storefront._id) {
      return existing._id;
    }

    // Create new conversation
    const conversationId = await ctx.db.insert("chatbotConversations", {
      chatbotId: chatbot._id,
      storefrontId: storefront._id,
      sessionId: args.sessionId,
      status: "active",
      lastMessageAt: Date.now(),
      createdAt: Date.now(),
    });

    // Add greeting message from bot
    await ctx.db.insert("chatbotMessages", {
      conversationId,
      sender: "bot",
      content: chatbot.greeting,
      createdAt: Date.now(),
    });

    return conversationId;
  },
});

// Customer sends message (public)
export const customerSendMessage = mutation({
  args: {
    conversationId: v.id("chatbotConversations"),
    content: v.string(),
    sessionId: v.string(), // For verification
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");
    if (conversation.sessionId !== args.sessionId) throw new Error("Invalid session");

    // Add customer message
    await ctx.db.insert("chatbotMessages", {
      conversationId: args.conversationId,
      sender: "customer",
      content: args.content,
      createdAt: Date.now(),
    });

    // Update conversation
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
    });

    return true;
  },
});

// Get messages (public)
export const getPublicMessages = query({
  args: {
    conversationId: v.id("chatbotConversations"),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return [];
    if (conversation.sessionId !== args.sessionId) return [];

    const messages = await ctx.db
      .query("chatbotMessages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    return messages.sort((a, b) => a.createdAt - b.createdAt);
  },
});

// Request human handoff (public)
export const requestHandoff = mutation({
  args: {
    conversationId: v.id("chatbotConversations"),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");
    if (conversation.sessionId !== args.sessionId) throw new Error("Invalid session");

    await ctx.db.patch(args.conversationId, {
      status: "handoff",
    });

    // Add system message
    await ctx.db.insert("chatbotMessages", {
      conversationId: args.conversationId,
      sender: "bot",
      content: "You've requested to speak with our team. Someone will be with you shortly.",
      createdAt: Date.now(),
    });
  },
});

// Update conversation context (public)
export const updateContext = mutation({
  args: {
    conversationId: v.id("chatbotConversations"),
    sessionId: v.string(),
    context: v.object({
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
    }),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");
    if (conversation.sessionId !== args.sessionId) throw new Error("Invalid session");

    // Merge with existing context
    const existingContext = conversation.context || {};
    await ctx.db.patch(args.conversationId, {
      context: { ...existingContext, ...args.context },
    });
  },
});

// Update customer info (for order flow)
export const updateCustomerInfo = mutation({
  args: {
    conversationId: v.id("chatbotConversations"),
    sessionId: v.string(),
    customerName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");
    if (conversation.sessionId !== args.sessionId) throw new Error("Invalid session");

    await ctx.db.patch(args.conversationId, {
      ...(args.customerName && { customerName: args.customerName }),
      ...(args.customerPhone && { customerPhone: args.customerPhone }),
    });
  },
});

// ============ AI RESPONSE GENERATION ============

// Get knowledge and context for AI response
export const getAIContext = query({
  args: {
    conversationId: v.id("chatbotConversations"),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;
    if (conversation.sessionId !== args.sessionId) return null;

    const chatbot = await ctx.db.get(conversation.chatbotId);
    if (!chatbot) return null;

    // Get storefront
    const storefront = await ctx.db.get(conversation.storefrontId);
    if (!storefront) return null;

    // Get seller
    const seller = await ctx.db.get(chatbot.sellerId);

    // Get knowledge base
    const knowledge = await ctx.db
      .query("chatbotKnowledge")
      .withIndex("by_chatbot", (q) => q.eq("chatbotId", chatbot._id))
      .collect();

    // Get products if showing on storefront
    const products = await ctx.db
      .query("products")
      .withIndex("by_seller", (q) => q.eq("sellerId", chatbot.sellerId))
      .collect();

    const storefrontProducts = products.filter(p => p.showOnStorefront && p.status !== "out_of_stock");

    // Get current product if in context
    let currentProduct = null;
    if (conversation.context?.currentProductId) {
      currentProduct = await ctx.db.get(conversation.context.currentProductId);
    }

    return {
      chatbot: {
        name: chatbot.name,
        personality: chatbot.personality,
      },
      storefront: {
        name: storefront.boutiqueName,
        description: storefront.description,
      },
      seller: seller ? {
        name: seller.name,
        phone: seller.phone,
      } : null,
      knowledge: knowledge.map(k => ({
        category: k.category,
        question: k.question,
        answer: k.answer,
        keywords: k.keywords,
      })),
      storefrontSlug: storefront.slug,
      products: storefrontProducts.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        salePrice: p.salePrice,
        description: p.description,
        stock: p.stock,
        status: p.status,
        sizes: p.sizes,
        colors: p.colors,
      })),
      currentProduct: currentProduct ? {
        id: currentProduct._id,
        name: currentProduct.name,
        price: currentProduct.price,
        salePrice: currentProduct.salePrice,
        description: currentProduct.description,
        stock: currentProduct.stock,
      } : null,
      context: conversation.context,
      conversationStatus: conversation.status,
    };
  },
});

// Add bot response (called after AI generates response)
export const addBotResponse = mutation({
  args: {
    conversationId: v.id("chatbotConversations"),
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
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("chatbotMessages", {
      conversationId: args.conversationId,
      sender: "bot",
      content: args.content,
      metadata: args.metadata,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
    });
  },
});
