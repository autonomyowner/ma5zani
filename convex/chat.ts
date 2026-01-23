import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get or create a chat for a session
export const getOrCreateChat = mutation({
  args: {
    sessionId: v.string(),
    recipientName: v.optional(v.string()),
    recipientEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if chat exists for this session
    const existingChat = await ctx.db
      .query("chats")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existingChat) {
      return existingChat._id;
    }

    // Create new chat
    const chatId = await ctx.db.insert("chats", {
      sessionId: args.sessionId,
      recipientName: args.recipientName,
      recipientEmail: args.recipientEmail,
      status: "open",
      lastMessageAt: Date.now(),
      createdAt: Date.now(),
    });

    return chatId;
  },
});

// Send a message from user
export const sendMessage = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found");

    // Insert message
    await ctx.db.insert("chatMessages", {
      chatId: args.chatId,
      sender: "user",
      content: args.content,
      createdAt: Date.now(),
    });

    // Update chat lastMessageAt
    await ctx.db.patch(args.chatId, {
      lastMessageAt: Date.now(),
      status: "open", // Reopen if was closed
    });
  },
});

// Get messages for a chat (user side)
export const getMessages = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    return messages.sort((a, b) => a.createdAt - b.createdAt);
  },
});

// Get chat by session (for reconnecting)
export const getChatBySession = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chats")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();
  },
});

// ============ ADMIN FUNCTIONS ============

// Get all chats for admin
export const getAllChats = query({
  args: {
    password: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.password !== process.env.ADMIN_PASSWORD) {
      throw new Error("Unauthorized");
    }

    const chats = await ctx.db.query("chats").collect();

    // Get last message for each chat
    const chatsWithLastMessage = await Promise.all(
      chats.map(async (chat) => {
        const messages = await ctx.db
          .query("chatMessages")
          .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
          .collect();

        const lastMessage = messages.sort((a, b) => b.createdAt - a.createdAt)[0];
        const unreadCount = messages.filter(m => m.sender === "user").length;

        return {
          ...chat,
          lastMessage: lastMessage?.content,
          messageCount: messages.length,
          unreadCount,
        };
      })
    );

    return chatsWithLastMessage.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  },
});

// Get messages for admin
export const getMessagesAdmin = query({
  args: {
    password: v.string(),
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    if (args.password !== process.env.ADMIN_PASSWORD) {
      throw new Error("Unauthorized");
    }

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    return messages.sort((a, b) => a.createdAt - b.createdAt);
  },
});

// Admin reply to chat
export const adminReply = mutation({
  args: {
    password: v.string(),
    chatId: v.id("chats"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.password !== process.env.ADMIN_PASSWORD) {
      throw new Error("Unauthorized");
    }

    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found");

    // Insert admin message
    await ctx.db.insert("chatMessages", {
      chatId: args.chatId,
      sender: "admin",
      content: args.content,
      createdAt: Date.now(),
    });

    // Update chat lastMessageAt
    await ctx.db.patch(args.chatId, {
      lastMessageAt: Date.now(),
    });
  },
});

// Close a chat
export const closeChat = mutation({
  args: {
    password: v.string(),
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    if (args.password !== process.env.ADMIN_PASSWORD) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.chatId, {
      status: "closed",
    });
  },
});
