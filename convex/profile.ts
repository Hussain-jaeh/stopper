import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";
import { calculateCurrentStreak } from "./services/streak";

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const [userProfile, recoveryProfile] = await Promise.all([
      ctx.db
        .query("userProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique(),
      ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique(),
    ]);

    if (!userProfile || !recoveryProfile) return null;

    const relapses = await ctx.db
      .query("relapses")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
      .order("asc")
      .take(500);

    const cleanDays = calculateCurrentStreak({
      quitDate: recoveryProfile.quitDate,
      relapseTimestamps: relapses.map((r) => r.createdAt),
    });

    const tagline = `${cleanDays} day${cleanDays === 1 ? '' : 's'} free · ${recoveryProfile.addictionType}`;

    return {
      name: userProfile.displayName ?? "Anonymous",
      tagline,
      avatarUri: undefined as string | undefined,
      remindersOn: userProfile.remindersOn ?? false,
      anonymous: userProfile.anonymous ?? false,
    };
  },
});

export const updateSetting = mutation({
  args: {
    key: v.union(v.literal("remindersOn"), v.literal("anonymous")),
    value: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!userProfile) throw new Error("Profile not found");

    await ctx.db.patch(userProfile._id, { [args.key]: args.value });
  },
});
