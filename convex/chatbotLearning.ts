import { query, mutation, internalAction, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { getAuthenticatedSeller, requireActiveSeller } from "./auth";

// ============ HELPER: Get seller's chatbot ============

async function getSellerChatbot(ctx: any) {
  const seller = await getAuthenticatedSeller(ctx);
  if (!seller) return null;

  const storefront = await ctx.db
    .query("storefronts")
    .withIndex("by_seller", (q: any) => q.eq("sellerId", seller._id))
    .first();

  if (!storefront) return null;

  const chatbot = await ctx.db
    .query("chatbots")
    .withIndex("by_storefront", (q: any) => q.eq("storefrontId", storefront._id))
    .first();

  return chatbot;
}

// ============ QUERIES ============

// Get pending learned knowledge for seller's chatbot
export const getPendingLearned = query({
  args: {},
  handler: async (ctx) => {
    const chatbot = await getSellerChatbot(ctx);
    if (!chatbot) return [];

    const pending = await ctx.db
      .query("chatbotLearnedKnowledge")
      .withIndex("by_status", (q: any) => q.eq("chatbotId", chatbot._id).eq("status", "pending"))
      .collect();

    // Sort by confidence (highest first)
    return pending.sort((a: any, b: any) => b.confidence - a.confidence);
  },
});

// Get all approved learned knowledge
export const getApprovedLearned = query({
  args: {},
  handler: async (ctx) => {
    const chatbot = await getSellerChatbot(ctx);
    if (!chatbot) return [];

    return await ctx.db
      .query("chatbotLearnedKnowledge")
      .withIndex("by_status", (q: any) => q.eq("chatbotId", chatbot._id).eq("status", "approved"))
      .collect();
  },
});

// Get learning stats (total learned, pending, approved, dismissed)
export const getLearningStats = query({
  args: {},
  handler: async (ctx) => {
    const chatbot = await getSellerChatbot(ctx);
    if (!chatbot) return { total: 0, pending: 0, approved: 0, dismissed: 0, customerProfileCount: 0 };

    const allLearned = await ctx.db
      .query("chatbotLearnedKnowledge")
      .withIndex("by_chatbot", (q: any) => q.eq("chatbotId", chatbot._id))
      .collect();

    const customerProfiles = await ctx.db
      .query("chatbotCustomerProfiles")
      .withIndex("by_chatbot", (q: any) => q.eq("chatbotId", chatbot._id))
      .collect();

    return {
      total: allLearned.length,
      pending: allLearned.filter((k: any) => k.status === "pending").length,
      approved: allLearned.filter((k: any) => k.status === "approved").length,
      dismissed: allLearned.filter((k: any) => k.status === "dismissed").length,
      customerProfileCount: customerProfiles.length,
    };
  },
});

// Get customer profiles for seller's chatbot
export const getCustomerProfiles = query({
  args: {},
  handler: async (ctx) => {
    const chatbot = await getSellerChatbot(ctx);
    if (!chatbot) return [];

    const profiles = await ctx.db
      .query("chatbotCustomerProfiles")
      .withIndex("by_chatbot", (q: any) => q.eq("chatbotId", chatbot._id))
      .collect();

    // Sort by lastInteraction desc
    return profiles.sort((a: any, b: any) => b.lastInteraction - a.lastInteraction);
  },
});

// Get customer profile by identifier (for AI context)
export const getCustomerProfile = query({
  args: {
    chatbotId: v.id("chatbots"),
    identifier: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatbotCustomerProfiles")
      .withIndex("by_lookup", (q) => q.eq("chatbotId", args.chatbotId).eq("identifier", args.identifier))
      .first();
  },
});

// ============ MUTATIONS ============

// Approve a learned knowledge entry (moves to approved + adds to main knowledge base)
export const approveLearned = mutation({
  args: {
    learnedId: v.id("chatbotLearnedKnowledge"),
    question: v.optional(v.string()),
    answer: v.optional(v.string()),
    keywords: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const seller = await requireActiveSeller(ctx);

    const learned = await ctx.db.get(args.learnedId);
    if (!learned) throw new Error("Learned knowledge entry not found");

    const chatbot = await ctx.db.get(learned.chatbotId);
    if (!chatbot || chatbot.sellerId !== seller._id) {
      throw new Error("Unauthorized");
    }

    // Use edited values if provided, otherwise keep originals
    const finalQuestion = args.question || learned.question;
    const finalAnswer = args.answer || learned.answer;
    const finalKeywords = args.keywords || learned.keywords;

    // Update status to approved
    await ctx.db.patch(args.learnedId, {
      status: "approved",
      question: finalQuestion,
      answer: finalAnswer,
      keywords: finalKeywords,
      source: "seller-approved",
    });

    // Also add to main chatbotKnowledge table
    await ctx.db.insert("chatbotKnowledge", {
      chatbotId: learned.chatbotId,
      category: learned.category,
      question: finalQuestion,
      answer: finalAnswer,
      keywords: finalKeywords,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Dismiss a learned knowledge entry
export const dismissLearned = mutation({
  args: { learnedId: v.id("chatbotLearnedKnowledge") },
  handler: async (ctx, args) => {
    const seller = await requireActiveSeller(ctx);

    const learned = await ctx.db.get(args.learnedId);
    if (!learned) throw new Error("Learned knowledge entry not found");

    const chatbot = await ctx.db.get(learned.chatbotId);
    if (!chatbot || chatbot.sellerId !== seller._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.learnedId, {
      status: "dismissed",
    });
  },
});

// Update or create customer profile (called from API route after order)
export const upsertCustomerProfile = mutation({
  args: {
    chatbotId: v.id("chatbots"),
    identifier: v.string(),
    channel: v.string(),
    name: v.optional(v.string()),
    wilaya: v.optional(v.string()),
    orderId: v.optional(v.id("orders")),
    productName: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Look up existing profile
    const existing = await ctx.db
      .query("chatbotCustomerProfiles")
      .withIndex("by_lookup", (q) => q.eq("chatbotId", args.chatbotId).eq("identifier", args.identifier))
      .first();

    if (existing) {
      // Update existing profile
      const updatedOrderHistory = [...existing.orderHistory];
      if (args.orderId && args.productName) {
        updatedOrderHistory.push({
          orderId: args.orderId,
          productName: args.productName,
          date: Date.now(),
        });
      }

      const updatedInterests = [...existing.interests];
      if (args.interests) {
        for (const interest of args.interests) {
          if (!updatedInterests.includes(interest)) {
            updatedInterests.push(interest);
          }
        }
      }

      await ctx.db.patch(existing._id, {
        ...(args.name && { name: args.name }),
        ...(args.wilaya && { wilaya: args.wilaya }),
        orderHistory: updatedOrderHistory,
        interests: updatedInterests,
        lastInteraction: Date.now(),
      });
    } else {
      // Create new profile
      const orderHistory = [];
      if (args.orderId && args.productName) {
        orderHistory.push({
          orderId: args.orderId,
          productName: args.productName,
          date: Date.now(),
        });
      }

      await ctx.db.insert("chatbotCustomerProfiles", {
        chatbotId: args.chatbotId,
        identifier: args.identifier,
        channel: args.channel,
        name: args.name,
        wilaya: args.wilaya,
        orderHistory,
        interests: args.interests || [],
        lastInteraction: Date.now(),
        createdAt: Date.now(),
      });
    }
  },
});

// ============ INTERNAL FUNCTIONS (for conversation analysis) ============

// Get unanalyzed conversations with completed orders
export const getUnanalyzedConversations = internalQuery({
  args: { chatbotId: v.id("chatbots") },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("chatbotConversations")
      .withIndex("by_chatbot", (q) => q.eq("chatbotId", args.chatbotId))
      .collect();

    // Filter for completed order conversations that haven't been analyzed
    return conversations.filter(
      (c) => c.context?.orderState === "completed" && !c.analyzedAt
    );
  },
});

// Get messages for a conversation (internal)
export const getConversationMessages = internalQuery({
  args: { conversationId: v.id("chatbotConversations") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatbotMessages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    return messages.sort((a, b) => a.createdAt - b.createdAt);
  },
});

// Save extracted knowledge (internal)
export const saveLearned = internalMutation({
  args: {
    chatbotId: v.id("chatbots"),
    conversationId: v.id("chatbotConversations"),
    entries: v.array(v.object({
      question: v.string(),
      answer: v.string(),
      keywords: v.array(v.string()),
      category: v.string(),
      confidence: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    for (const entry of args.entries) {
      await ctx.db.insert("chatbotLearnedKnowledge", {
        chatbotId: args.chatbotId,
        question: entry.question,
        answer: entry.answer,
        keywords: entry.keywords,
        category: entry.category,
        source: "auto-learned",
        sourceConversationId: args.conversationId,
        confidence: entry.confidence,
        status: "pending",
        createdAt: Date.now(),
      });
    }
  },
});

// Mark conversation as analyzed (internal)
export const markAnalyzed = internalMutation({
  args: { conversationId: v.id("chatbotConversations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      analyzedAt: Date.now(),
    });
  },
});

// Analyze completed conversations and extract knowledge
export const analyzeCompletedConversations = internalAction({
  args: { chatbotId: v.id("chatbots") },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY not set, skipping conversation analysis");
      return;
    }

    // 1. Get unanalyzed conversations with completed orders
    const conversations = await ctx.runQuery(
      internal.chatbotLearning.getUnanalyzedConversations,
      { chatbotId: args.chatbotId }
    );

    if (conversations.length === 0) return;

    // Process up to 5 conversations at a time to avoid timeouts
    const batch = conversations.slice(0, 5);

    for (const conversation of batch) {
      try {
        // 2. Fetch all messages for this conversation
        const messages = await ctx.runQuery(
          internal.chatbotLearning.getConversationMessages,
          { conversationId: conversation._id }
        );

        if (messages.length < 4) {
          // Too few messages to extract meaningful knowledge
          await ctx.runMutation(
            internal.chatbotLearning.markAnalyzed,
            { conversationId: conversation._id }
          );
          continue;
        }

        // 3. Build transcript
        const transcript = messages
          .map((m: any) => `[${m.sender}]: ${m.content}`)
          .join("\n");

        // 4. Use OpenRouter to extract Q&A patterns
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "anthropic/claude-3.5-haiku",
            messages: [
              {
                role: "system",
                content: `You are analyzing an e-commerce chatbot conversation that led to a successful order. Extract useful Q&A patterns that can be added to the chatbot's knowledge base for future conversations.

Focus on:
1. Customer questions that led to purchase decisions
2. Objections raised and how they were resolved
3. Product-specific questions and answers
4. Shipping/delivery questions and answers
5. Payment-related questions and answers

Return a JSON array of objects with these fields:
- question: The customer's question or concern (generalized, not specific to this customer)
- answer: The effective response (generalized)
- keywords: Array of relevant keywords for matching
- category: One of "shipping", "returns", "payment", "products", "general"
- confidence: A number 0-1 indicating how useful this Q&A would be for future customers

Only return Q&A pairs that would genuinely help with future customers. Return an empty array if nothing useful can be extracted.

IMPORTANT: Return ONLY valid JSON, no markdown formatting.`,
              },
              {
                role: "user",
                content: `Analyze this conversation transcript and extract Q&A knowledge:\n\n${transcript}`,
              },
            ],
            max_tokens: 2000,
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          console.error("OpenRouter API error:", response.status);
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) continue;

        // Parse JSON response
        let entries;
        try {
          // Try to extract JSON from response (might be wrapped in markdown)
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          entries = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
        } catch {
          console.error("Failed to parse AI response as JSON");
          continue;
        }

        // Validate and save entries
        if (Array.isArray(entries) && entries.length > 0) {
          const validEntries = entries
            .filter(
              (e: any) =>
                e.question &&
                e.answer &&
                e.keywords &&
                Array.isArray(e.keywords) &&
                typeof e.confidence === "number"
            )
            .map((e: any) => ({
              question: String(e.question),
              answer: String(e.answer),
              keywords: e.keywords.map((k: any) => String(k).toLowerCase()),
              category: ["shipping", "returns", "payment", "products", "general"].includes(e.category)
                ? e.category
                : "general",
              confidence: Math.min(1, Math.max(0, e.confidence)),
            }));

          if (validEntries.length > 0) {
            await ctx.runMutation(
              internal.chatbotLearning.saveLearned,
              {
                chatbotId: args.chatbotId,
                conversationId: conversation._id,
                entries: validEntries,
              }
            );
          }
        }

        // 5. Mark conversation as analyzed
        await ctx.runMutation(
          internal.chatbotLearning.markAnalyzed,
          { conversationId: conversation._id }
        );
      } catch (error) {
        console.error("Error analyzing conversation:", conversation._id, error);
      }
    }
  },
});
