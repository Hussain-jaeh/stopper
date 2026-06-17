import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { Id } from "./_generated/dataModel";
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
      avatarUri: userProfile.avatarStorageId
        ? await ctx.storage.getUrl(userProfile.avatarStorageId)
        : undefined,
      remindersOn: userProfile.remindersOn ?? false,
      anonymous: userProfile.anonymous ?? false,
      appLockEnabled: userProfile.appLockEnabled ?? false,
    };
  },
});

export const updateSetting = mutation({
  args: {
    key: v.union(v.literal("remindersOn"), v.literal("anonymous"), v.literal("appLockEnabled")),
    value: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!userProfile) throw new ConvexError("Profile not found");

    await ctx.db.patch(userProfile._id, { [args.key]: args.value });
  },
});

/** Step 1 of avatar upload — returns a short-lived URL the client uploads to directly. */
export const generateAvatarUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    return ctx.storage.generateUploadUrl();
  },
});

/** Step 2 of avatar upload — saves the storage ID after the client finishes uploading. */
export const saveAvatar = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!userProfile) throw new ConvexError("Profile not found");

    // Delete the previous avatar from storage to avoid orphaned files
    if (userProfile.avatarStorageId) {
      await ctx.storage.delete(userProfile.avatarStorageId);
    }

    await ctx.db.patch(userProfile._id, { avatarStorageId: args.storageId });
  },
});
