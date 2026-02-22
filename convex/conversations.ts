import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get or create a direct (1-on-1) conversation between two users
export const getOrCreate = mutation({
  args: {
    currentUserId: v.id("users"),
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("conversations").collect();
    const existing = all.find(
      (c) =>
        !c.isGroup &&
        c.participants.length === 2 &&
        c.participants.includes(args.currentUserId) &&
        c.participants.includes(args.otherUserId)
    );
    if (existing) return existing._id;

    return await ctx.db.insert("conversations", {
      participants: [args.currentUserId, args.otherUserId],
      isGroup: false,
      lastMessageTime: Date.now(),
    });
  },
});

// Get all conversations for a user, enriched with participant data
export const getUserConversations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("conversations").collect();
    const mine = all.filter((c) => c.participants.includes(args.userId));
    mine.sort((a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0));

    const enriched = await Promise.all(
      mine.map(async (conv) => {
        const others = await Promise.all(
          conv.participants
            .filter((id) => id !== args.userId)
            .map((id) => ctx.db.get(id))
        );
        return { ...conv, otherParticipants: others.filter(Boolean) };
      })
    );
    return enriched;
  },
});

// Create a group conversation
export const createGroup = mutation({
  args: {
    name: v.string(),
    participantIds: v.array(v.id("users")),
    creatorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const all = [
      args.creatorId,
      ...args.participantIds.filter((id) => id !== args.creatorId),
    ];
    return await ctx.db.insert("conversations", {
      participants: all,
      isGroup: true,
      groupName: args.name,
      lastMessageTime: Date.now(),
    });
  },
});

// Get a single conversation by ID
export const getById = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});
