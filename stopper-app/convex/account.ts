import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";
import { calculateCurrentStreak, calculateLongestStreak, calculateNextMilestone } from "./services/streak";

export const getPlan = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const [userProfile, recoveryProfile] = await Promise.all([
      ctx.db.query("userProfiles").withIndex("by_userId", (q) => q.eq("userId", userId)).unique(),
      ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", userId)).unique(),
    ]);

    if (!recoveryProfile) return null;

    const relapses = await ctx.db
      .query("relapses")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
      .order("asc")
      .take(500);

    const relapseTimestamps = relapses.map((r) => r.createdAt);
    const streakInput = { quitDate: recoveryProfile.quitDate, relapseTimestamps };
    const cleanDays = calculateCurrentStreak(streakInput);
    const bestStreak = calculateLongestStreak(streakInput);
    const nextMilestone = calculateNextMilestone(cleanDays);

    const quitDate = new Date(recoveryProfile.quitDate).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });

    return {
      addictionType: recoveryProfile.addictionType,
      quitDate,
      reasonForQuitting: recoveryProfile.reasonForQuitting,
      goal: recoveryProfile.goal ?? null,
      cleanDays,
      bestStreak,
      nextMilestone,
      daysToNextMilestone: nextMilestone - cleanDays,
    };
  },
});

// Deletes all data belonging to the authenticated user.
// The client should call signOut() immediately after this resolves.
export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const [userProfile, recoveryProfile, checkIns, relapses, memberships, posts, cheers] =
      await Promise.all([
        ctx.db.query("userProfiles").withIndex("by_userId", (q) => q.eq("userId", userId)).unique(),
        ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", userId)).unique(),
        ctx.db.query("checkIns").withIndex("by_userId", (q) => q.eq("userId", userId)).collect(),
        ctx.db.query("relapses").withIndex("by_userId", (q) => q.eq("userId", userId)).collect(),
        ctx.db.query("circleMemberships").withIndex("by_userId", (q) => q.eq("userId", userId)).collect(),
        ctx.db.query("posts").withIndex("by_userId", (q) => q.eq("userId", userId)).collect(),
        ctx.db.query("postCheers").withIndex("by_userId", (q) => q.eq("userId", userId)).collect(),
      ]);

    // Delete avatar from file storage before removing the profile
    if (userProfile?.avatarStorageId) {
      await ctx.storage.delete(userProfile.avatarStorageId);
    }

    const toDelete = [
      ...(userProfile ? [userProfile._id] : []),
      ...(recoveryProfile ? [recoveryProfile._id] : []),
      ...checkIns.map((d) => d._id),
      ...relapses.map((d) => d._id),
      ...memberships.map((d) => d._id),
      ...posts.map((d) => d._id),
      ...cheers.map((d) => d._id),
    ];

    await Promise.all(toDelete.map((id) => ctx.db.delete(id)));
  },
});
