import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const completeOnboarding = mutation({
  args: {
    habitType: v.optional(v.string()),
    displayName: v.optional(v.string()),
    age: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { onboardingComplete: true, ...args });
    } else {
      await ctx.db.insert("userProfiles", {
        userId,
        onboardingComplete: true,
        createdAt: Date.now(),
        ...args,
      });
    }
  },
});

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    return profile ?? { onboardingComplete: false };
  },
});
