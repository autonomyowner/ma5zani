import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireSeller, requireActiveSeller, getAuthenticatedSeller } from "./auth";

export const listMyClips = query({
  args: {},
  handler: async (ctx) => {
    const seller = await getAuthenticatedSeller(ctx);
    if (!seller) return [];
    return await ctx.db
      .query("voiceClips")
      .withIndex("by_seller_created", (q) => q.eq("sellerId", seller._id))
      .order("desc")
      .collect();
  },
});

export const getTodayClipCount = query({
  args: {},
  handler: async (ctx) => {
    const seller = await getAuthenticatedSeller(ctx);
    if (!seller) return 0;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const clips = await ctx.db
      .query("voiceClips")
      .withIndex("by_seller_created", (q) =>
        q.eq("sellerId", seller._id).gte("createdAt", startOfDay.getTime())
      )
      .collect();
    return clips.length;
  },
});

export const saveClip = mutation({
  args: {
    title: v.string(),
    transcript: v.string(),
    audioKey: v.string(),
    language: v.string(),
    voiceId: v.string(),
    voiceName: v.optional(v.string()),
    durationMs: v.optional(v.number()),
    speed: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const seller = await requireActiveSeller(ctx);
    return await ctx.db.insert("voiceClips", {
      sellerId: seller._id,
      title: args.title,
      transcript: args.transcript,
      audioKey: args.audioKey,
      language: args.language,
      voiceId: args.voiceId,
      voiceName: args.voiceName,
      durationMs: args.durationMs,
      speed: args.speed,
      createdAt: Date.now(),
    });
  },
});

export const deleteClip = mutation({
  args: { clipId: v.id("voiceClips") },
  handler: async (ctx, args) => {
    const seller = await requireSeller(ctx);
    const clip = await ctx.db.get(args.clipId);
    if (!clip || clip.sellerId !== seller._id) {
      throw new Error("Clip not found");
    }
    await ctx.db.delete(args.clipId);
  },
});
