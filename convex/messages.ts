import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Send a message
export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      content: args.content,
      isDeleted: false,
    });

    await ctx.db.patch(args.conversationId, {
      lastMessageTime: Date.now(),
      lastMessagePreview: args.content.substring(0, 100),
    });

    return id;
  },
});

// Get all messages in a conversation with sender info
export const getByConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const msgs = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();

    const enriched = await Promise.all(
      msgs.map(async (msg) => {
        const sender = await ctx.db.get(msg.senderId);
        const reactions = await ctx.db
          .query("reactions")
          .withIndex("by_message", (q) => q.eq("messageId", msg._id))
          .collect();
        return { ...msg, sender, reactions };
      })
    );

    return enriched;
  },
});

// Soft-delete a message (only by sender)
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const msg = await ctx.db.get(args.messageId);
    if (!msg || msg.senderId !== args.userId) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.messageId, { isDeleted: true });
  },
});

// Toggle a reaction on a message
export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_message_user_emoji", (q) =>
        q
          .eq("messageId", args.messageId)
          .eq("userId", args.userId)
          .eq("emoji", args.emoji)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    } else {
      await ctx.db.insert("reactions", {
        messageId: args.messageId,
        userId: args.userId,
        emoji: args.emoji,
      });
    }
  },
});
