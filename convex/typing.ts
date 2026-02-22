import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Set or clear typing indicator
export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("typing")
      .withIndex("by_conversation_user", (q) =>
        q
          .eq("conversationId", args.conversationId)
          .eq("userId", args.userId)
      )
      .first();

    if (args.isTyping) {
      if (existing) {
        await ctx.db.patch(existing._id, { lastTyped: Date.now() });
      } else {
        await ctx.db.insert("typing", {
          conversationId: args.conversationId,
          userId: args.userId,
          lastTyped: Date.now(),
        });
      }
    } else if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

// Get users currently typing in a conversation (excluding current user)
export const getTypingUsers = query({
  args: {
    conversationId: v.id("conversations"),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const TWO_SECONDS = 2500;
    const typingRows = await ctx.db
      .query("typing")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const active = typingRows.filter(
      (t) =>
        t.userId !== args.currentUserId &&
        Date.now() - t.lastTyped < TWO_SECONDS
    );

    const enriched = await Promise.all(
      active.map(async (t) => {
        const user = await ctx.db.get(t.userId);
        return { ...t, user };
      })
    );

    return enriched.filter((t) => t.user !== null);
  },
});
