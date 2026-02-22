import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Mark a conversation as read for a user
export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("readReceipts")
      .withIndex("by_conversation_user", (q) =>
        q
          .eq("conversationId", args.conversationId)
          .eq("userId", args.userId)
      )
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { lastReadTime: now });
    } else {
      await ctx.db.insert("readReceipts", {
        conversationId: args.conversationId,
        userId: args.userId,
        lastReadTime: now,
      });
    }
  },
});

// Get unread message count for a user in a conversation
export const getUnreadCount = query({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const receipt = await ctx.db
      .query("readReceipts")
      .withIndex("by_conversation_user", (q) =>
        q
          .eq("conversationId", args.conversationId)
          .eq("userId", args.userId)
      )
      .first();

    const allMessages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    if (!receipt) {
      return allMessages.filter((m) => m.senderId !== args.userId).length;
    }

    return allMessages.filter(
      (m) =>
        m.senderId !== args.userId &&
        m._creationTime > receipt.lastReadTime
    ).length;
  },
});
