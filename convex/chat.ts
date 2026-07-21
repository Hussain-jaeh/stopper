import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { requireAuth } from "./lib/auth";
import { makeHandle } from "./lib/handle";

function relTime(ts: number): string {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export const getMessages = query({
  args: { circleId: v.id("circles") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_circleId_createdAt", (q) => q.eq("circleId", args.circleId))
      .order("asc")
      .take(100);

    return Promise.all(
      messages.map(async (m) => {
        let replyTo = null;
        if (m.replyToId) {
          const replied = await ctx.db.get(m.replyToId);
          if (replied) {
            replyTo = {
              id: replied._id as string,
              handle: makeHandle(replied.userId),
              body: replied.body,
            };
          }
        }
        return {
          id: m._id as string,
          handle: makeHandle(m.userId),
          isMe: m.userId === userId,
          body: m.body,
          time: relTime(m.createdAt),
          replyTo,
        };
      }),
    );
  },
});

export const sendMessage = mutation({
  args: {
    circleId: v.id("circles"),
    body: v.string(),
    replyToId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const body = args.body.trim();
    if (!body) throw new ConvexError("Message cannot be empty");
    if (body.length > 500) throw new ConvexError("Message too long");

    const membership = await ctx.db
      .query("circleMemberships")
      .withIndex("by_userId_circleId", (q) =>
        q.eq("userId", userId).eq("circleId", args.circleId),
      )
      .unique();
    if (!membership) throw new ConvexError("You must join this circle to send messages");

    return ctx.db.insert("messages", {
      circleId: args.circleId,
      userId,
      body,
      replyToId: args.replyToId,
      createdAt: Date.now(),
    });
  },
});
